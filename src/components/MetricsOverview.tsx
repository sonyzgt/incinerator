import React from 'react';
import { Activity, Flame, Coins, ShoppingBag, ShieldCheck, Zap, Layers } from 'lucide-react';
import { FlywheelState } from '../types';

interface MetricsOverviewProps {
  state: FlywheelState;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ state }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  const burnedPercent = state.burnedPercentageOfSupply;

  return (
    <div className="w-full bg-[#080B10] border border-cyan-500/20 rounded-xl overflow-hidden shadow-lg">
      {/* Telemetry Strip Banner */}
      <div className="bg-[#05070A] border-b border-zinc-800/80 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-2 text-zinc-400">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="font-oxanium text-cyan-400 font-bold uppercase tracking-wider">LIVE TELEMETRY STREAM</span>
          <span className="text-zinc-600">//</span>
          <span className="text-zinc-400">PONS PROTOCOL ON-CHAIN SYNC</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-500">
          <span>CYCLES: <strong className="text-white font-mono">{state.cycleCount}</strong></span>
          <span className="text-zinc-700">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            FEED: NORMAL
          </span>
        </div>
      </div>

      {/* Main Telemetry Instruments Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-zinc-800/60">
        {/* 1. TOTAL FEES CLAIMED */}
        <div className="p-3.5 sm:p-4 bg-[#080B10]/90 flex flex-col justify-between group hover:bg-[#0A0E15] transition-colors relative">
          <div className="flex items-center justify-between text-[10px] font-oxanium tracking-wider text-zinc-400 uppercase">
            <span>SYS.FEE_CLAIMED</span>
            <span className="text-cyan-400 text-[9px] font-mono">01</span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-orbitron text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                {state.totalFeesClaimedETH.toFixed(4)}
              </span>
              <span className="text-[10px] font-oxanium text-cyan-400 font-bold">ETH</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
              ≈ ${formatNumber(state.totalFeesClaimedUSD)} USD
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">ESCROW WAITING:</span>
            <span className="text-orange-400 font-semibold">{state.currentEscrowBalanceETH.toFixed(4)} ETH</span>
          </div>
        </div>

        {/* 2. BUYBACK VOLUME */}
        <div className="p-3.5 sm:p-4 bg-[#080B10]/90 flex flex-col justify-between group hover:bg-[#0A0E15] transition-colors relative">
          <div className="flex items-center justify-between text-[10px] font-oxanium tracking-wider text-zinc-400 uppercase">
            <span>SYS.BUYBACK_VOL</span>
            <span className="text-emerald-400 text-[9px] font-mono">02</span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-orbitron text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                {formatNumber(state.totalTokensBoughtBack)}
              </span>
              <span className="text-[10px] font-oxanium text-emerald-400 font-bold">JEV</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
              100% REINVESTED ON CURVE
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">EXECUTION:</span>
            <span className="text-emerald-400 font-semibold">{state.cycleCount} AUTONOMOUS</span>
          </div>
        </div>

        {/* 3. TOTAL BURNED */}
        <div className="p-3.5 sm:p-4 bg-[#080B10]/90 flex flex-col justify-between group hover:bg-[#0A0E15] transition-colors relative">
          <div className="flex items-center justify-between text-[10px] font-oxanium tracking-wider text-zinc-400 uppercase">
            <span>SYS.INCINERATED</span>
            <span className="text-rose-400 text-[9px] font-mono">03</span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-orbitron text-xl sm:text-2xl font-bold tracking-tight text-rose-400 group-hover:text-rose-300 transition-colors">
                {formatNumber(state.totalTokensBurned)}
              </span>
              <span className="text-[10px] font-oxanium text-rose-400 font-bold">JEV</span>
            </div>

            {/* Cyber Segment Progress Indicator */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex-1 h-1 bg-zinc-800 rounded-none overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, burnedPercent)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-rose-400 font-bold">
                {burnedPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">DEAD SINK:</span>
            <span className="text-zinc-300 font-semibold">0x0...dEaD</span>
          </div>
        </div>

        {/* 4. MARKET VALUATION & POOL */}
        <div className="p-3.5 sm:p-4 bg-[#080B10]/90 flex flex-col justify-between group hover:bg-[#0A0E15] transition-colors relative">
          <div className="flex items-center justify-between text-[10px] font-oxanium tracking-wider text-zinc-400 uppercase">
            <span>SYS.MARKET_CAP</span>
            <span className="text-cyan-400 text-[9px] font-mono">04</span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-orbitron text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                ${formatNumber(state.marketCapUSD)}
              </span>
              <span className="text-[10px] font-oxanium text-cyan-400 font-bold">USD</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
              ${state.tokenPriceUSD.toFixed(6)} / JEV
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">BONDING CURVE:</span>
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              ROBINHOOD DEX
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
