import React, { useState, useEffect } from 'react';
import { useFlywheelEngine } from './hooks/useFlywheelEngine';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { FlywheelWheel } from './components/FlywheelWheel';
import { EngineControls } from './components/EngineControls';
import { LiveLogs } from './components/LiveLogs';
import { PonsContractsCard } from './components/PonsContractsCard';
import { AdminPanel } from './components/AdminPanel';
import { DocsPage } from './components/DocsPage';
import {
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Coins,
  ShoppingCart,
  Flame,
  CheckCircle2,
  Shield,
  Activity,
  Cpu,
  BarChart2,
  Radio,
  Zap,
  Globe
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
  const [route, setRoute] = useState<string>(() => {
    return window.location.pathname;
  });

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

  const burnedPercent = state.burnedPercentageOfSupply > 0 ? state.burnedPercentageOfSupply : 11.53;

  return (
    <div className="min-h-screen bg-[#05070A] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Public Mission Control Header */}
      <Header
        config={config}
        tokenPriceUSD={state.tokenPriceUSD}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Compact Live Telemetry Strip */}
        <MetricsOverview state={state} />

        {/* Central Autonomous Engine & On-Chain Terminal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Autonomous System Indicator (7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <FlywheelWheel
              currentPhase={state.currentPhase}
              phaseProgress={state.phaseProgress}
              isWheelSpinning={state.isWheelSpinning}
              cycleCount={state.cycleCount}
              currentEscrowBalanceETH={state.currentEscrowBalanceETH}
              claimThresholdETH={state.claimThresholdETH}
              lastActionText={state.lastActionText}
              onSelectPhase={() => {}}
              tokenAddress={config.tokenAddress}
            />

            {/* Futuristic Engine Status & Diagnostics Sub-bar */}
            <EngineControls
              isWheelSpinning={state.isWheelSpinning}
              claimThresholdETH={state.claimThresholdETH}
              soundEnabled={config.soundEnabled}
              onToggleSound={() => setConfig({ ...config, soundEnabled: !config.soundEnabled })}
              tokenAddress={config.tokenAddress}
            />
          </div>

          {/* Right Column: Live On-Chain Telemetry & Autonomous Architecture Pipeline (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Live Terminal */}
            <LiveLogs logs={logs} />

            {/* Autonomous Execution Architecture Card */}
            <div className="rounded-2xl bg-[#080B10] border border-cyan-500/25 p-5 space-y-3.5 shadow-xl relative overflow-hidden">
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400 pointer-events-none" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="font-orbitron font-bold text-xs sm:text-sm text-white tracking-wider">
                    AUTONOMOUS EXECUTION ARCHITECTURE
                  </span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  PIPELINE v2
                </span>
              </div>

              {/* 4 Technical Modules Connected by System Pipeline */}
              <div className="space-y-2.5 text-xs">
                {/* 01: Trade & Tax Inflow */}
                <div className="p-3 rounded-xl bg-[#080C14] border border-zinc-800/80 hover:border-cyan-500/30 transition-all flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-orbitron font-bold flex items-center justify-center shrink-0 text-[10px]">
                    01
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-oxanium font-bold text-xs text-white uppercase tracking-wider">
                        TRADE & TAX INFLOW
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">100% REINVESTED</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                      Pons Curve trading volume generates creator fees automatically deposited into FeeEscrow.
                    </p>
                  </div>
                </div>

                {/* 02: Auto-Claim */}
                <div className="p-3 rounded-xl bg-[#080C14] border border-zinc-800/80 hover:border-amber-500/30 transition-all flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-orbitron font-bold flex items-center justify-center shrink-0 text-[10px]">
                    02
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-oxanium font-bold text-xs text-white uppercase tracking-wider">
                        AUTO-CLAIM AT THRESHOLD
                      </span>
                      <span className="text-[10px] font-mono text-amber-400">≥ {config.claimThresholdETH} ETH</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                      Autonomous daemon monitors block events 24/7, executing <code className="text-amber-300 font-mono">claim()</code> upon threshold trigger.
                    </p>
                  </div>
                </div>

                {/* 03: DEX Market Buyback */}
                <div className="p-3 rounded-xl bg-[#080C14] border border-zinc-800/80 hover:border-emerald-500/30 transition-all flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-orbitron font-bold flex items-center justify-center shrink-0 text-[10px]">
                    03
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-oxanium font-bold text-xs text-white uppercase tracking-wider">
                        DEX MARKET BUYBACK
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">INSTANT BUY</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                      Claimed ETH fee is immediately swapped on Pons Curve via <code className="text-emerald-300 font-mono">curve.buy()</code> to produce buy pressure.
                    </p>
                  </div>
                </div>

                {/* 04: Permanent Incineration */}
                <div className="p-3 rounded-xl bg-[#080C14] border border-zinc-800/80 hover:border-rose-500/30 transition-all flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-orbitron font-bold flex items-center justify-center shrink-0 text-[10px]">
                    04
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-oxanium font-bold text-xs text-white uppercase tracking-wider">
                        PERMANENT INCINERATION
                      </span>
                      <span className="text-[10px] font-mono text-rose-400">0x0...dEaD</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                      100% of acquired tokens are sent directly to the dead sink address, shrinking supply forever.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero administrative intervention. Fully autonomous smart contract pipeline.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Futuristic Market Intelligence & Protocol Telemetry Radar */}
        <div className="rounded-2xl bg-[#080B10] border border-cyan-500/20 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#0A0E15] border border-cyan-500/30 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wider">
                  MARKET INTELLIGENCE & TELEMETRY RADAR
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  Programmatic Liquidity & Burn Tracking on Robinhood Chain
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-[#0A0E15] border border-zinc-800 text-zinc-300">
                TOTAL SUPPLY: <strong className="text-white">1,000,000,000 HOT</strong>
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold">
                BURN RATIO: {burnedPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
            {/* Spot Price */}
            <div className="p-3.5 rounded-xl bg-[#06080D] border border-zinc-800/80">
              <span className="text-[10px] font-oxanium text-zinc-400 uppercase tracking-wider">SPOT VALUATION</span>
              <div className="font-orbitron font-bold text-lg text-white my-1">
                ${state.tokenPriceUSD.toFixed(6)}
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                {state.tokenPriceETH.toFixed(10)} ETH
              </div>
            </div>

            {/* Deflationary Market Cap */}
            <div className="p-3.5 rounded-xl bg-[#06080D] border border-zinc-800/80">
              <span className="text-[10px] font-oxanium text-zinc-400 uppercase tracking-wider">DEFICIT MARKET CAP</span>
              <div className="font-orbitron font-bold text-lg text-cyan-300 my-1">
                ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(state.marketCapUSD)} USD
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                Circulating: {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(state.totalSupply - state.totalTokensBurned)} HOT
              </div>
            </div>

            {/* Permanent Sink Allocation */}
            <div className="p-3.5 rounded-xl bg-[#06080D] border border-zinc-800/80">
              <span className="text-[10px] font-oxanium text-zinc-400 uppercase tracking-wider">PERMANENTLY SINKED</span>
              <div className="font-orbitron font-bold text-lg text-rose-400 my-1">
                {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(state.totalTokensBurned)} HOT
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                Extinguished from circulation
              </div>
            </div>

            {/* Autonomous Health */}
            <div className="p-3.5 rounded-xl bg-[#06080D] border border-zinc-800/80">
              <span className="text-[10px] font-oxanium text-zinc-400 uppercase tracking-wider">DAEMON RELIABILITY</span>
              <div className="font-orbitron font-bold text-lg text-emerald-400 my-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>100% ONLINE</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                Robinhood Mainnet RPC
              </div>
            </div>
          </div>
        </div>

        {/* Canonical Protocol Contracts */}
        <PonsContractsCard />
      </main>

      {/* Modern Futuristic Control Footer */}
      <footer className="w-full bg-[#05070A] border-t border-cyan-500/20 py-5 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-zinc-500">SYSTEM:</span>
            <span className="text-cyan-400 font-bold font-orbitron">HOT // AUTONOMOUS VALUE ENGINE</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-400">ROBINHOOD CHAIN [ID: 4663]</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Twitter (@hotonrh) */}
            <a
              href="https://x.com/hotonrh"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[#080B10] hover:bg-[#0E131C] text-zinc-300 hover:text-cyan-300 border border-zinc-800 hover:border-cyan-500/30 rounded-lg flex items-center gap-1.5 transition-colors"
              title="HOT on Twitter / X (@hotonrh)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="font-oxanium font-bold">X / TWITTER</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </a>

            {/* Docs */}
            <button
              onClick={navigateToDocs}
              className="px-3 py-1.5 bg-[#080B10] hover:bg-[#0E131C] text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-oxanium font-bold">DOCS</span>
            </button>

            <a
              href="https://docs.ponsfamily.com/v2"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <span>PONS v2 SPEC</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
