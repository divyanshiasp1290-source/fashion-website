export type DbCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  description?: string | null;
  status: "active" | "inactive";
  created_at?: string;
  subcategories?: DbCategory[];
};

export type DbCollection = {
  id: string;
  name: string;
  slug: string;
  season?: string | null;
  description?: string | null;
  image?: string | null;
  status: "active" | "inactive";
  created_at?: string;
};

export type DbProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  alt_text?: string | null;
};

export type DbInventory = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock_quantity: number;
  low_stock_threshold: number;
  updated_at?: string;
};

export type DbProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description?: string | null;
  story?: string | null;
  price: number;
  compare_at_price?: number | null;
  gender: string;
  category_id?: string | null;
  subcategory_id?: string | null;
  collection_id?: string | null;
  badge?: string | null;
  materials: string[];
  tags: string[];
  featured: boolean;
  new_arrival: boolean;
  status: "active" | "inactive" | "draft";
  created_at?: string;
  updated_at?: string;
  // Joined / aggregated relations
  images?: DbProductImage[];
  inventory?: DbInventory[];
  category?: DbCategory;
  subcategory?: DbCategory;
  collection?: DbCollection;
};

export type DbCustomer = {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  role: "admin" | "customer";
  status: "active" | "disabled";
  created_at?: string;
};

export type DbAddress = {
  id: string;
  customer_id: string;
  name: string;
  phone?: string | null;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at?: string;
};

export type DbWishlistItem = {
  id: string;
  customer_id: string;
  product_id: string;
  created_at?: string;
  product?: DbProduct;
};

export type DbCartItem = {
  id: string;
  customer_id?: string | null;
  session_id?: string | null;
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  created_at?: string;
  product?: DbProduct;
};

export type OrderStatus = "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  size: string;
  color?: string | null;
  price: number;
  image_url?: string | null;
};

export type DbOrderItemInput = {
  id?: string;
  order_id?: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  size: string;
  color?: string | null;
  price: number;
  image_url?: string | null;
};

export type DbOrder = {
  id: string;
  customer_id?: string | null;
  order_number: string;
  subtotal: number;
  shipping: number;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  order_status: OrderStatus;
  created_at: string;
  updated_at?: string;
  items?: DbOrderItem[];
};

export type CreateOrderPayload = Omit<DbOrder, "id" | "order_number" | "created_at" | "items"> & {
  items?: DbOrderItemInput[];
};

export type DbContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: "unread" | "read" | "resolved";
  created_at: string;
};

export type DbNewsletterSubscriber = {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  subscribed_at: string;
};

export type DashboardStats = {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: DbOrder[];
  recentMessages: DbContactMessage[];
};
