import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type {
  CreateOrderPayload,
  DashboardStats,
  DbCategory,
  DbCollection,
  DbContactMessage,
  DbCustomer,
  DbInventory,
  DbNewsletterSubscriber,
  DbOrder,
  DbOrderItem,
  DbProduct,
  DbProductImage,
  OrderStatus,
} from "../types/database";
import { mockStorage } from "./mockStorage";

export type RealtimeEvent = {
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE" | "*";
  new?: any;
  old?: any;
};

export type RealtimeCallback = (event: RealtimeEvent) => void;

export const api = {
  // ==============================================================================
  // REAL-TIME SUBSCRIPTION ENGINE
  // ==============================================================================
  /**
   * Subscribes to database changes for one or more tables in real-time.
   * Uses Supabase Realtime (postgres_changes) when Supabase is configured.
   * Also listens to local BroadcastChannel and window events for multi-tab
   * synchronization and development mock mode.
   *
   * @returns Cleanup function to unsubscribe and prevent memory leaks.
   */
  subscribe(
    tables: string | string[],
    callback: RealtimeCallback
  ): () => void {
    const tableList = Array.isArray(tables) ? tables : [tables];

    // 1. Supabase Realtime Channel
    let channel: any = null;
    if (isSupabaseConfigured()) {
      const channelId = `rt-${tableList.join("_")}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      channel = supabase.channel(channelId);

      tableList.forEach((tbl) => {
        channel = channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table: tbl },
          (payload: any) => {
            callback({
              table: tbl,
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
            });
          }
        );
      });

      channel.subscribe();
    }

    // 2. Cross-Tab BroadcastChannel & CustomEvent for local/mock mode
    const handleLocalEvent = (e: Event) => {
      const customEvent = e as CustomEvent<RealtimeEvent>;
      if (customEvent.detail) {
        if (tableList.includes(customEvent.detail.table) || tableList.includes("*")) {
          callback(customEvent.detail);
        }
      } else {
        callback({ table: tableList[0], eventType: "*" });
      }
    };

    const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("mm-realtime-sync") : null;
    if (bc) {
      bc.onmessage = (msg) => {
        if (msg.data) {
          if (tableList.includes(msg.data.table) || tableList.includes("*")) {
            callback(msg.data);
          }
        } else {
          callback({ table: tableList[0], eventType: "*" });
        }
      };
    }

    if (typeof window !== "undefined") {
      window.addEventListener("mm-realtime-sync", handleLocalEvent);
    }

    // Return unsubscriber function
    return () => {
      if (channel && isSupabaseConfigured()) {
        supabase.removeChannel(channel);
      }
      if (bc) {
        bc.close();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("mm-realtime-sync", handleLocalEvent);
      }
    };
  },

  /**
   * Broadcasts a local change event across tabs and in the current window
   * for instant responsiveness and mock-mode real-time simulation.
   */
  broadcastLocalChange(table: string, eventType: "INSERT" | "UPDATE" | "DELETE" | "*" = "UPDATE", data?: any) {
    const payload: RealtimeEvent = { table, eventType, new: data };
    if (typeof BroadcastChannel !== "undefined") {
      try {
        const bc = new BroadcastChannel("mm-realtime-sync");
        bc.postMessage(payload);
        bc.close();
      } catch {}
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mm-realtime-sync", { detail: payload }));
      // Legacy compatibility event
      window.dispatchEvent(new CustomEvent("mm-catalog-sync", { detail: payload }));
      try {
        localStorage.setItem("mm_realtime_ping", String(Date.now()));
      } catch {}
    }
  },

  // ==============================================================================
  // PRODUCTS
  // ==============================================================================
  async getProducts(): Promise<DbProduct[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getProducts();
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          images:product_images(*),
          inventory:inventory(*),
          category:categories!products_category_id_fkey(*),
          subcategory:categories!products_subcategory_id_fkey(*),
          collection:collections(*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase getProducts error, falling back to mock:", error.message);
        return mockStorage.getProducts();
      }

      return (data || []) as DbProduct[];
    } catch (e) {
      console.warn("Supabase getProducts exception, falling back to mock:", e);
      return mockStorage.getProducts();
    }
  },

  async createProduct(product: Partial<DbProduct>, images?: string[]): Promise<DbProduct> {
    if (!isSupabaseConfigured()) {
      const pImages: DbProductImage[] = (images || []).map((url, idx) => ({
        id: `img-${Date.now()}-${idx}`,
        product_id: "",
        image_url: url,
        sort_order: idx,
        alt_text: product.name,
      }));
      const res = mockStorage.saveProduct({ ...product, images: pImages });
      this.broadcastLocalChange("products", "INSERT", res);
      return res;
    }

    try {
      const insertPayload: Record<string, any> = {
        name: product.name,
        slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sku: product.sku || `MM-${Date.now().toString().slice(-4)}`,
        description: product.description || "",
        short_description: product.short_description || null,
        story: product.story || null,
        price: Number(product.price) || 0,
        compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
        gender: product.gender || "Unisex",
        category_id: product.category_id || null,
        subcategory_id: product.subcategory_id || null,
        collection_id: product.collection_id || null,
        badge: product.badge || null,
        materials: product.materials || [],
        tags: product.tags || [],
        featured: Boolean(product.featured),
        new_arrival: Boolean(product.new_arrival),
        status: product.status || "active",
      };

      if (product.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id)) {
        insertPayload.id = product.id;
      }

      const { data, error } = await supabase
        .from("products")
        .insert(insertPayload)
        .select()
        .single();

      if (error || !data) throw error || new Error("Failed to insert product");

      if (images && images.length > 0) {
        const imageRows = images.map((imgUrl, idx) => ({
          product_id: data.id,
          image_url: imgUrl,
          sort_order: idx,
          alt_text: product.name || "Product image",
        }));
        await supabase.from("product_images").insert(imageRows);
      }

      const finalProduct = data as DbProduct;
      this.broadcastLocalChange("products", "INSERT", finalProduct);
      return finalProduct;
    } catch (e) {
      console.warn("Supabase createProduct failed, saving to mock:", e);
      const res = mockStorage.saveProduct(product);
      this.broadcastLocalChange("products", "INSERT", res);
      return res;
    }
  },

  async updateProduct(id: string, product: Partial<DbProduct>, images?: string[]): Promise<DbProduct> {
    if (!isSupabaseConfigured()) {
      const allLocal = mockStorage.getProducts();
      const existing = allLocal.find((p) => p.id === id);
      const merged = { ...(existing || {}), ...product, id };
      const localProduct = mockStorage.saveProduct(merged);
      this.broadcastLocalChange("products", "UPDATE", localProduct);
      return localProduct;
    }

    try {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (product.name !== undefined) updatePayload.name = product.name;
      if (product.slug !== undefined) updatePayload.slug = product.slug;
      if (product.sku !== undefined) updatePayload.sku = product.sku;
      if (product.description !== undefined) updatePayload.description = product.description;
      if (product.short_description !== undefined) updatePayload.short_description = product.short_description;
      if (product.story !== undefined) updatePayload.story = product.story;
      if (product.price !== undefined) updatePayload.price = Number(product.price);
      if (product.compare_at_price !== undefined) updatePayload.compare_at_price = product.compare_at_price ? Number(product.compare_at_price) : null;
      if (product.gender !== undefined) updatePayload.gender = product.gender;
      if (product.category_id !== undefined) updatePayload.category_id = product.category_id || null;
      if (product.subcategory_id !== undefined) updatePayload.subcategory_id = product.subcategory_id || null;
      if (product.collection_id !== undefined) updatePayload.collection_id = product.collection_id || null;
      if (product.badge !== undefined) updatePayload.badge = product.badge;
      if (product.materials !== undefined) updatePayload.materials = product.materials;
      if (product.tags !== undefined) updatePayload.tags = product.tags;
      if (product.featured !== undefined) updatePayload.featured = Boolean(product.featured);
      if (product.new_arrival !== undefined) updatePayload.new_arrival = Boolean(product.new_arrival);
      if (product.status !== undefined) updatePayload.status = product.status;

      const { data, error } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (images && images.length > 0) {
        try {
          await supabase.from("product_images").delete().eq("product_id", id);
          const imageRows = images.map((imgUrl, idx) => ({
            product_id: id,
            image_url: imgUrl,
            sort_order: idx,
            alt_text: product.name || "Product image",
          }));
          await supabase.from("product_images").insert(imageRows);
        } catch (imgErr) {
          console.warn("Product images update notice:", imgErr);
        }
      }

      const res = (data || { ...product, id }) as DbProduct;
      this.broadcastLocalChange("products", "UPDATE", res);
      return res;
    } catch (e) {
      console.warn("Supabase updateProduct fallback:", e);
      const res = mockStorage.saveProduct({ ...product, id });
      this.broadcastLocalChange("products", "UPDATE", res);
      return res;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteProduct(id);
      this.broadcastLocalChange("products", "DELETE", { id });
      return;
    }

    try {
      await supabase.from("products").delete().eq("id", id);
      this.broadcastLocalChange("products", "DELETE", { id });
    } catch (e) {
      console.warn("Supabase deleteProduct error, deleting from mock:", e);
      mockStorage.deleteProduct(id);
      this.broadcastLocalChange("products", "DELETE", { id });
    }
  },

  // ==============================================================================
  // CATEGORIES
  // ==============================================================================
  async getCategories(): Promise<DbCategory[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getCategories();
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.warn("Supabase getCategories error, falling back to mock:", error.message);
        return mockStorage.getCategories();
      }

      return (data || []) as DbCategory[];
    } catch (e) {
      console.warn("Supabase getCategories exception, falling back to mock:", e);
      return mockStorage.getCategories();
    }
  },

  async createCategory(cat: Partial<DbCategory>): Promise<DbCategory> {
    if (!isSupabaseConfigured()) {
      const res = mockStorage.saveCategory(cat);
      this.broadcastLocalChange("categories", "INSERT", res);
      return res;
    }

    try {
      const insertPayload: Record<string, any> = {
        name: cat.name,
        slug: cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        parent_id: cat.parent_id || null,
        sort_order: cat.sort_order || 0,
        description: cat.description || null,
        status: cat.status || "active",
      };

      if (cat.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cat.id)) {
        insertPayload.id = cat.id;
      }

      const { data, error } = await supabase
        .from("categories")
        .insert(insertPayload)
        .select()
        .single();

      if (error || !data) throw error || new Error("Failed to insert category");

      const res = data as DbCategory;
      this.broadcastLocalChange("categories", "INSERT", res);
      return res;
    } catch (e) {
      console.warn("Supabase createCategory error, falling back to mock:", e);
      const res = mockStorage.saveCategory(cat);
      this.broadcastLocalChange("categories", "INSERT", res);
      return res;
    }
  },

  async updateCategory(id: string, cat: Partial<DbCategory>): Promise<DbCategory> {
    if (!isSupabaseConfigured()) {
      const res = mockStorage.saveCategory({ ...cat, id });
      this.broadcastLocalChange("categories", "UPDATE", res);
      return res;
    }

    try {
      const updatePayload: Record<string, any> = {};
      if (cat.name !== undefined) updatePayload.name = cat.name;
      if (cat.slug !== undefined) updatePayload.slug = cat.slug;
      if (cat.parent_id !== undefined) updatePayload.parent_id = cat.parent_id || null;
      if (cat.sort_order !== undefined) updatePayload.sort_order = cat.sort_order;
      if (cat.description !== undefined) updatePayload.description = cat.description;
      if (cat.status !== undefined) updatePayload.status = cat.status;

      const { data, error } = await supabase
        .from("categories")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error || !data) throw error || new Error("Failed to update category");

      const res = data as DbCategory;
      this.broadcastLocalChange("categories", "UPDATE", res);
      return res;
    } catch (e) {
      console.warn("Supabase updateCategory error, updating mock:", e);
      const res = mockStorage.saveCategory({ ...cat, id });
      this.broadcastLocalChange("categories", "UPDATE", res);
      return res;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteCategory(id);
      this.broadcastLocalChange("categories", "DELETE", { id });
      return;
    }

    try {
      await supabase.from("categories").delete().eq("id", id);
      this.broadcastLocalChange("categories", "DELETE", { id });
    } catch (e) {
      console.warn("Supabase deleteCategory error, deleting from mock:", e);
      mockStorage.deleteCategory(id);
      this.broadcastLocalChange("categories", "DELETE", { id });
    }
  },

  // ==============================================================================
  // COLLECTIONS
  // ==============================================================================
  async getCollections(): Promise<DbCollection[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getCollections();
    }

    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase getCollections error, falling back to mock:", error.message);
        return mockStorage.getCollections();
      }

      return (data || []) as DbCollection[];
    } catch (e) {
      console.warn("Supabase getCollections exception, falling back to mock:", e);
      return mockStorage.getCollections();
    }
  },

  async createCollection(col: Partial<DbCollection>): Promise<DbCollection> {
    if (!isSupabaseConfigured()) {
      const res = mockStorage.saveCollection(col);
      this.broadcastLocalChange("collections", "INSERT", res);
      return res;
    }

    try {
      const insertPayload: Record<string, any> = {
        name: col.name,
        slug: col.slug || col.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        season: col.season || "SS26",
        description: col.description || null,
        image: col.image || null,
        status: col.status || "active",
      };

      if (col.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(col.id)) {
        insertPayload.id = col.id;
      }

      const { data, error } = await supabase
        .from("collections")
        .insert(insertPayload)
        .select()
        .single();

      if (error || !data) throw error || new Error("Failed to insert collection");

      const res = data as DbCollection;
      this.broadcastLocalChange("collections", "INSERT", res);
      return res;
    } catch (e) {
      console.warn("Supabase createCollection error, saving to mock:", e);
      const res = mockStorage.saveCollection(col);
      this.broadcastLocalChange("collections", "INSERT", res);
      return res;
    }
  },

  async updateCollection(id: string, col: Partial<DbCollection>): Promise<DbCollection> {
    if (!isSupabaseConfigured()) {
      const res = mockStorage.saveCollection({ ...col, id });
      this.broadcastLocalChange("collections", "UPDATE", res);
      return res;
    }

    try {
      const updatePayload: Record<string, any> = {};
      if (col.name !== undefined) updatePayload.name = col.name;
      if (col.slug !== undefined) updatePayload.slug = col.slug;
      if (col.season !== undefined) updatePayload.season = col.season;
      if (col.description !== undefined) updatePayload.description = col.description;
      if (col.image !== undefined) updatePayload.image = col.image;
      if (col.status !== undefined) updatePayload.status = col.status;

      const { data, error } = await supabase
        .from("collections")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error || !data) throw error || new Error("Failed to update collection");

      const res = data as DbCollection;
      this.broadcastLocalChange("collections", "UPDATE", res);
      return res;
    } catch (e) {
      console.warn("Supabase updateCollection error, updating mock:", e);
      const res = mockStorage.saveCollection({ ...col, id });
      this.broadcastLocalChange("collections", "UPDATE", res);
      return res;
    }
  },

  async deleteCollection(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteCollection(id);
      this.broadcastLocalChange("collections", "DELETE", { id });
      return;
    }

    try {
      // Unlink products first to maintain relational integrity
      await supabase.from("products").update({ collection_id: null }).eq("collection_id", id);
      await supabase.from("collections").delete().eq("id", id);
      this.broadcastLocalChange("collections", "DELETE", { id });
    } catch (e) {
      console.warn("Supabase deleteCollection error, deleting from mock:", e);
      mockStorage.deleteCollection(id);
      this.broadcastLocalChange("collections", "DELETE", { id });
    }
  },

  // ==============================================================================
  // INVENTORY
  // ==============================================================================
  async getInventory(): Promise<DbInventory[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getInventory();
    }

    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*, product:products(*)")
        .order("product_id", { ascending: true });

      if (error) {
        console.warn("Supabase getInventory error, falling back to mock:", error.message);
        return mockStorage.getInventory();
      }

      return (data || []) as DbInventory[];
    } catch (e) {
      console.warn("Supabase getInventory exception, falling back to mock:", e);
      return mockStorage.getInventory();
    }
  },

  async saveInventoryVariant(variant: Partial<DbInventory> & { product_id: string; size: string }): Promise<DbInventory> {
    const safeStock = Math.max(0, Number(variant.stock_quantity) || 0);
    const safeThreshold = Math.max(1, Number(variant.low_stock_threshold) || 5);

    if (!isSupabaseConfigured()) {
      const res = mockStorage.saveInventory({
        ...variant,
        stock_quantity: safeStock,
        low_stock_threshold: safeThreshold,
      });
      this.broadcastLocalChange("inventory", "INSERT", res);
      return res;
    }

    try {
      const payload: Record<string, any> = {
        product_id: variant.product_id,
        size: variant.size,
        color: variant.color || "Default",
        stock_quantity: safeStock,
        low_stock_threshold: safeThreshold,
        updated_at: new Date().toISOString(),
      };

      if (variant.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variant.id)) {
        payload.id = variant.id;
      }

      const { data, error } = await supabase
        .from("inventory")
        .upsert(payload, { onConflict: "product_id,size,color" })
        .select()
        .single();

      if (error || !data) throw error || new Error("Failed to save inventory");

      const res = data as DbInventory;
      this.broadcastLocalChange("inventory", "UPDATE", res);
      return res;
    } catch (e) {
      console.warn("Supabase saveInventoryVariant error, saving to mock:", e);
      const res = mockStorage.saveInventory({
        ...variant,
        stock_quantity: safeStock,
        low_stock_threshold: safeThreshold,
      });
      this.broadcastLocalChange("inventory", "UPDATE", res);
      return res;
    }
  },

  async updateInventory(id: string, updates: Partial<DbInventory>): Promise<DbInventory> {
    const cleanUpdates = { ...updates };
    if (cleanUpdates.stock_quantity !== undefined) {
      cleanUpdates.stock_quantity = Math.max(0, Number(cleanUpdates.stock_quantity));
    }
    if (cleanUpdates.low_stock_threshold !== undefined) {
      cleanUpdates.low_stock_threshold = Math.max(1, Number(cleanUpdates.low_stock_threshold));
    }

    if (!isSupabaseConfigured()) {
      const res = mockStorage.saveInventory({ ...cleanUpdates, id });
      this.broadcastLocalChange("inventory", "UPDATE", res);
      return res;
    }

    try {
      const { data, error } = await supabase
        .from("inventory")
        .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) throw error || new Error("Failed to update inventory");

      const res = data as DbInventory;
      this.broadcastLocalChange("inventory", "UPDATE", res);
      return res;
    } catch (e) {
      console.warn("Supabase updateInventory error, updating mock:", e);
      const res = mockStorage.saveInventory({ ...cleanUpdates, id });
      this.broadcastLocalChange("inventory", "UPDATE", res);
      return res;
    }
  },

  async deleteInventory(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteInventory(id);
      this.broadcastLocalChange("inventory", "DELETE", { id });
      return;
    }

    try {
      await supabase.from("inventory").delete().eq("id", id);
      this.broadcastLocalChange("inventory", "DELETE", { id });
    } catch (e) {
      console.warn("Supabase deleteInventory error, deleting from mock:", e);
      mockStorage.deleteInventory(id);
      this.broadcastLocalChange("inventory", "DELETE", { id });
    }
  },

  // ==============================================================================
  // ORDERS (WITHOUT PAYMENT GATEWAY)
  // ==============================================================================
  async getOrders(): Promise<DbOrder[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getOrders();
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase getOrders error, falling back to mock:", error.message);
        return mockStorage.getOrders();
      }

      return (data || []) as DbOrder[];
    } catch (e) {
      console.warn("Supabase getOrders exception, falling back to mock:", e);
      return mockStorage.getOrders();
    }
  },

  async createOrder(orderPayload: CreateOrderPayload): Promise<DbOrder> {
    if (!isSupabaseConfigured()) {
      const res = mockStorage.createOrder(orderPayload);
      this.broadcastLocalChange("orders", "INSERT", res);
      return res;
    }

    try {
      const orderNumber = `MM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: orderPayload.customer_id || null,
          order_number: orderNumber,
          subtotal: orderPayload.subtotal,
          shipping: orderPayload.shipping || 0,
          total: orderPayload.total,
          customer_name: orderPayload.customer_name,
          customer_email: orderPayload.customer_email,
          customer_phone: orderPayload.customer_phone || null,
          shipping_address: orderPayload.shipping_address,
          order_status: orderPayload.order_status || "Pending",
        })
        .select()
        .single();

      if (orderError || !orderData) throw orderError || new Error("Failed to insert order");

      const resolvedItems: DbOrderItem[] = (orderPayload.items || []).map((it, idx) => ({
        id: it.id || `item-${Date.now()}-${idx}`,
        order_id: orderData.id,
        product_id: it.product_id || null,
        product_name: it.product_name,
        quantity: it.quantity,
        size: it.size,
        color: it.color || null,
        price: it.price,
        image_url: it.image_url || null,
      }));

      if (orderPayload.items && orderPayload.items.length > 0) {
        const itemRows = orderPayload.items.map((it) => ({
          order_id: orderData.id,
          product_id: it.product_id || null,
          product_name: it.product_name,
          quantity: it.quantity,
          size: it.size,
          color: it.color || "Default",
          price: it.price,
          image_url: it.image_url || null,
        }));
        await supabase.from("order_items").insert(itemRows);
      }

      const completeOrder: DbOrder = { ...orderData, items: resolvedItems };
      this.broadcastLocalChange("orders", "INSERT", completeOrder);
      return completeOrder;
    } catch (e) {
      console.warn("Supabase createOrder failed, creating in mock:", e);
      const res = mockStorage.createOrder(orderPayload);
      this.broadcastLocalChange("orders", "INSERT", res);
      return res;
    }
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<DbOrder | null> {
    if (!isSupabaseConfigured()) {
      const res = mockStorage.updateOrderStatus(id, status);
      this.broadcastLocalChange("orders", "UPDATE", res);
      return res;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, items:order_items(*)")
        .single();

      if (error || !data) throw error || new Error("Failed to update order status");

      const res = data as DbOrder;
      this.broadcastLocalChange("orders", "UPDATE", res);
      return res;
    } catch (e) {
      console.warn("Supabase updateOrderStatus error, updating mock:", e);
      const res = mockStorage.updateOrderStatus(id, status);
      this.broadcastLocalChange("orders", "UPDATE", res);
      return res;
    }
  },

  async deleteOrder(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteOrder(id);
      this.broadcastLocalChange("orders", "DELETE", { id });
      return;
    }

    try {
      await supabase.from("orders").delete().eq("id", id);
      this.broadcastLocalChange("orders", "DELETE", { id });
    } catch (e) {
      console.warn("Supabase deleteOrder error, deleting from mock:", e);
      mockStorage.deleteOrder(id);
      this.broadcastLocalChange("orders", "DELETE", { id });
    }
  },

  // ==============================================================================
  // CUSTOMERS
  // ==============================================================================
  async getCustomers(): Promise<DbCustomer[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getCustomers();
    }

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase getCustomers error, falling back to mock:", error.message);
        return mockStorage.getCustomers();
      }

      return (data || []) as DbCustomer[];
    } catch (e) {
      console.warn("Supabase getCustomers exception, falling back to mock:", e);
      return mockStorage.getCustomers();
    }
  },

  async updateCustomerRole(id: string, role: "admin" | "customer"): Promise<DbCustomer | null> {
    if (!isSupabaseConfigured()) {
      const res = mockStorage.updateCustomerRole(id, role);
      this.broadcastLocalChange("customers", "UPDATE", res);
      return res;
    }

    try {
      const { data, error } = await supabase
        .from("customers")
        .update({ role })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) throw error;

      const res = data as DbCustomer;
      this.broadcastLocalChange("customers", "UPDATE", res);
      return res;
    } catch (e) {
      console.warn("Supabase updateCustomerRole error, updating mock:", e);
      const res = mockStorage.updateCustomerRole(id, role);
      this.broadcastLocalChange("customers", "UPDATE", res);
      return res;
    }
  },

  async toggleCustomerStatus(id: string): Promise<DbCustomer | null> {
    if (!isSupabaseConfigured()) {
      const res = mockStorage.toggleCustomerStatus(id);
      this.broadcastLocalChange("customers", "UPDATE", res);
      return res;
    }

    try {
      const { data: current } = await supabase
        .from("customers")
        .select("status")
        .eq("id", id)
        .single();

      const nextStatus = current?.status === "disabled" ? "active" : "disabled";

      const { data, error } = await supabase
        .from("customers")
        .update({ status: nextStatus })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) throw error;

      const res = data as DbCustomer;
      this.broadcastLocalChange("customers", "UPDATE", res);
      return res;
    } catch (e) {
      console.warn("Supabase toggleCustomerStatus error, updating mock:", e);
      const res = mockStorage.toggleCustomerStatus(id);
      this.broadcastLocalChange("customers", "UPDATE", res);
      return res;
    }
  },

  // ==============================================================================
  // CONTACT MESSAGES
  // ==============================================================================
  async getContactMessages(): Promise<DbContactMessage[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getContactMessages();
    }

    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase getContactMessages error, falling back to mock:", error.message);
        return mockStorage.getContactMessages();
      }

      return (data || []) as DbContactMessage[];
    } catch (e) {
      console.warn("Supabase getContactMessages exception, falling back to mock:", e);
      return mockStorage.getContactMessages();
    }
  },

  async createContactMessage(msg: Omit<DbContactMessage, "id" | "created_at" | "status">): Promise<DbContactMessage> {
    if (!isSupabaseConfigured()) {
      const res = mockStorage.createContactMessage(msg);
      this.broadcastLocalChange("contact_messages", "INSERT", res);
      return res;
    }

    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .insert({
          name: msg.name,
          email: msg.email,
          phone: msg.phone || null,
          message: msg.message,
          status: "unread",
        })
        .select()
        .single();

      if (error || !data) throw error || new Error("Failed to insert contact message");

      const res = data as DbContactMessage;
      this.broadcastLocalChange("contact_messages", "INSERT", res);
      return res;
    } catch (e) {
      console.warn("Supabase createContactMessage error, saving to mock:", e);
      const res = mockStorage.createContactMessage(msg);
      this.broadcastLocalChange("contact_messages", "INSERT", res);
      return res;
    }
  },

  async updateContactStatus(id: string, status: DbContactMessage["status"]): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.updateContactStatus(id, status);
      this.broadcastLocalChange("contact_messages", "UPDATE", { id, status });
      return;
    }

    try {
      await supabase.from("contact_messages").update({ status }).eq("id", id);
      this.broadcastLocalChange("contact_messages", "UPDATE", { id, status });
    } catch (e) {
      console.warn("Supabase updateContactStatus error, updating mock:", e);
      mockStorage.updateContactStatus(id, status);
      this.broadcastLocalChange("contact_messages", "UPDATE", { id, status });
    }
  },

  async deleteContactMessage(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteContactMessage(id);
      this.broadcastLocalChange("contact_messages", "DELETE", { id });
      return;
    }

    try {
      await supabase.from("contact_messages").delete().eq("id", id);
      this.broadcastLocalChange("contact_messages", "DELETE", { id });
    } catch (e) {
      console.warn("Supabase deleteContactMessage error, deleting from mock:", e);
      mockStorage.deleteContactMessage(id);
      this.broadcastLocalChange("contact_messages", "DELETE", { id });
    }
  },

  // ==============================================================================
  // NEWSLETTER SUBSCRIBERS
  // ==============================================================================
  async getNewsletterSubscribers(): Promise<DbNewsletterSubscriber[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getNewsletterSubscribers();
    }

    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) {
        console.warn("Supabase getNewsletterSubscribers error, falling back to mock:", error.message);
        return mockStorage.getNewsletterSubscribers();
      }

      return (data || []) as DbNewsletterSubscriber[];
    } catch (e) {
      console.warn("Supabase getNewsletterSubscribers exception, falling back to mock:", e);
      return mockStorage.getNewsletterSubscribers();
    }
  },

  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured()) {
      const res = mockStorage.addNewsletterSubscriber(cleanEmail);
      this.broadcastLocalChange("newsletter_subscribers", "INSERT", { email: cleanEmail });
      return res;
    }

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert({ email: cleanEmail, status: "active" }, { onConflict: "email" });

      if (error) throw error;

      this.broadcastLocalChange("newsletter_subscribers", "INSERT", { email: cleanEmail });
      return { success: true, message: "Welcome to Maison Makeeva Atelier dispatch." };
    } catch (e) {
      console.warn("Supabase subscribeNewsletter error, falling back to mock:", e);
      const res = mockStorage.addNewsletterSubscriber(cleanEmail);
      this.broadcastLocalChange("newsletter_subscribers", "INSERT", { email: cleanEmail });
      return res;
    }
  },

  async toggleNewsletterStatus(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.toggleNewsletterStatus(id);
      this.broadcastLocalChange("newsletter_subscribers", "UPDATE", { id });
      return;
    }

    try {
      const { data: current } = await supabase
        .from("newsletter_subscribers")
        .select("status")
        .eq("id", id)
        .single();

      const nextStatus = current?.status === "unsubscribed" ? "active" : "unsubscribed";

      await supabase
        .from("newsletter_subscribers")
        .update({ status: nextStatus })
        .eq("id", id);

      this.broadcastLocalChange("newsletter_subscribers", "UPDATE", { id, status: nextStatus });
    } catch (e) {
      console.warn("Supabase toggleNewsletterStatus error, updating mock:", e);
      mockStorage.toggleNewsletterStatus(id);
      this.broadcastLocalChange("newsletter_subscribers", "UPDATE", { id });
    }
  },

  // ==============================================================================
  // DASHBOARD AGGREGATED METRICS
  // ==============================================================================
  getMockDashboardStats(): DashboardStats {
    const prods = mockStorage.getProducts();
    const inv = mockStorage.getInventory();
    const orders = mockStorage.getOrders();
    const custs = mockStorage.getCustomers();
    const msgs = mockStorage.getContactMessages();

    return {
      totalProducts: prods.length,
      activeProducts: prods.filter((p) => p.status === "active").length,
      lowStockCount: inv.filter((i) => i.stock_quantity <= (i.low_stock_threshold || 5)).length,
      totalCustomers: custs.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.order_status === "Pending").length,
      totalRevenue: orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
      recentOrders: orders.slice(0, 6),
      recentMessages: msgs.slice(0, 6),
    };
  },

  async getDashboardStats(): Promise<DashboardStats> {
    if (!isSupabaseConfigured()) {
      return this.getMockDashboardStats();
    }

    try {
      const [
        prodsRes,
        invRes,
        ordersRes,
        custsRes,
        msgsRes,
      ] = await Promise.all([
        supabase.from("products").select("id, status"),
        supabase.from("inventory").select("id, stock_quantity, low_stock_threshold"),
        supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }),
        supabase.from("customers").select("id", { count: "exact" }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(6),
      ]);

      const prods = prodsRes.data || [];
      const totalProducts = prods.length;
      const activeProducts = prods.filter((p) => p.status === "active").length;

      const inv = invRes.data || [];
      const lowStockCount = inv.filter((i) => i.stock_quantity <= (i.low_stock_threshold || 5)).length;

      const orders = (ordersRes.data || []) as DbOrder[];
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o) => o.order_status === "Pending").length;
      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      const totalCustomers = custsRes.count || 0;
      const recentOrders = orders.slice(0, 6);
      const recentMessages = (msgsRes.data || []) as DbContactMessage[];

      return {
        totalProducts,
        activeProducts,
        lowStockCount,
        totalCustomers,
        totalOrders,
        pendingOrders,
        totalRevenue,
        recentOrders,
        recentMessages,
      };
    } catch (e) {
      console.warn("Supabase getDashboardStats exception, falling back to mock:", e);
      return this.getMockDashboardStats();
    }
  },

  // ==============================================================================
  // ASSET STORAGE (IMAGE UPLOADS)
  // ==============================================================================
  async uploadImageMock(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  async uploadImage(file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      return this.uploadImageMock(file);
    }

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `atelier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `catalog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (e) {
      console.warn("Supabase storage upload fallback to data URL:", e);
      return this.uploadImageMock(file);
    }
  },
};
