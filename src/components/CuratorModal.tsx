import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Layers, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../data/catalog";
import { cx, formatMoney } from "../utils";

type CuratorModalProps = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
};

export function CuratorModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: CuratorModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "M");
      setActiveImgIndex(0);
      setAdded(false);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (product) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/80 p-3 sm:p-6 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-none border border-ivory/20 bg-bone shadow-2xl"
        >
          {/* Top Archival Header Strip */}
          <div className="flex items-center justify-between border-b border-ink/15 bg-ink px-6 py-3 text-ivory">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-chartreuse animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ivory/70">
                Curator's Specimen / {product.id.split("/").pop()}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-ivory/70 hover:bg-white/10 hover:text-white transition"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            {/* Gallery Left */}
            <div className="relative flex flex-col bg-graphite p-4 sm:p-6">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-parchment">
                <img
                  src={product.images[activeImgIndex] || product.images[0]}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 rounded bg-ink/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ivory backdrop-blur-sm">
                  Plate 0{activeImgIndex + 1} / 0{product.images.length}
                </span>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="mt-4 flex gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImgIndex(i)}
                      className={cx(
                        "h-16 w-14 overflow-hidden border transition",
                        activeImgIndex === i ? "border-chartreuse" : "border-white/20 opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spec Details Right */}
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-taupe">
                    {product.category} · {product.collection.toUpperCase()}
                  </span>
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="p-1 text-ink hover:text-taupe transition"
                    aria-label="Toggle wishlist"
                  >
                    <Heart
                      size={18}
                      fill={isWishlisted ? "currentColor" : "none"}
                      className={isWishlisted ? "text-chartreuse fill-chartreuse" : ""}
                    />
                  </button>
                </div>

                <h2 className="mt-2 font-display text-2xl uppercase tracking-[-0.02em] sm:text-3xl">
                  {product.title}
                </h2>
                <p className="mt-3 font-mono text-lg font-medium text-ink">
                  {formatMoney(product.price)}
                </p>

                <p className="mt-4 font-editorial text-sm leading-relaxed text-graphite/80">
                  {product.story}
                </p>

                {/* Fabric & Material Details */}
                <div className="mt-6 border-t border-ink/10 pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wideLuxury text-taupe">
                    <Layers size={13} />
                    <span>Fabrication & Finish</span>
                  </div>
                  <ul className="mt-2 space-y-1 font-mono text-[11px] text-ink/80">
                    {product.materials.map((mat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-taupe" />
                        {mat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Size Selector */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wideLuxury">
                    <span className="text-taupe">Select Proportion / Size</span>
                    <span className="font-mono text-[10px] text-taupe">Fit: True to Size</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={cx(
                          "min-w-[44px] border px-3 py-2 text-xs font-mono transition-all",
                          selectedSize === s
                            ? "border-ink bg-ink text-ivory shadow-sm"
                            : "border-ink/20 hover:border-ink"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-4 border-t border-ink/10">
                <button
                  onClick={handleAdd}
                  disabled={added}
                  className={cx(
                    "flex w-full items-center justify-center gap-2 py-4 text-xs font-medium uppercase tracking-[0.2em] transition duration-300",
                    added
                      ? "bg-chartreuse text-ink"
                      : "bg-ink text-ivory hover:bg-graphite"
                  )}
                >
                  {added ? (
                    <>
                      <Check size={16} />
                      <span>Acquired to Bag</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-chartreuse" />
                      <span>Add to Bag — {formatMoney(product.price)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

