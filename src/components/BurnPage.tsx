import React, { useState } from 'react';
import {
  Flame,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
} from 'lucide-react';
import { FlywheelState, ActivityLog, MachineConfig } from '../types';
import { PONS_V2_CONFIG } from '../contracts';

interface BurnPageProps {
  state: FlywheelState;
  config: MachineConfig;
  logs: ActivityLog[];
  onNavigateHome: () => void;
}

export const BurnPage: React.FC<BurnPageProps> = ({
  state,
  config,
  logs,
  onNavigateHome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedDead, setCopiedDead] = useState(false);

  const explorerUrl = 'https://explorer.mainnet.chain.robinhood.com';
  const deadAddress = config.deadAddress || PONS_V2_CONFIG.contracts.deadAddress;
  const burnedPercent = state.burnedPercentageOfSupply;

  const copyDead = () => {
    navigator.clipboard.writeText(deadAddress);
    setCopiedDead(true);
    setTimeout(() => setCopiedDead(false), 2000);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
  };

  // Build burn ledger entries strictly from real logs
  const burnLogs = logs.filter(
    (l) => l.phase === 'burn' || l.action?.toLowerCase().includes('burn')
  );

  const totalCompleted = state.cycleCount > 0 ? state.cycleCount : burnLogs.length;

  const ledgerEntries = burnLogs.map((log, index) => {
    const cycleNum = burnLogs.length - index;
    const ethAmount = log.amountETH || 0;
    const ethPriceUSD = state.tokenPriceUSD > 0 ? state.tokenPriceUSD * 2.8e7 : 2400;
    const usdAmount = ethAmount * ethPriceUSD;
    const tokensBurned = log.amountToken || 0;

    return {
      id: log.id || `FIRE-${cycleNum}`,
      cycleNum,
      timeStr: log.timestamp,
      timestamp: log.timestamp,
      claimedETH: ethAmount,
      claimedUSD: usdAmount,
      boughtETH: ethAmount,
      boughtUSD: usdAmount,
      burnedJEV: tokensBurned,
      claimTx: log.txHash || '',
      buyTx: log.txHash || '',
      burnTx: log.txHash || '',
    };
  });

  const filteredEntries = ledgerEntries.filter((entry) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      entry.id.toLowerCase().includes(term) ||
      entry.burnTx.toLowerCase().includes(term) ||
      entry.burnedJEV.toString().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#090a0d] text-[#f5f3ef] font-satoshi flex flex-col selection:bg-[#ff5722] selection:text-[#090a0d]">
      {/* Navigation Bar */}
      <header className="h-16 px-4 sm:px-8 md:px-12 flex items-center justify-between border-b border-[#24252a] bg-[#090a0d]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#a6a39d] hover:text-[#f5f3ef] transition-colors cursor-pointer bg-[#14151a] hover:bg-[#1a1c24] px-3 py-1.5 rounded-lg border border-[#24252a]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <a href="/" onClick={(e) => { e.preventDefault(); onNavigateHome(); }} className="flex items-center gap-2 text-[#f5f3ef] no-underline">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#ff4500] to-[#ff7a00] p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(255,87,34,0.3)]">
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-base tracking-tight">
              JEV<span className="text-[#ff5722] font-semibold">BURN</span>
            </span>
          </a>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          {/* Dead Sink Button */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#14151a] px-2.5 py-1 rounded-lg border border-[#24252a]">
            <span className="text-[10px] text-[#a6a39d]">SINK:</span>
            <span className="text-xs text-zinc-300">0x000...dEaD</span>
            <button onClick={copyDead} className="p-0.5 text-[#a6a39d] hover:text-white cursor-pointer" title="Copy Dead Sink">
              {copiedDead ? <Check className="w-3 h-3 text-[#ff5722]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <a
            href="https://x.com/hotonrh"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-[#a6a39d] hover:text-white transition-colors"
            title="Official Twitter / X"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z"/>
            </svg>
          </a>
        </div>
      </header>

      {/* Main Ledger Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        
        {/* Burn Header Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#14151b] via-[#101116] to-[#0d0e12] border border-[#24252a] p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden shadow-xl">
          {/* Subtle Ambient Flame Glow */}
          <div className="absolute right-0 top-0 w-96 h-full bg-[#ff5722]/5 blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5722]/10 border border-[#ff5722]/30 text-[#ff5722] text-xs font-mono font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>ON-CHAIN INCINERATION PROOFS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white m-0">
              Verified Burns
            </h1>

            <p className="text-sm text-[#a6a39d] leading-relaxed">
              Every fee collected from Pons Curve trading volume is automatically swept, swapped for $JEV on DEX,
              and permanently incinerated to <code className="text-[#ff5722]">0x000...dEaD</code>. Fully autonomous and irrevocable.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end justify-between border-t md:border-t-0 border-[#24252a] pt-4 md:pt-0 shrink-0">
            <span className="text-xs text-[#a6a39d] font-mono">COMPLETED BURNS</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-[#ff5722] tabular-nums mt-0.5">
              {totalCompleted}
            </div>
            <span className="text-xs text-[#a6a39d]">100% on-chain executed</span>
          </div>
        </div>

        {/* 4-Stat Rail */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-[#111217] border border-[#24252a]">
            <span className="text-xs text-[#a6a39d]">Total Burned</span>
            <div className="text-xl sm:text-2xl font-bold text-[#ff5722] font-mono mt-1">
              {formatNumber(state.totalTokensBurned)}
            </div>
            <span className="text-xs text-[#a6a39d] mt-1 block">JEV permanently destroyed</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#111217] border border-[#24252a]">
            <span className="text-xs text-[#a6a39d]">Burn Percentage</span>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
              {burnedPercent.toFixed(2)}%
            </div>
            <span className="text-xs text-[#a6a39d] mt-1 block">of 1,000,000,000 supply</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#111217] border border-[#24252a]">
            <span className="text-xs text-[#a6a39d]">Total ETH Deployed</span>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
              {state.totalFeesClaimedETH.toFixed(4)} ETH
            </div>
            <span className="text-xs text-[#a6a39d] mt-1 block">≈ ${formatNumber(state.totalFeesClaimedUSD)} USD buyback</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#111217] border border-[#24252a]">
            <span className="text-xs text-[#a6a39d]">Escrow Status</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1">
              {state.currentEscrowBalanceETH.toFixed(4)} ETH
            </div>
            <span className="text-xs text-[#a6a39d] mt-1 block">Target threshold: {state.claimThresholdETH.toFixed(4)} ETH</span>
          </div>
        </div>

        {/* Ledger Table Section */}
        <div className="rounded-xl bg-[#111217] border border-[#24252a] overflow-hidden">
          {/* Table Header / Controls */}
          <div className="p-4 sm:p-5 border-b border-[#24252a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white m-0">
                Execution History
              </h2>
              <p className="text-xs text-[#a6a39d] mt-0.5">
                Timestamped autonomous cycles with Robinhood block explorer proofs
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#a6a39d] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Cycle or Tx..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0d0e12] border border-[#24252a] text-xs text-white placeholder-[#555258] focus:outline-none focus:border-[#ff5722]"
              />
            </div>
          </div>

          {/* Desktop Table Headers */}
          <div className="hidden md:grid grid-cols-[110px_140px_1fr_1fr_1.4fr] gap-4 px-6 py-3 border-b border-[#24252a] text-xs font-mono text-[#a6a39d] uppercase">
            <span>Cycle</span>
            <span>Time</span>
            <span>Claimed ETH</span>
            <span>Burned JEV</span>
            <span className="text-right">Transactions (Explorer)</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#24252a]">
            {filteredEntries.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#16171e] flex items-center justify-center mx-auto text-[#ff5722]">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="text-white font-bold text-sm sm:text-base font-mono">Genesis State &bull; Ready For Launch</div>
                <p className="text-xs text-[#a6a39d] max-w-md mx-auto font-mono leading-relaxed">
                  No burns recorded yet. Once trade volume occurs on Robinhood Chain and FeeEscrow reaches threshold, autonomous buyback and dead-sink incinerations will appear here in real-time.
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 sm:px-6 flex flex-col md:grid md:grid-cols-[110px_140px_1fr_1fr_1.4fr] gap-3 md:gap-4 md:items-center hover:bg-[#15171e] transition-colors"
                >
                  {/* Cycle Badge */}
                  <div className="flex items-center justify-between md:justify-start">
                    <span className="px-2 py-0.5 rounded bg-[#ff5722]/10 border border-[#ff5722]/30 text-[#ff5722] text-xs font-mono font-bold">
                      {entry.id}
                    </span>
                    <span className="md:hidden text-xs text-[#a6a39d] font-mono">
                      {entry.timeStr}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="hidden md:block text-xs font-mono text-[#a6a39d]">
                    {entry.timeStr}
                  </div>

                  {/* Claimed */}
                  <div className="flex md:flex-col justify-between md:justify-start text-xs font-mono">
                    <span className="md:hidden text-[#a6a39d]">Claimed:</span>
                    <strong className="text-white">{entry.claimedETH.toFixed(4)} ETH</strong>
                    <small className="text-[#a6a39d]">≈ ${entry.claimedUSD.toFixed(2)}</small>
                  </div>

                  {/* Burned */}
                  <div className="flex md:flex-col justify-between md:justify-start text-xs font-mono">
                    <span className="md:hidden text-[#a6a39d]">Burned:</span>
                    <strong className="text-[#ff5722] font-bold">{formatNumber(entry.burnedJEV)} JEV</strong>
                    <small className="text-[#a6a39d]">Sent to Dead Sink</small>
                  </div>

                  {/* Transactions Links */}
                  <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#24252a] text-xs font-mono">
                    <a
                      href={`${explorerUrl}/tx/${entry.claimTx}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-[#0d0e12] hover:bg-[#1a1b22] border border-[#24252a] text-[#a6a39d] hover:text-white flex items-center gap-1 transition-colors"
                      title="View Claim Transaction"
                    >
                      <span>Claim</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <a
                      href={`${explorerUrl}/tx/${entry.buyTx}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-[#0d0e12] hover:bg-[#1a1b22] border border-[#24252a] text-[#a6a39d] hover:text-white flex items-center gap-1 transition-colors"
                      title="View Buyback Transaction"
                    >
                      <span>Buy</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <a
                      href={`${explorerUrl}/tx/${entry.burnTx}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-[#ff5722]/10 hover:bg-[#ff5722]/20 border border-[#ff5722]/30 text-[#ff5722] flex items-center gap-1 transition-colors"
                      title="View Burn Transaction"
                    >
                      <span>Burn</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 px-4 sm:px-8 border-t border-[#24252a] flex items-center justify-between text-xs text-[#a6a39d] mt-12">
        <button onClick={onNavigateHome} className="hover:text-white transition-colors cursor-pointer">
          JEVBURN &bull; Return to Overview
        </button>
        <div className="flex items-center gap-4">
          <a href={`https://explorer.mainnet.chain.robinhood.com/token/${config.tokenAddress}`} target="_blank" rel="noreferrer" className="hover:text-white">
            Robinhood Explorer
          </a>
          <a href="https://x.com/hotonrh" target="_blank" rel="noreferrer" className="hover:text-white">
            Twitter / X
          </a>
        </div>
      </footer>
    </div>
  );
};
