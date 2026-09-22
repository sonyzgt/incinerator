"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  X,
  ExternalLink,
  Radio,
  Search,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { ActivityLog, BurnLedgerEntry, FlywheelState, MachineConfig } from "../types";
import { LiquidMetalButton } from "./ui/liquid-metal-button";

interface BurnLedgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
  burnLedger: BurnLedgerEntry[];
  state: FlywheelState;
  config: MachineConfig;
}

export const BurnLedgerDrawer: React.FC<BurnLedgerDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  burnLedger,
  state,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<"proofs" | "stream">("proofs");
  const [searchTerm, setSearchTerm] = useState("");

  const explorerUrl = "https://explorer.mainnet.chain.robinhood.com";

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);
  };

  // Build fallback entries from logs if ledger is empty
  const burnLogs = logs.filter(
    (l) => l.phase === "burn" || l.action?.toLowerCase().includes("burn")
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
      burnedIncinerator: tokensBurned,
      claimTx: log.txHash || "",
      buyTx: log.txHash || "",
      burnTx: log.txHash || "",
    };
  });

  const ledgerEntries = burnLedger.length > 0 ? burnLedger : fallbackEntries;

  const filteredProofs = ledgerEntries
    .filter((entry) => entry.cycleType !== "keep" && (entry.burnedIncinerator > 0 || (entry.cycleNum ? entry.cycleNum % 2 !== 0 : true)))
    .filter((entry) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        entry.id.toLowerCase().includes(term) ||
        (entry.burnTx ? entry.burnTx.toLowerCase().includes(term) : false) ||
        (entry.claimTx ? entry.claimTx.toLowerCase().includes(term) : false) ||
        entry.burnedIncinerator.toString().includes(term)
      );
    });

  const filteredLogs = logs
    .filter((log) => log.phase !== "keep" && !log.action.toLowerCase().includes("keep") && !log.details.toLowerCase().includes("keep"))
    .filter((log) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        log.txHash.toLowerCase().includes(term)
      );
    });

  const totalTokensBurned = state.totalTokensBurned > 0
    ? state.totalTokensBurned
    : ledgerEntries.reduce((acc, cur) => acc + cur.burnedIncinerator, 0);

  const burnedPercent = state.burnedPercentageOfSupply > 0
    ? state.burnedPercentageOfSupply
    : state.totalSupply > 0
      ? (totalTokensBurned / state.totalSupply) * 100
      : (totalTokensBurned / 1_000_000_000) * 100;

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 350, damping: 26 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-satoshi">
          {/* Backdrop with fade animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70"
          />

          {/* Slide-out Sidebar Drawer with spring animation */}
          <motion.aside
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] md:w-[540px] max-w-full bg-[#0c0d12] border-l border-white/[0.08] shadow-[-24px_0_60px_rgba(0,0,0,0.9)] flex flex-col z-50 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 liquid-divider border-b flex items-center justify-between bg-[#11131b] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-800/80 border border-white/20 flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white m-0 tracking-tight flex items-center gap-2">
                    <span>Burn Ledger</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181924] text-zinc-300 border-liquid-metal">
                      4663
                    </span>
                  </h3>
                  <p className="text-xs text-[#a6a39d] m-0">
                    Real-time automated DEX buybacks &amp; burn logs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <LiquidMetalButton
                  size="xs"
                  viewMode="icon"
                  enableShader={false}
                  title="Close sidebar (Esc)"
                  onClick={onClose}
                  icon={<X className="w-3.5 h-3.5" />}
                />
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-2.5 sm:p-4 liquid-divider border-b bg-[#0d0e14]/90 shrink-0 text-center font-mono">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#13151f] border-liquid-metal">
                <span className="text-[9px] sm:text-[10px] text-[#a6a39d] block">Total Burned</span>
                <span className="text-[11px] sm:text-sm font-bold text-white block mt-0.5 truncate">
                  {formatNumber(totalTokensBurned)}
                </span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#13151f] border-liquid-metal">
                <span className="text-[9px] sm:text-[10px] text-[#a6a39d] block">Supply Burned</span>
                <span className="text-[11px] sm:text-sm font-bold text-white block mt-0.5">
                  {burnedPercent.toFixed(2)}%
                </span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#13151f] border-liquid-metal">
                <span className="text-[9px] sm:text-[10px] text-[#a6a39d] block">Deployed ETH</span>
                <span className="text-[11px] sm:text-sm font-bold text-emerald-400 block mt-0.5 truncate">
                  {state.totalFeesClaimedETH > 0 ? state.totalFeesClaimedETH.toFixed(3) : "0.000"} ETH
                </span>
              </div>
            </div>

            {/* Tab Controls & Search */}
            <div className="p-2.5 sm:p-4 liquid-divider border-b bg-[#10121a] flex flex-col sm:flex-row gap-2 sm:gap-2.5 sm:items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <LiquidMetalButton
                  size="xs"
                  viewMode="text"
                  enableShader={false}
                  label="Proofs"
                  isActive={activeTab === "proofs"}
                  variant={activeTab === "proofs" ? "ember" : "default"}
                  onClick={() => setActiveTab("proofs")}
                />
                <LiquidMetalButton
                  size="xs"
                  viewMode="text"
                  enableShader={false}
                  label="Live Stream"
                  isActive={activeTab === "stream"}
                  variant={activeTab === "stream" ? "ember" : "default"}
                  onClick={() => setActiveTab("stream")}
                />
              </div>

              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#a6a39d] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter cycle or tx..."
                  className="w-full pl-8 pr-3 py-1 rounded-full bg-[#151722] border-liquid-metal text-xs text-white placeholder-[#68656f] focus:outline-none focus:border-white/70 transition-all font-mono"
                />
              </div>
            </div>

            {/* Scrollable Content Stream */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-2.5">
              {activeTab === "proofs" ? (
                filteredProofs.length === 0 ? (
                  <div className="py-16 text-center space-y-2 font-mono text-xs text-[#a6a39d]">
                    <div className="w-10 h-10 rounded-full bg-[#181a24] flex items-center justify-center mx-auto text-white">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div className="text-white font-bold">No Records Found</div>
                    <p className="text-[11px] max-w-xs mx-auto">
                      No burn records matching criteria. Cycles will stream in real time as fee thresholds trigger.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2.5"
                  >
                    {filteredProofs.map((entry) => {
                      const routerLabel = entry.swapRouter === "uniswap" ? "Uniswap v4" : "Bonding Curve";

                      return (
                        <motion.div
                          key={entry.id}
                          variants={itemVariants}
                          className="p-3 sm:p-3.5 rounded-2xl bg-[#11131b] border-liquid-metal hover:border-white/40 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-mono font-bold">
                              {entry.id}
                            </span>
                            <span className="text-[11px] text-[#a6a39d] font-mono">
                              {entry.timeStr}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                            <div>
                              <span className="text-[10px] text-[#a6a39d] block">Claimed &amp; Bought</span>
                              <span className="text-white font-semibold">
                                {entry.claimedETH.toFixed(4)} ETH
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#a6a39d] block">Tokens Incinerated</span>
                              <span className="text-white font-bold">
                                {formatNumber(entry.burnedIncinerator)}
                              </span>
                            </div>
                          </div>

                          {/* Router and On-chain Explorer Action Buttons */}
                          <div className="flex items-center justify-between gap-1.5 pt-2 liquid-divider border-t">
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Swap: {routerLabel}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {entry.claimTx && (
                                <LiquidMetalButton
                                  size="xs"
                                  viewMode="text"
                                  enableShader={false}
                                  label="Claim"
                                  title="View Claim TX"
                                  onClick={() => window.open(`${explorerUrl}/tx/${entry.claimTx}`, "_blank")}
                                  icon={<ExternalLink className="w-2.5 h-2.5" />}
                                />
                              )}
                              {entry.buyTx && (
                                <LiquidMetalButton
                                  size="xs"
                                  viewMode="text"
                                  enableShader={false}
                                  label="Buy"
                                  title="View Buy TX"
                                  onClick={() => window.open(`${explorerUrl}/tx/${entry.buyTx}`, "_blank")}
                                  icon={<ExternalLink className="w-2.5 h-2.5" />}
                                />
                              )}
                              {entry.burnTx && (
                                <LiquidMetalButton
                                  size="xs"
                                  viewMode="text"
                                  enableShader={false}
                                  variant="ember"
                                  label="Burn"
                                  title="View Burn TX"
                                  onClick={() => window.open(`${explorerUrl}/tx/${entry.burnTx}`, "_blank")}
                                  icon={<ExternalLink className="w-2.5 h-2.5 text-white" />}
                                />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )
              ) : (
                /* Live Activity Stream Tab */
                filteredLogs.length === 0 ? (
                  <div className="py-16 text-center space-y-2 font-mono text-xs text-[#a6a39d]">
                    <div className="w-10 h-10 rounded-full bg-[#181a24] flex items-center justify-center mx-auto text-emerald-400">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-white font-bold">Awaiting On-Chain Events</div>
                    <p className="text-[11px] max-w-xs mx-auto">
                      Automated background cycles stream here in real time.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2 font-mono text-xs"
                  >
                    {filteredLogs.map((log) => {
                      let badgeColor = "text-zinc-300 border-liquid-metal bg-zinc-800/40";
                      if (log.phase === "claim") badgeColor = "text-amber-400 border-liquid-ember bg-amber-500/10";
                      if (log.phase === "buyback") badgeColor = "text-emerald-400 border-liquid-metal bg-emerald-500/10";
                      if (log.phase === "burn") badgeColor = "text-white border-white/30 bg-white/10";
                      if (log.phase === "keep") badgeColor = "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";

                      return (
                        <motion.div
                          key={log.id}
                          variants={itemVariants}
                          className="p-3 rounded-2xl bg-[#11131b] border-liquid-metal space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeColor}`}>
                              {log.action}
                            </span>
                            <span className="text-[#a6a39d] text-[10px]">
                              [{log.timestamp}]
                            </span>
                          </div>

                          <p className="text-zinc-200 text-xs m-0">
                            {log.details}
                          </p>

                          {log.txHash && log.txHash.startsWith("0x") && (
                            <div className="pt-1 flex justify-end">
                              <LiquidMetalButton
                                size="xs"
                                viewMode="text"
                                enableShader={false}
                                label="View Proof"
                                title="Open in Robinhood Explorer"
                                onClick={() => window.open(`${explorerUrl}/tx/${log.txHash}`, "_blank")}
                                icon={<ExternalLink className="w-2.5 h-2.5" />}
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )
              )}
            </div>

            {/* Drawer Bottom Sink Status */}
            <div className="p-3 px-4 liquid-divider border-t bg-[#090a0d] shrink-0 flex items-center justify-between text-xs font-mono text-[#a6a39d]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] text-zinc-300">
                  {state.isTokenMigrated ? "ROUTER: UNISWAP V4" : "ROUTER: BONDING CURVE"}
                </span>
              </div>
              <span className="text-[11px] text-white">0x000...dEaD</span>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
