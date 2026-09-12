import {
  Calendar,
  ChevronRight,
  Eye,
  Filter,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import type { DbOrder, OrderStatus } from "../../types/database";
import { formatMoney } from "../../utils";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; orderNumber: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await api.getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = api.subscribe(["orders", "order_items"], () => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const updated = await api.updateOrderStatus(orderId, status);
    if (updated && selectedOrder?.id === orderId) {
      setSelectedOrder(updated);
    }
    loadData();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteOrder(deleteTarget.id);
      if (selectedOrder?.id === deleteTarget.id) {
        setSelectedOrder(null);
      }
      setDeleteTarget(null);
      loadData();
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || o.order_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "border-amber-200 text-amber-800 bg-amber-50";
      case "Confirmed":
        return "border-blue-200 text-blue-800 bg-blue-50";
      case "Processing":
        return "border-purple-200 text-purple-800 bg-purple-50";
      case "Shipped":
        return "border-sky-200 text-sky-800 bg-sky-50";
      case "Delivered":
        return "border-emerald-200 text-emerald-800 bg-emerald-50";
      case "Cancelled":
        return "border-rose-200 text-rose-800 bg-rose-50";
      default:
        return "border-gray-200 text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Cashless Studio Ledger
          </span>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink font-bold">
            Order Management ({orders.length} orders)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 uppercase border border-gray-200 px-3 py-1.5 bg-gray-50 font-semibold shadow-2xs">
            Total Volume: {formatMoney(orders.reduce((sum, o) => sum + Number(o.total || 0), 0))}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 border border-gray-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number (e.g. MM-2026-8801), client name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 pl-9 pr-3 py-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 text-xs transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-300 px-3 py-2 text-ink outline-none focus:border-ink uppercase text-xs transition"
        >
          <option value="all">All Order Statuses</option>
          {["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Orders List Table */}
      <div className="border border-gray-200 bg-white overflow-x-auto shadow-xs">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px]">
              <th className="p-4">Order Ref</th>
              <th className="p-4">Client</th>
              <th className="p-4">Date</th>
              <th className="p-4">Items & Details</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/60 transition align-top">
                <td className="p-4 font-bold text-ink tracking-wider whitespace-nowrap">
                  {order.order_number}
                </td>
                <td className="p-4 min-w-[170px]">
                  <p className="text-ink font-bold">{order.customer_name}</p>
                  <p className="text-[10px] text-gray-500">{order.customer_email}</p>
                  {order.customer_phone && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{order.customer_phone}</p>
                  )}
                  {order.shipping_address?.city && (
                    <p className="text-[10px] text-gray-400">
                      {order.shipping_address.city}, {order.shipping_address.country}
                    </p>
                  )}
                </td>
                <td className="p-4 text-gray-600 whitespace-nowrap">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 min-w-[280px]">
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center gap-3 bg-gray-50/80 p-2 border border-gray-200 rounded-xs"
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="h-12 w-10 object-cover bg-white border border-gray-200 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="h-12 w-10 bg-white border border-gray-200 flex items-center justify-center shrink-0">
                              <Package size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-ink text-xs truncate" title={item.product_name}>
                              {item.product_name}
                            </p>
                            <div className="text-[10px] text-gray-500 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                              <span>Size: <strong className="text-gray-800">{item.size}</strong></span>
                              {item.color && item.color !== "Default" && (
                                <span>Color: <strong className="text-gray-800">{item.color}</strong></span>
                              )}
                              <span>Qty: <strong className="text-gray-800">{item.quantity}</strong></span>
                              <span>Price: <strong className="text-gray-800">{formatMoney(item.price)}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No items recorded</span>
                  )}
                </td>
                <td className="p-4 font-bold text-ink whitespace-nowrap">
                  {formatMoney(order.total)}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <select
                    value={order.order_status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className={`text-[10px] px-2 py-1 uppercase font-bold border outline-none cursor-pointer ${getStatusBadgeClass(
                      order.order_status
                    )}`}
                  >
                    {["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                      <option key={s} value={s} className="bg-white text-ink">{s}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-[84px] py-1.5 px-2 text-gray-600 hover:text-ink hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition inline-flex items-center justify-center gap-1.5 uppercase text-[11px] font-semibold bg-white shadow-2xs cursor-pointer"
                      title="Inspect Dossier"
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: order.id, orderNumber: order.order_number })}
                      className="w-[84px] py-1.5 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition inline-flex items-center justify-center gap-1.5 uppercase text-[11px] font-bold bg-white shadow-2xs cursor-pointer"
                      title="Delete Order"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAILS SLIDE-OVER DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-xl h-full bg-white border-l border-gray-200 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl text-ink">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                    Order Dossier
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink mt-0.5 font-bold">
                    {selectedOrder.order_number}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-gray-400 hover:text-ink transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Selector */}
              <div className="border border-gray-200 bg-gray-50/60 p-4 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-medium">Current Studio Status</span>
                  <p className="text-ink font-bold uppercase mt-0.5">{selectedOrder.order_status}</p>
                </div>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className="bg-white border border-gray-300 text-ink text-xs px-3 py-1.5 uppercase font-bold outline-none cursor-pointer focus:border-ink transition"
                >
                  {["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                    <option key={s} value={s} className="bg-white text-ink">{s}</option>
                  ))}
                </select>
              </div>

              {/* Client & Destination Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 bg-gray-50/50 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-500 uppercase text-[10px] font-bold">
                    <User size={12} /> Client Identity
                  </div>
                  <p className="font-bold text-ink text-xs">{selectedOrder.customer_name}</p>
                  <p className="text-gray-600 text-[11px]">{selectedOrder.customer_email}</p>
                  <p className="text-gray-500 text-[11px]">{selectedOrder.customer_phone || "No telephone provided"}</p>
                </div>

                <div className="border border-gray-200 bg-gray-50/50 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-500 uppercase text-[10px] font-bold">
                    <MapPin size={12} /> Courier Coordinates
                  </div>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {selectedOrder.shipping_address.address}<br />
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postal_code}<br />
                    {selectedOrder.shipping_address.country}
                  </p>
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="uppercase text-[11px] text-gray-500 font-bold tracking-wider">
                    Ordered Silhouettes ({selectedOrder.items?.length || 0})
                  </p>
                  <span className="text-[10px] uppercase font-semibold text-gray-400">
                    Client Specifications & Images
                  </span>
                </div>
                <div className="border border-gray-200 divide-y divide-gray-100 bg-white shadow-2xs">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="h-16 w-14 object-cover bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="h-16 w-14 bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            <Package size={18} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-ink text-xs sm:text-sm leading-snug">{item.product_name}</p>
                          <div className="text-[11px] text-gray-500 mt-1 space-y-0.5">
                            <p>
                              Proportion: <strong className="text-gray-800 font-semibold">{item.size}</strong> · Hue: <strong className="text-gray-800 font-semibold">{item.color || "Default"}</strong>
                            </p>
                            <p>
                              Quantity: <strong className="text-gray-800 font-semibold">{item.quantity}</strong> × {formatMoney(item.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-ink shrink-0 text-sm">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Ledger Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Value</span>
                  <span className="font-medium text-ink">{formatMoney(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Courier & Studio Transit</span>
                  <span className="text-gray-700">Complimentary</span>
                </div>
                <div className="flex justify-between font-bold text-ink text-sm pt-2 border-t border-gray-200">
                  <span>Total Payable Value</span>
                  <span className="text-ink">{formatMoney(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setDeleteTarget({ id: selectedOrder.id, orderNumber: selectedOrder.order_number })}
                className="border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 uppercase font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Order</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-6 py-2 uppercase font-bold text-gray-800 transition text-xs shadow-2xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Studio Order"
        message="Are you sure you want to delete this order record and all associated silhouette line items? This action cannot be undone."
        itemName={deleteTarget ? `Order Reference: ${deleteTarget.orderNumber}` : undefined}
        confirmLabel="Delete Order"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};
