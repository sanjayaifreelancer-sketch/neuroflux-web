'use client';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Sphere } from '@react-three/d_rei';

export default function NeuralCanvas() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <color attach="background" args={['#050505']} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[1, 64, 64]}>
            <meshStandardMaterial color="#00ffff" wireframe opacity={0.3} transparent />
          </Sphere>
        </Float>
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
}