import React, { useState } from 'react';
import {
  Flame,
  ArrowLeft,
  BookOpen,
  Coins,
  ShoppingCart,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Code2,
  CheckCircle2,
  Lock,
  Layers,
  Cpu,
  User,
  Copy,
  Check
} from 'lucide-react';
import { PONS_V2_CONFIG } from '../contracts';
import { MachineConfig } from '../types';

interface DocsPageProps {
  config: MachineConfig;
  onNavigateHome: () => void;
}

const CODE_CYCLE = `// 1. PONS V2 AUTONOMOUS FLYWHEEL EXECUTION PIPELINE (TypeScript)
// Network: Robinhood Chain (ID: 4663)
import { ethers } from "ethers";

async function executeFlywheelCycle(wallet: ethers.Wallet, config: {
  feeEscrowAddr: string;
  curveAddr: string;
  tokenAddr: string;
  deadSinkAddr: string;
}) {
  const escrow = new ethers.Contract(config.feeEscrowAddr, ["function claim()"], wallet);
  const curve = new ethers.Contract(config.curveAddr, [
    "function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256)"
  ], wallet);
  const token = new ethers.Contract(config.tokenAddr, [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ], wallet);

  // STEP 1: CLAIM ACCRUED ETH FEE FROM ESCROW
  console.log("[1/3] Withdrawing accumulated trading fees...");
  const claimTx = await escrow.claim();
  await claimTx.wait();

  // STEP 2: INSTANT AUTO-BUYBACK ON PONS BONDING CURVE
  const claimedETH = await wallet.provider.getBalance(wallet.address);
  console.log("[2/3] Buying tokens via Curve DEX with " + ethers.formatEther(claimedETH) + " ETH...");
  const buyTx = await curve.buy(claimedETH, 0n, wallet.address, { value: claimedETH });
  await buyTx.wait();

  // STEP 3: IRREVERSIBLE SUPPLY REDUCTION (BURN TO DEAD SINK)
  const tokensBought = await token.balanceOf(wallet.address);
  console.log("[3/3] Burning " + ethers.formatUnits(tokensBought, 18) + " tokens to Dead Address...");
  const burnTx = await token.transfer(config.deadSinkAddr, tokensBought);
  await burnTx.wait();

  console.log("🔥 Flywheel cycle complete! 100% tokens burned permanently.");
}`;

const CODE_ABI = `// 2. OFFICIAL PONS FAMILY V2 INTERFACES & ABIs
// Deployed on Robinhood Chain (EVM Chain ID: 4663)

// Fee Escrow: 0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e
export const PONS_FEE_ESCROW_ABI = [
  "function balanceOf(address recipient) view returns (uint256)",
  "function claimableBalance(address recipient) view returns (uint256)",
  "function claim() external"
];

// Pons Bonding Curve DEX (Unique per token)
export const PONS_CURVE_ABI = [
  "function token() view returns (address)",
  "function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256)",
  "function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)",
  "function sellableTokens() view returns (uint256)",
  "function graduated() view returns (bool)"
];

// Standard ERC20 Token (With Dead Address Sink)
export const ERC20_BURN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];`;

const CODE_REACTIVE = `// 3. REACTIVE ROTARY ENGINE CONTROLLER (Frontend Hook)
// Wheels stop completely when escrow is 0, spins only during fee execution

export function useReactiveFlywheel(escrowBalanceETH: number, thresholdETH: number) {
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'accumulate' | 'claim' | 'buyback' | 'burn'>('accumulate');

  useEffect(() => {
    // CONDITION 1: Fee has not reached threshold -> Wheel stays STOPPED (IDLE)
    if (escrowBalanceETH < thresholdETH) {
      setIsWheelSpinning(false);
      setCurrentPhase('accumulate');
      return;
    }

    // CONDITION 2: Fee >= threshold -> Activate wheel and spin through the 4 nodes
    async function triggerCycle() {
      setIsWheelSpinning(true);
      
      setCurrentPhase('claim');    // Node 02: Claim Fee
      await wait(4000);

      setCurrentPhase('buyback');  // Node 03: Buyback DEX
      await wait(4000);

      setCurrentPhase('burn');     // Node 04: Burn to Dead
      await wait(4000);

      // Reset to Stopped state awaiting next accumulation window
      setIsWheelSpinning(false);
      setCurrentPhase('accumulate');
    }

    triggerCycle();
  }, [escrowBalanceETH, thresholdETH]);
}`;

const CODE_BOT = `// 4. AUTONOMOUS 24/7 BACKGROUND DAEMON SCRIPT
// Run headless on server: npm run bot

import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const RPC_URL = process.env.VITE_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
const PRIVATE_KEY = process.env.CREATOR_PRIVATE_KEY;
const TOKEN_ADDRESS = process.env.VITE_TOKEN_ADDRESS;
const CURVE_ADDRESS = process.env.VITE_CURVE_ADDRESS;
const THRESHOLD = ethers.parseEther(process.env.VITE_CLAIM_THRESHOLD_ETH || "0.015");
const ESCROW_ADDR = "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e";
const DEAD_ADDR = "0x000000000000000000000000000000000000dEaD";

async function runDaemon() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY!, provider);
  const escrow = new ethers.Contract(ESCROW_ADDR, ["function balanceOf(address) view returns (uint256)", "function claim()"], wallet);

  console.log("🚀 HOT Flywheel Daemon active for wallet:", wallet.address);

  // Poll escrow balance every 10 seconds
  setInterval(async () => {
    const fee = await escrow.balanceOf(wallet.address);
    console.log("Current Escrow Fee:", ethers.formatEther(fee), "ETH");

    if (fee >= THRESHOLD) {
      console.log("⚡ Threshold reached! Executing Claim -> Buyback -> Burn...");
      // 1. Claim
      await (await escrow.claim()).wait();
      // 2. Buyback
      const curve = new ethers.Contract(CURVE_ADDRESS!, ["function buy(uint256,uint256,address) payable"], wallet);
      await (await curve.buy(fee, 0n, wallet.address, { value: fee })).wait();
      // 3. Burn
      const token = new ethers.Contract(TOKEN_ADDRESS!, ["function balanceOf(address) view returns (uint256)", "function transfer(address,uint256)"], wallet);
      const bal = await token.balanceOf(wallet.address);
      await (await token.transfer(DEAD_ADDR, bal)).wait();
      console.log("✅ Cycle executed & burned to dead address!");
    }
  }, 10000);
}
runDaemon();`;

export const DocsPage: React.FC<DocsPageProps> = ({ config, onNavigateHome }) => {
  const [copiedDev, setCopiedDev] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'cycle' | 'abi' | 'reactive' | 'bot'>('cycle');
  const [copiedCode, setCopiedCode] = useState(false);
  return (
    <div className="min-h-screen bg-[#05070A] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="w-full bg-[#080B10] border-b border-cyan-500/20 sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fbbf24] text-black border-2 border-black flex items-center justify-center -rotate-2 shadow-[2px_2px_0px_#000]">
              <Flame className="w-5 h-5 stroke-[2.5] fill-black text-black" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-sketch font-bold text-lg text-white">
                  HOT DOCUMENTATION
                </span>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded text-[10px] font-mono">
                  v2.0 SPEC
                </span>
              </div>
              <p className="font-hand text-xs text-slate-400">
                Pons Family v2 Autonomous Engine &bull; Robinhood Chain (ID: 4663)
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-sketch font-bold shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-x-[1px] active:translate-y-[1px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Flywheel</span>
          </button>
        </div>
      </header>

      {/* Docs Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="p-6 sm:p-8 bg-[#151c27] sketch-box border-2 border-slate-700 shadow-xl relative overflow-hidden space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-sketch text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Architecture &amp; System Manual</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-sketch font-bold text-white tracking-tight">
            How the HOT Autonomous Flywheel Operates
          </h1>

          <p className="font-hand text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            HOT is an autonomous liquidity and deflation engine deployed on <strong className="text-white">Robinhood Chain (ID: 4663)</strong> using <strong className="text-white">Pons Family v2</strong>. 
            It creates perpetual upward buying pressure and token scarcity through an automated closed loop without human intervention.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-1 bg-[#0c1017] rounded border border-slate-700 text-emerald-400">
              ● 100% Non-Custodial
            </span>
            <span className="px-2.5 py-1 bg-[#0c1017] rounded border border-slate-700 text-sky-400">
              ● Immutable Dead Sink
            </span>
            <span className="px-2.5 py-1 bg-[#0c1017] rounded border border-slate-700 text-amber-400">
              ● Zero Slippage Fee Routing
            </span>
          </div>
        </div>

        {/* 4-Stage Lifecycle Deep Dive */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-300 font-sketch text-lg border-b-2 border-dashed border-slate-700 pb-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2>The 4-Stage Continuous Flywheel Loop</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stage 1 */}
            <div className="p-5 bg-[#151c27] sketch-box space-y-2.5 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-sky-950 text-sky-400 border border-sky-600 font-bold flex items-center justify-center text-xs font-mono">
                  01
                </span>
                <span className="text-xs font-sketch text-sky-400 font-bold">INFLOW TAX</span>
              </div>
              <h3 className="font-sketch text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Trade Volume &amp; Tax Inflow</span>
              </h3>
              <p className="font-hand text-xs text-slate-300 leading-relaxed">
                Traders buy and sell tokens on the Pons Bonding Curve DEX. Every transaction generates creator trading fees in native ETH that automatically accumulate in the decentralized Pons Fee Escrow contract.
              </p>
              <div className="pt-1 font-mono text-[11px] text-slate-400">
                Escrow: <code className="text-sky-300 font-mono">{PONS_V2_CONFIG.contracts.feeEscrow.substring(0, 16)}...</code>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-5 bg-[#151c27] sketch-box space-y-2.5 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 border border-amber-600 font-bold flex items-center justify-center text-xs font-mono">
                  02
                </span>
                <span className="text-xs font-sketch text-amber-400 font-bold">REACTIVE CLAIM</span>
              </div>
              <h3 className="font-sketch text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Auto-Claim Fee</span>
              </h3>
              <p className="font-hand text-xs text-slate-300 leading-relaxed">
                The engine continuously checks the Fee Escrow balance. While fees are below the threshold ({config.claimThresholdETH} ETH), the wheel stands idle. As soon as fees meet or exceed the threshold, the wheel activates and executes <code className="text-amber-300 font-mono">escrow.claim()</code>.
              </p>
              <div className="pt-1 font-mono text-[11px] text-slate-400">
                Trigger: <span className="text-amber-300 font-mono">&ge; {config.claimThresholdETH} ETH</span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-5 bg-[#151c27] sketch-box space-y-2.5 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-600 font-bold flex items-center justify-center text-xs font-mono">
                  03
                </span>
                <span className="text-xs font-sketch text-emerald-400 font-bold">DEX PRESSURE</span>
              </div>
              <h3 className="font-sketch text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Auto-Buyback DEX</span>
              </h3>
              <p className="font-hand text-xs text-slate-300 leading-relaxed">
                100% of the claimed ETH is immediately routed into the Curve market contract via <code className="text-emerald-300 font-mono">curve.buy&#123;value: fee&#125;()</code>. This creates direct buy pressure, supporting floor price and liquidity depth on-chain.
              </p>
              <div className="pt-1 font-mono text-[11px] text-slate-400">
                Curve Target: <code className="text-emerald-300 font-mono">{config.curveAddress ? config.curveAddress.substring(0, 16) + '...' : 'Configured on Launch'}</code>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="p-5 bg-[#151c27] sketch-box space-y-2.5 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-rose-950 text-rose-400 border border-rose-600 font-bold flex items-center justify-center text-xs font-mono">
                  04
                </span>
                <span className="text-xs font-sketch text-rose-400 font-bold">PERMANENT BURN</span>
              </div>
              <h3 className="font-sketch text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>Burn to Dead Sink</span>
              </h3>
              <p className="font-hand text-xs text-slate-300 leading-relaxed">
                All tokens acquired from the buyback are instantly transferred to the provably unspendable zero-address sink (<code className="text-rose-300 font-mono">{PONS_V2_CONFIG.contracts.deadAddress.substring(0, 10)}...dEaD</code>). Circulating supply decreases permanently.
              </p>
              <div className="pt-1 font-mono text-[11px] text-slate-400">
                Destination: <code className="text-rose-300 font-mono">0x000000000000000000000000000000000000dEaD</code>
              </div>
            </div>
          </div>
        </div>

        {/* Developer & Creator Authority Card */}
        <div className="p-6 bg-[#141b26] sketch-box border-2 border-slate-700 space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-dashed border-slate-700/80 pb-2.5 gap-2">
            <div className="flex items-center gap-2 text-amber-300 font-sketch text-base">
              <User className="w-5 h-5 text-amber-400" />
              <h3>Official Developer / Deployer Account</h3>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/40">
              Pons Protocol Beneficiary
            </span>
          </div>

          <p className="font-hand text-xs text-slate-300 leading-relaxed">
            This is the official deployer wallet address registered on Pons Factory. All trading volume fees generated across the Bonding Curve accumulate to this address inside the Pons Fee Escrow contract (<code className="text-amber-300 font-mono">0xd3AFEB...Ac9e</code>).
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-[#0a0f16] rounded-xl border border-slate-700/90 font-mono text-xs shadow-inner">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-400 font-sketch text-xs shrink-0">DEV ADDR:</span>
              <span className="text-amber-200 font-bold select-all truncate">
                {config.creatorAddress && config.creatorAddress.startsWith('0x')
                  ? config.creatorAddress
                  : 'Configured on Token Deployment (TBA)'}
              </span>
            </div>

            {config.creatorAddress && config.creatorAddress.startsWith('0x') && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(config.creatorAddress);
                    setCopiedDev(true);
                    setTimeout(() => setCopiedDev(false), 2000);
                  }}
                  className="px-3 py-1 bg-[#18202c] hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-600 flex items-center gap-1.5 cursor-pointer transition-colors text-[11px] font-sketch shadow-[2px_2px_0px_#000]"
                >
                  {copiedDev ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDev ? 'Copied' : 'Copy'}</span>
                </button>

                <a
                  href={`https://robinhoodchain.blockscout.com/address/${config.creatorAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-lg border border-amber-400/40 flex items-center gap-1 transition-colors text-[11px] font-sketch"
                >
                  <span>Blockscout</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Smart Contracts Directory */}
        <div className="p-6 bg-[#151c27] sketch-box border-2 border-slate-700 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-dashed border-slate-700/80 pb-3">
            <div className="flex items-center gap-2 text-white font-sketch text-base">
              <Code2 className="w-5 h-5 text-amber-400" />
              <h3>Protocol Smart Contracts (Robinhood Chain)</h3>
            </div>
            <a
              href="https://robinhoodchain.blockscout.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition-colors"
            >
              <span>Blockscout Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-sketch text-xs">
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Contract / Wallet Address</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="bg-amber-400/10">
                  <td className="py-2.5 px-3 font-sketch text-amber-300 font-bold">$HOT Token Contract (CA)</td>
                  <td className="py-2.5 px-3 text-amber-200 select-all font-mono font-bold">
                    <a
                      href={`https://explorer.mainnet.chain.robinhood.com/address/${PONS_V2_CONFIG.contracts.token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <span>{PONS_V2_CONFIG.contracts.token}</span>
                      <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
                    </a>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-sketch font-bold">● Deployed on RH Chain</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sketch text-amber-400 font-bold">Developer / Creator</td>
                  <td className="py-2.5 px-3 text-amber-300 select-all font-mono">
                    <a
                      href={`https://explorer.mainnet.chain.robinhood.com/address/${PONS_V2_CONFIG.contracts.creator}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <span>{PONS_V2_CONFIG.contracts.creator}</span>
                      <ExternalLink className="w-3 h-3 text-amber-400 shrink-0" />
                    </a>
                  </td>
                  <td className="py-2.5 px-3 text-amber-400 font-sketch">Deployer / Fee Beneficiary</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sketch text-white">HOT Pons Bonding Curve</td>
                  <td className="py-2.5 px-3 text-slate-200 select-all font-mono">
                    <a
                      href={`https://explorer.mainnet.chain.robinhood.com/address/${PONS_V2_CONFIG.contracts.curve}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <span>{PONS_V2_CONFIG.contracts.curve}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">DEX Market Curve</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sketch text-white">Fee Escrow Vault</td>
                  <td className="py-2.5 px-3 text-slate-200 select-all font-mono">
                    <a
                      href={`https://explorer.mainnet.chain.robinhood.com/address/${PONS_V2_CONFIG.contracts.feeEscrow}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <span>{PONS_V2_CONFIG.contracts.feeEscrow}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">Verified Vault</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sketch text-white">Dead Sink Address</td>
                  <td className="py-2.5 px-3 text-rose-400 select-all font-mono">
                    <a
                      href={`https://explorer.mainnet.chain.robinhood.com/address/${PONS_V2_CONFIG.contracts.deadAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <span>{PONS_V2_CONFIG.contracts.deadAddress}</span>
                      <ExternalLink className="w-3 h-3 text-rose-400 shrink-0" />
                    </a>
                  </td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">Permanent Burn Sink</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sketch text-white">Pons Factory</td>
                  <td className="py-2.5 px-3 text-slate-200 select-all font-mono">
                    <a
                      href={`https://explorer.mainnet.chain.robinhood.com/address/${PONS_V2_CONFIG.contracts.factory}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <span>{PONS_V2_CONFIG.contracts.factory}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">Verified Protocol</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sketch text-white">Buyback Vault</td>
                  <td className="py-2.5 px-3 text-slate-200 select-all font-mono">{PONS_V2_CONFIG.contracts.buybackVault}</td>
                  <td className="py-2.5 px-3 text-emerald-400">Verified Router</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Code Architecture & Technical Implementation */}
        <div className="p-6 bg-[#151c27] sketch-box border-2 border-slate-700 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-dashed border-slate-700/80 pb-3 gap-2">
            <div className="flex items-center gap-2 text-white font-sketch text-base">
              <Code2 className="w-5 h-5 text-amber-400" />
              <h3>Technical Code &amp; Execution Logic</h3>
            </div>
            <button
              onClick={() => {
                const codeToCopy =
                  activeCodeTab === 'cycle'
                    ? CODE_CYCLE
                    : activeCodeTab === 'abi'
                    ? CODE_ABI
                    : activeCodeTab === 'reactive'
                    ? CODE_REACTIVE
                    : CODE_BOT;
                navigator.clipboard.writeText(codeToCopy);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="px-3 py-1 bg-[#18202c] hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-600 flex items-center gap-1.5 transition-colors text-xs font-sketch shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Tab Switchers */}
          <div className="flex flex-wrap items-center gap-2 font-sketch text-xs">
            <button
              onClick={() => setActiveCodeTab('cycle')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeCodeTab === 'cycle'
                  ? 'bg-amber-400 text-slate-950 border-black font-bold shadow-[2px_2px_0px_#000]'
                  : 'bg-[#10151f] text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              1. Core Cycle (Claim &rarr; Buy &rarr; Burn)
            </button>

            <button
              onClick={() => setActiveCodeTab('abi')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeCodeTab === 'abi'
                  ? 'bg-amber-400 text-slate-950 border-black font-bold shadow-[2px_2px_0px_#000]'
                  : 'bg-[#10151f] text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              2. Pons v2 Contract ABIs
            </button>

            <button
              onClick={() => setActiveCodeTab('reactive')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeCodeTab === 'reactive'
                  ? 'bg-amber-400 text-slate-950 border-black font-bold shadow-[2px_2px_0px_#000]'
                  : 'bg-[#10151f] text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              3. Reactive Wheel State Engine
            </button>

            <button
              onClick={() => setActiveCodeTab('bot')}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeCodeTab === 'bot'
                  ? 'bg-amber-400 text-slate-950 border-black font-bold shadow-[2px_2px_0px_#000]'
                  : 'bg-[#10151f] text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              4. Headless 24/7 Bot Daemon
            </button>
          </div>

          {/* Syntax Highlighted Box */}
          <div className="relative bg-[#090d14] rounded-xl border border-slate-700/80 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] shadow-inner select-all leading-relaxed">
            <pre className="text-[11px] sm:text-xs">
              <code>
                {activeCodeTab === 'cycle' && CODE_CYCLE}
                {activeCodeTab === 'abi' && CODE_ABI}
                {activeCodeTab === 'reactive' && CODE_REACTIVE}
                {activeCodeTab === 'bot' && CODE_BOT}
              </code>
            </pre>
          </div>

          {/* Explanation Footer under Code */}
          <div className="pt-2 text-xs font-hand text-slate-400 flex items-start gap-2">
            <span className="text-amber-400 font-bold">&bull;</span>
            <span>
              {activeCodeTab === 'cycle' &&
                'This 3-step mechanism executes sequentially and reliably: claimed ETH fees are immediately swapped for tokens on Pons Curve, and all acquired tokens are permanently transferred to the dead address 0x0...dEaD.'}
              {activeCodeTab === 'abi' &&
                'Official Pons Family v2 interfaces: FeeEscrow for creator ETH fee liquidation, Curve DEX for market buy swaps, and standard ERC-20 for burn transfer execution.'}
              {activeCodeTab === 'reactive' &&
                'This web engine operates reactively: the flywheel halts on idle when fees are below threshold, and automatically spins as trading volume accumulates.'}
              {activeCodeTab === 'bot' &&
                'This Node.js daemon script runs 24/7 in the background without needing a browser, utilizing the private key to sign on-chain transactions autonomously.'}
            </span>
          </div>
        </div>

        {/* Security & FAQ */}
        <div className="p-6 bg-[#151c27] sketch-box border border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-sketch text-base">
            <ShieldCheck className="w-5 h-5" />
            <h3>Security &amp; Non-Custodial Guarantee</h3>
          </div>

          <div className="space-y-2 text-xs font-hand text-base text-slate-300 leading-relaxed">
            <p>
              &bull; <strong className="text-white font-sketch text-xs">Immutable Burn Sink:</strong> Tokens sent to the dead address (<code className="text-rose-300 font-mono">0x0...dEaD</code>) can never be withdrawn, upgraded, or recovered by anyone, including the deployer.
            </p>
            <p>
              &bull; <strong className="text-white font-sketch text-xs">Transparent On-Chain Routing:</strong> Every execution is recorded on Robinhood Chain Blockscout with deterministic transaction hashes.
            </p>
            <p>
              &bull; <strong className="text-white font-sketch text-xs">Autonomous Reactive Operation:</strong> The flywheel automatically halts when there are no fees in escrow, preventing redundant gas expenditure, and instantly activates as soon as trading activity triggers the threshold.
            </p>
          </div>
        </div>

        {/* Return Button at Bottom */}
        <div className="text-center pt-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-sketch font-bold shadow-[3px_3px_0px_#000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Flywheel Dashboard</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#111722] border-t-2 border-slate-700/80 py-4 px-4 sm:px-8 text-center text-xs text-slate-400 font-hand text-base">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            HOT &bull; Deployed on Robinhood Chain (ID: 4663)
          </div>
          <div className="flex items-center gap-3 sm:gap-4 font-sketch text-xs">
            <a
              href="https://x.com/hotonrh"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-[#18202c] hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-[2px_2px_0px_#000]"
              title="HOT on Twitter / X (@hotonrh)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Twitter</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href="https://docs.ponsfamily.com/v2"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-400"
            >
              <span>Pons v2 Reference</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
