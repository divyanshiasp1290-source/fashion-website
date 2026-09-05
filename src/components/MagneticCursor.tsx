import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useIsTouchDevice } from "../hooks/useReducedMotion";

export type CursorMode = "default" | "hover" | "view" | "drag" | "inspect" | "image" | "hidden";

export function MagneticCursor() {
  const [cursorMode, setCursorMode] = useState<CursorMode>("default");
  const [cursorText, setCursorText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const isTouch = useIsTouchDevice();

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 320, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const smoothMagX = useSpring(magneticX, { damping: 20, stiffness: 280 });
  const smoothMagY = useSpring(magneticY, { damping: 20, stiffness: 280 });

  const dotSpring = { damping: 35, stiffness: 650 };
  const dotX = useSpring(mouseX, dotSpring);
  const dotY = useSpring(mouseY, dotSpring);

  const activeTarget = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isTouch) {
      document.body.classList.remove("custom-cursor-active");
      return;
    }

    document.body.classList.add("custom-cursor-active");

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorTarget = target.closest("[data-cursor]") as HTMLElement | null;
      const magneticTarget = target.closest("[data-magnetic]") as HTMLElement | null;

      if (cursorTarget) {
        const mode = cursorTarget.getAttribute("data-cursor") as CursorMode;
        const text = cursorTarget.getAttribute("data-cursor-text") || "";
        setCursorMode(mode || "hover");
        setCursorText(text);
      } else if (target.closest("img, picture, [data-cursor-image]")) {
        setCursorMode("image");
        setCursorText("");
      } else if (target.closest("button, a, input, select, textarea, [role='button']")) {
        setCursorMode("hover");
        setCursorText("");
      } else {
        setCursorMode("default");
        setCursorText("");
      }

      if (magneticTarget && magneticTarget !== activeTarget.current) {
        activeTarget.current = magneticTarget;
      } else if (!magneticTarget) {
        activeTarget.current = null;
        magneticX.set(0);
        magneticY.set(0);
      }

      if (magneticTarget) {
        const rect = magneticTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const strength = Number(magneticTarget.getAttribute("data-magnetic")) || 0.35;
        magneticX.set((cx - e.clientX) * strength);
        magneticY.set((cy - e.clientY) * strength);
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isTouch, isVisible, mouseX, mouseY, magneticX, magneticY]);

  if (isTouch || !isVisible) return null;

  const isView = cursorMode === "view";
  const isDrag = cursorMode === "drag";
  const isInspect = cursorMode === "inspect";
  const isImage = cursorMode === "image";
  const isBadge = isView || isDrag || isInspect || Boolean(cursorText);
  const isHover = cursorMode === "hover";

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] select-none will-change-transform"
        style={{ x: smoothX, y: smoothY }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest font-bold mix-blend-difference"
          style={{ x: smoothMagX, y: smoothMagY }}
        animate={{
          width: isImage ? 64 : isBadge ? 84 : isHover ? 52 : isPressed ? 22 : 32,
          height: isImage ? 64 : isBadge ? 84 : isHover ? 52 : isPressed ? 22 : 32,
          backgroundColor: isImage
            ? "rgba(255, 255, 255, 0.9)"
            : isBadge
            ? "#e78b73"
            : isHover
            ? "rgba(231, 139, 115, 0.25)"
            : "rgba(255, 255, 255, 0.08)",
          borderColor: isHover ? "#e78b73" : "#ffffff",
          borderWidth: isBadge || isImage ? 0 : 1.5,
          borderRadius: isImage ? "4px" : "50%",
          color: isBadge ? "#0d0d0d" : "#ffffff",
          scale: isPressed ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        {isImage && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-bold tracking-[0.2em]"
          >
            VIEW
          </motion.span>
        )}
        {isBadge && !isImage && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-1 leading-none select-none font-mono"
          >
            {cursorText || (isView ? "VIEW" : isDrag ? "DRAG" : "INSPECT")}
          </motion.span>
        )}
        </motion.div>
      </motion.div>

      {!isBadge && !isImage && (
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2 select-none rounded-full bg-chartreuse will-change-transform"
          style={{ x: dotX, y: dotY }}
          animate={{
            width: isHover ? 0 : isPressed ? 8 : 5,
            height: isHover ? 0 : isPressed ? 8 : 5,
            opacity: isHover ? 0 : 1,
          }}
          transition={{ duration: 0.12 }}
        />
      )}
    </>
  );
}
