import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface StorageSphereProps {
  usedBytes: number;
  totalQuotaBytes: number;
  duplicateBytes: number;
  fileCount: number;
}

export const StorageSphere3D: React.FC<StorageSphereProps> = ({
  usedBytes,
  totalQuotaBytes,
  duplicateBytes,
  fileCount
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 5, 15);
    blueLight.position.set(3, 4, 4);
    scene.add(blueLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 4, 15);
    violetLight.position.set(-3, -3, 3);
    scene.add(violetLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Storage Usage Ratio
    const ratio = Math.min(Math.max(usedBytes / (totalQuotaBytes || 1), 0.05), 1);
    
    // Core Sphere (Color changes with storage ratio)
    const coreColor = ratio > 0.85 ? 0xef4444 : ratio > 0.6 ? 0xf59e0b : 0x3b82f6;
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: coreColor,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreSphere);

    // Outer Translucent Wireframe Shell
    const wireGeo = new THREE.IcosahedronGeometry(2.1, 2);
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireShell = new THREE.Mesh(wireGeo, wireMat);
    rootGroup.add(wireShell);

    // Storage Rings (Orbiting equator & tilted)
    const ring1Geo = new THREE.TorusGeometry(2.6, 0.03, 16, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    rootGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(3.0, 0.02, 16, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3.5;
    rootGroup.add(ring2);

    // Orbiting Category Data Nodes
    const categories = [
      { name: 'Documents', color: 0x3b82f6, radius: 2.7, speed: 0.7, offset: 0 },
      { name: 'Images', color: 0xec4899, radius: 2.9, speed: 0.5, offset: 1.5 },
      { name: 'Duplicates', color: 0xf59e0b, radius: 2.5, speed: 0.9, offset: 3.1 },
      { name: 'Development', color: 0x06b6d4, radius: 3.1, speed: 0.6, offset: 4.5 },
      { name: 'Archives', color: 0x8b5cf6, radius: 2.8, speed: 0.8, offset: 5.6 },
    ];

    const nodeMeshes: { mesh: THREE.Mesh; config: typeof categories[0] }[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);

    categories.forEach((cat) => {
      const nodeMat = new THREE.MeshStandardMaterial({
        color: cat.color,
        emissive: cat.color,
        emissiveIntensity: 0.4,
        roughness: 0.3,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      rootGroup.add(nodeMesh);
      nodeMeshes.push({ mesh: nodeMesh, config: cat });
    });

    // File Data Particles
    const pCount = 70;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 1.5;
      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    rootGroup.add(particles);

    // Mouse drag interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rootGroup.rotation.y += deltaX * 0.008;
      rootGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Continuous subtle rotation
      if (!isDragging) {
        rootGroup.rotation.y += 0.004;
        rootGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.1;
      }

      // Shell counter-rotation
      wireShell.rotation.y -= 0.006;
      wireShell.rotation.z += 0.003;

      // Pulse core sphere based on storage
      const pulseScale = 1.0 + Math.sin(elapsed * 2.5) * 0.04;
      coreSphere.scale.set(pulseScale, pulseScale, pulseScale);

      // Rings spin
      ring1.rotation.z += 0.007;
      ring2.rotation.z -= 0.005;

      // Orbit category nodes
      nodeMeshes.forEach(({ mesh, config }) => {
        const angle = elapsed * config.speed + config.offset;
        mesh.position.set(
          Math.cos(angle) * config.radius,
          Math.sin(angle * 0.8) * 0.7,
          Math.sin(angle) * config.radius
        );
      });

      // Particles gentle drift
      particles.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [usedBytes, totalQuotaBytes, duplicateBytes]);

  return (
    <div className="relative w-full h-[320px] md:h-[380px] flex items-center justify-center">
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-[11px] font-medium text-slate-500 dark:text-slate-400 pointer-events-none flex items-center gap-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Interactive 3D Storage Core • Drag to Rotate
      </div>
    </div>
  );
};
