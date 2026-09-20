import React from 'react';
import { Volume2, VolumeX, ShieldCheck, Activity, Radio, Cpu } from 'lucide-react';
import { sounds } from '../utils/audio';

interface EngineControlsProps {
  isWheelSpinning: boolean;
  claimThresholdETH: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  tokenAddress?: string;
}

export const EngineControls: React.FC<EngineControlsProps> = ({
  isWheelSpinning,
  claimThresholdETH,
  soundEnabled,
  onToggleSound,
  tokenAddress,
}) => {
  const isConfigured = Boolean(
    tokenAddress &&
    tokenAddress.toLowerCase() !== 'none' &&
    tokenAddress.startsWith('0x') &&
    tokenAddress.length === 42
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#080B10] border border-cyan-500/20 shadow-md">
      {/* Engine Telemetry Status */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3 shrink-0">
          {!isConfigured ? (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-600" />
          ) : isWheelSpinning ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-bold text-xs text-white tracking-wider flex items-center gap-1.5">
              {!isConfigured
                ? 'CORE HALTED // UNCONFIGURED'
                : isWheelSpinning
                ? 'SYSTEM ACTIVE // EXECUTING CYCLE'
                : 'SYSTEM STANDBY // ESCROW MONITORING'}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
              AUTONOMOUS
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            {!isConfigured
              ? 'Token address unconfigured. Please configure deployed contract address in Admin.'
              : isWheelSpinning
              ? 'Claimable fee threshold met. Autonomous state machine executing on-chain transactions...'
              : `Standby mode active. Autonomous daemon will execute automatically upon reaching ≥ ${claimThresholdETH} ETH.`}
          </p>
        </div>
      </div>

      {/* Diagnostics & Audio Instrument */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>FEE_ESCROW VERIFIED</span>
        </div>

        {/* Audio Synthesizer Control */}
        <button
          onClick={() => {
            sounds.enabled = !soundEnabled;
            onToggleSound();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
          }`}
          title={soundEnabled ? 'Mute Audio Synthesizer' : 'Enable Audio Synthesizer'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="font-oxanium text-[11px] font-bold">{soundEnabled ? 'AUDIO: ON' : 'AUDIO: MUTE'}</span>
        </button>
      </div>
    </div>
  );
};
