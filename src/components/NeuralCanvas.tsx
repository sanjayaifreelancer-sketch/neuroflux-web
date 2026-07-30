'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function Particles({ count = 3000 }: { count?: number }) {
  const points = useRef<THREE.Points>(null!);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 15;

  useFrame((state) => {
    points.current.rotation.y += 0.001;
    points.current.rotation.x += 0.0005;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3} />
      </BufferGeometry>
      <pointsMaterial size={0.02} color="#00ffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function NeuralCanvas() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Particles />
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
}