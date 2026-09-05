import { OrbitControls, MeshDistortMaterial, Sparkles, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useIsTouchDevice, useReducedMotion } from "../hooks/useReducedMotion";
import { cx } from "../utils";
import { Layers } from "lucide-react";

type MaterialType = "denim" | "cotton" | "jersey";

type SpecimenProps = {
  materialType?: MaterialType;
  wireframe?: boolean;
  color?: string;
};

function TextileWeaveMesh({
  materialType = "cotton",
  wireframe = false,
  color = "#d6cfbe",
}: SpecimenProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Material physics configuration based on luxury atelier textiles
  const config = useMemo(() => {
    switch (materialType) {
      case "denim":
        return {
          distort: 0.18,
          speed: 1.1,
          roughness: 0.94,
          metalness: 0.05,
          color: "#282c37",
        };
      case "jersey":
        return {
          distort: 0.28,
          speed: 1.6,
          roughness: 0.75,
          metalness: 0.08,
          color: "#1a1a1a",
        };
      case "cotton":
      default:
        return {
          distort: 0.22,
          speed: 1.2,
          roughness: 0.88,
          metalness: 0.02,
          color: "#ded8ca",
        };
    }
  }, [materialType]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y = Math.sin(t * 0.35) * 0.12;
    meshRef.current.rotation.x = -0.15 + Math.cos(t * 0.25) * 0.06;
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <planeGeometry args={[2.8, 3.8, 48, 48]} />
        <MeshDistortMaterial
          color={color || config.color}
          roughness={config.roughness}
          metalness={config.metalness}
          distort={config.distort}
          speed={config.speed}
          wireframe={wireframe}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Sparkles
        count={28}
        scale={[4, 5, 3]}
        size={1.2}
        speed={0.3}
        opacity={0.3}
        color="#ffffff"
      />
    </group>
  );
}

function Scene({
  materialType,
  wireframe,
}: {
  materialType: MaterialType;
  wireframe: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-3, -2, -2]} intensity={0.3} color="#e5e5e5" />
      <pointLight position={[0, 2, 2.5]} intensity={0.5} color="#ffffff" />

      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <TextileWeaveMesh
          materialType={materialType}
          wireframe={wireframe}
        />
      </Float>

      <OrbitControls
        enableZoom={true}
        minDistance={2.5}
        maxDistance={5.5}
        enablePan={false}
        maxPolarAngle={Math.PI / 1.4}
        minPolarAngle={Math.PI / 3.2}
        dampingFactor={0.06}
        rotateSpeed={0.7}
      />
    </>
  );
}

type Specimen3DCanvasProps = {
  category?: string;
  className?: string;
};

export function Specimen3DCanvas({
  category = "Denim & Outerwear",
  className = "",
}: Specimen3DCanvasProps) {
  const isTouch = useIsTouchDevice();
  const reducedMotion = useReducedMotion();

  const [wireframe, setWireframe] = useState(false);
  const [materialType, setMaterialType] = useState<MaterialType>(() => {
    const cat = category.toLowerCase();
    if (cat.includes("denim")) return "denim";
    if (cat.includes("jersey") || cat.includes("top")) return "jersey";
    return "cotton";
  });

  const materialSpecs = useMemo(() => {
    switch (materialType) {
      case "denim":
        return {
          density: "320 GSM Heavy Twill",
          finish: "Artisanal Stonewashed Indigo",
          weave: "3x1 Right Hand Twill",
          composition: "100% Ring-Spun Cotton",
        };
      case "jersey":
        return {
          density: "280 GSM Double Interlock",
          finish: "Brushed Carbon Peach Touch",
          weave: "Double Knit Micro-Rib",
          composition: "95% Cotton / 5% Elastane",
        };
      case "cotton":
      default:
        return {
          density: "300 GSM Architectural Fleece",
          finish: "Custom DTS Discharge Treated",
          weave: "Compact French Terry",
          composition: "100% Combed Organic Cotton",
        };
    }
  }, [materialType]);

  return (
    <div className={cx("relative flex flex-col h-full w-full bg-ink text-white overflow-hidden select-none", className)}>
      {/* Upper Atelier Telemetry HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-ink/80 px-3 py-1.5 border border-chartreuse/30 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-chartreuse animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-chartreuse font-medium">
            3D Specimen Simulator // Real-Time Physics
          </span>
        </div>

        <div className="font-mono text-xs uppercase tracking-wider text-white/70 bg-ink/70 px-2.5 py-1 border border-white/10">
          Rotate: Drag · Zoom: Scroll
        </div>
      </div>

      {/* 3D WebGL Viewport */}
      <div className="relative flex-1 min-h-[360px] w-full cursor-grab active:cursor-grabbing">
        {reducedMotion || isTouch ? (
          <div className="flex h-full w-full items-center justify-center p-8 text-center font-mono text-xs text-white/60">
            3D simulation paused on touch or reduced-motion.
          </div>
        ) : (
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 3.8], fov: 45 }}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
            style={{ width: "100%", height: "100%" }}
          >
            <Suspense fallback={null}>
              <Scene materialType={materialType} wireframe={wireframe} />
            </Suspense>
          </Canvas>
        )}

        {/* Center Guide Watermark */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 font-mono text-xs uppercase tracking-widest text-chartreuse/50">
          MM-SS26 // GEOMETRIC FABRIC MODEL
        </div>
      </div>

      {/* Lower Control Bar: Material Preset Switcher & Wireframe Toggle */}
      <div className="z-10 border-t border-white/15 bg-ink/95 p-4 backdrop-blur-md flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Material Selection */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wider text-white/50 mr-1 hidden sm:inline">
            Textile:
          </span>
          {(["cotton", "denim", "jersey"] as MaterialType[]).map((type) => (
            <button
              key={type}
              onClick={() => setMaterialType(type)}
              className={cx(
                "border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition",
                materialType === type
                  ? "border-chartreuse bg-chartreuse text-ink font-bold shadow-sm"
                  : "border-white/20 text-white/70 hover:border-chartreuse hover:text-chartreuse bg-white/5"
              )}
            >
              {type === "cotton" ? "Heavy Cotton" : type === "denim" ? "Denim Twill" : "Interlock"}
            </button>
          ))}
        </div>

        {/* Inspector Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWireframe((prev) => !prev)}
            className={cx(
              "flex items-center gap-1.5 border px-3 py-1 font-mono text-xs uppercase tracking-wider transition",
              wireframe
                ? "border-chartreuse bg-chartreuse text-ink font-bold"
                : "border-white/20 text-white/75 hover:border-chartreuse hover:text-chartreuse bg-white/5"
            )}
          >
            <Layers size={11} className={wireframe ? "text-ink" : "text-chartreuse"} />
            <span>{wireframe ? "Solid Weave" : "Mesh Structure"}</span>
          </button>
        </div>
      </div>

      {/* Fabric Technical Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-white/10 bg-black/40 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white/80 font-medium">
        <div>
          <span className="text-white/40 block">Density</span>
          <span className="text-chartreuse font-medium">{materialSpecs.density}</span>
        </div>
        <div>
          <span className="text-white/40 block">Finish</span>
          <span className="text-chartreuse font-medium">{materialSpecs.finish}</span>
        </div>
        <div>
          <span className="text-white/40 block">Structure</span>
          <span className="text-chartreuse font-medium">{materialSpecs.weave}</span>
        </div>
        <div>
          <span className="text-white/40 block">Composition</span>
          <span className="text-chartreuse font-medium">{materialSpecs.composition}</span>
        </div>
      </div>
    </div>
  );
}
