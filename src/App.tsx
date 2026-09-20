import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FlywheelWheel } from './components/FlywheelWheel';
import { MetricsOverview } from './components/MetricsOverview';
import { EngineControls } from './components/EngineControls';
import { LiveLogs } from './components/LiveLogs';
import { PonsContractsCard } from './components/PonsContractsCard';
import { AdminPanel } from './components/AdminPanel';
import { DocsPage } from './components/DocsPage';
import { useFlywheelEngine } from './hooks/useFlywheelEngine';
import { BookOpen, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const isMemexRoute = () => {
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  return p === '/memex' || p === '/memex/' || h === '#memex' || h === '#/memex';
};

const isDocsRoute = () => {
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  return p === '/docs' || p === '/docs/' || h === '#docs' || h === '#/docs';
};

export function App() {
  const {
    state,
    config,
    setConfig,
    resetConfigToDefaults,
    logs,
    runFlywheelExecution,
  } = useFlywheelEngine();

  const getInitialRoute = () => {
    if (isMemexRoute()) return '/memex';
    if (isDocsRoute()) return '/docs';
    return '/';
  };

  const [route, setRoute] = useState<string>(getInitialRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      if (isMemexRoute()) {
        setRoute('/memex');
      } else if (isDocsRoute()) {
        setRoute('/docs');
      } else {
        setRoute('/');
      }
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

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Public Navigation Header */}
      <Header
        config={config}
        tokenPriceUSD={state.tokenPriceUSD}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Key Performance Metrics */}
        <MetricsOverview state={state} />

        {/* Central Flywheel & Execution Console Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Flywheel Visualizer HUD (7 columns on desktop) */}
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

            {/* Read-Only Public Status Bar */}
            <EngineControls
              isWheelSpinning={state.isWheelSpinning}
              claimThresholdETH={state.claimThresholdETH}
              soundEnabled={config.soundEnabled}
              onToggleSound={() => setConfig({ ...config, soundEnabled: !config.soundEnabled })}
              tokenAddress={config.tokenAddress}
            />
          </div>

          {/* Right Column: Execution Terminal & Architecture Notes (5 columns on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Live Terminal */}
            <LiveLogs logs={logs} />

            {/* Protocol Architecture Bento Card */}
            <div className="rounded-2xl bg-[#0c1017] border border-zinc-800/80 p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
                <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
                  <BookOpen className="w-4 h-4 text-orange-400" />
                  <span>Flywheel Execution Protocol</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  Pons v2
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#0e121a] border border-zinc-800/50">
                  <span className="w-5 h-5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold flex items-center justify-center shrink-0 text-[10px] font-mono">
                    01
                  </span>
                  <p className="leading-relaxed">
                    <strong className="text-white font-medium">Trading Fee Accumulation:</strong> Swaps on Pons Curve generate creator trading fees held securely in Escrow.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#0e121a] border border-zinc-800/50">
                  <span className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center justify-center shrink-0 text-[10px] font-mono">
                    02
                  </span>
                  <p className="leading-relaxed">
                    <strong className="text-white font-medium">Auto-Claim Trigger:</strong> When fees reach the target threshold, the autonomous bot calls <code className="text-amber-300 text-[11px] font-mono">claim()</code> on the FeeEscrow contract.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#0e121a] border border-zinc-800/50">
                  <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center justify-center shrink-0 text-[10px] font-mono">
                    03
                  </span>
                  <p className="leading-relaxed">
                    <strong className="text-white font-medium">DEX Market Buyback:</strong> 100% of claimed ETH is instantly swapped for $HOT via <code className="text-emerald-300 text-[11px] font-mono">curve.buy()</code>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#0e121a] border border-zinc-800/50">
                  <span className="w-5 h-5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold flex items-center justify-center shrink-0 text-[10px] font-mono">
                    04
                  </span>
                  <p className="leading-relaxed">
                    <strong className="text-white font-medium">Permanent Incineration:</strong> Acquired tokens are immediately transferred to <code className="text-rose-300 text-[11px] font-mono">0x0...dEaD</code>, shrinking supply forever.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Runs 24/7 autonomously without human intervention.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Protocol Contracts */}
        <PonsContractsCard />
      </main>

      {/* Modern Minimalist Footer */}
      <footer className="w-full bg-[#080b10] border-t border-zinc-800/80 py-5 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-zinc-500">Protocol:</span>
            <span className="text-zinc-200 font-medium">HOT Flywheel v2</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-400">Robinhood Chain (4663)</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Twitter (@hotonrh) */}
            <a
              href="https://x.com/hotonrh"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors"
              title="HOT on Twitter / X (@hotonrh)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Twitter</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </a>

            {/* Docs */}
            <button
              onClick={navigateToDocs}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
              <span>Docs</span>
            </button>

            <a
              href="https://docs.ponsfamily.com/v2"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
            >
              <span>Pons v2 Reference</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
