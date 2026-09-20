import React from 'react';
import { ActivityLog } from '../types';
import { Terminal, CheckCircle2, ArrowUpRight, Radio, ExternalLink } from 'lucide-react';

interface LiveLogsProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
}

export const LiveLogs: React.FC<LiveLogsProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="rounded-2xl bg-[#080B10] border border-cyan-500/25 overflow-hidden flex flex-col h-[340px] shadow-2xl relative">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-400 pointer-events-none" />

      {/* Futuristic Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#05070A] border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-orbitron font-bold text-xs tracking-wider text-white">
            LIVE ON-CHAIN TELEMETRY
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
            RH-4663
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider">STREAMING</span>
          </div>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              [CLEAR]
            </button>
          )}
        </div>
      </div>

      {/* Terminal Log Stream */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 bg-[#06080D]">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-600 italic">
            // Awaiting on-chain event broadcast... Autonomous cycles stream live here.
          </div>
        ) : (
          logs.map((log) => {
            let badgeClass = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25';
            if (log.phase === 'claim') badgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/25';
            if (log.phase === 'buyback') badgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
            if (log.phase === 'burn') badgeClass = 'text-rose-400 bg-rose-500/10 border-rose-500/25';

            return (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-[#080C14] border border-zinc-800/80 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start sm:items-center gap-2 overflow-hidden">
                  <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={`text-[9px] uppercase font-oxanium font-bold px-1.5 py-0.5 rounded border shrink-0 ${badgeClass}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-zinc-200 text-xs truncate font-sans font-medium">
                    {log.details}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-[10px] self-end sm:self-auto text-zinc-400">
                  {log.contractTarget && (
                    <span className="px-1.5 py-0.5 bg-[#05070A] rounded border border-zinc-800 text-zinc-400 font-mono">
                      {log.contractTarget}
                    </span>
                  )}
                  {log.txHash && log.txHash.startsWith('0x') ? (
                    <a
                      href={`https://explorer.mainnet.chain.robinhood.com/tx/${log.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5 transition-colors"
                      title="View transaction on Robinhood Explorer"
                    >
                      <span>tx:{log.txHash.substring(0, 6)}...{log.txHash.substring(log.txHash.length - 4)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="font-mono text-zinc-500">
                      tx:{log.txHash.substring(0, 6)}...{log.txHash.substring(log.txHash.length - 4)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>CONFIRMED</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
