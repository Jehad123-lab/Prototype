import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import '../../shaders/CardShaderMaterial';
import { createCardTexture, createMaskTexture, createBackPatternTexture, createPackOverlayTexture, createPackBackOverlayTexture } from '../../utils/TextureUtils';

declare module '@react-three/fiber' {
  interface ThreeElements {
    dissolveFrontMaterial: any;
    pulsingBackMaterial: any;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      dissolveFrontMaterial: any;
      pulsingBackMaterial: any;
    }
  }
}

const PackModel = ({ texPackOverlay, texPackOverlayBack, texPackNormal, color = "#ffffff", opacity = 1.0 }: any) => {
  const { texPackOverlayFlip, texPackNormalFlip } = useMemo(() => {
    if (!texPackOverlay) return { texPackOverlayFlip: null, texPackNormalFlip: null };
    const oFlip = texPackOverlay.clone();
    oFlip.wrapS = THREE.RepeatWrapping;
    oFlip.wrapT = THREE.RepeatWrapping;
    oFlip.repeat.set(-1, 1);
    oFlip.offset.set(1, 0);
    oFlip.needsUpdate = true;

    let nFlip = null;
    if (texPackNormal) {
      nFlip = texPackNormal.clone();
      nFlip.wrapS = THREE.RepeatWrapping;
      nFlip.wrapT = THREE.RepeatWrapping;
      nFlip.repeat.set(-1, 1);
      nFlip.offset.set(1, 0);
      nFlip.needsUpdate = true;
    }
    return { texPackOverlayFlip: oFlip, texPackNormalFlip: nFlip };
  }, [texPackOverlay, texPackNormal]);

  return (
    <group>
      {/* Solid inner core is shrunken to prevent rigid box corners leaking outside crinkled alpha contours */}
      <mesh>
        <boxGeometry args={[2.0, 3.1, 0.012]} />
        <meshStandardMaterial 
          color="#020204"
          metalness={0.9}
          roughness={0.15}
          transparent={true}
          opacity={opacity}
        />
      </mesh>
      {/* Front Plane: physical glossy metallic refractor wrapper */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[2.7, 3.8]} />
        <meshPhysicalMaterial 
            map={texPackOverlay} 
            emissiveMap={texPackOverlay}
            emissive="#ffffff"
            emissiveIntensity={0.25}
            normalMap={texPackNormal}
            normalScale={new THREE.Vector2(0.9, 0.9)} // Deep vacuum crinkles popping
            roughness={0.16}
            metalness={0.12} // Keep diffuse textures rich and colorful; glossy lacquer sheen on top
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            envMapIntensity={1.0} // Highlight reflection pop feels premium and not blown out
            transparent 
            opacity={opacity} 
            alphaTest={0.05} // Smooth, crisp, non-eroded graphics and text borders
        />
      </mesh>
      {/* Back Plane: Purpose-built authentic design instead of ugly reversed/mirrored texts */}
      <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.7, 3.8]} />
        <meshPhysicalMaterial 
            map={texPackOverlayBack || texPackOverlayFlip || texPackOverlay}
            alphaMap={texPackOverlayBack || texPackOverlayFlip || texPackOverlay}
            emissiveMap={texPackOverlayBack || texPackOverlayFlip || texPackOverlay}
            emissive="#ffffff"
            emissiveIntensity={0.88}
            normalMap={texPackNormalFlip || texPackNormal}
            normalScale={new THREE.Vector2(0.08, 0.08)}
            color="#ffffff"
            roughness={0.2}
            metalness={0.0} // Pure diffuse response combined with self-illumination makes it ultra bright and clean
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            envMapIntensity={1.0}
            transparent={true}
            opacity={opacity}
            alphaTest={0.05}
        />
      </mesh>
    </group>
  );
};

const SliceShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform vec3 uColor;
    uniform float uDirection; // 0.0 = LTR, 1.0 = RTL
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      float distToCenter = abs(vUv.y - 0.5);
      float xProgress = vUv.x;
      if (uDirection > 0.5) {
        // Right to Left
        if (vUv.x < (1.0 - uProgress)) {
          discard;
        }
        xProgress = 1.0 - vUv.x;
      } else {
        // Left to Right
        if (vUv.x > uProgress) {
          discard;
        }
      }
      float core = smoothstep(0.12, 0.0, distToCenter);
      float glow = exp(-distToCenter * 14.0);
      float noise = sin(xProgress * 40.0 - uTime * 20.0) * cos(xProgress * 15.0 + uTime * 8.0);
      float sparkle = smoothstep(0.3, 0.9, sin(xProgress * 120.0 + uTime * 25.0));
      vec3 finalColor = uColor * (core * 3.5 + glow * 2.0 + glow * noise * 0.4 + sparkle * 2.5);
      float edgeFade = smoothstep(0.0, 0.05, xProgress) * smoothstep(uProgress, uProgress - 0.02, xProgress);
      gl_FragColor = vec4(finalColor * edgeFade * uOpacity, (core + glow * 0.8) * edgeFade * uOpacity);
    }
  `
};

const PackHalfModel = ({ texPackOverlay, texPackOverlayBack, texPackNormal, isTop, color = "#ffffff", opacity = 1.0 }: any) => {
  const splitRatio = 0.79; // High-precision top crimp cut (top 21% sliced away)

  const halfTex = useMemo(() => {
    if (!texPackOverlay) return null;
    const t = texPackOverlay.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, isTop ? 1.0 - splitRatio : splitRatio);
    t.offset.set(0, isTop ? splitRatio : 0);
    t.needsUpdate = true;
    return t;
  }, [texPackOverlay, isTop]);

  const halfTexFlip = useMemo(() => {
    if (!halfTex) return null;
    const t = halfTex.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(-1, isTop ? 1.0 - splitRatio : splitRatio);
    t.offset.set(1, isTop ? splitRatio : 0);
    t.needsUpdate = true;
    return t;
  }, [halfTex, isTop]);

  const halfTexBack = useMemo(() => {
    if (!texPackOverlayBack) return null;
    const t = texPackOverlayBack.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(-1, isTop ? 1.0 - splitRatio : splitRatio);
    t.offset.set(1, isTop ? splitRatio : 0);
    t.needsUpdate = true;
    return t;
  }, [texPackOverlayBack, isTop]);

  const halfNormal = useMemo(() => {
    if (!texPackNormal) return null;
    const t = texPackNormal.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, isTop ? 1.0 - splitRatio : splitRatio);
    t.offset.set(0, isTop ? splitRatio : 0);
    t.needsUpdate = true;
    return t;
  }, [texPackNormal, isTop]);

  const halfNormalFlip = useMemo(() => {
    if (!halfNormal) return null;
    const t = halfNormal.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(-1, isTop ? 1.0 - splitRatio : splitRatio);
    t.offset.set(1, isTop ? splitRatio : 0);
    t.needsUpdate = true;
    return t;
  }, [halfNormal, isTop]);

  const height = 3.8 * (isTop ? 1.0 - splitRatio : splitRatio);
  const localY = isTop ? 1.9 - height / 2 : -1.9 + height / 2;

  const alphaTestVal = opacity < 0.95 ? 0.001 : 0.05;

  return (
    <group position={[0, localY, 0]}>
      {/* Texture Overlay Half covering box front perfectly */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[2.7, height]} />
        <meshPhysicalMaterial 
          map={halfTex} 
          emissiveMap={halfTex}
          emissive="#ffffff"
          emissiveIntensity={0.25}
          normalMap={halfNormal}
          normalScale={new THREE.Vector2(0.9, 0.9)}
          roughness={0.16}
          metalness={0.12} // Keep diffuse textures rich and colorful; glossy lacquer sheen on top
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={1.0} // Highlight reflection pop feels premium and not blown out
          transparent 
          opacity={opacity} 
          alphaTest={alphaTestVal}
        />
      </mesh>
      {/* Textured pack back plane for splitting halves with mirrored visuals */}
      <mesh position={[0, 0, -0.045]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.7, height]} />
        <meshPhysicalMaterial 
          map={halfTexBack || halfTexFlip || halfTex}
          alphaMap={halfTexBack || halfTexFlip || halfTex}
          emissiveMap={halfTexBack || halfTexFlip || halfTex}
          emissive="#ffffff"
          emissiveIntensity={0.88}
          normalMap={halfNormalFlip || halfNormal}
          normalScale={new THREE.Vector2(0.08, 0.08)}
          color="#ffffff"
          roughness={0.2}
          metalness={0.0} // Pure diffuse response combined with self-illumination makes it ultra bright and clean
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={1.0}
          transparent={true}
          opacity={opacity}
          alphaTest={alphaTestVal}
        />
      </mesh>
    </group>
  );
};

const SliceGlowLine = ({ progress, active, direction, opacity = 1.0 }: { progress: number, active: boolean, direction: 'ltr' | 'rtl', opacity?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uDirection: { value: direction === 'rtl' ? 1.0 : 0.0 },
    uColor: { value: new THREE.Color('#22c55e') }, // Green laser spark trail
    uOpacity: { value: opacity }
  }), [direction, opacity]);

  useFrame((state) => {
    if (materialRef.current && active) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        progress,
        0.25
      );
      materialRef.current.uniforms.uDirection.value = direction === 'rtl' ? 1.0 : 0.0;
      materialRef.current.uniforms.uOpacity.value = opacity;
    }
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} position={[0, 1.1, 0.065]}>
      <planeGeometry args={[2.7, 0.35]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={SliceShader.vertexShader}
        fragmentShader={SliceShader.fragmentShader}
      />
    </mesh>
  );
};

const particleTexture = (() => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.18, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
})();

interface FireworkParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: THREE.Color;
  size: number;
  life: number;
  decay: number;
  type: 'ember' | 'spark' | 'trail' | 'orbit';
  gravity?: number;
  friction?: number;
  wiggleSpeed?: number;
  wiggleAmplitude?: number;
  wigglePhase?: number;
}

const StarfieldAndFireworks = ({ 
  phase, 
  sliceActive, 
  sliceProgress, 
  sliceDirection,
  cardGroupRef
}: { 
  phase: string; 
  sliceActive?: boolean; 
  sliceProgress?: number; 
  sliceDirection?: 'ltr' | 'rtl';
  cardGroupRef?: React.RefObject<THREE.Group> | any;
}) => {
  const maxParticles = 400;

  const activeParticles = useRef<FireworkParticle[]>([]);
  const fireworksRef = useRef<THREE.Points>(null);

  useEffect(() => {
    const launchBurst = (x: number, y: number, z: number, colorHex: string, density: number, expansionSpeed = 1.0) => {
      const col = new THREE.Color(colorHex);
      
      // 1. Primary shell in target color
      for (let i = 0; i < density; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const speed = (1.2 + Math.random() * 2.2) * expansionSpeed;

        activeParticles.current.push({
          x,
          y,
          z,
          vx: Math.sin(phi) * Math.cos(theta) * speed,
          vy: Math.sin(phi) * Math.sin(theta) * speed + (0.4 + Math.random() * 0.8),
          vz: Math.cos(phi) * speed,
          color: col.clone().multiplyScalar(0.8 + Math.random() * 0.4),
          size: 0.03 + Math.random() * 0.05,
          life: 1.0,
          decay: 0.008 + Math.random() * 0.015,
          type: 'spark',
          gravity: 0.5 + Math.random() * 0.5,
          friction: 0.95
        });
      }

      // 2. Secondary bright golden sparkling stardust rain (metallic golden trails)
      const secondaryCount = Math.floor(density * 0.4);
      const goldColor = new THREE.Color('#fbbf24');
      for (let i = 0; i < secondaryCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const speed = (0.6 + Math.random() * 1.5) * expansionSpeed;

        activeParticles.current.push({
          x,
          y,
          z,
          vx: Math.sin(phi) * Math.cos(theta) * speed,
          vy: Math.sin(phi) * Math.sin(theta) * speed,
          vz: Math.cos(phi) * speed,
          color: goldColor.clone(),
          size: 0.02 + Math.random() * 0.03,
          life: 0.82 + Math.random() * 0.18,
          decay: 0.015 + Math.random() * 0.022,
          type: 'trail',
          gravity: 1.8, // falls faster
          friction: 0.93
        });
      }
    };

    if (phase === 'opening') {
      // Instantly clear all active and lingering particles
      activeParticles.current = [];
    } else if (phase === 'flipping') {
      activeParticles.current = [];
    } else if (phase === 'revealed') {
      activeParticles.current = [];
    }
  }, [phase]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.03);
    const list = activeParticles.current;

    // 1. Spawning Tip Cut Sparks in real-time
    if (sliceActive && sliceProgress !== undefined && sliceDirection !== undefined) {
      const tipX = sliceDirection === 'rtl' ? 1.35 - sliceProgress * 2.7 : -1.35 + sliceProgress * 2.7;
      const tipY = 1.1;
      const tipZ = 0.08;
      
      const sparkColor = new THREE.Color().setHSL(0.33 + (Math.random() > 0.7 ? 0.06 : -0.05), 0.95, 0.5 + Math.random() * 0.4);
      for (let i = 0; i < 1; i++) {
        list.push({
          x: tipX,
          y: tipY,
          z: tipZ,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -1.2 - Math.random() * 1.5, // shower downwards
          vz: (Math.random() - 0.5) * 1.5,
          color: sparkColor.clone(),
          size: 0.02 + Math.random() * 0.04,
          life: 1.0,
          decay: 0.03 + Math.random() * 0.05, // quick fade
          type: 'spark',
          gravity: 3.2,
          friction: 0.93
        });
      }
    }

    // 2. Continuous Background Drifting Embers (disabled after cutting to keep presentation ultra-clean)
    const ambientRate = (phase === 'carousel' || phase === 'ready') ? 0.03 : 0.0;
    if (Math.random() < ambientRate) {
      const isGold = Math.random() > 0.85;
      const color = isGold 
        ? new THREE.Color('#fbbf24') 
        : new THREE.Color().setHSL(0.33 + (Math.random() - 0.5) * 0.06, 0.9, 0.4 + Math.random() * 0.2);
      
      list.push({
        x: (Math.random() - 0.5) * 11.0,
        y: -4.5 + Math.random() * 7.5,
        z: -3.5 + Math.random() * 4.0,
        vx: (Math.random() - 0.5) * 0.15,
        vy: 0.1 + Math.random() * 0.25,
        vz: (Math.random() - 0.5) * 0.15,
        color: color,
        size: 0.015 + Math.random() * 0.04,
        life: 1.0,
        decay: 0.002 + Math.random() * 0.004,
        type: 'ember',
        gravity: -0.04, // extremely gentle lift
        friction: 0.98,
        wiggleSpeed: 1.0 + Math.random() * 1.2,
        wiggleAmplitude: 0.04 + Math.random() * 0.08,
        wigglePhase: Math.random() * Math.PI * 2
      });
    }

    // 3. Spawning museum-tier rotating orbit halos around the card
    if (phase === 'revealed' && cardGroupRef?.current) {
      if (Math.random() < 0.12) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.4 + Math.random() * 0.9;
        const startX = Math.cos(angle) * radius;
        const startY = (Math.random() - 0.5) * 4.2;
        const startZ = 0.4 + (Math.random() - 0.5) * 0.4;

        const isGold = Math.random() > 0.7;
        const color = isGold 
          ? new THREE.Color('#fbbf24') 
          : new THREE.Color().setHSL(0.33 + Math.random() * 0.05, 0.95, 0.6);

        list.push({
          x: startX,
          y: startY + 0.42,
          z: startZ + 2.0,
          vx: -Math.sin(angle) * (0.4 + Math.random() * 0.2),
          vy: (Math.random() - 0.5) * 0.06,
          vz: Math.cos(angle) * (0.15 + Math.random() * 0.1),
          color: color,
          size: 0.015 + Math.random() * 0.03,
          life: 1.0,
          decay: 0.004 + Math.random() * 0.01,
          type: 'orbit',
          gravity: 0.0,
          friction: 0.97
        });
      }
    }

    // Trim list if overflow
    if (list.length > maxParticles) {
      list.splice(0, list.length - maxParticles);
    }

    const fireworkPos = new Float32Array(maxParticles * 3);
    const fireworkColors = new Float32Array(maxParticles * 3);

    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      const gravityVal = p.gravity !== undefined ? p.gravity : 1.6;
      const frictionVal = p.friction !== undefined ? p.friction : 0.94;

      p.vy -= gravityVal * dt;
      p.vx *= frictionVal;
      p.vy *= frictionVal;
      p.vz *= frictionVal;

      p.life -= p.decay;

      if (p.type === 'ember' && p.wiggleSpeed && p.wiggleAmplitude && p.wigglePhase !== undefined) {
        p.x += Math.sin(elapsed * p.wiggleSpeed + p.wigglePhase) * p.wiggleAmplitude * dt;
      }

      if (p.life <= 0) {
        list.splice(i, 1);
        continue;
      }

      fireworkPos[i * 3] = p.x;
      fireworkPos[i * 3 + 1] = p.y;
      fireworkPos[i * 3 + 2] = p.z;

      const l = p.life;
      fireworkColors[i * 3] = p.color.r * l;
      fireworkColors[i * 3 + 1] = p.color.g * l;
      fireworkColors[i * 3 + 2] = p.color.b * l;
    }

    for (let i = list.length; i < maxParticles; i++) {
      fireworkPos[i * 3] = 999;
      fireworkPos[i * 3 + 1] = 999;
      fireworkPos[i * 3 + 2] = 999;
    }

    if (fireworksRef.current) {
      fireworksRef.current.geometry.attributes.position.array.set(fireworkPos);
      fireworksRef.current.geometry.attributes.color.array.set(fireworkColors);

      fireworksRef.current.geometry.attributes.position.needsUpdate = true;
      fireworksRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <points ref={fireworksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={maxParticles} array={new Float32Array(maxParticles * 3)} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={maxParticles} array={new Float32Array(maxParticles * 3)} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
          size={0.18} 
          vertexColors 
          transparent 
          blending={THREE.AdditiveBlending} 
          depthWrite={false} 
          map={particleTexture || undefined}
        />
      </points>
    </group>
  );
};

const CardSet = ({ phase, setPhase }) => {
  const carouselRef = useRef<THREE.Group>(null);
  const packRef = useRef<THREE.Group>(null);
  const packTopRef = useRef<THREE.Group>(null);
  const packBottomRef = useRef<THREE.Group>(null);
  const dummyGroupRef = useRef<THREE.Group>(null);
  const cardGroupRef = useRef<THREE.Group>(null);
  const pedestalRef = useRef<THREE.Group>(null);
  const frontMatRef = useRef<any>(null);
  const backMatRef = useRef<any>(null);
  const bgGlowMeshRef = useRef<THREE.Mesh>(null);
  const bgGlowRef = useRef<THREE.MeshBasicMaterial>(null);
  const sliceLineRef = useRef<THREE.Mesh>(null);

  const [sliceProgress, setSliceProgress] = useState(0);
  const [sliceActive, setSliceActive] = useState(false);
  const [sliceLaserOpacity, setSliceLaserOpacity] = useState(1.0);
  const [topOpacity, setTopOpacity] = useState(1.0);
  const [bottomOpacity, setBottomOpacity] = useState(1.0);
  const [sliceDirection, setSliceDirection] = useState<'ltr' | 'rtl'>('ltr');
  
  const isDragging = useRef(false);
  const sliceProgressRef = useRef(0);
  const isSlicingAuto = useRef(false);
  const sliceDirectionRef = useRef<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    sliceProgressRef.current = sliceProgress;
  }, [sliceProgress]);

  const texCard = useMemo(() => createCardTexture(), []);
  const texMask = useMemo(() => createMaskTexture(), []);
  const texBack = useMemo(() => createBackPatternTexture(), []);

  const { texPackOverlay, texPackOverlayBack, texPackNormal } = useMemo(() => {
    const loader = new THREE.TextureLoader();
    
    const texP = loader.load(
      '/assets/.aistudio/1d7f82039c76229657edbb9a595258904770fdf1.png',
      () => {
        texP.colorSpace = THREE.SRGBColorSpace;
        texP.wrapS = THREE.RepeatWrapping;
        texP.wrapT = THREE.RepeatWrapping;
        texP.needsUpdate = true;
      },
      undefined,
      () => {
        const fallback = createPackOverlayTexture();
        texP.image = fallback.image as any;
        texP.colorSpace = THREE.SRGBColorSpace;
        texP.wrapS = THREE.RepeatWrapping;
        texP.wrapT = THREE.RepeatWrapping;
        texP.needsUpdate = true;
      }
    );

    const texPBack = loader.load(
      '/assets/.aistudio/1d7f82039c76229657edbb9a595258904770fdf1%201-Photoroom.png',
      () => {
        texPBack.colorSpace = THREE.SRGBColorSpace;
        texPBack.wrapS = THREE.RepeatWrapping;
        texPBack.wrapT = THREE.RepeatWrapping;
        texPBack.repeat.set(-1, 1);
        texPBack.offset.set(1, 0);
        texPBack.needsUpdate = true;
      },
      undefined,
      () => {
        const fallback = createPackBackOverlayTexture();
        texPBack.image = fallback.image as any;
        texPBack.colorSpace = THREE.SRGBColorSpace;
        texPBack.wrapS = THREE.RepeatWrapping;
        texPBack.wrapT = THREE.RepeatWrapping;
        texPBack.repeat.set(-1, 1);
        texPBack.offset.set(1, 0);
        texPBack.needsUpdate = true;
      }
    );

    const texN = loader.load(
      '/assets/.aistudio/1d7f82039c76229657edbb9a595258904770fdf1_normal.png',
      () => {
        texN.wrapS = THREE.RepeatWrapping;
        texN.wrapT = THREE.RepeatWrapping;
        texN.needsUpdate = true;
      },
      undefined,
      () => {
        // Fallback to null normal
      }
    );

    return { texPackOverlay: texP, texPackOverlayBack: texPBack, texPackNormal: texN };
  }, []);

  const startAutoSlice = () => {
    if (isSlicingAuto.current) return;
    isSlicingAuto.current = true;
    
    // Choose automated swipe directions dynamically
    const direction = Math.random() > 0.5 ? 'rtl' : 'ltr';
    sliceDirectionRef.current = direction;
    setSliceDirection(direction);
    setSliceActive(true);
    
    const obj = { p: 0.0 };
    gsap.to(obj, {
      p: 1.0,
      duration: 0.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        setSliceProgress(obj.p);
      },
      onComplete: () => {
        setPhase('opening');
        isSlicingAuto.current = false;
        setSliceActive(false);
      }
    });
  };

  const updateSliceFromPointer = (e: any) => {
    if (!packRef.current) return;
    // Map intersection point X relative to package width (scaled 1.15)
    const localX = e.point.x;
    const halfWidth = 1.35 * 1.15;
    
    let p = 0;
    if (sliceDirectionRef.current === 'rtl') {
      p = THREE.MathUtils.clamp((halfWidth - localX) / (halfWidth * 2), 0, 1);
    } else {
      p = THREE.MathUtils.clamp((localX + halfWidth) / (halfWidth * 2), 0, 1);
    }
    setSliceProgress(p);
  };

  const handlePointerDown = (e: any) => {
    if (phase !== 'ready') return;
    e.stopPropagation();
    isDragging.current = true;
    setSliceActive(true);
    
    // Determine pointer swipe direction based on initial touch coordinates
    const localX = e.point.x;
    const dir = localX > 0 ? 'rtl' : 'ltr';
    sliceDirectionRef.current = dir;
    setSliceDirection(dir);
    
    updateSliceFromPointer(e);
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging.current || phase !== 'ready') return;
    e.stopPropagation();
    updateSliceFromPointer(e);
  };

  const handlePointerUp = (e: any) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    e.stopPropagation();
    if (sliceProgressRef.current > 0.85) {
      // Completed drag! Slicing completes
      setPhase('opening');
      setSliceActive(false);
    } else {
      // Not dragged far enough, reset elegantly
      const startP = sliceProgressRef.current;
      const obj = { p: startP };
      gsap.to(obj, {
        p: 0.0,
        duration: 0.25,
        ease: 'power2.out',
        onUpdate: () => setSliceProgress(obj.p),
        onComplete: () => setSliceActive(false)
      });
    }
  };

  useEffect(() => {
    if (!packRef.current || !cardGroupRef.current) return;

    if (phase === 'carousel' && carouselRef.current) {
        const tl = gsap.timeline({ onComplete: () => setPhase('ready') });
        
        // Circular carousel setup
        carouselRef.current.position.set(0, 0, -25); 
        carouselRef.current.rotation.set(0, Math.PI * 4, 0); // 2 spins
        
        if (dummyGroupRef.current) {
            dummyGroupRef.current.position.set(0, 0, 0);
            dummyGroupRef.current.scale.set(1, 1, 1);
            dummyGroupRef.current.visible = true;
        }

        // Reset all elements for a fresh run
        if (packRef.current) {
            packRef.current.position.set(0, 0, 5);
            packRef.current.scale.set(1, 1, 1);
        }
        if (packTopRef.current) {
            packTopRef.current.position.set(0, 0, 0);
            packTopRef.current.rotation.set(0, 0, 0);
            packTopRef.current.scale.set(1, 1, 1);
        }
        if (packBottomRef.current) {
            packBottomRef.current.position.set(0, 0, 0);
            packBottomRef.current.rotation.set(0, 0, 0);
            packBottomRef.current.scale.set(1, 1, 1);
        }
        if (cardGroupRef.current) {
            cardGroupRef.current.position.set(0, -6, -0.8);
            cardGroupRef.current.rotation.set(0, Math.PI, 0);
            cardGroupRef.current.scale.set(1, 1, 1);
        }
        if (pedestalRef.current) {
            pedestalRef.current.position.set(0, -6.5, 2.0);
            pedestalRef.current.rotation.set(0, 0, 0);
            pedestalRef.current.scale.set(0, 0, 0);
        }
        if (bgGlowMeshRef.current) {
            bgGlowMeshRef.current.scale.set(0, 0, 0);
        }
        if (bgGlowRef.current) {
            bgGlowRef.current.color.setRGB(0, 0, 0);
        }
        if (frontMatRef.current) {
            frontMatRef.current.uProgress = 0.0;
        }
        setSliceProgress(0);
        setSliceActive(false);
        setSliceLaserOpacity(1.0);
        setTopOpacity(1.0);
        setBottomOpacity(1.0);

        // 1. Move and spin carousel into view
        tl.to(carouselRef.current.position, { 
            y: 0,
            z: -2, 
            duration: 2.0, 
            ease: 'power3.out' 
        }, 0)
        .to(carouselRef.current.rotation, { 
            y: 0,
            duration: 2.0, 
            ease: 'power2.out' 
        }, 0);

        // 2. Main pack breaks away and scales up
        tl.to(packRef.current.position, { 
            z: 2.0, 
            y: 0,
            duration: 1.5, 
            ease: 'back.out(1.2)' 
        }, 2.0)
        .to(packRef.current.scale, { 
            x: 1.15, y: 1.15, z: 1.15, 
            duration: 1.5, 
            ease: 'back.out(1.2)' 
        }, 2.0);

        // Background dummy group fades (scales down and moves back)
        if (dummyGroupRef.current) {
            tl.to(dummyGroupRef.current.position, {
                z: -10,
                duration: 1.2,
                decay: true,
                ease: 'power2.inOut'
            }, 2.0)
            .to(dummyGroupRef.current.scale, {
                x: 0, y: 0, z: 0,
                duration: 1.2,
                ease: 'power2.inOut'
            }, 2.0);
        }
    }

    if (phase === 'opening') {
        const tl = gsap.timeline({ onComplete: () => setPhase('flipping') });

        if (dummyGroupRef.current) {
            dummyGroupRef.current.visible = false;
        }

        // Force slice progress to 100% on animation start
        setSliceProgress(1.0);

        // Turn off slice line when packet splits (never animating opacity)
        tl.to({}, {
            duration: 0.4,
            onComplete: () => {
                setSliceActive(false);
            }
        }, 0);

        // 1. Pack halves split and slide away
        if (packTopRef.current && packBottomRef.current) {
            // Sliced top crimped cap flies up vertically, tilts, and shrinks to disappear
            tl.to(packTopRef.current.position, { 
                y: 4.2, 
                z: 0.0,
                x: sliceDirectionRef.current === 'rtl' ? 0.8 : -0.8,
                duration: 1.4, 
                ease: 'power2.out' 
            }, 0)
            .to(packTopRef.current.rotation, {
                x: -1.2,
                y: sliceDirectionRef.current === 'rtl' ? -0.6 : 0.6,
                z: sliceDirectionRef.current === 'rtl' ? -0.4 : 0.4,
                duration: 1.4,
                ease: 'power2.out'
            }, 0)
            .to(packTopRef.current.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.8,
                ease: 'power2.in'
            }, 0.6);

            // Sliced bottom package sliver goes slowly down completely off-screen and fades away perfectly
            tl.to(packBottomRef.current.position, { 
                y: -6.0, 
                z: 0.0,
                x: 0,
                duration: 2.2, 
                ease: 'power2.inOut' 
            }, 0);
        }

        // 2. Real Card pops up vertically out from inside the bottom package pocket (positioned behind the pack at z: -0.8)
        tl.fromTo(cardGroupRef.current.position, 
            { x: 0, y: -0.4, z: -0.8 }, 
            { x: 0, y: 0.42, z: -0.8, duration: 1.6, ease: 'back.out(1.1)' }, 0.15
        );

        tl.fromTo(cardGroupRef.current.scale, 
            { x: 0.48, y: 0.48, z: 0.52 }, 
            { x: 0.58, y: 0.58, z: 0.58, duration: 1.6, ease: 'back.out(1.1)' }, "<"
        );
    }

    if (phase === 'flipping') {
        const tl = gsap.timeline();
        
        // Keep the card smaller by retaining an elegant z-depth and size scale
        tl.to(cardGroupRef.current.position, { z: 2.0, y: 0.42, duration: 1.4, ease: 'power3.out' }, 0);
        tl.to(cardGroupRef.current.scale, { x: 0.58, y: 0.58, z: 0.58, duration: 1.4, ease: 'power3.out' }, 0);
        
        // 1. Spin back to front dynamically
        tl.to(cardGroupRef.current.rotation, {
            y: Math.PI * 2, 
            duration: 1.4, 
            ease: 'power3.inOut' 
        }, 0); 

        // Upward Elegant Rise for Pedestal Base synchronously for elegant presentation
        if (pedestalRef.current) {
            tl.fromTo(pedestalRef.current.position,
                { x: 0, y: -6.5, z: 2.0 },
                { x: 0, y: -1.72, z: 2.0, duration: 1.5, ease: 'back.out(0.6)' },
                0
            );
            tl.fromTo(pedestalRef.current.scale,
                { x: 0.1, y: 0.1, z: 0.1 },
                { x: 0.58, y: 0.58, z: 0.58, duration: 1.5, ease: 'back.out(0.6)' },
                0
            );
        }

        // 2. Aura/Halo effect removed to provide zero obstruction and clean card presentation
        if (bgGlowMeshRef.current && bgGlowRef.current) {
           // Disabled to maintain pristine, distraction-free aesthetic
        }

        // 3. Dissolve Reveal: Disposes the top geometric layer, then reveals real card
        // We trigger this right as the 1.4s spin comes around the front (starting around 1.1s),
        // giving the impression that the mask dissolves right in front of the viewer's eyes
        tl.to(frontMatRef.current, {
           uProgress: 1.0,
           duration: 1.8,
           ease: 'power1.inOut',
           onComplete: () => setPhase('revealed')
        }, 1.1);
    }
  }, [phase, setPhase]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (backMatRef.current) backMatRef.current.uTime = time;
    if (frontMatRef.current) frontMatRef.current.uTime = time;

    // Added floating interactive effect for card
    if (cardGroupRef.current && (phase === 'opening' || phase === 'revealed')) {
       // Flat, elegant presentation without active rotation or tilt
       if (phase === 'revealed') {
           cardGroupRef.current.rotation.x = THREE.MathUtils.lerp(cardGroupRef.current.rotation.x, 0, 0.08);
           cardGroupRef.current.rotation.y = THREE.MathUtils.lerp(cardGroupRef.current.rotation.y, Math.PI * 2, 0.08);
       }
    }
    
    // Pack floating
    if (packRef.current && (phase === 'idle' || phase === 'ready')) {
       packRef.current.position.y = 0;
    }
  });

  return (
    <>
      <group ref={carouselRef} visible={phase !== 'idle' && phase !== 'loading'} position={[0, 0, 0]}>
         {/* Carousel Items */}
         <group ref={dummyGroupRef}>
           {[-3, -2, -1, 1, 2, 3, 4].map(i => {
             const angle = (i * Math.PI * 2) / 8;
             const radius = 5;
             return (
               <group key={i} position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]} rotation={[0, angle, 0]} scale={[0.8, 0.8, 0.8]}>
                  <PackModel texPackOverlay={texPackOverlay} texPackOverlayBack={texPackOverlayBack} texPackNormal={texPackNormal} color="#151515" opacity={0.4} />
               </group>
             );
           })}
         </group>

         {/* Main Pack */}
         <group ref={packRef} position={[0, 0, 5]}>
           {/* Seamless continuous pack model shown during non-splitting phases */}
           <group visible={phase !== 'opening' && phase !== 'waiting_flip' && phase !== 'flipping' && phase !== 'revealed'}>
             <PackModel texPackOverlay={texPackOverlay} texPackOverlayBack={texPackOverlayBack} texPackNormal={texPackNormal} color="#040404" opacity={1.0} />
           </group>

           {/* Split pack halves shown when opening splits are animated */}
           <group visible={phase === 'opening' || phase === 'waiting_flip' || phase === 'flipping' || phase === 'revealed'}>
             <group ref={packTopRef}>
               <PackHalfModel texPackOverlay={texPackOverlay} texPackOverlayBack={texPackOverlayBack} texPackNormal={texPackNormal} isTop={true} color="#040404" opacity={topOpacity} />
             </group>
             <group ref={packBottomRef}>
               <PackHalfModel texPackOverlay={texPackOverlay} texPackOverlayBack={texPackOverlayBack} texPackNormal={texPackNormal} isTop={false} color="#040404" opacity={bottomOpacity} />
             </group>
           </group>
           
           {/* Custom golden high-intensity slice drawing curve */}
           <SliceGlowLine progress={sliceProgress} active={sliceActive} direction={sliceDirection} opacity={sliceLaserOpacity} />

           {/* Interactive sparks emitted from drag tip */}
           {sliceActive && (
              <group position={[sliceDirection === 'rtl' ? 1.35 - sliceProgress * 2.7 : -1.35 + sliceProgress * 2.7, 1.1, 0.08]}>

              </group>
           )}
         </group>
      </group>

      {/* Slicing Swipe Detonators & screen click general targets */}
      {phase === 'ready' && (
        <group>
          {/* Active pointer swipe tracking bar positioned horizontally inside scene */}
          <mesh
            position={[0, 1.1, 2.15]}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerOver={() => { document.body.style.cursor = 'ew-resize'; }}
            onPointerOut={() => { isDragging.current = false; document.body.style.cursor = 'default'; }}
          >
            <planeGeometry args={[3.2, 0.8]} />
            <meshBasicMaterial visible={false} />
          </mesh>

          {/* Full Screen container background to capture instant click-to-slice auto transition */}
          <mesh 
             position={[0, 0, 1.5]} 
             onPointerDown={(e) => {
                if (!isDragging.current && !isSlicingAuto.current) {
                  startAutoSlice();
                }
             }}
          >
             <planeGeometry args={[100, 100]} />
             <meshBasicMaterial visible={false} />
          </mesh>
        </group>
      )}

      {/* Screen Tap indicator after pocket slice completes */}
      {phase === 'waiting_flip' && (
         <mesh 
            position={[0, 0, 5]} 
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'default'}
            onPointerDown={() => {
                document.body.style.cursor = 'default';
                setPhase('flipping');
            }}
         >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial visible={false} />
         </mesh>
      )}

      <group ref={cardGroupRef} position={[0, -6, -0.8]} rotation={[0, Math.PI, 0]}>
        {/* Graded Slab Acrylic Outer Case Protective Capsule Shield */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.68, 4.18, 0.075]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            roughness={0.03}
            metalness={0.05}
            transmission={0.93}
            thickness={0.4}
            transparent={true}
            opacity={0.35}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            envMapIntensity={2.5}
          />
        </mesh>
        
        {/* Inner Card & Label sheet Front Plane */}
        <mesh position={[0, 0, 0.039]}>
          <planeGeometry args={[2.56, 4.06, 16, 16]} />
          <dissolveFrontMaterial ref={frontMatRef} uCardTex={texCard} uMaskTex={texMask} transparent />
        </mesh>
        
        {/* Card & Label Back Plane */}
        <mesh position={[0, 0, -0.039]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.56, 4.06, 16, 16]} />
          <pulsingBackMaterial ref={backMatRef} uBackTex={texBack} />
        </mesh>

        {/* Phase 5 Background Halo (Removed to fully show clean card borders) */}
        <mesh ref={bgGlowMeshRef} position={[0, 0, -0.1]} scale={[0, 0, 0]} visible={false}>
          <planeGeometry args={[2.8, 4.3]} />
          <meshBasicMaterial ref={bgGlowRef} color="#000" transparent opacity={0.0} visible={false} />
        </mesh>
      </group>

      {/* Stylized Cylindrical Stand/Pedestal coming from abajo to arriba */}
      <group ref={pedestalRef} position={[0, -6.5, 2.0]} scale={[0, 0, 0]}>
        {/* Bottom Base Pillar */}
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[2.1, 2.15, 0.44, 64]} />
          <meshPhysicalMaterial 
            color="#121214"
            roughness={0.4}
            metalness={0.65}
            clearcoat={0.3}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Mid-Tier Collar */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[1.9, 1.95, 0.16, 64]} />
          <meshPhysicalMaterial 
            color="#1c1c1e"
            roughness={0.35}
            metalness={0.7}
            clearcoat={0.4}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Recessed Top Center Core */}
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[1.75, 1.75, 0.04, 64]} />
          <meshPhysicalMaterial 
            color="#080809"
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* Dynamic Unified Particles Engine */}
      <StarfieldAndFireworks 
        phase={phase} 
        sliceActive={sliceActive} 
        sliceProgress={sliceProgress} 
        sliceDirection={sliceDirection}
        cardGroupRef={cardGroupRef}
      />
    </>
  );
};

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000000',
    position: 'relative' as const,
    overflow: 'hidden',
    fontFamily: 'Inter, sans-serif'
  },
  header: {
    position: 'absolute' as const,
    top: '10%',
    width: '100%',
    textAlign: 'center' as const,
    zIndex: 10
  },
  title: {
    fontFamily: '"Bebas Neue", sans-serif',
    color: 'white',
    fontSize: '56px',
    letterSpacing: '4px',
    lineHeight: '1.1',
    margin: 0
  },
  subtitle: {
    fontFamily: '"Victor Mono", monospace',
    color: '#4ade80', // Premium green accent
    marginTop: '12px',
    fontSize: '13px',
    letterSpacing: '3px'
  },
  buttonContainer: {
    position: 'absolute' as const,
    bottom: '15%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 10
  },
  button: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '357px',
    height: '64px',
    paddingTop: '12px',
    paddingRight: '29px',
    paddingBottom: '12px',
    paddingLeft: '29px',
    gap: '10px',
    backgroundColor: 'rgba(30, 203, 24, 1)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '100px',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '26px',
    letterSpacing: '2px',
    cursor: 'pointer',
    boxShadow: 'inset 0 -6px 14px rgba(255, 255, 255, 0.45), inset 0 -6px 44px rgba(255, 255, 255, 0.85), 0 12px 30px rgba(30, 203, 24, 0.4)',
    transition: 'transform 0.2s, background-color 0.2s',
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid #111',
    borderTop: '4px solid #22c55e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
    marginTop: '20px'
  },
  actionTextContainer: {
    position: 'absolute',
    bottom: '8vh',
    width: '100vw',
    textAlign: 'center',
    zIndex: 10,
    pointerEvents: 'none'
  },
  actionText: {
    color: '#ffffff',
    fontFamily: '"Victor Mono", monospace',
    fontSize: '14px',
    letterSpacing: '4px',
    textTransform: 'uppercase' as const,
    opacity: 0.8,
    margin: 0,
  }
};

export const CardRevealApp = () => {
  const [phase, setPhase] = useState('idle');

  const handleBuy = () => {
      setPhase('loading');
      setTimeout(() => {
          setPhase('carousel');
      }, 1500); // Wait 1.5s then show carousel animation
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { transform: scale(0.95); }
            50% { transform: scale(1.05); }
            100% { transform: scale(0.95); }
          }
        `}
      </style>
      <div style={styles.header}>
        {phase === 'loading' && <div style={styles.loader} />}
      </div>

      <Canvas style={{ width: '100%', height: '100%' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={50} />
        {/* Environment mapping is essential for realistic foil/metalness reflection */}
        <Environment preset="city" />
        <ambientLight intensity={1.1} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, 5, 5]} intensity={1.0} />
        <directionalLight position={[0, -10, 2]} intensity={0.6} />
        {/* Dedicated Backlights pointing towards -Z to keep the back face of the booster packs fully bright and beautiful */}
        <directionalLight position={[0, 8, -8]} intensity={2.0} />
        <directionalLight position={[5, -5, -8]} intensity={1.5} />
        <directionalLight position={[-5, 5, -8]} intensity={1.5} />
        
        <CardSet phase={phase} setPhase={setPhase} />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.4} />
        </EffectComposer>
      </Canvas>

      {phase === 'idle' && (
        <div style={styles.buttonContainer}>
          <button 
            onClick={handleBuy}
            style={styles.button}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Buy for $50
          </button>
        </div>
      )}

      {(phase === 'ready' || phase === 'waiting_flip') && (
        <div style={styles.actionTextContainer as React.CSSProperties}>
          {phase === 'ready' ? (
             <p style={{...(styles.actionText as React.CSSProperties), animation: 'pulse 2s infinite'}}>
               Tap to open
             </p>
          ) : (
             <p style={{...(styles.actionText as React.CSSProperties), animation: 'pulse 2s infinite'}}>
               Tap to continue
             </p>
          )}
        </div>
      )}

    </div>
  );
};

