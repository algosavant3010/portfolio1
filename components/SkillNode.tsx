// components/SkillNode.tsx — Individual skill/project node in the 3D scene
'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Html, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export interface SkillNodeData {
  id: string;
  label: string;
  color: string;
}

export const SKILL_NODES: SkillNodeData[] = [
  { id: 'react', label: 'React/Next.js', color: '#61dafb' },
  { id: 'backend', label: 'Node.js/Express', color: '#68a063' },
  { id: 'ai', label: 'AI/LLM APIs', color: '#a855f7' },
  { id: 'databases', label: 'Databases', color: '#336791' },
  { id: 'tools', label: 'Git/Vercel', color: '#22c55e' },
  { id: 'nyayaflow', label: 'Nyaya-Flow', color: '#00f0ff' },
  { id: 'spendify', label: 'Spendify', color: '#ff6b35' },
  { id: 'languages', label: 'JS/TS/Python/C++', color: '#eab308' },
  { id: 'frontend', label: 'Tailwind/Framer', color: '#06b6d4' },
  { id: 'portfolio', label: 'This Portfolio', color: '#8b5cf6' },
];

interface SkillNodeProps {
  id: string;
  label: string;
  color: string;
  position: [number, number, number];
  onHover?: (id: string | null) => void;
}

export function SkillNode({ id, label, color, position, onHover }: SkillNodeProps) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  // Physics body — gentle bobbing effect
  const [ref, api] = useSphere(() => ({
    mass: 0.1,
    position,
    args: [0.5],
    linearDamping: 0.95,
    angularDamping: 0.95,
    fixedRotation: true,
  }));

  // Gentle float animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      const offset = id.charCodeAt(0) * 0.1; // Unique per node
      groupRef.current.position.y = Math.sin(t * 0.5 + offset) * 0.15;
    }

    if (glowRef.current) {
      const scale = hovered ? 1.8 + Math.sin(clock.getElapsedTime() * 3) * 0.2 : 1.3;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={ref as any}>
      <group ref={groupRef}>
        {/* Glow sphere */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={hovered ? 0.25 : 0.1} />
        </mesh>

        {/* Main node sphere */}
        <Sphere
          args={[0.4, 32, 32]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover?.(id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover?.(null);
            document.body.style.cursor = 'default';
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Apply a small impulse on click
            api.applyImpulse([0, 2, 0], [0, 0, 0]);
          }}
        >
          <MeshDistortMaterial
            color={color}
            roughness={0.2}
            metalness={0.8}
            distort={hovered ? 0.4 : 0.15}
            speed={2}
            envMapIntensity={1}
          />
        </Sphere>

        {/* Label */}
        {hovered && (
          <Html
            center
            distanceFactor={8}
            position={[0, 0.9, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div className="glass px-3 py-1.5 rounded-lg whitespace-nowrap">
              <p className="text-xs font-mono text-white/90">{label}</p>
            </div>
          </Html>
        )}

        {/* Small orbiting particle */}
        <mesh position={[0.6, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}
