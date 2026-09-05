import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export type RevealVariant =
  | "fadeUp"
  | "parallax"
  | "mask"
  | "scale"
  | "slideLeft"
  | "slideRight"
  | "rotate"
  | "blur";

type ScrollRevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  className?: string;
  delay?: number;
  duration?: number;
  parallaxAmount?: number;
};

export function ScrollReveal({
  children,
  variant = "fadeUp",
  className = "",
  delay = 0,
  duration = 1,
  parallaxAmount = 80,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      switch (variant) {
        case "parallax": {
          gsap.fromTo(
            el,
            { y: parallaxAmount, opacity: 0.4 },
            {
              y: -parallaxAmount * 0.35,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            }
          );
          break;
        }
        case "mask": {
          gsap.fromTo(
            el,
            { clipPath: "inset(100% 0 0 0)", opacity: 0.6 },
            {
              clipPath: "inset(0% 0 0 0)",
              opacity: 1,
              duration,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
          break;
        }
        case "scale": {
          gsap.fromTo(
            el,
            { scale: 0.88, opacity: 0, transformOrigin: "50% 50%" },
            {
              scale: 1,
              opacity: 1,
              duration,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
          break;
        }
        case "slideLeft": {
          gsap.fromTo(
            el,
            { x: 90, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
          break;
        }
        case "slideRight": {
          gsap.fromTo(
            el,
            { x: -90, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
          break;
        }
        case "rotate": {
          gsap.fromTo(
            el,
            { rotateX: 12, y: 50, opacity: 0, transformPerspective: 900 },
            {
              rotateX: 0,
              y: 0,
              opacity: 1,
              duration,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
          break;
        }
        case "blur": {
          gsap.fromTo(
            el,
            { filter: "blur(12px)", opacity: 0, y: 30 },
            {
              filter: "blur(0px)",
              opacity: 1,
              y: 0,
              duration,
              delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
          break;
        }
        default: {
          gsap.fromTo(
            el,
            { y: 48, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      }
    }, el);

    return () => ctx.revert();
  }, [variant, delay, duration, parallaxAmount, reducedMotion]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

type HorizontalScrollProps = {
  children: ReactNode;
  className?: string;
};

export function HorizontalScrollPin({ children, className = "" }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || reducedMotion) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    const ctx = gsap.context(() => {
      const scrollWidth = track.scrollWidth - container.clientWidth;

      gsap.to(track, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, container);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        ref={trackRef}
        className="flex w-max gap-4 will-change-transform overflow-x-auto lg:overflow-visible scrollbar-thin pb-4 lg:pb-0"
      >
        {children}
      </div>
    </div>
  );
}

type SplitTextProps = {
  text: string;
  className?: string;
};

export function SplitTextReveal({ text, className = "" }: SplitTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const words = el.querySelectorAll(".split-word");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { y: "110%", opacity: 0, rotateX: 40 },
        {
          y: "0%",
          opacity: 1,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [text, reducedMotion]);

  return (
    <h2 ref={ref} className={className} style={{ perspective: 800 }}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-top mr-[0.28em]">
          <span className="split-word inline-block">{word}</span>
        </span>
      ))}
    </h2>
  );
}

export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

type CinematicChapterProps = {
  chapter: string;
  title: string;
  subtitle?: string;
  className?: string;
};

export function CinematicChapter({
  chapter,
  title,
  subtitle,
  className = "",
}: CinematicChapterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    const line = lineRef.current;
    if (!el || !line || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleX: 0, transformOrigin: "0% 50%" },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className={`w-full py-6 select-none ${className}`}>
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.26em] text-taupe mb-2">
        <span className="font-bold text-chartreuse">{chapter}</span>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div ref={lineRef} className="h-[1.5px] w-full bg-chartreuse/50 mb-3 will-change-transform" />
      <h3 className="font-display text-xl sm:text-2xl uppercase tracking-tight text-ink">
        {title}
      </h3>
    </div>
  );
}

type EditorialCurtainRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function EditorialCurtainReveal({
  children,
  className = "",
  delay = 0,
}: EditorialCurtainRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", y: 30 },
        {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          y: 0,
          duration: 1.1,
          delay,
          ease: "power4.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, reducedMotion]);

  return (
    <div ref={ref} className={`will-change-transform overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

type ScrollDriven3DProps = {
  children: ReactNode;
  className?: string;
  depth?: number;
};

export function ScrollDriven3D({
  children,
  className = "",
  depth = 50,
}: ScrollDriven3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Soft, silky smooth 3D depth translation on scroll without any screen tilt or skew
      gsap.fromTo(
        el,
        {
          y: depth,
          z: -depth * 0.4,
          opacity: 0.9,
        },
        {
          y: -depth * 0.35,
          z: depth * 0.15,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.4, // Soft, luxurious spring scrub
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [depth, reducedMotion]);

  return (
    <div
      ref={ref}
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

