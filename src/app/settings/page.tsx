"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Settings,
  Server,
  GitBranch,
  Flame,
  Bell,
  Palette,
  Check,
  Save,
  Radio,
  RefreshCw,
  Cpu,
  Shield,
  HelpCircle,
  FileCode,
} from "lucide-react";
import { api } from "@/services/api";
import { PlatformSettings } from "@/types";
import { cn } from "@/lib/utils";

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
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
          <p className="text-sm text-slate-400">Loading platform preferences...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form onSubmit={handleSave} className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Configuration Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Platform &amp; Engine Settings
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Test execution parameters, chaos perturbations, and Django API configuration
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {saveSuccess && (
              <span className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Preferences Saved</span>
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-mono text-xs font-bold hover:from-emerald-400 hover:to-teal-300 transition-all shadow-[0_0_20px_-3px_rgba(16,245,150,0.4)] cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>

        {/* 1. API & Backend Adapter Status */}
        <GlassPanel hasCorners glow="cyan" className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <Server className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Backend Architecture &amp; API Contract
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Django REST Framework integration layer
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
              ACTIVE: MOCK ADAPTER
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 uppercase tracking-wider mb-1.5">
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
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Configured via NEXT_PUBLIC_API_URL or overridden locally.
              </span>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handlePingBackend}
                disabled={isTestingApi}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors cursor-pointer"
              >
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>
                  {isTestingApi ? "Testing Connection..." : "Test Backend Connection"}
                </span>
              </button>
            </div>
          </div>

          {apiTestResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-start space-x-2 ${
                apiTestResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-slate-900/90 border-white/10 text-slate-300"
              }`}
            >
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
              <div>
                <span className="font-bold block">
                  Latency: {apiTestResult.latencyMs}ms
                </span>
                <span>{apiTestResult.message}</span>
              </div>
            </div>
          )}

          {/* DRF Contract Specs Drawer */}
          <div className="mt-4 p-4 rounded-xl bg-black/50 border border-white/5 space-y-2 text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider block text-[11px] font-bold">
              Django REST Framework Contract Specification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 text-[11px]">
              <div>&bull; <code className="text-cyan-300">GET /api/v1/dashboard/metrics/</code></div>
              <div>&bull; <code className="text-cyan-300">GET /api/v1/investigations/</code></div>
              <div>&bull; <code className="text-cyan-300">POST /api/v1/investigations/</code></div>
              <div>&bull; <code className="text-cyan-300">GET /api/v1/investigations/:id/</code></div>
              <div>&bull; <code className="text-cyan-300">POST /api/v1/investigations/:id/verify/</code></div>
              <div>&bull; <code className="text-cyan-300">GET /api/v1/tests/</code></div>
            </div>
          </div>
        </GlassPanel>

        {/* 2. Test Execution & Reproduction Preferences */}
        <GlassPanel hasCorners className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Test Execution &amp; Fuzzing Preferences
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Concurrency quotas and seed generation engines
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
            <div>
              <label className="block text-slate-300 uppercase tracking-wider mb-1.5">
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
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase tracking-wider mb-1.5">
                Parallel Execution Workers ({settings.testExecution.parallelWorkers} workers)
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
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase tracking-wider mb-1.5">
                PRNG Seed Generator
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
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
              >
                <option value="PCG64">PCG64 (Permuted Congruential - Recommended)</option>
                <option value="MERSENNE_TWISTER">Mersenne Twister (MT19937)</option>
                <option value="XOROSHIRO">Xoroshiro128++</option>
              </select>
            </div>
          </div>
        </GlassPanel>

        {/* 3. Chaos & Perturbation Settings */}
        <GlassPanel hasCorners className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Chaos &amp; Scheduler Perturbation Defaults
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Thread interleaving jitter, clock skew drift, and resource pressure
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-white font-bold block">Thread Jitter</span>
                <span className="text-slate-400 text-[11px]">Inject random OS context delays</span>
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
                className="w-4 h-4 accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase tracking-wider mb-1.5">
                Max Clock Skew Drift (&plusmn;{settings.perturbation.maxClockSkewMs}ms)
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
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-white font-bold block">Memory Pressure</span>
                <span className="text-slate-400 text-[11px]">Simulate heap spikes</span>
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
                className="w-4 h-4 accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </GlassPanel>

        {/* 4. Notification Preferences */}
        <GlassPanel hasCorners className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <Bell className="w-5 h-5 text-violet-400" />
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Developer Notifications &amp; Alerting
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Slack channels, PagerDuty integration, and fix alerts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 uppercase tracking-wider mb-1.5">
                Slack Webhook URL
              </label>
              <input
                type="text"
                value={settings.notifications.slackWebhookUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      slackWebhookUrl: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase tracking-wider mb-1.5">
                PagerDuty Integration Key
              </label>
              <input
                type="text"
                value={settings.notifications.pagerDutyKey}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      pagerDutyKey: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>
        </GlassPanel>

        {/* 5. Theme & Cinematic Atmosphere */}
        <GlassPanel hasCorners className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <Palette className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Visual Atmosphere &amp; Motion Controls
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Techfest-inspired cinematic rendering toggles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-white font-bold block">Atmospheric Lighting</span>
                <span className="text-slate-400 text-[11px]">Radial ambient glow</span>
              </div>
              <input
                type="checkbox"
                checked={settings.theme.atmosphericEffects}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: {
                      ...settings.theme,
                      atmosphericEffects: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-white font-bold block">HUD Coordinate Markers</span>
                <span className="text-slate-400 text-[11px]">Technical overlay</span>
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
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-white font-bold block">Reduced Motion Mode</span>
                <span className="text-slate-400 text-[11px]">Minimal animations</span>
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
                className="w-4 h-4 accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>
        </GlassPanel>
      </form>
    </AppShell>
  );
}
