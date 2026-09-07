import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Edit2,
  FolderPlus,
  FolderTree,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { DbCategory } from "../../types/database";

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
  const [parentForNewSub, setParentForNewSub] = useState<DbCategory | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parent_id: "" as string | null,
    sort_order: 1,
    description: "",
    status: "active" as "active" | "inactive",
  });

  const loadData = async () => {
    setLoading(true);
    const data = await api.getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setParentForNewSub(null);
    setForm({
      name: "",
      slug: "",
      parent_id: null,
      sort_order: categories.filter((c) => !c.parent_id).length + 1,
      description: "",
      status: "active",
    });
    setModalOpen(true);
  };

  const openAddSubcategoryModal = (parent: DbCategory) => {
    setEditingCategory(null);
    setParentForNewSub(parent);
    const siblings = categories.filter((c) => c.parent_id === parent.id);
    setForm({
      name: "",
      slug: "",
      parent_id: parent.id,
      sort_order: siblings.length + 1,
      description: "",
      status: "active",
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: DbCategory) => {
    setEditingCategory(cat);
    setParentForNewSub(null);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id || null,
      sort_order: cat.sort_order || 1,
      description: cat.description || "",
      status: cat.status || "active",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will delete any associated subcategories.`)) {
      await api.deleteCategory(id);
      loadData();
    }
  };

  const handleToggleStatus = async (cat: DbCategory) => {
    const nextStatus = cat.status === "active" ? "inactive" : "active";
    await api.updateCategory(cat.id, { status: nextStatus });
    loadData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const payload: Partial<DbCategory> = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      parent_id: form.parent_id || null,
      sort_order: Number(form.sort_order),
      description: form.description,
      status: form.status,
    };

    if (editingCategory) {
      await api.updateCategory(editingCategory.id, payload);
    } else {
      await api.createCategory(payload);
    }

    setModalOpen(false);
    loadData();
  };

  const mainCategories = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Maison Makeeva Hierarchy
          </span>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink font-bold">
            Category & Subcategory Management
          </h2>
        </div>
        <button
          onClick={openAddCategoryModal}
          className="flex items-center justify-center gap-2 bg-ink hover:bg-gray-800 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-white transition shrink-0 shadow-xs"
        >
          <FolderPlus size={16} />
          <span>Add Main Category</span>
        </button>
      </div>

      {/* Categories Hierarchy List */}
      <div className="space-y-4">
        {mainCategories.map((mainCat) => {
          const subcats = categories
            .filter((c) => c.parent_id === mainCat.id)
            .sort((a, b) => a.sort_order - b.sort_order);

          return (
            <div
              key={mainCat.id}
              className="border border-gray-200 bg-white shadow-xs overflow-hidden"
            >
              {/* Main Category Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50/60 border-b border-gray-200 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center bg-gray-100 border border-gray-300 text-ink text-[11px] font-bold">
                    {mainCat.sort_order}
                  </span>
                  <div>
                    <h3 className="font-display text-sm sm:text-base uppercase tracking-wider text-ink font-bold">
                      {mainCat.name}
                    </h3>
                    <span className="text-[10px] text-gray-500">{mainCat.slug} {mainCat.description && `— ${mainCat.description}`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleStatus(mainCat)}
                    className={`text-[10px] px-2 py-0.5 uppercase font-semibold border ${
                      mainCat.status === "active"
                        ? "border-emerald-200 text-emerald-800 bg-emerald-50"
                        : "border-gray-200 text-gray-500 bg-gray-50"
                    }`}
                  >
                    {mainCat.status}
                  </button>

                  <button
                    onClick={() => openAddSubcategoryModal(mainCat)}
                    className="flex items-center gap-1 border border-gray-300 bg-white hover:border-ink hover:text-ink text-gray-700 px-2.5 py-1 text-[11px] uppercase transition shadow-2xs"
                    title="Add Subcategory"
                  >
                    <Plus size={12} />
                    <span>Subcategory</span>
                  </button>

                  <button
                    onClick={() => openEditModal(mainCat)}
                    className="p-1.5 text-gray-500 hover:text-ink hover:bg-gray-100 transition"
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    onClick={() => handleDelete(mainCat.id, mainCat.name)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {subcats.length > 0 ? (
                <div className="divide-y divide-gray-100 pl-4 sm:pl-8 pr-4">
                  {subcats.map((sub) => (
                    <div
                      key={sub.id}
                      className="py-2.5 flex items-center justify-between gap-3 font-mono text-xs hover:bg-gray-50/50 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <CornerDownRight size={14} className="text-gray-400 shrink-0" />
                        <span className="text-gray-800 font-medium">{sub.name}</span>
                        <span className="text-[10px] text-gray-400">({sub.slug})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">Seq: {sub.sort_order}</span>
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          className={`text-[9px] px-1.5 py-0.5 uppercase border font-semibold ${
                            sub.status === "active"
                              ? "border-emerald-200 text-emerald-800 bg-emerald-50"
                              : "border-gray-200 text-gray-500 bg-gray-50"
                          }`}
                        >
                          {sub.status}
                        </button>
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-1 text-gray-500 hover:text-ink"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.name)}
                          className="p-1 text-gray-400 hover:text-rose-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-3 text-[11px] font-mono text-gray-400 italic pl-8">
                  No subcategories assigned. Silhouettes will link directly to {mainCat.name}.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-gray-200 p-6 shadow-2xl font-mono text-xs text-ink">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
              <h3 className="font-display text-base uppercase tracking-wider text-ink font-bold">
                {editingCategory
                  ? `Edit Category: ${editingCategory.name}`
                  : parentForNewSub
                  ? `Add Subcategory under ${parentForNewSub.name}`
                  : "Add Main Category"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-ink p-1 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Hoodies & Sweatshirts"
                  className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Slug / Handle</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. hoodies-sweatshirts"
                  className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Display Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink uppercase transition"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Description / Editorial Tagline</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Editorial notes or overview..."
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
