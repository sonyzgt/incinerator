import React from 'react';
import { Volume2, VolumeX, ShieldCheck, Activity } from 'lucide-react';
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
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1017] border border-zinc-800/80 shadow-sm">
      {/* Engine Telemetry Status */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3 shrink-0">
          {!isConfigured ? (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-600" />
          ) : isWheelSpinning ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-xs text-white tracking-wide flex items-center gap-1.5">
              {!isConfigured
                ? 'ENGINE HALTED (UNCONFIGURED)'
                : isWheelSpinning
                ? 'FLYWHEEL SPINNING (EXECUTING)'
                : 'ENGINE STANDBY (ACCUMULATING)'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              REACTIVE DAEMON
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-normal">
            {!isConfigured
              ? 'Token address is not configured. Deploy contract first.'
              : isWheelSpinning
              ? 'Claimable fee threshold met. Autonomous cycle executing on-chain...'
              : `Flywheel pauses on idle. Spins automatically when accumulated fees hit ≥ ${claimThresholdETH} ETH.`}
          </p>
        </div>
      </div>

      {/* Preferences & Telemetry Verifications */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Escrow Monitored</span>
        </div>

        {/* Audio Effects Toggle */}
        <button
          onClick={() => {
            sounds.enabled = !soundEnabled;
            onToggleSound();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'
              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
          }`}
          title={soundEnabled ? 'Mute Audio Synthesizer' : 'Enable Audio Synthesizer'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-orange-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundEnabled ? 'Sound: ON' : 'Sound: OFF'}</span>
        </button>
      </div>
    </div>
  );
};
