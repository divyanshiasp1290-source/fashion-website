import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

const STORY_FRAMES = [
  {
    label: "Material",
    title: "300 GSM heavyweight cotton.",
    body: "Dense weave engineered for sculptural drape and enduring structure.",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028",
  },
  {
    label: "Treatment",
    title: "Stonewashed indigo.",
    body: "Artisanal bleach yielding unique marbling — each garment carries its own patina.",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0094_be86ab79-e665-4d98-9937-31d9eb6de6c0_2048x.jpg?v=1763735979",
  },
  {
    label: "Silhouette",
    title: "Architectural contour.",
    body: "Curved seams and oversized proportions shaped between Paris atelier and street presence.",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823",
  },
];

export function AtelierStorySection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.02, 1.08]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.08, 0.92, 1], [0, 1, 1, 0.6]);

  return (
    <section ref={containerRef} className="relative h-[220vh] bg-bone">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div
          style={{ scale: imageScale, opacity: imageOpacity }}
          className="absolute inset-0"
        >
          {STORY_FRAMES.map((frame, i) => (
            <StoryImage key={frame.label} frame={frame} index={i} progress={scrollYProgress} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-bone via-bone/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bone/90 via-transparent to-bone/20" />
        </motion.div>

        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 items-end gap-8 px-5 pb-16 pt-28 sm:px-10 lg:grid-cols-[0.55fr_0.45fr] lg:px-16 lg:pb-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-taupe font-semibold">
              Atelier Story
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase leading-[0.95] tracking-[-0.02em] text-ink sm:text-5xl lg:text-6xl">
              Craft in every fibre.
            </h2>
          </div>

          <div className="relative min-h-[140px] border-t border-ink/15 pt-6 lg:min-h-[180px] lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
            {STORY_FRAMES.map((frame, i) => (
              <StoryFrameCopy key={frame.label} frame={frame} index={i} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryImage({
  frame,
  index,
  progress,
}: {
  frame: (typeof STORY_FRAMES)[0];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index * 0.33;
  const end = start + 0.33;
  const opacity = useTransform(progress, [start, start + 0.12, end - 0.08, end], [0, 1, 1, 0]);

  return (
    <motion.img
      src={frame.image}
      alt=""
      style={{ opacity }}
      className="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />
  );
}

function StoryFrameCopy({
  frame,
  index,
  progress,
}: {
  frame: (typeof STORY_FRAMES)[0];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index * 0.33;
  const end = start + 0.33;
  const opacity = useTransform(progress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, start + 0.1], [20, 0]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-6 lg:inset-x-auto lg:left-10 lg:right-0 lg:top-0">
      <span className="font-mono text-xs uppercase tracking-[0.24em] text-chartreuse font-semibold">
        {frame.label}
      </span>
      <p className="mt-2 font-display text-xl uppercase leading-tight text-ink sm:text-2xl">
        {frame.title}
      </p>
      <p className="mt-2 font-editorial text-base sm:text-lg md:text-xl leading-relaxed text-graphite/90">
        {frame.body}
      </p>
    </motion.div>
  );
}
