"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2, Sparkles, AlertCircle, ShieldAlert } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/services/api";
import { MOCK_REPOSITORIES } from "@/mock/data";

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export function NewInvestigationModal({
  isOpen,
  onClose,
  onCreated,
}: NewInvestigationModalProps) {
  const router = useRouter();
  const [testName, setTestName] = useState("");
  const [testFile, setTestFile] = useState("");
  const [repository, setRepository] = useState(MOCK_REPOSITORIES[0]?.name || "mono-repo/api-core");
  const [branch, setBranch] = useState("main");
  const [iterations, setIterations] = useState(30);
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!testName.trim()) {
      setError("Test identifier or function name is required.");
      return;
    }
    if (!testFile.trim()) {
      setError("Source file path is required (e.g. pkg/auth/session_test.go).");
      return;
    }

    try {
      setIsSubmitting(true);
      const newInv = await api.createInvestigation({
        testName: testName.trim(),
        testFile: testFile.trim(),
        repository,
        branch: branch.trim() || "main",
        iterations: Number(iterations) || 20,
        priority,
      });

      setIsSubmitting(false);
      onClose();

      // Reset form
      setTestName("");
      setTestFile("");

      if (onCreated) {
        onCreated(newInv.id);
      } else {
        router.push(`/investigations/${newInv.id}`);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to initialize investigation");
    }
  };

  const handleQuickFill = () => {
    setTestName("TestKafkaPartitionRebalanceSkew");
    setTestFile("streaming/partition_test.go");
    setRepository("data-pipeline");
    setBranch("production");
    setIterations(50);
    setPriority("HIGH");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Launch Flaky Test Investigation"
      description="Initialize automated test repetition, delta-minimization, and root-cause analysis"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fill with Sample Flaky Test</span>
          </button>
        </div>

        {/* Test Identifier */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
            Test Identifier *
          </label>
          <input
            type="text"
            required
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g. TestAsyncConnectionPoolDrainUnderLoad"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
          />
        </div>

        {/* File Path */}
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
            Test File Path *
          </label>
          <input
            type="text"
            required
            value={testFile}
            onChange={(e) => setTestFile(e.target.value)}
            placeholder="e.g. services/gateway/pool_test.go"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Repository & Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Target Repository
            </label>
            <select
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all cursor-pointer"
            >
              {MOCK_REPOSITORIES.map((repo) => (
                <option key={repo.id} value={repo.name} className="bg-slate-900">
                  {repo.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Target Git Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            />
          </div>
        </div>

        {/* Iterations & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Reproduction Iterations ({iterations} runs)
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>10 runs</span>
              <span>50 runs</span>
              <span>100 runs</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
              Priority / Severity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-mono font-medium rounded-xl border transition-all cursor-pointer ${
                    priority === p
                      ? p === "HIGH"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_-2px_rgba(244,63,94,0.4)]"
                        : p === "MEDIUM"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_12px_-2px_rgba(251,191,36,0.4)]"
                        : "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_12px_-2px_rgba(0,229,255,0.4)]"
                      : "bg-slate-900/50 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulated Execution Disclaimer */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] font-mono text-slate-400 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Telemetry note: The investigation pipeline will execute in Simulated
            Mock Adapter mode with synthetic thread interleaving and fuzz seeds.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-semibold hover:from-emerald-400 hover:to-teal-300 transition-all duration-200 shadow-[0_0_20px_-3px_rgba(16,245,150,0.4)] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Investigation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
