import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { EnginePhase, FlywheelState, ActivityLog, MachineConfig } from '../types';
import { PONS_V2_CONFIG } from '../contracts';
import { sounds } from '../utils/audio';
import { fetchOnChainEscrowBalance, fetchFullOnChainMetrics, fetchTokenCurve } from '../utils/web3';

// Load from environment variables (.env) with strict fallback to official deployed contracts
const rawToken = import.meta.env.VITE_TOKEN_ADDRESS;
export const OFFICIAL_TOKEN_ADDRESS = rawToken || '';
export const OFFICIAL_CURVE_ADDRESS = import.meta.env.VITE_CURVE_ADDRESS || '0xCe9FaED939AE11A0d5912129eb5D7DD75d238D60';
export const OFFICIAL_CREATOR_ADDRESS = import.meta.env.VITE_CREATOR_ADDRESS || '';
export const OFFICIAL_RPC_URL = 'https://rpc.mainnet.chain.robinhood.com';

const ENV_CYCLE_INTERVAL = parseInt(import.meta.env.VITE_CYCLE_INTERVAL_SECONDS || '300', 10);
const ENV_TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || 'JEVBURN';
const ENV_TOKEN_SYMBOL = import.meta.env.VITE_TOKEN_SYMBOL || 'JEVBURN';
const ENV_CLAIM_THRESHOLD = parseFloat(import.meta.env.VITE_CLAIM_THRESHOLD_ETH || '0.015');

export const INITIAL_CONFIG: MachineConfig = {
  networkName: 'Robinhood Chain',
  chainId: PONS_V2_CONFIG.chainId,
  rpcUrl: OFFICIAL_RPC_URL,
  tokenName: ENV_TOKEN_NAME,
  tokenSymbol: ENV_TOKEN_SYMBOL,
  tokenAddress: OFFICIAL_TOKEN_ADDRESS,
  curveAddress: OFFICIAL_CURVE_ADDRESS,
  factoryAddress: PONS_V2_CONFIG.contracts.factory,
  feeEscrowAddress: PONS_V2_CONFIG.contracts.feeEscrow,
  deadAddress: PONS_V2_CONFIG.contracts.deadAddress,
  creatorAddress: OFFICIAL_CREATOR_ADDRESS,
  claimThresholdETH: ENV_CLAIM_THRESHOLD,
  slippageBps: 200,
  cycleIntervalSeconds: ENV_CYCLE_INTERVAL,
  soundEnabled: true,
};

export const isConfiguredAddress = (addr?: string): boolean => {
  if (!addr) return false;
  const cleaned = addr.trim().toLowerCase();
  if (cleaned === 'none' || cleaned === '' || cleaned === '0x...') return false;
  return cleaned.startsWith('0x') && cleaned.length === 42;
};

const getStoredConfig = (): MachineConfig => {
  try {
    localStorage.removeItem('hot_flywheel_config');
    const saved = localStorage.getItem('jevburn_flywheel_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up any stale or unconfigured cache
      parsed.tokenAddress = OFFICIAL_TOKEN_ADDRESS;
      parsed.curveAddress = OFFICIAL_CURVE_ADDRESS;
      parsed.creatorAddress = OFFICIAL_CREATOR_ADDRESS;
      parsed.rpcUrl = OFFICIAL_RPC_URL;
      return {
        ...INITIAL_CONFIG,
        ...parsed,
        tokenAddress: OFFICIAL_TOKEN_ADDRESS,
        curveAddress: OFFICIAL_CURVE_ADDRESS,
        creatorAddress: OFFICIAL_CREATOR_ADDRESS,
        rpcUrl: OFFICIAL_RPC_URL,
      };
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_CONFIG;
};

const getInitialState = (cfg: MachineConfig): FlywheelState => {
  const isReady = isConfiguredAddress(cfg.tokenAddress);
  return {
    isWheelSpinning: false,
    currentPhase: 'accumulate',
    phaseProgress: 0,
    cycleCount: 0,
    totalFeesClaimedETH: 0,
    totalFeesClaimedUSD: 0,
    totalTokensBoughtBack: 0,
    totalTokensBurned: 0,
    burnedPercentageOfSupply: 0,
    currentEscrowBalanceETH: 0,
    claimThresholdETH: cfg.claimThresholdETH,
    tokenPriceETH: 0,
    tokenPriceUSD: 0,
    marketCapUSD: 0,
    totalSupply: 1_000_000_000,
    deadAddressBalance: 0,
    lastActionText: 'Engine Ready: Waiting for token deployment and first volume cycle.',
    connectedWallet: null,
    isOnChainMode: true,
  };
};

const getInitialLogs = (cfg: MachineConfig): ActivityLog[] => {
  return [];
};

const RANDOM_TX_HASH = () =>
  '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

export function useFlywheelEngine() {
  const [config, setConfigState] = useState<MachineConfig>(getStoredConfig);

  const setConfig = useCallback((newConfig: MachineConfig | ((prev: MachineConfig) => MachineConfig)) => {
    setConfigState((prev) => {
      const resolved = typeof newConfig === 'function' ? newConfig(prev) : newConfig;
      try {
        localStorage.setItem('jevburn_flywheel_config', JSON.stringify(resolved));
      } catch (e) {
        // ignore
      }

      // If token address was changed to none or not valid, stop everything
      if (!isConfiguredAddress(resolved.tokenAddress)) {
        setState((st) => ({
          ...st,
          isWheelSpinning: false,
          currentEscrowBalanceETH: 0,
          phaseProgress: 0,
          lastActionText: 'Wheel Stopped: Token Address is not configured (None). Waiting for contract deployment.',
        }));
      }

      return resolved;
    });
  }, []);

  const resetConfigToDefaults = useCallback(() => {
    try {
      localStorage.removeItem('hot_flywheel_config');
      localStorage.removeItem('jevburn_flywheel_config');
    } catch (e) {
      // ignore
    }
    setConfigState(INITIAL_CONFIG);
  }, []);

  const [state, setState] = useState<FlywheelState>(() => getInitialState(config));
  const [logs, setLogs] = useState<ActivityLog[]>(() => getInitialLogs(config));

  const stateRef = useRef(state);
  stateRef.current = state;

  const configRef = useRef(config);
  configRef.current = config;

  const isExecutingRef = useRef(false);

  // Add transaction log with deduplication protection
  const addLog = useCallback((log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    setLogs((prev) => {
      if (prev.length > 0 && prev[0].action === log.action && prev[0].details === log.details) {
        return prev;
      }
      const newEntry: ActivityLog = {
        ...log,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      return [newEntry, ...prev.slice(0, 49)];
    });
  }, []);

  // Poll real on-chain metrics & curve automatically
  useEffect(() => {
    if (!isConfiguredAddress(config.tokenAddress)) return;

    let isCancelled = false;

    const syncOnChain = async () => {
      try {
        const metrics = await fetchFullOnChainMetrics(
          config.tokenAddress,
          config.curveAddress,
          config.creatorAddress,
          config.rpcUrl
        );

        if (metrics && !isCancelled) {
          // If curve address was resolved to something different, update config
          if (metrics.curveAddress && metrics.curveAddress.toLowerCase() !== config.curveAddress.toLowerCase()) {
            setConfig((prev) => ({ ...prev, curveAddress: metrics.curveAddress }));
          }

          const escrow = metrics.escrowBalanceETH;
          const threshold = config.claimThresholdETH;
          const progress = Math.min(100, Math.round((escrow / threshold) * 100));

          setState((prev) => ({
            ...prev,
            currentEscrowBalanceETH: escrow,
            totalFeesClaimedETH: (metrics.totalFeesClaimedETH && metrics.totalFeesClaimedETH > 0) ? metrics.totalFeesClaimedETH : prev.totalFeesClaimedETH,
            totalFeesClaimedUSD: ((metrics.totalFeesClaimedETH && metrics.totalFeesClaimedETH > 0) ? metrics.totalFeesClaimedETH : prev.totalFeesClaimedETH) * 2500,
            phaseProgress: prev.isWheelSpinning ? prev.phaseProgress : progress,
            totalTokensBurned: metrics.tokensBurned > 0 ? metrics.tokensBurned : prev.totalTokensBurned,
            deadAddressBalance: metrics.tokensBurned > 0 ? metrics.tokensBurned : prev.deadAddressBalance,
            totalTokensBoughtBack: metrics.tokensBurned > 0 ? metrics.tokensBurned : prev.totalTokensBoughtBack,
            burnedPercentageOfSupply: metrics.burnedPercentage > 0 ? metrics.burnedPercentage : prev.burnedPercentageOfSupply,
            tokenPriceETH: metrics.tokenPriceETH > 0 ? metrics.tokenPriceETH : prev.tokenPriceETH,
            tokenPriceUSD: metrics.tokenPriceUSD > 0 ? metrics.tokenPriceUSD : prev.tokenPriceUSD,
            marketCapUSD: metrics.marketCapUSD > 0 ? metrics.marketCapUSD : prev.marketCapUSD,
            totalSupply: metrics.totalSupply || prev.totalSupply,
            lastActionText: prev.isWheelSpinning
              ? prev.lastActionText
              : escrow >= threshold
                ? `Threshold reached (${escrow.toFixed(4)} / ${threshold} ETH)! Autonomous VPS Bot executing cycle...`
                : `Wheel Idle: Escrow balance ${escrow.toFixed(4)} ETH (Target: ${threshold} ETH). Standby.`
          }));
        }
      } catch (e) {
        // ignore network hiccup
      }
    };

    syncOnChain();
    const interval = setInterval(syncOnChain, 6000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [config.tokenAddress, config.curveAddress, config.creatorAddress, config.rpcUrl, setConfig]);

  // Fire confetti flame effect when burn triggers
  const triggerBurnConfetti = useCallback(() => {
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#f43f5e', '#fb7185', '#ea580c', '#fbbf24', '#ffffff'],
      shapes: ['circle', 'square'],
      scalar: 1.2,
    });
  }, []);

  // Phase 1: CLAIM FEE
  const executeClaimPhase = useCallback(async (feeToClaim: number) => {
    sounds.playClaimSound();
    addLog({
      phase: 'claim',
      action: 'CLAIM FEE',
      details: `Claiming ${feeToClaim.toFixed(4)} ETH from Pons Fee Escrow (0xd3AFEB...Ac9e)`,
      txHash: RANDOM_TX_HASH(),
      amountETH: feeToClaim,
      status: 'success',
      contractTarget: 'FeeEscrow.claim()'
    });

    setState((prev) => ({
      ...prev,
      currentPhase: 'claim',
      phaseProgress: 100,
      lastActionText: `[Claim Fee] Withdrawn ${feeToClaim.toFixed(4)} ETH from Pons Fee Escrow...`,
    }));
  }, [addLog]);

  // Phase 2: BUYBACK
  const executeBuybackPhase = useCallback(async (claimedETH: number) => {
    const cur = stateRef.current;
    const cfg = configRef.current;
    const tokensBought = Math.round((claimedETH / cur.tokenPriceETH) * (0.98 + Math.random() * 0.04));

    sounds.playBuybackSound();
    addLog({
      phase: 'buyback',
      action: 'AUTO-BUYBACK',
      details: `Swapping ${claimedETH.toFixed(4)} ETH on Curve -> bought ${tokensBought.toLocaleString()} $${cfg.tokenSymbol}`,
      txHash: RANDOM_TX_HASH(),
      amountETH: claimedETH,
      amountToken: tokensBought,
      status: 'success',
      contractTarget: 'Curve.buy()'
    });

    setState((prev) => ({
      ...prev,
      currentPhase: 'buyback',
      phaseProgress: 100,
      totalFeesClaimedETH: prev.totalFeesClaimedETH + claimedETH,
      totalFeesClaimedUSD: prev.totalFeesClaimedUSD + claimedETH * 2500,
      tokenPriceETH: prev.tokenPriceETH * 1.002,
      tokenPriceUSD: prev.tokenPriceUSD * 1.002,
      marketCapUSD: prev.marketCapUSD * 1.002,
      lastActionText: `[Auto-Buyback] Purchased ${tokensBought.toLocaleString()} $${cfg.tokenSymbol} via Curve DEX...`,
    }));

    return tokensBought;
  }, [addLog]);

  // Phase 3: BURN TO DEAD
  const executeBurnPhase = useCallback(async (tokensToBurn: number) => {
    const cfg = configRef.current;

    sounds.playBurnSound();
    triggerBurnConfetti();

    addLog({
      phase: 'burn',
      action: 'BURN TO DEAD',
      details: `Permanently destroyed ${tokensToBurn.toLocaleString()} $${cfg.tokenSymbol} -> sent to Dead Sink (${PONS_V2_CONFIG.contracts.deadAddress.substring(0, 10)}...)`,
      txHash: RANDOM_TX_HASH(),
      amountToken: tokensToBurn,
      status: 'success',
      contractTarget: 'token.transfer(dEaD)'
    });

    setState((prev) => {
      const newTotalBurned = prev.totalTokensBurned + tokensToBurn;
      const newBurnPct = (newTotalBurned / prev.totalSupply) * 100;
      return {
        ...prev,
        currentPhase: 'burn',
        phaseProgress: 100,
        totalTokensBoughtBack: prev.totalTokensBoughtBack + tokensToBurn,
        totalTokensBurned: newTotalBurned,
        deadAddressBalance: prev.deadAddressBalance + tokensToBurn,
        burnedPercentageOfSupply: newBurnPct,
        cycleCount: prev.cycleCount + 1,
        lastActionText: `[Burn Complete] ${tokensToBurn.toLocaleString()} tokens destroyed in Dead Sink 🔥!`,
      };
    });
  }, [addLog, triggerBurnConfetti]);

  // Complete Execution Sequence: Wheel starts spinning, executes Claim -> Buyback -> Burn, then stops!
  const runFlywheelExecution = useCallback(async () => {
    if (isExecutingRef.current) return;

    if (!isConfiguredAddress(configRef.current.tokenAddress)) {
      addLog({
        phase: 'accumulate',
        action: 'EXECUTION HALTED',
        details: 'Cannot run cycle: Token Address is not configured (None). Please configure token contract first.',
        txHash: '0x0000000000000000000000000000000000000000',
        status: 'pending',
        contractTarget: 'System',
      });
      return;
    }

    isExecutingRef.current = true;
    const feeAmount = stateRef.current.currentEscrowBalanceETH || configRef.current.claimThresholdETH;

    try {
      // Start Wheel spinning
      setState((prev) => ({
        ...prev,
        isWheelSpinning: true,
        lastActionText: 'Spinning Wheel: Executing autonomous cycle (Claim -> Buyback -> Burn)...',
      }));

      // Step 1: Claim from Pons Fee Escrow (Wheel needle points to Claim node)
      await executeClaimPhase(feeAmount);
      await new Promise((r) => setTimeout(r, 4000));

      // Step 2: Auto-Buyback (Wheel needle points to Buyback node)
      const boughtTokens = await executeBuybackPhase(feeAmount);
      await new Promise((r) => setTimeout(r, 4000));

      // Step 3: Burn to Dead (Wheel needle points to Burn node)
      await executeBurnPhase(boughtTokens);
      await new Promise((r) => setTimeout(r, 4000));

      // Step 4: Wheel STOPS! No more fee to claim (Escrow is 0)
      sounds.playAccumulateSound();
      setState((prev) => ({
        ...prev,
        isWheelSpinning: false, // Wheel stops because fees have been claimed
        currentPhase: 'accumulate',
        phaseProgress: 0,
        currentEscrowBalanceETH: 0, // Escrow balance now 0
        lastActionText: 'Wheel Stopped: All claimable fees executed. Waiting for new trading volume in Escrow...',
      }));

      addLog({
        phase: 'accumulate',
        action: 'WHEEL STOPPED (IDLE)',
        details: `Cycle complete. Escrow emptied. Wheel is now stopped waiting for new trading volume.`,
        txHash: RANDOM_TX_HASH(),
        status: 'success',
        contractTarget: 'Engine'
      });
    } finally {
      isExecutingRef.current = false;
    }
  }, [executeClaimPhase, executeBuybackPhase, executeBurnPhase, addLog]);

  // Autonomous Daemon & Real-time Bot Synchronization
  useEffect(() => {
    // If token address is not configured, ENGINE REMAINS COMPLETELY HALTED / STOPPED!
    if (!isConfiguredAddress(config.tokenAddress)) {
      setState((prev) => ({
        ...prev,
        isWheelSpinning: false,
        phaseProgress: 0,
        currentEscrowBalanceETH: 0,
        lastActionText: 'Wheel Stopped: Token Address is not configured (None). Waiting for contract deployment.',
      }));
      return;
    }

    let isCancelled = false;

    const syncDaemon = async () => {
      // If user is manually running a browser animation test from AdminPanel, don't interrupt
      if (isExecutingRef.current) return;

      try {
        const res = await fetch('/api/status');
        if (res.ok && !isCancelled) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            const escrow = parseFloat(data.escrowBalanceETH) || 0;
            const threshold = parseFloat(data.claimThresholdETH) || config.claimThresholdETH;
            const isBusy = data.status === 'claiming' || data.status === 'buyback' || data.status === 'burning' || data.status === 'active';

            setState((prev) => {
              if (isExecutingRef.current) return prev;
              const progress = isBusy
                ? (data.status === 'claiming' ? 33 : data.status === 'buyback' ? 66 : 100)
                : Math.min(100, Math.round((escrow / threshold) * 100));

              const claimedFromBot = data.totalFeesClaimedETH ? parseFloat(data.totalFeesClaimedETH) : 0;

              return {
                ...prev,
                currentEscrowBalanceETH: escrow,
                claimThresholdETH: threshold,
                totalFeesClaimedETH: claimedFromBot > 0 ? claimedFromBot : prev.totalFeesClaimedETH,
                totalFeesClaimedUSD: (claimedFromBot > 0 ? claimedFromBot : prev.totalFeesClaimedETH) * 2500,
                cycleCount: data.totalCyclesExecuted !== undefined ? data.totalCyclesExecuted : prev.cycleCount,
                isWheelSpinning: isBusy,
                currentPhase: (data.status === 'claiming' || data.status === 'buyback' || data.status === 'burning')
                  ? data.status
                  : 'accumulate',
                phaseProgress: progress,
                lastActionText: isBusy
                  ? `Autonomous Bot Active: ${data.status.toUpperCase()} phase executing on-chain...`
                  : escrow >= threshold
                    ? `Claimable fee threshold reached (${escrow.toFixed(4)} / ${threshold} ETH)! Starting bot cycle...`
                    : `Wheel Idle: Escrow balance ${escrow.toFixed(4)} ETH (Target: ${threshold} ETH). Standby.`
              };
            });
          }
        }
      } catch (e) {
        // Fallback: On-chain RPC poller (syncOnChain) handles metrics when API is unreachable
      }
    };

    syncDaemon();
    const daemonInterval = setInterval(syncDaemon, 3000);
    return () => {
      isCancelled = true;
      clearInterval(daemonInterval);
    };
  }, [config.tokenAddress, config.claimThresholdETH]);

  return {
    state,
    config,
    setConfig,
    resetConfigToDefaults,
    logs,
    addLog,
    runFlywheelExecution,
  };
}
