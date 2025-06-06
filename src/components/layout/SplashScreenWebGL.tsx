// src/components/layout/SplashScreenWebGL.tsx
'use client';

import * as THREE from 'three';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
// Points and PointMaterial are still useful from Drei for easy setup
import { Points, PointMaterial } from '@react-three/drei';
import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react'; // Import Leaf icon

interface SplashScreenProps {
  onSkip?: () => void;
}

const PARTICLE_COUNT = 150;
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
          (Math.random() - 0.5) * PARTICLE_SPREAD_RADIUS * 1.5,
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

    const emergenceFactor = Math.min(1, elapsedTime / EMERGENCE_DURATION);
    if (pointsRef.current.material instanceof THREE.Material) {
      pointsRef.current.material.opacity = emergenceFactor;
    }
    pointsRef.current.scale.set(emergenceFactor, emergenceFactor, emergenceFactor);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const data = particleData[i];
      const i3 = i * 3;

      const angle = data.swirlPhase + elapsedTime * data.swirlSpeed;
      const swirlX = Math.cos(angle) * data.swirlRadius;
      const swirlZ = Math.sin(angle) * data.swirlRadius;
      
      positionAttribute.array[i3] = data.initialPosition.x + swirlX;
      positionAttribute.array[i3 + 1] = data.initialPosition.y + elapsedTime * data.driftSpeed * 30;
      positionAttribute.array[i3 + 2] = data.initialPosition.z + swirlZ;

      if (positionAttribute.array[i3 + 1] > PARTICLE_SPREAD_RADIUS * 0.8) {
        positionAttribute.array[i3 + 1] = -PARTICLE_SPREAD_RADIUS * 0.8;
        data.initialPosition.y = -PARTICLE_SPREAD_RADIUS * 0.8;
      }

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

    pointsRef.current.rotation.y = elapsedTime * 0.03;
    pointsRef.current.rotation.x = elapsedTime * 0.015;
  });

  return (
    <Points ref={pointsRef} limit={PARTICLE_COUNT} frustumCulled={false}>
      <PointMaterial
        vertexColors
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        transparent
        opacity={0}
      />
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

export function SimpleSplashScreen({ onSkip }: SplashScreenProps) {
  return (
    <div
      role="status"
      aria-label="দয়াল হোমিও সদন is starting, please wait"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden",
        "bg-gradient-to-b from-[#1A1D2A] to-[#11131E]", // Dark gradient background
        "cursor-pointer"
      )}
      onClick={onSkip}
    >
      <Canvas>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 5, 2]} intensity={0.8} />
        <ParticleSystem />
      </Canvas>
      
      {/* HTML Overlay for Logo and Text */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="relative flex flex-col items-center">
          <div className="motion-safe:animate-logoPopIn opacity-0">
            <Leaf
              className={cn(
                "mb-3 h-20 w-20 md:h-24 md:w-24",
                "text-teal-400" // Adjusted for dark background
              )}
            />
          </div>
          <h1
            className={cn(
              "text-3xl font-semibold md:text-4xl",
              "text-gray-100", // Light text for dark background
              "motion-safe:animate-textEmerge opacity-0 motion-safe:[animation-delay:0.5s]"
            )}
          >
            দয়াল হোমিও সদন
          </h1>
          <p
            className={cn(
              "mt-2 text-sm md:text-base",
              "text-gray-300", // Lighter text for dark background
              "motion-safe:animate-textEmerge opacity-0 motion-safe:[animation-delay:0.7s]"
            )}
          >
            Your Homeopathic Inventory Companion
          </p>
        </div>
      </div>
      
      {/* Bottom Text elements (Tap to continue, Loading...) */}
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
