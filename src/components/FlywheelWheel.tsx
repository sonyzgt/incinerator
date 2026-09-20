import React from 'react';
import { EnginePhase } from '../types';
import { TrendingUp, Coins, ShoppingCart, Flame, CheckCircle2, Play, Pause } from 'lucide-react';

interface FlywheelWheelProps {
  currentPhase: EnginePhase;
  phaseProgress: number;
  isWheelSpinning: boolean;
  cycleCount: number;
  currentEscrowBalanceETH: number;
  claimThresholdETH: number;
  lastActionText: string;
  onSelectPhase?: (phase: EnginePhase) => void;
  tokenAddress?: string;
}

interface PhaseInfo {
  id: EnginePhase;
  step: string;
  title: string;
  shortDesc: string;
  contract: string;
  color: string;
  glowColor: string;
  icon: React.ComponentType<{ className?: string }>;
  angleDeg: number;
}

const PHASES: PhaseInfo[] = [
  {
    id: 'accumulate',
    step: '01',
    title: 'Trade & Tax Inflow',
    shortDesc: 'Creator tax accumulating in Escrow',
    contract: 'Pons FeeEscrow',
    color: 'text-sky-400',
    glowColor: 'rgba(56, 189, 248, 0.2)',
    icon: TrendingUp,
    angleDeg: 270 // Top (12 o'clock)
  },
  {
    id: 'claim',
    step: '02',
    title: 'Auto-Claim Fee',
    shortDesc: 'Liquidating creator ETH rewards',
    contract: 'FeeEscrow.claim()',
    color: 'text-amber-400',
    glowColor: 'rgba(251, 191, 36, 0.2)',
    icon: Coins,
    angleDeg: 0 // Right (3 o'clock)
  },
  {
    id: 'buyback',
    step: '03',
    title: 'Curve DEX Buyback',
    shortDesc: 'Market buy tokens with claimed ETH',
    contract: 'curve.buy()',
    color: 'text-emerald-400',
    glowColor: 'rgba(52, 211, 153, 0.2)',
    icon: ShoppingCart,
    angleDeg: 90 // Bottom (6 o'clock)
  },
  {
    id: 'burn',
    step: '04',
    title: 'Permanent Incineration',
    shortDesc: 'Direct transfer to 0x0...dEaD sink',
    contract: 'transfer(0x0...dEaD)',
    color: 'text-rose-400',
    glowColor: 'rgba(244, 63, 94, 0.2)',
    icon: Flame,
    angleDeg: 180 // Left (9 o'clock)
  }
];

export const FlywheelWheel: React.FC<FlywheelWheelProps> = ({
  currentPhase,
  phaseProgress,
  isWheelSpinning,
  cycleCount,
  currentEscrowBalanceETH,
  claimThresholdETH,
  lastActionText,
  tokenAddress
}) => {
  const activeIndex = PHASES.findIndex((p) => p.id === currentPhase);
  const activePhase = PHASES[activeIndex] || PHASES[0];

  // SVG circular geometry
  const size = 340;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth - 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, phaseProgress)) / 100) * circumference;

  return (
    <div className="w-full rounded-2xl bg-[#0c1017] border border-zinc-800/80 p-5 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl transition-all duration-700"
        style={{ background: activePhase.glowColor }}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800/60 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
              Autonomous Flywheel HUD
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              CYCLE #{cycleCount}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            4-Step Autonomous State Machine on Robinhood Chain
          </p>
        </div>

        {/* Live Engine Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isWheelSpinning ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-medium animate-pulse">
              <Play className="w-3 h-3 fill-orange-400" />
              <span>ACTIVE · EXECUTING</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
              <Pause className="w-3 h-3 text-zinc-500" />
              <span>STANDBY · ACCUMULATING</span>
            </div>
          )}
        </div>
      </div>

      {/* Central Precision Orbital HUD */}
      <div className="py-6 sm:py-8 flex flex-col items-center justify-center relative z-10">
        <div className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] flex items-center justify-center">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#181e29"
              strokeWidth={strokeWidth}
            />

            {/* Glowing Active Progress Arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Precision Center Telemetry Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              Accumulated Escrow
            </span>
            <div className="my-1.5 flex items-baseline gap-1 font-mono">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {currentEscrowBalanceETH.toFixed(4)}
              </span>
              <span className="text-xs font-medium text-zinc-400">
                / {claimThresholdETH.toFixed(4)} ETH
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="w-36 h-1.5 bg-zinc-800 rounded-full overflow-hidden my-2">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((currentEscrowBalanceETH / claimThresholdETH) * 100))}%` }}
              />
            </div>

            <span className="text-xs font-mono text-zinc-300">
              {Math.min(100, Math.round((currentEscrowBalanceETH / claimThresholdETH) * 100))}% to trigger
            </span>

            {/* Active Phase Pill */}
            <div className="mt-2.5 px-3 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 text-xs font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
              <span className="text-white font-medium capitalize">{activePhase.title}</span>
            </div>
          </div>

          {/* 4 Orbital Phase Nodes at Quadrants */}
          {/* Top Node: Accumulate */}
          <div className={`absolute top-0 -translate-y-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-md ${
            currentPhase === 'accumulate'
              ? 'bg-sky-500/10 border-sky-400 text-sky-300 ring-2 ring-sky-400/20'
              : 'bg-[#0e131d] border-zinc-800 text-zinc-400'
          }`}>
            <TrendingUp className="w-3 h-3" />
            <span className="font-semibold">01. INFLOW</span>
          </div>

          {/* Right Node: Auto-Claim */}
          <div className={`absolute right-0 translate-x-2 px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-md ${
            currentPhase === 'claim'
              ? 'bg-amber-500/10 border-amber-400 text-amber-300 ring-2 ring-amber-400/20'
              : 'bg-[#0e131d] border-zinc-800 text-zinc-400'
          }`}>
            <Coins className="w-3 h-3" />
            <span className="font-semibold">02. CLAIM</span>
          </div>

          {/* Bottom Node: Buyback */}
          <div className={`absolute bottom-0 translate-y-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-md ${
            currentPhase === 'buyback'
              ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/20'
              : 'bg-[#0e131d] border-zinc-800 text-zinc-400'
          }`}>
            <ShoppingCart className="w-3 h-3" />
            <span className="font-semibold">03. BUYBACK</span>
          </div>

          {/* Left Node: Burn */}
          <div className={`absolute left-0 -translate-x-2 px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-md ${
            currentPhase === 'burn'
              ? 'bg-rose-500/10 border-rose-400 text-rose-300 ring-2 ring-rose-400/20'
              : 'bg-[#0e131d] border-zinc-800 text-zinc-400'
          }`}>
            <Flame className="w-3 h-3" />
            <span className="font-semibold">04. BURN</span>
          </div>
        </div>
      </div>

      {/* 4-Step Pipeline Flow Bar */}
      <div className="pt-4 border-t border-zinc-800/60 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PHASES.map((p) => {
            const Icon = p.icon;
            const isActive = currentPhase === p.id;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-zinc-900 border-zinc-700 shadow-sm'
                    : 'bg-[#090c12]/60 border-zinc-800/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-zinc-400 font-bold">{p.step}</span>
                  <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                </div>
                <div className="text-xs font-semibold text-white truncate">{p.title}</div>
                <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">{p.contract}</div>
              </div>
            );
          })}
        </div>

        {/* Live Narrative Status Footer */}
        <div className="mt-3.5 px-3.5 py-2 rounded-lg bg-[#080b10] border border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="truncate">{lastActionText}</span>
          </div>
          <span className="text-[10px] text-zinc-400 shrink-0 ml-2 hidden sm:inline">Robinhood RPC</span>
        </div>
      </div>
    </div>
  );
};
