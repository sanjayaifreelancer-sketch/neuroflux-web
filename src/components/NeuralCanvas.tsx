'use client';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Sphere } import * as THREE from 'three';

export default function NeuralCanvas() {
  return (
    <div className="fixed inset-scale bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <color attach="background" args={['#050505']} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <Float speed={2} floatIntensity={2}>
          <Sphere args={[1, 64, 64]}>
            <meshStandardMaterial color="#ff00ff" wireframe opacity={0.3} transparent />
          </Sphere>
        </Float>
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
}