import React, { useState } from 'react';
import {
  Flame,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Radio,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { PONS_V2_CONFIG } from '../contracts';

interface TopBroadcastBannerProps {
  totalBurnedFormatted: string;
  burnedPercent: number;
  totalFeesClaimedETH: number;
}

export const TopBroadcastBanner: React.FC<TopBroadcastBannerProps> = ({
  totalBurnedFormatted,
  burnedPercent,
  totalFeesClaimedETH,
}) => {
  const tickerItems = [
    `${totalBurnedFormatted} TOKENS PERMANENTLY INCINERATED (${burnedPercent.toFixed(2)}% OF TOTAL SUPPLY)`,
    `100% PROGRAMMATIC REINVESTMENT • ZERO HUMAN INTERVENTION`,
    `${totalFeesClaimedETH.toFixed(4)} ETH SWEPT DIRECTLY INTO DEX BUYBACKS`,
    `CANONICAL ESCROW DAEMON ACTIVE 24/7`,
    `ROBINHOOD MAINNET [CHAIN ID: 4663] • ZERO ADMIN PRIVATE KEYS`,
  ];

  return (
    <div className="w-full bg-[#05080f] border-b border-cyan-500/20 text-xs font-mono text-zinc-300 overflow-hidden relative select-none">
      {/* Subtle Shimmer highlight line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto flex items-center h-8 px-4">
        {/* Fixed Beacon Badge */}
        <div className="shrink-0 flex items-center gap-1.5 pr-4 border-r border-white/[0.08] text-[10px] uppercase tracking-wider font-semibold text-cyan-400 bg-[#05080f] z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
          <span className="hidden sm:inline">LIVE BROADCAST</span>
          <span className="sm:hidden">LIVE</span>
        </div>

        {/* Marquee Ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            {tickerItems.concat(tickerItems).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 mx-6 text-[11px] text-zinc-300 font-medium"
              >
                <span>{item}</span>
                <span className="text-zinc-600">&bull;</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface HeroHighlightBannerProps {
  tokenAddress: string;
  curveAddress: string;
}

export const HeroHighlightBanner: React.FC<HeroHighlightBannerProps> = ({
  tokenAddress,
  curveAddress,
}) => {
  const [copied, setCopied] = useState(false);

  const copyCA = () => {
    if (!tokenAddress) return;
    navigator.clipboard.writeText(tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#080e18]/80 via-[#050912]/60 to-[#03050a] border border-cyan-500/25 p-5 sm:p-7 relative overflow-hidden shadow-[0_8px_32px_rgba(0,240,255,0.06)]">
      {/* Futuristic corner tick marks */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Radial Ambient Glow */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] tracking-widest uppercase font-semibold">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>ROBINHOOD MAINNET // PONS v2 PROTOCOL</span>
          </div>

          <h2 className="font-orbitron font-extrabold text-lg sm:text-2xl text-white tracking-wide leading-snug">
            PERPETUAL AUTONOMOUS VALUE-ACCRETION ENGINE
          </h2>

          <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed">
            Every transaction fee generated on Pons Curve is programmatically deposited into the FeeEscrow vault,
            automatically claimed at threshold, swapped back on DEX, and sent directly to the permanent burn sink.
          </p>
        </div>

        {/* Quick Actions / Verified Links */}
        <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0 self-start md:self-auto font-mono text-xs">
          <button
            onClick={copyCA}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-cyan-400/50 text-zinc-200 transition-all cursor-pointer group"
          >
            <span className="text-zinc-500 text-[10px]">CA:</span>
            <span className="font-bold text-white">
              {tokenAddress ? `${tokenAddress.substring(0, 6)}...${tokenAddress.substring(tokenAddress.length - 4)}` : '—'}
            </span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-300 transition-colors" />
            )}
          </button>

          <a
            href={`https://explorer.mainnet.chain.robinhood.com/address/${curveAddress || PONS_V2_CONFIG.contracts.curve}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 border border-white/[0.1] hover:border-cyan-500/30 text-zinc-300 hover:text-cyan-300 transition-all"
          >
            <span className="font-oxanium font-bold text-xs">DEX BONDING CURVE</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400" />
          </a>
        </div>
      </div>
    </div>
  );
};

interface DeflationaryMilestoneBannerProps {
  totalBurnedFormatted: string;
  burnedPercent: number;
  deadAddress: string;
}

export const DeflationaryMilestoneBanner: React.FC<DeflationaryMilestoneBannerProps> = ({
  totalBurnedFormatted,
  burnedPercent,
  deadAddress,
}) => {
  const [copiedDead, setCopiedDead] = useState(false);

  const copyDead = () => {
    navigator.clipboard.writeText(deadAddress);
    setCopiedDead(true);
    setTimeout(() => setCopiedDead(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-rose-950/30 via-[#0a070c] to-[#05070f] border border-rose-500/25 p-5 sm:p-6 relative overflow-hidden shadow-xl">
      {/* Background radial glow */}
      <div className="absolute right-0 top-0 w-80 h-full bg-rose-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wide">
                PERMANENT SUPPLY INCINERATION
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold uppercase">
                DEFLATIONARY
              </span>
            </div>

            <p className="text-xs font-mono text-zinc-400">
              <span className="font-orbitron font-bold text-rose-400 text-sm">
                {totalBurnedFormatted} TOKENS
              </span>{' '}
              permanently removed from circulation forever.
            </p>

            {/* Visual Burn Gauge */}
            <div className="pt-2 max-w-md">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                <span>CIRCULATION BURNED:</span>
                <span className="text-rose-400 font-bold">{burnedPercent.toFixed(2)}% / 1,000,000,000 TOKENS</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(5, burnedPercent))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dead Sink Verification */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0 font-mono text-xs">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            CANONICAL DEAD SINK:
          </span>
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-zinc-300 text-[11px]">
              0x000...dEaD
            </span>
            <button
              onClick={copyDead}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-0.5"
              title="Copy Dead Sink Address"
            >
              {copiedDead ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            <a
              href={`https://explorer.mainnet.chain.robinhood.com/address/${deadAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-rose-300 transition-colors p-0.5"
              title="Verify on Robinhood Explorer"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CommunityEcosystemBannerProps {
  tokenAddress: string;
}

export const CommunityEcosystemBanner: React.FC<CommunityEcosystemBannerProps> = ({
  tokenAddress,
}) => {
  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-[#060a14] via-[#080d1a] to-[#05070d] border border-cyan-500/20 p-6 relative overflow-hidden shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1.5">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wider">
              100% VERIFIED & ON-CHAIN AUTONOMOUS
            </h3>
          </div>
          <p className="text-xs font-mono text-zinc-400 max-w-xl">
            No administrator can pause the flywheel or withdraw funds. Follow live burn notifications
            and community updates directly on official channels.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <a
            href="https://x.com/incinerator_rh"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] hover:border-cyan-400/50 text-white font-bold transition-all group"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="font-oxanium">@incinerator_rh</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-white" />
          </a>

          <a
            href={`https://explorer.mainnet.chain.robinhood.com/token/${tokenAddress}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold transition-all"
          >
            <span className="font-oxanium">EXPLORER</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
