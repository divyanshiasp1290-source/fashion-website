import { AnimatePresence, motion } from "framer-motion";
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

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % LOOKS.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + LOOKS.length) % LOOKS.length);
  };

  return (
    <section className="relative overflow-hidden bg-bone py-20 sm:py-28">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-ink/15 pb-8 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-taupe">
              <Sparkles size={13} className="text-chartreuse" />
              <span>Couture Monograph // Campaign Looks</span>
            </div>
            <h2 className="mt-3 font-display text-3xl uppercase tracking-[-0.02em] text-ink sm:text-5xl">
              Runway Studies & Garment Tags
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-taupe">
              {activeLook.lookNumber} / 0{LOOKS.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="flex h-11 w-11 items-center justify-center border border-ink/30 bg-transparent text-ink transition hover:border-ink hover:bg-ink hover:text-ivory"
                aria-label="Previous look"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="flex h-11 w-11 items-center justify-center border border-ink/30 bg-transparent text-ink transition hover:border-ink hover:bg-ink hover:text-ivory"
                aria-label="Next look"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Lookbook Stage */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Main Visual Stage with Interactive Garment Hotspot Tags */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-graphite shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeLook.id}
                src={activeLook.image}
                alt={activeLook.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* Look Number Stamp */}
            <div className="absolute top-5 left-5 rounded bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory backdrop-blur-md">
              LOOK {activeLook.lookNumber} — {activeLook.season}
            </div>

            {/* Interactive Garment Tags on Look */}
            {activeLook.garments.map((tag) => {
              const product = products.find((p) => p.id === tag.productId);
              return (
                <div
                  key={tag.productId}
                  style={{ left: `${tag.posX}%`, top: `${tag.posY}%` }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    className="flex items-center gap-1.5 rounded-full border border-ivory/80 bg-ink/90 px-2.5 py-1 text-[10px] uppercase tracking-wide text-ivory shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-chartreuse"
                    onClick={() => product && onOpenCurator(product)}
                  >
                    <Tag size={10} className="text-chartreuse" />
                    <span className="font-mono">{tag.label}</span>
                    <span className="text-chartreuse font-mono">{formatMoney(tag.price)}</span>
                  </button>

                  {/* Hover Quick Card */}
                  {product && (
                    <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100 w-48 border border-ink/20 bg-bone p-3 shadow-2xl">
                      <p className="font-display text-xs uppercase leading-tight text-ink">{product.title}</p>
                      <p className="mt-1 font-mono text-[10px] text-chartreuse bg-ink px-1.5 py-0.5 inline-block">{formatMoney(product.price)}</p>
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="mt-2 flex w-full items-center justify-center gap-1 bg-ink py-1 text-[9px] uppercase tracking-wider text-ivory hover:bg-graphite"
                      >
                        <Eye size={10} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Look Details & Direct Purchase Flow */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-taupe">
                Campaign Study // Maison Makeeva
              </span>
              <h3 className="mt-4 font-display text-3xl uppercase tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl">
                {activeLook.title}
              </h3>
              <p className="mt-6 font-editorial text-lg leading-relaxed text-graphite/80 italic">
                "{activeLook.curatorQuote}"
              </p>

              {/* Garments in this look */}
              <div className="mt-8 border-t border-ink/15 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-taupe">
                  Composed Silhouettes ({activeLook.garments.length} Pieces)
                </p>

                <div className="mt-4 space-y-3">
                  {activeLook.garments.map((g) => {
                    const prod = products.find((p) => p.id === g.productId);
                    if (!prod) return null;
                    return (
                      <div
                        key={g.productId}
                        className="flex items-center justify-between border border-ink/10 bg-ivory/60 p-3 transition hover:border-ink/40"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="h-12 w-10 object-cover"
                          />
                          <div>
                            <p className="font-display text-xs uppercase text-ink">{prod.title}</p>
                            <p className="font-mono text-[10px] text-taupe">{prod.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-ink">
                            {formatMoney(prod.price)}
                          </span>
                          <button
                            onClick={() => onOpenCurator(prod)}
                            className="border border-ink px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ink transition hover:bg-ink hover:text-ivory"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="bg-ink px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-ivory transition hover:bg-graphite"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Look Selector Bar */}
            <div className="mt-10 flex gap-2 border-t border-ink/15 pt-6">
              {LOOKS.map((look, i) => (
                <button
                  key={look.id}
                  onClick={() => setCurrentIdx(i)}
                  className={cx(
                    "flex-1 border py-3 text-center transition-all",
                    currentIdx === i
                      ? "border-ink bg-ink text-ivory font-bold"
                      : "border-ink/20 text-taupe hover:border-ink/60"
                  )}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-wider">
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

