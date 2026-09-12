import {
  Check,
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
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export const CollectionManager: React.FC = () => {
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<DbCollection | null>(null);
  const [assignModalCol, setAssignModalCol] = useState<DbCollection | null>(null);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setError(null);
    try {
      const [cols, prods] = await Promise.all([api.getCollections(), api.getProducts()]);
      setCollections(cols);
      setProducts(prods);
    } catch (err: any) {
      console.error("Failed to load collections:", err);
      setError("Failed to synchronize collections with database. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = api.subscribe(["collections", "products"], () => {
      loadData();
    });
    return () => unsubscribe();
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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // Optimistic delete
      setCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      await api.deleteCollection(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      console.error("Error deleting collection:", err);
      setError("Failed to delete collection from database.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (col: DbCollection) => {
    const nextStatus = col.status === "active" ? "inactive" : "active";
    // Optimistically update so Admin UI immediately reflects new status
    setCollections((prev) =>
      prev.map((c) => (c.id === col.id ? { ...c, status: nextStatus } : c))
    );
    await api.updateCollection(col.id, { ...col, status: nextStatus });
    await loadData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload: Partial<DbCollection> = {
      name: form.name.trim(),
      slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      season: form.season.trim() || "SS26",
      description: form.description.trim(),
      image: form.image.trim() || "https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666",
      status: form.status,
    };

    setModalOpen(false);
    try {
      if (editingCollection) {
        setCollections((prev) =>
          prev.map((c) => (c.id === editingCollection.id ? { ...c, ...payload } : c))
        );
        await api.updateCollection(editingCollection.id, payload);
      } else {
        const created = await api.createCollection(payload);
        setCollections((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      }
      await loadData();
    } catch (err: any) {
      console.error("Error saving collection:", err);
      setError("Failed to save collection to database.");
      await loadData();
    }
  };

  const handleToggleProductInCollection = async (product: DbProduct, collectionId: string) => {
    const isInside = product.collection_id === collectionId;
    const newColId = isInside ? null : collectionId;
    
    // Optimistically update products state for instant responsiveness
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, collection_id: newColId } : p))
    );

    await api.updateProduct(product.id, {
      ...product,
      collection_id: newColId,
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

      {/* Error state */}
      {error && (
        <div className="border border-red-300 bg-red-50 p-4 font-mono text-xs text-red-800 flex items-center justify-between shadow-2xs">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="border border-red-400 bg-white px-3 py-1 font-bold uppercase hover:bg-red-100 transition cursor-pointer"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 bg-white p-5 animate-pulse space-y-4">
              <div className="aspect-[16/9] bg-gray-200 w-full" />
              <div className="h-3 bg-gray-200 w-1/4" />
              <div className="h-5 bg-gray-200 w-3/4" />
              <div className="h-3 bg-gray-100 w-full" />
              <div className="h-10 bg-gray-100 w-full pt-2" />
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        /* Empty State */
        <div className="border border-dashed border-gray-300 bg-white p-12 text-center font-mono space-y-3 shadow-2xs">
          <Layers className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="font-display text-lg uppercase font-bold text-ink">No Collections Found</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            Your seasonal drops catalog is currently empty. Begin by creating a new seasonal campaign drop.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 inline-flex items-center gap-2 bg-ink text-white px-4 py-2 uppercase text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Create First Collection</span>
          </button>
        </div>
      ) : (
        /* Grid of collections */
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
                        className={`text-[10px] px-2 py-0.5 uppercase font-semibold border backdrop-blur-xs cursor-pointer ${
                          col.status === "active"
                            ? "border-emerald-200 text-emerald-800 bg-emerald-50/90"
                            : "border-gray-200 text-gray-600 bg-white/90"
                        }`}
                      >
                        {col.status}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 font-mono text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">
                        {col.season || "Season"}
                      </span>
                      <h3 className="font-display text-lg uppercase font-bold text-ink leading-tight mt-0.5">
                        {col.name}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-[11px] line-clamp-2 leading-relaxed">
                      {col.description || "No description provided."}
                    </p>

                    {/* Silhouettes Thumbnail Preview Gallery */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                        <span>Assigned Silhouettes</span>
                        <span className="text-ink font-bold">{colProducts.length} pieces</span>
                      </div>

                      {colProducts.length > 0 ? (
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          {colProducts.slice(0, 5).map((p) => (
                            <div
                              key={p.id}
                              className="relative group shrink-0"
                              title={`${p.name} · ${formatMoney(p.price)}`}
                            >
                              <img
                                src={p.images?.[0]?.image_url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80"}
                                alt={p.name}
                                className="h-12 w-10 object-cover border border-gray-200 bg-gray-50 rounded-2xs shadow-2xs"
                              />
                            </div>
                          ))}
                          {colProducts.length > 5 && (
                            <span className="h-12 w-10 flex items-center justify-center bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-600 shrink-0">
                              +{colProducts.length - 5}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 italic">No silhouettes currently linked to this drop.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between font-mono text-xs">
                  <button
                    onClick={() => setAssignModalCol(col)}
                    className="text-ink hover:underline uppercase text-[11px] font-bold cursor-pointer"
                  >
                    Manage Silhouettes ({colProducts.length}) →
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(col)}
                      className="p-1.5 text-gray-500 hover:text-ink hover:bg-gray-100 transition cursor-pointer"
                      title="Edit Collection"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ id: col.id, name: col.name })}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
      )}

      {/* UNASSIGNED SILHOUETTES SECTION */}
      {products.filter((p) => !p.collection_id).length > 0 && (
        <div className="border border-amber-300 bg-amber-50/30 p-5 font-mono text-xs shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                Catalog Coordination
              </span>
              <h3 className="font-display text-base sm:text-lg uppercase font-bold text-ink">
                Unassigned Silhouettes ({products.filter((p) => !p.collection_id).length})
              </h3>
              <p className="text-gray-600 text-[11px] mt-0.5">
                These garments exist in your catalog but are not currently assigned to any seasonal campaign drop.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products
              .filter((p) => !p.collection_id)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 bg-white p-3 border border-amber-200/90 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.images?.[0]?.image_url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80"}
                      alt={p.name}
                      className="h-11 w-9 object-cover border border-gray-200 bg-gray-50 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-ink text-xs truncate" title={p.name}>
                        {p.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {formatMoney(p.price)} · {p.category?.name || "Garment"}
                      </p>
                    </div>
                  </div>

                  <select
                    defaultValue=""
                    onChange={async (e) => {
                      const colId = e.target.value;
                      if (colId) {
                        await api.updateProduct(p.id, { ...p, collection_id: colId });
                        loadData();
                      }
                    }}
                    className="bg-white border border-gray-300 text-[10px] px-2 py-1 uppercase font-semibold text-ink outline-none focus:border-ink cursor-pointer shrink-0"
                  >
                    <option value="" disabled>
                      Assign to...
                    </option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
        </div>
      )}

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
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-5 py-2 uppercase font-bold text-gray-800 transition text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Seasonal Collection"
        itemName={deleteTarget?.name}
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}"? All assigned garments will remain safely in the catalog as unassigned silhouettes.`}
        isLoading={isDeleting}
      />
    </div>
  );
};
