import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Suspense, lazy, useRef, useState } from "react";
import type { Product } from "../data/catalog";
import { cx, formatMoney } from "../utils";

const AtelierFabricScene = lazy(() =>
  import("./AtelierFabricScene").then((mod) => ({ default: mod.AtelierFabricScene }))
);

type Hotspot = {
  id: string;
  x: number;
  y: number;
  title: string;
  spec: string;
  description: string;
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "collar",
    x: 48,
    y: 19,
    title: "Sculpted Collar Architecture",
    spec: "Reinforced 2x2 Ribbing",
    description: "Tailored to hold an upright, structured posture without stretching over seasons of wear.",
  },
  {
    id: "monogram",
    x: 58,
    y: 36,
    title: "DTS Monogram Screenprint",
    spec: "High-density Pigment Discharge",
    description: "Original MM graphic code deeply embedded into the weave rather than printed on top.",
  },
  {
    id: "fabric",
    x: 34,
    y: 52,
    title: "300 GSM Stonewashed Denim",
    spec: "Heavyweight Custom Mill Weave",
    description: "Artisanal deep-bleach stonewash treatment yielding one-of-a-kind marbling and drape.",
  },
  {
    id: "seam",
    x: 64,
    y: 72,
    title: "Contour Seaming & Finish",
    spec: "Double-Needle Topstitch",
    description: "Engineered curved seams to elevate movement from athletic wear into architectural evening wear.",
  },
];

type GarmentAnatomyProps = {
  featuredProduct: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
};

export function GarmentAnatomy({
  featuredProduct,
  onSelectProduct,
  onAddToCart,
}: GarmentAnatomyProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot>(HOTSPOTS[2]);
  const [fabricMouse, setFabricMouse] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const garmentY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFabricMouse({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-ink py-20 text-ivory sm:py-28"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setFabricMouse({ x: 0, y: 0 })}
    >
      {/* Tertiary: fabric 3D — material storytelling */}
      <div className="pointer-events-none absolute -right-[10%] top-0 hidden h-full w-[55%] opacity-30 lg:block">
        <Suspense fallback={null}>
          <AtelierFabricScene mouseX={fabricMouse.x} mouseY={fabricMouse.y} />
        </Suspense>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-16">
        <div className="max-w-xl border-b border-ivory/15 pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/80 font-semibold">
            Craft & Construction
          </p>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Anatomy of a silhouette
          </h2>
          <p className="mt-4 font-editorial text-base sm:text-lg leading-relaxed text-ivory/85">
            Select a detail to explore material, technique, and proportion.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Primary: garment photograph */}
          <motion.div style={{ y: garmentY }} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[3/4] overflow-hidden bg-graphite">
              <img
                src={featuredProduct.images[0]}
                alt={featuredProduct.title}
                className="h-full w-full object-cover"
                data-cursor="view"
                data-cursor-text="DETAIL"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />

              {HOTSPOTS.map((spot) => {
                const isActive = activeHotspot.id === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => setActiveHotspot(spot)}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                    aria-label={`Inspect ${spot.title}`}
                  >
                    <span
                      className={cx(
                        "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300",
                        isActive
                          ? "border-chartreuse bg-ink shadow-[0_0_12px_rgba(231,139,115,0.6)]"
                          : "border-ivory/50 bg-ink/60 hover:border-chartreuse"
                      )}
                    >
                      <span
                        className={cx(
                          "h-1.5 w-1.5 rounded-full",
                          isActive ? "bg-chartreuse" : "bg-ivory/80"
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Secondary: spec panel */}
          <div className="border border-ivory/15 bg-noir/60 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHotspot.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-chartreuse font-semibold">
                  {activeHotspot.spec}
                </span>
                <h3 className="mt-3 font-display text-2xl uppercase leading-tight sm:text-3xl">
                  {activeHotspot.title}
                </h3>
                <p className="mt-4 font-editorial text-base sm:text-lg leading-relaxed text-ivory/90">
                  {activeHotspot.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ivory/10 pt-6 font-mono text-xs">
              <div>
                <span className="text-xs uppercase tracking-wide text-ivory/70 font-medium">Piece</span>
                <p className="mt-1 text-ivory font-medium">{featuredProduct.title}</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wide text-ivory/70 font-medium">Price</span>
                <p className="mt-1 text-chartreuse font-bold">{formatMoney(featuredProduct.price)}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => onAddToCart(featuredProduct)}
                className="flex flex-1 items-center justify-center gap-2 bg-chartreuse px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink transition hover:bg-white hover:shadow-lg"
                data-magnetic="0.3"
              >
                <Sparkles size={14} className="text-ink" />
                <span>Add to Bag</span>
              </button>
              <button
                onClick={() => onSelectProduct(featuredProduct)}
                className="flex items-center justify-center gap-2 border border-white/30 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-white transition hover:border-chartreuse hover:text-chartreuse hover:bg-white/5"
              >
                <span>View Piece</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
