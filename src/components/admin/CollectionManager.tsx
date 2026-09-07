import {
  Edit2,
  Image as ImageIcon,
  Layers,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { DbCollection, DbProduct } from "../../types/database";
import { formatMoney } from "../../utils";

export const CollectionManager: React.FC = () => {
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<DbCollection | null>(null);
  const [assignModalCol, setAssignModalCol] = useState<DbCollection | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    season: "",
    description: "",
    image: "",
    status: "active" as "active" | "inactive",
  });

  const loadData = async () => {
    setLoading(true);
    const [cols, prods] = await Promise.all([api.getCollections(), api.getProducts()]);
    setCollections(cols);
    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setForm({
      name: "",
      slug: "",
      season: "SS26",
      description: "",
      image: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666",
      status: "active",
    });
    setModalOpen(true);
  };

  const openEditModal = (col: DbCollection) => {
    setEditingCollection(col);
    setForm({
      name: col.name,
      slug: col.slug,
      season: col.season || "",
      description: col.description || "",
      image: col.image || "",
      status: col.status || "active",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete collection "${name}"? Products will be retained.`)) {
      await api.deleteCollection(id);
      loadData();
    }
  };

  const handleToggleStatus = async (col: DbCollection) => {
    const nextStatus = col.status === "active" ? "inactive" : "active";
    await api.updateCollection(col.id, { status: nextStatus });
    loadData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const payload: Partial<DbCollection> = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      season: form.season,
      description: form.description,
      image: form.image,
      status: form.status,
    };

    if (editingCollection) {
      await api.updateCollection(editingCollection.id, payload);
    } else {
      await api.createCollection(payload);
    }

    setModalOpen(false);
    loadData();
  };

  const handleToggleProductInCollection = async (product: DbProduct, collectionId: string) => {
    const isInside = product.collection_id === collectionId;
    await api.updateProduct(product.id, {
      collection_id: isInside ? null : collectionId,
    });
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Seasonal Campaigns & Curations
          </span>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink font-bold">
            Collection Management ({collections.length})
          </h2>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-ink hover:bg-gray-800 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-white transition shrink-0 shadow-xs"
        >
          <Plus size={16} />
          <span>New Collection Drop</span>
        </button>
      </div>

      {/* Grid of collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => {
          const colProducts = products.filter((p) => p.collection_id === col.id);

          return (
            <div
              key={col.id}
              className="border border-gray-200 bg-white shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden border-b border-gray-200">
                  {col.image ? (
                    <img src={col.image} alt={col.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400 font-mono text-xs">
                      No cover image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleStatus(col)}
                      className={`text-[10px] px-2 py-0.5 uppercase font-semibold border backdrop-blur-xs ${
                        col.status === "active"
                          ? "border-emerald-200 text-emerald-800 bg-emerald-50/90"
                          : "border-gray-200 text-gray-600 bg-white/90"
                      }`}
                    >
                      {col.status}
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-2 font-mono text-xs">
                  <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">
                    {col.season || "Season"}
                  </span>
                  <h3 className="font-display text-lg uppercase font-bold text-ink leading-tight">
                    {col.name}
                  </h3>
                  <p className="text-gray-600 text-[11px] line-clamp-2">
                    {col.description || "No description provided."}
                  </p>
                  <p className="pt-2 text-gray-400 text-[10px] uppercase tracking-wider">
                    {colProducts.length} Silhouettes Assigned
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between font-mono text-xs">
                <button
                  onClick={() => setAssignModalCol(col)}
                  className="text-ink hover:underline uppercase text-[11px] font-bold"
                >
                  Manage Silhouettes ({colProducts.length}) →
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(col)}
                    className="p-1.5 text-gray-500 hover:text-ink hover:bg-gray-100 transition"
                    title="Edit Collection"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(col.id, col.name)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Collection"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT COLLECTION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-gray-200 p-6 shadow-2xl font-mono text-xs text-ink">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
              <h3 className="font-display text-base uppercase tracking-wider text-ink font-bold">
                {editingCollection ? `Edit: ${editingCollection.name}` : "New Campaign Collection"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-ink p-1 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Collection Title *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Spring Summer SS26 Monograph"
                  className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Slug / Handle</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="ss26"
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Season Tag</label>
                  <input
                    type="text"
                    value={form.season}
                    onChange={(e) => setForm({ ...form, season: e.target.value })}
                    placeholder="New arrivals / SS26"
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Campaign Cover Image URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Curator Notes / Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ready-to-wear narrative, materials, and vision..."
                  className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink resize-none placeholder:text-gray-400 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition text-xs uppercase font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-ink hover:bg-gray-800 px-5 py-1.5 font-bold text-white uppercase text-xs transition shadow-xs"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN PRODUCTS TO COLLECTION MODAL */}
      {assignModalCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 p-6 shadow-2xl font-mono text-xs text-ink max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  Product Assignment Matrix
                </span>
                <h3 className="font-display text-lg uppercase tracking-wider text-ink font-bold">
                  {assignModalCol.name}
                </h3>
              </div>
              <button onClick={() => setAssignModalCol(null)} className="text-gray-400 hover:text-ink p-1 transition">
                <X size={18} />
              </button>
            </div>

            <p className="text-gray-500 mb-3 text-[11px]">
              Click products to add or remove them from this seasonal collection:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
              {products.map((p) => {
                const isIncluded = p.collection_id === assignModalCol.id;
                return (
                  <div
                    key={p.id}
                    className="pt-2 flex items-center justify-between gap-3 hover:bg-gray-50 p-2 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.image_url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80"}
                        alt={p.name}
                        className="h-9 w-8 object-cover bg-gray-100 border border-gray-200"
                      />
                      <div>
                        <p className="font-bold text-ink text-xs">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.sku} · {formatMoney(p.price)}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleProductInCollection(p, assignModalCol.id)}
                      className={`px-3 py-1 uppercase text-[10px] font-bold border transition ${
                        isIncluded
                          ? "bg-ink text-white border-ink shadow-2xs"
                          : "border-gray-300 text-gray-700 hover:border-ink hover:text-ink bg-white"
                      }`}
                    >
                      {isIncluded ? "Included ✓" : "+ Add to Collection"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setAssignModalCol(null)}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-5 py-2 uppercase font-bold text-gray-800 transition text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
