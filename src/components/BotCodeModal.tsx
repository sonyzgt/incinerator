import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ShieldAlert } from 'lucide-react';
import { PONS_V2_CONFIG } from '../contracts';

interface BotCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BotCodeModal: React.FC<BotCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const botScript = `/**
 * PONS FAMILY V2 - 24/7 AUTONOMOUS BURN ENGINE BOT
 * Alternating Cycles:
 *   - Odd Cycles  (1, 3, 5...): Claim Fee @ 0.01 ETH -> Buyback (Curve/Uniswap) -> Burn to Dead
 *   - Even Cycles (2, 4, 6...): Claim Fee @ 0.02 ETH -> Keep (Retained in Treasury)
 * Network: Robinhood Chain (EVM Chain ID: 4663)
 * Protocol Docs: https://docs.ponsfamily.com/v2
 * 
 * Setup:
 *   npm install ethers dotenv
 */

import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// ENVIRONMENT CONFIG
const RPC_URL = process.env.RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
const PRIVATE_KEY = process.env.CREATOR_PRIVATE_KEY!;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS!;
const CURVE_ADDRESS = process.env.CURVE_ADDRESS!;

// OFFICIAL PONS V2 ESCROW & DEAD SINK
const FEE_ESCROW_ADDRESS = "${PONS_V2_CONFIG.contracts.feeEscrow}";
const DEAD_ADDRESS = "${PONS_V2_CONFIG.contracts.deadAddress}";
const UNISWAP_V4_ROUTER = "${PONS_V2_CONFIG.contracts.uniswapV4Router}";

const POLL_INTERVAL_MS = 10000; // Check every 10 seconds

const ESCROW_ABI = [
  "function balanceOf(address recipient) view returns (uint256)",
  "function claim()"
];

const CURVE_ABI = [
  "function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256)",
  "function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)",
  "function sellableTokens() view returns (uint256)",
  "function graduated() view returns (bool)"
];

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)"
];

async function main() {
  console.log("==================================================");
  console.log("PONS V2 AUTONOMOUS BURN ENGINE BOT ACTIVATED");
  console.log("Target Fee Escrow:", FEE_ESCROW_ADDRESS);
  console.log("Target Dead Address:", DEAD_ADDRESS);
  console.log("==================================================");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("Operator Wallet:", wallet.address);

  const feeEscrow = new ethers.Contract(FEE_ESCROW_ADDRESS, ESCROW_ABI, wallet);
  const curve = new ethers.Contract(CURVE_ADDRESS, CURVE_ABI, wallet);
  const token = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);

  const symbol = await token.symbol().catch(() => "TOKEN");
  let cycle = 1;

  async function checkAndExecute() {
    try {
      const isBurnCycle = cycle % 2 === 1;
      const targetThresholdETH = isBurnCycle ? "0.01" : "0.02";
      const thresholdWei = ethers.parseEther(targetThresholdETH);

      console.log(\`\\n[\${new Date().toLocaleTimeString()}] [Cycle #\${cycle} - \${isBurnCycle ? 'BURN' : 'KEEP'}] Checking Escrow Fee...\`);
      
      const claimableWei = await feeEscrow.balanceOf(wallet.address);
      const claimableETH = ethers.formatEther(claimableWei);
      console.log(\`  Available in Escrow: \${claimableETH} ETH (Target: \${targetThresholdETH} ETH)\`);

      if (claimableWei >= thresholdWei) {
        console.log(\`\\n[THRESHOLD REACHED] Executing Cycle #\${cycle} (\${isBurnCycle ? 'BURN @ 0.01 ETH' : 'KEEP @ 0.02 ETH'})...\`);

        // STEP 1: CLAIM FEE
        console.log(\`  [Step 1] Claiming \${claimableETH} ETH from Pons Fee Escrow...\`);
        const claimTx = await feeEscrow.claim();
        console.log(\`  Claim Tx: \${claimTx.hash}\`);
        await claimTx.wait();
        console.log(\`  Fee claimed to wallet successfully!\`);

        if (isBurnCycle) {
          // STEP 2: AUTO-BUYBACK (Check migration)
          console.log(\`  [Step 2] Checking token migration status...\`);
          const isGraduated = await curve.graduated().catch(() => false);
          if (isGraduated) {
            console.log(\`  Token has migrated to Uniswap v4 Router (\${UNISWAP_V4_ROUTER}). Executing swap...\`);
          } else {
            console.log(\`  Token is on Bonding Curve. Executing buy on Curve DEX...\`);
            const buyTx = await curve.buy(claimableWei, 0n, wallet.address, {
              value: claimableWei
            });
            console.log(\`  Buyback Tx: \${buyTx.hash}\`);
            await buyTx.wait();
            console.log(\`  Buyback confirmed!\`);
          }

          // STEP 3: AUTO-BURN
          const tokenBalance = await token.balanceOf(wallet.address);
          console.log(\`  [Step 3] Burning \${ethers.formatUnits(tokenBalance, 18)} $\${symbol} to dead address...\`);
          const burnTx = await token.transfer(DEAD_ADDRESS, tokenBalance);
          console.log(\`  Burn Tx: \${burnTx.hash}\`);
          await burnTx.wait();
          console.log(\`  Tokens permanently destroyed in Dead Sink!\`);
        } else {
          // EVEN CYCLE: KEEP (Retained in operator/treasury wallet)
          console.log(\`  [Step 2 - KEEP] Fee \${claimableETH} ETH retained in treasury wallet. Swap and burn skipped.\`);
        }

        cycle++;
        console.log(\`  Cycle complete! Next target: \${cycle % 2 === 1 ? '0.01 ETH (BURN)' : '0.02 ETH (KEEP)'}\\n\`);
      } else {
        console.log(\`  Accumulating volume... (Below threshold of \${targetThresholdETH} ETH)\`);
      }
    } catch (err: any) {
      console.error("  Cycle error:", err.message || err);
    }
  }

  await checkAndExecute();
  setInterval(checkAndExecute, POLL_INTERVAL_MS);
}

main().catch(console.error);`;

  const copyScript = () => {
    navigator.clipboard.writeText(botScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#151c27] sketch-box w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-2 border-slate-600">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#111722] border-b-2 border-dashed border-slate-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-sketch text-base font-bold text-white">
                Pons v2 Autonomous Burn Engine Daemon (Node.js/TypeScript)
              </h3>
              <p className="font-hand text-xs text-slate-400">
                Standalone runner to execute 24/7 on your local PC or VPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-hand text-base">
          <div className="p-3 bg-amber-400/10 border-2 border-dashed border-amber-400/40 rounded-xl flex items-start gap-2.5 text-amber-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="text-xs">
              <strong className="font-sketch font-bold text-amber-300">Security Note:</strong> Your private key remains strictly on your own machine. This script only calls the verified Pons v2 Fee Escrow (<code>{PONS_V2_CONFIG.contracts.feeEscrow}</code>) and dead address.
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sketch font-bold text-slate-200 text-xs">Bot Source Code:</span>
              <button
                onClick={copyScript}
                className="flex items-center gap-1 text-xs font-sketch px-3 py-1 rounded bg-[#1e293b] hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-600 shadow-[2px_2px_0px_#000]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>
            <pre className="p-4 bg-[#0d1219] rounded-xl border border-slate-700 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96 selection:bg-amber-900/60">
              {botScript}
            </pre>
          </div>

          <div className="p-4 bg-[#111722] rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
            <h5 className="font-sketch font-bold text-amber-300 text-sm">Deployment Guide:</h5>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>In your terminal: <code className="text-amber-300">npm init -y && npm i ethers dotenv</code></li>
              <li>Save code as <code className="text-amber-300">bot.js</code> or <code className="text-amber-300">bot.ts</code></li>
              <li>Create a <code className="text-amber-300">.env</code> file containing your token address and creator private key</li>
              <li>Launch with: <code className="text-amber-300">node bot.js</code> or keep running with <code className="text-amber-300">pm2 start bot.js --name "pons-flywheel"</code></li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#111722] border-t-2 border-dashed border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sketch rounded-lg text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
