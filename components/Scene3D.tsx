// components/Scene3D.tsx — The immersive 3D Mindscape scene
'use client';

import { Suspense, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Stars,
  Float,
  Text3D,
  Center,
  MeshTransmissionMaterial,
  Environment,
  Html,
} from '@react-three/drei';
import { Physics, useSphere } from '@react-three/cannon';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store';
import { getSkyColors, getTimeOfDay } from '@/lib/timeUtils';
import { getProactiveSuggestion } from '@/lib/knowledgeBase';
import { getMusicEngine } from '@/lib/musicEngine';
import { SkillNode, SKILL_NODES } from './SkillNode';
import { DynamicSky } from './DynamicSky';

// Node positions for the floating island layout
export const NODE_POSITIONS: Record<string, [number, number, number]> = {
  react: [0, 1, 0],
  backend: [3, 2, -1],
  ai: [-3, 1.5, -1],
  databases: [2, 0.5, 3],
  tools: [-2, 0.8, 3],
  nyayaflow: [4, 3, -3],
  spendify: [-4, 2.5, -3],
  languages: [0, 3.5, -4],
  frontend: [5, 1, 1],
  portfolio: [-5, 1.5, 1],
};

/**
 * Floating island base geometry.
 */
function IslandBase() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2 - 2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -2, 0]}>
      <dodecahedronGeometry args={[6, 1]} />
      <meshStandardMaterial
        color="#111133"
        roughness={0.8}
        metalness={0.2}
        wireframe={false}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/**
 * Connection lines between skill nodes.
 */
function NodeConnections() {
  const connections = useMemo(() => {
    const pairs: [string, string][] = [
      ['react', 'backend'],
      ['react', 'ai'],
      ['react', 'nyayaflow'],
      ['backend', 'databases'],
      ['backend', 'spendify'],
      ['ai', 'nyayaflow'],
      ['ai', 'portfolio'],
      ['databases', 'spendify'],
      ['databases', 'tools'],
      ['tools', 'frontend'],
      ['languages', 'react'],
      ['languages', 'backend'],
      ['frontend', 'nyayaflow'],
      ['frontend', 'portfolio'],
    ];
    return pairs;
  }, []);

  return (
    <group>
      {connections.map(([from, to]) => {
        const start = NODE_POSITIONS[from];
        const end = NODE_POSITIONS[to];
        if (!start || !end) return null;

        const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={`${from}-${to}`} geometry={geometry}>
            <lineBasicMaterial color="#00f0ff" transparent opacity={0.15} linewidth={1} />
          </line>
        );
      })}
    </group>
  );
}

/**
 * Ambient particles floating around the island.
 */
function AmbientParticles() {
  const count = 200;
  const meshRef = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 10 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.01;
      const posAttr = meshRef.current.geometry.getAttribute('position');
      for (let i = 0; i < count; i++) {
        const y = posAttr.getY(i);
        posAttr.setY(i, y + Math.sin(clock.getElapsedTime() + i) * 0.002);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#00f0ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/**
 * Proximity tracker — updates music engine based on camera position.
 */
function ProximityTracker() {
  const { setHoveredNode, setHoverStartTime, setProactiveSuggestion } = useAppStore();

  useFrame(({ camera, raycaster, scene }) => {
    const musicEngine = getMusicEngine();
    let minDist = Infinity;

    for (const [, pos] of Object.entries(NODE_POSITIONS)) {
      const dist = camera.position.distanceTo(new THREE.Vector3(...pos));
      if (dist < minDist) minDist = dist;
    }

    musicEngine.setProximity(minDist);
  });

  return null;
}

/**
 * Name title floating above the scene.
 */
function SceneTitle() {
  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <Center position={[0, 6, -3]}>
        <mesh>
          <planeGeometry args={[8, 1.5]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        <Html center transform distanceFactor={10}>
          <div className="text-center pointer-events-none select-none">
            <h1 className="text-4xl font-bold text-white/90 tracking-wider" style={{ textShadow: '0 0 20px rgba(0,240,255,0.5)' }}>
              NAMAN AGARWAL
            </h1>
            <p className="text-sm text-cyan-300/70 mt-1 tracking-[0.3em]">
              SOFTWARE DEVELOPER
            </p>
          </div>
        </Html>
      </Center>
    </Float>
  );
}

/**
 * Main Scene3D component — the complete Mindscape.
 */
export default function Scene3D() {
  const handleNodeHover = useCallback(
    (nodeId: string | null) => {
      const store = useAppStore.getState();
      if (nodeId) {
        store.setHoveredNode(nodeId);
        store.setHoverStartTime(Date.now());

        // Proactive suggestion after 3 seconds
        setTimeout(() => {
          const current = useAppStore.getState();
          if (current.hoveredNode === nodeId && Date.now() - current.hoverStartTime >= 2900) {
            const suggestion = getProactiveSuggestion(nodeId);
            if (suggestion) store.setProactiveSuggestion(suggestion);
          }
        }, 3000);
      } else {
        store.setHoveredNode(null);
      }
    },
    []
  );

  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [0, 3, 12], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
          <pointLight position={[0, 5, 0]} intensity={1} color="#00f0ff" distance={20} />

          {/* Dynamic sky */}
          <DynamicSky />
          <Stars radius={50} depth={50} count={2000} factor={3} saturation={0.5} speed={0.5} />

          {/* Environment for reflections */}
          <Environment preset="night" />

          {/* Physics world */}
          <Physics gravity={[0, -0.5, 0]} iterations={5}>
            {/* Skill nodes */}
            {SKILL_NODES.map((node) => (
              <SkillNode
                key={node.id}
                id={node.id}
                label={node.label}
                color={node.color}
                position={NODE_POSITIONS[node.id]}
                onHover={handleNodeHover}
              />
            ))}
          </Physics>

          {/* Island base */}
          <IslandBase />

          {/* Connections */}
          <NodeConnections />

          {/* Particles */}
          <AmbientParticles />

          {/* Title */}
          <SceneTitle />

          {/* Proximity tracker for music */}
          <ProximityTracker />

          {/* Camera controls */}
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 6}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
