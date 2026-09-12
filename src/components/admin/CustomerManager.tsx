import {
  Ban,
  CheckCircle,
  Eye,
  Mail,
  Phone,
  Search,
  ShoppingBag,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import type { DbCustomer, DbOrder } from "../../types/database";
import { formatMoney } from "../../utils";

export const CustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<DbCustomer[]>([]);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<DbCustomer | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [custs, ords] = await Promise.all([api.getCustomers(), api.getOrders()]);
    setCustomers(custs);
    setOrders(ords);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string) => {
    const updated = await api.toggleCustomerStatus(id);
    if (updated && selectedCustomer?.id === id) {
      setSelectedCustomer(updated);
    }
    loadData();
  };

  const handleToggleRole = async (id: string, currentRole: "admin" | "customer") => {
    const nextRole = currentRole === "admin" ? "customer" : "admin";
    const updated = await api.updateCustomerRole(id, nextRole);
    if (updated && selectedCustomer?.id === id) {
      setSelectedCustomer(updated);
    }
    loadData();
  };

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const name = c.full_name || "";
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || "").toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [customers, search]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) => o.customer_id === selectedCustomer.id || o.customer_email.toLowerCase() === selectedCustomer.email.toLowerCase()
    );
  }, [selectedCustomer, orders]);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Client Registry & Dossiers
          </span>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink font-bold">
            Customer Management ({customers.length} clients)
          </h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border border-gray-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients by name, email, or telephone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 pl-9 pr-3 py-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition text-xs"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="border border-gray-200 bg-white overflow-x-auto shadow-xs">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px]">
              <th className="p-4">Client Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Orders Placed</th>
              <th className="p-4">Account Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((cust) => {
              const placed = orders.filter(
                (o) => o.customer_id === cust.id || o.customer_email.toLowerCase() === cust.email.toLowerCase()
              );
              return (
                <tr key={cust.id} className="hover:bg-gray-50/60 transition">
                  <td className="p-4 font-bold text-ink">
                    {cust.full_name || "Maison Client"}
                  </td>
                  <td className="p-4 text-gray-600">{cust.email}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleRole(cust.id, cust.role)}
                      title={cust.role === "admin" ? "Click to Demote to Customer" : "Click to Promote to Admin"}
                      className={`text-[10px] px-2 py-0.5 uppercase font-semibold transition hover:ring-1 hover:ring-ink inline-flex items-center gap-1 ${
                        cust.role === "admin" ? "bg-ink text-white" : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      <span>{cust.role}</span>
                      <span className="text-[9px] opacity-70">⇄</span>
                    </button>
                  </td>
                  <td className="p-4 text-gray-700">{placed.length} order(s)</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-0.5 uppercase font-semibold border ${
                      cust.status === "active"
                        ? "border-emerald-200 text-emerald-800 bg-emerald-50"
                        : "border-rose-200 text-rose-800 bg-rose-50"
                    }`}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(cust.id)}
                      className={`p-1.5 transition ${
                        cust.status === "active"
                          ? "text-gray-400 hover:text-rose-600"
                          : "text-emerald-600 hover:text-emerald-700"
                      }`}
                      title={cust.status === "active" ? "Disable Client" : "Enable Client"}
                    >
                      {cust.status === "active" ? <Ban size={14} /> : <CheckCircle size={14} />}
                    </button>
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="p-1.5 text-gray-600 hover:text-ink hover:bg-gray-100 transition inline-flex items-center gap-1 uppercase text-[11px] font-semibold"
                    >
                      <Eye size={13} />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CLIENT PROFILE MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-gray-200 p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto text-ink">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  Client Profile Dossier
                </span>
                <h3 className="font-display text-xl uppercase tracking-wider text-ink font-bold">
                  {selectedCustomer.full_name || selectedCustomer.email}
                </h3>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-ink p-1 transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Details */}
              <div className="border border-gray-200 bg-gray-50/50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email Address:</span>
                  <span className="text-ink font-medium">{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Telephone:</span>
                  <span className="text-ink font-medium">{selectedCustomer.phone || "Not recorded"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Account Role:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 uppercase font-bold ${
                      selectedCustomer.role === "admin" ? "bg-ink text-white" : "bg-gray-200 text-ink"
                    }`}>
                      {selectedCustomer.role}
                    </span>
                    <button
                      onClick={() => handleToggleRole(selectedCustomer.id, selectedCustomer.role)}
                      className="text-[10px] uppercase font-bold border border-gray-300 px-2 py-0.5 hover:bg-ink hover:text-white transition shadow-2xs"
                    >
                      {selectedCustomer.role === "admin" ? "Demote to Customer" : "Promote to Admin"}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Membership Status:</span>
                  <span className={`uppercase font-bold ${
                    selectedCustomer.status === "active" ? "text-emerald-700" : "text-rose-700"
                  }`}>
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h4 className="uppercase text-[11px] text-gray-500 font-bold tracking-wider">
                  Order History ({customerOrders.length})
                </h4>
                {customerOrders.length === 0 ? (
                  <p className="text-gray-400 italic">No historical orders on record for this client.</p>
                ) : (
                  <div className="divide-y divide-gray-100 border border-gray-200 bg-white shadow-2xs">
                    {customerOrders.map((ord) => (
                      <div key={ord.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink">{ord.order_number}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(ord.created_at).toLocaleDateString()} · {ord.items?.length || 0} Silhouette(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-ink font-bold">{formatMoney(ord.total)}</p>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 border border-gray-200 text-gray-700 bg-gray-50">
                            {ord.order_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Toggle */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(selectedCustomer.id)}
                  className={`px-4 py-2 uppercase font-bold border transition text-xs shadow-2xs ${
                    selectedCustomer.status === "active"
                      ? "border-rose-300 text-rose-700 hover:bg-rose-50"
                      : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {selectedCustomer.status === "active" ? "Suspend Account" : "Activate Account"}
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-5 py-2 uppercase font-bold text-gray-800 transition text-xs shadow-2xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
