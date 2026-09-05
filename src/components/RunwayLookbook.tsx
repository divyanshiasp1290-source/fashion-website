import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, Sparkles, Tag } from "lucide-react";
import { useState } from "react";
import { collections, products, type Product } from "../data/catalog";
import { cx, formatMoney } from "../utils";

type LookItem = {
  id: string;
  lookNumber: string;
  title: string;
  season: string;
  image: string;
  curatorQuote: string;
  garments: {
    productId: string;
    label: string;
    price: number;
    posX: number; // percentage
    posY: number; // percentage
  }[];
};

const LOOKS: LookItem[] = [
  {
    id: "look-01",
    lookNumber: "01",
    title: "The Bleached Monolith",
    season: "Spring Summer SS26",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666",
    curatorQuote: "A unified silhouette with high-contrast wash treatments and Makeeva graphics, designed as a complete look rather than separates.",
    garments: [
      {
        productId: "gid://shopify/Product/mm-bovinille-101",
        label: "Bovinille Tracksuit Set",
        price: 175,
        posX: 52,
        posY: 42,
      },
    ],
  },
  {
    id: "look-02",
    lookNumber: "02",
    title: "Architectural Workwear",
    season: "Spring Summer SS26",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028",
    curatorQuote: "Engineered with the density of workwear and the finish of a campaign piece. Stonewashed denim featuring iconic DTS monogram prints.",
    garments: [
      {
        productId: "gid://shopify/Product/mm-orion202",
        label: "Orion202 Denim Set",
        price: 250,
        posX: 48,
        posY: 38,
      },
      {
        productId: "gid://shopify/Product/mm-agendia-007",
        label: "Agendia 007 Duffle",
        price: 535,
        posX: 72,
        posY: 68,
      },
    ],
  },
  {
    id: "look-03",
    lookNumber: "03",
    title: "Sublimated Sports Energy",
    season: "Athleisure Campaign",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9664_52989f29-4f2f-4fa5-8112-24d611e627ea_1024x.jpg?v=1761580112",
    curatorQuote: "A fierce two-piece campaign look that compresses Makeeva’s graphic confidence into a summer uniform.",
    garments: [
      {
        productId: "gid://shopify/Product/mm-roar",
        label: "Roar-With-Fierce Jersey Set",
        price: 65,
        posX: 50,
        posY: 45,
      },
    ],
  },
  {
    id: "look-04",
    lookNumber: "04",
    title: "Velvet Contour Uniform",
    season: "Spring Summer SS26",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823",
    curatorQuote: "Plush uniform: elevated loungewear made precise, graphic, and evening-capable.",
    garments: [
      {
        productId: "gid://shopify/Product/mm-ntoube-302",
        label: "Ntoube-302 Velvet Track Set",
        price: 250,
        posX: 52,
        posY: 40,
      },
    ],
  },
];

type RunwayLookbookProps = {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenCurator: (product: Product) => void;
};

export function RunwayLookbook({
  onSelectProduct,
  onAddToCart,
  onOpenCurator,
}: RunwayLookbookProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const activeLook = LOOKS[currentIdx];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 90, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 90, damping: 22 });
  const tiltX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const tiltY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % LOOKS.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + LOOKS.length) % LOOKS.length);
  };

  return (
    <section className="relative overflow-hidden bg-transparent py-14 sm:py-28 border-t border-ink/10">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:gap-6 border-b border-ink/15 pb-6 sm:pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] sm:tracking-[0.24em] text-taupe font-semibold">
              <Sparkles size={13} className="text-chartreuse" />
              <span>Couture Monograph // Campaign Looks</span>
            </div>
            <h2 className="mt-2 sm:mt-3 font-display text-2xl uppercase tracking-[-0.02em] text-ink sm:text-5xl">
              Runway Studies & Garment Tags
            </h2>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
            <span className="font-mono text-xs text-taupe">
              {activeLook.lookNumber} / 0{LOOKS.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center border border-ink/30 bg-transparent text-ink transition hover:border-chartreuse hover:bg-ink hover:text-chartreuse active:scale-95"
                aria-label="Previous look"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center border border-ink/30 bg-transparent text-ink transition hover:border-chartreuse hover:bg-ink hover:text-chartreuse active:scale-95"
                aria-label="Next look"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Lookbook Stage */}
        <div className="mt-8 sm:mt-12 grid gap-8 sm:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Main Visual Stage with Interactive Garment Hotspot Tags */}
          <motion.div
            className="relative aspect-[3/4] w-full overflow-hidden bg-graphite shadow-2xl"
            style={{ perspective: "1200px" }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            data-cursor="view"
            data-cursor-text="LOOK"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeLook.id}
                src={activeLook.image}
                alt={activeLook.title}
                loading="lazy"
                style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full object-cover will-change-transform"
              />
            </AnimatePresence>

            {/* Look Number Stamp */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 rounded bg-ink/80 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] text-chartreuse backdrop-blur-md border border-white/10 font-semibold">
              LOOK {activeLook.lookNumber} — {activeLook.season}
            </div>

            {/* Interactive Garment Tags on Look: Clamped positions to never clip */}
            {activeLook.garments.map((tag) => {
              const product = products.find((p) => p.id === tag.productId);
              const clampedX = Math.min(80, Math.max(20, tag.posX));
              const clampedY = Math.min(85, Math.max(15, tag.posY));
              return (
                <div
                  key={tag.productId}
                  style={{ left: `${clampedX}%`, top: `${clampedY}%` }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    className="flex items-center gap-1.5 rounded-full border border-ivory/80 bg-ink/90 px-2.5 sm:px-3 py-1 text-xs uppercase tracking-wide text-ivory shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-chartreuse active:scale-95 font-medium"
                    onClick={() => product && onOpenCurator(product)}
                  >
                    <Tag size={12} className="text-chartreuse" />
                    <span className="font-mono">{tag.label}</span>
                    <span className="text-chartreuse font-mono font-bold">{formatMoney(tag.price)}</span>
                  </button>

                  {/* Hover Quick Card */}
                  {product && (
                    <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100 w-44 sm:w-48 border border-ink/20 bg-bone p-3 shadow-2xl">
                      <p className="font-display text-xs uppercase leading-tight text-ink font-semibold">{product.title}</p>
                      <p className="mt-1 font-mono text-xs text-chartreuse bg-ink px-1.5 py-0.5 inline-block font-bold">{formatMoney(product.price)}</p>
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="mt-2 flex w-full items-center justify-center gap-1 bg-ink py-1.5 text-xs uppercase tracking-wider text-ivory hover:bg-graphite hover:text-chartreuse font-semibold"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Look Details & Direct Purchase Flow */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] sm:tracking-[0.24em] text-taupe font-semibold">
                Campaign Study // Maison Makeeva
              </span>
              <h3 className="mt-2 sm:mt-4 font-display text-2xl sm:text-4xl lg:text-5xl uppercase tracking-[-0.02em] text-ink">
                {activeLook.title}
              </h3>
              <p className="mt-4 sm:mt-6 font-editorial text-lg sm:text-xl md:text-2xl leading-relaxed text-graphite/90 italic">
                "{activeLook.curatorQuote}"
              </p>

              {/* Garments in this look */}
              <div className="mt-6 sm:mt-8 border-t border-ink/15 pt-5 sm:pt-6">
                <p className="font-mono text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] text-taupe font-semibold">
                  Composed Silhouettes ({activeLook.garments.length} Pieces)
                </p>

                <div className="mt-3 sm:mt-4 space-y-3">
                  {activeLook.garments.map((g) => {
                    const prod = products.find((p) => p.id === g.productId);
                    if (!prod) return null;
                    return (
                      <div
                        key={g.productId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between border border-ink/10 bg-ivory/60 p-3 transition hover:border-ink/40 gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="h-12 w-10 object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-display text-xs uppercase text-ink truncate font-semibold">{prod.title}</p>
                            <p className="font-mono text-xs text-taupe">{prod.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/10">
                          <span className="font-mono text-xs font-semibold text-ink">
                            {formatMoney(prod.price)}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onOpenCurator(prod)}
                              className="border border-ink px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ink transition hover:bg-ink hover:text-ivory min-h-[32px] font-semibold"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => onAddToCart(prod)}
                              className="bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ivory transition hover:bg-graphite min-h-[32px] font-semibold"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Look Selector Bar */}
            <div className="mt-8 sm:mt-10 grid grid-cols-4 gap-1.5 sm:gap-2 border-t border-ink/15 pt-5 sm:pt-6">
              {LOOKS.map((look, i) => (
                <button
                  key={look.id}
                  onClick={() => setCurrentIdx(i)}
                  className={cx(
                    "border py-2.5 sm:py-3 text-center transition-all",
                    currentIdx === i
                      ? "border-ink bg-ink text-ivory font-bold"
                      : "border-ink/20 text-taupe hover:border-ink/60"
                  )}
                >
                  <span className="block font-mono text-xs uppercase tracking-wider truncate px-1 font-semibold">
                    Look 0{i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

