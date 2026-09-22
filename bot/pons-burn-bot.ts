/**
 * PONS FAMILY V2 - AUTONOMOUS BUYBACK & BURN BOT
 * Network: Robinhood Chain (EVM Chain ID: 4663)
 * Reference: https://docs.ponsfamily.com/v2
 * 
 * Fitur:
 * 1. Menjalankan Autonomous Cycle (Claim Fee -> Buyback -> Burn) 24/7 di PM2.
 * 2. Uniswap v4 Universal Router integration untuk token yang telah graduated.
 * 3. Token CA & Curve Address terkunci permanen ke $INCINERATOR.
 */

import http from "http";
import fs from "fs";
import path from "path";
import { ethers } from "ethers";

// Native .env parser (tanpa ketergantungan modul eksternal)
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {}

// File konfigurasi persisten
const CONFIG_FILE = path.resolve(process.cwd(), "bot-config.json");

export const OFFICIAL_INCINERATOR_TOKEN = process.env.TOKEN_ADDRESS || process.env.VITE_TOKEN_ADDRESS || "";
export const OFFICIAL_INCINERATOR_CURVE = process.env.CURVE_ADDRESS || process.env.VITE_CURVE_ADDRESS || "";

// Default Config (Semua address di-reset dari 0)
let currentConfig = {
  rpcUrl: process.env.RPC_URL || process.env.VITE_RPC_URL || "https://rpc.mainnet.chain.robinhood.com",
  privateKey: process.env.CREATOR_PRIVATE_KEY || process.env.PRIVATE_KEY || "",
  tokenAddress: OFFICIAL_INCINERATOR_TOKEN,
  curveAddress: OFFICIAL_INCINERATOR_CURVE,
  claimThresholdETH: process.env.CLAIM_THRESHOLD_ETH || process.env.VITE_CLAIM_THRESHOLD_ETH || "0.01",
  pollIntervalSeconds: parseInt(process.env.POLL_INTERVAL_SECONDS || "10", 10),
  port: parseInt(process.env.PORT || "5010", 10)
};

// Baca config tersimpan jika ada
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    if (saved.tokenAddress && saved.tokenAddress !== "") currentConfig.tokenAddress = saved.tokenAddress;
    if (saved.curveAddress && saved.curveAddress !== "") currentConfig.curveAddress = saved.curveAddress;
    if (saved.claimThresholdETH) currentConfig.claimThresholdETH = saved.claimThresholdETH;
    if (saved.pollIntervalSeconds) currentConfig.pollIntervalSeconds = saved.pollIntervalSeconds;
    console.log("[CONFIG] Konfigurasi dimuat dari bot-config.json");
  } catch (e) {
    console.error("Gagal membaca bot-config.json, menggunakan environment default");
  }
}

// Simpan config ke file
function saveConfigToFile(newCfg: Partial<typeof currentConfig>) {
  if (newCfg.tokenAddress !== undefined) currentConfig.tokenAddress = newCfg.tokenAddress;
  if (newCfg.curveAddress !== undefined) currentConfig.curveAddress = newCfg.curveAddress;
  if (newCfg.privateKey !== undefined) currentConfig.privateKey = newCfg.privateKey;
  if (newCfg.claimThresholdETH) currentConfig.claimThresholdETH = newCfg.claimThresholdETH;
  if (newCfg.pollIntervalSeconds) currentConfig.pollIntervalSeconds = newCfg.pollIntervalSeconds;
  try {
    const toSave: any = {
      tokenAddress: currentConfig.tokenAddress,
      curveAddress: currentConfig.curveAddress,
      claimThresholdETH: currentConfig.claimThresholdETH,
      pollIntervalSeconds: currentConfig.pollIntervalSeconds
    };
    if (currentConfig.privateKey) {
      toSave.privateKey = currentConfig.privateKey;
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(toSave, null, 2), "utf-8");
    console.log("[CONFIG] Konfigurasi berhasil disimpan ke bot-config.json");
  } catch (err: any) {
    console.error("Gagal menyimpan bot-config.json:", err.message);
  }
}

// Kontrak Resmi Pons v2 (docs.ponsfamily.com/v2)
const PONS_FEE_ESCROW = "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e";
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const UNISWAP_V4_UNIVERSAL_ROUTER = process.env.UNISWAP_ROUTER_ADDRESS || process.env.VITE_UNISWAP_ROUTER_ADDRESS || "0x8876789976dEcBfCbBbe364623C63652db8C0904";

/// Template Uniswap v4 Universal Router swap (Commands: 0x10, Actions: 0x060c0f)
const V4_SWAP_TEMPLATE = "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000003060c0f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a6a44f24780b95d467d482de278a017fd6d7c2b3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000e5e702641ea86f4ae6cc3cdaed2b886f976be044000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000a6a44f24780b95d467d482de278a017fd6d7c2b30000000000000000000000000000000000000000000000000000000000000001";

function buildUniswapV4Buy(targetToken: string, buyAmountWei: bigint, deadlineSeconds = 1800) {
  const routerInterface = new ethers.Interface([
    "function execute(bytes commands, bytes[] inputs, uint256 deadline) external payable"
  ]);
  const oldAmountHex = ethers.toBeHex(ethers.parseEther("0.001"), 32).slice(2);
  const newAmountHex = ethers.toBeHex(buyAmountWei, 32).slice(2);
  let replaced = V4_SWAP_TEMPLATE.slice(2).replaceAll(oldAmountHex, newAmountHex);

  const oldTokenHex = "a6a44f24780b95d467d482de278a017fd6d7c2b3";
  const cleanTokenHex = targetToken.toLowerCase().replace("0x", "");
  if (cleanTokenHex && cleanTokenHex.length === 40) {
    replaced = replaced.replaceAll(oldTokenHex, cleanTokenHex);
  }

  const replacedInput0 = "0x" + replaced;
  const deadline = Math.floor(Date.now() / 1000) + deadlineSeconds;
  return routerInterface.encodeFunctionData("execute", ["0x10", [replacedInput0], deadline]);
}

// ABIs
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
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function curve() view returns (address)"
];

// Memory state untuk monitoring & API
interface BotMemoryLog {
  timestamp: string;
  type: "info" | "success" | "warn" | "error";
  message: string;
}

const botState = {
  online: true,
  status: "standby" as "standby" | "active" | "error" | "claiming" | "buyback" | "burning",
  walletAddress: "",
  tokenAddress: currentConfig.tokenAddress,
  curveAddress: currentConfig.curveAddress,
  claimThresholdETH: currentConfig.claimThresholdETH,
  escrowBalanceETH: "0.0",
  totalFeesClaimedETH: "0.0",
  totalFeesRetainedETH: "0.0",
  totalCyclesExecuted: 0,
  lastCycleTime: "",
  logs: [] as BotMemoryLog[]
};

function addLog(type: "info" | "success" | "warn" | "error", message: string) {
  const timestamp = new Date().toLocaleTimeString();
  const logItem: BotMemoryLog = { timestamp, type, message };
  botState.logs.unshift(logItem);
  if (botState.logs.length > 50) botState.logs.pop();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
}

// Inisialisasi Wallet Web3
let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;

function initWallet() {
  try {
    if (!currentConfig.privateKey) {
      addLog("error", "CREATOR_PRIVATE_KEY not set in .env!");
      return;
    }
    provider = new ethers.JsonRpcProvider(currentConfig.rpcUrl);
    wallet = new ethers.Wallet(currentConfig.privateKey, provider);
    botState.walletAddress = wallet.address;
    addLog("info", `Operator Wallet active: ${wallet.address}`);
  } catch (e: any) {
    addLog("error", `Failed to initialize wallet: ${e.message}`);
  }
}

initWallet();

// Validate whether Token Address is valid
function isValidAddress(addr?: string): boolean {
  if (!addr) return false;
  const c = addr.trim().toLowerCase();
  return c !== "none" && c !== "" && ethers.isAddress(c);
}

// Execution Cycle
let isExecuting = false;

async function executeCycle() {
  if (isExecuting) {
    addLog("warn", "Cycle currently executing, skipping this poll tick.");
    return;
  }

  botState.tokenAddress = currentConfig.tokenAddress;
  botState.curveAddress = currentConfig.curveAddress;

  if (!isValidAddress(currentConfig.tokenAddress)) {
    botState.status = "standby";
    addLog("warn", "STANDBY: Token CA is not configured. Waiting for configuration.");
    return;
  }

  if (!wallet || !provider) {
    botState.status = "error";
    addLog("error", "Wallet or RPC Provider not ready.");
    return;
  }

  // Auto-detect Curve from Token CA if not set or different
  try {
    const tokenContract = new ethers.Contract(currentConfig.tokenAddress, ERC20_ABI, wallet);
    const resolvedCurve = await tokenContract.curve();
    if (resolvedCurve && ethers.isAddress(resolvedCurve) && resolvedCurve !== ethers.ZeroAddress) {
      if (currentConfig.curveAddress.toLowerCase() !== resolvedCurve.toLowerCase()) {
        addLog("info", `[AUTO-SYNC] Connected to detected Pons Curve: ${resolvedCurve}`);
        currentConfig.curveAddress = resolvedCurve;
        botState.curveAddress = resolvedCurve;
        saveConfigToFile({ curveAddress: resolvedCurve });
      }
    }
  } catch (e: any) {
    // Skip if curve query error
  }

  if (!isValidAddress(currentConfig.curveAddress)) {
    botState.status = "standby";
    addLog("warn", "STANDBY: Curve Address is not valid yet.");
    return;
  }

  // Alternating cycle calculation
  // Odd cycle (1, 3, 5...): 0.01 ETH -> Claim -> Buyback -> Burn
  // Even cycle (2, 4, 6...): 0.02 ETH -> Claim -> Keep (retained in wallet)
  const currentCycleNum = botState.totalCyclesExecuted + 1;
  const isBurnCycle = currentCycleNum % 2 === 1;
  const cycleType = isBurnCycle ? "BURN" : "KEEP";
  const cycleThresholdETH = isBurnCycle ? "0.01" : "0.02";

  currentConfig.claimThresholdETH = cycleThresholdETH;
  botState.claimThresholdETH = cycleThresholdETH;

  isExecuting = true;
  botState.status = "active";

  try {
    const feeEscrow = new ethers.Contract(PONS_FEE_ESCROW, ESCROW_ABI, wallet);
    const curve = new ethers.Contract(currentConfig.curveAddress, CURVE_ABI, wallet);
    const token = new ethers.Contract(currentConfig.tokenAddress, ERC20_ABI, wallet);

    // Check Fee Escrow
    const claimableWei: bigint = await feeEscrow.balanceOf(wallet.address);
    const claimableETH = ethers.formatEther(claimableWei);
    botState.escrowBalanceETH = claimableETH;
    botState.lastCycleTime = new Date().toLocaleTimeString();

    if (isBurnCycle) {
      addLog("info", `[Cycle #${currentCycleNum} - BURN] Escrow Fee: ${claimableETH} ETH (Target: ${cycleThresholdETH} ETH)`);
    }

    const thresholdWei = ethers.parseEther(cycleThresholdETH);
    const gasBuffer = ethers.parseEther("0.0008");
    const initialWalletBal = await provider.getBalance(wallet.address);
    const initialUsableETH = initialWalletBal > gasBuffer ? initialWalletBal - gasBuffer : 0n;

    const shouldExecute = (claimableWei >= thresholdWei && claimableWei > 0n) || (initialUsableETH >= thresholdWei);

    if (shouldExecute) {
      if (isBurnCycle) {
        addLog("success", `[Cycle #${currentCycleNum} - BURN] THRESHOLD REACHED (Claimable: ${claimableETH} ETH, Target: ${cycleThresholdETH} ETH). Executing cycle...`);
      }

      // 1. CLAIM (Jika ada fee di Escrow)
      if (claimableWei > 0n) {
        botState.status = "claiming";
        if (isBurnCycle) {
          addLog("info", `[1/3] Claiming ${claimableETH} ETH from Pons Fee Escrow...`);
        }
        const claimNonce = await provider.getTransactionCount(wallet.address, "latest");
        const claimTx = await feeEscrow.claim({ nonce: claimNonce });
        if (isBurnCycle) {
          addLog("info", `Claim Tx broadcasted: ${claimTx.hash}`);
        }
        await claimTx.wait();
        if (isBurnCycle) {
          addLog("success", "Fee successfully claimed to operator wallet!");
        }
        const claimedVal = parseFloat(claimableETH) || 0;
        botState.totalFeesClaimedETH = (parseFloat(botState.totalFeesClaimedETH || "0.0") + claimedVal).toFixed(4);
        botState.escrowBalanceETH = "0.0";
      } else if (isBurnCycle) {
        addLog("info", `[1/3] Escrow balance is 0 ETH. Proceeding with accumulated operator balance (${ethers.formatEther(initialUsableETH)} ETH)...`);
      }

      if (isBurnCycle) {
        // ODD CYCLE: Buyback & Burn
        botState.status = "buyback";
        const isGraduated = await curve.graduated().catch(() => false);

        const walletBal = await provider.getBalance(wallet.address);
        let buyAmountWei = walletBal > gasBuffer ? walletBal - gasBuffer : 0n;

        if (buyAmountWei > 0n) {
          if (isGraduated) {
            addLog("info", `[2/3] Token has graduated! Executing Buyback on Uniswap v4 Router (${ethers.formatEther(buyAmountWei)} ETH)...`);
            const buyData = buildUniswapV4Buy(currentConfig.tokenAddress, buyAmountWei);
            const buyNonce = await provider.getTransactionCount(wallet.address, "latest");
            const buyTx = await wallet.sendTransaction({
              to: UNISWAP_V4_UNIVERSAL_ROUTER,
              value: buyAmountWei,
              data: buyData,
              gasLimit: 400000n,
              nonce: buyNonce
            });
            addLog("info", `Uniswap v4 Buyback Tx broadcasted: ${buyTx.hash}`);
            await buyTx.wait();
            addLog("success", `Buyback on Uniswap v4 succeeded (${ethers.formatEther(buyAmountWei)} ETH)!`);
          } else {
            addLog("info", `[2/3] Token on Bonding Curve. Executing Buyback on Curve DEX (${ethers.formatEther(buyAmountWei)} ETH)...`);
            const buyNonce = await provider.getTransactionCount(wallet.address, "latest");
            const buyTx = await curve.buy(buyAmountWei, 0n, wallet.address, {
              value: buyAmountWei,
              nonce: buyNonce
            });
            addLog("info", `Buyback Tx broadcasted: ${buyTx.hash}`);
            await buyTx.wait();
            addLog("success", `Buyback on Curve succeeded (${ethers.formatEther(buyAmountWei)} ETH)!`);
          }
        } else {
          addLog("warn", "[2/3] Insufficient wallet balance for buyback after gas buffer.");
        }

        // 3. BURN TOKEN
        botState.status = "burning";
        const tokenSymbol = await token.symbol().catch(() => "TOKEN");
        const tokenBalance: bigint = await token.balanceOf(wallet.address);
        const formattedBalance = ethers.formatUnits(tokenBalance, 18);

        if (tokenBalance > 0n) {
          addLog("info", `[3/3] Burning ${formattedBalance} $${tokenSymbol} to DEAD_ADDRESS...`);
          const burnNonce = await provider.getTransactionCount(wallet.address, "latest");
          const burnTx = await token.transfer(DEAD_ADDRESS, tokenBalance, { nonce: burnNonce });
          addLog("info", `Burn Tx broadcasted: ${burnTx.hash}`);
          await burnTx.wait();
          addLog("success", `COMPLETED: ${formattedBalance} $${tokenSymbol} PERMANENTLY INCINERATED!`);
          botState.totalCyclesExecuted++;
        } else {
          addLog("warn", `[3/3] No $${tokenSymbol} tokens in wallet to burn.`);
          botState.totalCyclesExecuted++;
        }
      } else {
        // EVEN CYCLE: KEEP (Retained in wallet, no DEX swap, no burn, no keep log)
        const retainedVal = parseFloat(claimableETH) || parseFloat(ethers.formatEther(initialUsableETH)) || 0;
        botState.totalFeesRetainedETH = (parseFloat(botState.totalFeesRetainedETH || "0.0") + retainedVal).toFixed(4);
        botState.totalCyclesExecuted++;
      }
    }
  } catch (err: any) {
    addLog("error", `Cycle execution error: ${err.message || err}`);
  } finally {
    isExecuting = false;
    botState.status = "standby";
  }
}

// Loop berulang
setInterval(() => {
  executeCycle().catch((e) => addLog("error", `Loop error: ${e.message}`));
}, currentConfig.pollIntervalSeconds * 1000);

// Pengecekan pertama kali jalan
executeCycle().catch(console.error);

// -------------------------------------------------------------
// NATIVE HTTP API SERVER (Untuk komunikasi langsung dengan /memex)
// -------------------------------------------------------------
function sendJSON(res: http.ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-secret"
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-secret"
    });
    res.end();
    return;
  }

  const url = req.url || "/";

  // Endpoint 1: GET /api/status
  if (req.method === "GET" && (url === "/api/status" || url === "/api/status/")) {
    return sendJSON(res, 200, {
      success: true,
      data: {
        online: true,
        status: botState.status,
        walletAddress: botState.walletAddress,
        tokenAddress: currentConfig.tokenAddress,
        curveAddress: currentConfig.curveAddress,
        claimThresholdETH: currentConfig.claimThresholdETH,
        escrowBalanceETH: botState.escrowBalanceETH,
        totalFeesClaimedETH: botState.totalFeesClaimedETH,
        totalFeesRetainedETH: botState.totalFeesRetainedETH,
        totalCyclesExecuted: botState.totalCyclesExecuted,
        nextCycleType: (botState.totalCyclesExecuted + 1) % 2 === 1 ? "burn" : "keep",
        lastCycleTime: botState.lastCycleTime,
        pollIntervalSeconds: currentConfig.pollIntervalSeconds,
        logs: botState.logs
      }
    });
  }

  // Endpoint 2: POST /api/config atau POST /api/admin/save
  if (req.method === "POST" && (url === "/api/config" || url === "/api/admin/save" || url === "/api/config/")) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        let updated = false;

        if (data.tokenAddress !== undefined) {
          const cleanToken = data.tokenAddress.trim();
          currentConfig.tokenAddress = cleanToken;
          updated = true;
          addLog("info", `[CONFIG] Token Address diperbarui dari /memex: ${cleanToken || "Dikosongkan"}`);
        }

        if (data.privateKey !== undefined) {
          const cleanKey = data.privateKey.trim();
          currentConfig.privateKey = cleanKey;
          initWallet();
          updated = true;
          addLog("info", `[CONFIG] Operator Private Key diperbarui dari /memex. Address: ${botState.walletAddress || "None"}`);
        }

        if (updated) {
          saveConfigToFile({
            tokenAddress: currentConfig.tokenAddress,
            privateKey: currentConfig.privateKey
          });
        }

        return sendJSON(res, 200, {
          success: true,
          message: "Konfigurasi bot berhasil diperbarui dari /memex",
          tokenAddress: currentConfig.tokenAddress,
          walletAddress: botState.walletAddress
        });
      } catch (err: any) {
        return sendJSON(res, 400, { success: false, error: err.message });
      }
    });
    return;
  }

  // Tolak route lain
  return sendJSON(res, 404, { success: false, error: "Not Found" });
});

const PORT = currentConfig.port || 5010;

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.warn(`[API] Port ${PORT} sedang dipakai. Mencoba port ${PORT + 1}...`);
    try {
      server.listen(PORT + 1, "0.0.0.0");
    } catch (e) {
      console.warn("API server dialihkan, proses bot tetap berjalan.");
    }
  } else {
    console.error("[API Error]:", err.message);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("==========================================================");
  console.log(`INCINERATOR AUTONOMOUS BURN ENGINE & API SERVER ACTIVE`);
  console.log(`   Server Port      : ${PORT}`);
  console.log(`   Admin API Ready  : http://localhost:${PORT}/api/status`);
  console.log(`   Operator Wallet  : ${botState.walletAddress || "Not ready"}`);
  console.log(`   Initial Status   : ${isValidAddress(currentConfig.tokenAddress) ? "ACTIVE" : "STANDBY (Awaiting CA from /memex)"}`);
  console.log("==========================================================");
});
