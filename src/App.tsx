import React, { useState, useEffect } from 'react';
import { useFlywheelEngine } from './hooks/useBurnEngine';
import { PONS_V2_CONFIG } from './contracts';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
} from 'lucide-react';
import { LiquidEffectAnimation } from './components/ui/liquid-effect-animation';
import { SplineScene } from './components/ui/splite';
import { LiquidMetalButton } from './components/ui/liquid-metal-button';
import { BurnLedgerDrawer } from './components/BurnLedgerDrawer';
import { MemexAdmin } from './components/MemexAdmin';

export function App() {
  const {
    state,
    config,
    setConfig,
    logs,
    burnLedger,
  } = useFlywheelEngine();

  const getIsMemex = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/memex') || hash.startsWith('#memex') || hash.startsWith('#/memex');
  };

  const [isMemexRoute, setIsMemexRoute] = useState(getIsMemex());
  const [isLedgerDrawerOpen, setIsLedgerDrawerOpen] = useState(false);
  const [copiedCA, setCopiedCA] = useState(false);
  const [copiedDead, setCopiedDead] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsMemexRoute(getIsMemex());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);


  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setIsMemexRoute(false);
  };

  if (isMemexRoute) {
    return <MemexAdmin onBack={navigateToHome} />;
  }

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

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#090a0d] text-[#f5f3ef] font-satoshi selection:bg-white selection:text-[#090a0d] flex flex-col">
      {/* Navigation Header */}
      <header className="h-14 sm:h-16 px-3 sm:px-8 md:px-12 flex items-center justify-between border-liquid-nav bg-[#090a0d]/90 sticky top-0 z-40 backdrop-blur-md shrink-0">
        {/* Brand: INCINERATOR */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/" onClick={(e) => { e.preventDefault(); navigateToHome(); }} className="inline-flex items-center gap-2 sm:gap-2.5 text-base tracking-tight no-underline text-[#f5f3ef] group">
            <img
              src="/logo.png"
              alt="INCINERATOR Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain border border-white/20 transition-all shrink-0"
            />
            <div className="flex items-baseline gap-1">
              <span className="font-bold tracking-tight text-white text-sm sm:text-base">INCINERATOR</span>
            </div>
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* View Ledger Slide Bar */}
          <LiquidMetalButton
            label="Ledger"
            onClick={() => setIsLedgerDrawerOpen(true)}
            viewMode="text"
            size="sm"
          />

          {/* Audio toggle */}
          <LiquidMetalButton
            size="sm"
            viewMode="icon"
            title={config.soundEnabled ? 'Mute sound' : 'Enable sound'}
            onClick={() => setConfig({ ...config, soundEnabled: !config.soundEnabled })}
            icon={config.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-white" /> : <VolumeX className="w-3.5 h-3.5 text-[#71717a]" />}
          />

          {/* Twitter / X */}
          <LiquidMetalButton
            size="sm"
            viewMode="icon"
            title="Twitter / X (@incinerator_rh)"
            onClick={() => window.open('https://x.com/incinerator_rh', '_blank')}
            icon={
              <svg className="w-3.5 h-3.5 fill-current text-zinc-300 hover:text-white transition-colors" viewBox="0 0 24 24">
                <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z"/>
              </svg>
            }
          />

          {/* CA Copy Button (Responsive: compact pill on mobile, full label on desktop) */}
          {config.tokenAddress ? (
            <div className="flex items-center">
              <div className="hidden sm:block">
                <LiquidMetalButton
                  size="sm"
                  viewMode="text"
                  title="Click to copy CA"
                  label={copiedCA ? "Copied CA!" : `CA ${config.tokenAddress.slice(0, 4)}…${config.tokenAddress.slice(-4)}`}
                  onClick={copyCA}
                  icon={copiedCA ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-[#a1a1aa]" />}
                />
              </div>
              <div className="block sm:hidden">
                <LiquidMetalButton
                  size="xs"
                  viewMode="text"
                  title="Click to copy CA"
                  label={copiedCA ? "Copied!" : "CA"}
                  onClick={copyCA}
                  icon={copiedCA ? <Check className="w-2.5 h-2.5 text-white" /> : <Copy className="w-2.5 h-2.5 text-[#a1a1aa]" />}
                />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {/* Full-Screen Futuristic Hero Section with Liquid Effect Animation */}
        <section className="flex-1 relative flex items-center lg:items-end justify-center overflow-hidden px-4 sm:px-8 md:px-12 py-3 sm:py-4 lg:py-0">
          {/* Interactive Liquid Effect Animation (from 21st.dev) */}
          <LiquidEffectAnimation
            className="absolute inset-0 z-0 pointer-events-auto opacity-40 mix-blend-screen"
            color="#1e2028"
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

          <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center lg:items-end relative z-10 h-full">
            
            {/* Left Column: Brand & Description */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2 sm:space-y-4 z-20 self-center py-2 sm:py-4 lg:py-6">
              {/* Badge & Typography */}
              <div className="space-y-1.5 sm:space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-b from-white via-[#ded9cf] to-[#7f7a70] bg-clip-text text-transparent m-0 drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]">
                  INCINERATOR
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-[#c0bdb5] max-w-sm sm:max-w-md lg:max-w-lg leading-relaxed font-normal">
                  Engineered for relentless scarcity on Robinhood Chain. Every fraction of protocol volume is harvested to execute automated DEX buybacks and permanent on-chain incineration.
                </p>
              </div>
            </div>

            {/* Right Column: 3D Interactive Robot scaled comfortably to prevent clipping */}
            <div className="lg:col-span-7 w-full h-[320px] sm:h-[440px] md:h-[520px] lg:h-[calc(100vh-4.5rem)] relative flex items-end justify-center self-end pointer-events-auto">
              <div className="w-full h-full flex items-end justify-center origin-bottom transform scale-[0.80] sm:scale-[0.88] md:scale-[0.94] lg:scale-[1.0] translate-y-[5px] sm:translate-y-[10px] lg:translate-y-[20px]">
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </div>
              {/* Seamless atmospheric fade to smoothly dissolve bottom */}
              <div className="absolute -bottom-1 inset-x-0 h-16 sm:h-24 lg:h-32 bg-gradient-to-t from-[#090a0d] via-[#090a0d]/90 to-transparent pointer-events-none z-10" />
            </div>

          </div>
        </section>
      </main>

      {/* Slide-out Burn Ledger Drawer (Framer Motion) */}
      <BurnLedgerDrawer
        isOpen={isLedgerDrawerOpen}
        onClose={() => setIsLedgerDrawerOpen(false)}
        logs={logs}
        burnLedger={burnLedger}
        state={state}
        config={config}
      />
    </div>
  );
}

export default App;
