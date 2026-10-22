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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1e2229] gap-3">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
              Engine &amp; Platform Configuration
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
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
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>

        {/* 1. API & Backend Adapter Status */}
        <div className="rounded-lg bg-[#111317] border border-[#1e2229] p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1e2229]">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-zinc-400" />
              <div>
                <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Backend Architecture &amp; API Contract
                </h3>
                <p className="text-xs text-zinc-400">
                  Django REST Framework adapter and live endpoint configuration
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-700">
              Active: Mock Adapter
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                DRF Endpoint Base URL
              </label>
              <input
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
                className="w-full px-3 py-1.5 rounded bg-[#0c0d10] border border-[#1e2229] text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-700"
              />
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                Configured via NEXT_PUBLIC_API_URL or overridden locally.
              </span>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handlePingBackend}
                disabled={isTestingApi}
                className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded bg-[#181c23] hover:bg-[#20252f] text-zinc-200 border border-[#2a303c] transition-colors cursor-pointer text-xs"
              >
                <Radio className="w-3.5 h-3.5 text-zinc-400" />
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
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : "bg-[#0c0d10] border-[#1e2229] text-zinc-300"
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
          <div className="mt-3 p-3 rounded bg-[#0c0d10] border border-[#1e2229] space-y-1.5 text-xs font-mono">
            <span className="text-zinc-400 uppercase tracking-wider block text-[10px] font-semibold">
              Django REST Framework Contract Specification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-zinc-400 text-[11px]">
              <div>&bull; <code className="text-zinc-200">GET /api/v1/dashboard/metrics/</code></div>
              <div>&bull; <code className="text-zinc-200">GET /api/v1/investigations/</code></div>
              <div>&bull; <code className="text-zinc-200">POST /api/v1/investigations/</code></div>
              <div>&bull; <code className="text-zinc-200">GET /api/v1/investigations/:id/</code></div>
              <div>&bull; <code className="text-zinc-200">POST /api/v1/investigations/:id/verify/</code></div>
              <div>&bull; <code className="text-zinc-200">GET /api/v1/tests/</code></div>
            </div>
          </div>
        </div>

        {/* 2. Test Execution & Reproduction Preferences */}
        <div className="rounded-lg bg-[#111317] border border-[#1e2229] p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-[#1e2229]">
            <Cpu className="w-4 h-4 text-zinc-400" />
            <div>
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Execution &amp; Seed Fuzzing Preferences
              </h3>
              <p className="text-xs text-zinc-400">
                Concurrency limits and pseudo-random seed generator algorithms
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                Max Reproduction Iterations ({settings.testExecution.maxReproductionIterations} runs)
              </label>
              <input
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
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                Parallel Workers ({settings.testExecution.parallelWorkers} workers)
              </label>
              <input
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
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                PRNG Seed Engine
              </label>
              <select
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
                className="w-full px-2.5 py-1.5 rounded bg-[#0c0d10] border border-[#1e2229] text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
              >
                <option value="PCG64">PCG64 (Permuted Congruential - Recommended)</option>
                <option value="MERSENNE_TWISTER">Mersenne Twister (MT19937)</option>
                <option value="XOROSHIRO">Xoroshiro128++</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Chaos & Perturbation Settings */}
        <div className="rounded-lg bg-[#111317] border border-[#1e2229] p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-[#1e2229]">
            <Flame className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Chaos &amp; Scheduler Perturbation Defaults
              </h3>
              <p className="text-xs text-zinc-400">
                Thread interleaving delays, clock skew, and artificial resource contention
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0c0d10] border border-[#1e2229]">
              <div>
                <span className="text-zinc-200 font-medium block">Thread Jitter</span>
                <span className="text-zinc-400 text-[10px]">Random context switch delays</span>
              </div>
              <input
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
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-zinc-300 uppercase tracking-wider mb-1 text-[11px]">
                Max Clock Skew (&plusmn;{settings.perturbation.maxClockSkewMs}ms)
              </label>
              <input
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
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#0c0d10] border border-[#1e2229]">
              <div>
                <span className="text-zinc-200 font-medium block">Memory Pressure</span>
                <span className="text-zinc-400 text-[10px]">Simulate heap spikes</span>
              </div>
              <input
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
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Interface & Motion Controls */}
        <div className="rounded-lg bg-[#111317] border border-[#1e2229] p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center space-x-2 pb-2.5 border-b border-[#1e2229]">
            <Palette className="w-4 h-4 text-zinc-400" />
            <div>
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Interface &amp; Motion Controls
              </h3>
              <p className="text-xs text-zinc-400">
                Control animations and reduced-motion preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#0c0d10] border border-[#1e2229]">
              <div>
                <span className="text-zinc-200 font-medium block">Reduced Motion Mode</span>
                <span className="text-zinc-400 text-[10px]">Disable all page transitions &amp; 3D rotation</span>
              </div>
              <input
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
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-[#0c0d10] border border-[#1e2229]">
              <div>
                <span className="text-zinc-200 font-medium block">3D Phase-Space Inspector</span>
                <span className="text-zinc-400 text-[10px]">Render WebGL execution variance topology</span>
              </div>
              <input
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
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
