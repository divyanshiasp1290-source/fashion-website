import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NoirIntroScene3D } from "./NoirIntroScene3D";

type ResnBrandIntroProps = {
  onComplete: () => void;
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function ResnBrandIntro({ onComplete }: ResnBrandIntroProps) {
  const [progress, setProgress] = useState(0);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Fast, elegant precision counter that doesn't block shopping
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 6;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => triggerExit(), 400);
      } else {
        setProgress(current);
      }
    }, 45);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        triggerExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const triggerExit = () => {
    if (isSplitting) return;
    setIsSplitting(true);
    setTimeout(() => {
      setIsFinished(true);
      onComplete();
    }, 750);
  };

  if (isFinished) return null;

  return (
    <div
      className="fixed inset-0 z-[150] pointer-events-auto flex items-center justify-center overflow-hidden select-none cursor-pointer"
      onClick={triggerExit}
      aria-label="Maison Makeeva Preloader"
    >
      {/* Top Split Curtain */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isSplitting ? "-100%" : "0%" }}
        transition={{ duration: 0.75, ease: easeOutExpo }}
        className="absolute inset-x-0 top-0 h-1/2 bg-ink z-10 border-b border-white/15"
      />

      {/* Bottom Split Curtain */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isSplitting ? "100%" : "0%" }}
        transition={{ duration: 0.75, ease: easeOutExpo }}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-ink z-10 border-t border-white/15"
      />

      {/* 3D Pure Black Velvet Fabric Simulation + 3D Camera + Parallax + Lighting */}
      <div className="absolute inset-0 z-[15] pointer-events-none">
        <NoirIntroScene3D />
      </div>

      {/* Center Cinematic Content */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isSplitting ? 0 : 1, scale: isSplitting ? 1.04 : 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-20 flex h-full w-full flex-col justify-between p-4 sm:p-12 text-white pointer-events-none"
      >
        {/* Telemetry Header */}
        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.14em] sm:tracking-[0.2em] text-white/80 border-b border-white/10 pb-3 sm:pb-4 gap-2 font-medium">
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-chartreuse animate-ping shrink-0" />
            <span className="truncate">HAUTE ATELIER // PARIS · ACCRA</span>
          </div>
          <div className="hidden md:block shrink-0">
            <span>LAT 48.8566° N · LON 2.3522° E</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerExit();
            }}
            className="pointer-events-auto text-chartreuse hover:underline tracking-[0.16em] sm:tracking-[0.2em] shrink-0 font-bold p-1"
          >
            <span className="hidden sm:inline">SKIP INTRO [ESC]</span>
            <span className="sm:hidden">SKIP →</span>
          </button>
        </div>

        {/* Centerpiece: Self-Drawing Geometric MM Monogram & Kinetic Typography */}
        <div className="mx-auto flex flex-col items-center justify-center text-center px-2">
          {/* Animated SVG Monogram Vector */}
          <div className="relative h-24 w-28 sm:h-40 sm:w-48 mb-4 sm:mb-6">
            <svg viewBox="0 0 462 392" className="h-full w-full drop-shadow-[0_4px_24px_rgba(231,139,115,0.25)]">
              {/* Central Structural M */}
              <motion.path
                d="M 387 0 L 387 338 L 335 390 L 334 388 L 333 149 L 242 239 L 239 239 L 230 231 L 143 149 L 142 388 L 139 389 L 78 337 L 75 332 L 75 1 L 81 4 L 240 146 L 387 0 Z"
                stroke="#e78b73"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1400"
                initial={{ strokeDashoffset: 1400, fillOpacity: 0 }}
                animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
                transition={{
                  strokeDashoffset: { duration: 1.6, ease: easeOutExpo },
                  fillOpacity: { duration: 0.8, delay: 0.8, ease: "easeOut" },
                }}
                fill="#e78b73"
              />

              {/* Outer Left Wing */}
              <motion.path
                d="M 13 68 L 68 146 L 68 222 L 54 205 L 51 206 L 48 317 L 0 280 L 13 68 Z"
                stroke="#e78b73"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="800"
                initial={{ strokeDashoffset: 800, fillOpacity: 0 }}
                animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
                transition={{
                  strokeDashoffset: { duration: 1.4, ease: easeOutExpo, delay: 0.15 },
                  fillOpacity: { duration: 0.8, delay: 0.85, ease: "easeOut" },
                }}
                fill="#e78b73"
              />

              {/* Outer Right Wing */}
              <motion.path
                d="M 448 68 L 461 281 L 414 317 L 411 212 L 409 204 L 394 222 L 394 146 L 448 68 Z"
                stroke="#e78b73"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="800"
                initial={{ strokeDashoffset: 800, fillOpacity: 0 }}
                animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
                transition={{
                  strokeDashoffset: { duration: 1.4, ease: easeOutExpo, delay: 0.15 },
                  fillOpacity: { duration: 0.8, delay: 0.85, ease: "easeOut" },
                }}
                fill="#e78b73"
              />

              {/* Inner Nested V / Chevron (Two M inside One M effect) */}
              <motion.path
                d="M 174 218 L 238 280 L 241 280 L 300 218 L 300 282 L 237 343 L 175 280 L 174 218 Z"
                stroke="#f5f3ed"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="600"
                initial={{ strokeDashoffset: 600, fillOpacity: 0 }}
                animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
                transition={{
                  strokeDashoffset: { duration: 1.2, ease: easeOutExpo, delay: 0.3 },
                  fillOpacity: { duration: 0.8, delay: 0.9, ease: "easeOut" },
                }}
                fill="#f5f3ed"
              />
            </svg>
          </div>

          {/* Brand Name Kinetic Reveal */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: easeOutExpo }}
              className="font-display text-2xl xs:text-3xl sm:text-6xl md:text-7xl uppercase tracking-[0.1em] sm:tracking-[0.14em] text-white"
            >
              Maison Makeeva
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-4"
          >
            <span className="h-px w-4 sm:w-8 bg-chartreuse" />
            <p className="font-mono text-xs uppercase tracking-[0.18em] sm:tracking-[0.24em] text-chartreuse font-semibold">
              Haute Monograph · Spring Summer SS26
            </p>
            <span className="h-px w-4 sm:w-8 bg-chartreuse" />
          </motion.div>
        </div>

        {/* Footer: Resn-Style Numeric Precision Bar */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-end justify-between font-mono text-xs text-white/80">
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-white/60 block font-medium">Loading Sequence</span>
              <span className="text-chartreuse font-bold">CALIBRATING STAGE 3D SCENE</span>
            </div>

            {/* Giant Numeric Progress */}
            <div className="text-right">
              <span className="font-display text-4xl sm:text-5xl font-bold text-chartreuse leading-none">
                {progress < 10 ? `0${progress}` : progress}
              </span>
              <span className="font-mono text-xs text-white/60 ml-1">%</span>
            </div>
          </div>

          {/* Progress hairline track */}
          <div className="mt-3 h-1 w-full bg-white/15 overflow-hidden">
            <motion.div
              className="h-full bg-chartreuse"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
