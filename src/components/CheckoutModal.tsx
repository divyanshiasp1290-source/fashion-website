import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, PackageCheck, ShieldCheck, X } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { MaisonMakeevaLogo } from "./MaisonMakeevaLogo";
import type { DbOrder } from "../types/database";
import { formatMoney } from "../utils";

type CartItemLike = {
  product: {
    id: string;
    title?: string;
    name?: string;
    price: number;
    images: string[];
  };
  size: string;
  qty: number;
};

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  cart: CartItemLike[];
  onOrderSuccess: (order: DbOrder) => void;
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  onClose,
  cart,
  onOrderSuccess,
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<DbOrder | null>(null);

  const [formData, setFormData] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postal_code: "",
    country: "France",
  });

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = 0; // Complimentary atelier worldwide shipping
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address) return;

    setSubmitting(true);
    try {
      const orderItems = cart.map((it) => ({
        product_id: it.product.id,
        product_name: it.product.title || it.product.name || "Maison Makeeva Garment",
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
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          country: formData.country,
          phone: formData.phone,
        },
        order_status: "Pending",
        items: orderItems,
      });

      setConfirmedOrder(newOrder);
      onOrderSuccess(newOrder);
    } catch (err) {
      console.error("Order placement error:", err);
      alert("Failed to record order. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-ink/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl bg-bone border border-ink/20 shadow-2xl overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink/15 bg-ink p-4 sm:p-6 text-ivory">
              <div className="flex items-center gap-3">
                <MaisonMakeevaLogo className="h-8 w-auto text-chartreuse shrink-0" />
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-chartreuse font-semibold">
                    Maison Makeeva Atelier Order
                  </span>
                  <h3 className="font-display text-lg sm:text-2xl uppercase tracking-wider text-white">
                    {confirmedOrder ? "Order Confirmed" : "Direct Order Placement"}
                  </h3>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-ivory/70 hover:text-chartreuse transition"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-8 max-h-[80vh] overflow-y-auto">
              {confirmedOrder ? (
                <div className="text-center py-6 space-y-5">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chartreuse/20 text-chartreuse border border-chartreuse/40">
                    <PackageCheck size={32} />
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-taupe">
                      Order Record Reference
                    </span>
                    <h4 className="font-display text-2xl sm:text-3xl uppercase font-bold text-ink mt-1">
                      {confirmedOrder.order_number}
                    </h4>
                    <p className="font-editorial text-base sm:text-lg text-graphite/90 mt-2 max-w-md mx-auto">
                      Thank you, {confirmedOrder.customer_name}. Your atelier order has been recorded into our production ledger with status:
                      <span className="font-mono font-bold text-ink ml-1 uppercase">[{confirmedOrder.order_status}]</span>.
                    </p>
                  </div>

                  <div className="bg-ivory border border-ink/15 p-4 text-left font-mono text-xs space-y-2 max-w-md mx-auto">
                    <p className="text-taupe uppercase tracking-wider font-semibold border-b border-ink/10 pb-1">
                      Dispatch Coordinates:
                    </p>
                    <p className="text-ink">{confirmedOrder.shipping_address.address}, {confirmedOrder.shipping_address.city} {confirmedOrder.shipping_address.postal_code}</p>
                    <p className="text-ink">{confirmedOrder.shipping_address.country} · {confirmedOrder.customer_email}</p>
                    <div className="pt-2 border-t border-ink/10 flex justify-between font-bold text-ink">
                      <span>Total Value</span>
                      <span>{formatMoney(confirmedOrder.total)}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleClose}
                      className="bg-ink px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-ivory hover:bg-chartreuse hover:text-ink transition font-semibold"
                    >
                      Return to Archive Catalog
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Notice of Cashless Process */}
                  <div className="flex items-start gap-3 bg-parchment p-3.5 border border-ink/15">
                    <ShieldCheck size={18} className="text-chartreuse shrink-0 mt-0.5" />
                    <p className="font-mono text-xs text-graphite leading-relaxed">
                      <span className="font-bold text-ink uppercase">Zero Online Payment Gateway:</span> Orders are registered directly into our studio database. Invoicing or bespoke collection details are dispatched directly to your contact email.
                    </p>
                  </div>

                  {/* Summary of Items */}
                  <div className="border border-ink/15 bg-ivory p-4 space-y-2.5">
                    <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe font-semibold">
                      Selected Silhouette Bag ({cart.reduce((s, i) => s + i.qty, 0)} Items)
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-2 pr-1 divide-y divide-ink/10">
                      {cart.map((item, idx) => (
                        <div key={idx} className="pt-2 flex items-center justify-between font-mono text-xs">
                          <span className="truncate max-w-[280px]">
                            {item.product.title || item.product.name} ({item.size}) × {item.qty}
                          </span>
                          <span className="font-semibold text-ink">
                            {formatMoney(item.product.price * item.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-ink/20 pt-2 flex justify-between font-mono text-xs font-bold text-ink">
                      <span>Total Atelier Value</span>
                      <span className="text-sm">{formatMoney(total)}</span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-3">
                    <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe font-semibold">
                      1. Client Contact
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        required
                        type="text"
                        placeholder="Full Name *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border-b border-ink/30 bg-transparent py-2 font-mono text-xs outline-none focus:border-ink"
                      />
                      <input
                        required
                        type="email"
                        placeholder="Client Email Address *"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border-b border-ink/30 bg-transparent py-2 font-mono text-xs outline-none focus:border-ink"
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="Telephone (with country code)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border-b border-ink/30 bg-transparent py-2 font-mono text-xs outline-none focus:border-ink"
                    />
                  </div>

                  {/* Shipping Coordinates */}
                  <div className="space-y-3">
                    <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe font-semibold">
                      2. Courier Destination Coordinates
                    </p>
                    <input
                      required
                      type="text"
                      placeholder="Street Address, Studio or Suite *"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border-b border-ink/30 bg-transparent py-2 font-mono text-xs outline-none focus:border-ink"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        required
                        type="text"
                        placeholder="City *"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border-b border-ink/30 bg-transparent py-2 font-mono text-xs outline-none focus:border-ink"
                      />
                      <input
                        required
                        type="text"
                        placeholder="Postal Code *"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        className="w-full border-b border-ink/30 bg-transparent py-2 font-mono text-xs outline-none focus:border-ink"
                      />
                      <input
                        required
                        type="text"
                        placeholder="Country *"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full border-b border-ink/30 bg-transparent py-2 font-mono text-xs outline-none focus:border-ink"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-ink/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="font-mono text-xs uppercase tracking-wider text-taupe hover:text-ink transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto bg-chartreuse px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] font-bold text-ink hover:bg-white transition flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
                    >
                      {submitting ? (
                        <span>Registering Order...</span>
                      ) : (
                        <>
                          <span>Place Atelier Order ({formatMoney(total)})</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
