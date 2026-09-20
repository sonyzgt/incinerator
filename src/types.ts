export type EnginePhase = 'accumulate' | 'claim' | 'buyback' | 'burn';

export interface FlywheelState {
  isWheelSpinning: boolean; // True ONLY when executing Claim -> Buyback -> Burn, False when stopped waiting
  currentPhase: EnginePhase;
  phaseProgress: number; // 0 to 100%
  cycleCount: number;
  totalFeesClaimedETH: number;
  totalFeesClaimedUSD: number;
  totalTokensBoughtBack: number;
  totalTokensBurned: number;
  burnedPercentageOfSupply: number;
  currentEscrowBalanceETH: number; // Available fee waiting in Escrow
  claimThresholdETH: number;       // Trigger threshold (e.g. 0.015 ETH)
  tokenPriceETH: number;
  tokenPriceUSD: number;
  marketCapUSD: number;
  totalSupply: number;
  deadAddressBalance: number;
  lastActionText: string;
  connectedWallet: string | null;
  isOnChainMode: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  phase: EnginePhase;
  action: string;
  details: string;
  txHash: string;
  amountETH?: number;
  amountToken?: number;
  status: 'pending' | 'success' | 'failed';
  contractTarget?: string;
  isRealTx?: boolean;
}

export interface BurnLedgerEntry {
  id: string;
  cycleNum: number;
  timeStr: string;
  timestamp: number;
  claimedETH: number;
  claimedUSD: number;
  boughtETH: number;
  boughtUSD: number;
  burnedJEV: number;
  claimTx: string;
  buyTx: string;
  burnTx: string;
}

export interface MachineConfig {
  networkName: string;
  chainId: number;
  rpcUrl: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  curveAddress: string;
  factoryAddress: string;
  feeEscrowAddress: string;
  deadAddress: string;
  creatorAddress: string;
  claimThresholdETH: number;
  slippageBps: number;
  cycleIntervalSeconds: number;
  soundEnabled: boolean;
}
