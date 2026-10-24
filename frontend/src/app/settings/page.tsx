"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Server,
  Flame,
  Bell,
  Palette,
  Check,
  Save,
  Radio,
  RefreshCw,
  Cpu,
  Shield,
} from "lucide-react";
import { api } from "@/services/api";
import { PlatformSettings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // API test state
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const data = await api.getSettings();
      setSettings(data);
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    await api.updateSettings(settings);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePingBackend = async () => {
    setIsTestingApi(true);
    const res = await api.testBackendConnection(settings?.apiConnection.baseUrl);
    setApiTestResult(res);
    setIsTestingApi(false);
  };

  if (isLoading || !settings) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-3 font-mono">
          <RefreshCw className="w-5 h-5 animate-spin text-zinc-400 mx-auto" />
          <p className="text-xs text-zinc-400">Loading platform preferences...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(139,92,246,0.12)] gap-3">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
              Engine &amp; Platform Configuration
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Test execution parameters, chaos perturbation defaults, and Django REST backend integration
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {saveSuccess && (
              <span className="flex items-center space-x-1 text-xs font-mono text-emerald-400 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Preferences Saved</span>
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>

        {/* 1. API & Backend Adapter Status */}
        <div className="rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(139,92,246,0.12)]">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-violet-400" />
              <div>
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                  Backend Architecture &amp; API Contract
                </h3>
                <p className="text-xs text-zinc-400">
                  Django REST Framework adapter and live endpoint configuration
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded bg-violet-950/40 text-violet-300 text-[11px] font-mono border border-violet-500/30">
              Active: Mock Adapter
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label htmlFor="drf-base-url" className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                DRF Endpoint Base URL
              </label>
              <input
                id="drf-base-url"
                type="text"
                value={settings.apiConnection.baseUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiConnection: {
                      ...settings.apiConnection,
                      baseUrl: e.target.value,
                    },
                  })
                }
                placeholder="http://localhost:8000/api/v1"
                className="w-full px-3 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.14)] text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-violet-500/50 focus-visible:ring-1 focus-visible:ring-violet-400"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Configured via NEXT_PUBLIC_API_URL or overridden locally.
              </span>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handlePingBackend}
                disabled={isTestingApi}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded bg-[#141122] hover:bg-[#1c172e] text-zinc-200 border border-[rgba(139,92,246,0.16)] transition-colors cursor-pointer text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400"
              >
                <Radio className="w-3.5 h-3.5 text-violet-400" />
                <span>
                  {isTestingApi ? "Testing Connection..." : "Test Backend Connection"}
                </span>
              </button>
            </div>
          </div>

          {apiTestResult && (
            <div
              className={`p-2.5 rounded border text-xs font-mono flex items-start space-x-2 ${
                apiTestResult.success
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-[#090812] border-[rgba(139,92,246,0.14)] text-zinc-300"
              }`}
            >
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
              <div>
                <span className="font-semibold block">
                  Latency: {apiTestResult.latencyMs}ms
                </span>
                <span>{apiTestResult.message}</span>
              </div>
            </div>
          )}

          {/* DRF Contract Specs Drawer */}
          <div className="mt-3 p-3 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] space-y-1.5 text-xs font-mono">
            <span className="text-zinc-400 uppercase tracking-wider block text-[10px] font-semibold">
              Django REST Framework Contract Specification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-zinc-400 text-[11px]">
              <div>&bull; <code className="text-violet-300">GET /api/v1/dashboard/metrics/</code></div>
              <div>&bull; <code className="text-violet-300">GET /api/v1/investigations/</code></div>
              <div>&bull; <code className="text-violet-300">POST /api/v1/investigations/</code></div>
              <div>&bull; <code className="text-violet-300">GET /api/v1/investigations/:id/</code></div>
              <div>&bull; <code className="text-violet-300">POST /api/v1/investigations/:id/verify/</code></div>
              <div>&bull; <code className="text-violet-300">GET /api/v1/tests/</code></div>
            </div>
          </div>
        </div>

        {/* 2. Test Execution & Reproduction Preferences */}
        <div className="rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-[rgba(139,92,246,0.12)]">
            <Cpu className="w-4 h-4 text-violet-400" />
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Execution &amp; Seed Fuzzing Preferences
              </h3>
              <p className="text-xs text-zinc-400">
                Concurrency limits and pseudo-random seed generator algorithms
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label htmlFor="max-repro-iterations" className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                Max Reproduction Iterations ({settings.testExecution.maxReproductionIterations} runs)
              </label>
              <input
                id="max-repro-iterations"
                type="range"
                min="20"
                max="100"
                step="10"
                value={settings.testExecution.maxReproductionIterations}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    testExecution: {
                      ...settings.testExecution,
                      maxReproductionIterations: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="parallel-workers" className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                Parallel Workers ({settings.testExecution.parallelWorkers} workers)
              </label>
              <input
                id="parallel-workers"
                type="range"
                min="2"
                max="16"
                step="2"
                value={settings.testExecution.parallelWorkers}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    testExecution: {
                      ...settings.testExecution,
                      parallelWorkers: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="prng-engine" className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                PRNG Seed Engine
              </label>
              <select
                id="prng-engine"
                value={settings.testExecution.seedGenerator}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    testExecution: {
                      ...settings.testExecution,
                      seedGenerator: e.target.value as any,
                    },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.14)] text-zinc-200 focus:outline-none focus:border-violet-500/50 cursor-pointer"
              >
                <option value="PCG64" className="bg-[#0f0d18]">PCG64 (Permuted Congruential - Recommended)</option>
                <option value="MERSENNE_TWISTER" className="bg-[#0f0d18]">Mersenne Twister (MT19937)</option>
                <option value="XOROSHIRO" className="bg-[#0f0d18]">Xoroshiro128++</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Chaos & Perturbation Settings */}
        <div className="rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-[rgba(139,92,246,0.12)]">
            <Flame className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Chaos &amp; Scheduler Perturbation Defaults
              </h3>
              <p className="text-xs text-zinc-400">
                Thread interleaving delays, clock skew, and artificial resource contention
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)]">
              <label htmlFor="chaos-thread-jitter" className="cursor-pointer">
                <span className="text-zinc-200 font-medium block">Thread Jitter</span>
                <span className="text-zinc-400 text-[10px]">Random context switch delays</span>
              </label>
              <input
                id="chaos-thread-jitter"
                type="checkbox"
                checked={settings.perturbation.enableThreadJitter}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    perturbation: {
                      ...settings.perturbation,
                      enableThreadJitter: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-violet-500 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="chaos-clock-skew" className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                Max Clock Skew (&plusmn;{settings.perturbation.maxClockSkewMs}ms)
              </label>
              <input
                id="chaos-clock-skew"
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.perturbation.maxClockSkewMs}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    perturbation: {
                      ...settings.perturbation,
                      maxClockSkewMs: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)]">
              <label htmlFor="chaos-memory-pressure" className="cursor-pointer">
                <span className="text-zinc-200 font-medium block">Memory Pressure</span>
                <span className="text-zinc-400 text-[10px]">Simulate heap spikes</span>
              </label>
              <input
                id="chaos-memory-pressure"
                type="checkbox"
                checked={settings.perturbation.memoryPressureSimulation}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    perturbation: {
                      ...settings.perturbation,
                      memoryPressureSimulation: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-violet-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Interface & Motion Controls */}
        <div className="rounded-lg bg-[#0f0d18] border border-[rgba(139,92,246,0.14)] p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-[rgba(139,92,246,0.12)]">
            <Palette className="w-4 h-4 text-violet-400" />
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Interface &amp; Motion Controls
              </h3>
              <p className="text-xs text-zinc-400">
                Control animations and reduced-motion preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)]">
              <label htmlFor="theme-reduced-motion" className="cursor-pointer">
                <span className="text-zinc-200 font-medium block">Reduced Motion Mode</span>
                <span className="text-zinc-400 text-[10px]">Disable all page transitions &amp; 3D rotation</span>
              </label>
              <input
                id="theme-reduced-motion"
                type="checkbox"
                checked={settings.theme.reducedMotion}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: {
                      ...settings.theme,
                      reducedMotion: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-violet-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)]">
              <label htmlFor="theme-particles" className="cursor-pointer">
                <span className="text-zinc-200 font-medium block">3D Phase-Space Inspector</span>
                <span className="text-zinc-400 text-[10px]">Render WebGL execution variance topology</span>
              </label>
              <input
                id="theme-particles"
                type="checkbox"
                checked={settings.theme.particlesEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: {
                      ...settings.theme,
                      particlesEnabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-violet-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
