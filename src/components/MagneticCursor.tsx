import { useEffect } from "react";

export type CursorMode = "default" | "hover" | "view" | "drag" | "inspect" | "image" | "hidden";

export function MagneticCursor() {
  useEffect(() => {
    document.body.classList.remove("custom-cursor-active");
  }, []);

  return null;
}
