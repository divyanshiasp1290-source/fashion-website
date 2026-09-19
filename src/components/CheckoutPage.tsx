import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { MaisonMakeevaLogo } from "./MaisonMakeevaLogo";
import type { DbOrder } from "../types/database";
import type { Product } from "../data/catalog";
import { formatMoney } from "../utils";

type CartItem = {
  product: Product;
  size: string;
  qty: number;
};

type CheckoutPageProps = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  go: (page: any, product?: Product) => void;
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  setCart,
  go,
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<DbOrder | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postal_code: "",
    country: "France",
    notes: "",
  });

  // Keep contact info in sync if user loads after mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.full_name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = 0; // Complimentary atelier worldwide shipping
  const total = subtotal + shipping;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address) return;

    setSubmitting(true);
    try {
      const orderItems = cart.map((it) => ({
        product_id: it.product.id,
        product_name: it.product.title || "Maison Makeeva Silhouette",
        quantity: it.qty,
        size: it.size,
        color: "Default",
        price: it.product.price,
        image_url: it.product.images[0] || "",
      }));

      const newOrder = await api.createOrder({
        customer_id: user?.id || null,
        subtotal,
        shipping,
        total,
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim().toLowerCase(),
        customer_phone: formData.phone.trim() || null,
        shipping_address: {
          name: formData.name.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postal_code: formData.postal_code.trim(),
          country: formData.country.trim(),
          phone: formData.phone.trim(),
        },
        order_status: "Pending",
        items: orderItems,
      });

      setConfirmedOrder(newOrder);
      setCart([]);
      try {
        localStorage.removeItem("mm_cart");
      } catch {}

      // Broadcast storage and custom event so account & admin update immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("client-orders-updated"));
      }
    } catch (err) {
      console.error("Order placement error:", err);
      alert("Failed to record order in atelier ledger. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyOrderRef = () => {
    if (!confirmedOrder?.order_number) return;
    navigator.clipboard.writeText(confirmedOrder.order_number);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <section className="relative z-10 min-h-screen px-4 pb-20 pt-24 sm:px-10 sm:pb-24 sm:pt-32 lg:px-16 max-w-[1700px] mx-auto">
      {/* Confirmed Order State */}
      {confirmedOrder ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header Banner */}
          <div className="border border-ink/20 bg-ivory p-6 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 opacity-5 pointer-events-none">
              <MaisonMakeevaLogo className="w-64 h-64 text-ink" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/15 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center bg-chartreuse/25 text-chartreuse border border-chartreuse/50 shrink-0">
                  <PackageCheck size={28} />
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.24em] text-taupe font-semibold">
                    Atelier Production Ledger
                  </span>
                  <h1 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink mt-0.5">
                    Order Recorded Successfully
                  </h1>
                </div>
              </div>

              <span className="font-mono text-xs bg-ink text-ivory px-3 py-1.5 uppercase font-semibold tracking-wider">
                Status: {confirmedOrder.order_status}
              </span>
            </div>

            {/* Reference info */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bone/70 border border-ink/10 p-4">
              <div>
                <p className="font-mono text-xs text-taupe uppercase tracking-widest">
                  Official Order Reference Number
                </p>
                <p className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-ink mt-0.5 select-all">
                  {confirmedOrder.order_number}
                </p>
              </div>
              <button
                onClick={copyOrderRef}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-3.5 py-2 border border-ink/20 hover:bg-ink hover:text-ivory transition cursor-pointer self-start sm:self-auto"
              >
                {copiedRef ? (
                  <>
                    <Check size={14} className="text-chartreuse" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Reference</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-6 font-editorial text-base sm:text-lg text-graphite leading-relaxed">
              Thank you, <strong className="text-ink">{confirmedOrder.customer_name}</strong>. Your bespoke order has been successfully placed with our atelier.
            </p>

            {/* Order Specification Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-ink/15 font-mono text-xs">
              <div className="space-y-3 bg-white/60 p-4 border border-ink/10">
                <p className="font-bold uppercase tracking-wider text-taupe border-b border-ink/10 pb-2">
                  Client Coordinates
                </p>
                <p className="text-ink font-semibold">{confirmedOrder.customer_name}</p>
                <p className="text-graphite">{confirmedOrder.customer_email}</p>
                {confirmedOrder.customer_phone && (
                  <p className="text-graphite">{confirmedOrder.customer_phone}</p>
                )}
              </div>

              <div className="space-y-3 bg-white/60 p-4 border border-ink/10">
                <p className="font-bold uppercase tracking-wider text-taupe border-b border-ink/10 pb-2">
                  Courier Dispatch Destination
                </p>
                <p className="text-ink">{confirmedOrder.shipping_address?.address}</p>
                <p className="text-graphite">
                  {confirmedOrder.shipping_address?.city}, {confirmedOrder.shipping_address?.postal_code}
                </p>
                <p className="text-graphite uppercase font-semibold">{confirmedOrder.shipping_address?.country}</p>
              </div>
            </div>

            {/* Items table */}
            {confirmedOrder.items && confirmedOrder.items.length > 0 && (
              <div className="mt-6 border border-ink/15 overflow-hidden">
                <div className="bg-ink px-4 py-2.5 text-ivory font-mono text-xs uppercase tracking-wider flex justify-between">
                  <span>Curated Pieces ({confirmedOrder.items.length})</span>
                  <span>Value</span>
                </div>
                <div className="divide-y divide-ink/10 bg-white/40">
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between font-mono text-xs gap-4">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-12 h-14 object-cover border border-ink/10 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-ink">{item.product_name}</p>
                          <p className="text-taupe text-[11px] mt-0.5">
                            Proportion: {item.size} · Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-ink shrink-0">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-bone/80 px-4 py-3 border-t border-ink/15 flex justify-between font-mono text-xs font-bold text-ink">
                  <span>Total Atelier Value</span>
                  <span className="text-sm">{formatMoney(confirmedOrder.total)}</span>
                </div>
              </div>
            )}

            {/* Navigational Next Steps */}
            <div className="mt-8 pt-6 border-t border-ink/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => go("account")}
                className="w-full sm:w-auto bg-ink px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-ivory hover:bg-chartreuse hover:text-ink transition font-semibold text-center cursor-pointer shadow-sm"
              >
                View in Client Portal →
              </button>
              <button
                onClick={() => go("collection")}
                className="w-full sm:w-auto border border-ink/30 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-ink hover:bg-white transition text-center cursor-pointer"
              >
                Explore SS26 Collection
              </button>
            </div>
          </div>
        </motion.div>
      ) : cart.length === 0 ? (
        /* Empty Cart State */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto text-center py-16 space-y-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink/5 border border-ink/15 text-taupe">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h2 className="font-display text-2xl uppercase font-bold text-ink">
              Your Curated Bag is Empty
            </h2>
            <p className="font-editorial text-base sm:text-lg text-graphite/90 mt-2">
              There are currently no silhouettes selected for checkout.
            </p>
          </div>
          <button
            onClick={() => go("collection")}
            className="bg-chartreuse px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] font-bold text-ink hover:bg-white transition cursor-pointer shadow-sm"
          >
            Discover SS26 Silhouettes
          </button>
        </motion.div>
      ) : (
        /* Active Checkout Form */
        <div>
          {/* Back link & Header */}
          <div className="mb-8 sm:mb-12">
            <button
              onClick={() => go("cart")}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-taupe hover:text-ink transition cursor-pointer mb-4"
            >
              <ArrowLeft size={14} />
              <span>Return to Bag</span>
            </button>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-taupe font-semibold">
              Direct Atelier Checkout
            </p>
            <h1 className="mt-2 sm:mt-3 font-display text-2xl xs:text-3xl uppercase leading-none sm:text-5xl lg:text-6xl text-ink">
              Atelier Order Placement
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 lg:gap-12 items-start">
            {/* Left Column: Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Direct Atelier Cashless Notice */}
              <div className="flex items-start gap-3.5 bg-parchment p-4 sm:p-5 border border-ink/15">
                <ShieldCheck size={20} className="text-chartreuse shrink-0 mt-0.5" />
                <div className="font-mono text-xs text-graphite leading-relaxed">
                  <span className="font-bold text-ink uppercase">Zero Online Payment Gateway:</span>{" "}
                  Orders are registered directly with our Paris atelier. Order confirmation
                  and complimentary insured courier scheduling are dispatched directly to your contact email.
                </div>
              </div>

              {/* Section 1: Client Contact */}
              <div className="bg-ivory p-6 sm:p-8 border border-ink/15 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <h3 className="font-mono text-xs uppercase tracking-wideLuxury text-ink font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-ink text-ivory text-[10px] flex items-center justify-center">1</span>
                    Client Identity & Contact
                  </h3>
                  {user ? (
                    <span className="font-mono text-[11px] bg-chartreuse/25 text-ink border border-chartreuse/40 px-2 py-0.5 uppercase">
                      Logged in as {user.email}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-taupe uppercase">
                      Guest Checkout
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-taupe">
                      Full Legal Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Divyanshi Singh"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-ink/20 bg-bone px-3.5 py-2.5 font-mono text-xs outline-none focus:border-ink transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-taupe">
                      Client Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="client@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-ink/20 bg-bone px-3.5 py-2.5 font-mono text-xs outline-none focus:border-ink transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-taupe">
                    Telephone (for courier dispatch notifications)
                  </label>
                  <input
                    type="tel"
                    placeholder="+33 1 42 68 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-ink/20 bg-bone px-3.5 py-2.5 font-mono text-xs outline-none focus:border-ink transition"
                  />
                </div>
              </div>

              {/* Section 2: Shipping Coordinates */}
              <div className="bg-ivory p-6 sm:p-8 border border-ink/15 shadow-sm space-y-5">
                <div className="border-b border-ink/10 pb-3">
                  <h3 className="font-mono text-xs uppercase tracking-wideLuxury text-ink font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-ink text-ivory text-[10px] flex items-center justify-center">2</span>
                    Courier Delivery Destination
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-taupe">
                    Street Address, Studio or Suite *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 14 Rue du Faubourg Saint-Honoré"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-ink/20 bg-bone px-3.5 py-2.5 font-mono text-xs outline-none focus:border-ink transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-taupe">
                      City *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Paris"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full border border-ink/20 bg-bone px-3.5 py-2.5 font-mono text-xs outline-none focus:border-ink transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-taupe">
                      Postal Code *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="75008"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full border border-ink/20 bg-bone px-3.5 py-2.5 font-mono text-xs outline-none focus:border-ink transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-taupe">
                      Country *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="France"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full border border-ink/20 bg-bone px-3.5 py-2.5 font-mono text-xs outline-none focus:border-ink transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-taupe">
                    Atelier Directives & Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Bespoke sizing specifications, private gate codes, or delivery notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-ink/20 bg-bone px-3.5 py-2.5 font-mono text-xs outline-none focus:border-ink transition resize-none"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => go("cart")}
                  className="font-mono text-xs uppercase tracking-wider text-taupe hover:text-ink transition cursor-pointer"
                >
                  ← Return to Curated Bag
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-chartreuse px-10 py-4 font-mono text-xs uppercase tracking-[0.2em] font-bold text-ink hover:bg-white hover:text-ink transition flex items-center justify-center gap-3 shadow-md min-h-[48px] cursor-pointer"
                >
                  {submitting ? (
                    <span>Registering Atelier Order...</span>
                  ) : (
                    <>
                      <span>Place Atelier Order ({formatMoney(total)})</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Right Column: Order Summary (Sticky) */}
            <aside className="lg:sticky lg:top-32 bg-ivory p-6 sm:p-8 border border-ink/15 shadow-sm space-y-6">
              <div className="border-b border-ink/15 pb-4">
                <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe font-semibold">
                  Order Summary
                </p>
                <h3 className="font-display text-lg uppercase font-bold text-ink mt-1">
                  Selected Silhouettes ({totalItemsCount})
                </h3>
              </div>

              {/* Items List */}
              <div className="max-h-[380px] overflow-y-auto space-y-4 pr-1 divide-y divide-ink/10">
                {cart.map((item, idx) => (
                  <div key={`${item.product.id}-${item.size}-${idx}`} className="pt-4 first:pt-0 flex items-center gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-20 object-cover border border-ink/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xs sm:text-sm uppercase text-ink truncate">
                        {item.product.title}
                      </p>
                      <p className="font-mono text-[11px] text-taupe uppercase mt-0.5">
                        Size: {item.size} · Qty: {item.qty}
                      </p>
                      <p className="font-mono text-xs font-semibold text-chartreuse mt-1">
                        {formatMoney(item.product.price * item.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-ink/15 pt-4 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between text-graphite">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-graphite">
                  <span>Worldwide Atelier Courier</span>
                  <span className="font-semibold text-chartreuse uppercase">Complimentary</span>
                </div>
                <div className="border-t border-ink/20 pt-3 flex justify-between font-bold text-ink text-sm">
                  <span>Total Atelier Value</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              <div className="border-t border-ink/10 pt-4 flex items-center gap-2.5 text-taupe font-mono text-[11px]">
                <ShieldCheck size={16} className="text-chartreuse shrink-0" />
                <span>Handcrafted Parisian atelier provenance verified.</span>
              </div>
            </aside>
          </div>
        </div>
      )}
    </section>
  );
};
