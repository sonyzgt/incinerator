import React from 'react';
import { ActivityLog } from '../types';
import { Terminal, Radio, ExternalLink } from 'lucide-react';

interface LiveLogsProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
}

export const LiveLogs: React.FC<LiveLogsProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="rounded-2xl border-liquid-metal bg-[#0d0e14] overflow-hidden flex flex-col h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#141622]/80 backdrop-blur-md liquid-divider border-b">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-white" />
          <span className="font-mono font-bold text-xs tracking-wider text-white">
            INCINERATOR LOG STREAM
          </span>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#16171e] text-zinc-300 border-liquid-metal">
            ROBINHOOD [4663]
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider">LIVE</span>
          </div>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer px-2 py-0.5 rounded-full border-liquid-metal"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Terminal Log Stream */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 bg-[#090a0d]">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-500 italic">
            // Awaiting on-chain events... Autonomous burn cycles stream here.
          </div>
        ) : (
          logs.map((log) => {
            let badgeClass = 'text-zinc-300 bg-zinc-800/50 border-liquid-metal';
            if (log.phase === 'claim') badgeClass = 'text-amber-400 bg-amber-500/10 border-liquid-ember';
            if (log.phase === 'buyback') badgeClass = 'text-emerald-400 bg-emerald-500/10 border-liquid-metal';
            if (log.phase === 'burn') badgeClass = 'text-white bg-white/10 border border-white/30';

            return (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-[#11131a] border-liquid-metal hover:border-white/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start sm:items-center gap-2 overflow-hidden">
                  <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-zinc-200 truncate">{log.details}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[11px]">
                  {log.amountETH !== undefined && log.amountETH > 0 && (
                    <span className="text-emerald-400 font-bold">
                      {log.amountETH.toFixed(4)} ETH
                    </span>
                  )}
                  {log.amountToken !== undefined && log.amountToken > 0 && (
                    <span className="text-white font-bold">
                      {log.amountToken >= 1_000_000
                        ? `${(log.amountToken / 1_000_000).toFixed(2)}M`
                        : log.amountToken.toLocaleString()}
                    </span>
                  )}
                  {log.txHash && log.txHash.startsWith('0x') ? (
                    <a
                      href={`https://explorer.mainnet.chain.robinhood.com/tx/${log.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-zinc-300 hover:underline flex items-center gap-0.5 transition-colors"
                      title="View transaction on Robinhood Explorer"
                    >
                      <span>{log.txHash.substring(0, 6)}...{log.txHash.substring(log.txHash.length - 4)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-zinc-500">
                      {log.txHash ? `${log.txHash.substring(0, 6)}...${log.txHash.substring(log.txHash.length - 4)}` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
