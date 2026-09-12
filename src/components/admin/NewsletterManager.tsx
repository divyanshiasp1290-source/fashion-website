import {
  CheckCircle,
  Download,
  Mail,
  Search,
  UserCheck,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import type { DbNewsletterSubscriber } from "../../types/database";

export const NewsletterManager: React.FC = () => {
  const [subscribers, setSubscribers] = useState<DbNewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");

  const loadData = async () => {
    setLoading(true);
    const data = await api.getNewsletterSubscribers();
    setSubscribers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = api.subscribe(["newsletter_subscribers"], () => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = async (id: string) => {
    await api.toggleNewsletterStatus(id);
    loadData();
  };

  const handleExportCSV = () => {
    const headers = ["Email", "Status", "Subscribed_At"];
    const rows = filtered.map((s) => [s.email, s.status, s.subscribed_at]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maison_makeeva_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, search, statusFilter]);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Private Atelier Dispatches
          </span>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink font-bold">
            Newsletter Subscribers ({subscribers.length})
          </h2>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:border-ink hover:text-ink text-gray-700 px-4 py-2 uppercase font-bold transition shrink-0 shadow-2xs text-xs"
        >
          <Download size={14} />
          <span>Export CSV Dispatch List</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 border border-gray-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 pl-9 pr-3 py-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 text-xs transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-white border border-gray-300 px-3 py-2 text-ink outline-none focus:border-ink uppercase text-xs transition"
        >
          <option value="all">All Subscribers</option>
          <option value="active">Active Only</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      {/* Subscribers Table */}
      <div className="border border-gray-200 bg-white overflow-x-auto shadow-xs">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px]">
              <th className="p-4">Subscriber Email</th>
              <th className="p-4">Subscribed Date</th>
              <th className="p-4">Dispatch Status</th>
              <th className="p-4 text-right">Toggle Active / Inactive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50/60 transition">
                <td className="p-4 font-bold text-ink flex items-center gap-2">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  <span>{sub.email}</span>
                </td>
                <td className="p-4 text-gray-600">
                  {new Date(sub.subscribed_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 uppercase font-semibold border ${
                    sub.status === "active"
                      ? "border-emerald-200 text-emerald-800 bg-emerald-50"
                      : "border-gray-200 text-gray-500 bg-gray-50"
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleToggle(sub.id)}
                    className={`px-3 py-1 uppercase text-[10px] font-bold border transition shadow-2xs ${
                      sub.status === "active"
                        ? "border-gray-300 text-gray-600 hover:text-rose-600 hover:border-rose-300 bg-white"
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-white"
                    }`}
                  >
                    {sub.status === "active" ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
