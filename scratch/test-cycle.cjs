const { ethers } = require('ethers');
require('dotenv').config();

async function runTestCycle() {
  console.log("==========================================================");
  console.log("🔥 MEMULAI TEST SIKLUS ON-CHAIN FLYWHEEL");
  console.log("==========================================================");

  const provider = new ethers.JsonRpcProvider('https://rpc.mainnet.chain.robinhood.com');
  const pk = process.env.CREATOR_PRIVATE_KEY;
  if (!pk) {
    console.error("❌ CREATOR_PRIVATE_KEY tidak ditemukan!");
    return;
  }
  const wallet = new ethers.Wallet(pk, provider);
  console.log("Operator Wallet:", wallet.address);

  const ESCROW_ADDR = "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e";
  const CURVE_ADDR  = "0xCe9FaED939AE11A0d5912129eb5D7DD75d238D60";
  const TOKEN_ADDR  = process.env.TOKEN_ADDRESS || "";
  const DEAD_ADDR   = "0x000000000000000000000000000000000000dEaD";

  const escrow = new ethers.Contract(ESCROW_ADDR, [
    "function balanceOf(address) view returns (uint256)",
    "function claim()"
  ], wallet);

  const curve = new ethers.Contract(CURVE_ADDR, [
    "function buy(uint256, uint256, address) payable returns (uint256)",
    "function graduated() view returns (bool)"
  ], wallet);

  const token = new ethers.Contract(TOKEN_ADDR, [
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)"
  ], wallet);

  const tokenSymbol = await token.symbol().catch(() => "INCINERATOR");

  // CEK FEE DI ESCROW
  const claimableWei = await escrow.balanceOf(wallet.address);
  const claimableETH = ethers.formatEther(claimableWei);
  console.log(`\n💰 Fee di Escrow: ${claimableETH} ETH`);

  if (claimableWei === 0n) {
    console.log("⚠️ Tidak ada fee yang bisa diklaim saat ini (0 ETH).");
    return;
  }

  // TAHAP 1: CLAIM FEE
  console.log(`\n▶ [1/3] Mengklaim ${claimableETH} ETH dari Pons Escrow...`);
  const claimTx = await escrow.claim();
  console.log(`  Tx sent: ${claimTx.hash}`);
  const claimReceipt = await claimTx.wait();
  console.log(`  ✅ Berhasil diklaim di blok: ${claimReceipt.blockNumber}`);

  const balanceAfterClaim = await provider.getBalance(wallet.address);
  console.log(`  Saldo dompet saat ini: ${ethers.formatEther(balanceAfterClaim)} ETH`);

  // TAHAP 2: BUYBACK DI CURVE
  // Sisakan 0.001 ETH untuk buffer gas agar dompet tidak kosong
  const gasBuffer = ethers.parseEther("0.001");
  let buyAmountWei = claimableWei;
  if (balanceAfterClaim < buyAmountWei + gasBuffer && balanceAfterClaim > gasBuffer) {
    buyAmountWei = balanceAfterClaim - gasBuffer;
  }
  const buyAmountETH = ethers.formatEther(buyAmountWei);

  console.log(`\n▶ [2/3] Mengeksekusi Buyback di Curve DEX (${buyAmountETH} ETH)...`);
  const buyTx = await curve.buy(buyAmountWei, 0n, wallet.address, {
    value: buyAmountWei
  });
  console.log(`  Tx sent: ${buyTx.hash}`);
  const buyReceipt = await buyTx.wait();
  console.log(`  ✅ Buyback selesai di blok: ${buyReceipt.blockNumber}`);

  // TAHAP 3: CEK SALDO TOKEN & BURN KE DEAD SINK
  const tokenBal = await token.balanceOf(wallet.address);
  const formattedTokens = ethers.formatUnits(tokenBal, 18);
  console.log(`\n▶ [3/3] Token terbeli: ${formattedTokens} $${tokenSymbol}`);
  console.log(`  Membakar ke DEAD_ADDRESS (${DEAD_ADDR})...`);

  const burnTx = await token.transfer(DEAD_ADDR, tokenBal);
  console.log(`  Tx sent: ${burnTx.hash}`);
  const burnReceipt = await burnTx.wait();
  console.log(`  🔥 TOKEN TELAH MUSNAH DI BLOK: ${burnReceipt.blockNumber}`);

  const deadBal = await token.balanceOf(DEAD_ADDR);
  console.log(`\n==========================================================`);
  console.log(`🎉 SIKLUS ON-CHAIN SELESAI 100%!`);
  console.log(`   Claim Tx   : https://explorer.mainnet.chain.robinhood.com/tx/${claimTx.hash}`);
  console.log(`   Buyback Tx : https://explorer.mainnet.chain.robinhood.com/tx/${buyTx.hash}`);
  console.log(`   Burn Tx    : https://explorer.mainnet.chain.robinhood.com/tx/${burnTx.hash}`);
  console.log(`   Total $INCINERATOR di Dead Sink: ${ethers.formatUnits(deadBal, 18)}`);
  console.log(`==========================================================`);
}

runTestCycle().catch(console.error);
