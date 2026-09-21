import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, Terminal, ArrowUpRight } from 'lucide-react';
import { MachineConfig } from '../types';

interface HeaderProps {
  config: MachineConfig;
  tokenPriceUSD: number;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onNavigateDocs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  tokenPriceUSD,
  soundEnabled,
  onToggleSound,
  onNavigateDocs,
}) => {
  const [copied, setCopied] = useState(false);

  const copyCA = () => {
    if (!config.tokenAddress || config.tokenAddress.toLowerCase() === 'none') return;
    navigator.clipboard.writeText(config.tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConfigured = Boolean(
    config.tokenAddress &&
    config.tokenAddress.toLowerCase() !== 'none' &&
    config.tokenAddress.startsWith('0x') &&
    config.tokenAddress.length === 42
  );

  return (
    <header className="w-full border-b border-white/[0.06] sticky top-0 z-50 backdrop-blur-xl bg-[#05070a]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Identity */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center group-hover:border-cyan-400/60 transition-colors">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            </div>
            <span className="font-orbitron font-bold text-base tracking-wider text-white group-hover:text-cyan-300 transition-colors">
              INCINERATOR
            </span>
            <span className="text-zinc-600 font-mono text-xs select-none">//</span>
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase hidden sm:inline">
              AUTONOMOUS PROTOCOL
            </span>
          </a>
        </div>

        {/* Center: Minimal Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-400">
          <a href="#hero" className="hover:text-white transition-colors">
            OVERVIEW
          </a>
          <a href="#pipeline" className="hover:text-white transition-colors">
            PROTOCOL
          </a>
          <a href="#metrics" className="hover:text-white transition-colors">
            METRICS
          </a>
          <a href="#activity" className="hover:text-white transition-colors">
            ACTIVITY
          </a>
          <button
            onClick={onNavigateDocs}
            className="hover:text-white transition-colors cursor-pointer text-xs font-mono"
          >
            DOCS
          </button>
        </nav>

        {/* Right: Key Signals & Action Items */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
          {/* Token Price (Minimal) */}
          <div className="hidden lg:flex items-center gap-1.5 text-zinc-400">
            <span className="text-zinc-500 text-[10px]">PRICE</span>
            <span className="font-orbitron font-bold text-zinc-200">
              ${tokenPriceUSD > 0 ? tokenPriceUSD.toFixed(6) : '0.000085'}
            </span>
          </div>

          {/* Network Live Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 border-l border-white/[0.08] pl-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-zinc-300">ROBINHOOD</span>
          </div>

          {/* CA Copy Button (Clean Minimal) */}
          {isConfigured && (
            <button
              onClick={copyCA}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer text-xs"
              title="Copy official token address"
            >
              <span className="text-zinc-400 text-[10px]">CA</span>
              <span className="font-mono text-[11px]">
                {config.tokenAddress.substring(0, 4)}...{config.tokenAddress.substring(config.tokenAddress.length - 4)}
              </span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-zinc-400 hover:text-cyan-300 transition-colors" />
              )}
            </button>
          )}

          {/* Sound Toggle (if provided) */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute protocol audio' : 'Enable protocol audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
