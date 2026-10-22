"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ExecutionVariance3DProps {
  flakinessRate?: number;
  testName?: string;
  className?: string;
}

export function ExecutionVariance3D({
  flakinessRate = 18.4,
  testName = "TestAsyncConnectionPoolDrainUnderLoad",
  className,
}: ExecutionVariance3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"PHASE_SPACE" | "CONVERGED">("PHASE_SPACE");
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    let isDisposed = false;
    let animFrameId: number;
    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;
    let pointsPass: any = null;
    let pointsFail: any = null;
    let attractorTorus: any = null;

    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    // Dynamic import to keep initial bundle ultra-lean
    import("three")
      .then((THREE) => {
        if (isDisposed || !container) return;

        const width = container.clientWidth || 360;
        const height = container.clientHeight || 260;

        // Scene & Camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(2.8, 2.2, 3.2);
        camera.lookAt(0, 0, 0);

        // Renderer with DPR capping (max 1.5)
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);

        container.appendChild(renderer.domElement);

        // 1. Midnight-Purple Coordinate Grid Floor
        const gridHelper = new THREE.GridHelper(2.4, 6, 0x4c1d95, 0x1f1738);
        gridHelper.position.y = -0.8;
        scene.add(gridHelper);

        // 2. Stable Attractor Basin (Electric Violet Torus loop representing deterministic cycle)
        const torusGeom = new THREE.TorusGeometry(0.85, 0.02, 12, 48);
        const torusMat = new THREE.MeshBasicMaterial({
          color: 0x8b5cf6,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        });
        attractorTorus = new THREE.Mesh(torusGeom, torusMat);
        attractorTorus.rotation.x = Math.PI / 2.8;
        scene.add(attractorTorus);

        // 3. Execution Data Points in Phase Space (50 runs)
        // Pass Points: Clustered around center attractor (Emerald)
        const passPositions: number[] = [];
        const passCount = 41;
        for (let i = 0; i < passCount; i++) {
          const angle = (i / passCount) * Math.PI * 2;
          const r = 0.85 + (Math.random() - 0.5) * 0.2;
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;
          const y = (Math.random() - 0.5) * 0.25;
          passPositions.push(x, y, z);
        }
        const passGeom = new THREE.BufferGeometry();
        passGeom.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(passPositions, 3)
        );
        const passMat = new THREE.PointsMaterial({
          color: 0x10b981,
          size: 0.08,
          transparent: true,
          opacity: 0.9,
        });
        pointsPass = new THREE.Points(passGeom, passMat);
        scene.add(pointsPass);

        // Fail Points: Bifurcated into the critical delay/contention basin (Rose)
        const failPositions: number[] = [];
        const failCount = 9;
        for (let i = 0; i < failCount; i++) {
          // Divergence trajectory outward
          const angle = Math.PI * 0.2 + (i / failCount) * 0.8;
          const r = 1.35 + (i * 0.06);
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;
          const y = 0.35 + (i * 0.05);
          failPositions.push(x, y, z);
        }
        const failGeom = new THREE.BufferGeometry();
        failGeom.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(failPositions, 3)
        );
        const failMat = new THREE.PointsMaterial({
          color: 0xf43f5e,
          size: 0.11,
          transparent: true,
          opacity: 0.95,
        });
        pointsFail = new THREE.Points(failGeom, failMat);
        scene.add(pointsFail);

        // Divergence trajectory spline in soft electric violet
        const curvePoints = [
          new THREE.Vector3(0.6, 0.0, 0.6),
          new THREE.Vector3(0.9, 0.15, 0.85),
          new THREE.Vector3(1.2, 0.35, 1.1),
          new THREE.Vector3(1.45, 0.5, 1.3),
        ];
        const spline = new THREE.CatmullRomCurve3(curvePoints);
        const splineGeom = new THREE.TubeGeometry(spline, 24, 0.012, 6, false);
        const splineMat = new THREE.MeshBasicMaterial({
          color: 0xa78bfa,
          transparent: true,
          opacity: 0.5,
        });
        const splineMesh = new THREE.Mesh(splineGeom, splineMat);
        scene.add(splineMesh);

        // Mouse Parallax
        let targetX = 0;
        let targetY = 0;
        const handleMouseMove = (e: MouseEvent) => {
          const rect = container.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          targetX = x * 0.8;
          targetY = y * 0.5;
        };
        container.addEventListener("mousemove", handleMouseMove);

        // Low-power Animation Loop with throttled frame rate (~45fps)
        let lastTime = 0;
        const interval = 1000 / 45;

        const animate = (time: number) => {
          if (isDisposed) return;
          animFrameId = requestAnimationFrame(animate);

          // Skip frames if tab is hidden
          if (document.hidden) return;

          const delta = time - lastTime;
          if (delta < interval) return;
          lastTime = time - (delta % interval);

          // Subtle harmonic rotation
          if (attractorTorus) attractorTorus.rotation.z += 0.003;
          if (pointsPass) pointsPass.rotation.y += 0.002;
          if (pointsFail && viewMode === "PHASE_SPACE") {
            pointsFail.visible = true;
            pointsFail.rotation.y += 0.002;
          } else if (pointsFail) {
            pointsFail.visible = false;
          }

          // Camera smooth ease towards cursor
          camera.position.x += (2.8 + targetX - camera.position.x) * 0.05;
          camera.position.y += (2.2 - targetY - camera.position.y) * 0.05;
          camera.lookAt(0, 0, 0);

          renderer.render(scene, camera);
        };
        animFrameId = requestAnimationFrame(animate);

        // Resize Observer
        const resizeObserver = new ResizeObserver((entries) => {
          if (!entries[0] || isDisposed) return;
          const { width: w, height: h } = entries[0].contentRect;
          if (w === 0 || h === 0) return;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        });
        resizeObserver.observe(container);

        return () => {
          container.removeEventListener("mousemove", handleMouseMove);
          resizeObserver.disconnect();
        };
      })
      .catch(() => {
        setWebglSupported(false);
      });

    // Cleanup resources on unmount
    return () => {
      isDisposed = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (renderer) {
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
    };
  }, [viewMode]);

  return (
    <div
      className={cn(
        "rounded-xl bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 flex flex-col justify-between overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(139,92,246,0.10)] gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Phase-Space Execution Variance Topology
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            50 repeated runs mapped across thread delay (X) and duration (Z)
          </p>
        </div>

        {/* State Toggle */}
        <div className="flex items-center space-x-1 bg-[#0c0a14] p-0.5 rounded-md border border-[rgba(139,92,246,0.12)] text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setViewMode("PHASE_SPACE")}
            className={cn(
              "px-2.5 py-1 rounded transition-colors cursor-pointer",
              viewMode === "PHASE_SPACE"
                ? "bg-[#181328] text-white border border-violet-500/40 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Bifurcation ({flakinessRate}%)
          </button>
          <button
            type="button"
            onClick={() => setViewMode("CONVERGED")}
            className={cn(
              "px-2.5 py-1 rounded transition-colors cursor-pointer",
              viewMode === "CONVERGED"
                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Converged
          </button>
        </div>
      </div>

      {/* 3D Canvas / Fallback Container */}
      <div className="relative h-[220px] w-full my-2 bg-[#0a0812] rounded-lg border border-[rgba(139,92,246,0.10)] overflow-hidden flex items-center justify-center">
        {webglSupported ? (
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        ) : (
          /* High-legibility Non-WebGL 2D Fallback Scatter */
          <div className="w-full h-full p-4 flex flex-col justify-between font-mono text-xs text-zinc-400">
            <div className="flex items-center justify-between text-[11px]">
              <span>2D Scatter Fallback (Thread Jitter vs Execution Time)</span>
              <span className="text-violet-400">9 Bifurcations Detected</span>
            </div>
            <div className="relative flex-1 my-2 border-l border-b border-violet-900/40 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 300 120">
                {/* 41 green pass nodes clustered */}
                <circle cx="120" cy="65" r="4" fill="#10b981" opacity="0.8" />
                <circle cx="125" cy="60" r="4" fill="#10b981" opacity="0.8" />
                <circle cx="130" cy="70" r="4" fill="#10b981" opacity="0.8" />
                <circle cx="115" cy="55" r="4" fill="#10b981" opacity="0.8" />
                <circle cx="135" cy="62" r="4" fill="#10b981" opacity="0.8" />
                {/* 9 red fail nodes bifurcated */}
                {viewMode === "PHASE_SPACE" && (
                  <>
                    <path
                      d="M 135 62 Q 180 40 240 25"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle cx="210" cy="35" r="5" fill="#f43f5e" />
                    <circle cx="230" cy="28" r="5" fill="#f43f5e" />
                    <circle cx="250" cy="22" r="5" fill="#f43f5e" />
                  </>
                )}
              </svg>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>0ms Delay</span>
              <span className="text-violet-400">Critical Boundary: 18ms Delay</span>
              <span>50ms Delay &rarr;</span>
            </div>
          </div>
        )}

        {/* Phase Space Legend Overlays */}
        <div className="absolute bottom-2 left-2 flex items-center space-x-3 text-[10px] font-mono bg-[#0c0a14]/90 px-2 py-1 rounded-md border border-[rgba(139,92,246,0.14)]">
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Pass Basin (41)</span>
          </span>
          {viewMode === "PHASE_SPACE" && (
            <span className="flex items-center space-x-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Divergent Races (9)</span>
            </span>
          )}
        </div>
      </div>

      {/* Engineering Diagnostic Takeaway */}
      <div className="pt-2 border-t border-[rgba(139,92,246,0.10)] text-[11px] font-mono text-zinc-400 flex items-center justify-between">
        <span>Bifurcation Trigger: Scheduler Delay &gt; 18.5ms</span>
        <span className="text-violet-400">Interactive Orbit</span>
      </div>
    </div>
  );
}
