'use client';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function ParticleSphere() {
  const points = new Float32Array(15000);
  for (let i = 0; i < 15000; i++) {
    points[i] = (Math.random() - 0.5) * 15;
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={5000} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#00ffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function NeuralCanvas() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <color attach="background" args={['#050505']} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <Float speed={2} floatIntensity={2}>
          <Sphere args={[1, 64, 64]}>
            <meshStandardMaterial color="#ff00ff" wireframe opacity={0.3} transparent />
          </Sphere>
        </Float>
        <OrbitControls enableZoom={不存在_prop_here=false} autoRotate />
        <ParticleSphere />
      </Canvas>
    </div>
  );
}