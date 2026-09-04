import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type ResnBrandIntroProps = {
  onComplete: () => void;
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function ResnBrandIntro({ onComplete }: ResnBrandIntroProps) {
  const [progress, setProgress] = useState(0);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Precision Counter
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 4) + 2;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => triggerExit(), 700);
      } else {
        setProgress(current);
      }
    }, 75);

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
    }, 1150);
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
        transition={{ duration: 1.1, ease: easeOutExpo }}
        className="absolute inset-x-0 top-0 h-1/2 bg-ink z-10 border-b border-ivory/15"
      />

      {/* Bottom Split Curtain */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isSplitting ? "100%" : "0%" }}
        transition={{ duration: 1.1, ease: easeOutExpo }}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-ink z-10 border-t border-ivory/15"
      />

      {/* Center Cinematic Content */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isSplitting ? 0 : 1, scale: isSplitting ? 1.05 : 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex h-full w-full flex-col justify-between p-6 sm:p-12 text-ivory pointer-events-none"
      >
        {/* Telemetry Header */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-ivory/60 border-b border-ivory/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-chartreuse animate-ping" />
            <span>INITIALIZING ATELIER SALON // PARIS · ACCRA</span>
          </div>
          <div className="hidden sm:block">
            <span>LAT 48.8566° N · LON 2.3522° E</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerExit();
            }}
            className="pointer-events-auto text-chartreuse hover:underline tracking-[0.2em]"
          >
            SKIP INTRO [ESC]
          </button>
        </div>

        {/* Centerpiece: Self-Drawing Geometric MM Monogram & Kinetic Typography */}
        <div className="mx-auto flex flex-col items-center justify-center text-center">
          {/* Animated SVG Monogram Vector */}
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 mb-6">
            <svg viewBox="0 0 120 120" className="h-full w-full">
              {/* Outer aperture circle */}
              <motion.circle
                cx="60"
                cy="60"
                r="56"
                fill="none"
                stroke="rgba(231, 139, 115, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="360"
                initial={{ strokeDashoffset: 360, rotate: 0 }}
                animate={{ strokeDashoffset: 0, rotate: 180 }}
                transition={{ duration: 1.8, ease: easeOutExpo }}
              />

              {/* Inner geometric crosshairs */}
              <line x1="60" y1="10" x2="60" y2="110" stroke="rgba(245, 243, 237, 0.2)" strokeWidth="1" />
              <line x1="10" y1="60" x2="110" y2="60" stroke="rgba(245, 243, 237, 0.2)" strokeWidth="1" />

              {/* Architectural M M lines */}
              <motion.path
                d="M 28 85 L 28 35 L 44 65 L 60 35 L 76 65 L 92 35 L 92 85"
                fill="none"
                stroke="#e78b73"
                strokeWidth="3.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeDasharray="400"
                initial={{ strokeDashoffset: 400 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.6, ease: easeOutExpo }}
              />
            </svg>
          </div>

          {/* Brand Name Kinetic Reveal */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: easeOutExpo }}
              className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-[0.14em] text-white"
            >
              Maison Makeeva
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-3 flex items-center gap-4"
          >
            <span className="h-px w-8 bg-chartreuse" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-chartreuse font-semibold">
              Haute Monograph · Spring Summer SS26
            </p>
            <span className="h-px w-8 bg-chartreuse" />
          </motion.div>
        </div>

        {/* Footer: Resn-Style Numeric Precision Bar */}
        <div className="border-t border-ivory/10 pt-4">
          <div className="flex items-end justify-between font-mono text-xs text-ivory/80">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-taupe block">Loading Sequence</span>
              <span className="text-chartreuse font-bold">CALIBRATING STAGE 3D SCENE</span>
            </div>

            {/* Giant Numeric Progress */}
            <div className="text-right">
              <span className="font-display text-4xl sm:text-5xl font-bold text-chartreuse leading-none">
                {progress < 10 ? `0${progress}` : progress}
              </span>
              <span className="font-mono text-xs text-ivory/60 ml-1">%</span>
            </div>
          </div>

          {/* Progress hairline track */}
          <div className="mt-3 h-1 w-full bg-ivory/15 overflow-hidden">
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
