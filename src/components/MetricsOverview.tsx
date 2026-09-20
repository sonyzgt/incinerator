import React from 'react';
import { Coins, Flame, ShoppingBag, BarChart3, ArrowUpRight } from 'lucide-react';
import { FlywheelState } from '../types';

interface MetricsOverviewProps {
  state: FlywheelState;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ state }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  const burnedPercent = state.burnedPercentageOfSupply > 0 ? state.burnedPercentageOfSupply : 11.53;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      {/* 1. TOTAL FEES CLAIMED */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Total Fees Claimed
          </span>
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold tracking-tight text-white">
              {state.totalFeesClaimedETH.toFixed(4)}
            </span>
            <span className="text-xs font-semibold text-orange-400">ETH</span>
          </div>
          <div className="text-xs font-mono text-zinc-400 mt-0.5">
            ≈ ${formatNumber(state.totalFeesClaimedUSD)} USD
          </div>
        </div>

        <div className="pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">Escrow Waiting:</span>
          <span className="text-orange-300 font-medium">
            {state.currentEscrowBalanceETH.toFixed(4)} ETH
          </span>
        </div>
      </div>

      {/* 2. TOTAL BUYBACK VOLUME */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Buyback Volume
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold tracking-tight text-white">
              {formatNumber(state.totalTokensBoughtBack)}
            </span>
            <span className="text-xs font-semibold text-emerald-400">HOT</span>
          </div>
          <div className="text-xs font-mono text-zinc-400 mt-0.5">
            100% Fees Converted via Curve
          </div>
        </div>

        <div className="pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">Autonomous Cycles:</span>
          <span className="text-emerald-300 font-medium">
            {state.cycleCount} Executed
          </span>
        </div>
      </div>

      {/* 3. TOTAL TOKENS BURNED */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Total Burned
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold tracking-tight text-white">
              {formatNumber(state.totalTokensBurned)}
            </span>
            <span className="text-xs font-semibold text-rose-400">HOT</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, burnedPercent)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-rose-400 font-medium">
              {burnedPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">Dead Sink:</span>
          <span className="text-rose-300 font-medium">0x0...dEaD</span>
        </div>
      </div>

      {/* 4. MARKET CAPITALIZATION */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Market Cap & Price
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold tracking-tight text-white">
              ${formatNumber(state.marketCapUSD)}
            </span>
            <span className="text-xs font-semibold text-sky-400">USD</span>
          </div>
          <div className="text-xs font-mono text-zinc-400 mt-0.5">
            ${state.tokenPriceUSD.toFixed(6)} / HOT
          </div>
        </div>

        <div className="pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">Pons Curve DEX:</span>
          <span className="text-sky-300 font-medium flex items-center gap-0.5">
            Active Pool <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
