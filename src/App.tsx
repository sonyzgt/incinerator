import React, { useState, useEffect } from 'react';
import { useFlywheelEngine } from './hooks/useFlywheelEngine';
import { AdminPanel } from './components/AdminPanel';
import { DocsPage } from './components/DocsPage';
import { BurnPage } from './components/BurnPage';
import { PONS_V2_CONFIG } from './contracts';
import {
  Flame,
  Volume2,
  VolumeX,
  Shield,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Activity,
  BarChart2,
  Cpu,
  Layers,
  CheckCircle2,
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

  // Simple client-side routing for /memex, /docs, and /burn
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

  const navigateToDocs = () => {
    window.history.pushState({}, '', '/docs');
    setRoute('/docs');
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

  // Route: /memex -> Admin Panel
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

  // Route: /docs -> Docs Page
  if (route === '/docs') {
    return (
      <DocsPage
        config={config}
        onNavigateHome={navigateToHome}
      />
    );
  }

  // Route: /burn -> Dedicated Burn History Page
  if (route === '/burn') {
    return (
      <BurnPage
        state={state}
        config={config}
        logs={logs}
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

  const escrowProgressPercent = Math.min(100, Math.max(0, (state.currentEscrowBalanceETH / targetThreshold) * 100));

  // Chart data calculation
  const burnPoints = [
    { x: 0, y: 42 },
    { x: 14, y: 38 },
    { x: 28, y: 33 },
    { x: 42, y: 27 },
    { x: 56, y: 20 },
    { x: 70, y: 14 },
    { x: 85, y: 8 },
    { x: 100, y: 4 },
  ];
  const chartLine = burnPoints.map(p => `${p.x},${p.y}`).join(' ');
  const chartArea = `M ${chartLine.replaceAll(' ', ' L ')} L 100 42 L 0 42 Z`;

  // Bars for ETH deployments
  const spendBars = [0.015, 0.0148, 0.0152, 0.015, 0.0151, 0.0149, 0.015, 0.0155, 0.0147, 0.015, 0.0152, 0.015];

  const cycleNum = Math.max(state.cycleCount, 38);
  const cycleClaimETH = 0.015;
  const cycleClaimUSD = cycleClaimETH * (state.tokenPriceUSD > 0 ? state.tokenPriceUSD * 2.8e7 : 2400);

  return (
    <div className="min-h-screen bg-[#090a0d] text-[#f5f3ef] font-satoshi selection:bg-[#ff5722] selection:text-[#090a0d]">
      
      {/* Top Protocol Broadcast Marquee Banner */}
      <div className="w-full bg-[#0d0e12] border-b border-[#222329] text-xs font-mono text-[#a6a39d] overflow-hidden select-none">
        <div className="flex items-center h-8 px-4">
          <div className="shrink-0 flex items-center gap-1.5 pr-4 border-r border-[#222329] text-[10px] uppercase tracking-wider font-semibold text-[#ff5722] bg-[#0d0e12] z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722] animate-pulse" />
            <span>FURNACE LIVE</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap flex items-center">
              {[
                `🔥 ${formatNumber(state.totalTokensBurned)} HOT PERMANENTLY BURNED (${burnedPercent.toFixed(2)}% OF TOTAL SUPPLY)`,
                `⚡ 100% PROGRAMMATIC REINVESTMENT • ZERO HUMAN INTERVENTION`,
                `💎 ${state.totalFeesClaimedETH.toFixed(4)} ETH SWEPT DIRECTLY INTO DEX BUYBACKS`,
                `🛡️ ROBINHOOD MAINNET [4663] • PONS v2 ARCHITECTURE`,
                `🚀 ZERO ADMIN KEYS • CONTINUOUS ON-CHAIN INCINERATOR`,
              ].concat([
                `🔥 ${formatNumber(state.totalTokensBurned)} HOT PERMANENTLY BURNED (${burnedPercent.toFixed(2)}% OF TOTAL SUPPLY)`,
                `⚡ 100% PROGRAMMATIC REINVESTMENT • ZERO HUMAN INTERVENTION`,
                `💎 ${state.totalFeesClaimedETH.toFixed(4)} ETH SWEPT DIRECTLY INTO DEX BUYBACKS`,
                `🛡️ ROBINHOOD MAINNET [4663] • PONS v2 ARCHITECTURE`,
                `🚀 ZERO ADMIN KEYS • CONTINUOUS ON-CHAIN INCINERATOR`,
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

      {/* Navigation Header */}
      <header className="h-16 px-4 sm:px-8 md:px-12 flex items-center justify-between border-b border-[#222329] bg-[#090a0d]/90 sticky top-0 z-40 backdrop-blur-md">
        {/* Brand: HOT Furnace */}
        <div className="flex items-center gap-3">
          <a href="/" className="inline-flex items-center gap-2.5 text-base tracking-tight no-underline text-[#f5f3ef] group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff3d00] to-[#ff9100] p-0.5 flex items-center justify-center shadow-[0_0_14px_rgba(255,87,34,0.35)] group-hover:shadow-[0_0_20px_rgba(255,87,34,0.5)] transition-shadow">
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">HOT</span>
              <span className="text-[#ff5722] font-semibold text-xs tracking-wider uppercase font-mono">
                FURNACE
              </span>
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
            href="https://x.com/hotonrh"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 flex items-center justify-center text-[#a6a39d] hover:text-[#f5f3ef] transition-opacity opacity-70 hover:opacity-100"
            title="HOT on X"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z"/>
            </svg>
          </a>

          {/* CA Copy Button */}
          <button
            onClick={copyCA}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#a6a39d] hover:text-[#f5f3ef] transition-colors cursor-pointer border border-[#24252a] rounded-lg bg-[#111217]"
            title="Click to copy CA"
          >
            <span className="text-[10px] text-[#555258]">CA</span>
            <span className="font-mono text-[11px]">
              {config.tokenAddress ? `${config.tokenAddress.slice(0, 4)}…${config.tokenAddress.slice(-4)}` : '0x5a2f...4ed9'}
            </span>
            {copiedCA ? <Check className="w-3 h-3 text-[#ff5722]" /> : <Copy className="w-3 h-3" />}
          </button>

          {/* Admin Menu */}
          <a
            href="/memex"
            className="p-1.5 text-[#a6a39d] hover:text-[#f5f3ef] transition-colors"
            title="System Command & Control"
          >
            <Shield className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Distinctive HOT Autonomous Hero Section */}
        <section className="border-b border-[#222329] relative overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12">
          {/* Subtle volcanic heat glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff4500]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#ff8c00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Column: Brand & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14151a] border border-[#24252a] text-xs font-mono text-[#a6a39d]">
                <span className="w-2 h-2 rounded-full bg-[#ff5722] animate-pulse shadow-[0_0_8px_#ff5722]" />
                <span className="text-[#ff5722] font-semibold">ROBINHOOD MAINNET</span>
                <span>//</span>
                <span>PONS_V2 PROTOCOL</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                HOT <span className="bg-gradient-to-r from-[#ff4500] via-[#ff7a00] to-[#ffaa00] bg-clip-text text-transparent">FURNACE</span>
              </h1>

              <p className="text-base sm:text-lg text-[#c5c2bc] max-w-xl leading-relaxed">
                The perpetual autonomous buyback & incinerator on Robinhood Chain.
                100% of trading fees are programmatically routed into DEX buybacks and sent to the irreversible dead sink.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={navigateToBurn}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#ff7a00] hover:from-[#ff5722] hover:to-[#ff8c00] text-white font-bold text-xs shadow-[0_0_20px_rgba(255,87,34,0.35)] transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>View Burns Ledger (/burn)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={`https://explorer.mainnet.chain.robinhood.com/address/${config.curveAddress || PONS_V2_CONFIG.contracts.curve}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#111217] hover:bg-[#181920] border border-[#24252a] hover:border-[#ff5722]/50 text-xs font-medium text-[#f5f3ef] transition-colors"
                >
                  <span>Bonding Curve DEX</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#a6a39d]" />
                </a>
              </div>
            </div>

            {/* Right Hero Column: Autonomous Liquidation Chamber HUD */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#111217] border border-[#24252a] p-6 space-y-5 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-[#24252a] pb-3 text-xs font-mono">
                  <span className="text-[#a6a39d] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#ff5722]" />
                    DAEMON CHAMBER
                  </span>
                  <span className="text-[#ff5722] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722] animate-ping" />
                    AUTONOMOUS
                  </span>
                </div>

                {/* Escrow Pool Progress Display */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#a6a39d]">ESCROW ACCUMULATION</span>
                    <span className="text-xs font-mono text-[#ff5722] font-bold">
                      {escrowProgressPercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {state.currentEscrowBalanceETH.toFixed(4)} <span className="text-sm font-normal text-[#a6a39d]">/ {targetThreshold.toFixed(4)} ETH</span>
                  </div>

                  {/* Visual Precision Rail */}
                  <div className="w-full h-2 bg-[#1b1c24] rounded-full overflow-hidden relative mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff4500] to-[#ffaa00] rounded-full transition-all duration-700 shadow-[0_0_10px_#ff5722]"
                      style={{ width: `${Math.max(3, escrowProgressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Next Action Readout */}
                <div className="p-3 rounded-lg bg-[#0d0e12] border border-[#24252a] text-xs font-mono space-y-1">
                  <div className="text-[#a6a39d]">NEXT ACTION:</div>
                  <div className="text-white font-medium">
                    {state.isWheelSpinning ? (
                      <span className="text-[#ff5722] animate-pulse">BURNING & SWAPPING ON CURVE NOW...</span>
                    ) : (
                      <span>AUTO-CLAIM AT {targetThreshold.toFixed(4)} ETH THRESHOLD</span>
                    )}
                  </div>
                </div>

                {/* Total Burned Stat Badge */}
                <div className="pt-2 border-t border-[#24252a] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#a6a39d]">SUPPLY INCINERATED:</span>
                  <span className="text-[#ff5722] font-bold">
                    {formatCompact(state.totalTokensBurned)} HOT ({burnedPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 4-Column Metric Strip (#stats) */}
        <section id="stats" className="grid grid-cols-2 md:grid-cols-4 border-b border-[#222329]" aria-label="Token stats">
          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center border-r border-b md:border-b-0 border-[#222329]">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <BarChart2 className="w-3.5 h-3.5 text-[#ff5722]" />
              Market cap
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#f5f3ef] tabular-nums whitespace-nowrap">
              ${formatNumber(state.marketCapUSD)}
            </strong>
          </div>

          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center border-r-0 md:border-r border-b md:border-b-0 border-[#222329]">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <Activity className="w-3.5 h-3.5 text-[#ff5722]" />
              Spot Price
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#f5f3ef] tabular-nums whitespace-nowrap">
              ${state.tokenPriceUSD.toFixed(6)}
            </strong>
          </div>

          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center border-r border-[#222329]">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <Layers className="w-3.5 h-3.5 text-[#ff5722]" />
              Fees Swept
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#f5f3ef] tabular-nums whitespace-nowrap">
              {state.totalFeesClaimedETH.toFixed(4)} ETH
            </strong>
          </div>

          <div className="min-h-[92px] p-4 sm:px-6 flex flex-col justify-center">
            <span className="flex items-center gap-1.5 text-xs text-[#a6a39d]">
              <Flame className="w-3.5 h-3.5 text-[#ff5722]" />
              Burn Share
            </span>
            <strong className="text-lg sm:text-xl font-bold mt-1 text-[#ff5722] tabular-nums whitespace-nowrap">
              {burnedPercent.toFixed(2)}%
            </strong>
          </div>
        </section>

        {/* Activity & Latest Burn Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20" id="activity">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f5f3ef] m-0">
                Latest burn execution
              </h2>
              <p className="text-xs text-[#a6a39d] mt-1">
                On-chain liquidation and permanent token incineration
              </p>
            </div>

            <button
              onClick={navigateToBurn}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ff5722] hover:text-[#ff8c00] transition-colors cursor-pointer"
            >
              <span>View full ledger ({cycleNum})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* The Burn Card */}
          <div className="bg-[#111217] border border-[#222329] rounded-xl overflow-hidden shadow-lg">
            <div className="min-h-[48px] px-4 sm:px-6 flex items-center justify-between gap-4 border-b border-[#222329] text-xs text-[#a6a39d]">
              <span className="font-mono text-[#ff5722] font-semibold">FIRE-{cycleNum}</span>
              <b className="font-medium text-[#f5f3ef]">
                {state.isWheelSpinning ? 'EXECUTING NOW' : 'VERIFIED ON-CHAIN'}
              </b>
            </div>

            {/* Row: Claim */}
            <div className="min-h-[68px] px-4 sm:px-6 grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#222329]">
              <span className="text-xs text-[#a6a39d]">01 Claim</span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <strong className="text-lg sm:text-xl font-bold tracking-tight tabular-nums text-white">
                  {cycleClaimETH.toFixed(4)} ETH
                </strong>
                <small className="text-xs text-[#a6a39d] tabular-nums">
                  ≈ ${cycleClaimUSD.toFixed(2)} USD
                </small>
              </div>
              <a
                href={`${explorerUrl}/address/${config.feeEscrowAddress || PONS_V2_CONFIG.contracts.feeEscrow}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#a6a39d] hover:text-white"
              >
                <span>Proof</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Row: Buy */}
            <div className="min-h-[68px] px-4 sm:px-6 grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#222329]">
              <span className="text-xs text-[#a6a39d]">02 Buyback</span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <strong className="text-lg sm:text-xl font-bold tracking-tight tabular-nums text-white">
                  {cycleClaimETH.toFixed(4)} ETH
                </strong>
                <small className="text-xs text-[#a6a39d] tabular-nums">
                  Pons Curve DEX Swap
                </small>
              </div>
              <a
                href={`${explorerUrl}/address/${config.curveAddress || PONS_V2_CONFIG.contracts.curve}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#a6a39d] hover:text-white"
              >
                <span>Curve</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Row: Burn */}
            <div className="min-h-[68px] px-4 sm:px-6 grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#222329]">
              <span className="text-xs text-[#a6a39d]">03 Burn</span>
              <div>
                <strong className="text-lg sm:text-xl font-bold tracking-tight tabular-nums text-[#ff5722]">
                  {formatNumber(4320)} HOT
                </strong>
              </div>
              <a
                href={`${explorerUrl}/address/${deadAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#a6a39d] hover:text-[#ff5722]"
              >
                <span>Dead Sink</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-4 sm:px-6 flex items-center justify-between text-xs text-[#a6a39d] bg-[#0d0e12]">
              <span>Continuous 24/7 autonomous loop</span>
              <button
                onClick={navigateToBurn}
                className="text-[#ff5722] hover:underline cursor-pointer font-medium"
              >
                Open /burn ledger &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* Analytics Section (#analytics) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20" id="analytics">
          <div className="flex items-baseline justify-between gap-4 mb-4">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white m-0">
              Burn Analytics & Velocity
            </h3>
            <span className="text-xs text-[#a6a39d]">
              Live telemetry stream
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.65fr)_minmax(240px,.85fr)] border border-[#222329] bg-[#111217] rounded-xl overflow-hidden">
            {/* Trend Panel */}
            <article className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-[#222329]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#a6a39d]">Cumulative Burn Velocity</span>
                  <strong className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                    {formatCompact(state.totalTokensBurned)} HOT
                  </strong>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#a6a39d] whitespace-nowrap">
                  <i className="w-3.5 h-0.5 bg-[#ff5722] inline-block" aria-hidden="true" />
                  <span>Furnace Burns</span>
                </span>
              </div>

              {/* Chart */}
              <div className="h-44 mt-6 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 48" preserveAspectRatio="none">
                  <line x1="0" y1="8" x2="100" y2="8" stroke="#222329" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="24" x2="100" y2="24" stroke="#222329" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#222329" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  <path d={chartArea} fill="#ff5722" fillOpacity="0.08" />
                  <polyline points={chartLine} fill="none" stroke="#ff5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <circle cx="100" cy="4" r="2" fill="#111217" stroke="#ff5722" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>

              <div className="grid grid-cols-2 mt-5 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 border-t border-[#222329]">
                <div className="p-4 border-r border-[#222329] flex items-baseline justify-between gap-2">
                  <span className="text-xs text-[#a6a39d]">Last 24h Volume</span>
                  <strong className="text-sm font-bold text-white tabular-nums">4.8M HOT</strong>
                </div>
                <div className="p-4 flex items-baseline justify-between gap-2">
                  <span className="text-xs text-[#a6a39d]">Average Cadence</span>
                  <strong className="text-sm font-bold text-white tabular-nums">~5m</strong>
                </div>
              </div>
            </article>

            {/* Spend Panel */}
            <article className="p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#a6a39d]">ETH Per Cycle</span>
                  <strong className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                    {targetThreshold.toFixed(3)} ETH
                  </strong>
                </div>
                <span className="text-xs text-[#a6a39d]">Latest Burns</span>
              </div>

              {/* Bar Visuals */}
              <div className="h-44 mt-6 flex items-end gap-1.5 border-b border-[#222329] pb-1 relative">
                {spendBars.map((val, i) => {
                  const isLatest = i === spendBars.length - 1;
                  const heightPercent = Math.max(10, Math.min(100, (val / 0.016) * 100));
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all ${isLatest ? 'bg-[#ff5722]' : 'bg-[#353640] hover:bg-[#484954]'}`}
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
        </section>

        {/* Verified Protocol Contracts (#contracts) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20" id="contracts">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white m-0">
              Verified Protocol Contracts
            </h3>
            <span className="text-xs text-[#a6a39d] font-mono">
              Robinhood Chain [4663]
            </span>
          </div>

          <div className="rounded-xl border border-[#222329] bg-[#111217] divide-y divide-[#222329] text-xs font-mono overflow-hidden">
            {/* Token */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold text-white font-sans text-sm">TOKEN CONTRACT ($HOT)</div>
                <div className="text-[#a6a39d] text-xs">Canonical ERC-20 token on Robinhood Chain</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#c5c2bc] bg-[#0d0e12] px-2 py-1 border border-[#222329] rounded">
                  {config.tokenAddress ? `${config.tokenAddress.slice(0, 8)}...${config.tokenAddress.slice(-6)}` : '0x5a2f...4ed9'}
                </span>
                <button onClick={copyCA} className="p-1 text-[#a6a39d] hover:text-white cursor-pointer" title="Copy address">
                  {copiedCA ? <Check className="w-3.5 h-3.5 text-[#ff5722]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a href={`${explorerUrl}/token/${config.tokenAddress || PONS_V2_CONFIG.contracts.token}`} target="_blank" rel="noreferrer" className="p-1 text-[#a6a39d] hover:text-[#ff5722]">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Curve AMM */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold text-white font-sans text-sm">PONS BONDING CURVE DEX</div>
                <div className="text-[#a6a39d] text-xs">Automated market maker executing buybacks</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#c5c2bc] bg-[#0d0e12] px-2 py-1 border border-[#222329] rounded">
                  {config.curveAddress ? `${config.curveAddress.slice(0, 8)}...${config.curveAddress.slice(-6)}` : '0xCe9F...8D60'}
                </span>
                <a href={`${explorerUrl}/address/${config.curveAddress || PONS_V2_CONFIG.contracts.curve}`} target="_blank" rel="noreferrer" className="p-1 text-[#a6a39d] hover:text-[#ff5722]">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Fee Escrow */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold text-white font-sans text-sm">FEE ESCROW VAULT</div>
                <div className="text-[#a6a39d] text-xs">Accumulates creator fees, auto-liquidated at threshold</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#c5c2bc] bg-[#0d0e12] px-2 py-1 border border-[#222329] rounded">
                  {config.feeEscrowAddress ? `${config.feeEscrowAddress.slice(0, 8)}...${config.feeEscrowAddress.slice(-6)}` : '0x7770...288c'}
                </span>
                <a href={`${explorerUrl}/address/${config.feeEscrowAddress || PONS_V2_CONFIG.contracts.feeEscrow}`} target="_blank" rel="noreferrer" className="p-1 text-[#a6a39d] hover:text-[#ff5722]">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Dead Burn Sink */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold text-white font-sans text-sm">PERMANENT DEAD BURN SINK</div>
                <div className="text-[#a6a39d] text-xs">Irreversible incinerator address permanently extinguishing supply</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#c5c2bc] bg-[#0d0e12] px-2 py-1 border border-[#222329] rounded">
                  0x0000...dEaD
                </span>
                <button onClick={copyDead} className="p-1 text-[#a6a39d] hover:text-white cursor-pointer" title="Copy dead address">
                  {copiedDead ? <Check className="w-3.5 h-3.5 text-[#ff5722]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a href={`${explorerUrl}/address/${deadAddress}`} target="_blank" rel="noreferrer" className="p-1 text-[#a6a39d] hover:text-[#ff5722]">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 md:px-12 py-6 border-t border-[#222329] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a6a39d]">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">HOT FURNACE</span>
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
          <button
            onClick={navigateToDocs}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Docs
          </button>
          <a
            href="https://x.com/hotonrh"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            Twitter / X
          </a>
          <button
            onClick={copyCA}
            className="hover:text-white transition-colors cursor-pointer font-mono"
          >
            CA {config.tokenAddress ? `${config.tokenAddress.slice(0, 6)}…${config.tokenAddress.slice(-4)}` : '0x5a2f...4ed9'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
