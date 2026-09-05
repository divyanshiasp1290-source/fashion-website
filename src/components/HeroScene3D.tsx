import { Float, MeshDistortMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useIsTouchDevice, useReducedMotion } from "../hooks/useReducedMotion";

// Custom GLSL Shader for Couture Silk Fabric Simulation with Dynamic Lighting & Shader Distortion
const FabricShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseVel: { value: 0 },
    uScroll: { value: 0 },
    uLightPos: { value: new THREE.Vector3(2, 2, 2) },
    uColorTerracotta: { value: new THREE.Color("#e78b73") },
    uColorIvory: { value: new THREE.Color("#fbf7f4") },
    uColorDeep: { value: new THREE.Color("#1a1514") },
  },
  vertexShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uMouseVel;
    uniform float uScroll;
    uniform vec3 uLightPos;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying float vWaveIntensity;
    varying float vDispersion;

    // Multi-octave wave displacement function for couture silk drape
    float getDisplacement(vec2 p) {
      // 1. Primary undulating drape folds
      float w1 = sin(p.x * 1.35 + uTime * 0.82) * cos(p.y * 1.05 + uTime * 0.62) * 0.44;
      
      // 2. High-frequency silk tension ripples
      float w2 = sin((p.x + p.y) * 2.3 + uTime * 1.2) * 0.19;
      float w3 = cos(p.x * 3.5 - p.y * 2.7 + uTime * 1.55) * 0.09;
      
      // 3. Interactive mouse depression and wake wave
      vec2 mTarget = uMouse * vec2(4.8, 2.8);
      float distToMouse = length(p - mTarget);
      float mouseRipple = sin(distToMouse * 6.5 - uTime * 3.5) * exp(-distToMouse * 0.85) * 0.32 * clamp(uMouseVel * 2.0, 0.3, 1.8);
      
      // 4. Whole-website scroll-driven continuous billowing
      float scrollLift = sin(p.y * 1.6 + uScroll * 6.28318) * 0.38 + sin(uScroll * 3.14159) * 0.24;
      
      return w1 + w2 + w3 + mouseRipple + scrollLift;
    }

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Analytical normal re-estimation for dynamic light glints across creases
      float offset = 0.06;
      float dCenter = getDisplacement(pos.xy);
      float dX = getDisplacement(pos.xy + vec2(offset, 0.0));
      float dY = getDisplacement(pos.xy + vec2(0.0, offset));

      vec3 displacedPos = pos + vec3(0.0, 0.0, dCenter);
      vec3 displacedTan = pos + vec3(offset, 0.0, dX);
      vec3 displacedBit = pos + vec3(0.0, offset, dY);

      vec3 calcNormal = normalize(cross(displacedTan - displacedPos, displacedBit - displacedPos));
      vNormal = normalize(normalMatrix * calcNormal);

      vPosition = displacedPos;
      vWaveIntensity = dCenter;
      vDispersion = abs(dX - dCenter) * 6.0 + uMouseVel * 0.25;

      vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uLightPos;
    uniform vec3 uColorTerracotta;
    uniform vec3 uColorIvory;
    uniform vec3 uColorDeep;
    uniform float uScroll;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying float vWaveIntensity;
    varying float vDispersion;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPosition);

      // 1. Dynamic terracotta point light illumination with attenuation
      vec3 L_point = normalize(uLightPos - vPosition);
      float distPoint = length(uLightPos - vPosition);
      float atten = 1.0 / (1.0 + 0.12 * distPoint + 0.03 * distPoint * distPoint);
      float diffPoint = max(dot(N, L_point), 0.0) * atten;
      
      // Anisotropic specular highlight from cursor point light
      vec3 R_point = reflect(-L_point, N);
      float specPoint = pow(max(dot(R_point, V), 0.0), 30.0) * atten;

      // 2. Key directional studio light
      vec3 L_dir = normalize(vec3(3.0, 5.0, 3.5));
      float diffDir = max(dot(N, L_dir), 0.0);
      vec3 R_dir = reflect(-L_dir, N);
      float specDir = pow(max(dot(R_dir, V), 0.0), 32.0);

      // 3. Fresnel edge effect (Sheer couture organza / silk rim glow)
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8);

      // Color blending matching Maison Makeeva terracotta and ivory palette
      vec3 baseSilk = mix(uColorDeep, uColorIvory, diffDir * 0.72 + 0.28);
      vec3 terracottaGlow = uColorTerracotta * (diffPoint * 2.2 + fresnel * 1.6 + specPoint * 1.5);
      vec3 pearlHighlight = vec3(1.0, 0.98, 0.95) * (specDir * 0.95 + specPoint * 0.85);

      // Subtle optical chromatic dispersion on sharp creases
      float chromatic = clamp(vDispersion * 0.06, 0.0, 0.22);
      vec3 finalColor = baseSilk + terracottaGlow + pearlHighlight;
      finalColor.r += chromatic * 0.12;
      finalColor.b -= chromatic * 0.06;

      // Clear, elegant visibility in the background behind cards
      float alpha = clamp(0.36 + fresnel * 0.38 + (specPoint * 1.3 + specDir * 0.8) * 0.35 + abs(vWaveIntensity) * 0.18, 0.18, 0.78);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

function CoutureFabricMesh({
  mousePos,
  mouseVel,
  scrollNorm,
  lightPos,
}: {
  mousePos: React.MutableRefObject<THREE.Vector2>;
  mouseVel: React.MutableRefObject<number>;
  scrollNorm: React.MutableRefObject<number>;
  lightPos: React.MutableRefObject<THREE.Vector3>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...FabricShaderMaterial,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = scrollNorm.current;

    shaderMaterial.uniforms.uTime.value = t;
    shaderMaterial.uniforms.uMouse.value.lerp(mousePos.current, 0.06);
    shaderMaterial.uniforms.uMouseVel.value = THREE.MathUtils.lerp(
      shaderMaterial.uniforms.uMouseVel.value,
      mouseVel.current,
      0.08
    );
    shaderMaterial.uniforms.uScroll.value = THREE.MathUtils.lerp(
      shaderMaterial.uniforms.uScroll.value,
      s,
      0.05
    );
    shaderMaterial.uniforms.uLightPos.value.copy(lightPos.current);

    if (meshRef.current) {
      // Gentle floating inclination and whole-site scroll billow
      meshRef.current.rotation.z = Math.sin(t * 0.25) * 0.04 + Math.sin(s * Math.PI * 2) * 0.06;
      meshRef.current.position.y = -0.12 - Math.sin(s * Math.PI) * 0.35;
      meshRef.current.position.z = -0.3 + Math.sin(s * Math.PI * 1.5) * 0.25;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0.6, -0.12, -0.3]}
      rotation={[-0.25, 0.28, 0.05]}
      material={shaderMaterial}
    >
      <planeGeometry args={[16, 11, 112, 112]} />
    </mesh>
  );
}

// Interactive 3D Studio Camera Rig with smooth parallax and scroll-dolly across the whole page
function CameraRig({
  scrollNorm,
}: {
  scrollNorm: React.MutableRefObject<number>;
}) {
  useFrame((state) => {
    const px = state.pointer.x;
    const py = state.pointer.y;
    const s = scrollNorm.current;

    // 3D Camera smooth position interpolation across whole site
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, px * 0.9, 0.045);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, py * 0.5 - s * 0.8, 0.045);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 4.2 + Math.sin(s * Math.PI) * 0.6, 0.045);

    // 3D Camera lookAt target with subtle depth parallax
    state.camera.lookAt(px * 0.2, py * 0.12 - s * 0.3, 0);
  });

  return null;
}

// Floating Couture Accents (Terracotta droplets + delicate luminous threads at different depths)
function CoutureAccents({
  scrollNorm,
  lightPos,
}: {
  scrollNorm: React.MutableRefObject<number>;
  lightPos: React.MutableRefObject<THREE.Vector3>;
}) {
  const dropletRef1 = useRef<THREE.Mesh>(null);
  const dropletRef2 = useRef<THREE.Mesh>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  // Generate 36 subtle luminous couture threads / particles for multi-tier depth parallax
  const particleCount = 36;
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < particleCount; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 10.5,
        y: (Math.random() - 0.5) * 6.5,
        z: (Math.random() - 0.5) * 3.5 + 0.2,
        scale: Math.random() * 0.035 + 0.015,
        speed: Math.random() * 0.8 + 0.4,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = scrollNorm.current;

    // Primary terracotta specimen bead floating in mid-depth
    if (dropletRef1.current) {
      dropletRef1.current.position.y = 0.95 + Math.sin(t * 0.9) * 0.18 - Math.sin(s * Math.PI * 2) * 0.4;
      dropletRef1.current.position.x = -2.6 + Math.cos(t * 0.4) * 0.15;
      dropletRef1.current.position.z = 0.6 - Math.sin(s * Math.PI) * 0.3;
      dropletRef1.current.rotation.y = t * 0.4;
      dropletRef1.current.rotation.x = t * 0.25;
    }

    // Secondary warm terracotta accent droplet
    if (dropletRef2.current) {
      dropletRef2.current.position.y = -0.85 + Math.sin(t * 0.75 + 1.2) * 0.16 + Math.sin(s * Math.PI * 2) * 0.35;
      dropletRef2.current.position.x = 2.8 + Math.sin(t * 0.35) * 0.18;
      dropletRef2.current.position.z = -0.4 + Math.cos(s * Math.PI) * 0.25;
      dropletRef2.current.rotation.y = t * 0.3;
    }

    // Floating delicate particles shifting in depth
    if (particleGroupRef.current) {
      particleGroupRef.current.children.forEach((child, i) => {
        const p = particles[i];
        child.position.y = p.y + Math.sin(t * p.speed + i) * 0.25 - s * 0.8;
        child.position.x = p.x + Math.cos(t * p.speed * 0.7 + i) * 0.18;
      });
    }
  });

  return (
    <group>
      {/* Primary Terracotta Couture Specimen Droplet */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh ref={dropletRef1} position={[-2.6, 0.95, 0.6]} scale={[0.52, 0.52, 0.52]}>
          <sphereGeometry args={[0.8, 48, 48]} />
          <MeshDistortMaterial
            color="#e78b73"
            roughness={0.16}
            metalness={0.92}
            clearcoat={1}
            clearcoatRoughness={0.06}
            distort={0.4}
            speed={2.8}
            transparent
            opacity={0.65}
          />
        </mesh>
      </Float>

      {/* Secondary Soft Terracotta Droplet */}
      <Float speed={1.7} rotationIntensity={0.5} floatIntensity={0.7}>
        <mesh ref={dropletRef2} position={[2.8, -0.85, -0.4]} scale={[0.42, 0.42, 0.42]}>
          <sphereGeometry args={[0.75, 40, 40]} />
          <MeshDistortMaterial
            color="#e78b73"
            roughness={0.22}
            metalness={0.88}
            clearcoat={0.9}
            distort={0.35}
            speed={2.4}
            transparent
            opacity={0.55}
          />
        </mesh>
      </Float>

      {/* Floating atelier specular micro-threads for depth parallax */}
      <group ref={particleGroupRef}>
        {particles.map((p, idx) => (
          <mesh key={idx} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[p.scale, 12, 12]} />
            <meshBasicMaterial
              color={idx % 3 === 0 ? "#e78b73" : "#fbf7f4"}
              transparent
              opacity={0.42}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Scene Orchestrator with Dynamic Lights, Camera Rig, and Fabric Simulation
function AtelierScene({
  scrollNorm,
  mousePos,
  mouseVel,
}: {
  scrollNorm: React.MutableRefObject<number>;
  mousePos: React.MutableRefObject<THREE.Vector2>;
  mouseVel: React.MutableRefObject<number>;
}) {
  const dynamicLightRef = useRef<THREE.PointLight>(null);
  const lightPos = useRef(new THREE.Vector3(2, 2, 2));

  useFrame((state) => {
    // Dynamic terracotta point light tracks the pointer in 3D space across whole viewport
    const px = state.pointer.x;
    const py = state.pointer.y;
    const targetX = px * 4.4;
    const targetY = py * 2.8;
    const targetZ = 1.8;

    lightPos.current.x = THREE.MathUtils.lerp(lightPos.current.x, targetX, 0.08);
    lightPos.current.y = THREE.MathUtils.lerp(lightPos.current.y, targetY, 0.08);
    lightPos.current.z = THREE.MathUtils.lerp(lightPos.current.z, targetZ, 0.08);

    if (dynamicLightRef.current) {
      dynamicLightRef.current.position.copy(lightPos.current);
    }
  });

  return (
    <>
      {/* 3D Camera Rig */}
      <CameraRig scrollNorm={scrollNorm} />

      {/* Dynamic Lighting Rig */}
      <ambientLight intensity={0.6} color="#fbf7f4" />
      <directionalLight position={[5, 7, 4]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-4, -3, 2]} intensity={0.65} color="#ebe8df" />

      {/* Interactive Terracotta Point Light with Real-Time Specular Glints */}
      <pointLight
        ref={dynamicLightRef}
        position={[2, 2, 1.8]}
        intensity={3.4}
        distance={13.0}
        decay={2}
        color="#e78b73"
      />

      {/* 3D Couture Fabric Cloth Mesh with Shader Waves */}
      <CoutureFabricMesh
        mousePos={mousePos}
        mouseVel={mouseVel}
        scrollNorm={scrollNorm}
        lightPos={lightPos}
      />

      {/* Depth Parallax Couture Droplets & Floating Threads */}
      <CoutureAccents scrollNorm={scrollNorm} lightPos={lightPos} />
    </>
  );
}

type HeroScene3DProps = {
  className?: string;
};

export function HeroScene3D({ className = "" }: HeroScene3DProps) {
  const reducedMotion = useReducedMotion();

  const scrollNorm = useRef(0);
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const mouseVel = useRef(0);
  const lastMouse = useRef(new THREE.Vector2(0, 0));

  React.useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollNorm.current = Math.min(1.0, Math.max(0, current / maxScroll));
    };

    const updateCoordinates = (clientX: number, clientY: number) => {
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = -(clientY / window.innerHeight) * 2 + 1;
      mousePos.current.set(nx, ny);

      const dx = nx - lastMouse.current.x;
      const dy = ny - lastMouse.current.y;
      lastMouse.current.set(nx, ny);
      mouseVel.current = Math.sqrt(dx * dx + dy * dy) * 10;
    };

    const onPointerMove = (e: PointerEvent) => {
      updateCoordinates(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  if (reducedMotion) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ zIndex: 1 }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0 }}
      >
        <Suspense fallback={null}>
          <AtelierScene
            scrollNorm={scrollNorm}
            mousePos={mousePos}
            mouseVel={mouseVel}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Alias for global background usage
export const GlobalAtelierScene3D = HeroScene3D;
