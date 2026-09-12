import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle,
  Clock,
  ExternalLink,
  Inbox,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { DashboardStats, DbOrder, OrderStatus } from "../../types/database";
import { formatMoney } from "../../utils";
import type { AdminSection } from "./AdminLayout";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

type AdminDashboardProps = {
  onNavigate: (section: AdminSection) => void;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ type: "order" | "message"; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    const data = await api.getDashboardStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickStatusChange = async (orderId: string, status: OrderStatus) => {
    await api.updateOrderStatus(orderId, status);
    fetchStats();
  };

  const handleQuickMessageRead = async (messageId: string) => {
    await api.updateContactStatus(messageId, "read");
    fetchStats();
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      if (deleteModal.type === "order") {
        await api.deleteOrder(deleteModal.id);
      } else {
        await api.deleteContactMessage(deleteModal.id);
      }
      setDeleteModal(null);
      fetchStats();
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center font-mono text-xs text-gray-400">
        Loading atelier telemetry...
      </div>
    );
  }

  const kpis = [
    { label: "Total Products", val: stats.totalProducts, sub: `${stats.activeProducts} Active Silhouettes`, icon: Package, link: "products" as AdminSection },
    { label: "Low Stock Items", val: stats.lowStockCount, sub: "Action Required", icon: AlertTriangle, color: stats.lowStockCount > 0 ? "text-amber-600" : "text-emerald-600", link: "inventory" as AdminSection },
    { label: "Total Orders", val: stats.totalOrders, sub: `${stats.pendingOrders} Pending Action`, icon: ShoppingBag, color: stats.pendingOrders > 0 ? "text-coral" : "text-ink", link: "orders" as AdminSection },
    { label: "Total Customers", val: stats.totalCustomers, sub: "Registered Accounts", icon: Users, link: "customers" as AdminSection },
    { label: "Recorded Value", val: formatMoney(stats.totalRevenue), sub: "Cashless Atelier Orders", icon: TrendingUp, link: "orders" as AdminSection },
  ];

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-coral font-semibold">
            Live Atelier Telemetry
          </span>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink font-bold">
            Operational Overview
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate("products")}
            className="flex items-center gap-1.5 bg-ink px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-white font-bold hover:bg-gray-800 transition shadow-sm"
          >
            <Plus size={14} /> Add Product
          </button>
          <button
            onClick={() => onNavigate("orders")}
            className="flex items-center gap-1.5 border border-gray-300 bg-white px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:bg-gray-100 transition"
          >
            <ShoppingBag size={14} /> View Orders
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(kpi.link)}
              className="text-left border border-gray-200 bg-white p-5 hover:border-ink hover:shadow-md transition group shadow-sm"
            >
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider font-medium">{kpi.label}</span>
                <Icon size={16} className={kpi.color || "text-ink"} />
              </div>
              <div className={`font-display text-2xl uppercase font-bold text-ink group-hover:text-coral transition ${kpi.color || ""}`}>
                {kpi.val}
              </div>
              <p className="font-mono text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                {kpi.sub}
              </p>
            </button>
          );
        })}
      </div>

      {/* Two Column Section: Recent Orders & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Recent Orders */}
        <div className="border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-coral" />
              <h3 className="font-display text-base uppercase tracking-wider text-ink font-bold">
                Recent Orders ({stats.recentOrders.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate("orders")}
              className="font-mono text-xs uppercase tracking-wider text-coral hover:underline flex items-center gap-1 font-semibold"
            >
              All Orders <ArrowRight size={12} />
            </button>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="font-mono text-xs text-gray-400 py-8 text-center">No orders recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-100 bg-[#fbfaf8] hover:bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{order.order_number}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-700">{order.customer_name}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {order.items?.length || 0} item(s) · {formatMoney(order.total)} · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleQuickStatusChange(order.id, e.target.value as OrderStatus)}
                      className="bg-white border border-gray-300 text-xs px-2 py-1 text-ink uppercase outline-none focus:border-ink cursor-pointer"
                    >
                      {["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setDeleteModal({ type: "order", id: order.id, name: `Order ${order.order_number}` })}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition bg-white cursor-pointer"
                      title="Delete order"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Inbox size={16} className="text-coral" />
              <h3 className="font-display text-base uppercase tracking-wider text-ink font-bold">
                Contact Inquiries
              </h3>
            </div>
            <button
              onClick={() => onNavigate("messages")}
              className="font-mono text-xs uppercase tracking-wider text-coral hover:underline flex items-center gap-1 font-semibold"
            >
              All Inquiries <ArrowRight size={12} />
            </button>
          </div>

          {stats.recentMessages.length === 0 ? (
            <p className="font-mono text-xs text-gray-400 py-8 text-center">No inquiry messages received.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="border border-gray-100 bg-[#fbfaf8] hover:bg-white p-3.5 font-mono text-xs space-y-2 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{msg.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 uppercase font-semibold border ${
                      msg.status === "unread"
                        ? "border-amber-300 bg-amber-50 text-amber-800"
                        : "border-gray-200 bg-gray-100 text-gray-600"
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-2 italic">
                    "{msg.message}"
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                    <span>{msg.email}</span>
                    <div className="flex items-center gap-2">
                      {msg.status === "unread" && (
                        <button
                          onClick={() => handleQuickMessageRead(msg.id)}
                          className="text-coral hover:underline uppercase font-bold"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteModal({ type: "message", id: msg.id, name: `Inquiry from ${msg.name}` })}
                        className="text-rose-500 hover:text-rose-700 hover:underline uppercase font-bold flex items-center gap-0.5 cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteModal)}
        title={deleteModal?.type === "order" ? "Delete Order Record" : "Delete Inquiry"}
        message={
          deleteModal?.type === "order"
            ? "Are you sure you want to permanently delete this order? This action cannot be undone."
            : "Are you sure you want to permanently delete this client inquiry? This action cannot be undone."
        }
        itemName={deleteModal?.name}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};
