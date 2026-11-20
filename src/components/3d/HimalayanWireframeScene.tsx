import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ThemeMode } from '../../types';

interface HimalayanWireframeSceneProps {
  theme: ThemeMode;
}

// Pre-allocated theme target colors (zero per-frame GC allocations)
const LIGHT_PALETTE = {
  fog: new THREE.Color('#FAF9F6'),
  hemiSky: new THREE.Color('#E0F2FE'),
  hemiGround: new THREE.Color('#CBD5E1'),
  keyLight: new THREE.Color('#FFF7ED'),
  rimLight: new THREE.Color('#E11D48'),
  sweepLight: new THREE.Color('#0891B2'),
  wireframe: new THREE.Color('#0284C7'),
  terrainTint: new THREE.Color('#FFFFFF'),
};

const DARK_PALETTE = {
  fog: new THREE.Color('#070B14'),
  hemiSky: new THREE.Color('#38BDF8'),
  hemiGround: new THREE.Color('#0F172A'),
  keyLight: new THREE.Color('#67E8F9'),
  rimLight: new THREE.Color('#FB7185'),
  sweepLight: new THREE.Color('#22D3EE'),
  wireframe: new THREE.Color('#22D3EE'),
  terrainTint: new THREE.Color('#94A3B8'),
};

const _basinColor = new THREE.Color();
const _ridgeColor = new THREE.Color();
const _snowColor = new THREE.Color();
const _crimsonAccent = new THREE.Color();
const _tempColor = new THREE.Color();

// Deterministic 2D value noise for Himalayan ridge generation (zero external assets)
function hash2D(ix: number, iz: number): number {
  const n = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise2D(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;

  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);

  const a = hash2D(ix, iz);
  const b = hash2D(ix + 1, iz);
  const c = hash2D(ix, iz + 1);
  const d = hash2D(ix + 1, iz + 1);

  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

// Ridged multifractal elevation modeling Himalayan alpine crests and valleys
function himalayanElevation(x: number, z: number): number {
  // Domain warp for authentic tectonic fold curvature
  const warpX = x + smoothNoise2D(x * 0.14 + 3.1, z * 0.14 - 1.7) * 2.4;
  const warpZ = z + smoothNoise2D(x * 0.14 - 5.2, z * 0.14 + 4.3) * 2.2;

  let amp = 1.0;
  let freq = 0.18;
  let sum = 0;
  let weight = 1.0;

  for (let octave = 0; octave < 4; octave++) {
    const n = smoothNoise2D(warpX * freq + octave * 11.3, warpZ * freq - octave * 7.1);
    // Sharp ridge crest: 1 - |2n - 1|
    let ridge = 1.0 - Math.abs(n * 2.0 - 1.0);
    ridge = ridge * ridge * weight;
    weight = THREE.MathUtils.clamp(ridge * 1.4, 0.25, 1.0);
    sum += ridge * amp;
    freq *= 2.08;
    amp *= 0.48;
  }

  // Sculpt primary Everest/Annapurna massif peaking toward center-right horizon
  const massifX = (x - 4.2) / 14.5;
  const massifZ = (z + 1.5) / 11.0;
  const massifEnvelope = Math.exp(-(massifX * massifX + massifZ * massifZ));

  // Secondary western ridge spur
  const spurX = (x + 3.5) / 10.5;
  const spurZ = (z - 2.2) / 9.5;
  const spurEnvelope = Math.exp(-(spurX * spurX + spurZ * spurZ)) * 0.55;

  // Radial perimeter falloff so edges melt cleanly into horizon fog
  const distFromCenter = Math.sqrt((x - 1.5) * (x - 1.5) + z * z);
  const edgeFalloff = THREE.MathUtils.smoothstep(19.5 - distFromCenter, 0, 8.5);

  const height = (sum * (massifEnvelope * 4.4 + spurEnvelope * 2.2 + 0.35) - 0.55) * edgeFalloff;
  return Math.max(-0.4, height);
}

export const HimalayanWireframeScene: React.FC<HimalayanWireframeSceneProps> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDarkRef = useRef<boolean>(theme === 'dark');

  // Keep reactive theme reference updated without rebuilding the WebGL context
  useEffect(() => {
    isDarkRef.current = theme === 'dark';
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect software WebGL (SwiftShader, llvmpipe, WARP) for frame pacing & pixel ratio cap
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2') || probe.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param) || '');
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render|WARP/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const initialDark = isDarkRef.current;
    const initialPalette = initialDark ? DARK_PALETTE : LIGHT_PALETTE;

    // Scene & Horizon Fog
    const scene = new THREE.Scene();
    const fog = new THREE.FogExp2(initialPalette.fog.getHex(), initialDark ? 0.036 : 0.032);
    scene.fog = fog;

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 120);
    camera.position.set(1.8, 7.6, 17.8);
    camera.lookAt(2.8, 1.35, -0.5);

    // WebGLRenderer configured per Three.js studio standards
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = initialDark ? 1.08 : 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Procedural studio environment map via RoomEnvironment (zero external HDR assets)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Dynamic 3-Point Theme-Responsive Lighting Rig + Animated Sweep Accent
    const hemiLight = new THREE.HemisphereLight(
      initialPalette.hemiSky,
      initialPalette.hemiGround,
      initialDark ? 0.65 : 1.05
    );
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(
      initialPalette.keyLight,
      initialDark ? 1.55 : 1.85
    );
    keyLight.position.set(10, 14, 9);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      initialPalette.rimLight,
      initialDark ? 1.35 : 0.72
    );
    rimLight.position.set(-11, 7, -10);
    scene.add(rimLight);

    const sweepLight = new THREE.PointLight(
      initialPalette.sweepLight,
      initialDark ? 12 : 7,
      28,
      1.6
    );
    sweepLight.position.set(4, 6.2, 3);
    scene.add(sweepLight);

    // Procedural Himalayan Topographic Geometry
    const segX = isSoftwareGl ? 54 : 88;
    const segZ = isSoftwareGl ? 36 : 58;
    const planeWidth = 36;
    const planeDepth = 24;

    const terrainGeometry = new THREE.PlaneGeometry(planeWidth, planeDepth, segX, segZ);
    terrainGeometry.rotateX(-Math.PI / 2);

    const posAttr = terrainGeometry.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    _basinColor.set('#334155');
    _ridgeColor.set('#64748B');
    _snowColor.set('#F8FAFC');
    _crimsonAccent.set('#BE123C');

    let minY = Infinity;
    let maxY = -Infinity;
    const heights = new Float32Array(posAttr.count);

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = himalayanElevation(x, z);
      heights[i] = y;
      posAttr.setY(i, y);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const heightSpan = Math.max(0.01, maxY - minY);
    for (let i = 0; i < posAttr.count; i++) {
      const norm = (heights[i] - minY) / heightSpan;
      if (norm < 0.42) {
        _tempColor.lerpColors(_basinColor, _ridgeColor, norm / 0.42);
      } else if (norm < 0.78) {
        _tempColor.lerpColors(_ridgeColor, _snowColor, (norm - 0.42) / 0.36);
      } else {
        _tempColor.copy(_snowColor);
      }
      // Subtle mineral warmth along mid-high ridges
      if (norm > 0.52 && norm < 0.72) {
        _tempColor.lerp(_crimsonAccent, 0.08);
      }
      colors[i * 3] = _tempColor.r;
      colors[i * 3 + 1] = _tempColor.g;
      colors[i * 3 + 2] = _tempColor.b;
    }

    posAttr.needsUpdate = true;
    terrainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeometry.computeVertexNormals();

    // Composite Terrain Group (Sculpted PBR Mesh + Topographic Contour Wireframe + Summit Nodes)
    const terrainGroup = new THREE.Group();
    terrainGroup.position.set(2.2, -0.35, -0.8);
    scene.add(terrainGroup);

    // 1. Primary Sculpted Topographic Relief Mesh
    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: initialPalette.terrainTint.clone(),
      vertexColors: true,
      roughness: 0.78,
      metalness: 0.14,
      flatShading: true,
      transparent: true,
      opacity: initialDark ? 0.88 : 0.34,
      envMapIntensity: initialDark ? 0.85 : 0.65,
    });
    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainGroup.add(terrainMesh);

    // 2. Precision Cartographic Wireframe Mesh (polygonOffset prevents z-fighting)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: initialPalette.wireframe.clone(),
      wireframe: true,
      transparent: true,
      opacity: initialDark ? 0.17 : 0.14,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const wireframeMesh = new THREE.Mesh(terrainGeometry, wireframeMaterial);
    wireframeMesh.position.y = 0.025;
    terrainGroup.add(wireframeMesh);

    // 3. Instanced Summit Telemetry Markers (placed strictly above top ridge peaks)
    const peakCandidates: Array<{ x: number; y: number; z: number }> = [];
    for (let i = 0; i < posAttr.count; i += 7) {
      const y = heights[i];
      if (y > minY + heightSpan * 0.62) {
        peakCandidates.push({
          x: posAttr.getX(i),
          y: y + 0.18,
          z: posAttr.getZ(i),
        });
      }
    }
    const markerCount = Math.min(peakCandidates.length, 28);
    const markerGeometry = new THREE.OctahedronGeometry(0.085, 0);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: initialDark ? 0x22d3ee : 0xbe123c,
      emissive: initialDark ? 0x0891b2 : 0xbe123c,
      emissiveIntensity: initialDark ? 0.9 : 0.35,
      roughness: 0.25,
      metalness: 0.75,
    });
    const summitMarkers = new THREE.InstancedMesh(markerGeometry, markerMaterial, Math.max(markerCount, 1));
    const dummy = new THREE.Object3D();
    for (let i = 0; i < markerCount; i++) {
      const p = peakCandidates[i];
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(0.75 + (i % 3) * 0.22);
      dummy.updateMatrix();
      summitMarkers.setMatrixAt(i, dummy.matrix);
    }
    if (markerCount === 0) {
      summitMarkers.visible = false;
    } else {
      summitMarkers.instanceMatrix.needsUpdate = true;
      summitMarkers.computeBoundingSphere();
    }
    terrainGroup.add(summitMarkers);

    // Pre-compile shaders on hardware GPUs to eliminate first-frame stutter
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Subtle pointer parallax with exponential damping
    let targetPtrX = 0;
    let targetPtrY = 0;
    let currentPtrX = 0;
    let currentPtrY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      targetPtrX = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 1.1;
      targetPtrY = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 0.55;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Responsive sizing
    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Pause when scrolled out of viewport
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    intersectionObserver.observe(container);

    // Animation loop state
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    const tick = () => {
      if (disposed) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      if (isVisible) {
        const dark = isDarkRef.current;
        const target = dark ? DARK_PALETTE : LIGHT_PALETTE;
        const dampRate = Math.min(1, delta * 4.5);

        // Smoothly damp dynamic lighting, fog, and material response to Light/Dark theme state
        fog.color.lerp(target.fog, dampRate);
        fog.density = THREE.MathUtils.damp(fog.density, dark ? 0.036 : 0.032, 4.5, delta);

        hemiLight.color.lerp(target.hemiSky, dampRate);
        hemiLight.groundColor.lerp(target.hemiGround, dampRate);
        hemiLight.intensity = THREE.MathUtils.damp(hemiLight.intensity, dark ? 0.65 : 1.05, 4.5, delta);

        keyLight.color.lerp(target.keyLight, dampRate);
        keyLight.intensity = THREE.MathUtils.damp(keyLight.intensity, dark ? 1.55 : 1.85, 4.5, delta);

        rimLight.color.lerp(target.rimLight, dampRate);
        rimLight.intensity = THREE.MathUtils.damp(rimLight.intensity, dark ? 1.35 : 0.72, 4.5, delta);

        sweepLight.color.lerp(target.sweepLight, dampRate);
        sweepLight.intensity = THREE.MathUtils.damp(
          sweepLight.intensity,
          (dark ? 12 : 7) + Math.sin(elapsed * 0.9) * (dark ? 3.5 : 1.5),
          4.0,
          delta
        );

        terrainMaterial.color.lerp(target.terrainTint, dampRate);
        terrainMaterial.opacity = THREE.MathUtils.damp(terrainMaterial.opacity, dark ? 0.88 : 0.34, 4.5, delta);
        terrainMaterial.envMapIntensity = THREE.MathUtils.damp(terrainMaterial.envMapIntensity, dark ? 0.85 : 0.65, 4.5, delta);

        wireframeMaterial.color.lerp(target.wireframe, dampRate);
        wireframeMaterial.opacity = THREE.MathUtils.damp(wireframeMaterial.opacity, dark ? 0.17 : 0.14, 4.5, delta);

        markerMaterial.color.lerp(dark ? target.sweepLight : target.rimLight, dampRate);
        markerMaterial.emissive.lerp(dark ? target.sweepLight : target.rimLight, dampRate);
        markerMaterial.emissiveIntensity = THREE.MathUtils.damp(markerMaterial.emissiveIntensity, dark ? 0.9 : 0.35, 4.5, delta);

        renderer.toneMappingExposure = THREE.MathUtils.damp(renderer.toneMappingExposure, dark ? 1.08 : 1.05, 4.5, delta);

        if (!prefersReducedMotion) {
          // Subtle slow-rotation animation of the Himalayan massif & dynamic ridge light sweep
          terrainGroup.rotation.y = Math.sin(elapsed * 0.085) * 0.16 - 0.08;
          terrainGroup.rotation.x = Math.cos(elapsed * 0.065) * 0.025;

          keyLight.position.x = 10 + Math.cos(elapsed * 0.18) * 3.5;
          keyLight.position.z = 9 + Math.sin(elapsed * 0.18) * 3.0;

          sweepLight.position.x = 3.5 + Math.cos(elapsed * 0.35) * 6.5;
          sweepLight.position.z = Math.sin(elapsed * 0.28) * 4.5;

          currentPtrX = THREE.MathUtils.damp(currentPtrX, targetPtrX, 3.2, delta);
          currentPtrY = THREE.MathUtils.damp(currentPtrY, targetPtrY, 3.2, delta);

          camera.position.x = 1.8 + currentPtrX * 1.4;
          camera.position.y = 7.6 - currentPtrY * 0.9;
          camera.lookAt(2.8, 1.35, -0.5);
        }

        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('mousemove', handlePointerMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      terrainGeometry.dispose();
      terrainMaterial.dispose();
      wireframeMaterial.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
      envTarget.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{
        maskImage: 'radial-gradient(ellipse 80% 80% at 68% 48%, black 22%, transparent 88%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 68% 48%, black 22%, transparent 88%)',
      }}
      aria-hidden="true"
    />
  );
};
