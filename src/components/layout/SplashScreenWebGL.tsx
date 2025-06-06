'use client';

import * as THREE from 'three';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Points, PointMaterial } from '@react-three/drei';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onSkip?: () => void;
}

const PARTICLE_COUNT = 100;
const PARTICLE_SPREAD_RADIUS = 5; // How far particles spread from the center

// Component for the particle system
function ParticleSystem() {
  const pointsRef = useRef<THREE.Points>(null!);
  const [materialOpacity, setMaterialOpacity] = useState(0);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * PARTICLE_SPREAD_RADIUS * 2;
      const y = (Math.random() - 0.5) * PARTICLE_SPREAD_RADIUS * 2;
      const z = (Math.random() - 0.5) * PARTICLE_SPREAD_RADIUS * 2;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  const colors = useMemo(() => {
    const temp = [];
    const coolColors = [
      new THREE.Color(0x6a0dad), // Purple
      new THREE.Color(0x4169e1), // Royal Blue
      new THREE.Color(0x00008b), // Dark Blue
      new THREE.Color(0x8a2be2), // Blue Violet
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = coolColors[Math.floor(Math.random() * coolColors.length)];
      temp.push(color.r, color.g, color.b);
    }
    return new Float32Array(temp);
  }, []);

  useEffect(() => {
    // Emergence: Fade in particles
    let currentOpacity = 0;
    const interval = setInterval(() => {
      currentOpacity += 0.05;
      if (currentOpacity >= 1) {
        setMaterialOpacity(1);
        clearInterval(interval);
      } else {
        setMaterialOpacity(currentOpacity);
      }
    }, 20); // Adjust timing for faster/slower fade-in

    return () => clearInterval(interval);
  }, []);
  
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Gentle rotation of the entire particle cloud
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = clock.getElapsedTime() * 0.02;
      
      // Scale up effect during emergence, then stabilize
      const scaleFactor = Math.min(1, materialOpacity * 1.5); // Scale up as opacity increases
      pointsRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  });

  return (
    <Points ref={pointsRef} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05} // Adjust particle size
        sizeAttenuation={true}
        depthWrite={false}
        opacity={materialOpacity}
      />
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
        "bg-gradient-to-b from-[#1A1D2A] to-[#11131E]", // Dark gradient
        "cursor-pointer"
      )}
      onClick={onSkip}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <ParticleSystem />
      </Canvas>
      
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
         <p
          className={cn(
            "px-4 text-xs",
            "text-teal-400/70", // Light text for dark background
            "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:1s]" 
          )}
        >
          Tap to continue
        </p>
         <p
          className={cn(
            "mt-1 px-4 text-xs",
            "text-teal-400/50", // Lighter text
            "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:0.7s]" 
          )}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
