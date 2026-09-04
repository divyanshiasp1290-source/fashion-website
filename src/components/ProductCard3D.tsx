import { motion } from "framer-motion";
import { Eye, Heart, Plus, Sparkles } from "lucide-react";
import React, { useState } from "react";
import type { Product } from "../data/catalog";
import { cx, formatMoney } from "../utils";

type ProductCardProps = {
  product: Product;
  index?: number;
  wished: boolean;
  onSelect: (product: Product) => void;
  onWish: () => void;
  onAdd: (product: Product, size?: string) => void;
  onCuratorInspect: (product: Product) => void;
  viewMode?: "salon" | "grid" | "runway";
};

export function ProductCard3D({
  product,
  index = 0,
  wished,
  onSelect,
  onWish,
  onAdd,
  onCuratorInspect,
  viewMode = "salon",
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");

  const isRunway = viewMode === "runway";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: Math.min((index % 6) * 0.06, 0.3) }}
      className={cx(
        "group relative flex flex-col",
        isRunway ? "w-[280px] sm:w-[330px] shrink-0" : "w-full"
      )}
    >
      <div className="relative flex flex-col overflow-hidden border border-ink/15 bg-bone transition-all duration-300 hover:border-ink/40 hover:shadow-lg">
        {/* Media Container (Clean 2D, smooth photo crossfade) */}
        <div
          className="relative aspect-[3/4] w-full overflow-hidden bg-parchment cursor-pointer"
          onClick={() => onSelect(product)}
        >
          {/* Main Primary Image */}
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          {/* Secondary Alternate Angle on Hover */}
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-400 ease-in-out group-hover:opacity-100"
            />
          )}

          {/* Badge Tag */}
          {product.badge && (
            <div className="absolute left-3 top-3 z-10">
              <span className="flex items-center gap-1.5 bg-ink/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ivory backdrop-blur-md">
                <Sparkles size={10} className="text-chartreuse" />
                {product.badge}
              </span>
            </div>
          )}

          {/* Archival Object Code */}
          <div className="absolute right-3 top-3 z-10">
            <span className="rounded bg-ink/65 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ivory/80 backdrop-blur-sm">
              0{index + 1} // SS26
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWish();
            }}
            className="absolute right-3 bottom-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-ivory backdrop-blur-md transition hover:bg-ink hover:text-chartreuse hover:scale-110"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={14}
              fill={wished ? "currentColor" : "none"}
              className={wished ? "text-chartreuse fill-chartreuse" : ""}
            />
          </button>

          {/* Floating Curator Inspect Button on Hover */}
          <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCuratorInspect(product);
              }}
              className="flex items-center gap-1.5 bg-ivory/95 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink shadow-md backdrop-blur-md transition hover:bg-chartreuse hover:text-ink"
            >
              <Eye size={12} />
              <span>Curator View</span>
            </button>
          </div>
        </div>

        {/* Card Metadata */}
        <div className="flex flex-col justify-between p-4 sm:p-5 bg-bone">
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wideLuxury text-taupe font-mono">
              <span>{product.category}</span>
              <span className="text-ink font-semibold">{formatMoney(product.price)}</span>
            </div>

            <button
              onClick={() => onSelect(product)}
              className="mt-2 text-left font-display text-sm uppercase leading-snug tracking-tight text-ink transition-colors hover:text-taupe"
            >
              {product.title}
            </button>
          </div>

          {/* Tactile Quick Size Pills & Instant Add */}
          <div className="mt-4 pt-3 border-t border-ink/10">
            <div className="flex items-center justify-between gap-1">
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={cx(
                      "h-6 min-w-6 px-1.5 text-[10px] font-mono transition-colors",
                      selectedSize === s
                        ? "bg-ink text-ivory font-bold"
                        : "border border-ink/20 text-taupe hover:border-ink hover:text-ink"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onAdd(product, selectedSize)}
                className="flex items-center gap-1 bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ivory transition hover:bg-chartreuse hover:text-ink"
                title={`Add size ${selectedSize} to bag`}
              >
                <Plus size={11} />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// Export clean alias as well
export const ProductCard = ProductCard3D;
