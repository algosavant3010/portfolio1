// components/DynamicSky.tsx — Time-of-day responsive sky shader
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSkyColors } from '@/lib/timeUtils';

const SKY_VERTEX = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAGMENT = `
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform vec3 uSunColor;
uniform float uTime;

varying vec3 vWorldPosition;

void main() {
  float h = normalize(vWorldPosition).y;

  // Gradient from bottom to top
  vec3 color = mix(uBottomColor, uTopColor, max(h, 0.0));

  // Sun glow near horizon
  float sunGlow = pow(max(0.0, 1.0 - abs(h - 0.1) * 3.0), 3.0);
  color += uSunColor * sunGlow * 0.3;

  // Subtle animated stars
  float stars = step(0.998, fract(sin(dot(vWorldPosition.xz * 100.0, vec2(12.9898, 78.233))) * 43758.5453));
  float twinkle = sin(uTime * 2.0 + vWorldPosition.x * 10.0) * 0.5 + 0.5;
  color += vec3(stars * twinkle * max(0.0, h) * 0.8);

  gl_FragColor = vec4(color, 1.0);
}
`;

export function DynamicSky() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const [topColor, bottomColor, sunColor] = getSkyColors();

  const uniforms = useMemo(
    () => ({
      uTopColor: { value: new THREE.Color(topColor) },
      uBottomColor: { value: new THREE.Color(bottomColor) },
      uSunColor: { value: new THREE.Color(sunColor) },
      uTime: { value: 0 },
    }),
    [topColor, bottomColor, sunColor]
  );

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[45, 32, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={SKY_VERTEX}
        fragmentShader={SKY_FRAGMENT}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
