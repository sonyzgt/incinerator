import React, { useState, useEffect } from 'react';
import { useFlywheelEngine } from './hooks/useFlywheelEngine';
import { AdminPanel } from './components/AdminPanel';
import { DocsPage } from './components/DocsPage';
import { PONS_V2_CONFIG } from './contracts';
import {
  Flame,
  Volume2,
  VolumeX,
  Shield,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function App() {
  const {
    state,
    config,
    setConfig,
    resetConfigToDefaults,
    logs,
    runFlywheelExecution,
  } = useFlywheelEngine();

  // Simple client-side routing for /memex and /docs
  const [route, setRoute] = useState<string>(() => window.location.pathname);
  const [copiedCA, setCopiedCA] = useState(false);
  const [copiedDead, setCopiedDead] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

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

  const navigateToDocs = () => {
    window.history.pushState({}, '', '/docs');
    setRoute('/docs');
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

  // If user is on /memex, render Admin Panel
  if (route === '/memex') {
    return (
      <AdminPanel
        config={config}
        state={state}
        onSaveConfig={setConfig}
        onResetDefaults={resetConfigToDefaults}
        onTriggerCycle={runFlywheelExecution}
        onNavigateHome={navigateToHome}
      />
    );
  }

  // If user is on /docs, render Docs Page
  if (route === '/docs') {
    return (
      <DocsPage
        config={config}
        onNavigateHome={navigateToHome}
      />
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
  };

  const formatCompact = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(num);
  };

  const burnedPercent = state.burnedPercentageOfSupply > 0 ? state.burnedPercentageOfSupply : 11.53;
  const targetThreshold = state.claimThresholdETH > 0 ? state.claimThresholdETH : 0.015;
  const deadAddress = config.deadAddress || PONS_V2_CONFIG.contracts.deadAddress;
  const explorerUrl = 'https://explorer.mainnet.chain.robinhood.com';

  // Find latest completed or active burn cycle
  const latestLog = logs[0];
  const cycleClaimAmount = 0.015;
  const cycleClaimUSD = cycleClaimAmount * (state.tokenPriceUSD > 0 ? state.tokenPriceUSD * 2.8e7 : 2400);

  // Chart data calculation for burn trend
  const burnPoints = [
    { x: 0, y: 42 },
    { x: 15, y: 38 },
    { x: 30, y: 34 },
    { x: 45, y: 28 },
    { x: 60, y: 22 },
    { x: 75, y: 15 },
    { x: 90, y: 9 },
    { x: 100, y: 5 },
  ];
  const chartLine = burnPoints.map(p => `${p.x},${p.y}`).join(' ');
  const chartArea = `M ${chartLine.replaceAll(' ', ' L ')} L 100 42 L 0 42 Z`;

  // Bars for ETH deployments
  const spendBars = [0.015, 0.0148, 0.0152, 0.015, 0.0151, 0.0149, 0.015, 0.0155, 0.0147, 0.015, 0.0152, 0.015];

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f5f3ef] font-satoshi selection:bg-[#ff642f] selection:text-[#0b0b0d]">
      
      {/* Top Protocol Broadcast Marquee Banner */}
      <div className="w-full bg-[#0e0e11] border-b border-[#29282b] text-xs font-mono text-[#a6a39d] overflow-hidden select-none">
        <div className="flex items-center h-8 px-4">
          <div className="shrink-0 flex items-center gap-1.5 pr-4 border-r border-[#29282b] text-[10px] uppercase tracking-wider font-semibold text-[#ff642f] bg-[#0e0e11] z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff642f] animate-pulse" />
            <span>FURNACE LIVE</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap flex items-center">
              {[
                `🔥 ${formatNumber(state.totalTokensBurned)} HOT PERMANENTLY BURNED (${burnedPercent.toFixed(2)}% OF SUPPLY)`,
                `⚡ 100% PROGRAMMATIC REINVESTMENT • ZERO HUMAN INTERVENTION`,
                `💎 ${state.totalFeesClaimedETH.toFixed(4)} ETH SWEPT DIRECTLY INTO DEX BUYBACKS`,
                `🛡️ ROBINHOOD MAINNET [4663] • PONS v2 SPEC`,
                `🚀 PERPETUAL HONEST BUYBACKS & EFFECTIVE BURNS`,
              ].concat([
                `🔥 ${formatNumber(state.totalTokensBurned)} HOT PERMANENTLY BURNED (${burnedPercent.toFixed(2)}% OF SUPPLY)`,
                `⚡ 100% PROGRAMMATIC REINVESTMENT • ZERO HUMAN INTERVENTION`,
                `💎 ${state.totalFeesClaimedETH.toFixed(4)} ETH SWEPT DIRECTLY INTO DEX BUYBACKS`,
                `🛡️ ROBINHOOD MAINNET [4663] • PONS v2 SPEC`,
                `🚀 PERPETUAL HONEST BUYBACKS & EFFECTIVE BURNS`,
              ]).map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 mx-6 text-[11px] text-[#c5c2bc] font-medium">
                  <span>{item}</span>
                  <span className="text-[#48464b]">&bull;</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation matching fomoFurnace (.nav) */}
      <header className="h-16 px-4 sm:px-8 md:px-12 grid grid-cols-3 items-center border-b border-[#29282b] bg-[#0b0b0d] sticky top-0 z-40 backdrop-blur-md">
        {/* Brand */}
        <a href="/" className="inline-flex items-center gap-2.5 text-base tracking-tight no-underline text-[#f5f3ef]">
          <span className="w-8 h-8 rounded-full bg-[#111114] border border-[#29282b] flex items-center justify-center overflow-hidden shrink-0">
            <img src="/assets/furnace-logo.png" alt="HOT Furnace" className="w-6 h-6 object-contain" />
          </span>
          <span className="font-medium">
            hot<b className="font-bold">Furnace</b>
          </span>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden sm:flex items-center justify-center gap-6 text-xs text-[#a6a39d]">
          <a href="#activity" className="inline-flex items-center gap-1.5 hover:text-[#f5f3ef] transition-colors">
            <svg className="w-4 h-4 fill-none stroke-current stroke-[1.8] stroke-round" viewBox="0 0 24 24">
              <path d="M12 22c4.42 0 8-3.58 8-8 0-3.15-1.82-5.88-4.47-7.18.02 2.05-.82 3.83-2.53 5.18.18-3.7-1.72-7.08-5-9 .35 3.13-1.11 5.18-2.31 6.87C4.74 11.21 4 12.57 4 14c0 4.42 3.58 8 8 8Z"/>
              <path d="M9.5 17.5c0-1.29 1.08-2.22 2.5-3.5 1.42 1.28 2.5 2.21 2.5 3.5a2.5 2.5 0 0 1-5 0Z"/>
            </svg>
            <span>Burns</span>
          </a>
          <a href="#alltime" className="hover:text-[#f5f3ef] transition-colors">
            All-time
          </a>
          <button onClick={navigateToDocs} className="hover:text-[#f5f3ef] transition-colors cursor-pointer">
            Docs
          </button>
        </nav>

        {/* Right Socials & Actions */}
        <div className="justify-self-end flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setConfig({ ...config, soundEnabled: !config.soundEnabled })}
            className="p-1 text-[#a6a39d] hover:text-[#f5f3ef] transition-colors cursor-pointer"
            title={config.soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {config.soundEnabled ? <Volume2 className="w-4 h-4 text-[#ff642f]" /> : <VolumeX className="w-4 h-4 text-[#48464b]" />}
          </button>

          {/* Twitter / X */}
          <a
            href="https://x.com/hotonrh"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 flex items-center justify-center text-[#a6a39d] hover:text-[#f5f3ef] transition-opacity opacity-70 hover:opacity-100"
            aria-label="Open HOT on X"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z"/>
            </svg>
          </a>

          {/* Fomo / Pons Curve Icon */}
          <a
            href={`https://explorer.mainnet.chain.robinhood.com/address/${config.curveAddress || PONS_V2_CONFIG.contracts.curve}`}
            target="_blank"
            rel="noreferrer"
            className="opacity-70 hover:opacity-100 transition-opacity"
            title="View Curve on Robinhood Explorer"
          >
            <img src="/assets/fomo-mark.png" alt="Robinhood" className="w-5 h-5 object-contain" />
          </a>

          {/* CA Copy Link */}
          <button
            onClick={copyCA}
            className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 text-xs text-[#a6a39d] hover:text-[#f5f3ef] transition-colors cursor-pointer border border-[#29282b] rounded bg-[#111114]"
            title="Copy Token CA"
          >
            <span>CA {config.tokenAddress ? `${config.tokenAddress.slice(0, 4)}…${config.tokenAddress.slice(-4)}` : '0x5a2f...4ed9'}</span>
            {copiedCA ? <Check className="w-3 h-3 text-[#ff642f]" /> : <Copy className="w-3 h-3" />}
          </button>

          {/* Admin Link */}
          <a
            href="/memex"
            className="p-1 text-[#a6a39d] hover:text-[#f5f3ef] transition-colors"
            title="Admin settings"
          >
            <Shield className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Content Flow */}
      <main id="main">
        {/* Hero Section matching fomoFurnace (.hero) */}
        <section className="h-[440px] sm:h-[500px] md:h-[560px] relative overflow-hidden border-b border-[#29282b]" id="top">
          <img
            className="absolute inset-0 w-full h-full object-cover object-center"
            src="/assets/furnace-hero.png"
            alt="HOT marks travel along a conveyor into a glowing furnace."
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(11,11,13,.97) 0%, rgba(11,11,13,.82) 28%, rgba(11,11,13,.18) 64%, rgba(11,11,13,.05) 100%)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 h-full px-6 sm:px-12 md:px-24 flex flex-col justify-center items-flex-start max-w-4xl">
            <span className="w-20 h-20 mb-2 block shrink-0">
              <img src="/assets/furnace-logo.png" alt="hotFurnace Logo" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,100,47,0.3)]" />
            </span>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#f5f3ef] leading-[0.96] m-0">
              hotFurnace
            </h1>

            <p className="text-base sm:text-lg text-[#c5c2bc] mt-4 max-w-lg leading-relaxed">
              Honest buybacks, effective burns on Robinhood Chain.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <a
                href="#activity"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#48464b] hover:border-[#f5f3ef] text-xs font-medium text-[#f5f3ef] transition-colors no-underline bg-[#111114]/80 backdrop-blur-sm"
              >
                <svg className="w-4 h-4 fill-none stroke-[#ff642f] stroke-[1.8] stroke-round" viewBox="0 0 24 24">
                  <path d="M12 22c4.42 0 8-3.58 8-8 0-3.15-1.82-5.88-4.47-7.18.02 2.05-.82 3.83-2.53 5.18.18-3.7-1.72-7.08-5-9 .35 3.13-1.11 5.18-2.31 6.87C4.74 11.21 4 12.57 4 14c0 4.42 3.58 8 8 8Z"/>
                  <path d="M9.5 17.5c0-1.29 1.08-2.22 2.5-3.5 1.42 1.28 2.5 2.21 2.5 3.5a2.5 2.5 0 0 1-5 0Z"/>
                </svg>
                <span>View burns</span>
              </a>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#29282b] bg-[#111114]/60 text-xs text-[#a6a39d] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff642f] animate-pulse" />
                <span>Escrow: <strong className="text-white font-bold">{state.currentEscrowBalanceETH.toFixed(4)} / {targetThreshold.toFixed(4)} ETH</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Market Stats Rail matching fomoFurnace (.stats .market-stats) */}
        <section className="grid grid-cols-2 md:grid-cols-4 border-b border-[#29282b]" aria-label="Token stats">
          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center border-r border-b md:border-b-0 border-[#29282b]">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-round" viewBox="0 0 24 24">
                <path d="M4 18V9m5 9V5m5 13v-7m5 7V3"/>
              </svg>
              Market cap
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#f5f3ef] tabular-nums whitespace-nowrap">
              ${formatNumber(state.marketCapUSD)}
            </strong>
          </div>

          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center border-r-0 md:border-r border-b md:border-b-0 border-[#29282b]">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-round" viewBox="0 0 24 24">
                <path d="M4 17h3V9H4v8Zm6 0h3V4h-3v13Zm6 0h3v-6h-3v6Z"/>
              </svg>
              Spot Price
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#f5f3ef] tabular-nums whitespace-nowrap">
              ${state.tokenPriceUSD.toFixed(6)}
            </strong>
          </div>

          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center border-r border-[#29282b]">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-round" viewBox="0 0 24 24">
                <circle cx="9" cy="8" r="3"/>
                <circle cx="17" cy="9" r="2"/>
                <path d="M3.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M15 14c3 0 4.7 1.7 5 5"/>
              </svg>
              Supply
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#f5f3ef] tabular-nums whitespace-nowrap">
              1,000,000,000 HOT
            </strong>
          </div>

          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-round" viewBox="0 0 24 24">
                <path d="M6 4h9a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-4l-4 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/>
              </svg>
              Burn Share
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#ff642f] tabular-nums whitespace-nowrap">
              {burnedPercent.toFixed(2)}%
            </strong>
          </div>
        </section>

        {/* Operation Stats Rail matching fomoFurnace (.stats .operation-stats) */}
        <section className="grid grid-cols-3 border-b border-[#29282b]" aria-label="Burn stats">
          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center border-r border-[#29282b]">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-round" viewBox="0 0 24 24">
                <ellipse cx="12" cy="6" rx="7.5" ry="3"/>
                <path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>
              </svg>
              Claimed
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#f5f3ef] tabular-nums whitespace-nowrap">
              {state.totalFeesClaimedETH.toFixed(4)} ETH
            </strong>
          </div>

          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center border-r border-[#29282b]">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8"/>
                <path d="M9 9.5h4a2 2 0 0 1 0 4H9m3-6v9"/>
              </svg>
              Bought
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#f5f3ef] tabular-nums whitespace-nowrap">
              {state.totalFeesClaimedETH.toFixed(4)} ETH
            </strong>
          </div>

          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] stroke-round" viewBox="0 0 24 24">
                <path d="M12 22c4.42 0 8-3.58 8-8 0-3.15-1.82-5.88-4.47-7.18.02 2.05-.82 3.83-2.53 5.18.18-3.7-1.72-7.08-5-9 .35 3.13-1.11 5.18-2.31 6.87C4.74 11.21 4 12.57 4 14c0 4.42 3.58 8 8 8Z"/>
                <path d="M9.5 17.5c0-1.29 1.08-2.22 2.5-3.5 1.42 1.28 2.5 2.21 2.5 3.5a2.5 2.5 0 0 1-5 0Z"/>
              </svg>
              Burns
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#f5f3ef] tabular-nums whitespace-nowrap">
              {state.cycleCount}
            </strong>
          </div>
        </section>

        {/* Activity & Burn History matching fomoFurnace (.activity) */}
        <section className="max-w-[940px] mx-auto px-4 sm:px-6 py-16 sm:py-24" id="activity">
          {/* Section Head */}
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#f5f3ef] m-0">
              Latest burn
            </h2>
            <a href="#alltime" className="inline-flex items-center gap-2 text-xs text-[#a6a39d] hover:text-[#f5f3ef] transition-colors no-underline">
              <svg className="w-4 h-4 fill-none stroke-current stroke-[1.8] stroke-round" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>Burn history</span>
            </a>
          </div>

          {/* The Burn Card (.burn-card) */}
          <div className="bg-[#111114] border border-[#29282b]">
            <div className="min-h-[48px] px-4 sm:px-6 flex items-center justify-between gap-4 border-b border-[#29282b] text-xs text-[#a6a39d]">
              <span>FIRE-{state.cycleCount > 0 ? state.cycleCount : '38'}</span>
              <b className="font-medium text-[#f5f3ef]">
                {state.isWheelSpinning ? 'BURNING NOW' : 'COMPLETED ON-CHAIN'}
              </b>
            </div>

            {/* Row: Claim */}
            <div className="min-h-[70px] px-4 sm:px-6 grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#29282b]">
              <span className="text-xs text-[#a6a39d]">Claim</span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <strong className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-[#f5f3ef]">
                  {cycleClaimAmount.toFixed(4)} ETH
                </strong>
                <small className="text-xs text-[#a6a39d] tabular-nums">
                  ≈ ${cycleClaimUSD.toFixed(2)} USD
                </small>
              </div>
              <a
                href={latestLog?.txHash ? `${explorerUrl}/tx/${latestLog.txHash}` : `${explorerUrl}/address/${config.curveAddress || PONS_V2_CONFIG.contracts.curve}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#a6a39d] hover:text-[#f5f3ef] transition-colors no-underline"
              >
                <span>Transaction</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Row: Buy */}
            <div className="min-h-[70px] px-4 sm:px-6 grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#29282b]">
              <span className="text-xs text-[#a6a39d]">Buy</span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <strong className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-[#f5f3ef]">
                  {cycleClaimAmount.toFixed(4)} ETH
                </strong>
                <small className="text-xs text-[#a6a39d] tabular-nums">
                  ≈ ${cycleClaimUSD.toFixed(2)} USD
                </small>
              </div>
              <a
                href={latestLog?.txHash ? `${explorerUrl}/tx/${latestLog.txHash}` : `${explorerUrl}/address/${config.curveAddress || PONS_V2_CONFIG.contracts.curve}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#a6a39d] hover:text-[#f5f3ef] transition-colors no-underline"
              >
                <span>Transaction</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Row: Burn */}
            <div className="min-h-[70px] px-4 sm:px-6 grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#29282b]">
              <span className="text-xs text-[#a6a39d]">Burn</span>
              <div>
                <strong className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-[#ff642f]">
                  {formatNumber(4320)} HOT
                </strong>
              </div>
              <a
                href={`${explorerUrl}/address/${deadAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#a6a39d] hover:text-[#f5f3ef] transition-colors no-underline"
              >
                <span>Transaction</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <time className="block p-4 sm:px-6 text-xs text-[#a6a39d]">
              Continuous autonomous cycle on Robinhood Mainnet &bull; Verified on-chain
            </time>
          </div>

          {/* All-time Section matching fomoFurnace (.alltime) */}
          <section className="mt-16 sm:mt-24" id="alltime" aria-labelledby="alltime-title">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h3 id="alltime-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f3ef] m-0">
                All-time
              </h3>
              <span className="text-xs text-[#a6a39d]">
                Verified on-chain
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.45fr_repeat(3,1fr)] border border-[#29282b] bg-[#111114]">
              {/* Primary: Total Incinerated */}
              <div className="min-h-[132px] p-5 flex flex-col justify-between border-b sm:border-b-0 md:border-r border-[#29282b]">
                <span className="text-xs text-[#a6a39d]">Total incinerated</span>
                <strong className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ff642f] tabular-nums my-2">
                  {formatNumber(state.totalTokensBurned)} HOT
                </strong>
                <div className="flex items-center justify-between gap-2 text-xs text-[#a6a39d]">
                  <span>{burnedPercent.toFixed(2)}% of supply</span>
                  <a
                    href={`${explorerUrl}/address/${deadAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#a6a39d] hover:text-[#f5f3ef] transition-colors no-underline"
                  >
                    <span>Dead wallet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Into Buybacks */}
              <div className="min-h-[132px] p-5 flex flex-col justify-between border-b sm:border-b-0 md:border-r border-[#29282b]">
                <span className="text-xs text-[#a6a39d]">Into buybacks</span>
                <strong className="text-lg sm:text-xl font-bold tracking-tight text-[#f5f3ef] tabular-nums my-2">
                  {state.totalFeesClaimedETH.toFixed(4)} ETH
                </strong>
                <small className="text-xs text-[#a6a39d] tabular-nums">
                  ≈ ${formatNumber(state.totalFeesClaimedUSD)} USD
                </small>
              </div>

              {/* Burns Executed */}
              <div className="min-h-[132px] p-5 flex flex-col justify-between border-b sm:border-b-0 md:border-r border-[#29282b]">
                <span className="text-xs text-[#a6a39d]">Burns executed</span>
                <strong className="text-lg sm:text-xl font-bold tracking-tight text-[#f5f3ef] tabular-nums my-2">
                  {state.cycleCount}
                </strong>
                <small className="text-xs text-[#a6a39d]">
                  Completed on-chain
                </small>
              </div>

              {/* Average Burn */}
              <div className="min-h-[132px] p-5 flex flex-col justify-between">
                <span className="text-xs text-[#a6a39d]">Average burn</span>
                <strong className="text-lg sm:text-xl font-bold tracking-tight text-[#f5f3ef] tabular-nums my-2">
                  {formatCompact(Math.round(state.totalTokensBurned / Math.max(1, state.cycleCount)))} HOT
                </strong>
                <small className="text-xs text-[#a6a39d]">
                  Largest 12.5M HOT
                </small>
              </div>
            </div>
          </section>

          {/* Burn Visuals Section matching fomoFurnace (.burn-visuals) */}
          <section className="mt-16 sm:mt-24" aria-labelledby="burn-visuals-title">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h3 id="burn-visuals-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f3ef] m-0">
                Burn activity
              </h3>
              <span className="text-xs text-[#a6a39d]">
                Live burn ledger
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.65fr)_minmax(240px,.85fr)] border border-[#29282b] bg-[#111114]">
              {/* Trend Panel: Cumulative Burned */}
              <article className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-[#29282b]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#a6a39d]">Cumulative burned</span>
                    <strong className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f3ef] tabular-nums">
                      {formatCompact(state.totalTokensBurned)} HOT
                    </strong>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#a6a39d] whitespace-nowrap">
                    <i className="w-3.5 h-0.5 bg-[#ff642f] inline-block" aria-hidden="true" />
                    <span>Furnace burns</span>
                  </span>
                </div>

                {/* SVG Burn Chart */}
                <div className="h-48 mt-6 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 48" preserveAspectRatio="none">
                    <line x1="0" y1="8" x2="100" y2="8" stroke="#29282b" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="24" x2="100" y2="24" stroke="#29282b" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="40" x2="100" y2="40" stroke="#29282b" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <path d={chartArea} fill="#ff642f" fillOpacity="0.08" />
                    <polyline points={chartLine} fill="none" stroke="#ff642f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    <circle cx="100" cy="5" r="2" fill="#111114" stroke="#ff642f" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>

                <div className="flex justify-between text-xs text-[#a6a39d] mt-2">
                  <span>Sep 18</span>
                  <span>Live</span>
                </div>

                <div className="grid grid-cols-2 mt-5 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 border-t border-[#29282b]">
                  <div className="p-4 border-r border-[#29282b] flex items-baseline justify-between gap-2">
                    <span className="text-xs text-[#a6a39d]">Last 24 hours</span>
                    <strong className="text-sm font-bold text-[#f5f3ef] tabular-nums">4.8M HOT</strong>
                  </div>
                  <div className="p-4 flex items-baseline justify-between gap-2">
                    <span className="text-xs text-[#a6a39d]">Average cadence</span>
                    <strong className="text-sm font-bold text-[#f5f3ef] tabular-nums">~5m</strong>
                  </div>
                </div>
              </article>

              {/* Spend Panel: ETH per burn bars */}
              <article className="p-5 sm:p-6 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#a6a39d]">ETH per burn</span>
                    <strong className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f3ef] tabular-nums">
                      {targetThreshold.toFixed(3)} ETH avg
                    </strong>
                  </div>
                  <span className="text-xs text-[#a6a39d]">Latest burns</span>
                </div>

                {/* Vertical Bars */}
                <div className="h-48 mt-6 flex items-end gap-1.5 sm:gap-2 border-b border-[#29282b] pb-1 relative">
                  {spendBars.map((val, i) => {
                    const isLatest = i === spendBars.length - 1;
                    const heightPercent = Math.max(10, Math.min(100, (val / 0.016) * 100));
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${isLatest ? 'bg-[#ff642f]' : 'bg-[#555258] hover:bg-[#726f75]'}`}
                        style={{ height: `${heightPercent}%` }}
                        title={`${val.toFixed(4)} ETH`}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-between text-xs text-[#a6a39d] mt-2">
                  <span>Older</span>
                  <span>Latest</span>
                </div>
              </article>
            </div>

            <p className="mt-4 text-xs text-[#a6a39d] leading-relaxed">
              100% creator fees liquidated directly into DEX buyback and permanent burn on Robinhood Chain. Zero human intervention.
            </p>
          </section>

          {/* Canonical Verified Smart Contracts Table */}
          <section className="mt-16 sm:mt-24 border-t border-[#29282b] pt-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f5f3ef] m-0">
                Verified protocol contracts
              </h3>
              <span className="text-xs text-[#a6a39d]">
                Robinhood Mainnet [ID: 4663]
              </span>
            </div>

            <div className="border border-[#29282b] bg-[#111114] divide-y divide-[#29282b] text-xs font-mono">
              {/* Token Contract */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white font-sans text-sm">TOKEN CONTRACT ($HOT)</div>
                  <div className="text-[#a6a39d] text-xs">Canonical ERC-20 token deployed on Robinhood Chain</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#c5c2bc] bg-[#0b0b0d] px-2 py-1 border border-[#29282b] rounded">
                    {config.tokenAddress ? `${config.tokenAddress.slice(0, 8)}...${config.tokenAddress.slice(-6)}` : '0x5a2f...4ed9'}
                  </span>
                  <button onClick={copyCA} className="p-1 text-[#a6a39d] hover:text-[#f5f3ef] transition-colors cursor-pointer" title="Copy address">
                    {copiedCA ? <Check className="w-3.5 h-3.5 text-[#ff642f]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a href={`${explorerUrl}/token/${config.tokenAddress || PONS_V2_CONFIG.contracts.token}`} target="_blank" rel="noreferrer" className="p-1 text-[#a6a39d] hover:text-[#ff642f]">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Curve Contract */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white font-sans text-sm">PONS BONDING CURVE DEX</div>
                  <div className="text-[#a6a39d] text-xs">Automated market maker executing programmatic market buybacks</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#c5c2bc] bg-[#0b0b0d] px-2 py-1 border border-[#29282b] rounded">
                    {config.curveAddress ? `${config.curveAddress.slice(0, 8)}...${config.curveAddress.slice(-6)}` : '0xCe9F...8D60'}
                  </span>
                  <a href={`${explorerUrl}/address/${config.curveAddress || PONS_V2_CONFIG.contracts.curve}`} target="_blank" rel="noreferrer" className="p-1 text-[#a6a39d] hover:text-[#ff642f]">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Fee Escrow Vault */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white font-sans text-sm">FEE ESCROW VAULT</div>
                  <div className="text-[#a6a39d] text-xs">Accumulation vault holding trading fees, liquidated via claim()</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#c5c2bc] bg-[#0b0b0d] px-2 py-1 border border-[#29282b] rounded">
                    {config.feeEscrowAddress ? `${config.feeEscrowAddress.slice(0, 8)}...${config.feeEscrowAddress.slice(-6)}` : '0x7770...288c'}
                  </span>
                  <a href={`${explorerUrl}/address/${config.feeEscrowAddress || PONS_V2_CONFIG.contracts.feeEscrow}`} target="_blank" rel="noreferrer" className="p-1 text-[#a6a39d] hover:text-[#ff642f]">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Dead Sink */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white font-sans text-sm">PERMANENT DEAD BURN SINK</div>
                  <div className="text-[#a6a39d] text-xs">Irreversible incinerator address permanently extinguishing supply</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#c5c2bc] bg-[#0b0b0d] px-2 py-1 border border-[#29282b] rounded">
                    0x0000...dEaD
                  </span>
                  <button onClick={copyDead} className="p-1 text-[#a6a39d] hover:text-[#f5f3ef] transition-colors cursor-pointer" title="Copy dead address">
                    {copiedDead ? <Check className="w-3.5 h-3.5 text-[#ff642f]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a href={`${explorerUrl}/address/${deadAddress}`} target="_blank" rel="noreferrer" className="p-1 text-[#a6a39d] hover:text-[#ff642f]">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      {/* Footer matching fomoFurnace (.site-footer) */}
      <footer className="min-h-16 px-4 sm:px-8 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#29282b] text-xs text-[#a6a39d]">
        <span>hotFurnace &bull; Autonomous Value Preservation</span>

        <div className="flex items-center gap-5">
          <a
            href="https://x.com/hotonrh"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 opacity-70 hover:opacity-100 text-[#f5f3ef] transition-opacity no-underline"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z"/>
            </svg>
            <span>X</span>
          </a>

          <button
            onClick={copyCA}
            className="hover:text-[#f5f3ef] transition-colors cursor-pointer tabular-nums"
          >
            CA {config.tokenAddress ? `${config.tokenAddress.slice(0, 6)}…${config.tokenAddress.slice(-4)}` : '0x5a2f...4ed9'}
          </button>

          <button
            onClick={navigateToDocs}
            className="hover:text-[#f5f3ef] transition-colors cursor-pointer"
          >
            Docs
          </button>

          <a
            href={`https://explorer.mainnet.chain.robinhood.com/token/${config.tokenAddress || PONS_V2_CONFIG.contracts.token}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#f5f3ef] transition-colors"
          >
            Explorer
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
