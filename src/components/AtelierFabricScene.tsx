import { MeshDistortMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { useIsTouchDevice, useReducedMotion } from "../hooks/useReducedMotion";

type FabricProps = {
  mouseX: number;
  mouseY: number;
};

function FabricDrape({ mouseX, mouseY }: FabricProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      -0.35 + mouseY * 0.08,
      0.03
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      mouseX * 0.12 + Math.sin(t * 0.25) * 0.04,
      0.03
    );
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[3.2, 4.2, 48, 48]} />
      <MeshDistortMaterial
        color="#d8d3c5"
        roughness={0.92}
        metalness={0.02}
        distort={0.14}
        speed={1.2}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

function Scene({ mouseX, mouseY }: FabricProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 3]} intensity={0.45} color="#f5f3ed" />
      <pointLight position={[-2, 1, 2]} intensity={0.35} color="#e78b73" />
      <FabricDrape mouseX={mouseX} mouseY={mouseY} />
    </>
  );
}

type AtelierFabricSceneProps = {
  mouseX?: number;
  mouseY?: number;
  className?: string;
};

export function AtelierFabricScene({
  mouseX = 0,
  mouseY = 0,
  className = "",
}: AtelierFabricSceneProps) {
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();

  if (reducedMotion || isTouch) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 0, 3.8], fov: 38 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Scene mouseX={mouseX} mouseY={mouseY} />
        </Suspense>
      </Canvas>
    </div>
  );
}
