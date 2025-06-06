'use client';

import * as THREE from 'three';
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
// Removed imports from @react-three/drei for this minimal test
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onSkip?: () => void;
}

// A very simple component that renders a spinning box
function SpinningBox() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
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
      onClick={onSkip} // Retain skip functionality
    >
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <SpinningBox />
      </Canvas>
      
      {/* Overlay text, kept from previous version */}
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
