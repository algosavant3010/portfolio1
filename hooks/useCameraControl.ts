// hooks/useCameraControl.ts — Custom camera tracking for proximity-based features
'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useCallback } from 'react';
import * as THREE from 'three';

/**
 * Track camera distance to skill nodes for music reactivity and proactive suggestions.
 */
export function useCameraProximity(
  nodePositions: Record<string, [number, number, number]>,
  onProximityChange?: (nodeId: string, distance: number) => void
) {
  const closestRef = useRef<{ id: string; distance: number }>({ id: '', distance: Infinity });

  useFrame(({ camera }) => {
    let minDist = Infinity;
    let closestId = '';

    for (const [id, pos] of Object.entries(nodePositions)) {
      const dist = camera.position.distanceTo(new THREE.Vector3(...pos));
      if (dist < minDist) {
        minDist = dist;
        closestId = id;
      }
    }

    if (closestId !== closestRef.current.id || Math.abs(minDist - closestRef.current.distance) > 0.5) {
      closestRef.current = { id: closestId, distance: minDist };
      onProximityChange?.(closestId, minDist);
    }
  });

  return closestRef;
}
