import {
  AlertTriangle,
  Boxes,
  CheckCircle,
  Filter,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import type { DbInventory, DbProduct } from "../../types/database";

export const InventoryManager: React.FC = () => {
  const [inventory, setInventory] = useState<DbInventory[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [stockLevelFilter, setStockLevelFilter] = useState<"all" | "low" | "out">("all");

  // Variant Modal
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [newSize, setNewSize] = useState("M");
  const [newColor, setNewColor] = useState("Default");
  const [newStock, setNewStock] = useState(10);
  const [newThreshold, setNewThreshold] = useState(5);

  const loadData = async () => {
    setLoading(true);
    const [inv, prods] = await Promise.all([api.getInventory(), api.getProducts()]);
    setInventory(inv);
    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockAdjust = async (item: DbInventory, delta: number) => {
    const updatedQty = Math.max(0, item.stock_quantity + delta);
    await api.updateInventory(item.id, { stock_quantity: updatedQty });
    loadData();
  };

  const handleStockDirectChange = async (item: DbInventory, value: number) => {
    const validQty = Math.max(0, isNaN(value) ? 0 : value);
    await api.updateInventory(item.id, { stock_quantity: validQty });
    loadData();
  };

  const handleThresholdChange = async (item: DbInventory, threshold: number) => {
    const validThreshold = Math.max(1, isNaN(threshold) ? 5 : threshold);
    await api.updateInventory(item.id, { low_stock_threshold: validThreshold });
    loadData();
  };

  const handleDeleteVariant = async (id: string) => {
    if (window.confirm("Remove this variant from inventory tracking?")) {
      await api.deleteInventory(id);
      loadData();
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    await api.saveInventoryVariant({
      product_id: selectedProductId,
      size: newSize,
      color: newColor,
      stock_quantity: Math.max(0, newStock),
      low_stock_threshold: Math.max(1, newThreshold),
    });

    setVariantModalOpen(false);
    loadData();
  };

  // Enriched & filtered inventory items
  const enrichedList = useMemo(() => {
    return inventory.map((inv) => {
      const prod = products.find((p) => p.id === inv.product_id);
      return {
        ...inv,
        product: prod,
      };
    });
  }, [inventory, products]);

  const filtered = useMemo(() => {
    return enrichedList.filter((item) => {
      const prodName = item.product?.name || "";
      const prodSku = item.product?.sku || "";
      const matchesSearch =
        prodName.toLowerCase().includes(search.toLowerCase()) ||
        prodSku.toLowerCase().includes(search.toLowerCase()) ||
        item.size.toLowerCase().includes(search.toLowerCase()) ||
        item.color.toLowerCase().includes(search.toLowerCase());

      const isOut = item.stock_quantity === 0;
      const isLow = item.stock_quantity > 0 && item.stock_quantity <= item.low_stock_threshold;

      if (stockLevelFilter === "out") return matchesSearch && isOut;
      if (stockLevelFilter === "low") return matchesSearch && isLow;
      return matchesSearch;
    });
  }, [enrichedList, search, stockLevelFilter]);

  const lowStockCount = enrichedList.filter(
    (i) => i.stock_quantity > 0 && i.stock_quantity <= i.low_stock_threshold
  ).length;

  const outOfStockCount = enrichedList.filter((i) => i.stock_quantity === 0).length;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
            Stock Control Matrix
          </span>
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink font-bold">
            Inventory & Variant Management ({inventory.length} units)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedProductId(products[0]?.id || "");
              setVariantModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-ink hover:bg-gray-800 px-4 py-2.5 uppercase font-bold text-white transition shadow-xs"
          >
            <Plus size={14} /> Add Variant
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStockLevelFilter("all")}
          className={`p-4 border text-left transition shadow-xs ${
            stockLevelFilter === "all" ? "border-ink bg-gray-100 ring-1 ring-ink" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Total Tracked Variants</span>
          <p className="font-display text-2xl uppercase font-bold text-ink mt-1">
            {inventory.length}
          </p>
        </button>

        <button
          onClick={() => setStockLevelFilter("low")}
          className={`p-4 border text-left transition shadow-xs ${
            stockLevelFilter === "low" ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <span className="text-[10px] text-amber-700 uppercase font-semibold flex items-center gap-1">
            <AlertTriangle size={12} /> Low Stock Alert
          </span>
          <p className="font-display text-2xl uppercase font-bold text-amber-700 mt-1">
            {lowStockCount}
          </p>
        </button>

        <button
          onClick={() => setStockLevelFilter("out")}
          className={`p-4 border text-left transition shadow-xs ${
            stockLevelFilter === "out" ? "border-rose-500 bg-rose-50 ring-1 ring-rose-500" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <span className="text-[10px] text-rose-700 uppercase font-semibold flex items-center gap-1">
            <XCircle size={12} /> Depleted (Out of Stock)
          </span>
          <p className="font-display text-2xl uppercase font-bold text-rose-700 mt-1">
            {outOfStockCount}
          </p>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 border border-gray-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search variant by product name, SKU, size, or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 pl-9 pr-3 py-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 text-xs transition"
          />
        </div>

        <select
          value={stockLevelFilter}
          onChange={(e) => setStockLevelFilter(e.target.value as any)}
          className="bg-white border border-gray-300 px-3 py-2 text-ink outline-none focus:border-ink uppercase text-xs transition"
        >
          <option value="all">All Stock Statuses</option>
          <option value="low">Low Stock (≤ Threshold)</option>
          <option value="out">Out of Stock (= 0)</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="border border-gray-200 bg-white overflow-x-auto shadow-xs">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px]">
              <th className="p-4">Silhouette</th>
              <th className="p-4">Variant (Size / Color)</th>
              <th className="p-4">Current Units</th>
              <th className="p-4">Low Alert At</th>
              <th className="p-4">Status Indicator</th>
              <th className="p-4 text-right">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item) => {
              const isOut = item.stock_quantity === 0;
              const isLow = !isOut && item.stock_quantity <= item.low_stock_threshold;
              const prodImg = item.product?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80";

              return (
                <tr key={item.id} className="hover:bg-gray-50/60 transition">
                  {/* Silhouette info */}
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={prodImg}
                      alt="Silhouette"
                      className="h-10 w-9 object-cover bg-gray-100 border border-gray-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-ink leading-tight">
                        {item.product?.name || "Unassigned Silhouette"}
                      </p>
                      <p className="text-[10px] text-gray-400">{item.product?.sku || item.product_id}</p>
                    </div>
                  </td>

                  {/* Size & Color */}
                  <td className="p-4 text-ink">
                    <span className="font-bold text-ink">{item.size}</span>
                    <span className="text-gray-400 mx-1.5">/</span>
                    <span className="text-gray-600">{item.color}</span>
                  </td>

                  {/* Stock Quantity Controls */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStockAdjust(item, -1)}
                        className="p-1 border border-gray-300 bg-white hover:border-ink text-gray-700 hover:text-ink transition shadow-2xs"
                        title="Decrease stock by 1"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={item.stock_quantity}
                        onChange={(e) => handleStockDirectChange(item, parseInt(e.target.value, 10))}
                        className="w-14 bg-white border border-gray-300 p-1 text-center font-bold text-ink outline-none focus:border-ink transition"
                      />
                      <button
                        onClick={() => handleStockAdjust(item, 1)}
                        className="p-1 border border-gray-300 bg-white hover:border-ink text-gray-700 hover:text-ink transition shadow-2xs"
                        title="Increase stock by 1"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Threshold */}
                  <td className="p-4">
                    <input
                      type="number"
                      min="1"
                      value={item.low_stock_threshold}
                      onChange={(e) => handleThresholdChange(item, parseInt(e.target.value, 10))}
                      className="w-12 bg-white border border-gray-300 p-1 text-center text-gray-700 outline-none focus:border-ink transition"
                    />
                  </td>

                  {/* Status Indicator */}
                  <td className="p-4">
                    {isOut ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-800 uppercase font-bold border border-rose-200 bg-rose-50 px-2 py-0.5">
                        <XCircle size={11} /> Out of Stock
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 uppercase font-bold border border-amber-200 bg-amber-50 px-2 py-0.5">
                        <AlertTriangle size={11} /> Low Stock ({item.stock_quantity} left)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 uppercase font-bold border border-emerald-200 bg-emerald-50 px-2 py-0.5">
                        <CheckCircle size={11} /> Adequate ({item.stock_quantity})
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteVariant(item.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove variant"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ADD VARIANT MODAL */}
      {variantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-gray-200 p-6 shadow-2xl font-mono text-xs text-ink">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
              <h3 className="font-display text-base uppercase tracking-wider text-ink font-bold">
                Add Stock Variant
              </h3>
              <button onClick={() => setVariantModalOpen(false)} className="text-gray-400 hover:text-ink p-1 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVariant} className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Target Product *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink transition"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Size Proportion *</label>
                  <input
                    required
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="e.g. M, L, XL, EU 42"
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Color / Patina *</label>
                  <input
                    required
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="e.g. Washed indigo"
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Initial Units</label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 uppercase font-semibold text-[10px] tracking-wider">Low Stock Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 p-2 text-ink outline-none focus:border-ink placeholder:text-gray-400 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setVariantModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition text-xs uppercase font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-ink hover:bg-gray-800 px-5 py-1.5 font-bold text-white uppercase text-xs transition shadow-xs"
                >
                  Save Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
