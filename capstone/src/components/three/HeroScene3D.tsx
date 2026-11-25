import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroScene3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x3b82f6, 4, 20);
    pointLight1.position.set(4, 5, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 4, 20);
    pointLight2.position.set(-4, -2, 3);
    scene.add(pointLight2);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 15);
    cyanLight.position.set(0, 3, -2);
    scene.add(cyanLight);

    // Root Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Helper: Create 3D Folder Mesh
    const createFolderMesh = (color: number) => {
      const folderGroup = new THREE.Group();
      
      // Folder Back
      const backGeo = new THREE.BoxGeometry(2.2, 1.6, 0.1);
      const backMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.1,
      });
      const back = new THREE.Mesh(backGeo, backMat);
      folderGroup.add(back);

      // Folder Tab
      const tabGeo = new THREE.BoxGeometry(0.8, 0.3, 0.09);
      const tab = new THREE.Mesh(tabGeo, backMat);
      tab.position.set(-0.6, 0.9, 0);
      folderGroup.add(tab);

      // Folder Front Flap (Angled)
      const frontGeo = new THREE.BoxGeometry(2.2, 1.4, 0.08);
      const frontMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).offsetHSL(0, 0, 0.05),
        roughness: 0.25,
        metalness: 0.15,
        transparent: true,
        opacity: 0.92,
      });
      const front = new THREE.Mesh(frontGeo, frontMat);
      front.position.set(0, -0.15, 0.35);
      front.rotation.x = 0.28;
      folderGroup.add(front);

      // Paper Sheets inside folder
      const paperGeo = new THREE.BoxGeometry(1.8, 1.3, 0.03);
      const paperMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.05
      });
      const paper1 = new THREE.Mesh(paperGeo, paperMat);
      paper1.position.set(-0.1, 0.2, 0.12);
      paper1.rotation.z = -0.05;
      folderGroup.add(paper1);

      const paper2 = new THREE.Mesh(paperGeo, paperMat);
      paper2.position.set(0.1, 0.3, 0.2);
      paper2.rotation.z = 0.04;
      folderGroup.add(paper2);

      return folderGroup;
    };

    // Central Main Folder
    const centerFolder = createFolderMesh(0x3b82f6);
    centerFolder.scale.set(1.2, 1.2, 1.2);
    centerFolder.position.set(0, 0.2, 0);
    mainGroup.add(centerFolder);

    // Left Violet Folder
    const leftFolder = createFolderMesh(0x8b5cf6);
    leftFolder.scale.set(0.75, 0.75, 0.75);
    leftFolder.position.set(-3.2, 1.2, -1.2);
    leftFolder.rotation.set(0.2, 0.4, -0.15);
    mainGroup.add(leftFolder);

    // Right Cyan Folder
    const rightFolder = createFolderMesh(0x06b6d4);
    rightFolder.scale.set(0.8, 0.8, 0.8);
    rightFolder.position.set(3.4, -0.8, -1.0);
    rightFolder.rotation.set(-0.15, -0.35, 0.12);
    mainGroup.add(rightFolder);

    // Floating Document Badges / Cubes
    const floatingElements: { mesh: THREE.Mesh; initialY: number; speed: number; rotSpeed: number }[] = [];
    
    // Floating Document Cards
    const docCardGeo = new THREE.BoxGeometry(0.8, 1.1, 0.05);
    const cardColors = [0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899];

    for (let i = 0; i < 4; i++) {
      const docMat = new THREE.MeshStandardMaterial({
        color: cardColors[i],
        roughness: 0.2,
        metalness: 0.3,
        transparent: true,
        opacity: 0.88
      });
      const doc = new THREE.Mesh(docCardGeo, docMat);
      const angle = (i / 4) * Math.PI * 2;
      const radius = 2.4;
      doc.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * 1.2 + 0.4,
        Math.sin(angle) * 0.8 + 0.5
      );
      doc.rotation.set(0.2, angle, 0.1);
      mainGroup.add(doc);
      floatingElements.push({
        mesh: doc,
        initialY: doc.position.y,
        speed: 1.5 + i * 0.3,
        rotSpeed: 0.01 + i * 0.005
      });
    }

    // Holographic Tech Ring
    const ringGeo = new THREE.TorusGeometry(3.6, 0.025, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    const techRing = new THREE.Mesh(ringGeo, ringMat);
    techRing.rotation.x = Math.PI / 2.3;
    mainGroup.add(techRing);

    // Particle Stream of Floating Files / Data Bits
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 10;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      particleVel.push((Math.random() * 0.02) + 0.005);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // Mouse Parallax Interaction
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.35;
      targetRotX = -y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth parallax easing
      mainGroup.rotation.y += (targetRotY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.05;

      // Gentle floating animation
      centerFolder.position.y = 0.2 + Math.sin(elapsedTime * 1.5) * 0.12;
      centerFolder.rotation.y = Math.sin(elapsedTime * 0.8) * 0.08;

      leftFolder.position.y = 1.2 + Math.sin(elapsedTime * 1.8 + 1) * 0.15;
      rightFolder.position.y = -0.8 + Math.cos(elapsedTime * 1.4 + 2) * 0.12;

      // Rotate tech ring
      techRing.rotation.z += 0.003;

      // Animate floating document cards
      floatingElements.forEach(({ mesh, initialY, speed, rotSpeed }, index) => {
        mesh.position.y = initialY + Math.sin(elapsedTime * speed + index) * 0.15;
        mesh.rotation.y += rotSpeed;
        mesh.rotation.x = Math.sin(elapsedTime * 1.2 + index) * 0.1;
      });

      // Animate file particles (flowing inward towards center)
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVel[i];
        if (positions[i * 3 + 1] > 3.5) {
          positions[i * 3 + 1] = -3.5;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[480px] lg:h-[600px] flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Decorative radial lighting behind 3D objects */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-blue-500/10 via-transparent to-transparent blur-3xl -z-10" />
    </div>
  );
};
