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
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 flex items-center space-x-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center space-x-1 underline cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Fill with Sample Flaky Test</span>
          </button>
        </div>

        {/* Test Identifier */}
        <div>
          <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
            Test Identifier *
          </label>
          <input
            type="text"
            required
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g. TestAsyncConnectionPoolDrainUnderLoad"
            className="w-full px-3 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.16)] text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* File Path */}
        <div>
          <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
            Test File Path *
          </label>
          <input
            type="text"
            required
            value={testFile}
            onChange={(e) => setTestFile(e.target.value)}
            placeholder="e.g. services/gateway/pool_test.go"
            className="w-full px-3 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.16)] text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Repository & Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
              Target Repository
            </label>
            <select
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.16)] text-zinc-200 text-xs font-mono focus:outline-none focus:border-violet-500/50 cursor-pointer"
            >
              {MOCK_REPOSITORIES.map((repo) => (
                <option key={repo.id} value={repo.name} className="bg-[#0f0d18]">
                  {repo.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
              Target Git Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-3 py-1.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.16)] text-zinc-100 text-xs font-mono focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        {/* Iterations & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
              Reproduction Iterations ({iterations} runs)
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
              <span>10 runs</span>
              <span>50 runs</span>
              <span>100 runs</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    priority === p
                      ? p === "HIGH"
                        ? "bg-red-950/60 border-red-500/50 text-red-300 font-semibold"
                        : p === "MEDIUM"
                        ? "bg-amber-950/60 border-amber-500/50 text-amber-300 font-semibold"
                        : "bg-violet-950/60 border-violet-500/50 text-violet-200 font-semibold"
                      : "bg-[#090812] border-[rgba(139,92,246,0.12)] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="p-2.5 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] text-[11px] font-mono text-zinc-400 flex items-start space-x-2">
          <ShieldAlert className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          <span>
            Telemetry note: The investigation pipeline will execute in Simulated Mock Adapter mode with synthetic thread interleaving and fuzz seeds.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[rgba(139,92,246,0.12)] flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium font-mono transition-colors cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.35)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Initializing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Start Investigation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
