import { Float, MeshDistortMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useIsTouchDevice, useReducedMotion } from "../hooks/useReducedMotion";

// Gentle GLSL Shader for Hero Section: Subtle amplitude ("kam effect"), house colors (terracotta & ivory)
const GentleHeroFabricShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseVel: { value: 0 },
    uLightPos: { value: new THREE.Vector3(1.5, 1.5, 2.0) },
    uColorTerracotta: { value: new THREE.Color("#e78b73") },
    uColorIvory: { value: new THREE.Color("#fbf7f4") },
    uColorShadow: { value: new THREE.Color("#181413") },
  },
  vertexShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uMouseVel;
    uniform vec3 uLightPos;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying float vWaveIntensity;
    varying float vDispersion;

    // Gentle wave displacement with restrained amplitude ("kam effect")
    float getDisplacement(vec2 p) {
      // 1. Slow, elegant rolling silk folds (subtle amplitude: 0.22)
      float w1 = sin(p.x * 1.15 + uTime * 0.52) * cos(p.y * 0.9 + uTime * 0.42) * 0.22;
      
      // 2. Soft micro silk ripple (amplitude: 0.08)
      float w2 = sin((p.x + p.y) * 1.9 + uTime * 0.75) * 0.08;
      
      // 3. Gentle cursor wake response
      vec2 mTarget = uMouse * vec2(4.2, 2.2);
      float distToMouse = length(p - mTarget);
      float mouseRipple = sin(distToMouse * 5.5 - uTime * 2.8) * exp(-distToMouse * 1.1) * 0.16 * clamp(uMouseVel * 1.4, 0.2, 0.85);

      return w1 + w2 + mouseRipple;
    }

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Analytical normal re-estimation for natural light glints across soft folds
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
      vDispersion = abs(dX - dCenter) * 2.5 + uMouseVel * 0.1;

      vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uLightPos;
    uniform vec3 uColorTerracotta;
    uniform vec3 uColorIvory;
    uniform vec3 uColorShadow;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying float vWaveIntensity;
    varying float vDispersion;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPosition);

      // 1. Gentle terracotta cursor point light
      vec3 L_point = normalize(uLightPos - vPosition);
      float distPoint = length(uLightPos - vPosition);
      float atten = 1.0 / (1.0 + 0.18 * distPoint + 0.06 * distPoint * distPoint);
      float diffPoint = max(dot(N, L_point), 0.0) * atten;

      // Soft anisotropic specular glint
      vec3 R_point = reflect(-L_point, N);
      float specPoint = pow(max(dot(R_point, V), 0.0), 24.0) * atten;

      // 2. Ambient studio key light
      vec3 L_dir = normalize(vec3(2.5, 4.0, 3.0));
      float diffDir = max(dot(N, L_dir), 0.0);
      vec3 R_dir = reflect(-L_dir, N);
      float specDir = pow(max(dot(R_dir, V), 0.0), 28.0);

      // 3. Delicate fresnel rim highlight (quiet luxury sheer edge)
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);

      // Harmonious palette: warm terracotta accent and pearl ivory over subtle shadow
      vec3 baseDrape = mix(uColorShadow, uColorIvory, diffDir * 0.5 + 0.2);
      vec3 terracottaSheen = uColorTerracotta * (diffPoint * 1.4 + fresnel * 1.2 + specPoint * 0.9);
      vec3 pearlGlint = vec3(1.0, 0.97, 0.94) * (specDir * 0.6 + specPoint * 0.5);

      // Very subtle, quiet chromatic dispersion along peaks
      float chromatic = clamp(vDispersion * 0.025, 0.0, 0.08);
      vec3 finalColor = baseDrape + terracottaSheen + pearlGlint;
      finalColor.r += chromatic * 0.08;
      finalColor.b -= chromatic * 0.04;

      // Restrained translucency ("kam effect"): soft veil that doesn't obscure the campaign photo
      float alpha = clamp(0.22 + fresnel * 0.24 + (specPoint * 0.8 + specDir * 0.4) * 0.25 + abs(vWaveIntensity) * 0.12, 0.12, 0.52);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

function GentleFabricMesh({
  mousePos,
  mouseVel,
  lightPos,
}: {
  mousePos: React.MutableRefObject<THREE.Vector2>;
  mouseVel: React.MutableRefObject<number>;
  lightPos: React.MutableRefObject<THREE.Vector3>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...GentleHeroFabricShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    shaderMaterial.uniforms.uTime.value = t;
    shaderMaterial.uniforms.uMouse.value.lerp(mousePos.current, 0.05);
    shaderMaterial.uniforms.uMouseVel.value = THREE.MathUtils.lerp(
      shaderMaterial.uniforms.uMouseVel.value,
      mouseVel.current,
      0.06
    );
    shaderMaterial.uniforms.uLightPos.value.copy(lightPos.current);

    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.02;
      meshRef.current.position.y = -0.08 + Math.sin(t * 0.3) * 0.05;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0.5, -0.08, -0.1]}
      rotation={[-0.2, 0.22, 0.03]}
      material={shaderMaterial}
    >
      <planeGeometry args={[15, 10, 80, 80]} />
    </mesh>
  );
}

// Gentle 3D Camera Rig for Hero Section
function GentleCameraRig() {
  useFrame((state) => {
    const px = state.pointer.x;
    const py = state.pointer.y;

    // Smooth, restrained camera follow
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, px * 0.5, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, py * 0.3, 0.04);
    state.camera.lookAt(px * 0.12, py * 0.08, 0);
  });

  return null;
}

// Subtle Floating Terracotta Specimen Droplets & Delicate Dust
function GentleHeroAccents() {
  const beadRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 8.5,
        y: (Math.random() - 0.5) * 5.0,
        z: (Math.random() - 0.5) * 2.2 + 0.1,
        scale: Math.random() * 0.025 + 0.012,
        speed: Math.random() * 0.5 + 0.3,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (beadRef.current) {
      beadRef.current.position.y = 0.7 + Math.sin(t * 0.7) * 0.12;
      beadRef.current.position.x = 2.4 + Math.cos(t * 0.4) * 0.1;
      beadRef.current.rotation.y = t * 0.25;
    }

    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const p = particles[i];
        child.position.y = p.y + Math.sin(t * p.speed + i) * 0.15;
        child.position.x = p.x + Math.cos(t * p.speed * 0.6 + i) * 0.1;
      });
    }
  });

  return (
    <group>
      {/* Subtle Terracotta Droplet on the side */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh ref={beadRef} position={[2.4, 0.7, 0.3]} scale={[0.36, 0.36, 0.36]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <MeshDistortMaterial
            color="#e78b73"
            roughness={0.25}
            metalness={0.85}
            clearcoat={0.8}
            distort={0.25}
            speed={1.8}
            transparent
            opacity={0.48}
          />
        </mesh>
      </Float>

      {/* Floating Delicate Micro-Particles */}
      <group ref={particlesRef}>
        {particles.map((p, idx) => (
          <mesh key={idx} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[p.scale, 10, 10]} />
            <meshBasicMaterial
              color={idx % 2 === 0 ? "#e78b73" : "#fbf7f4"}
              transparent
              opacity={0.35}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Hero Scene with Dynamic Lighting
function GentleHeroScene({
  mousePos,
  mouseVel,
}: {
  mousePos: React.MutableRefObject<THREE.Vector2>;
  mouseVel: React.MutableRefObject<number>;
}) {
  const dynamicLightRef = useRef<THREE.PointLight>(null);
  const lightPos = useRef(new THREE.Vector3(1.5, 1.5, 2.0));

  useFrame((state) => {
    const px = state.pointer.x;
    const py = state.pointer.y;

    lightPos.current.x = THREE.MathUtils.lerp(lightPos.current.x, px * 3.5, 0.06);
    lightPos.current.y = THREE.MathUtils.lerp(lightPos.current.y, py * 2.0, 0.06);
    lightPos.current.z = THREE.MathUtils.lerp(lightPos.current.z, 1.8, 0.06);

    if (dynamicLightRef.current) {
      dynamicLightRef.current.position.copy(lightPos.current);
    }
  });

  return (
    <>
      <GentleCameraRig />

      {/* Soft Ambient and Directional Lights */}
      <ambientLight intensity={0.5} color="#fbf7f4" />
      <directionalLight position={[4, 5, 3]} intensity={0.8} color="#ffffff" />

      {/* Subtle Terracotta Dynamic Point Light */}
      <pointLight
        ref={dynamicLightRef}
        position={[1.5, 1.5, 1.8]}
        intensity={1.9}
        distance={9.0}
        decay={2}
        color="#e78b73"
      />

      {/* Gentle Fabric Mesh */}
      <GentleFabricMesh
        mousePos={mousePos}
        mouseVel={mouseVel}
        lightPos={lightPos}
      />

      {/* Subtle Accents */}
      <GentleHeroAccents />
    </>
  );
}

export function HeroFabricLayer() {
  const reducedMotion = useReducedMotion();

  const mousePos = useRef(new THREE.Vector2(0, 0));
  const mouseVel = useRef(0);
  const lastMouse = useRef(new THREE.Vector2(0, 0));

  React.useEffect(() => {
    const updateCoordinates = (clientX: number, clientY: number) => {
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = -(clientY / window.innerHeight) * 2 + 1;
      mousePos.current.set(nx, ny);

      const dx = nx - lastMouse.current.x;
      const dy = ny - lastMouse.current.y;
      lastMouse.current.set(nx, ny);
      mouseVel.current = Math.sqrt(dx * dx + dy * dy) * 8;
    };

    const onPointerMove = (e: PointerEvent) => {
      updateCoordinates(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  if (reducedMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-[4]"
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.0], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <GentleHeroScene mousePos={mousePos} mouseVel={mouseVel} />
        </Suspense>
      </Canvas>
    </div>
  );
}
