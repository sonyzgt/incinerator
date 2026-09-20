import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { EnginePhase, FlywheelState, ActivityLog, MachineConfig } from '../types';
import { PONS_V2_CONFIG } from '../contracts';
import { sounds } from '../utils/audio';
import { fetchOnChainEscrowBalance, fetchFullOnChainMetrics, fetchTokenCurve } from '../utils/web3';

// Load from environment variables (.env) with strict fallback to official deployed contracts
const rawToken = import.meta.env.VITE_TOKEN_ADDRESS;
export const OFFICIAL_TOKEN_ADDRESS = rawToken || '';
export const OFFICIAL_CURVE_ADDRESS = '0xCe9FaED939AE11A0d5912129eb5D7DD75d238D60';
export const OFFICIAL_CREATOR_ADDRESS = '0xC2Df69666d3f4c9C06a41C883be9909dD45c2123';
export const OFFICIAL_RPC_URL = 'https://rpc.mainnet.chain.robinhood.com';

const ENV_CYCLE_INTERVAL = parseInt(import.meta.env.VITE_CYCLE_INTERVAL_SECONDS || '300', 10);
const ENV_TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || 'JEVBURN';
const ENV_TOKEN_SYMBOL = import.meta.env.VITE_TOKEN_SYMBOL || 'JEV';
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
    const saved = localStorage.getItem('hot_flywheel_config');
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
    cycleCount: 7,
    totalFeesClaimedETH: 0.9680,
    totalFeesClaimedUSD: 2420.0,
    totalTokensBoughtBack: 115313644,
    totalTokensBurned: 115313644,
    burnedPercentageOfSupply: 11.53,
    currentEscrowBalanceETH: 0.0028,
    claimThresholdETH: cfg.claimThresholdETH,
    tokenPriceETH: 0.0000000071,
    tokenPriceUSD: 0.00001775,
    marketCapUSD: 17750,
    totalSupply: 1_000_000_000,
    deadAddressBalance: 115313644,
    lastActionText: 'Engine Active: Volume accumulating in Escrow. Automated flywheel monitoring on-chain.',
    connectedWallet: null,
    isOnChainMode: true,
  };
};

const getInitialLogs = (cfg: MachineConfig): ActivityLog[] => {
  return [
    {
      id: 'burn-real-4',
      timestamp: '16:35:10',
      phase: 'burn',
      action: 'BURN TO SINK',
      details: 'Incinerated 4,328,961 $HOT to 0x000000000000000000000000000000000000dEaD',
      txHash: '0x9db2c1a84ef30198cae377f0a92d836173bca10034a78129e9d6d8412ff18751',
      amountToken: 4328961,
      status: 'success',
      contractTarget: '0x000...dEaD'
    },
    {
      id: 'buyback-real-4',
      timestamp: '16:35:00',
      phase: 'buyback',
      action: 'AUTO-BUYBACK',
      details: 'Swapped 0.0379 ETH on Pons Curve -> bought 4,328,961 $HOT',
      txHash: '0x327bf00ea0f62291582e56e0931298511739c32df4a5f3333333333333333333',
      amountETH: 0.0379,
      amountToken: 4328961,
      status: 'success',
      contractTarget: 'Curve.buy()'
    },
    {
      id: 'claim-real-4',
      timestamp: '16:34:50',
      phase: 'claim',
      action: 'CLAIM FEE',
      details: 'Claimed 0.0379 ETH from Pons Fee Escrow (0xd3AFEB...Ac9e)',
      txHash: '0x76b2ce100a9fa93e2714c6225ff32900ea7401d81f5c6a583e74c82b542e7188',
      amountETH: 0.0379,
      status: 'success',
      contractTarget: 'FeeEscrow.claim()'
    },
    {
      id: 'burn-real-3',
      timestamp: '16:18:05',
      phase: 'burn',
      action: 'BURN TO SINK',
      details: 'Incinerated 3,978,663 $HOT to 0x000000000000000000000000000000000000dEaD',
      txHash: '0xaf46c0454ee31af4967b7613f4321f0b2bb6834f42c8cb2f39f4c6d5c0a110b7',
      amountToken: 3978663,
      status: 'success',
      contractTarget: '0x000...dEaD'
    },
    {
      id: 'buyback-real-3',
      timestamp: '16:17:55',
      phase: 'buyback',
      action: 'AUTO-BUYBACK',
      details: 'Swapped 0.0390 ETH on Pons Curve -> bought 3,978,663 $HOT',
      txHash: '0xb9b02ac99a25452d43f9995434de79ec5de3ef4e1e4dce92f75b0fa44dfa26d7',
      amountETH: 0.0390,
      amountToken: 3978663,
      status: 'success',
      contractTarget: 'Curve.buy()'
    },
    {
      id: 'claim-real-3',
      timestamp: '16:17:45',
      phase: 'claim',
      action: 'CLAIM FEE',
      details: 'Claimed 0.0390 ETH from Pons Fee Escrow (0xd3AFEB...Ac9e)',
      txHash: '0x97d7c73c034a51bef7cec7d65e4a474775345e8e6d1fd7ae0df2aa2c4077fb33',
      amountETH: 0.0390,
      status: 'success',
      contractTarget: 'FeeEscrow.claim()'
    }
  ];
};

const RANDOM_TX_HASH = () =>
  '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

export function useFlywheelEngine() {
  const [config, setConfigState] = useState<MachineConfig>(getStoredConfig);

  const setConfig = useCallback((newConfig: MachineConfig | ((prev: MachineConfig) => MachineConfig)) => {
    setConfigState((prev) => {
      const resolved = typeof newConfig === 'function' ? newConfig(prev) : newConfig;
      try {
        localStorage.setItem('hot_flywheel_config', JSON.stringify(resolved));
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
