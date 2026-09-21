import React, { useState, useEffect } from 'react';
import { useFlywheelEngine } from './hooks/useBurnEngine';
import { BurnPage } from './components/BurnPage';
import { PONS_V2_CONFIG } from './contracts';
import {
  Flame,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { LiquidEffectAnimation } from './components/ui/liquid-effect-animation';
import { SplineScene } from './components/ui/splite';

export function App() {
  const {
    state,
    config,
    setConfig,
    logs,
    burnLedger,
  } = useFlywheelEngine();

  // Simple client-side routing for /burn
  const [route, setRoute] = useState<string>(() => window.location.pathname);
  const [copiedCA, setCopiedCA] = useState(false);
  const [copiedDead, setCopiedDead] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setRoute('/');
  };

  const navigateToBurn = () => {
    window.history.pushState({}, '', '/burn');
    setRoute('/burn');
  };

  const copyCA = () => {
    if (!config.tokenAddress) return;
    navigator.clipboard.writeText(config.tokenAddress);
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
  };

  const copyDead = () => {
    navigator.clipboard.writeText(config.deadAddress || PONS_V2_CONFIG.contracts.deadAddress);
    setCopiedDead(true);
    setTimeout(() => setCopiedDead(false), 2000);
  };

  // Route: /burn -> Dedicated Burn History Page
  if (route === '/burn') {
    return (
      <>
        <BurnPage
          state={state}
          config={config}
          logs={logs}
          burnLedger={burnLedger}
          onNavigateHome={navigateToHome}
        />
      </>
    );
  }

  const formatCompact = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(num);
  };

  const burnedPercent = state.burnedPercentageOfSupply;
  const targetThreshold = state.claimThresholdETH > 0 ? state.claimThresholdETH : 0.015;
  const escrowProgressPercent = Math.min(100, Math.max(0, (state.currentEscrowBalanceETH / targetThreshold) * 100));

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#090a0d] text-[#f5f3ef] font-satoshi selection:bg-[#ff5722] selection:text-[#090a0d] flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="h-14 sm:h-16 px-4 sm:px-8 md:px-12 flex items-center justify-between border-b border-[#222329] bg-[#090a0d]/90 sticky top-0 z-40 backdrop-blur-md shrink-0">
        {/* Brand: INCINERATOR */}
        <div className="flex items-center gap-3">
          <a href="/" className="inline-flex items-center gap-2.5 text-base tracking-tight no-underline text-[#f5f3ef] group">
            <img
              src="/logo.png"
              alt="INCINERATOR Logo"
              className="w-8 h-8 rounded-lg object-contain border border-[#ff5722]/30 shadow-[0_0_14px_rgba(255,87,34,0.35)] group-hover:shadow-[0_0_20px_rgba(255,87,34,0.55)] transition-all"
            />
            <div className="flex items-baseline gap-1">
              <span className="font-bold tracking-tight text-white text-base">INCINERATOR</span>
            </div>
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            onClick={() => setConfig({ ...config, soundEnabled: !config.soundEnabled })}
            className="p-1.5 text-[#a6a39d] hover:text-[#f5f3ef] transition-colors cursor-pointer"
            title={config.soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {config.soundEnabled ? <Volume2 className="w-4 h-4 text-[#ff5722]" /> : <VolumeX className="w-4 h-4 text-[#48464b]" />}
          </button>

          {/* Twitter / X */}
          <a
            href="https://x.com/jevburns"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 flex items-center justify-center text-[#a6a39d] hover:text-[#f5f3ef] transition-opacity opacity-70 hover:opacity-100"
            title="Twitter / X"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z"/>
            </svg>
          </a>

          {/* CA Copy Button (only if configured) */}
          {config.tokenAddress ? (
            <button
              onClick={copyCA}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#a6a39d] hover:text-[#f5f3ef] transition-colors cursor-pointer border border-[#24252a] rounded-lg bg-[#111217]"
              title="Click to copy CA"
            >
              <span className="text-[10px] text-[#555258]">CA</span>
              <span className="font-mono text-[11px]">
                {`${config.tokenAddress.slice(0, 4)}…${config.tokenAddress.slice(-4)}`}
              </span>
              {copiedCA ? <Check className="w-3 h-3 text-[#ff5722]" /> : <Copy className="w-3 h-3" />}
            </button>
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center min-h-0">
        {/* Full-Screen Futuristic Hero Section with Liquid Effect Animation */}
        <section className="flex-1 relative flex items-center justify-center overflow-hidden py-3 sm:py-6 px-4 sm:px-8 md:px-12">
          {/* Interactive Liquid Effect Animation (from 21st.dev) */}
          <LiquidEffectAnimation
            className="absolute inset-0 z-0 pointer-events-auto opacity-45 mix-blend-screen"
            color="#2a1208"
            metalness={0.9}
            roughness={0.18}
            displacementScale={5.5}
            rain={true}
            rainTimeDelta={0.25}
          />

          {/* Cinematic Dark Gradients for depth and readability */}
          <div className="absolute inset-0 z-[1] pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a0d] via-[#090a0d]/40 to-[#090a0d]/75" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#090a0d]/25 to-[#090a0d]/85" />
          </div>

          <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10 my-auto">
            
            {/* Left Column: Brand, Actions, & Live Telemetry HUD */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-5 z-20">
              {/* Main Brand Title & Description */}
              <div className="space-y-2.5 sm:space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5722]/10 border border-[#ff5722]/30 text-[#ff5722] text-xs font-mono font-medium backdrop-blur-sm">
                  <Flame className="w-3.5 h-3.5" />
                  <span>AUTONOMOUS PROTOCOL BOT</span>
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white m-0 drop-shadow-[0_0_35px_rgba(255,87,34,0.25)]">
                  INCINERATOR
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-[#b5b2ab] max-w-lg leading-relaxed font-normal">
                  The perpetual autonomous buyback & incinerator on Robinhood Chain.
                  100% of trading fees are programmatically routed into DEX buybacks and sent to the irreversible dead sink.
                </p>
              </div>

              {/* Primary Action Button */}
              <div className="pt-0.5">
                <button
                  onClick={navigateToBurn}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff7a00] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(255,87,34,0.3)] hover:shadow-[0_0_35px_rgba(255,87,34,0.5)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>View Burns Ledger (/burn)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Sleek Minimalist Live Telemetry HUD */}
              <div className="w-full max-w-xl rounded-2xl bg-[#0e1015]/90 border border-white/[0.08] backdrop-blur-xl p-4 sm:p-5 shadow-2xl text-left">
                <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.06] pb-2.5 mb-3">
                  <span className="text-[#a6a39d] flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-[#ff5722]" />
                    AUTONOMOUS INCINERATOR ENGINE
                  </span>
                  <span className="text-[#ff5722] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722] animate-ping" />
                    {state.isWheelSpinning ? 'BURNING NOW' : 'STANDBY'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Escrow Pool Metric */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#a6a39d] uppercase">
                      <span>Fee Escrow Pool</span>
                      <span className="text-[#ff5722] font-bold">{escrowProgressPercent.toFixed(1)}%</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
                      {state.currentEscrowBalanceETH.toFixed(4)} <span className="text-xs text-[#a6a39d] font-normal">/ {targetThreshold.toFixed(4)} ETH</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1b1c24] rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-[#ff5722] to-[#ffaa00] rounded-full transition-all duration-700 shadow-[0_0_10px_#ff5722]"
                        style={{ width: `${Math.max(3, escrowProgressPercent)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#65636c] font-mono mt-1">
                      {state.isWheelSpinning ? 'Executing swap on Uniswap v4...' : `Auto-sweep at ${targetThreshold.toFixed(4)} ETH threshold`}
                    </div>
                  </div>

                  {/* Supply Incinerated Metric */}
                  <div className="sm:border-l sm:border-white/[0.06] sm:pl-5">
                    <div className="text-[11px] font-mono text-[#a6a39d] uppercase">
                      Supply Incinerated
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono text-[#ff5722] mt-1">
                      {formatCompact(state.totalTokensBurned)} <span className="text-xs font-normal text-white">TOKENS</span>
                    </div>
                    <div className="text-xs font-mono text-emerald-400 mt-0.5">
                      {burnedPercent.toFixed(2)}% of total supply removed
                    </div>
                    <div className="text-[10px] text-[#65636c] font-mono mt-1">
                      Irreversible sink: 0x0...dEaD
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Interactive Robot from Spline */}
            <div className="lg:col-span-6 w-full h-[460px] sm:h-[520px] lg:h-[580px] xl:h-[620px] relative flex items-center justify-center pointer-events-auto">
              {/* Cybernetic ambient floor glow beneath robot */}
              <div className="absolute bottom-4 sm:bottom-8 w-64 h-16 rounded-[100%] bg-gradient-to-r from-transparent via-[#ff5722]/20 to-transparent blur-2xl pointer-events-none" />

              {/* 3D Robot with smooth gradient mask to seamlessly dissolve bottom cuts */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 95%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 95%)',
                }}
              >
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 md:px-12 py-3 sm:py-3.5 border-t border-[#222329] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#a6a39d] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold tracking-tight">INCINERATOR</span>
          <span>//</span>
          <span>ROBINHOOD MAINNET [4663]</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={navigateToBurn}
            className="hover:text-white transition-colors cursor-pointer text-[#ff5722]"
          >
            Burns (/burn)
          </button>
          <a
            href="https://x.com/jevburns"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            Twitter / X
          </a>
          {config.tokenAddress ? (
            <button
              onClick={copyCA}
              className="hover:text-white transition-colors cursor-pointer font-mono"
            >
              CA {`${config.tokenAddress.slice(0, 6)}…${config.tokenAddress.slice(-4)}`}
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}

export default App;
