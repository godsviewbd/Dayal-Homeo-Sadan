// src/components/layout/SplashScreenWebGL.tsx
'use client';

import * as THREE from 'three';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
// Points and PointMaterial are still useful from Drei for easy setup
import { Points, PointMaterial } from '@react-three/drei';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onSkip?: () => void;
}

const PARTICLE_COUNT = 150; // Increased slightly for more visual density
const PARTICLE_SPREAD_RADIUS = 5;
const EMERGENCE_DURATION = 0.75; // seconds
const COLOR_TRANSITION_START_TIME = 0.25; // seconds, after emergence starts
const COLOR_TRANSITION_DURATION = 1.0; // seconds

// Component for the particle system
function ParticleSystem() {
  const pointsRef = useRef<THREE.Points>(null!);

  const particleData = useMemo(() => {
    const data = [];
    const coolColors = [
      new THREE.Color(0x6a0dad), // Purple
      new THREE.Color(0x4169e1), // Royal Blue
      new THREE.Color(0x00008b), // Dark Blue
      new THREE.Color(0x8a2be2), // Blue Violet
    ];
    const warmColors = [
      new THREE.Color(0x2d5a3d), // Deep forest green
      new THREE.Color(0x40e0d0), // Turquoise healing
      new THREE.Color(0xffd700), // Golden energy
      new THREE.Color(0x3cb371), // MediumSeaGreen
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      data.push({
        initialPosition: new THREE.Vector3(
          (Math.random() - 0.5) * PARTICLE_SPREAD_RADIUS * 2,
          (Math.random() - 0.5) * PARTICLE_SPREAD_RADIUS * 1.5, // Slightly less Y spread initially
          (Math.random() - 0.5) * PARTICLE_SPREAD_RADIUS * 2
        ),
        swirlRadius: Math.random() * 0.2 + 0.05,
        swirlSpeed: Math.random() * 0.5 + 0.2,
        swirlPhase: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.001 + 0.0005,
        initialColor: coolColors[Math.floor(Math.random() * coolColors.length)].clone(),
        targetColor: warmColors[Math.floor(Math.random() * warmColors.length)].clone(),
      });
    }
    return data;
  }, []);

  // These Float32Arrays will be attributes of the Points geometry
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    particleData.forEach((p, i) => {
      arr[i * 3] = p.initialPosition.x;
      arr[i * 3 + 1] = p.initialPosition.y;
      arr[i * 3 + 2] = p.initialPosition.z;
    });
    return arr;
  }, [particleData]);

  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    particleData.forEach((p, i) => {
      arr[i * 3] = p.initialColor.r;
      arr[i * 3 + 1] = p.initialColor.g;
      arr[i * 3 + 2] = p.initialColor.b;
    });
    return arr;
  }, [particleData]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !pointsRef.current.geometry) return;

    const elapsedTime = clock.getElapsedTime();
    const positionAttribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttribute = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;

    // Global Emergence Animation
    const emergenceFactor = Math.min(1, elapsedTime / EMERGENCE_DURATION);
    if (pointsRef.current.material instanceof THREE.Material) { // Type guard for opacity
        pointsRef.current.material.opacity = emergenceFactor;
    }
    pointsRef.current.scale.set(emergenceFactor, emergenceFactor, emergenceFactor);


    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const data = particleData[i];
      const i3 = i * 3;

      // Motion
      const angle = data.swirlPhase + elapsedTime * data.swirlSpeed;
      const swirlX = Math.cos(angle) * data.swirlRadius;
      const swirlZ = Math.sin(angle) * data.swirlRadius;
      
      positionAttribute.array[i3] = data.initialPosition.x + swirlX;
      positionAttribute.array[i3 + 1] = data.initialPosition.y + elapsedTime * data.driftSpeed * 30; // Y drift
      positionAttribute.array[i3 + 2] = data.initialPosition.z + swirlZ;

      // Reset Y position if particle drifts too far up
      if (positionAttribute.array[i3 + 1] > PARTICLE_SPREAD_RADIUS * 0.8) {
        positionAttribute.array[i3 + 1] = -PARTICLE_SPREAD_RADIUS * 0.8;
        // Optionally reset X and Z to maintain some spread, or let them continue from new Y
        data.initialPosition.y = -PARTICLE_SPREAD_RADIUS * 0.8; // update base for next frame's calculation
      }

      // Color Transition
      if (elapsedTime >= COLOR_TRANSITION_START_TIME) {
        const colorProgress = Math.min(1, (elapsedTime - COLOR_TRANSITION_START_TIME) / COLOR_TRANSITION_DURATION);
        const currentColor = new THREE.Color().lerpColors(data.initialColor, data.targetColor, colorProgress);
        colorAttribute.array[i3] = currentColor.r;
        colorAttribute.array[i3 + 1] = currentColor.g;
        colorAttribute.array[i3 + 2] = currentColor.b;
      }
    }

    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;

    // Rotate the whole system slightly
    pointsRef.current.rotation.y = elapsedTime * 0.03;
    pointsRef.current.rotation.x = elapsedTime * 0.015;
  });

  return (
    <Points ref={pointsRef} limit={PARTICLE_COUNT} frustumCulled={false}>
      <PointMaterial
        vertexColors // Use the colors from the geometry attribute
        size={0.06} // Slightly larger particles
        sizeAttenuation={true}
        depthWrite={false}
        transparent // Opacity will be controlled by material.opacity
        opacity={0} // Start transparent, useFrame will animate it
      />
      {/* Initialize geometry with position and color attributes */}
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          itemSize={3}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
    </Points>
  );
}

// This remains the main exported component
export function SimpleSplashScreen({ onSkip }: SplashScreenProps) {
  return (
    <div
      role="status"
      aria-label="দয়াল হোমিও সদন is starting, please wait"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden",
        "bg-gradient-to-b from-[#1A1D2A] to-[#11131E]",
        "cursor-pointer"
      )}
      onClick={onSkip}
    >
      <Canvas>
        {/* Using PerspectiveCamera from drei is fine if no specific customization needed now */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 5, 2]} intensity={0.8} />
        <ParticleSystem />
      </Canvas>
      
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
         <p
          className={cn(
            "px-4 text-xs",
            "text-teal-400/70",
            "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:1s]" 
          )}
        >
          Tap to continue
        </p>
         <p
          className={cn(
            "mt-1 px-4 text-xs",
            "text-teal-400/50",
            "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:0.7s]" 
          )}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
