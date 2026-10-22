"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  Terminal,
  Filter,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { LogEntry } from "@/types";
import { cn } from "@/lib/utils";

interface LogViewerProps {
  logs: LogEntry[];
  stackTrace?: string;
  className?: string;
}

export function LogViewer({ logs, stackTrace, className }: LogViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);
  const [showStackTrace, setShowStackTrace] = useState(true);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (levelFilter !== "ALL" && l.level !== levelFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          l.message.toLowerCase().includes(q) ||
          (l.source && l.source.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [logs, levelFilter, searchQuery]);

  const handleCopyLogs = async () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.source ? `(${l.source}) ` : ""}${l.message}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex flex-col rounded-xl overflow-hidden bg-slate-950/90 border border-white/10", className)}>
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-900/90 border-b border-white/10 gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within logs (regex or string)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
          />
        </div>

        {/* Level Filters & Copy Button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/10 text-[11px] font-mono">
            {["ALL", "ERROR", "WARN", "INFO", "DEBUG"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={cn(
                  "px-2 py-1 rounded transition-colors cursor-pointer",
                  levelFilter === lvl
                    ? "bg-cyan-500/20 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopyLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-mono border border-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Logs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Stack Trace Section */}
      {stackTrace && (
        <div className="border-b border-white/10 bg-rose-950/20">
          <button
            type="button"
            onClick={() => setShowStackTrace(!showStackTrace)}
            className="w-full flex items-center justify-between px-4 py-2 text-left font-mono text-xs text-rose-300 hover:bg-rose-900/20 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">Captured Panic &amp; Goroutine Stack Trace</span>
            </div>
            {showStackTrace ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {showStackTrace && (
            <div className="p-3 bg-black/80 font-mono text-xs text-rose-300 overflow-x-auto border-t border-rose-500/20 max-h-56 leading-relaxed">
              <pre>{stackTrace}</pre>
            </div>
          )}
        </div>
      )}

      {/* Terminal Log Console */}
      <div data-lenis-prevent className="p-3 font-mono text-xs overflow-x-auto max-h-96 min-h-64 space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-mono text-xs">
            No matching log entries found for current query.
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const isError = log.level === "ERROR";
            const isWarn = log.level === "WARN";
            const isInfo = log.level === "INFO";
            const isDebug = log.level === "DEBUG";

            return (
              <div
                key={index}
                className={cn(
                  "flex items-start space-x-3 py-1 px-2 rounded hover:bg-white/5 transition-colors group",
                  isError && "bg-rose-500/10 text-rose-300",
                  isWarn && "bg-amber-500/5 text-amber-300",
                  isInfo && "text-slate-300",
                  isDebug && "text-slate-400"
                )}
              >
                {/* Line number */}
                <span className="text-slate-600 select-none text-[10px] w-6 text-right shrink-0">
                  {index + 1}
                </span>

                {/* Timestamp */}
                <span className="text-slate-500 select-none text-[11px] shrink-0 hidden sm:inline">
                  {log.timestamp.split("T")[1]?.replace("Z", "") || log.timestamp}
                </span>

                {/* Level Tag */}
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 select-none uppercase",
                    isError && "bg-rose-500/30 text-rose-300 border border-rose-500/40",
                    isWarn && "bg-amber-500/30 text-amber-300 border border-amber-500/40",
                    isInfo && "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
                    isDebug && "bg-slate-800 text-slate-400"
                  )}
                >
                  {log.level}
                </span>

                {/* Source module */}
                {log.source && (
                  <span className="text-cyan-400/80 text-[11px] shrink-0 hidden md:inline">
                    [{log.source}]
                  </span>
                )}

                {/* Log Message */}
                <span className="text-xs break-all leading-relaxed flex-1">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
