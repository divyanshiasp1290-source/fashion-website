import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Eye, Heart, Plus, Sparkles } from "lucide-react";
import React, { useState } from "react";
import type { Product } from "../data/catalog";
import { useIsTouchDevice, useReducedMotion } from "../hooks/useReducedMotion";
import { cx, formatMoney } from "../utils";

type ProductCardProps = {
  product: Product;
  index?: number;
  wished: boolean;
  onSelect: (product: Product) => void;
  onWish: () => void;
  onAdd: (product: Product, size?: string) => void;
  onCuratorInspect: (product: Product) => void;
  viewMode?: "atelier" | "grid" | "runway";
};

export function ProductCard3D({
  product,
  index = 0,
  wished,
  onSelect,
  onWish,
  onAdd,
  onCuratorInspect,
  viewMode = "atelier",
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [addedEffect, setAddedEffect] = useState(false);
  const [specularPos, setSpecularPos] = useState({ x: 50, y: 50 });
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 22 });

  // Subtle 3D perspective depth for desktop only
  const imageTiltX = useTransform(smoothY, [-0.5, 0.5], isTouch || reducedMotion ? [0, 0] : [3.5, -3.5]);
  const imageTiltY = useTransform(smoothX, [-0.5, 0.5], isTouch || reducedMotion ? [0, 0] : [-3.5, 3.5]);
  const imageShiftX = useTransform(smoothX, [-0.5, 0.5], isTouch || reducedMotion ? [0, 0] : [-4, 4]);
  const imageShiftY = useTransform(smoothY, [-0.5, 0.5], isTouch || reducedMotion ? [0, 0] : [-3, 3]);

  const isRunway = viewMode === "runway";

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTouch || reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x - 0.5);
    mouseY.set(y - 0.5);
    setSpecularPos({ x: Math.round(x * 100), y: Math.round(y * 100) });
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(product, selectedSize);
    setAddedEffect(true);
    setTimeout(() => setAddedEffect(false), 1200);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, delay: Math.min((index % 6) * 0.05, 0.25) }}
      className={cx(
        "group relative flex flex-col",
        isRunway ? "w-[280px] sm:w-[320px] shrink-0" : "w-full"
      )}
    >
      <div className="relative flex flex-col overflow-hidden border border-ink/15 bg-bone transition-all duration-300 hover:border-chartreuse/50 hover:shadow-2xl will-change-transform">
        {/* Interactive Media Container with 3D Depth */}
        <div
          className="relative aspect-[3/4] w-full overflow-hidden bg-parchment cursor-pointer"
          style={{ perspective: "1000px" }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={() => onSelect(product)}
          data-cursor="view"
          data-cursor-text="VIEW"
        >
          <motion.div
            style={{
              rotateX: imageTiltX,
              rotateY: imageTiltY,
              x: imageShiftX,
              y: imageShiftY,
              transformStyle: "preserve-3d",
            }}
            className="relative h-full w-full will-change-transform"
          >
            <img
              src={product.images[0]}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

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
          </motion.div>

          {/* Dynamic Studio Specular Glaze Layer */}
          {!isTouch && !reducedMotion && (
            <div
              className="pointer-events-none absolute inset-0 z-[6] opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-overlay"
              style={{
                background: `radial-gradient(circle 240px at ${specularPos.x}% ${specularPos.y}%, rgba(255,255,255,0.45) 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Archive Badge */}
          {product.badge && (
            <div className="absolute left-3 top-3 z-10">
              <span className="flex items-center gap-1.5 bg-ink px-2.5 py-1 font-mono text-xs uppercase tracking-[0.18em] text-white shadow-md border border-white/10 font-semibold">
                <Sparkles size={11} className="text-chartreuse" />
                {product.badge}
              </span>
            </div>
          )}

          {/* Archival Edition Number */}
          <div className="absolute right-3 top-3 z-10">
            <span className="bg-ink/75 px-2 py-0.5 font-mono text-xs uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm font-medium">
              0{index + 1} // SS26
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWish();
            }}
            className="absolute right-3 bottom-3 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-ink/80 text-white backdrop-blur-md transition hover:bg-black hover:scale-110 active:scale-95 hover:border hover:border-chartreuse"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            data-magnetic="0.25"
          >
            <Heart
              size={14}
              fill={wished ? "currentColor" : "none"}
              className={wished ? "text-chartreuse fill-chartreuse" : ""}
            />
          </button>

          {/* Curator Quick View Inspection: Visible on touch/mobile and on desktop hover */}
          <div className="absolute left-3 bottom-3 z-20 flex items-center justify-start opacity-100 md:opacity-0 transition-opacity duration-250 md:group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCuratorInspect(product);
              }}
              className="flex items-center gap-1 bg-ink/85 px-2.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-lg backdrop-blur-md transition hover:bg-black hover:text-chartreuse border border-white/20 active:scale-95"
              data-magnetic="0.2"
              title="Inspect 3D Specimen"
              aria-label="Inspect 3D Specimen"
            >
              <Eye size={13} className="text-chartreuse" />
              <span className="hidden xs:inline sm:inline">Curator</span>
            </button>
          </div>
        </div>

        {/* Clear, High-Readability Product Meta and Buying Controls */}
        <div className="flex flex-col justify-between p-3 sm:p-5 bg-bone">
          <div>
            <div className="flex items-center justify-between gap-2 font-mono text-xs uppercase tracking-wide text-taupe font-medium">
              <span className="truncate">{product.category}</span>
              <span className="font-semibold text-ink text-xs sm:text-[15px] shrink-0">{formatMoney(product.price)}</span>
            </div>

            <button
              onClick={() => onSelect(product)}
              className="mt-1.5 sm:mt-2 text-left font-sans text-xs sm:text-base font-semibold uppercase leading-snug tracking-tight text-ink transition-colors hover:text-taupe line-clamp-2"
            >
              {product.title}
            </button>
          </div>

          {/* Proportions & Quick Add Section */}
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3.5 border-t border-ink/10">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex flex-wrap gap-1 max-w-[65%]">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(s);
                    }}
                    className={cx(
                      "h-6 sm:h-7 min-w-6 sm:min-w-7 px-1.5 sm:px-2 font-mono text-xs font-semibold transition-colors",
                      selectedSize === s
                        ? "bg-ink text-chartreuse font-bold border border-chartreuse shadow-sm"
                        : "border border-ink/25 text-ink hover:border-chartreuse hover:text-chartreuse"
                    )}
                    aria-label={`Select size ${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAdd}
                className={cx(
                  "flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shrink-0 min-h-[30px]",
                  addedEffect
                    ? "bg-chartreuse text-ink border border-chartreuse font-bold shadow-md"
                    : "bg-ink text-white hover:bg-chartreuse hover:text-ink shadow-sm"
                )}
                title={`Add size ${selectedSize} to bag`}
                data-magnetic="0.25"
              >
                <Plus size={12} />
                <span>{addedEffect ? "Added" : "Add"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export const ProductCard = ProductCard3D;
