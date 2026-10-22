"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronRight,
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
    <div className={cn("flex flex-col rounded-lg overflow-hidden bg-[#090812] border border-[rgba(139,92,246,0.14)]", className)}>
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#0f0d18] border-b border-[rgba(139,92,246,0.12)] gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log messages or source packages..."
            className="w-full pl-8 pr-3 py-1 rounded bg-[#090812] border border-[rgba(139,92,246,0.12)] text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Level Filters & Copy Button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#090812] p-0.5 rounded border border-[rgba(139,92,246,0.12)] text-[11px] font-mono">
            {["ALL", "ERROR", "WARN", "INFO", "DEBUG"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={cn(
                  "px-2 py-0.5 rounded transition-colors cursor-pointer",
                  levelFilter === lvl
                    ? "bg-violet-950/50 text-violet-200 font-semibold border border-violet-500/40"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopyLogs}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#141122] hover:bg-[#1c172e] text-zinc-300 text-xs font-mono border border-[rgba(139,92,246,0.16)] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" />
                <span>Copy Logs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Stack Trace Section */}
      {stackTrace && (
        <div className="border-b border-[rgba(139,92,246,0.12)] bg-red-950/20">
          <button
            type="button"
            onClick={() => setShowStackTrace(!showStackTrace)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-left font-mono text-xs text-red-300 hover:bg-red-900/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="font-semibold">Captured Panic &amp; Goroutine Stack Trace</span>
            </div>
            {showStackTrace ? (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          {showStackTrace && (
            <div
              data-lenis-prevent
              className="p-3 bg-[#08070d] font-mono text-xs text-red-300 overflow-x-auto border-t border-red-900/30 max-h-56 leading-relaxed"
            >
              <pre>{stackTrace}</pre>
            </div>
          )}
        </div>
      )}

      {/* Terminal Log Console */}
      <div
        data-lenis-prevent
        className="p-2.5 font-mono text-xs overflow-x-auto max-h-96 min-h-64 space-y-0.5"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 font-mono text-xs">
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
                  "flex items-start space-x-2 py-0.5 px-1.5 rounded hover:bg-zinc-800/20 transition-colors",
                  isError && "bg-red-950/20 text-red-300",
                  isWarn && "bg-amber-950/15 text-amber-300",
                  isInfo && "text-zinc-300",
                  isDebug && "text-zinc-400"
                )}
              >
                {/* Line number */}
                <span className="text-zinc-500 select-none text-[10px] w-6 text-right shrink-0">
                  {index + 1}
                </span>

                {/* Timestamp */}
                <span className="text-zinc-400 select-none text-[11px] shrink-0 hidden sm:inline">
                  {log.timestamp.split("T")[1]?.replace("Z", "") || log.timestamp}
                </span>

                {/* Level Tag */}
                <span
                  className={cn(
                    "text-[9px] font-semibold px-1 py-0.2 rounded shrink-0 select-none uppercase",
                    isError && "bg-red-950/60 text-red-400 border border-red-800/60",
                    isWarn && "bg-amber-950/60 text-amber-400 border border-amber-800/60",
                    isInfo && "bg-zinc-800 text-zinc-300 border border-zinc-700",
                    isDebug && "bg-zinc-900 text-zinc-400 border border-zinc-800"
                  )}
                >
                  {log.level}
                </span>

                {/* Source module */}
                {log.source && (
                  <span className="text-zinc-400 text-[11px] shrink-0 hidden md:inline">
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
