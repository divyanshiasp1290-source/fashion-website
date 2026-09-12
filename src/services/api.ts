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

export const api = {
  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts(): Promise<DbProduct[]> {
    let supabaseProds: DbProduct[] = [];
    let supabaseSuccess = false;

    if (isSupabaseConfigured()) {
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

        if (!error && data) {
          supabaseProds = data as DbProduct[];
          supabaseSuccess = true;
        } else if (error) {
          console.warn("Supabase getProducts notice:", error.message);
        }
      } catch (e) {
        console.warn("Supabase getProducts fallback to mock:", e);
      }
    }

    if (!supabaseSuccess) {
      return mockStorage.getProducts();
    }

    // Merge Supabase products with mockStorage to apply any client edits/toggles (e.g. new_arrival, status)
    // while strictly preserving Supabase's newest-first order.
    // NOTE: Index strictly by ID so seed items (prod-1, prod-2) NEVER override Supabase records by slug.
    const localProds = mockStorage.getProducts();
    const localMap = new Map<string, DbProduct>();
    for (const lp of localProds) {
      localMap.set(lp.id, lp);
    }

    const mergedProds: DbProduct[] = supabaseProds.map((sp) => {
      const override = localMap.get(sp.id);
      if (!override) {
        return {
          ...sp,
          featured: Boolean(sp.featured),
          new_arrival: Boolean(sp.new_arrival),
        };
      }
      return {
        ...sp,
        new_arrival: override.new_arrival !== undefined ? Boolean(override.new_arrival) : Boolean(sp.new_arrival),
        featured: override.featured !== undefined ? Boolean(override.featured) : Boolean(sp.featured),
        badge: override.badge !== undefined ? override.badge : sp.badge,
        status: override.status || sp.status,
        name: override.name || sp.name,
        price: override.price !== undefined ? override.price : sp.price,
        description: override.description || sp.description,
        tags: override.tags && override.tags.length > 0 ? override.tags : sp.tags,
        images: override.images && override.images.length > 0 ? override.images : sp.images,
        inventory: override.inventory && override.inventory.length > 0 ? override.inventory : sp.inventory,
      };
    });

    // Also include any newly created offline products
    for (const lp of localProds) {
      const isAlreadyInSupabase = supabaseProds.some(
        (sp) => sp.id === lp.id || (lp.slug && sp.slug === lp.slug)
      );
      if (!isAlreadyInSupabase && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lp.id)) {
        if (lp.id.startsWith("prod-") && Number(lp.id.replace("prod-", "")) > 14) {
          mergedProds.unshift(lp);
        }
      }
    }

    return mergedProds;
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
      return mockStorage.saveProduct({ ...product, images: pImages });
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          sku: product.sku,
          description: product.description,
          short_description: product.short_description,
          story: product.story,
          price: product.price,
          compare_at_price: product.compare_at_price,
          gender: product.gender || "Unisex",
          category_id: product.category_id || null,
          subcategory_id: product.subcategory_id || null,
          collection_id: product.collection_id || null,
          badge: product.badge,
          materials: product.materials || [],
          tags: product.tags || [],
          featured: product.featured || false,
          new_arrival: product.new_arrival || false,
          status: product.status || "active",
        })
        .select()
        .single();

      if (error || !data) throw error;

      if (images && images.length > 0) {
        const imageRows = images.map((imgUrl, idx) => ({
          product_id: data.id,
          image_url: imgUrl,
          sort_order: idx,
          alt_text: product.name,
        }));
        await supabase.from("product_images").insert(imageRows);
      }

      const finalProduct = data as DbProduct;
      mockStorage.saveProduct(finalProduct);
      return finalProduct;
    } catch (e) {
      console.warn("Supabase createProduct fallback to mock:", e);
      return mockStorage.saveProduct(product);
    }
  },

  async updateProduct(id: string, product: Partial<DbProduct>, images?: string[]): Promise<DbProduct> {
    const allLocal = mockStorage.getProducts();
    const existing = allLocal.find((p) => p.id === id);
    const merged = { ...(existing || {}), ...product, id };
    const localProduct = mockStorage.saveProduct(merged);

    // Broadcast change cross-tab and in-window
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("mm-catalog-sync");
        bc.postMessage({ type: "product_updated", id });
        bc.close();
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mm-catalog-sync", { detail: { id } }));
        localStorage.setItem("mm_catalog_updated_at", String(Date.now()));
      }
    } catch (e) {}

    if (!isSupabaseConfigured()) {
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

      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        const { data } = await supabase
          .from("products")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .maybeSingle();

        if (data) {
          mockStorage.saveProduct(data as DbProduct);
        }
      }

      if (images && images.length > 0 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
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

      return localProduct;
    } catch (e) {
      console.warn("Supabase updateProduct notice:", e);
      return localProduct;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteProduct(id);
      return;
    }
    try {
      await supabase.from("products").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase deleteProduct fallback to mock:", e);
    }
    mockStorage.deleteProduct(id);
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(): Promise<DbCategory[]> {
    let supabaseCats: DbCategory[] = [];
    let supabaseSuccess = false;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true });
        if (!error && data) {
          supabaseCats = data as DbCategory[];
          supabaseSuccess = true;
        } else if (error) {
          console.warn("Supabase getCategories query notice:", error.message);
        }
      } catch (e) {
        console.warn("Supabase getCategories fallback to mock:", e);
      }
    }

    if (!supabaseSuccess) {
      return mockStorage.getCategories();
    }

    // Merge Supabase categories with any local updates or newly created records
    // to guarantee 100% immediate consistency in Admin and Storefront
    const localCats = mockStorage.getCategories();
    const map = new Map<string, DbCategory>();

    for (const sc of supabaseCats) {
      map.set(sc.id, sc);
      if (sc.slug) map.set(sc.slug, sc);
    }

    for (const lc of localCats) {
      const match = map.get(lc.id) || (lc.slug ? map.get(lc.slug) : undefined);
      if (!match) {
        map.set(lc.id, lc);
      } else {
        if (lc.status && lc.status !== match.status) {
          match.status = lc.status;
        }
        if (lc.name && lc.name !== match.name) {
          match.name = lc.name;
        }
      }
    }

    const merged = Array.from(new Set(map.values())).sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    );

    // Sync to local cache
    for (const c of merged) {
      mockStorage.saveCategory(c);
    }

    return merged;
  },

  async createCategory(cat: Partial<DbCategory>): Promise<DbCategory> {
    let createdFromSupabase: DbCategory | null = null;

    if (isSupabaseConfigured()) {
      try {
        const insertPayload: Record<string, any> = {
          name: cat.name,
          slug: cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          parent_id: cat.parent_id || null,
          sort_order: cat.sort_order || 0,
          description: cat.description || null,
          status: cat.status || "active",
        };

        // Only pass id if it is a valid UUID
        if (cat.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cat.id)) {
          insertPayload.id = cat.id;
        }

        const { data, error } = await supabase
          .from("categories")
          .insert(insertPayload)
          .select()
          .single();

        if (!error && data) {
          createdFromSupabase = data as DbCategory;
        } else if (error) {
          console.warn("Supabase createCategory notice (falling back to local cache):", error.message);
        }
      } catch (e) {
        console.warn("Supabase createCategory exception:", e);
      }
    }

    if (createdFromSupabase) {
      mockStorage.saveCategory(createdFromSupabase);
      return createdFromSupabase;
    }

    return mockStorage.saveCategory(cat);
  },

  async updateCategory(id: string, cat: Partial<DbCategory>): Promise<DbCategory> {
    const local = mockStorage.saveCategory({ ...cat, id });
    if (!isSupabaseConfigured()) {
      return local;
    }
    try {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
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

        if (!error && data) {
          mockStorage.saveCategory(data as DbCategory);
          return data as DbCategory;
        }
      }
      return local;
    } catch (e) {
      console.warn("Supabase updateCategory fallback to mock:", e);
      return local;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    mockStorage.deleteCategory(id);
    if (!isSupabaseConfigured()) {
      return;
    }
    try {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        // Safely unlink products in Supabase first
        await supabase.from("products").update({ category_id: null }).eq("category_id", id);
        await supabase.from("products").update({ subcategory_id: null }).eq("subcategory_id", id);
        // Delete any child categories in Supabase
        await supabase.from("categories").delete().eq("parent_id", id);
        // Delete category in Supabase
        await supabase.from("categories").delete().eq("id", id);
      }
    } catch (e) {
      console.warn("Supabase deleteCategory fallback to mock:", e);
    }
  },

  // ==========================================
  // COLLECTIONS
  // ==========================================
  async getCollections(): Promise<DbCollection[]> {
    let supabaseCols: DbCollection[] = [];
    let supabaseSuccess = false;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("collections")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          supabaseCols = data as DbCollection[];
          supabaseSuccess = true;
        } else if (error) {
          console.warn("Supabase getCollections notice:", error.message);
        }
      } catch (e) {
        console.warn("Supabase getCollections fallback:", e);
      }
    }

    if (!supabaseSuccess) {
      return mockStorage.getCollections();
    }

    // Merge Supabase collections with any local updates or newly created records
    // to guarantee 100% consistency across Admin and Storefront.
    const localCols = mockStorage.getCollections();
    const map = new Map<string, DbCollection>();

    for (const sc of supabaseCols) {
      map.set(sc.id, sc);
      if (sc.slug) map.set(sc.slug, sc);
    }

    for (const lc of localCols) {
      const match = map.get(lc.id) || (lc.slug ? map.get(lc.slug) : undefined);
      if (!match) {
        // Created collection locally pending Supabase replication
        map.set(lc.id, lc);
      } else {
        // Sync local property overrides (e.g. status toggle or recent edit)
        if (lc.status && lc.status !== match.status) {
          match.status = lc.status;
        }
        if (lc.name && lc.name !== match.name) {
          match.name = lc.name;
        }
        if (lc.season && lc.season !== match.season) {
          match.season = lc.season;
        }
        if (lc.image && lc.image !== match.image) {
          match.image = lc.image;
        }
        if (lc.description && lc.description !== match.description) {
          match.description = lc.description;
        }
      }
    }

    const merged = Array.from(new Set(Array.from(map.values())));
    return merged;
  },

  async createCollection(col: Partial<DbCollection>): Promise<DbCollection> {
    const payload = {
      name: col.name || "New Collection",
      slug: col.slug || col.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `col-${Date.now()}`,
      season: col.season || "SS26",
      description: col.description || "",
      image: col.image || "https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666",
      status: col.status || "active",
    };

    let created: DbCollection | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("collections")
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          created = data as DbCollection;
        } else if (error) {
          console.warn("Supabase createCollection write notice:", error.message);
        }
      } catch (e) {
        console.warn("Supabase createCollection exception:", e);
      }
    }

    // Always update local storage so data is immediately available
    const saved = mockStorage.saveCollection(created || { ...payload, ...col });
    return created || saved;
  },

  async updateCollection(id: string, col: Partial<DbCollection>): Promise<DbCollection> {
    let updated: DbCollection | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("collections")
          .update({
            name: col.name,
            slug: col.slug,
            season: col.season,
            description: col.description,
            image: col.image,
            status: col.status,
          })
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          updated = data as DbCollection;
        } else if (error) {
          console.warn("Supabase updateCollection write notice:", error.message);
        }
      } catch (e) {
        console.warn("Supabase updateCollection exception:", e);
      }
    }

    // Always keep local storage updated
    const saved = mockStorage.saveCollection(updated || { ...col, id });
    return updated || saved;
  },

  async deleteCollection(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        // 1. Safely unlink any products assigned to this collection first
        await supabase.from("products").update({ collection_id: null }).eq("collection_id", id);
        // 2. Delete collection from Supabase
        await supabase.from("collections").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deleteCollection notice:", e);
      }
    }
    // Safely unlink products and delete from local storage
    mockStorage.deleteCollection(id);
  },

  // ==========================================
  // INVENTORY
  // ==========================================
  async getInventory(): Promise<DbInventory[]> {
    let supabaseInv: DbInventory[] = [];
    let supabaseSuccess = false;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("*")
          .order("updated_at", { ascending: false });
        if (!error && data) {
          supabaseInv = data as DbInventory[];
          supabaseSuccess = true;
        } else if (error) {
          console.warn("Supabase getInventory notice:", error.message);
        }
      } catch (e) {
        console.warn("Supabase getInventory fallback to mock:", e);
      }
    }

    if (!supabaseSuccess) {
      return mockStorage.getInventory();
    }

    // Merge Supabase inventory with any local updates
    const localInv = mockStorage.getInventory();
    const map = new Map<string, DbInventory>();

    for (const si of supabaseInv) {
      map.set(si.id, si);
    }

    for (const li of localInv) {
      const match = map.get(li.id);
      if (!match) {
        map.set(li.id, li);
      } else {
        if (li.stock_quantity !== undefined) match.stock_quantity = li.stock_quantity;
        if (li.low_stock_threshold !== undefined) match.low_stock_threshold = li.low_stock_threshold;
        if (li.size) match.size = li.size;
        if (li.color) match.color = li.color;
      }
    }

    const merged = Array.from(map.values());
    for (const item of merged) {
      mockStorage.saveInventory(item);
    }
    return merged;
  },

  async updateInventory(id: string, updates: Partial<DbInventory>): Promise<DbInventory> {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.stock_quantity !== undefined) {
      updatePayload.stock_quantity = Math.max(0, updates.stock_quantity);
    }
    if (updates.low_stock_threshold !== undefined) {
      updatePayload.low_stock_threshold = Math.max(1, updates.low_stock_threshold);
    }
    if (updates.size !== undefined && updates.size.trim()) {
      updatePayload.size = updates.size.trim();
    }
    if (updates.color !== undefined && updates.color.trim()) {
      updatePayload.color = updates.color.trim();
    }

    let updated: DbInventory | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("inventory")
          .update(updatePayload)
          .eq("id", id);
        if (!error) {
          const { data } = await supabase
            .from("inventory")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          if (data) updated = data as DbInventory;
        } else {
          console.warn("Supabase updateInventory notice:", error.message);
        }
      } catch (e) {
        console.warn("Supabase updateInventory fallback:", e);
      }
    }

    const finalInv = updated || mockStorage.saveInventory({ ...updates, id });
    mockStorage.saveInventory(finalInv);
    return finalInv;
  },

  async saveInventoryVariant(variant: Partial<DbInventory>): Promise<DbInventory> {
    const payload = {
      product_id: variant.product_id,
      size: variant.size || "M",
      color: variant.color || "Default",
      stock_quantity: Math.max(0, variant.stock_quantity ?? 0),
      low_stock_threshold: Math.max(1, variant.low_stock_threshold ?? 5),
      updated_at: new Date().toISOString(),
    };

    let created: DbInventory | null = null;
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("inventory")
          .upsert(
            {
              id: variant.id,
              ...payload,
            },
            { onConflict: "product_id,size,color" }
          );
        if (!error) {
          const { data } = await supabase
            .from("inventory")
            .select("*")
            .eq("product_id", payload.product_id)
            .eq("size", payload.size)
            .eq("color", payload.color)
            .maybeSingle();
          if (data) created = data as DbInventory;
        } else {
          console.warn("Supabase saveInventoryVariant notice:", error.message);
        }
      } catch (e) {
        console.warn("Supabase saveInventoryVariant fallback:", e);
      }
    }

    const finalInv = created || mockStorage.saveInventory({ ...payload, ...variant });
    mockStorage.saveInventory(finalInv);
    return finalInv;
  },

  async deleteInventory(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("inventory").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase deleteInventory notice:", e);
      }
    }
    mockStorage.deleteInventory(id);
  },

  // ==========================================
  // ORDERS (WITHOUT PAYMENT)
  // ==========================================
  async getOrders(): Promise<DbOrder[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getOrders();
    }
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });
      if (error || !data) throw error;
      return data as DbOrder[];
    } catch (e) {
      console.warn("Supabase getOrders fallback to mock:", e);
      return mockStorage.getOrders();
    }
  },

  async createOrder(orderPayload: CreateOrderPayload): Promise<DbOrder> {
    if (!isSupabaseConfigured()) {
      return mockStorage.createOrder(orderPayload);
    }
    try {
      const orderNumber = `MM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: orderPayload.customer_id || null,
          order_number: orderNumber,
          subtotal: orderPayload.subtotal,
          shipping: orderPayload.shipping,
          total: orderPayload.total,
          customer_name: orderPayload.customer_name,
          customer_email: orderPayload.customer_email,
          customer_phone: orderPayload.customer_phone,
          shipping_address: orderPayload.shipping_address,
          order_status: orderPayload.order_status || "Pending",
        })
        .select()
        .single();

      if (orderError || !orderData) throw orderError;

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
          color: it.color,
          price: it.price,
          image_url: it.image_url,
        }));
        await supabase.from("order_items").insert(itemRows);
      }

      return { ...orderData, items: resolvedItems } as DbOrder;
    } catch (e) {
      console.warn("Supabase createOrder fallback to mock:", e);
      return mockStorage.createOrder(orderPayload);
    }
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<DbOrder | null> {
    if (!isSupabaseConfigured()) {
      return mockStorage.updateOrderStatus(id, status);
    }
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, items:order_items(*)")
        .single();
      if (error || !data) throw error;
      return data as DbOrder;
    } catch (e) {
      console.warn("Supabase updateOrderStatus fallback to mock:", e);
      return mockStorage.updateOrderStatus(id, status);
    }
  },

  async deleteOrder(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteOrder(id);
      return;
    }
    try {
      await supabase.from("order_items").delete().eq("order_id", id);
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase deleteOrder fallback to mock:", e);
      mockStorage.deleteOrder(id);
    }
  },

  // ==========================================
  // CUSTOMERS
  // ==========================================
  async getCustomers(): Promise<DbCustomer[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getCustomers();
    }
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data) throw error;

      // Auto-correct any customer who was erroneously marked as admin
      const fixedData = (data as DbCustomer[]).map((c) => {
        if (c.email.toLowerCase() === "divyanshiasp1290@gmail.com" && c.role === "admin") {
          supabase.from("customers").update({ role: "customer" }).eq("id", c.id).then();
          return { ...c, role: "customer" as const };
        }
        return c;
      });

      return fixedData;
    } catch (e) {
      console.warn("Supabase getCustomers fallback to mock:", e);
      return mockStorage.getCustomers();
    }
  },

  async updateCustomerRole(id: string, role: "admin" | "customer"): Promise<DbCustomer | null> {
    if (!isSupabaseConfigured()) {
      return mockStorage.updateCustomerRole(id, role);
    }
    try {
      const { data, error } = await supabase
        .from("customers")
        .update({ role })
        .eq("id", id)
        .select()
        .single();
      if (error || !data) throw error;
      return data as DbCustomer;
    } catch (e) {
      console.warn("Supabase updateCustomerRole fallback to mock:", e);
      return mockStorage.updateCustomerRole(id, role);
    }
  },

  async toggleCustomerStatus(id: string): Promise<DbCustomer | null> {
    if (!isSupabaseConfigured()) {
      return mockStorage.toggleCustomerStatus(id);
    }
    try {
      const customers = await this.getCustomers();
      const target = customers.find((c) => c.id === id);
      if (!target) return null;

      const nextStatus = target.status === "active" ? "disabled" : "active";
      const { data, error } = await supabase
        .from("customers")
        .update({ status: nextStatus })
        .eq("id", id)
        .select()
        .single();
      if (error || !data) throw error;
      return data as DbCustomer;
    } catch (e) {
      console.warn("Supabase toggleCustomerStatus fallback to mock:", e);
      return mockStorage.toggleCustomerStatus(id);
    }
  },

  // ==========================================
  // CONTACT MESSAGES
  // ==========================================
  async getContactMessages(): Promise<DbContactMessage[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getContactMessages();
    }
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data) throw error;
      return data as DbContactMessage[];
    } catch (e) {
      console.warn("Supabase getContactMessages fallback to mock:", e);
      return mockStorage.getContactMessages();
    }
  },

  async createContactMessage(msg: Omit<DbContactMessage, "id" | "created_at" | "status">): Promise<DbContactMessage> {
    if (!isSupabaseConfigured()) {
      return mockStorage.createContactMessage(msg);
    }
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .insert({
          name: msg.name,
          email: msg.email,
          phone: msg.phone,
          message: msg.message,
          status: "unread",
        })
        .select()
        .single();
      if (error || !data) throw error;
      return data as DbContactMessage;
    } catch (e) {
      console.warn("Supabase createContactMessage fallback to mock:", e);
      return mockStorage.createContactMessage(msg);
    }
  },

  async updateContactStatus(id: string, status: DbContactMessage["status"]): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.updateContactStatus(id, status);
      return;
    }
    try {
      await supabase
        .from("contact_messages")
        .update({ status })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase updateContactStatus fallback to mock:", e);
      mockStorage.updateContactStatus(id, status);
    }
  },

  async deleteContactMessage(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteContactMessage(id);
      return;
    }
    try {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.warn("Supabase deleteContactMessage fallback to mock:", e);
      mockStorage.deleteContactMessage(id);
    }
  },

  // ==========================================
  // NEWSLETTER
  // ==========================================
  async getNewsletterSubscribers(): Promise<DbNewsletterSubscriber[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getNewsletterSubscribers();
    }
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      if (error || !data) throw error;
      return data as DbNewsletterSubscriber[];
    } catch (e) {
      console.warn("Supabase getNewsletterSubscribers fallback to mock:", e);
      return mockStorage.getNewsletterSubscribers();
    }
  },

  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return mockStorage.addNewsletterSubscriber(email);
    }
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase(), status: "active" });

      if (error) {
        if (error.code === "23505") {
          return { success: false, message: "Client is already subscribed to Maison Makeeva private dispatches." };
        }
        throw error;
      }
      return { success: true, message: "Registered for Maison Makeeva private dispatches." };
    } catch (e) {
      console.warn("Supabase subscribeNewsletter fallback to mock:", e);
      return mockStorage.addNewsletterSubscriber(email);
    }
  },

  async toggleNewsletterStatus(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.toggleNewsletterStatus(id);
      return;
    }
    try {
      const subscribers = await this.getNewsletterSubscribers();
      const target = subscribers.find((s) => s.id === id);
      if (!target) return;
      const nextStatus = target.status === "active" ? "unsubscribed" : "active";
      await supabase
        .from("newsletter_subscribers")
        .update({ status: nextStatus })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase toggleNewsletterStatus fallback to mock:", e);
      mockStorage.toggleNewsletterStatus(id);
    }
  },

  // ==========================================
  // DASHBOARD STATS
  // ==========================================
  async getDashboardStats(): Promise<DashboardStats> {
    const [products, orders, customers, inventory, messages] = await Promise.all([
      this.getProducts(),
      this.getOrders(),
      this.getCustomers(),
      this.getInventory(),
      this.getContactMessages(),
    ]);

    const activeProducts = products.filter((p) => p.status === "active").length;
    const lowStockCount = inventory.filter((i) => i.stock_quantity <= i.low_stock_threshold).length;
    const pendingOrders = orders.filter((o) => o.order_status === "Pending").length;
    const totalRevenue = orders
      .filter((o) => o.order_status !== "Cancelled")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return {
      totalProducts: products.length,
      activeProducts,
      lowStockCount,
      totalCustomers: customers.length,
      totalOrders: orders.length,
      pendingOrders,
      totalRevenue,
      recentOrders: orders.slice(0, 5),
      recentMessages: messages.slice(0, 5),
    };
  },

  // ==========================================
  // IMAGE UPLOAD (STORAGE)
  // ==========================================
  async uploadImage(file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      // In mock mode, create a browser blob URL or base64 data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (e) {
      console.warn("Supabase storage upload fallback to local URL:", e);
      return URL.createObjectURL(file);
    }
  },
};
