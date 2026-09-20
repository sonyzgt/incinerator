import React, { useState } from 'react';
import { Flame, Copy, Check, ExternalLink, BookOpen, Shield } from 'lucide-react';
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
    <header className="w-full bg-[#090c12]/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 p-[1px] shadow-[0_0_15px_rgba(249,115,22,0.3)] shrink-0">
            <div className="w-full h-full bg-[#0a0d14] rounded-[7px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-tight text-white">
                HOT
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                FLYWHEEL v2
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Autonomous Buyback & Permanent Incineration Protocol
            </p>
          </div>
        </div>

        {/* Live Metrics & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Token Price Ticker */}
          <div className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-200 hidden md:flex items-center gap-1.5">
            <span className="text-zinc-400">${config.tokenSymbol}:</span>
            <span className="text-white font-semibold">${tokenPriceUSD.toFixed(6)}</span>
          </div>

          {/* Network Badge */}
          <div className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 hidden sm:flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Robinhood Chain</span>
          </div>

          {/* Token CA Copy Pill */}
          {isConfigured ? (
            <button
              onClick={copyCA}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 transition-all cursor-pointer group"
              title="Click to copy contract address"
            >
              <span className="text-zinc-400 group-hover:text-orange-400 transition-colors">CA:</span>
              <span>
                {config.tokenAddress.substring(0, 6)}...{config.tokenAddress.substring(config.tokenAddress.length - 4)}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              )}
            </button>
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
              <span>CA: None</span>
            </div>
          )}

          {/* Quick Links */}
          <a
            href="/docs"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 transition-colors flex items-center gap-1.5"
            title="Read Documentation"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Docs</span>
          </a>

          <a
            href="/memex"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 transition-colors flex items-center gap-1.5"
            title="Admin Portal"
          >
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Admin</span>
          </a>
        </div>
      </div>
    </header>
  );
};
