import { Float, MeshDistortMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "../hooks/useReducedMotion";

// Custom High-Contrast GLSL Shader for Luxury Black Velvet / Noir Liquid Silk Simulation
const NoirFabricShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseVel: { value: 0 },
    uLightPos: { value: new THREE.Vector3(0, 0, 2.2) },
    uColorDeep: { value: new THREE.Color("#0a0a0b") },
    uColorVelvet: { value: new THREE.Color("#262321") },
    uColorGraphite: { value: new THREE.Color("#4d4642") },
    uColorSpecular: { value: new THREE.Color("#e2d9d4") },
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

    // Sculpted multi-octave wave displacement for clearly visible noir silk drape
    float getDisplacement(vec2 p) {
      // 1. Primary heavy rolling folds
      float w1 = sin(p.x * 1.5 + uTime * 1.1) * cos(p.y * 1.2 + uTime * 0.85) * 0.48;
      
      // 2. High-frequency silk tension waves
      float w2 = sin((p.x + p.y) * 2.6 + uTime * 1.4) * 0.20;
      float w3 = cos(p.x * 3.6 - p.y * 2.8 + uTime * 1.6) * 0.10;
      
      // 3. Dynamic cursor wake ripple
      vec2 mTarget = uMouse * vec2(4.5, 2.5);
      float distToMouse = length(p - mTarget);
      float mouseRipple = sin(distToMouse * 7.5 - uTime * 4.2) * exp(-distToMouse * 0.85) * 0.4 * clamp(uMouseVel * 2.0, 0.4, 2.2);

      return w1 + w2 + w3 + mouseRipple;
    }

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Analytical normal re-estimation for sharp, vibrant light reflections on creases
      float offset = 0.05;
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
      vDispersion = abs(dX - dCenter) * 5.0 + uMouseVel * 0.2;

      vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uLightPos;
    uniform vec3 uColorDeep;
    uniform vec3 uColorVelvet;
    uniform vec3 uColorGraphite;
    uniform vec3 uColorSpecular;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    varying float vWaveIntensity;
    varying float vDispersion;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPosition);

      // 1. Dynamic cursor point light with bright specular glints
      vec3 L_point = normalize(uLightPos - vPosition);
      float distPoint = length(uLightPos - vPosition);
      float atten = 1.0 / (1.0 + 0.12 * distPoint + 0.03 * distPoint * distPoint);
      float diffPoint = max(dot(N, L_point), 0.0) * atten;

      // Sharp anisotropic specular shine across dark silk folds
      vec3 R_point = reflect(-L_point, N);
      float specPoint = pow(max(dot(R_point, V), 0.0), 26.0) * atten;

      // 2. Directional key light for rich sculpted lighting
      vec3 L_dir = normalize(vec3(3.0, 5.0, 3.5));
      float diffDir = max(dot(N, L_dir), 0.0);
      vec3 R_dir = reflect(-L_dir, N);
      float specDir = pow(max(dot(R_dir, V), 0.0), 28.0);

      // 3. Strong Fresnel rim glow (luxury velvet/liquid silk sheen)
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.6);

      // High-contrast Noir palette: deep noir shadow -> rich velvet -> graphite ridges -> platinum specular glints
      vec3 baseCloth = mix(uColorDeep, uColorVelvet, diffDir * 0.7 + 0.3);
      vec3 graphiteRidges = uColorGraphite * (diffPoint * 2.4 + fresnel * 2.6);
      vec3 metallicGlint = uColorSpecular * (specPoint * 3.4 + specDir * 1.8);

      // Optical chromatic dispersion along sharp wave peaks
      float chromatic = clamp(vDispersion * 0.06, 0.0, 0.2);
      vec3 finalColor = baseCloth + graphiteRidges + metallicGlint;
      finalColor.r += chromatic * 0.12;
      finalColor.b -= chromatic * 0.06;

      // High opacity and strong presence in the preloader
      float alpha = clamp(0.85 + fresnel * 0.15 + specPoint * 0.4 + abs(vWaveIntensity) * 0.15, 0.75, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

function NoirFabricMesh({
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
        ...NoirFabricShaderMaterial,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    shaderMaterial.uniforms.uTime.value = t;
    shaderMaterial.uniforms.uMouse.value.lerp(mousePos.current, 0.08);
    shaderMaterial.uniforms.uMouseVel.value = THREE.MathUtils.lerp(
      shaderMaterial.uniforms.uMouseVel.value,
      mouseVel.current,
      0.08
    );
    shaderMaterial.uniforms.uLightPos.value.copy(lightPos.current);

    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(t * 0.35) * 0.04;
      meshRef.current.position.y = -0.06 + Math.sin(t * 0.45) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, -0.06, -0.2]}
      rotation={[-0.22, 0.16, 0.03]}
      material={shaderMaterial}
    >
      <planeGeometry args={[16, 10, 100, 100]} />
    </mesh>
  );
}

// 3D Camera Rig for Loading Screen
function NoirCameraRig() {
  useFrame((state) => {
    const px = state.pointer.x;
    const py = state.pointer.y;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, px * 0.8, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, py * 0.45, 0.05);
    state.camera.lookAt(px * 0.18, py * 0.1, 0);
  });

  return null;
}

// Floating Noir Specimen Accents & Graphite Particles for Depth Parallax
function NoirAccents() {
  const bead1 = useRef<THREE.Mesh>(null);
  const bead2 = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 32; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 9.5,
        y: (Math.random() - 0.5) * 6.0,
        z: (Math.random() - 0.5) * 3.0 + 0.2,
        scale: Math.random() * 0.035 + 0.015,
        speed: Math.random() * 0.7 + 0.4,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (bead1.current) {
      bead1.current.position.y = 0.9 + Math.sin(t * 0.85) * 0.16;
      bead1.current.position.x = -2.6 + Math.cos(t * 0.5) * 0.14;
      bead1.current.rotation.y = t * 0.4;
      bead1.current.rotation.x = t * 0.25;
    }

    if (bead2.current) {
      bead2.current.position.y = -0.95 + Math.sin(t * 0.75 + 1.5) * 0.16;
      bead2.current.position.x = 2.6 + Math.sin(t * 0.45) * 0.14;
      bead2.current.rotation.y = t * 0.35;
    }

    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const p = particles[i];
        child.position.y = p.y + Math.sin(t * p.speed + i) * 0.2;
        child.position.x = p.x + Math.cos(t * p.speed * 0.6 + i) * 0.15;
      });
    }
  });

  return (
    <group>
      {/* Floating High-Gloss Obsidian Specimen Bead 1 */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh ref={bead1} position={[-2.6, 0.9, 0.6]} scale={[0.5, 0.5, 0.5]}>
          <sphereGeometry args={[0.75, 40, 40]} />
          <MeshDistortMaterial
            color="#221f1e"
            roughness={0.08}
            metalness={0.96}
            clearcoat={1}
            clearcoatRoughness={0.04}
            distort={0.4}
            speed={2.4}
            transparent
            opacity={0.88}
          />
        </mesh>
      </Float>

      {/* Floating High-Gloss Obsidian Specimen Bead 2 */}
      <Float speed={1.7} rotationIntensity={0.5} floatIntensity={0.7}>
        <mesh ref={bead2} position={[2.6, -0.95, -0.1]} scale={[0.42, 0.42, 0.42]}>
          <sphereGeometry args={[0.7, 36, 36]} />
          <MeshDistortMaterial
            color="#2a2725"
            roughness={0.12}
            metalness={0.92}
            clearcoat={0.95}
            distort={0.35}
            speed={2.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>

      {/* Floating Luminous Graphite & Specular Dust Particles */}
      <group ref={particlesRef}>
        {particles.map((p, idx) => (
          <mesh key={idx} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[p.scale, 10, 10]} />
            <meshBasicMaterial
              color={idx % 2 === 0 ? "#786f6a" : "#443f3c"}
              transparent
              opacity={0.65}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Noir Scene with Dynamic Lighting
function NoirScene({
  mousePos,
  mouseVel,
}: {
  mousePos: React.MutableRefObject<THREE.Vector2>;
  mouseVel: React.MutableRefObject<number>;
}) {
  const dynamicLightRef = useRef<THREE.PointLight>(null);
  const lightPos = useRef(new THREE.Vector3(0, 0, 2.2));

  useFrame((state) => {
    const px = state.pointer.x;
    const py = state.pointer.y;

    lightPos.current.x = THREE.MathUtils.lerp(lightPos.current.x, px * 4.2, 0.08);
    lightPos.current.y = THREE.MathUtils.lerp(lightPos.current.y, py * 2.6, 0.08);
    lightPos.current.z = THREE.MathUtils.lerp(lightPos.current.z, 1.8, 0.08);

    if (dynamicLightRef.current) {
      dynamicLightRef.current.position.copy(lightPos.current);
    }
  });

  return (
    <>
      <NoirCameraRig />

      {/* Dynamic Studio Lighting Rig for Noir Velvet */}
      <ambientLight intensity={0.6} color="#242120" />
      <directionalLight position={[4, 6, 4]} intensity={1.4} color="#554e4a" />
      <directionalLight position={[-4, -3, 2]} intensity={0.8} color="#383230" />

      {/* Interactive Cursor Point Light Casting Dramatic Crease Sheen */}
      <pointLight
        ref={dynamicLightRef}
        position={[0, 0, 1.8]}
        intensity={4.5}
        distance={13.0}
        decay={2}
        color="#8f847f"
      />

      {/* 3D Black Velvet Simulation Mesh */}
      <NoirFabricMesh
        mousePos={mousePos}
        mouseVel={mouseVel}
        lightPos={lightPos}
      />

      {/* Depth Parallax Accents */}
      <NoirAccents />
    </>
  );
}

export function NoirIntroScene3D() {
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
      className="absolute inset-0 pointer-events-none overflow-hidden z-[15]"
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4.0], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <NoirScene mousePos={mousePos} mouseVel={mouseVel} />
        </Suspense>
      </Canvas>
    </div>
  );
}
