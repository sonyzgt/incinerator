import React, { useState, useEffect } from 'react';
import {
  Flame,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Search,
  RefreshCw,
} from 'lucide-react';
import { FlywheelState, ActivityLog, MachineConfig, BurnLedgerEntry } from '../types';
import { PONS_V2_CONFIG } from '../contracts';
import { fetchOnChainBurnLedger } from '../utils/web3';

interface BurnPageProps {
  state: FlywheelState;
  config: MachineConfig;
  logs: ActivityLog[];
  burnLedger?: BurnLedgerEntry[];
  onNavigateHome: () => void;
}

export const BurnPage: React.FC<BurnPageProps> = ({
  state,
  config,
  logs,
  burnLedger = [],
  onNavigateHome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedDead, setCopiedDead] = useState(false);
  const [localLedger, setLocalLedger] = useState<BurnLedgerEntry[]>(burnLedger);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const explorerUrl = 'https://explorer.mainnet.chain.robinhood.com';
  const deadAddress = config.deadAddress || PONS_V2_CONFIG.contracts.deadAddress;

  // Sync if prop updates
  useEffect(() => {
    if (burnLedger && burnLedger.length > 0) {
      setLocalLedger(burnLedger);
    }
  }, [burnLedger]);

  // Direct fetch & polling from Robinhood Chain RPC
  useEffect(() => {
    let isCancelled = false;
    const fetchLedger = async () => {
      try {
        const res = await fetchOnChainBurnLedger(
          config.tokenAddress,
          config.curveAddress,
          config.creatorAddress,
          config.rpcUrl
        );
        if (res && res.entries.length > 0 && !isCancelled) {
          setLocalLedger(res.entries);
        }
      } catch (e) {
        // ignore
      }
    };

    if (localLedger.length === 0) {
      fetchLedger();
    }
    const interval = setInterval(fetchLedger, 8000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [config.tokenAddress, config.curveAddress, config.creatorAddress, config.rpcUrl, localLedger.length]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchOnChainBurnLedger(
        config.tokenAddress,
        config.curveAddress,
        config.creatorAddress,
        config.rpcUrl
      );
      if (res && res.entries.length > 0) {
        setLocalLedger(res.entries);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const copyDead = () => {
    navigator.clipboard.writeText(deadAddress);
    setCopiedDead(true);
    setTimeout(() => setCopiedDead(false), 2000);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
  };

  // Build fallback entries from activity logs
  const burnLogs = logs.filter(
    (l) => l.phase === 'burn' || l.action?.toLowerCase().includes('burn')
  );

  const fallbackEntries: BurnLedgerEntry[] = burnLogs.map((log, index) => {
    const cycleNum = burnLogs.length - index;
    const ethAmount = log.amountETH || 0;
    const ethPriceUSD = state.tokenPriceUSD > 0 ? state.tokenPriceUSD * 2.8e7 : 2500;
    const usdAmount = ethAmount * ethPriceUSD;
    const tokensBurned = log.amountToken || 0;

    return {
      id: log.id || `CYCLE-${cycleNum}`,
      cycleNum,
      timeStr: log.timestamp,
      timestamp: Date.now() / 1000,
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

  const ledgerEntries = localLedger.length > 0 ? localLedger : fallbackEntries;

  const totalCompleted = ledgerEntries.length > 0
    ? ledgerEntries.length
    : (state.cycleCount > 0 ? state.cycleCount : burnLogs.length);

  const totalTokensBurned = state.totalTokensBurned > 0
    ? state.totalTokensBurned
    : ledgerEntries.reduce((acc, cur) => acc + cur.burnedJEV, 0);

  const burnedPercent = state.burnedPercentageOfSupply > 0
    ? state.burnedPercentageOfSupply
    : (state.totalSupply > 0 ? (totalTokensBurned / state.totalSupply) * 100 : (totalTokensBurned / 1_000_000_000) * 100);

  const totalETHDeployed = state.totalFeesClaimedETH > 0
    ? state.totalFeesClaimedETH
    : ledgerEntries.reduce((acc, cur) => acc + cur.claimedETH, 0);

  const totalUSDDeployed = totalETHDeployed * 2500;

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
            <img
              src="/logo.png"
              alt="JEVBURN Logo"
              className="w-7 h-7 rounded-lg object-contain border border-[#ff5722]/30 shadow-[0_0_12px_rgba(255,87,34,0.3)]"
            />
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
            href="https://x.com/jevburns"
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
        
        {/* Burn Header Hero with banner.png background */}
        <div className="rounded-2xl border border-[#24252a] p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden shadow-2xl bg-[#090a0d]">
          {/* Full Background Banner */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="/banner.png"
              alt="JEVBURN Combustion Chamber"
              className="w-full h-full object-cover object-center opacity-30 filter brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a0d] via-[#090a0d]/75 to-[#090a0d]/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090a0d] via-transparent to-[#090a0d]/90" />
          </div>

          <div className="space-y-3 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5722]/10 border border-[#ff5722]/30 text-[#ff5722] text-xs font-mono font-medium backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5" />
              <span>ON-CHAIN INCINERATION PROOFS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white m-0">
              Verified Burns
            </h1>

            <p className="text-sm text-[#a6a39d] leading-relaxed">
              Every fee collected from Pons Curve trading volume is automatically swept, swapped for $JEVBURN on DEX,
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
              {formatNumber(totalTokensBurned)}
            </div>
            <span className="text-xs text-[#a6a39d] mt-1 block">JEVBURN permanently destroyed</span>
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
              {totalETHDeployed.toFixed(4)} ETH
            </div>
            <span className="text-xs text-[#a6a39d] mt-1 block">≈ ${formatNumber(totalUSDDeployed)} USD buyback</span>
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

            {/* Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-[#0d0e12] border border-[#24252a] text-[#a6a39d] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                title="Sync on-chain records from Robinhood RPC"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#ff5722]' : ''}`} />
              </button>

              {/* Search Input */}
              <div className="relative flex-1 sm:w-64">
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
          </div>

          {/* Desktop Table Headers */}
          <div className="hidden md:grid grid-cols-[110px_140px_1fr_1fr_1.4fr] gap-4 px-6 py-3 border-b border-[#24252a] text-xs font-mono text-[#a6a39d] uppercase">
            <span>Cycle</span>
            <span>Time</span>
            <span>Claimed ETH</span>
            <span>Burned JEVBURN</span>
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
                    <strong className="text-[#ff5722] font-bold">{formatNumber(entry.burnedJEV)} JEVBURN</strong>
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
          <a href="https://x.com/jevburns" target="_blank" rel="noreferrer" className="hover:text-white">
            Twitter / X
          </a>
        </div>
      </footer>
    </div>
  );
};
