import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export type CursorMode = "default" | "hover" | "view" | "drag" | "inspect" | "sound" | "hidden";

export function MagneticCursor() {
  const [cursorMode, setCursorMode] = useState<CursorMode>("default");
  const [cursorText, setCursorText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for Cuberto-like fluid inertia
  const springConfig = { damping: 28, stiffness: 280, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const dotSpring = { damping: 35, stiffness: 600 };
  const dotX = useSpring(mouseX, dotSpring);
  const dotY = useSpring(mouseY, dotSpring);

  useEffect(() => {
    // Only show on devices with mouse
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check target element or closest parent with data-cursor attributes
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest("[data-cursor]") as HTMLElement | null;
      if (cursorTarget) {
        const mode = cursorTarget.getAttribute("data-cursor") as CursorMode;
        const text = cursorTarget.getAttribute("data-cursor-text") || "";
        setCursorMode(mode || "hover");
        setCursorText(text);
        return;
      }

      // Check for buttons, links, inputs
      if (target.closest("button, a, input, select, textarea")) {
        setCursorMode("hover");
        setCursorText("");
        return;
      }

      setCursorMode("default");
      setCursorText("");
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isVisible) return null;

  const isView = cursorMode === "view";
  const isDrag = cursorMode === "drag";
  const isInspect = cursorMode === "inspect";
  const isBadge = isView || isDrag || isInspect || Boolean(cursorText);
  const isHover = cursorMode === "hover";

  return (
    <>
      {/* Outer Fluid Follower Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2 select-none flex items-center justify-center font-mono text-[9px] uppercase tracking-widest font-bold will-change-transform"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          width: isBadge ? 80 : isHover ? 48 : 28,
          height: isBadge ? 80 : isHover ? 48 : 28,
          backgroundColor: isBadge
            ? "#e78b73"
            : isHover
            ? "rgba(231, 139, 115, 0.15)"
            : "transparent",
          borderColor: isBadge ? "#e78b73" : "#e78b73",
          borderWidth: isBadge ? 0 : 1,
          borderRadius: "50%",
          color: "#171714",
          backdropFilter: isHover && !isBadge ? "blur(2px)" : "none",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        {isBadge && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-1 leading-none text-ink select-none font-mono"
          >
            {cursorText || (isView ? "VIEW" : isDrag ? "DRAG" : "INSPECT")}
          </motion.span>
        )}
      </motion.div>

      {/* Inner Precision Dot */}
      {!isBadge && (
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2 select-none rounded-full bg-chartreuse will-change-transform"
          style={{
            x: dotX,
            y: dotY,
          }}
          animate={{
            width: isHover ? 4 : 5,
            height: isHover ? 4 : 5,
            opacity: isHover ? 0.6 : 1,
          }}
          transition={{ duration: 0.15 }}
        />
      )}
    </>
  );
}
