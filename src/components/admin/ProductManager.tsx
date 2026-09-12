import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Filter,
  Image as ImageIcon,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import type { DbCategory, DbCollection, DbProduct, DbProductImage } from "../../types/database";
import { formatMoney } from "../../utils";

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    sku: "",
    slug: "",
    price: 0,
    compare_at_price: 0,
    gender: "Unisex",
    category_id: "",
    subcategory_id: "",
    collection_id: "",
    description: "",
    short_description: "",
    story: "",
    badge: "",
    status: "active" as "active" | "inactive" | "draft",
    featured: false,
    new_arrival: false,
    materials: "",
    tags: "",
    images: [] as string[],
    sizes: "S, M, L, XL",
    colors: "Default",
    initialStock: 10,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [prods, cats, cols] = await Promise.all([
      api.getProducts(),
      api.getCategories(),
      api.getCollections(),
    ]);
    setProducts(prods);
    setCategories(cats);
    setCollections(cols);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = api.subscribe(
      ["products", "product_images", "categories", "collections"],
      () => {
        loadData();
      }
    );
    return () => unsubscribe();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      sku: `MM-${Date.now().toString().slice(-4)}`,
      slug: "",
      price: 150,
      compare_at_price: 0,
      gender: "Unisex",
      category_id: categories[0]?.id || "",
      subcategory_id: "",
      collection_id: collections[0]?.id || "",
      description: "",
      short_description: "",
      story: "",
      badge: "",
      status: "active",
      featured: false,
      new_arrival: true,
      materials: "100% Cotton, 300 GSM",
      tags: "SS26, Ready-to-wear",
      images: [
        "https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028",
      ],
      sizes: "S, M, L, XL",
      colors: "Noir",
      initialStock: 15,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: DbProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price || 0,
      gender: product.gender || "Unisex",
      category_id: product.subcategory_id || product.category_id || "",
      subcategory_id: product.subcategory_id || "",
      collection_id: product.collection_id || "",
      description: product.description || "",
      short_description: product.short_description || "",
      story: product.story || "",
      badge: product.badge || "",
      status: product.status || "active",
      featured: Boolean(product.featured),
      new_arrival: Boolean(product.new_arrival),
      materials: (product.materials || []).join(", "),
      tags: (product.tags || []).join(", "),
      images: (product.images || []).map((img) => img.image_url),
      sizes: "S, M, L, XL",
      colors: "Default",
      initialStock: 10,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await api.deleteProduct(id);
      loadData();
      try {
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("mm-catalog-sync");
          bc.postMessage({ type: "catalog_changed" });
          bc.close();
        }
        window.dispatchEvent(new CustomEvent("mm-catalog-sync"));
        localStorage.setItem("mm_catalog_updated_at", String(Date.now()));
      } catch (e) {}
    }
  };

  const handleToggleStatus = async (product: DbProduct) => {
    const nextStatus = product.status === "active" ? "inactive" : "active";
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
    );
    await api.updateProduct(product.id, { ...product, status: nextStatus });
    loadData();
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("mm-catalog-sync");
        bc.postMessage({ type: "status_toggle", id: product.id, status: nextStatus });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent("mm-catalog-sync", { detail: { id: product.id, status: nextStatus } }));
      localStorage.setItem("mm_catalog_updated_at", String(Date.now()));
    } catch (e) {}
  };

  const handleToggleFeatured = async (product: DbProduct) => {
    const nextVal = !product.featured;
    const nextBadge = nextVal
      ? (product.badge && product.badge !== "BEST SELLERS" ? product.badge : "FEATURED")
      : (product.badge === "FEATURED" || product.badge === "BEST SELLERS" ? null : product.badge);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              featured: nextVal,
              badge: nextBadge,
            }
          : p
      )
    );
    await api.updateProduct(product.id, {
      ...product,
      featured: nextVal,
      badge: nextBadge,
    });
    loadData();
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("mm-catalog-sync");
        bc.postMessage({ type: "featured_toggle", id: product.id, featured: nextVal });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent("mm-catalog-sync", { detail: { id: product.id, featured: nextVal } }));
      localStorage.setItem("mm_catalog_updated_at", String(Date.now()));
    } catch (e) {}
  };

  const handleToggleNewArrival = async (product: DbProduct) => {
    const nextVal = !product.new_arrival;
    const nextBadge = nextVal ? "NEW ARRIVAL" : (product.badge === "NEW ARRIVAL" ? null : product.badge);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              new_arrival: nextVal,
              badge: nextBadge,
            }
          : p
      )
    );
    await api.updateProduct(product.id, {
      ...product,
      new_arrival: nextVal,
      badge: nextBadge,
    });
    loadData();
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("mm-catalog-sync");
        bc.postMessage({ type: "new_arrival_toggle", id: product.id, new_arrival: nextVal });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent("mm-catalog-sync", { detail: { id: product.id, new_arrival: nextVal } }));
      localStorage.setItem("mm_catalog_updated_at", String(Date.now()));
    } catch (e) {}
  };

  // Image Management
  const handleAddImageUrl = (url: string) => {
    if (!url) return;
    setForm((f) => ({ ...f, images: [...f.images, url] }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.images.length) return;
    const updated = [...form.images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setForm((f) => ({ ...f, images: updated }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const uploadedUrl = await api.uploadImage(files[i]);
        setForm((prev) => ({ ...prev, images: [...prev.images, uploadedUrl] }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const materialsArr = form.materials.split(",").map((s) => s.trim()).filter(Boolean);
    const tagsArr = form.tags.split(",").map((s) => s.trim()).filter(Boolean);

    const selectedCat = categories.find((c) => c.id === form.category_id);
    const categoryId = selectedCat?.parent_id ? selectedCat.parent_id : (form.category_id || null);
    const subcategoryId = selectedCat?.parent_id ? selectedCat.id : (form.subcategory_id || null);

    const tagSet = new Set<string>(tagsArr);
    if (form.gender) tagSet.add(form.gender);
    if (form.gender.toLowerCase() === "unisex") {
      tagSet.add("Women");
      tagSet.add("Men");
      tagSet.add("Unisex");
    }
    if (selectedCat) {
      tagSet.add(selectedCat.name);
      if (selectedCat.parent_id) {
        const parent = categories.find((c) => c.id === selectedCat.parent_id);
        if (parent) tagSet.add(parent.name);
      }
    }
    if (form.new_arrival) {
      tagSet.add("NEW ARRIVAL");
      tagSet.add("New Arrivals");
    }

    const payload: Partial<DbProduct> = {
      name: form.name,
      sku: form.sku,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      gender: form.gender,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      collection_id: form.collection_id || null,
      description: form.description,
      short_description: form.short_description,
      story: form.story,
      badge: form.badge || (form.new_arrival ? "NEW ARRIVAL" : null),
      status: form.status,
      featured: form.featured,
      new_arrival: form.new_arrival,
      materials: materialsArr,
      tags: Array.from(tagSet),
    };

    if (editingProduct) {
      await api.updateProduct(editingProduct.id, payload, form.images);
    } else {
      const created = await api.createProduct(payload, form.images);
      // Create initial inventory variants
      const sizesArr = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
      for (const sz of sizesArr) {
        await api.saveInventoryVariant({
          product_id: created.id,
          size: sz,
          color: form.colors || "Default",
          stock_quantity: Number(form.initialStock) || 10,
          low_stock_threshold: 5,
        });
      }
    }

    setIsModalOpen(false);
    loadData();
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("mm-catalog-sync");
        bc.postMessage({ type: "catalog_changed" });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent("mm-catalog-sync"));
      localStorage.setItem("mm_catalog_updated_at", String(Date.now()));
    } catch (e) {}
  };

  // Filtered Products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" || p.category_id === categoryFilter || p.subcategory_id === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const mainCategories = categories.filter((c) => !c.parent_id);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-coral font-semibold">
            Product Archive & Catalog
          </span>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink font-bold">
            Product Management ({filtered.length})
          </h2>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-ink px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-white hover:bg-gray-800 transition shrink-0 shadow-sm"
        >
          <Plus size={16} />
          <span>Add New Silhouette</span>
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-gray-200 bg-white p-4 font-mono text-xs shadow-sm">
        {/* Search */}
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, SKU or tag..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-300 pl-9 pr-3 py-2 text-ink outline-none focus:border-ink placeholder:text-gray-400"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-ink outline-none focus:border-ink uppercase cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => {
              const parent = c.parent_id ? categories.find((p) => p.id === c.parent_id) : null;
              const label = parent ? `${parent.name} → ${c.name}` : c.name;
              return (
                <option key={c.id} value={c.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-ink outline-none focus:border-ink uppercase cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Silhouettes</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-gray-200 bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px]">
              <th className="p-4">Piece</th>
              <th className="p-4">SKU / Code</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Badges</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((product) => {
              const primaryImg = product.images?.[0]?.image_url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80";
              const catName = product.subcategory?.name || product.category?.name || "Ready-to-Wear";

              return (
                <tr key={product.id} className="hover:bg-gray-50/70 transition">
                  {/* Image & Title */}
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="h-12 w-10 object-cover bg-gray-100 border border-gray-200 shrink-0"
                    />
                    <div>
                      <p className="font-display text-xs uppercase font-bold text-ink leading-snug">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-gray-500">{product.gender} · {product.collection?.name || "Atelier"}</p>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="p-4 text-gray-600 font-medium">{product.sku}</td>

                  {/* Category */}
                  <td className="p-4 text-gray-600">{catName}</td>

                  {/* Price */}
                  <td className="p-4 font-bold text-ink">
                    {formatMoney(product.price)}
                    {product.compare_at_price && (
                      <span className="ml-1 text-[10px] text-gray-400 line-through">
                        {formatMoney(product.compare_at_price)}
                      </span>
                    )}
                  </td>

                  {/* Badges / Toggles */}
                  <td className="p-4 space-x-1">
                    <button
                      onClick={() => handleToggleNewArrival(product)}
                      className={`text-[10px] px-1.5 py-0.5 uppercase border ${
                        product.new_arrival
                          ? "border-coral text-coral bg-coral/10 font-bold"
                          : "border-gray-200 text-gray-400 hover:border-gray-400"
                      }`}
                      title="Toggle New Arrival"
                    >
                      New
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(product)}
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 uppercase border transition-all ${
                        product.featured
                          ? "border-amber-500 text-amber-600 bg-amber-50 font-bold shadow-sm"
                          : "border-gray-200 text-gray-400 hover:border-amber-400 hover:text-amber-600"
                      }`}
                      title="Star Mark / Feature on Homepage Spotlight"
                    >
                      <Star
                        size={10}
                        className={product.featured ? "text-amber-500 fill-amber-500" : "text-gray-400"}
                      />
                      <span>Star</span>
                    </button>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(product)}
                      className={`text-[10px] px-2 py-0.5 uppercase font-semibold border ${
                        product.status === "active"
                          ? "border-emerald-200 text-emerald-800 bg-emerald-50"
                          : "border-gray-200 text-gray-500 bg-gray-100"
                      }`}
                    >
                      {product.status}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1.5 text-gray-500 hover:text-ink hover:bg-gray-100 transition rounded"
                      title="Edit Product"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition rounded"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white p-4 flex items-center justify-between font-mono text-xs shadow-sm">
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 border border-gray-300 text-ink hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 border border-gray-300 text-ink hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-gray-200 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto my-auto text-ink">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-coral font-semibold">
                  Atelier Production Matrix
                </span>
                <h3 className="font-display text-xl uppercase tracking-wider text-ink font-bold">
                  {editingProduct ? `Edit Silhouette: ${editingProduct.name}` : "Create New Silhouette"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 font-mono text-xs">
              {/* Row 1: Name, SKU, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">Product Name *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400"
                    placeholder="MM Bovinille Set"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">SKU Identifier *</label>
                  <input
                    required
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400"
                    placeholder="MM-SS26-001"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">Price (€ EUR) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Row 2: Gender, Category, Collection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">Gender / Cut</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink cursor-pointer"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => {
                      const parent = c.parent_id ? categories.find((p) => p.id === c.parent_id) : null;
                      const label = parent ? `${parent.name} → ${c.name}` : c.name;
                      return (
                        <option key={c.id} value={c.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">Collection</label>
                  <select
                    value={form.collection_id}
                    onChange={(e) => setForm({ ...form, collection_id: e.target.value })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink cursor-pointer"
                  >
                    <option value="">Select Collection</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Descriptions */}
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">Short Description (Summary)</label>
                  <input
                    type="text"
                    value={form.short_description}
                    onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400"
                    placeholder="Sculptural 300 GSM cotton two-piece set..."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">Full Editorial Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink resize-none placeholder:text-gray-400"
                    placeholder="Detailed craftsmanship notes, silhouette drape..."
                  />
                </div>
              </div>

              {/* Row 4: Materials & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">Materials (Comma-separated)</label>
                  <input
                    type="text"
                    value={form.materials}
                    onChange={(e) => setForm({ ...form, materials: e.target.value })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400"
                    placeholder="300 GSM cotton, Stonewashed denim"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 uppercase">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400"
                    placeholder="SS26, Unisex, Runway"
                  />
                </div>
              </div>

              {/* Row 5: Multi-Image Manager & Reordering */}
              <div className="border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="uppercase text-ink font-bold">
                    Silhouette Images & Reordering ({form.images.length})
                  </span>
                  <label className="flex items-center gap-1.5 border border-ink text-ink px-2.5 py-1 cursor-pointer hover:bg-ink hover:text-white transition font-bold bg-white">
                    <Upload size={12} />
                    <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct URL input */}
                <div className="flex gap-2">
                  <input
                    id="new-img-url"
                    type="url"
                    placeholder="Or paste direct image URL (https://...)"
                    className="flex-1 bg-white border border-gray-300 px-3 py-1.5 text-ink outline-none focus:border-ink placeholder:text-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.currentTarget;
                        handleAddImageUrl(input.value);
                        input.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("new-img-url") as HTMLInputElement;
                      if (input && input.value) {
                        handleAddImageUrl(input.value);
                        input.value = "";
                      }
                    }}
                    className="border border-gray-300 bg-white px-3 py-1 text-ink hover:bg-gray-100 font-medium"
                  >
                    Add URL
                  </button>
                </div>

                {/* Thumbnails reorder list */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {form.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative group border border-gray-200 bg-white p-1.5 space-y-1 shadow-sm">
                      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
                        <img src={imgUrl} alt="Product" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span>#{idx + 1} {idx === 0 && "(Cover)"}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, idx - 1)}
                            className="p-0.5 hover:text-ink disabled:opacity-20"
                            title="Move Earlier"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === form.images.length - 1}
                            onClick={() => handleMoveImage(idx, idx + 1)}
                            className="p-0.5 hover:text-ink disabled:opacity-20"
                            title="Move Later"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-0.5 text-red-500 hover:text-red-700"
                            title="Remove Image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.new_arrival}
                    onChange={(e) => setForm({ ...form, new_arrival: e.target.checked })}
                    className="accent-ink h-4 w-4"
                  />
                  <span className="text-gray-700 font-medium">Mark as New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="accent-ink h-4 w-4"
                  />
                  <span className="text-gray-700 font-medium inline-flex items-center gap-1.5">
                    <Star size={12} className={form.featured ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                    Mark as Featured (Star Mark on Homepage)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-gray-700 font-semibold uppercase">Status:</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="bg-white border border-gray-300 px-2 py-1 text-ink uppercase outline-none focus:border-ink cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-ink hover:bg-gray-100 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-ink px-6 py-2 font-bold text-white hover:bg-gray-800 transition uppercase tracking-wider shadow-sm"
                >
                  {editingProduct ? "Save Changes" : "Commit to Archive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
