import {
  CheckCircle,
  Clock,
  Filter,
  Inbox,
  Mail,
  MailOpen,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import type { DbContactMessage } from "../../types/database";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export const ContactManager: React.FC = () => {
  const [messages, setMessages] = useState<DbContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await api.getContactMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = api.subscribe(["contact_messages"], () => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: DbContactMessage["status"]) => {
    await api.updateContactStatus(id, status);
    loadData();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteContactMessage(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Client Inquiries & Private Dispatches
          </span>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink font-bold">
            Contact Submissions ({messages.length})
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase">
          <span className="border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800 font-bold shadow-2xs">
            {messages.filter((m) => m.status === "unread").length} Unread
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 border border-gray-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search message text, client name, or email..."
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
          <option value="all">All Inquiry Statuses</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center border border-gray-200 bg-white text-gray-400 shadow-xs">
            No contact messages match current filter criteria.
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              className={`border p-5 transition space-y-3 shadow-xs ${
                msg.status === "unread"
                  ? "border-amber-300 bg-amber-50/20"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm uppercase font-bold text-ink">
                    {msg.name}
                  </span>
                  <span className="text-gray-300 text-[10px]">·</span>
                  <a href={`mailto:${msg.email}`} className="text-ink hover:underline text-[11px] font-semibold">
                    {msg.email}
                  </a>
                  {msg.phone && (
                    <>
                      <span className="text-gray-300 text-[10px]">·</span>
                      <span className="text-gray-500 text-[11px]">{msg.phone}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 uppercase font-bold border ${
                    msg.status === "unread"
                      ? "border-amber-200 text-amber-800 bg-amber-50"
                      : msg.status === "resolved"
                      ? "border-emerald-200 text-emerald-800 bg-emerald-50"
                      : "border-gray-200 text-gray-600 bg-gray-50"
                  }`}>
                    {msg.status}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <p className="font-editorial text-sm sm:text-base text-gray-800 leading-relaxed italic whitespace-pre-wrap">
                "{msg.message}"
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setDeleteTarget({ id: msg.id, name: msg.name })}
                  className="px-2.5 py-1 uppercase text-[10px] font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition bg-white flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Delete inquiry"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  {msg.status !== "unread" && (
                    <button
                      onClick={() => handleUpdateStatus(msg.id, "unread")}
                      className="px-2.5 py-1 uppercase text-[10px] border border-gray-300 text-gray-600 hover:text-ink hover:bg-gray-100 transition bg-white"
                    >
                      Mark as Unread
                    </button>
                  )}
                  {msg.status !== "read" && (
                    <button
                      onClick={() => handleUpdateStatus(msg.id, "read")}
                      className="px-2.5 py-1 uppercase text-[10px] border border-gray-300 text-gray-600 hover:text-ink hover:bg-gray-100 transition bg-white"
                    >
                      Mark as Read
                    </button>
                  )}
                  {msg.status !== "resolved" && (
                    <button
                      onClick={() => handleUpdateStatus(msg.id, "resolved")}
                      className="px-3 py-1 uppercase text-[10px] font-bold border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition bg-emerald-50/50 shadow-2xs"
                    >
                      Mark as Resolved ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Popup */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Contact Inquiry"
        message="Are you sure you want to delete this contact submission? This action cannot be undone."
        itemName={deleteTarget ? `Client: ${deleteTarget.name}` : undefined}
        confirmLabel="Delete Inquiry"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};
