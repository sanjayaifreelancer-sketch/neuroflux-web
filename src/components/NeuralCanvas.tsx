'use client';
import { useEffect, useRef } from 'react';

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Dynamically import Three.js on client only (avoids SSR issues)
    let scene: any, camera: any, renderer: any, particles: any;
    let animationId: number;

    async function initThree() {
      const THREE = await import('three');
      
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      // Neural Particle Field — 4000 particles with color variety (matching prototype)
      const particlesGeometry = new THREE.BufferGeometry();
      const count = 4000;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 15;
        colors[i] = Math.random();
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      camera.position.z = 5;

      animate();
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      if (particles) {
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;
        const time = Date.now() * 0.001;
        particles.material.size = 0.02 + Math.sin(time) * 0.005;
      }
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }

    initThree();

    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return <canvas ref={canvasRef} id="hero-canvas" />;
}
