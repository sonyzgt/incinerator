# 🔥 JEVBURN — Autonomous Flywheel Engine (Pons Family v2)

An autonomous token liquidity, buyback, and burn engine deployed on **Robinhood Chain (Chain ID: 4663)** integrated with **Pons Family v2**.

---

## ⚡ Overview

JEVBURN operates on a perpetual closed-loop mechanism:
1. **Trade & Tax Inflow**: Trading activity on the Pons Curve generates creator fees in native ETH accumulating in the Fee Escrow (`0xd3AFEB...Ac9e`).
2. **Auto-Claim Fee**: When claimable fees reach the configured threshold (e.g. `0.015 ETH`), the engine executes `escrow.claim()`.
3. **Auto-Buyback DEX**: Claimed ETH is immediately swapped for tokens on the Pons Bonding Curve via `curve.buy()`.
4. **Permanent Dead Burn**: All acquired tokens are transferred directly to `0x000000000000000000000000000000000000dEaD`, permanently destroying circulating supply.

---

## 🌐 Official Contracts (Robinhood Chain ID: 4663)

| Contract | Address |
|---|---|
| **Token Contract (JEVBURN)** | `0xa6a44f24780b95d467d482de278a017fd6d7c2b3` |
| **Pons Factory** | `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` |
| **Fee Escrow Vault** | `0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e` |
| **Buyback Vault** | `0x42df2a798f82289E177311362e8f5ccC45c1219c` |
| **Dead Address Sink** | `0x000000000000000000000000000000000000dEaD` |
| **RPC Endpoint** | `https://rpc.mainnet.chain.robinhood.com` |

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the template and configure your parameters:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_TOKEN_NAME="JEVBURN"
VITE_TOKEN_SYMBOL="JEVBURN"
VITE_TOKEN_ADDRESS="0xa6a44f24780b95d467d482de278a017fd6d7c2b3"
VITE_CURVE_ADDRESS="0x..."
VITE_CREATOR_ADDRESS="0x..."
VITE_CLAIM_THRESHOLD_ETH="0.015"
VITE_RPC_URL="https://rpc.mainnet.chain.robinhood.com"

# Server Daemon Wallet Private Key (optional for on-chain bot):
CREATOR_PRIVATE_KEY=""
```

### 3. Run Development Web Server
```bash
npm run dev
```

### 4. Run Autonomous 24/7 Bot Daemon (Headless)
```bash
npm run bot
```

---

## 🔒 Security

- The frontend web application is strictly **read-only / public tracker**.
- The `CREATOR_PRIVATE_KEY` variable is never exposed to the client-side bundle.
- Tokens sent to `0x0...dEaD` are provably unrecoverable.

---

## 🐦 Socials & Documentation
- **Twitter / X**: [@jevburns](https://x.com/jevburns)
- **Pons v2 Documentation**: [docs.ponsfamily.com/v2](https://docs.ponsfamily.com/v2)
