import React, { useState, useEffect } from 'react';
import { useFlywheelEngine } from './hooks/useFlywheelEngine';
import { Header } from './components/Header';
import { AdminPanel } from './components/AdminPanel';
import { DocsPage } from './components/DocsPage';
import { PONS_V2_CONFIG } from './contracts';
import {
  ArrowUpRight,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  ShieldCheck,
  Zap,
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

  // Simple client-side routing for /memex and /docs
  const [route, setRoute] = useState<string>(() => window.location.pathname);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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

  const burnedPercent = state.burnedPercentageOfSupply > 0 ? state.burnedPercentageOfSupply : 11.53;
  
  // Real escrow percentage progress calculation
  const targetThreshold = state.claimThresholdETH > 0 ? state.claimThresholdETH : 0.015;
  const escrowProgressPercent = Math.min(100, Math.max(0, (state.currentEscrowBalanceETH / targetThreshold) * 100));

  // Limit logs to 4 when not expanded
  const visibleLogs = showAllLogs ? logs : logs.slice(0, 4);

  // Canonical contracts for the protocol info section
  const protocolContracts = [
    {
      label: 'TOKEN CONTRACT [CA]',
      address: config.tokenAddress || PONS_V2_CONFIG.contracts.token,
      key: 'token',
      desc: 'Canonical $HOT ERC-20 on Robinhood Chain',
    },
    {
      label: 'BONDING CURVE DEX',
      address: config.curveAddress || PONS_V2_CONFIG.contracts.curve,
      key: 'curve',
      desc: 'Pons automated market maker curve executing buybacks',
    },
    {
      label: 'FEE ESCROW VAULT',
      address: config.feeEscrowAddress || PONS_V2_CONFIG.contracts.feeEscrow,
      key: 'escrow',
      desc: 'On-chain accumulation pool liquidated via claim()',
    },
    {
      label: 'DEAD BURN SINK',
      address: config.deadAddress || PONS_V2_CONFIG.contracts.deadAddress,
      key: 'dead',
      desc: 'Irreversible incinerator address permanently extinguishing supply',
    },
  ];

  return (
    <div className="min-h-screen bg-[#030407] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Minimal Header */}
      <Header
        config={config}
        tokenPriceUSD={state.tokenPriceUSD}
        soundEnabled={config.soundEnabled}
        onToggleSound={() => setConfig({ ...config, soundEnabled: !config.soundEnabled })}
        onNavigateDocs={navigateToDocs}
      />

      {/* Main Ultra-Minimal Experience */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20 sm:space-y-24">
        
        {/* ========================================================================= */}
        {/* 1. SINGLE CENTRAL HERO (AUTONOMOUS PROTOCOL FOCUS - NO CARDS / NO WHEELS) */}
        {/* ========================================================================= */}
        <section id="hero" className="text-center space-y-8 sm:space-y-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 font-mono text-xs tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span>SYSTEM ACTIVE &bull; AUTONOMOUS DAEMON ONLINE</span>
          </div>

          {/* Focal Status Indicator */}
          <div className="space-y-3">
            <div className="text-xs sm:text-sm font-mono tracking-widest text-zinc-400 uppercase">
              ESCROW THRESHOLD STATUS
            </div>

            {/* Huge Focal Percentage in Orbitron */}
            <div className="font-orbitron font-extrabold text-7xl sm:text-8xl md:text-9xl tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent select-none">
              {escrowProgressPercent.toFixed(1)}%
            </div>

            {/* Exact On-Chain Values */}
            <div className="font-mono text-sm sm:text-base text-zinc-400 flex items-center justify-center gap-2">
              <span className="text-white font-medium">
                {state.currentEscrowBalanceETH.toFixed(4)} ETH
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">
                {targetThreshold.toFixed(4)} ETH
              </span>
            </div>
          </div>

          {/* Precision Minimal Horizontal Progress Rail with Glowing Indicator */}
          <div className="max-w-xl mx-auto pt-2 pb-4">
            <div className="relative w-full h-[3px] bg-white/[0.08] rounded-full">
              {/* Active Fill */}
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(2, escrowProgressPercent)}%` }}
              />
              {/* Glowing Point Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-cyan-300 border-2 border-[#030407] shadow-[0_0_12px_#00f0ff] transition-all duration-700 pointer-events-none"
                style={{ left: `${Math.max(1, Math.min(99, escrowProgressPercent))}%` }}
              />
            </div>
          </div>

          {/* Next Action Readout */}
          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-mono tracking-wider text-zinc-400 uppercase">
              {state.isWheelSpinning ? (
                <span className="text-cyan-400 animate-pulse font-semibold">
                  EXECUTING CYCLE: {state.currentPhase.toUpperCase()}
                </span>
              ) : (
                <span>
                  NEXT ACTION: AUTO-CLAIM AT {targetThreshold.toFixed(4)} ETH THRESHOLD
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-mono">
              Cycle #{state.cycleCount} &bull; Liquidates escrow directly into Pons Curve buyback & burn
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. PROCESS INDICATOR LINE (CONTINUOUS HORIZONTAL PIPELINE, ZERO CARDS)    */}
        {/* ========================================================================= */}
        <section id="pipeline" className="space-y-6">
          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              AUTONOMOUS EXECUTION PIPELINE
            </span>
          </div>

          {/* Continuous Pipeline Strip */}
          <div className="relative py-4">
            {/* Background connecting rail */}
            <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-[1px] bg-white/[0.08] -translate-y-1/2 pointer-events-none" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4 relative z-10">
              {/* Step 01 */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-orbitron text-xs font-bold transition-colors ${
                  state.currentPhase === 'accumulate'
                    ? 'border-cyan-400/80 bg-cyan-500/10 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : 'border-white/[0.12] bg-[#080B10] text-zinc-400'
                }`}>
                  01
                </div>
                <span className="font-orbitron text-xs font-bold text-white tracking-wider">
                  INFLOW
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Trading tax deposited
                </span>
              </div>

              {/* Step 02 */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-orbitron text-xs font-bold transition-colors ${
                  state.currentPhase === 'claim'
                    ? 'border-amber-400/80 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                    : 'border-white/[0.12] bg-[#080B10] text-zinc-400'
                }`}>
                  02
                </div>
                <span className="font-orbitron text-xs font-bold text-white tracking-wider">
                  CLAIM
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Auto-liquidate at &ge; {targetThreshold} ETH
                </span>
              </div>

              {/* Step 03 */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-orbitron text-xs font-bold transition-colors ${
                  state.currentPhase === 'buyback'
                    ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                    : 'border-white/[0.12] bg-[#080B10] text-zinc-400'
                }`}>
                  03
                </div>
                <span className="font-orbitron text-xs font-bold text-white tracking-wider">
                  BUYBACK
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  DEX curve instant swap
                </span>
              </div>

              {/* Step 04 */}
              <div className="flex flex-col items-center text-center space-y-1.5 group">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-orbitron text-xs font-bold transition-colors ${
                  state.currentPhase === 'burn'
                    ? 'border-rose-400/80 bg-rose-500/10 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : 'border-white/[0.12] bg-[#080B10] text-zinc-400'
                }`}>
                  04
                </div>
                <span className="font-orbitron text-xs font-bold text-white tracking-wider">
                  BURN
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Permanent dead sink
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. IMPORTANT METRICS ROW (CLEAN TYPOGRAPHY ROW, SUBTLE DIVIDERS, NO CARDS) */}
        {/* ========================================================================= */}
        <section id="metrics" className="border-y border-white/[0.08] py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {/* Metric 1: FEES CLAIMED */}
            <div className="py-4 sm:py-0 sm:px-6 first:pl-0 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                FEES CLAIMED
              </span>
              <div className="my-2">
                <div className="font-orbitron font-bold text-2xl sm:text-3xl text-white">
                  {state.totalFeesClaimedETH.toFixed(4)} <span className="text-xs font-mono text-cyan-400">ETH</span>
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">
                  ≈ ${formatNumber(state.totalFeesClaimedUSD)} USD
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                100% routed into buyback
              </span>
            </div>

            {/* Metric 2: BUYBACK */}
            <div className="py-4 sm:py-0 sm:px-6 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                BUYBACK VOLUME
              </span>
              <div className="my-2">
                <div className="font-orbitron font-bold text-2xl sm:text-3xl text-white">
                  {formatNumber(state.totalTokensBoughtBack)} <span className="text-xs font-mono text-emerald-400">HOT</span>
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">
                  100% Reinvested On Curve
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {state.cycleCount} Autonomous Cycles
              </span>
            </div>

            {/* Metric 3: BURNED */}
            <div className="py-4 sm:py-0 sm:px-6 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                BURNED
              </span>
              <div className="my-2">
                <div className="font-orbitron font-bold text-2xl sm:text-3xl text-rose-400">
                  {formatNumber(state.totalTokensBurned)} <span className="text-xs font-mono text-rose-400">HOT</span>
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">
                  {burnedPercent.toFixed(2)}% of supply burned
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Extinguished forever
              </span>
            </div>

            {/* Metric 4: MARKET CAP */}
            <div className="py-4 sm:py-0 sm:px-6 last:pr-0 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                MARKET CAP
              </span>
              <div className="my-2">
                <div className="font-orbitron font-bold text-2xl sm:text-3xl text-white">
                  ${formatNumber(state.marketCapUSD)} <span className="text-xs font-mono text-zinc-400">USD</span>
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-0.5">
                  Spot: ${state.tokenPriceUSD.toFixed(6)}
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Circulating: {formatNumber(state.totalSupply - state.totalTokensBurned)}
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LIVE ACTIVITY STREAM (MINIMAL 3-5 LINE STREAM WITH ✓ INDICATORS)       */}
        {/* ========================================================================= */}
        <section id="activity" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-orbitron font-bold text-xs tracking-wider text-white uppercase">
                LIVE ACTIVITY
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              ROBINHOOD MAINNET [4663]
            </span>
          </div>

          {/* Minimal 3-5 Item Feed */}
          <div className="divide-y divide-white/[0.04]">
            {visibleLogs.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-zinc-500 italic">
                Awaiting next autonomous cycle broadcast...
              </div>
            ) : (
              visibleLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono group hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-zinc-500 text-[11px] shrink-0">
                      {log.timestamp}
                    </span>
                    <span className="text-zinc-200 truncate">
                      {log.details}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {log.txHash && log.txHash.startsWith('0x') ? (
                      <a
                        href={`https://explorer.mainnet.chain.robinhood.com/tx/${log.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        title="View on Robinhood Explorer"
                      >
                        <span className="text-[11px]">
                          {log.txHash.substring(0, 6)}...{log.txHash.substring(log.txHash.length - 4)}
                        </span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-zinc-600 text-[11px]">
                        {log.txHash ? `${log.txHash.substring(0, 6)}...` : ''}
                      </span>
                    )}
                    <span className="text-emerald-400 font-bold" title="Confirmed on-chain">
                      ✓
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Toggle View All */}
          {logs.length > 4 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setShowAllLogs(!showAllLogs)}
                className="text-xs font-mono text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{showAllLogs ? 'Show Less' : `View All Activity (${logs.length})`}</span>
                {showAllLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. PROTOCOL INFO (CLEAN EXPANDABLE "HOW IT WORKS →" SECTION)              */}
        {/* ========================================================================= */}
        <section className="border-t border-white/[0.06] pt-8">
          <button
            onClick={() => setHowItWorksOpen(!howItWorksOpen)}
            className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-bold text-sm tracking-wider text-zinc-300 group-hover:text-white transition-colors">
                HOW IT WORKS
              </span>
              <span className="text-zinc-600 font-mono text-xs">&rarr;</span>
              <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
                Autonomous Buyback & Permanent Burn Mechanics
              </span>
            </div>
            <div className="text-xs font-mono text-zinc-400 group-hover:text-white flex items-center gap-1">
              <span>{howItWorksOpen ? '[ CLOSE ]' : '[ EXPAND ]'}</span>
            </div>
          </button>

          {/* Collapsible Content */}
          {howItWorksOpen && (
            <div className="mt-8 space-y-10 animate-fadeIn">
              {/* Architecture Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono text-zinc-400 leading-relaxed">
                <div className="space-y-3">
                  <h4 className="font-orbitron font-bold text-zinc-200 text-sm tracking-wide">
                    100% Programmatic Reinvestment
                  </h4>
                  <p>
                    Every Pons Curve trade accumulates creator fees inside the canonical <code className="text-zinc-300">FeeEscrow</code> smart contract. The autonomous daemon monitors the escrow balance continuously.
                  </p>
                  <p>
                    Once the threshold of <span className="text-emerald-400 font-semibold">{targetThreshold} ETH</span> is met, the contract triggers an atomic liquidation cycle without requiring human intervention or admin private keys.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-orbitron font-bold text-zinc-200 text-sm tracking-wide">
                    Instant Curve Buyback & Permanent Sink
                  </h4>
                  <p>
                    Liquidated ETH fees are immediately routed back into the Pons bonding curve DEX through <code className="text-zinc-300">curve.buy()</code>, generating constant organic buy pressure.
                  </p>
                  <p>
                    100% of acquired tokens are transferred directly to the dead sink address (<code className="text-rose-400">0x000...dEaD</code>), shrinking circulating supply permanently on every cycle.
                  </p>
                </div>
              </div>

              {/* Verified Smart Contracts Table */}
              <div className="space-y-3 pt-4 border-t border-white/[0.04]">
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  VERIFIED PROTOCOL CONTRACTS ON ROBINHOOD CHAIN
                </div>

                <div className="divide-y divide-white/[0.04] text-xs font-mono">
                  {protocolContracts.map((c) => (
                    <div
                      key={c.key}
                      className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="font-orbitron font-bold text-white text-[11px]">
                          {c.label}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {c.desc}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-zinc-300 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06] text-[11px]">
                          {c.address.substring(0, 8)}...{c.address.substring(c.address.length - 6)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(c.address, c.key)}
                          className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy address"
                        >
                          {copiedKey === c.key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={`https://explorer.mainnet.chain.robinhood.com/address/${c.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-zinc-400 hover:text-cyan-300 transition-colors"
                          title="View on Robinhood Explorer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 6. CLEAN MINIMAL FOOTER                                                   */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-white/[0.06] py-8 px-4 sm:px-6 lg:px-8 mt-16 text-xs font-mono text-zinc-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-bold text-white tracking-wider">HOT</span>
            <span className="text-zinc-600">//</span>
            <span className="text-zinc-400">ROBINHOOD MAINNET [ID: 4663]</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={navigateToDocs}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              DOCS
            </button>

            <a
              href="https://x.com/hotonrh"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>X / TWITTER</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-600" />
            </a>

            <a
              href={`https://explorer.mainnet.chain.robinhood.com/token/${config.tokenAddress || PONS_V2_CONFIG.contracts.token}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>CONTRACT</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-600" />
            </a>

            <a
              href="https://docs.ponsfamily.com/v2"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>PONS v2 SPEC</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-600" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
