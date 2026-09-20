import React from 'react';
import { ActivityLog } from '../types';
import { Terminal, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface LiveLogsProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
}

export const LiveLogs: React.FC<LiveLogsProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="rounded-2xl bg-[#0c1017] border border-zinc-800/80 overflow-hidden flex flex-col h-[320px] shadow-sm">
      {/* Sleek Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#090c12] border-b border-zinc-800/70">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80"></span>
          </div>
          <Terminal className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-mono font-semibold tracking-wider text-zinc-200">
            ON-CHAIN TELEMETRY CONSOLE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium">STREAMING</span>
          </div>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Terminal Log Stream */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1.5 bg-[#080a0f]">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-600 italic">
            Awaiting blockchain events... Real-time cycles will stream here.
          </div>
        ) : (
          logs.map((log) => {
            let badgeClass = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
            if (log.phase === 'claim') badgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            if (log.phase === 'buyback') badgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            if (log.phase === 'burn') badgeClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';

            return (
              <div
                key={log.id}
                className="p-2 rounded-lg bg-[#0e121a] border border-zinc-800/60 hover:border-zinc-700/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
              >
                <div className="flex items-start sm:items-center gap-2 overflow-hidden">
                  <span className="text-[10px] text-zinc-500 shrink-0 font-mono">{log.timestamp}</span>
                  <span
                    className={`text-[9px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 ${badgeClass}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-zinc-300 text-xs truncate">
                    {log.details}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-[10px] self-end sm:self-auto text-zinc-400">
                  {log.contractTarget && (
                    <span className="px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-zinc-400">
                      {log.contractTarget}
                    </span>
                  )}
                  <span className="font-mono text-zinc-500">
                    tx: {log.txHash.substring(0, 6)}...{log.txHash.substring(log.txHash.length - 4)}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
