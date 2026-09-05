import { motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React, { useRef } from "react";
import { useIsTouchDevice, useReducedMotion } from "../hooks/useReducedMotion";
import { HeroFabricLayer } from "./HeroFabricLayer";

type Page = "home" | "collection" | "product" | "lookbook" | "about" | "contact" | "search" | "wishlist" | "account" | "cart";

const HERO_IMAGE =
  "https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function SignatureHero({ go }: { go: (page: Page) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 24 });

  // Scroll tracking with smooth spring physics for soft organic inertia
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.6,
  });

  // Soft 3D perspective depth transforms for desktop
  const imgX = useTransform(smoothX, [-0.5, 0.5], isTouch || reducedMotion ? [0, 0] : [-10, 10]);
  const imgY = useTransform(smoothY, [-0.5, 0.5], isTouch || reducedMotion ? [0, 0] : [-8, 8]);
  const imgRotateY = useTransform(smoothX, [-0.5, 0.5], isTouch || reducedMotion ? [0, 0] : [-2, 2]);
  const imgRotateX = useTransform(smoothY, [-0.5, 0.5], isTouch || reducedMotion ? [0, 0] : [1.5, -1.5]);

  // Soft smooth scroll-driven 3D movement
  const imgZ = useTransform(smoothProgress, [0, 1], isTouch || reducedMotion ? [0, 0] : [0, -80]);
  const scrollImgY = useTransform(smoothProgress, [0, 1], isTouch || reducedMotion ? [0, 0] : [0, 75]);
  const imgScale = useTransform(smoothProgress, [0, 1], [1, 1.07]);

  // Combined vertical translation: pointer mouse nuance + soft scroll glide
  const totalImgY = useTransform([imgY, scrollImgY], ([y, sy]: any[]) => (y || 0) + (sy || 0));

  // Content text lifts forward in 3D space with soft vertical glide
  const contentZ = useTransform(smoothProgress, [0, 1], isTouch || reducedMotion ? [0, 0] : [0, 45]);
  const contentY = useTransform(smoothProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(smoothProgress, [0, 0.72], [1, 0]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (isTouch || reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-[90dvh] min-h-[500px] sm:min-h-[580px] max-h-[920px] w-full overflow-hidden bg-ink text-ivory"
      style={{ perspective: "1200px" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Maison Makeeva — Contemporary Luxury Fashion Atelier"
    >
      {/* Primary 3D Layer: Editorial Campaign Visual Plane with Soft 3D Scroll Depth */}
      <motion.div
        style={{
          x: imgX,
          y: totalImgY,
          z: imgZ,
          rotateX: imgRotateX,
          rotateY: imgRotateY,
          scale: imgScale,
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-[-4%] z-[1] will-change-transform"
      >
        <motion.img
          src={HERO_IMAGE}
          alt="Maison Makeeva SS26 campaign collection"
          fetchPriority="high"
          className="h-full w-full object-cover object-[50%_18%] filter contrast-[1.02]"
        />

        {/* Subtle, refined vignettes allowing the campaign image to be clearly and vibrantly visible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />
      </motion.div>

      {/* 3D Couture Fabric Simulation + Dynamic Lighting + Parallax (Subtle House Palette / "Kam Effect") */}
      <HeroFabricLayer />

      {/* Secondary Layer: Minimal Luxury Atelier Headline & Single CTA with 3D Depth */}
      <motion.div
        style={{ y: contentY, z: contentZ, opacity: contentOpacity, transformStyle: "preserve-3d" }}
        className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-24 pt-20 sm:px-10 sm:pb-16 lg:pb-20 lg:px-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.1 }}
          className="max-w-3xl"
        >
          {/* Clean, Massive Editorial Display Headline with High-Contrast Text Shadow */}
          <h1 className="font-display text-3xl xs:text-4xl sm:text-6xl lg:text-[6.25rem] font-bold uppercase leading-[0.95] sm:leading-[0.88] tracking-[-0.03em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] break-words">
            Dress like the image<span className="text-chartreuse">.</span>
          </h1>

          <p className="mt-2.5 sm:mt-4 font-mono text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.26em] text-chartreuse font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            SS26 Atelier Collection // Paris · Accra
          </p>

          {/* Single Focused Action CTA */}
          <div className="mt-4 sm:mt-8">
            <button
              onClick={() => go("collection")}
              data-magnetic="0.3"
              className="group inline-flex items-center justify-center gap-3 bg-chartreuse px-6 py-3 sm:px-8 sm:py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-ink transition duration-200 hover:bg-white hover:shadow-2xl active:scale-[0.98] w-fit min-h-[42px] sm:min-h-[44px]"
              data-cursor="view"
              data-cursor-text="SHOP"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
