import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Compass, Eye, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { cx } from "../utils";

type Page = "home" | "collection" | "product" | "lookbook" | "about" | "contact" | "search" | "wishlist" | "account" | "cart";

type SignatureHeroProps = {
  go: (page: Page) => void;
};

type RunwayChapter = {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  category: string;
  seasonBadge: string;
  mainImage: string;
  insetThumbnail: string;
  insetTitle: string;
  insetSpec: string;
  coordinates: string;
  quote: string;
};

const CHAPTERS: RunwayChapter[] = [
  {
    id: "ss26",
    chapterNumber: "01",
    title: "Dress like the image.",
    subtitle: "A wardrobe of graphic silhouettes, cultural memory, and physical presence.",
    category: "Ready-To-Wear",
    seasonBadge: "SS26 Current Salon",
    mainImage: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666",
    insetThumbnail: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028",
    insetTitle: "Macro Specimen 01",
    insetSpec: "300 GSM Stonewashed Denim",
    coordinates: "48.8566° N, 2.3522° E // PARIS",
    quote: "Engineered with the weight of sculpture and the fluidity of movement.",
  },
  {
    id: "ss24",
    chapterNumber: "02",
    title: "Graphic street luxury.",
    subtitle: "Raw monochrome attitudes, collectible MM codes, and tailored defiance.",
    category: "Archive Campaign",
    seasonBadge: "SS24 Permanent Code",
    mainImage: "https://www.maisonmakeeva.com/cdn/shop/files/RebelBlack_1024x1024_crop_center.jpg?v=1717758768",
    insetThumbnail: "https://www.maisonmakeeva.com/cdn/shop/files/Screenshot_2024-06-07_at_02.55.32_1170x.png?v=1717721757",
    insetTitle: "Macro Specimen 02",
    insetSpec: "Rebel Cotton Discharges",
    coordinates: "5.6037° N, 0.1870° W // ACCRA",
    quote: "A dispatch from the underground ateliers of West Africa and Paris.",
  },
  {
    id: "athleisure",
    chapterNumber: "03",
    title: "Movement & identity.",
    subtitle: "Heavyweight jersey sets and cropped athletic silhouettes sculpted for power.",
    category: "Athleisure Study",
    seasonBadge: "Athleisure Uniform",
    mainImage: "https://www.maisonmakeeva.com/cdn/shop/files/MM_pigalle-17_1024x1024_crop_center.png?v=1731458239",
    insetThumbnail: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9664_52989f29-4f2f-4fa5-8112-24d611e627ea_1024x.jpg?v=1761580112",
    insetTitle: "Macro Specimen 03",
    insetSpec: "Sports Mesh & Contour Seams",
    coordinates: "48.8827° N, 2.3375° E // PIGALLE",
    quote: "Speed meets couture drape. Built to claim the street as a runway.",
  },
];

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function SignatureHero({ go }: { go: (page: Page) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeString, setTimeString] = useState("13:26:00 CET");
  const activeChapter = CHAPTERS[activeIdx];

  // Live Paris Time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("en-GB", { timeZone: "Europe/Paris", hour12: false }) + " CET"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3D Parallax Mouse Physics (Cuberto style spring damping)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 75, damping: 24, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Multi-plane depth calculations
  // Layer -2: Deep Monogram & Background light
  const bgX = useTransform(smoothX, [-0.5, 0.5], [-40, 40]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], [-30, 30]);
  const monogramRotate = useTransform(smoothX, [-0.5, 0.5], [8, 16]);

  // Layer -1: Midplane Runway Artwork Frame
  const imgTiltX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const imgTiltY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const imgShiftX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const imgShiftY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);

  // Layer +1: Inset Filmstrip & Specimen Plaque
  const insetX = useTransform(smoothX, [-0.5, 0.5], [32, -32]);
  const insetY = useTransform(smoothY, [-0.5, 0.5], [26, -26]);

  // Layer +2: Foreground Type & Floating Medallion
  const typeX = useTransform(smoothX, [-0.5, 0.5], [16, -16]);
  const typeY = useTransform(smoothY, [-0.5, 0.5], [12, -12]);

  // Dynamic Specular Light Glare coordinate
  const glareX = useTransform(smoothX, [-0.5, 0.5], ["25%", "75%"]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], ["20%", "70%"]);

  // Scroll Camera Rig: as you scroll, the camera gracefully recedes in 3D
  const { scrollY } = useScroll();
  const cameraScale = useTransform(scrollY, [0, 700], [1, 0.93]);
  const cameraZ = useTransform(scrollY, [0, 700], [0, -180]);
  const cameraTilt = useTransform(scrollY, [0, 700], [0, 3.5]);
  const scrollParallaxY = useTransform(scrollY, [0, 800], [0, 130]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      className="relative min-h-[96vh] w-full overflow-hidden bg-ink text-ivory select-none"
      style={{ perspective: "1600px" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-cursor="drag"
      data-cursor-text="PARIS SS26"
      aria-label="Maison Makeeva Signature Runway Stage"
    >
      <motion.div
        style={{
          scale: cameraScale,
          z: cameraZ,
          rotateX: cameraTilt,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full will-change-transform"
      >
        {/* ─────────────────────────────────────────────────────────────
            LAYER -3: Atmospheric Volumetric Light Beam (Mix-Blend Screen)
           ───────────────────────────────────────────────────────────── */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-screen"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([x, y]) =>
                `radial-gradient(circle 650px at ${x} ${y}, rgba(231, 139, 115, 0.16), transparent 70%)`
            ),
          }}
        />

        {/* Resn-Style Haute-Couture Grid Matrix */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(#f5f3ed 1px, transparent 1px), linear-gradient(90deg, #f5f3ed 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)",
          }}
        />

        {/* ─────────────────────────────────────────────────────────────
            LAYER -2: Deep 3D Architectural Monogram "MM"
           ───────────────────────────────────────────────────────────── */}
        <motion.div
          style={{ x: bgX, y: bgY, rotate: monogramRotate }}
          className="pointer-events-none absolute -right-[5%] top-[8%] z-0 select-none opacity-[0.07] font-display text-[34vw] leading-none text-ivory tracking-tighter"
          aria-hidden="true"
        >
          MM
        </motion.div>

        {/* ─────────────────────────────────────────────────────────────
            LAYER -1: 3D Tilting Runway Photograph Canvas
           ───────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            y: scrollParallaxY,
            rotateX: imgTiltX,
            rotateY: imgTiltY,
            x: imgShiftX,
            transformStyle: "preserve-3d",
          }}
          className="absolute inset-0 z-[1] will-change-transform"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.1, ease: easeOutExpo }}
              className="relative h-full w-full"
            >
              <img
                src={activeChapter.mainImage}
                alt={activeChapter.title}
                className="h-full w-full object-cover object-[50%_18%] filter brightness-[1.04] contrast-[1.06]"
              />
              {/* Cinematic Haute Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Resn-Style Corner Bracket Registration Markers */}
        <div className="pointer-events-none absolute inset-x-6 top-24 bottom-10 z-10 hidden sm:block border border-ivory/10">
          <span className="absolute -left-1.5 -top-1.5 text-chartreuse font-mono text-xs">+</span>
          <span className="absolute -right-1.5 -top-1.5 text-chartreuse font-mono text-xs">+</span>
          <span className="absolute -left-1.5 -bottom-1.5 text-chartreuse font-mono text-xs">+</span>
          <span className="absolute -right-1.5 -bottom-1.5 text-chartreuse font-mono text-xs">+</span>
          <div className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-[0.24em] text-ivory/40">
            STAGE REG. 026 // MONOGRAPH VIEW
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            LAYER +1: Floating 3D Companion "Curator Macro Specimen Plate"
           ───────────────────────────────────────────────────────────── */}
        <motion.div
          style={{
            x: insetX,
            y: insetY,
          }}
          className="pointer-events-none absolute right-8 top-36 z-20 hidden lg:block"
        >
          <div
            className="pointer-events-auto w-64 border border-ivory/20 bg-noir/85 p-3.5 shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:scale-105"
            data-cursor="view"
            data-cursor-text="SPECIMEN"
          >
            <div className="flex items-center justify-between border-b border-ivory/15 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-chartreuse">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-chartreuse animate-ping" />
                {activeChapter.insetTitle}
              </span>
              <span className="text-ivory/50">PLATE 0{activeIdx + 1}</span>
            </div>

            <div className="relative mt-2 aspect-[4/3] w-full overflow-hidden bg-graphite">
              <img
                src={activeChapter.insetThumbnail}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <span className="absolute bottom-1.5 right-1.5 bg-ink/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-ivory">
                ZOOM 100%
              </span>
            </div>

            <div className="mt-2.5 space-y-1">
              <p className="font-mono text-[10px] uppercase font-semibold tracking-wide text-ivory">
                {activeChapter.insetSpec}
              </p>
              <p className="font-editorial text-xs leading-snug text-ivory/70 italic">
                "{activeChapter.quote}"
              </p>
            </div>

            <button
              onClick={() => go("collection")}
              className="mt-3 flex w-full items-center justify-between border-t border-ivory/10 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-chartreuse transition hover:text-white"
            >
              <span>Inspect Weave</span>
              <ArrowRight size={10} />
            </button>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────────
            LAYER +2: Foreground Cinematic Typography & Monograph UI
           ───────────────────────────────────────────────────────────── */}
        <div className="relative z-20 mx-auto flex min-h-[96vh] max-w-[1650px] flex-col justify-end px-5 pb-14 pt-32 sm:px-10 sm:pb-16 lg:px-16">
          {/* Top Atelier Telemetry Bar */}
          <div className="mb-auto flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-ivory/60 border-b border-ivory/10 pb-3">
            <div className="flex items-center gap-3">
              <Compass size={12} className="text-chartreuse" />
              <span className="text-ivory">{activeChapter.coordinates}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">ATELIER CLOCK: {timeString}</span>
              <span className="text-chartreuse font-bold">ACT 0{activeIdx + 1}</span>
            </div>
          </div>

          <div className="grid items-end gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <motion.div style={{ x: typeX, y: typeY }} className="max-w-4xl">
              {/* Chapter Pill Selector */}
              <div className="mb-6 flex flex-wrap gap-2">
                {CHAPTERS.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveIdx(idx)}
                    className={cx(
                      "flex items-center gap-2 border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                      activeIdx === idx
                        ? "border-chartreuse bg-chartreuse text-ink font-bold shadow-[0_0_15px_rgba(214,255,63,0.5)]"
                        : "border-ivory/25 bg-ink/70 text-ivory/80 hover:border-ivory backdrop-blur-md"
                    )}
                  >
                    <span className={activeIdx === idx ? "text-ink" : "text-chartreuse"}>
                      {ch.chapterNumber}
                    </span>
                    <span>{ch.category}</span>
                  </button>
                ))}
              </div>

              {/* Sub-label */}
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-chartreuse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-chartreuse font-semibold">
                  {activeChapter.seasonBadge}
                </span>
              </div>

              {/* Hero Cinematic Headline with Mask Reveal */}
              <h1 className="mt-4 font-display text-[12vw] sm:text-7xl lg:text-[6.5rem] uppercase leading-[0.88] tracking-[-0.03em] text-white">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeChapter.id}
                    initial={{ opacity: 0, y: 35, skewY: 2 }}
                    animate={{ opacity: 1, y: 0, skewY: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8, ease: easeOutExpo }}
                    className="block"
                  >
                    {activeChapter.title.replace(".", "")}
                    <span className="text-chartreuse">.</span>
                  </motion.span>
                </AnimatePresence>
              </h1>

              {/* Narrative Subtitle */}
              <p className="mt-6 max-w-xl font-editorial text-lg leading-relaxed text-ivory/80 sm:text-xl">
                {activeChapter.subtitle}
              </p>

              {/* Action Group with Cuberto-Style Dual Text Rollup Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <button
                  onClick={() => go("collection")}
                  className="group relative overflow-hidden border border-chartreuse bg-chartreuse px-8 py-4 font-mono text-xs uppercase tracking-[0.24em] font-bold text-ink transition-all duration-300 hover:bg-white hover:border-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  data-cursor="view"
                  data-cursor-text="ENTER"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles size={14} />
                    <span>Enter Exhibition</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </button>

                <button
                  onClick={() => go("lookbook")}
                  className="flex items-center gap-2 border border-ivory/30 bg-ink/60 px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-ivory backdrop-blur-md transition-all hover:border-ivory hover:bg-white/10"
                  data-cursor="view"
                  data-cursor-text="LOOKS"
                >
                  <Eye size={14} />
                  <span>View Monograph</span>
                </button>
              </div>
            </motion.div>

            {/* ─────────────────────────────────────────────────────────────
                LAYER +3: 3D Magnetic Spinning Seal & Chapter Scrub Progress
               ───────────────────────────────────────────────────────────── */}
            <div className="flex flex-col items-start lg:items-end justify-between h-full gap-8">
              {/* Interactive 3D Spinning Medallion */}
              <button
                onClick={() => go("lookbook")}
                className="group relative flex h-28 w-28 items-center justify-center rounded-full border border-chartreuse bg-ink text-ivory shadow-[0_0_25px_rgba(214,255,63,0.3)] transition-transform duration-500 hover:scale-110"
                aria-label="Open SS26 Monograph Lookbook"
                data-cursor="view"
                data-cursor-text="OPEN"
              >
                {/* Rotating outer typography SVG text */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full animate-[spin_12s_linear_infinite]"
                >
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="font-mono text-[9px] uppercase tracking-[0.28em] fill-chartreuse font-semibold">
                    <textPath href="#circlePath">
                      · MAISON MAKEEVA · SS26 SALON ·
                    </textPath>
                  </text>
                </svg>

                {/* Center MM glyph */}
                <div className="relative flex flex-col items-center justify-center">
                  <span className="font-display text-lg font-bold tracking-widest text-ivory">MM</span>
                  <span className="h-1 w-1 rounded-full bg-chartreuse" />
                </div>
              </button>

              {/* Chapter Timeline Progress Scrubber */}
              <div className="w-full max-w-xs border-t border-ivory/15 pt-4">
                <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-ivory/60">
                  <span>Runway Chapter</span>
                  <span className="text-chartreuse font-bold">
                    0{activeIdx + 1} / 0{CHAPTERS.length}
                  </span>
                </div>

                <div className="mt-2.5 flex gap-1.5">
                  {CHAPTERS.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => setActiveIdx(idx)}
                      className="group relative h-2 flex-1 overflow-hidden bg-ivory/20 transition hover:bg-ivory/40"
                      aria-label={`Jump to chapter 0${idx + 1}`}
                    >
                      {activeIdx === idx && (
                        <motion.div
                          layoutId="activeScrubBar"
                          className="h-full w-full bg-chartreuse"
                          transition={{ duration: 0.4 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <p className="mt-2 font-mono text-[9px] uppercase text-ivory/50 truncate">
                  {activeChapter.category} — {activeChapter.coordinates.split("//")[1]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Shadow Blade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink to-transparent z-10" />
      </motion.div>
    </section>
  );
}