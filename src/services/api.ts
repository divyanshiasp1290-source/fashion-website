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

      if (error || !data) throw error;
      return data as DbProduct[];
    } catch (e) {
      console.warn("Supabase getProducts fallback to mock:", e);
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

      return data as DbProduct;
    } catch (e) {
      console.warn("Supabase createProduct fallback to mock:", e);
      return mockStorage.saveProduct(product);
    }
  },

  async updateProduct(id: string, product: Partial<DbProduct>, images?: string[]): Promise<DbProduct> {
    if (!isSupabaseConfigured()) {
      return mockStorage.saveProduct({ ...product, id });
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          short_description: product.short_description,
          story: product.story,
          price: product.price,
          compare_at_price: product.compare_at_price,
          gender: product.gender,
          category_id: product.category_id,
          subcategory_id: product.subcategory_id,
          collection_id: product.collection_id,
          badge: product.badge,
          materials: product.materials,
          tags: product.tags,
          featured: product.featured,
          new_arrival: product.new_arrival,
          status: product.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) throw error;

      if (images) {
        await supabase.from("product_images").delete().eq("product_id", id);
        if (images.length > 0) {
          const imageRows = images.map((imgUrl, idx) => ({
            product_id: id,
            image_url: imgUrl,
            sort_order: idx,
            alt_text: product.name,
          }));
          await supabase.from("product_images").insert(imageRows);
        }
      }

      return data as DbProduct;
    } catch (e) {
      console.warn("Supabase updateProduct fallback to mock:", e);
      return mockStorage.saveProduct({ ...product, id });
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
      mockStorage.deleteProduct(id);
    }
  },

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(): Promise<DbCategory[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getCategories();
    }
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error || !data) throw error;
      return data as DbCategory[];
    } catch (e) {
      console.warn("Supabase getCategories fallback to mock:", e);
      return mockStorage.getCategories();
    }
  },

  async createCategory(cat: Partial<DbCategory>): Promise<DbCategory> {
    if (!isSupabaseConfigured()) {
      return mockStorage.saveCategory(cat);
    }
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: cat.name,
          slug: cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          parent_id: cat.parent_id || null,
          sort_order: cat.sort_order || 0,
          description: cat.description,
          status: cat.status || "active",
        })
        .select()
        .single();
      if (error || !data) throw error;
      return data as DbCategory;
    } catch (e) {
      console.warn("Supabase createCategory fallback to mock:", e);
      return mockStorage.saveCategory(cat);
    }
  },

  async updateCategory(id: string, cat: Partial<DbCategory>): Promise<DbCategory> {
    if (!isSupabaseConfigured()) {
      return mockStorage.saveCategory({ ...cat, id });
    }
    try {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: cat.name,
          slug: cat.slug,
          parent_id: cat.parent_id,
          sort_order: cat.sort_order,
          description: cat.description,
          status: cat.status,
        })
        .eq("id", id)
        .select()
        .single();
      if (error || !data) throw error;
      return data as DbCategory;
    } catch (e) {
      console.warn("Supabase updateCategory fallback to mock:", e);
      return mockStorage.saveCategory({ ...cat, id });
    }
  },

  async deleteCategory(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteCategory(id);
      return;
    }
    try {
      await supabase.from("categories").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase deleteCategory fallback to mock:", e);
      mockStorage.deleteCategory(id);
    }
  },

  // ==========================================
  // COLLECTIONS
  // ==========================================
  async getCollections(): Promise<DbCollection[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getCollections();
    }
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data) throw error;
      return data as DbCollection[];
    } catch (e) {
      console.warn("Supabase getCollections fallback to mock:", e);
      return mockStorage.getCollections();
    }
  },

  async createCollection(col: Partial<DbCollection>): Promise<DbCollection> {
    if (!isSupabaseConfigured()) {
      return mockStorage.saveCollection(col);
    }
    try {
      const { data, error } = await supabase
        .from("collections")
        .insert({
          name: col.name,
          slug: col.slug || col.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          season: col.season,
          description: col.description,
          image: col.image,
          status: col.status || "active",
        })
        .select()
        .single();
      if (error || !data) throw error;
      return data as DbCollection;
    } catch (e) {
      console.warn("Supabase createCollection fallback to mock:", e);
      return mockStorage.saveCollection(col);
    }
  },

  async updateCollection(id: string, col: Partial<DbCollection>): Promise<DbCollection> {
    if (!isSupabaseConfigured()) {
      return mockStorage.saveCollection({ ...col, id });
    }
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
      if (error || !data) throw error;
      return data as DbCollection;
    } catch (e) {
      console.warn("Supabase updateCollection fallback to mock:", e);
      return mockStorage.saveCollection({ ...col, id });
    }
  },

  async deleteCollection(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteCollection(id);
      return;
    }
    try {
      await supabase.from("collections").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase deleteCollection fallback to mock:", e);
      mockStorage.deleteCollection(id);
    }
  },

  // ==========================================
  // INVENTORY
  // ==========================================
  async getInventory(): Promise<DbInventory[]> {
    if (!isSupabaseConfigured()) {
      return mockStorage.getInventory();
    }
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error || !data) throw error;
      return data as DbInventory[];
    } catch (e) {
      console.warn("Supabase getInventory fallback to mock:", e);
      return mockStorage.getInventory();
    }
  },

  async updateInventory(id: string, updates: Partial<DbInventory>): Promise<DbInventory> {
    if (!isSupabaseConfigured()) {
      return mockStorage.saveInventory({ ...updates, id });
    }
    try {
      const { data, error } = await supabase
        .from("inventory")
        .update({
          stock_quantity: Math.max(0, updates.stock_quantity ?? 0),
          low_stock_threshold: updates.low_stock_threshold,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error || !data) throw error;
      return data as DbInventory;
    } catch (e) {
      console.warn("Supabase updateInventory fallback to mock:", e);
      return mockStorage.saveInventory({ ...updates, id });
    }
  },

  async saveInventoryVariant(variant: Partial<DbInventory>): Promise<DbInventory> {
    if (!isSupabaseConfigured()) {
      return mockStorage.saveInventory(variant);
    }
    try {
      const { data, error } = await supabase
        .from("inventory")
        .upsert(
          {
            id: variant.id,
            product_id: variant.product_id,
            size: variant.size,
            color: variant.color || "Default",
            stock_quantity: Math.max(0, variant.stock_quantity ?? 0),
            low_stock_threshold: variant.low_stock_threshold ?? 5,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "product_id,size,color" }
        )
        .select()
        .single();
      if (error || !data) throw error;
      return data as DbInventory;
    } catch (e) {
      console.warn("Supabase saveInventoryVariant fallback to mock:", e);
      return mockStorage.saveInventory(variant);
    }
  },

  async deleteInventory(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      mockStorage.deleteInventory(id);
      return;
    }
    try {
      await supabase.from("inventory").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase deleteInventory fallback to mock:", e);
      mockStorage.deleteInventory(id);
    }
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
      return data as DbCustomer[];
    } catch (e) {
      console.warn("Supabase getCustomers fallback to mock:", e);
      return mockStorage.getCustomers();
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
