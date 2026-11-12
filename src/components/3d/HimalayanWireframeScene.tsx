import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThemeMode } from '../../types';

interface HimalayanWireframeSceneProps {
  theme: ThemeMode;
}

export const HimalayanWireframeScene: React.FC<HimalayanWireframeSceneProps> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fast software WebGL check to prevent CPU spikes on low-end environments
    const isSoftwareGl = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        if (!gl) return false;
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return false;
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        return /swiftshader|llvmpipe|software|warp/i.test(renderer);
      } catch {
        return false;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    // Position camera aimed towards right-center where the 3D elevation rises
    camera.position.set(2.5, 6.5, 17);
    camera.lookAt(2.5, 1.2, 0);

    // High performance renderer with alpha
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSoftwareGl ? 1 : 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Optimized Himalayan Topographic Terrain Grid (Lightweight: loads in <2ms)
    const gridCols = isSoftwareGl ? 28 : 42;
    const gridRows = isSoftwareGl ? 20 : 30;
    const planeWidth = 34;
    const planeDepth = 22;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeDepth, gridCols, gridRows);
    geometry.rotateX(-Math.PI / 2);

    // Precalculate ridge contours once (ZERO per-frame CPU vertex manipulation for instant 120 FPS speed)
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Skew mountain elevation towards the right and back (away from the left text zone)
      const rightBias = Math.max(0, (x + 6) / 22);
      const distFromCenter = Math.sqrt((x - 4) * (x - 4) + z * z);
      const ridge1 = Math.sin((x - 3) * 0.38 + z * 0.28) * 2.0;
      const ridge2 = Math.cos(x * 0.7 - z * 0.5) * 0.85;
      const edgeFalloff = Math.max(0, 1 - distFromCenter / 19);

      const y = (ridge1 + ridge2) * edgeFalloff * rightBias * (z < 2 ? 1.3 : 0.7);
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    // Subtle, architectural wireframe (Cyan & Sky Blue luxury palette)
    const wireframeColor = isDark ? 0x06b6d4 : 0x0284c7;
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: wireframeColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.14 : 0.09,
    });

    const terrainMesh = new THREE.Mesh(geometry, wireframeMaterial);
    terrainMesh.position.set(1.5, 0, 0);
    scene.add(terrainMesh);

    // Mouse Tracking with gentle dampening
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      targetX = (e.clientX / windowWidth - 0.5) * 1.2;
      targetY = (e.clientY / windowHeight - 0.5) * 0.6;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Handle Container Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Pause rendering when out of viewport
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    intersectionObserver.observe(container);

    // Animation Loop: Pure GPU transforms (Camera glide + mesh yaw), 0% CPU vertex overhead
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera easing towards pointer position
      if (!prefersReducedMotion) {
        currentX += (targetX - currentX) * 0.03;
        currentY += (targetY - currentY) * 0.03;

        camera.position.x = 2.5 + currentX * 1.5;
        camera.position.y = 6.5 - currentY * 1.0;
        camera.lookAt(2.5, 1.2, 0);

        // Slow, majestic ambient mesh sway (GPU transform only)
        terrainMesh.rotation.y = Math.sin(elapsedTime * 0.08) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resource Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      geometry.dispose();
      wireframeMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{
        // Radial mask so the wireframe naturally fades away completely on the left, keeping text crystal clear
        maskImage: 'radial-gradient(ellipse 75% 75% at 70% 50%, black 25%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 70% 50%, black 25%, transparent 85%)',
      }}
      aria-hidden="true"
    />
  );
};
