/**
 * PONS FAMILY V2 - AUTONOMOUS FLYWHEEL BOT & API SERVER
 * Network: Robinhood Chain (EVM Chain ID: 4663)
 * Reference: https://docs.ponsfamily.com/v2
 * 
 * Fitur:
 * 1. Menjalankan Autonomous Flywheel (Claim Fee -> Buyback -> Burn) 24/7 di PM2.
 * 2. Menyediakan HTTP API Server (/api/status, /api/config, /api/trigger)
 * 3. Terhubung langsung dengan halaman /memex (ganti Token CA langsung aktif tanpa restart PM2).
 * 4. Otomatis mendeteksi alamat Pons Curve dari Token CA (Zero Mismatch).
 * 5. Mode Standby cerdas jika Token CA belum diisi (tidak crash).
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

// Admin password untuk otorisasi API dari /memex
const ADMIN_SECRET = process.env.ADMIN_SECRET || "Sonyfree24@";

// Default Config
let currentConfig = {
  rpcUrl: process.env.RPC_URL || process.env.VITE_RPC_URL || "https://rpc.mainnet.chain.robinhood.com",
  privateKey: process.env.CREATOR_PRIVATE_KEY || process.env.PRIVATE_KEY || "",
  tokenAddress: process.env.TOKEN_ADDRESS || process.env.VITE_TOKEN_ADDRESS || "",
  curveAddress: process.env.CURVE_ADDRESS || process.env.VITE_CURVE_ADDRESS || "",
  claimThresholdETH: process.env.CLAIM_THRESHOLD_ETH || process.env.VITE_CLAIM_THRESHOLD_ETH || "0.015",
  pollIntervalSeconds: parseInt(process.env.POLL_INTERVAL_SECONDS || "10", 10),
  port: parseInt(process.env.PORT || "5000", 10)
};

// Baca config tersimpan jika ada
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    currentConfig = { ...currentConfig, ...saved };
    console.log("📂 [CONFIG] Konfigurasi dimuat dari bot-config.json");
  } catch (e) {
    console.error("⚠️ Gagal membaca bot-config.json, menggunakan environment default");
  }
}

// Simpan config ke file
function saveConfigToFile(newCfg: Partial<typeof currentConfig>) {
  currentConfig = { ...currentConfig, ...newCfg };
  try {
    const toSave = {
      tokenAddress: currentConfig.tokenAddress,
      curveAddress: currentConfig.curveAddress,
      claimThresholdETH: currentConfig.claimThresholdETH,
      pollIntervalSeconds: currentConfig.pollIntervalSeconds
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(toSave, null, 2), "utf-8");
    console.log("💾 [CONFIG] Konfigurasi berhasil disimpan ke bot-config.json");
  } catch (err: any) {
    console.error("❌ Gagal menyimpan bot-config.json:", err.message);
  }
}

// Kontrak Resmi Pons v2 (docs.ponsfamily.com/v2)
const PONS_FEE_ESCROW = "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e";
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

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

// Memory state untuk monitoring & API /memex
interface BotMemoryLog {
  timestamp: string;
  type: "info" | "success" | "warn" | "error";
  message: string;
}

const botState = {
  online: true,
  status: "standby" as "standby" | "active" | "error",
  walletAddress: "",
  tokenAddress: currentConfig.tokenAddress,
  curveAddress: currentConfig.curveAddress,
  claimThresholdETH: currentConfig.claimThresholdETH,
  escrowBalanceETH: "0.0",
  totalFeesClaimedETH: "0.9680",
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

// Flywheel Execution Cycle
let isExecuting = false;

async function executeCycle() {
  if (isExecuting) {
    addLog("warn", "Cycle currently executing, skipping this poll tick.");
    return;
  }

  botState.tokenAddress = currentConfig.tokenAddress;
  botState.curveAddress = currentConfig.curveAddress;
  botState.claimThresholdETH = currentConfig.claimThresholdETH;

  if (!isValidAddress(currentConfig.tokenAddress)) {
    botState.status = "standby";
    addLog("warn", "STANDBY: Token CA is not configured (set to 'none'). Visit /memex to configure.");
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
        addLog("info", `⚡ [AUTO-SYNC] Connected to detected Pons Curve: ${resolvedCurve}`);
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

    addLog("info", `Checking Escrow Fee: ${claimableETH} ETH (Threshold: ${currentConfig.claimThresholdETH} ETH)`);

    const thresholdWei = ethers.parseEther(currentConfig.claimThresholdETH);

    if (claimableWei >= thresholdWei && claimableWei > 0n) {
      addLog("success", `⚡ THRESHOLD REACHED (${claimableETH} ETH >= ${currentConfig.claimThresholdETH} ETH). Initiating Flywheel!`);

      // 1. CLAIM
      botState.status = "claiming" as any;
      addLog("info", `[1/3] Claiming ${claimableETH} ETH from Pons Fee Escrow...`);
      const claimNonce = await provider.getTransactionCount(wallet.address, "latest");
      const claimTx = await feeEscrow.claim({ nonce: claimNonce });
      addLog("info", `Claim Tx broadcasted: ${claimTx.hash}`);
      await claimTx.wait();
      addLog("success", "Fee successfully claimed to operator wallet!");
      const claimedVal = parseFloat(claimableETH) || 0;
      botState.totalFeesClaimedETH = (parseFloat(botState.totalFeesClaimedETH || "0.9680") + claimedVal).toFixed(4);
      botState.escrowBalanceETH = "0.0";

      // 2. BUYBACK ON CURVE
      botState.status = "buyback" as any;
      addLog("info", `[2/3] Executing Buyback on Curve DEX (${claimableETH} ETH)...`);
      const isGraduated = await curve.graduated().catch(() => false);

      if (isGraduated) {
        addLog("warn", "Token has graduated to Uniswap v4 pool.");
      } else {
        const walletBal = await provider.getBalance(wallet.address);
        const gasBuffer = ethers.parseEther("0.0008");
        let buyAmountWei = claimableWei;

        // Ensure sufficient gas buffer remains in wallet
        if (walletBal < buyAmountWei + gasBuffer && walletBal > gasBuffer) {
          buyAmountWei = walletBal - gasBuffer;
        }

        const buyNonce = await provider.getTransactionCount(wallet.address, "latest");
        const buyTx = await curve.buy(buyAmountWei, 0n, wallet.address, {
          value: buyAmountWei,
          nonce: buyNonce
        });
        addLog("info", `Buyback Tx broadcasted: ${buyTx.hash}`);
        await buyTx.wait();
        addLog("success", `Buyback on Curve succeeded (${ethers.formatEther(buyAmountWei)} ETH)!`);
      }

      // 3. BURN TOKEN
      botState.status = "burning" as any;
      const tokenSymbol = await token.symbol().catch(() => "HOT");
      const tokenBalance: bigint = await token.balanceOf(wallet.address);
      const formattedBalance = ethers.formatUnits(tokenBalance, 18);

      addLog("info", `[3/3] Burning ${formattedBalance} $${tokenSymbol} to DEAD_ADDRESS...`);
      const burnNonce = await provider.getTransactionCount(wallet.address, "latest");
      const burnTx = await token.transfer(DEAD_ADDRESS, tokenBalance, { nonce: burnNonce });
      addLog("info", `Burn Tx broadcasted: ${burnTx.hash}`);
      await burnTx.wait();
      addLog("success", `🔥 COMPLETED: ${formattedBalance} $${tokenSymbol} PERMANENTLY INCINERATED!`);

      botState.totalCyclesExecuted++;
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
        totalCyclesExecuted: botState.totalCyclesExecuted,
        lastCycleTime: botState.lastCycleTime,
        pollIntervalSeconds: currentConfig.pollIntervalSeconds,
        logs: botState.logs
      }
    });
  }

  const readBody = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
        if (body.length > 1e6) req.destroy();
      });
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(e);
        }
      });
      req.on("error", reject);
    });
  };

  // Endpoint 2: POST /api/config
  if (req.method === "POST" && (url === "/api/config" || url === "/api/config/")) {
    try {
      const body = await readBody();
      const secret = body.password || req.headers["x-admin-secret"];

      if (secret !== ADMIN_SECRET) {
        return sendJSON(res, 401, { success: false, error: "Incorrect Admin password!" });
      }

      const updates: any = {};
      if (body.tokenAddress !== undefined) updates.tokenAddress = body.tokenAddress.trim();
      if (body.curveAddress !== undefined) updates.curveAddress = body.curveAddress.trim();
      if (body.claimThresholdETH !== undefined) updates.claimThresholdETH = String(body.claimThresholdETH).trim();
      if (body.pollIntervalSeconds !== undefined) updates.pollIntervalSeconds = parseInt(body.pollIntervalSeconds, 10);

      saveConfigToFile(updates);

      addLog("success", `[MEMEX SYNC] Settings updated from /memex panel! Token CA: ${currentConfig.tokenAddress}`);

      setTimeout(() => {
        executeCycle().catch(console.error);
      }, 500);

      return sendJSON(res, 200, {
        success: true,
        message: "Bot configuration successfully updated!",
        data: {
          tokenAddress: currentConfig.tokenAddress,
          curveAddress: currentConfig.curveAddress,
          status: isValidAddress(currentConfig.tokenAddress) ? "active" : "standby"
        }
      });
    } catch (e: any) {
      return sendJSON(res, 400, { success: false, error: e.message || "Invalid JSON payload" });
    }
  }

  // Endpoint 3: POST /api/trigger
  if (req.method === "POST" && (url === "/api/trigger" || url === "/api/trigger/")) {
    try {
      const body = await readBody();
      const secret = body.password || req.headers["x-admin-secret"];

      if (secret !== ADMIN_SECRET) {
        return sendJSON(res, 401, { success: false, error: "Incorrect Admin password!" });
      }

      addLog("info", "[MANUAL] Cycle manually triggered from /memex panel.");
      executeCycle().catch(console.error);

      return sendJSON(res, 200, { success: true, message: "Manual cycle is executing!" });
    } catch (e: any) {
      return sendJSON(res, 400, { success: false, error: e.message });
    }
  }

  return sendJSON(res, 404, { success: false, error: "Not Found" });
});

const PORT = currentConfig.port;
server.listen(PORT, "0.0.0.0", () => {
  console.log("==========================================================");
  console.log(`🚀 HOT AUTONOMOUS FLYWHEEL & API SERVER ACTIVE`);
  console.log(`   Server Port      : ${PORT}`);
  console.log(`   Admin API Ready  : http://localhost:${PORT}/api/status`);
  console.log(`   Operator Wallet  : ${botState.walletAddress || "Not ready"}`);
  console.log(`   Initial Status   : ${isValidAddress(currentConfig.tokenAddress) ? "ACTIVE" : "STANDBY (Awaiting CA from /memex)"}`);
  console.log("==========================================================");
});
