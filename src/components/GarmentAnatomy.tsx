import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Product } from "../data/catalog";
import { cx, formatMoney } from "../utils";

type Hotspot = {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
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
    description: "Original MM graphic code deeply embedded into the weave rather than printed on top, maintaining velvet softness.",
  },
  {
    id: "fabric",
    x: 34,
    y: 52,
    title: "300 GSM Stonewashed Denim",
    spec: "Heavyweight Custom Mill Weave",
    description: "Artisanal deep-bleach stonewash treatment yielding one-of-a-kind marbling and drape across each individual set.",
  },
  {
    id: "seam",
    x: 64,
    y: 72,
    title: "Contour Seaming & Finish",
    spec: "Double-Needle Topstitch",
    description: "Engineered curved seams along the lateral lines to elevate movement from athletic wear into architectural evening wear.",
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

  return (
    <section className="relative overflow-hidden bg-ink py-20 text-ivory sm:py-28">
      {/* Background Archival Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#f5f3ed 1px, transparent 1px), linear-gradient(90deg, #f5f3ed 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-ivory/15 pb-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-chartreuse">
              <Compass size={13} />
              <span>Living Archive / Anatomy of Form</span>
            </div>
            <h2 className="mt-3 font-display text-3xl uppercase tracking-[-0.02em] sm:text-5xl">
              Deconstructed Silhouette
            </h2>
          </div>
          <p className="max-w-md font-editorial text-sm leading-relaxed text-ivory/70">
            Every Maison Makeeva piece is built at the intersection of cultural artifact and technical garment. Click the architectural points to inspect construction specs.
          </p>
        </div>

        {/* Interactive Anatomy Stage */}
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          {/* Garment Visual with Interactive Hotspots */}
          <div className="relative mx-auto aspect-[3/4] w-full max-w-lg overflow-hidden border border-ivory/20 bg-graphite shadow-2xl sm:max-w-xl">
            <img
              src={featuredProduct.images[0]}
              alt={featuredProduct.title}
              className="h-full w-full object-cover filter contrast-[1.05]"
            />

            {/* Subtle Vignette & Spec Overlays */}
            <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-transparent to-ink/40" />

            {/* Coordinates Badge */}
            <div className="absolute top-4 left-4 rounded bg-ink/75 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ivory/80 backdrop-blur-md">
              OBJ // {featuredProduct.handle.toUpperCase()}
            </div>

            {/* Hotspots */}
            {HOTSPOTS.map((spot) => {
              const isActive = activeHotspot.id === spot.id;
              return (
                <button
                  key={spot.id}
                  onClick={() => setActiveHotspot(spot)}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  aria-label={`Inspect ${spot.title}`}
                >
                  <span
                    className={cx(
                      "relative flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300",
                      isActive
                        ? "border-chartreuse bg-ink shadow-[0_0_15px_rgba(214,255,63,0.6)]"
                        : "border-ivory/60 bg-ink/70 hover:border-chartreuse"
                    )}
                  >
                    {/* Pulsing ring */}
                    {isActive && (
                      <span className="absolute inset-0 -m-1 rounded-full border border-chartreuse animate-ping opacity-60" />
                    )}
                    <span
                      className={cx(
                        "h-2 w-2 rounded-full transition-colors duration-300",
                        isActive ? "bg-chartreuse" : "bg-ivory group-hover:bg-chartreuse"
                      )}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Spec Panel */}
          <div className="flex flex-col justify-between rounded-none border border-ivory/20 bg-noir/80 p-8 shadow-xl backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-chartreuse">
                  Technical Spec Sheet
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ivory/50">
                  Point 0{HOTSPOTS.findIndex((s) => s.id === activeHotspot.id) + 1} / 04
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHotspot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <span className="inline-block rounded-full bg-chartreuse/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-chartreuse">
                    {activeHotspot.spec}
                  </span>
                  <h3 className="mt-3 font-display text-2xl uppercase tracking-[-0.01em] text-ivory sm:text-3xl">
                    {activeHotspot.title}
                  </h3>
                  <p className="mt-4 font-editorial text-base leading-relaxed text-ivory/75">
                    {activeHotspot.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Garment Highlights Table */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ivory/10 pt-6 font-mono text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-ivory/50">Object</span>
                  <p className="mt-1 text-ivory">{featuredProduct.title}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-ivory/50">Valuation</span>
                  <p className="mt-1 text-chartreuse">{formatMoney(featuredProduct.price)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-ivory/50">Textile</span>
                  <p className="mt-1 text-ivory">{featuredProduct.materials[0]}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-ivory/50">Edition</span>
                  <p className="mt-1 text-ivory">Spring Summer SS26</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => onAddToCart(featuredProduct)}
                className="flex flex-1 items-center justify-center gap-2 border border-chartreuse bg-chartreuse px-6 py-4 text-xs uppercase tracking-[0.2em] text-ink font-semibold transition hover:bg-transparent hover:text-chartreuse"
              >
                <Sparkles size={14} />
                <span>Acquire Complete Set</span>
              </button>
              <button
                onClick={() => onSelectProduct(featuredProduct)}
                className="flex items-center justify-center gap-2 border border-ivory/30 px-6 py-4 text-xs uppercase tracking-[0.2em] text-ivory transition hover:border-ivory hover:bg-white/5"
              >
                <span>Full Monograph</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
