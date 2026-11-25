import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, RotateCcw } from 'lucide-react';

interface FileSortProps {
  onOrganizeComplete?: () => void;
}

export const FileSortAnimation3D: React.FC<FileSortProps> = ({ onOrganizeComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [sortedCount, setSortedCount] = useState<number>(0);

  const triggerSortRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 8.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const bluePoint = new THREE.PointLight(0x3b82f6, 4, 15);
    bluePoint.position.set(-4, 3, 2);
    scene.add(bluePoint);

    // 4 Category Folder Target Bins in 3D Space
    const folderTargets = [
      { name: 'Documents', color: 0x3b82f6, pos: new THREE.Vector3(-3.2, -0.6, 0.5) },
      { name: 'Finance', color: 0x10b981, pos: new THREE.Vector3(-1.1, -0.6, -1.0) },
      { name: 'Media', color: 0xec4899, pos: new THREE.Vector3(1.1, -0.6, -1.0) },
      { name: 'Development', color: 0x8b5cf6, pos: new THREE.Vector3(3.2, -0.6, 0.5) }
    ];

    const folderMeshes: THREE.Group[] = [];

    folderTargets.forEach((target) => {
      const folderGrp = new THREE.Group();
      folderGrp.position.copy(target.pos);

      // Folder Back
      const backGeo = new THREE.BoxGeometry(1.6, 1.2, 0.08);
      const mat = new THREE.MeshStandardMaterial({ color: target.color, roughness: 0.3 });
      const back = new THREE.Mesh(backGeo, mat);
      folderGrp.add(back);

      // Folder Front Flap
      const frontGeo = new THREE.BoxGeometry(1.6, 1.0, 0.06);
      const frontMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(target.color).offsetHSL(0, 0, 0.08),
        roughness: 0.35,
        transparent: true,
        opacity: 0.9
      });
      const front = new THREE.Mesh(frontGeo, frontMat);
      front.position.set(0, -0.1, 0.25);
      front.rotation.x = 0.3;
      folderGrp.add(front);

      scene.add(folderGrp);
      folderMeshes.push(folderGrp);
    });

    // Files in the Queue
    interface FlyingDoc {
      mesh: THREE.Mesh;
      startPos: THREE.Vector3;
      targetPos: THREE.Vector3;
      targetFolderIdx: number;
      progress: number;
      speed: number;
      active: boolean;
      delay: number;
    }

    const flyingDocs: FlyingDoc[] = [];
    const docGeo = new THREE.BoxGeometry(0.7, 0.9, 0.04);

    const docColors = [0x3b82f6, 0x10b981, 0xec4899, 0x8b5cf6, 0xf59e0b, 0x06b6d4];

    for (let i = 0; i < 16; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: docColors[i % docColors.length],
        roughness: 0.2,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(docGeo, mat);
      const targetFolderIdx = i % 4;
      const targetPos = folderTargets[targetFolderIdx].pos.clone().add(new THREE.Vector3(0, 0.1, 0.15));

      // Initial resting position in floating central cluster
      const angle = (i / 16) * Math.PI * 2;
      const r = 0.8 + Math.random() * 0.4;
      const startPos = new THREE.Vector3(
        Math.cos(angle) * r,
        2.5 + Math.sin(angle * 2) * 0.4,
        Math.sin(angle) * r
      );

      mesh.position.copy(startPos);
      mesh.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, 0);
      scene.add(mesh);

      flyingDocs.push({
        mesh,
        startPos,
        targetPos,
        targetFolderIdx,
        progress: 0,
        speed: 0.012 + Math.random() * 0.008,
        active: false,
        delay: i * 0.18
      });
    }

    let activeSorting = false;
    let timer = 0;

    triggerSortRef.current = () => {
      activeSorting = true;
      setIsSorting(true);
      setSortedCount(0);
      timer = 0;
      flyingDocs.forEach((d) => {
        d.progress = 0;
        d.active = false;
        d.mesh.position.copy(d.startPos);
        d.mesh.scale.set(1, 1, 1);
      });
    };

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Subtle breathing of folder targets
      folderMeshes.forEach((f, idx) => {
        f.position.y = folderTargets[idx].pos.y + Math.sin(elapsed * 1.5 + idx) * 0.04;
      });

      if (activeSorting) {
        timer += delta;
        let finished = 0;

        flyingDocs.forEach((doc) => {
          if (!doc.active && timer >= doc.delay) {
            doc.active = true;
          }

          if (doc.active && doc.progress < 1) {
            doc.progress = Math.min(doc.progress + doc.speed, 1);
            
            // Ease in-out arc trajectory
            const p = doc.progress;
            const arcHeight = Math.sin(p * Math.PI) * 1.5;
            doc.mesh.position.lerpVectors(doc.startPos, doc.targetPos, p);
            doc.mesh.position.y += arcHeight;
            
            doc.mesh.rotation.y += 0.05;
            doc.mesh.rotation.x = p * 0.4;

            // Scale down as it enters folder
            if (p > 0.8) {
              const s = 1.0 - (p - 0.8) * 1.5;
              doc.mesh.scale.set(s, s, s);
            }

            if (doc.progress >= 1) {
              finished++;
            }
          } else if (doc.progress >= 1) {
            finished++;
          }
        });

        setSortedCount(finished);

        if (finished === flyingDocs.length) {
          activeSorting = false;
          setIsSorting(false);
          if (onOrganizeComplete) onOrganizeComplete();
        }
      } else {
        // Idle hover of docs
        flyingDocs.forEach((doc, i) => {
          if (doc.progress === 0) {
            doc.mesh.position.y = doc.startPos.y + Math.sin(elapsed * 2 + i) * 0.08;
            doc.mesh.rotation.y += 0.005;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

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
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] md:h-[420px] rounded-2xl glass-card overflow-hidden p-4 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Live 3D Pipeline</span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Real-Time Autonomous Organization</h4>
        </div>
        <button
          onClick={() => triggerSortRef.current()}
          disabled={isSorting}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
        >
          {isSorting ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              Sorting ({sortedCount}/16)...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Simulate 3D Auto-Sort
            </>
          )}
        </button>
      </div>

      {/* 3D Canvas Canvas Mount */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Bottom Folder Labels */}
      <div className="relative z-10 grid grid-cols-4 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/60 text-center">
        <div className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/40 dark:border-blue-800/40">
          Documents
        </div>
        <div className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-800/40">
          Finance
        </div>
        <div className="px-2 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-[11px] font-semibold text-pink-700 dark:text-pink-300 border border-pink-200/40 dark:border-pink-800/40">
          Media
        </div>
        <div className="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[11px] font-semibold text-purple-700 dark:text-purple-300 border border-purple-200/40 dark:border-purple-800/40">
          Development
        </div>
      </div>
    </div>
  );
};
