import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Cpu, Terminal, Shield, Activity, Radio } from 'lucide-react';
import { MachineConfig } from '../types';

interface HeaderProps {
  config: MachineConfig;
  tokenPriceUSD: number;
}

export const Header: React.FC<HeaderProps> = ({ config, tokenPriceUSD }) => {
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
    <header className="w-full bg-[#05070A]/95 border-b border-cyan-500/20 sticky top-0 z-50 backdrop-blur-md">
      {/* Top Telemetry Micro-Bar */}
      <div className="border-b border-zinc-800/60 px-4 sm:px-8 py-1 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>RH-NET.4663 // PROTOCOL: PONS_V2</span>
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-zinc-400">CORE DAEMON: ACTIVE [24/7 AUTONOMOUS]</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">RPC LATENCY: <span className="text-emerald-400 font-semibold">12ms</span></span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            SYS.ONLINE
          </span>
        </div>
      </div>

      {/* Main Control Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Futuristic Brand Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#0A0E15] border border-cyan-500/40 p-1 flex items-center justify-center relative shadow-[0_0_12px_rgba(0,240,255,0.25)] shrink-0 group">
            <Cpu className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-black text-xl tracking-wider text-white text-glow-cyan">
                HOT
              </span>
              <span className="text-[9px] font-oxanium font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 tracking-widest uppercase">
                AUTONOMOUS ENGINE
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 tracking-wider">
              PROTOCOL STATE: <span className="text-emerald-400 font-semibold">● ACTIVE</span>
            </div>
          </div>
        </div>

        {/* System Control Instruments */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Token Price Ticker */}
          <div className="px-3 py-1.5 rounded bg-[#080B10] border border-zinc-800 text-xs font-mono text-zinc-300 hidden md:flex items-center gap-2">
            <span className="text-[10px] font-oxanium text-zinc-400 uppercase tracking-wider">$HOT PRICE:</span>
            <span className="text-cyan-300 font-bold font-orbitron text-xs">${tokenPriceUSD.toFixed(6)}</span>
          </div>

          {/* Network Indicator */}
          <div className="px-3 py-1.5 rounded bg-[#080B10] border border-zinc-800 text-xs font-mono text-zinc-300 hidden sm:flex items-center gap-2">
            <span className="text-[10px] font-oxanium text-zinc-400 uppercase tracking-wider">CHAIN:</span>
            <span className="text-white font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Robinhood
            </span>
          </div>

          {/* Contract Address Module */}
          {isConfigured ? (
            <button
              onClick={copyCA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#080B10] hover:bg-[#0E131C] border border-cyan-500/30 hover:border-cyan-400/60 text-xs font-mono text-zinc-300 transition-all cursor-pointer group"
              title="Click to copy official contract address"
            >
              <span className="text-[10px] font-oxanium text-cyan-400 uppercase tracking-wider">CA:</span>
              <span className="font-mono text-white">
                {config.tokenAddress.substring(0, 6)}...{config.tokenAddress.substring(config.tokenAddress.length - 4)}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-cyan-400/70 group-hover:text-cyan-300 transition-colors" />
              )}
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded bg-[#080B10] border border-zinc-800 text-xs font-mono text-zinc-500">
              <span>CA: UNCONFIGURED</span>
            </div>
          )}

          {/* System Docs Link */}
          <a
            href="/docs"
            className="p-2 sm:px-3 sm:py-1.5 rounded bg-[#080B10] hover:bg-[#0E131C] border border-zinc-800 hover:border-zinc-700 text-xs font-oxanium font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
            title="Protocol Documentation"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">DOCS</span>
          </a>

          {/* Admin /memex Link */}
          <a
            href="/memex"
            className="p-2 sm:px-3 sm:py-1.5 rounded bg-[#080B10] hover:bg-[#0E131C] border border-zinc-800 hover:border-zinc-700 text-xs font-oxanium font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
            title="System Command & Control"
          >
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">ADMIN</span>
          </a>
        </div>
      </div>
    </header>
  );
};
