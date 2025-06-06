
'use client';

import * as THREE from 'three';
import React, { useRef, useMemo, useEffect, useState } from 'react';
// Removed 'type ThreeElements' as it's not explicitly used in this component's props/state.
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Points, PointMaterial } from '@react-three/drei';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onSkip?: () => void;
}

const PARTICLE_COUNT = 100;
const SPREAD_FACTOR = 10; // How wide the particles are spread initially

function FadingPoint({ initialPosition, initialColor, delay }: { initialPosition: THREE.Vector3, initialColor: THREE.Color, delay: number }) {
  const pointRef = useRef<THREE.Points>(null!);
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0.7); // Target opacity
      setScale(1);   // Target scale
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame((state, delta) => {
    if (pointRef.current) {
      // Simple drift upwards
      pointRef.current.position.y += delta * 0.05;
      if (pointRef.current.position.y > SPREAD_FACTOR / 2 + 1) {
        pointRef.current.position.y = -SPREAD_FACTOR / 2 -1; // Loop around
      }
    }
  });

  const positionsArray = useMemo(() => Float32Array.from(initialPosition.toArray()), [initialPosition]);
  
  return (
    // Using Drei's <Points> component for simplicity, ref is to the THREE.Points object it creates
    <Points ref={pointRef} positions={positionsArray as any}> {/* positions expects Float32Array | number[][] */}
      <PointMaterial
        transparent
        color={initialColor}
        size={0.1 * scale} // Particle size influenced by scale state
        sizeAttenuation={true}
        depthWrite={false}
        opacity={opacity} // Opacity controlled by state
      />
    </Points>
  );
}


function ParticleSystem() {
  const particles = useMemo(() => {
    const temp = [];
    const coolColors = [new THREE.Color('#6050A0'), new THREE.Color('#4A70D0'), new THREE.Color('#50A0C0')]; // Teal/Purple shades
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * SPREAD_FACTOR;
      const y = (Math.random() - 0.5) * SPREAD_FACTOR;
      const z = (Math.random() - 0.5) * SPREAD_FACTOR * 0.2; // Shallow depth
      
      temp.push({
        id: i,
        initialPosition: new THREE.Vector3(x, y, z),
        initialColor: coolColors[Math.floor(Math.random() * coolColors.length)],
        delay: Math.random() * 700, // Staggered fade-in up to 700ms
      });
    }
    return temp;
  }, []);

  return (
    <group>
      {particles.map((particle) => (
        <FadingPoint
          key={particle.id}
          initialPosition={particle.initialPosition}
          initialColor={particle.initialColor}
          delay={particle.delay}
        />
      ))}
    </group>
  );
}

// Renaming to SimpleSplashScreen to match the import in AppInitializer
export function SimpleSplashScreen({ onSkip }: SplashScreenProps) {
  return (
    <div
      role="status"
      aria-label="দয়াল হোমিও সদন is starting, please wait"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden",
        "bg-gradient-to-b from-[#1A1D2A] to-[#11131E]", // Dark gradient via CSS for the container
        "cursor-pointer" // Indicate tap-to-skip
      )}
      onClick={onSkip}
    >
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
        <ambientLight intensity={0.5} />
        <ParticleSystem />
      </Canvas>
      
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
         <p
          className={cn(
            "px-4 text-xs",
            "text-teal-400/70", // Using teal consistent with brand
            "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:1s]" 
          )}
        >
          Tap to continue
        </p>
         <p
          className={cn(
            "mt-1 px-4 text-xs",
            "text-teal-400/50", // Lighter teal for secondary text
            "opacity-0 motion-safe:animate-fadeInSlow motion-safe:[animation-delay:0.7s]" 
          )}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
