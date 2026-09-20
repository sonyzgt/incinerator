import React from 'react';
import { EnginePhase } from '../types';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Coins,
  ShoppingCart,
  Flame,
  Zap,
  Radio,
  Server,
  Terminal
} from 'lucide-react';

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
  const isConfigured = Boolean(
    tokenAddress &&
    tokenAddress.toLowerCase() !== 'none' &&
    tokenAddress.startsWith('0x') &&
    tokenAddress.length === 42
  );

  // Calculate real escrow accumulation percentage
  const progressRatio = claimThresholdETH > 0
    ? Math.min(100, Math.max(0, (currentEscrowBalanceETH / claimThresholdETH) * 100))
    : 0;

  // Segmented progress bar blocks (30 segments)
  const totalSegments = 30;
  const activeSegments = Math.round((progressRatio / 100) * totalSegments);

  // Stages configuration for the horizontal process pipeline
  const stages = [
    {
      id: 'accumulate' as EnginePhase,
      num: '01',
      name: 'INFLOW',
      sublabel: 'VOLUME TAX',
      target: 'Pons FeeEscrow',
      icon: TrendingUp,
      activeColor: 'text-cyan-400 border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.4)]',
      dotColor: 'bg-cyan-400'
    },
    {
      id: 'claim' as EnginePhase,
      num: '02',
      name: 'CLAIM',
      sublabel: 'FEE WITHDRAWAL',
      target: 'claim()',
      icon: Coins,
      activeColor: 'text-amber-400 border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.4)]',
      dotColor: 'bg-amber-400'
    },
    {
      id: 'buyback' as EnginePhase,
      num: '03',
      name: 'BUYBACK',
      sublabel: 'CURVE SWAP',
      target: 'curve.buy()',
      icon: ShoppingCart,
      activeColor: 'text-emerald-400 border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.4)]',
      dotColor: 'bg-emerald-400'
    },
    {
      id: 'burn' as EnginePhase,
      num: '04',
      name: 'BURN',
      sublabel: 'DEAD INCINERATOR',
      target: '0x0...dEaD',
      icon: Flame,
      activeColor: 'text-rose-400 border-rose-400 bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
      dotColor: 'bg-rose-400'
    }
  ];

  // Map the stage order to determine completed vs active vs standby
  const stageOrder: EnginePhase[] = ['accumulate', 'claim', 'buyback', 'burn'];
  const currentIndex = stageOrder.indexOf(currentPhase);

  return (
    <div className="w-full bg-[#080B10] border border-cyan-500/25 rounded-2xl p-5 sm:p-7 relative overflow-hidden shadow-2xl">
      {/* Corner Technical Bracket Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Background Subtle Cyber Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Header Diagnostics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-orbitron font-bold text-base sm:text-lg text-white tracking-wider flex items-center gap-2">
              <span>AUTONOMOUS ENGINE</span>
              <span className="text-zinc-600">//</span>
              <span className="text-cyan-400 text-xs font-mono font-medium">REAL-TIME PROTOCOL STATE</span>
            </h2>
          </div>
          <div className="text-[11px] font-mono text-zinc-400 mt-0.5 flex items-center gap-2">
            <span>CYCLE #{cycleCount}</span>
            <span className="text-zinc-700">&bull;</span>
            <span>SYSTEM HEALTH: <strong className="text-emerald-400 font-mono">99.9% OPERATIONAL</strong></span>
          </div>
        </div>

        {/* System Status Pill */}
        <div className="flex items-center gap-2">
          {isWheelSpinning ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
              <span>STATE: EXECUTING_CYCLE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>STATE: STANDBY_MONITORING</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Autonomous System Telemetry Display */}
      <div className="py-7 sm:py-9 relative z-10 flex flex-col items-center justify-center text-center">
        {/* Micro-Label */}
        <div className="text-[11px] font-oxanium font-bold uppercase tracking-widest text-cyan-400/90 mb-1 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>ACCUMULATED ESCROW STATUS</span>
        </div>

        {/* Large Futuristic Percentage Indicator */}
        <div className="font-orbitron font-black text-4xl sm:text-6xl tracking-tight text-white my-1 text-glow-cyan">
          {progressRatio.toFixed(1)}%
        </div>

        {/* Value Ratio */}
        <div className="font-mono text-xs sm:text-sm text-zinc-300 mt-1 flex items-center gap-1.5">
          <span className="text-cyan-300 font-bold text-sm sm:text-base font-orbitron">
            {currentEscrowBalanceETH.toFixed(4)} ETH
          </span>
          <span className="text-zinc-500 font-bold">/</span>
          <span className="text-zinc-400 font-mono">
            {claimThresholdETH.toFixed(4)} ETH
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider ml-1 font-oxanium">
            (THRESHOLD)
          </span>
        </div>

        {/* Futuristic Segmented Cyber Progress Bar */}
        <div className="w-full max-w-xl my-5 px-2">
          <div className="flex items-center gap-1 sm:gap-1.5 justify-center">
            {Array.from({ length: totalSegments }).map((_, i) => {
              const isFilled = i < activeSegments;
              return (
                <div
                  key={i}
                  className={`h-4 sm:h-5 flex-1 rounded-[1px] transition-all duration-300 ${
                    isFilled
                      ? i === activeSegments - 1
                        ? 'bg-cyan-400 shadow-[0_0_10px_#00F0FF] animate-pulse'
                        : 'bg-gradient-to-t from-cyan-500 to-cyan-300'
                      : 'bg-zinc-900/90 border border-zinc-800/80'
                  }`}
                  title={`${((i + 1) / totalSegments * 100).toFixed(0)}%`}
                />
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-1.5 px-0.5">
            <span>0.0000 ETH (0%)</span>
            <span className="text-cyan-400 font-medium">TARGET: {claimThresholdETH.toFixed(4)} ETH (100%)</span>
          </div>
        </div>

        {/* Next Action Indicator Card */}
        <div className="mt-1 px-4 py-2.5 rounded-lg bg-[#05070A] border border-zinc-800/80 max-w-md w-full flex items-center justify-between font-mono text-xs shadow-inner">
          <div className="flex items-center gap-2 text-zinc-400">
            <Zap className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span className="text-[10px] font-oxanium text-zinc-400 uppercase tracking-wider">NEXT ACTION:</span>
          </div>
          <span className="text-white font-bold font-oxanium text-xs">
            {currentEscrowBalanceETH >= claimThresholdETH
              ? 'AUTO-CLAIM TRIGGERED'
              : 'AUTO-CLAIM AT THRESHOLD'}
          </span>
        </div>
      </div>

      {/* Horizontal 4-Stage Autonomous Process Pipeline */}
      <div className="pt-6 border-t border-zinc-800/80 relative z-10">
        <div className="text-[10px] font-oxanium font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center justify-between">
          <span>PIPELINE EXECUTION STAGES</span>
          <span className="text-cyan-400 font-mono">AUTONOMOUS STATE MACHINE</span>
        </div>

        {/* Horizontal Connector Line & Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isCurrent = currentPhase === stg.id;
            const isCompleted = isWheelSpinning && idx < currentIndex;
            const isStandby = !isCurrent && !isCompleted;

            let stateLabel = 'STANDBY';
            let badgeStyle = 'text-zinc-500 border-zinc-800 bg-zinc-900/50';

            if (isCurrent) {
              stateLabel = isWheelSpinning ? 'ACTIVE' : 'READY';
              badgeStyle = stg.activeColor;
            } else if (isCompleted) {
              stateLabel = 'COMPLETED';
              badgeStyle = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            }

            return (
              <div
                key={stg.id}
                className={`p-3.5 rounded-xl border transition-all relative ${
                  isCurrent
                    ? 'bg-[#0B101A] border-cyan-500/40 shadow-lg'
                    : 'bg-[#06080D] border-zinc-800/60'
                }`}
              >
                {/* Node Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-orbitron font-black text-xs text-white">
                      {stg.num}
                    </span>
                    <span className="text-zinc-600">//</span>
                    <span className="font-oxanium font-bold text-xs text-white tracking-wider">
                      {stg.name}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-md border ${badgeStyle}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Sub-label & Target */}
                <div className="text-[10px] font-mono text-zinc-400 uppercase">
                  {stg.sublabel}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                  {stg.target}
                </div>

                {/* Status Badge */}
                <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-500">STATE:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-zinc-500'
                  }`}>
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
                    {stateLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Narrative Status Ticker */}
        <div className="mt-4 px-3.5 py-2.5 rounded-lg bg-[#05070A] border border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-2 truncate">
            <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            <span className="text-zinc-400 text-[11px]">TELEMETRY:</span>
            <span className="truncate text-white text-xs">{lastActionText}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono shrink-0 ml-2 hidden sm:inline">
            ● DAEMON_SYNC
          </span>
        </div>
      </div>
    </div>
  );
};
