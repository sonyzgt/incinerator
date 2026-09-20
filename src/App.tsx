import React, { useState, useEffect } from 'react';
import { useFlywheelEngine } from './hooks/useFlywheelEngine';
import { AdminPanel } from './components/AdminPanel';
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

        {/* Autonomous Liquidation Pipeline Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20" id="activity">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#ff5722] mb-1">
                <span className="w-2 h-2 rounded-full bg-[#ff5722] animate-pulse shadow-[0_0_8px_#ff5722]" />
                <span>ON-CHAIN EXECUTION PIPELINE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0">
                Latest Autonomous Cycle [FIRE-{cycleNum}]
              </h2>
              <p className="text-xs text-[#a6a39d] mt-1">
                Atomic fee sweep from Pons Escrow, DEX curve buyback, and permanent incineration.
              </p>
            </div>

            <button
              onClick={navigateToBurn}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#14151a] hover:bg-[#1c1e26] border border-[#24252a] hover:border-[#ff5722]/40 text-xs font-medium text-[#ff5722] transition-all cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <span>View Full Ledger ({cycleNum})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3-Stage Modular Sequence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Stage 01: Fee Escrow Harvest */}
            <div className="rounded-2xl bg-gradient-to-b from-[#13141a] to-[#0e0f14] border border-[#222329] p-5 space-y-4 hover:border-[#ff5722]/30 transition-colors relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#1b1c24] text-[#a6a39d] group-hover:text-white group-hover:bg-[#ff5722]/20 font-mono text-xs font-bold flex items-center justify-center transition-colors">
                  01
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  LIQUIDATED
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-[#a6a39d] uppercase tracking-wider block">
                  FEE ESCROW HARVEST
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {cycleClaimETH.toFixed(4)} <span className="text-xs text-[#a6a39d] font-normal">ETH</span>
                </div>
                <div className="text-xs text-[#a6a39d] mt-0.5">
                  ≈ ${cycleClaimUSD.toFixed(2)} USD trade fees
                </div>
              </div>

              <div className="pt-3 border-t border-[#1f2027] flex items-center justify-between text-xs">
                <span className="text-[#65636c] font-mono text-[11px]">FeeEscrow.claim()</span>
                <a
                  href={`${explorerUrl}/address/${config.feeEscrowAddress || PONS_V2_CONFIG.contracts.feeEscrow}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#a6a39d] hover:text-white inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>Proof</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Stage 02: AMM Curve Swap */}
            <div className="rounded-2xl bg-gradient-to-b from-[#13141a] to-[#0e0f14] border border-[#222329] p-5 space-y-4 hover:border-[#ff5722]/30 transition-colors relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#1b1c24] text-[#a6a39d] group-hover:text-white group-hover:bg-[#ff5722]/20 font-mono text-xs font-bold flex items-center justify-center transition-colors">
                  02
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                  DEX SWAP
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-[#a6a39d] uppercase tracking-wider block">
                  PONS MARKET BUYBACK
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {cycleClaimETH.toFixed(4)} <span className="text-xs text-[#a6a39d] font-normal">ETH &rarr; HOT</span>
                </div>
                <div className="text-xs text-[#a6a39d] mt-0.5">
                  100% routed through Bonding Curve
                </div>
              </div>

              <div className="pt-3 border-t border-[#1f2027] flex items-center justify-between text-xs">
                <span className="text-[#65636c] font-mono text-[11px]">curve.buy()</span>
                <a
                  href={`${explorerUrl}/address/${config.curveAddress || PONS_V2_CONFIG.contracts.curve}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#a6a39d] hover:text-white inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>Curve</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Stage 03: Permanent Incineration */}
            <div className="rounded-2xl bg-gradient-to-b from-[#181313] to-[#0f0b0b] border border-[#ff5722]/30 p-5 space-y-4 shadow-[0_0_20px_rgba(255,87,34,0.1)] relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#ff5722]/20 text-[#ff5722] font-mono text-xs font-bold flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-current" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff5722]/20 text-[#ff5722] border border-[#ff5722]/30 font-bold">
                  DEAD SINK
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-[#a6a39d] uppercase tracking-wider block">
                  INCINERATED FOREVER
                </span>
                <div className="text-2xl font-bold font-mono text-[#ff5722] mt-1">
                  {formatNumber(4320)} <span className="text-xs font-normal text-[#ff7a00]">HOT</span>
                </div>
                <div className="text-xs text-[#a6a39d] mt-0.5">
                  Permanently removed from supply
                </div>
              </div>

              <div className="pt-3 border-t border-[#291b1b] flex items-center justify-between text-xs">
                <span className="text-[#a6a39d] font-mono text-[11px]">0x000...dEaD</span>
                <a
                  href={`${explorerUrl}/address/${deadAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ff5722] hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>Proof</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Execution Telemetry Strip */}
          <div className="mt-4 px-4 py-3 rounded-xl bg-[#0d0e12] border border-[#1f2027] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#a6a39d]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero administrative intervention. 100% smart contract executed.</span>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span>Auto-trigger: <strong className="text-white">{targetThreshold.toFixed(4)} ETH</strong></span>
              <span>&bull;</span>
              <button onClick={navigateToBurn} className="text-[#ff5722] hover:underline cursor-pointer">
                Full ledger &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* Distinctive Burn Analytics & Deflation Radar Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20" id="analytics">
          <div className="rounded-2xl border border-[#222329] bg-[#111217] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#ff4500]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[#222329] pb-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white m-0">
                  Deflationary Trajectory & Velocity
                </h3>
                <p className="text-xs text-[#a6a39d] mt-1 font-mono">
                  Autonomous burning momentum & circulating supply reduction over time
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-[#a6a39d]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ROBINHOOD MAINNET SYNC</span>
              </div>
            </div>

            {/* 3 Metric Summary Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-[#1f2027]">
                <span className="text-[10px] font-mono text-[#a6a39d] uppercase">TOTAL DESTROYED</span>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  {formatCompact(state.totalTokensBurned)} HOT
                </div>
                <span className="text-[11px] text-[#ff5722] font-mono font-semibold">
                  {burnedPercent.toFixed(2)}% of supply
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-[#1f2027]">
                <span className="text-[10px] font-mono text-[#a6a39d] uppercase">LAST 24H BURNS</span>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  4.85M HOT
                </div>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                  +12.4% velocity
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-[#1f2027]">
                <span className="text-[10px] font-mono text-[#a6a39d] uppercase">AVG CYCLE INTERVAL</span>
                <div className="text-xl font-bold text-white font-mono mt-0.5">
                  ~5.2 mins
                </div>
                <span className="text-[11px] text-[#a6a39d] font-mono">
                  Continuous liquidation
                </span>
              </div>
            </div>

            {/* High-Tech Area Chart */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#a6a39d]">
                <span>CUMULATIVE BURN CURVE</span>
                <span className="text-[#ff5722] font-bold">115.31M HOT REACHED</span>
              </div>

              <div className="h-48 sm:h-56 relative bg-[#090a0d] rounded-xl border border-[#1f2027] p-3 overflow-hidden">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 48" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="12" x2="100" y2="12" stroke="#1f2027" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="24" x2="100" y2="24" stroke="#1f2027" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  <line x1="0" y1="36" x2="100" y2="36" stroke="#1f2027" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

                  {/* Gradient Fill */}
                  <defs>
                    <linearGradient id="fireAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff5722" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ff5722" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={chartArea} fill="url(#fireAreaGrad)" />
                  <polyline points={chartLine} fill="none" stroke="#ff5722" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  
                  {/* Milestone checkpoints */}
                  <circle cx="28" cy="33" r="1.5" fill="#ff5722" />
                  <circle cx="56" cy="20" r="1.5" fill="#ff5722" />
                  <circle cx="85" cy="8" r="1.5" fill="#ff5722" />
                  <circle cx="100" cy="4" r="2.5" fill="#111217" stroke="#ff5722" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] font-mono text-[#555258]">
                <span>Genesis / Launch</span>
                <span>Milestone: 50M</span>
                <span>Milestone: 100M</span>
                <span className="text-[#ff5722] font-semibold">Live: 115.31M</span>
              </div>
            </div>

            {/* Recent Liquidation Consistency Heatmap */}
            <div className="pt-4 border-t border-[#1f2027] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#a6a39d]">RECENT ETH SWEEP SIZES</span>
                <span className="text-white font-bold">{targetThreshold.toFixed(3)} ETH CANONICAL TARGET</span>
              </div>

              <div className="grid grid-cols-12 gap-1 sm:gap-1.5 h-7">
                {spendBars.map((val, i) => {
                  const isLatest = i === spendBars.length - 1;
                  return (
                    <div
                      key={i}
                      className={`h-full rounded transition-all cursor-pointer relative group flex items-center justify-center ${
                        isLatest
                          ? 'bg-[#ff5722] shadow-[0_0_8px_#ff5722]'
                          : 'bg-[#1b1c24] hover:bg-[#252733]'
                      }`}
                      title={`Cycle #${cycleNum - 11 + i}: ${val.toFixed(4)} ETH deployed`}
                    >
                      <span className="text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {val.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#555258]">
                <span>← Previous completed cycles</span>
                <span className="text-[#ff5722]">● Latest executed block</span>
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
