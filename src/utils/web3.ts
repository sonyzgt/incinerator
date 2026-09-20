import { ethers } from 'ethers';
import { PONS_V2_CONFIG } from '../contracts';

export const ROBINHOOD_CHAIN_PARAMS = {
  chainId: '0x1237', // 4663 in hex
  chainName: 'Robinhood Chain',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'],
  blockExplorerUrls: ['https://explorer.mainnet.chain.robinhood.com'],
};

export const ESCROW_ABI = [
  'function balanceOf(address recipient) view returns (uint256)',
  'function balanceOfToken(address recipient, address token) view returns (uint256)',
  'function claim() returns ()',
  'function claimToken(address token) returns ()'
];

export const CURVE_ABI = [
  'function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256)',
  'function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)',
  'function sellableTokens() view returns (uint256)',
  'function feeBps() view returns (uint256)',
  'function creatorTaxBps() view returns (uint256)',
  'function graduated() view returns (bool)'
];

export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function curve() view returns (address)'
];

export async function connectWallet(): Promise<{ address: string; signer: ethers.Signer } | null> {
  const ethereum = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
  if (!ethereum) {
    alert('Please install MetaMask, Rabby, or a Web3 wallet browser extension to connect.');
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    if (!accounts || accounts.length === 0) return null;

    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: ROBINHOOD_CHAIN_PARAMS.chainId }]);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await provider.send('wallet_addEthereumChain', [ROBINHOOD_CHAIN_PARAMS]);
      }
    }

    const signer = await provider.getSigner();
    return {
      address: await signer.getAddress(),
      signer
    };
  } catch (err: any) {
    console.error('Wallet connection error:', err);
    return null;
  }
}

export async function fetchTokenCurve(
  tokenAddress: string,
  rpcUrl = 'https://rpc.mainnet.chain.robinhood.com'
): Promise<string | null> {
  try {
    if (!tokenAddress || tokenAddress.toLowerCase() === 'none' || !ethers.isAddress(tokenAddress)) {
      return null;
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(tokenAddress, ['function curve() view returns (address)'], provider);
    const curveAddr = await contract.curve();
    if (curveAddr && ethers.isAddress(curveAddr) && curveAddr !== ethers.ZeroAddress) {
      return curveAddr;
    }
  } catch (e) {}
  return null;
}

export async function fetchOnChainEscrowBalance(
  address: string,
  rpcUrl = 'https://rpc.mainnet.chain.robinhood.com'
): Promise<number> {
  try {
    if (!address || !ethers.isAddress(address)) return 0;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(PONS_V2_CONFIG.contracts.feeEscrow, ESCROW_ABI, provider);
    const balance = await contract.balanceOf(address);
    return parseFloat(ethers.formatEther(balance));
  } catch {
    return 0;
  }
}

export interface OnChainMetrics {
  escrowBalanceETH: number;
  totalFeesClaimedETH: number;
  totalFeesEarnedETH: number;
  tokensBurned: number;
  totalSupply: number;
  burnedPercentage: number;
  tokenPriceETH: number;
  tokenPriceUSD: number;
  marketCapUSD: number;
  curveReservesQuoteETH: number;
  curveReservesTokens: number;
  curveAddress: string;
}

export async function fetchFullOnChainMetrics(
  tokenAddress: string,
  curveAddress: string,
  creatorAddress: string,
  rpcUrl = 'https://rpc.mainnet.chain.robinhood.com',
  ethPriceUSD = 2500
): Promise<OnChainMetrics | null> {
  try {
    if (!tokenAddress || tokenAddress.toLowerCase() === 'none' || !ethers.isAddress(tokenAddress)) {
      return null;
    }
    const activeRpc = (rpcUrl && rpcUrl.includes('chain.robinhood.com')) ? rpcUrl : 'https://rpc.mainnet.chain.robinhood.com';
    const provider = new ethers.JsonRpcProvider(activeRpc);

    // 1. Escrow Balance
    let escrowBalanceETH = 0;
    if (creatorAddress && ethers.isAddress(creatorAddress)) {
      try {
        const escrow = new ethers.Contract(PONS_V2_CONFIG.contracts.feeEscrow, ESCROW_ABI, provider);
        const balWei = await escrow.balanceOf(creatorAddress);
        escrowBalanceETH = parseFloat(ethers.formatEther(balWei));
      } catch (e) {}
    }

    // 2. Token contract & Dead balance
    const tokenContract = new ethers.Contract(tokenAddress, [
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function curve() view returns (address)'
    ], provider);

    let resolvedCurve = curveAddress;
    let totalSupply = 1_000_000_000;
    let tokensBurned = 0;

    try {
      const [ts, deadBal, crv] = await Promise.all([
        tokenContract.totalSupply().catch(() => 1000000000000000000000000000n),
        tokenContract.balanceOf(PONS_V2_CONFIG.contracts.deadAddress).catch(() => 0n),
        tokenContract.curve().catch(() => null)
      ]);
      totalSupply = parseFloat(ethers.formatUnits(ts, 18));
      tokensBurned = parseFloat(ethers.formatUnits(deadBal, 18));
      if (crv && ethers.isAddress(crv) && crv !== ethers.ZeroAddress) {
        resolvedCurve = crv;
      }
    } catch (e) {}

    // 3. Curve reserves & price
    let curveReservesQuoteETH = 0;
    let curveReservesTokens = 0;
    let tokenPriceETH = 0;

    if (resolvedCurve && ethers.isAddress(resolvedCurve) && resolvedCurve !== ethers.ZeroAddress) {
      try {
        const curveContract = new ethers.Contract(resolvedCurve, CURVE_ABI, provider);
        const reserves = await curveContract.getReserves();
        curveReservesQuoteETH = parseFloat(ethers.formatEther(reserves[0]));
        curveReservesTokens = parseFloat(ethers.formatUnits(reserves[1], 18));
        if (curveReservesTokens > 0 && curveReservesQuoteETH > 0) {
          tokenPriceETH = curveReservesQuoteETH / curveReservesTokens;
        }
      } catch (e) {}
    }

    // 4. Query total creator fees swept/earned from FeeEscrow on-chain
    let totalFeesEarnedETH = 0;
    let totalFeesClaimedETH = 0;
    if (creatorAddress && ethers.isAddress(creatorAddress) && resolvedCurve && ethers.isAddress(resolvedCurve)) {
      try {
        const latest = await provider.getBlockNumber();
        const logs = await provider.getLogs({
          address: PONS_V2_CONFIG.contracts.feeEscrow,
          topics: [
            '0x4e45da441832cf53bdaa69235704fc0575e68210f459ee1562911024b12967d5',
            ethers.zeroPadValue(creatorAddress, 32),
            ethers.zeroPadValue(resolvedCurve, 32)
          ],
          fromBlock: Math.max(0, latest - 600000),
          toBlock: latest
        });
        if (logs && logs.length > 0) {
          let sumWei = 0n;
          for (const l of logs) {
            sumWei += BigInt(l.data);
          }
          totalFeesEarnedETH = parseFloat(ethers.formatEther(sumWei));
          totalFeesClaimedETH = Math.max(0, totalFeesEarnedETH - escrowBalanceETH);
        }
      } catch (e) {
        // Fallback to recent known amount if RPC getLogs limit occurs
      }
    }

    const tokenPriceUSD = tokenPriceETH * ethPriceUSD;
    const marketCapUSD = tokenPriceUSD * totalSupply;
    const burnedPercentage = totalSupply > 0 ? (tokensBurned / totalSupply) * 100 : 0;

    return {
      escrowBalanceETH,
      totalFeesClaimedETH: totalFeesClaimedETH || totalFeesEarnedETH,
      totalFeesEarnedETH,
      tokensBurned,
      totalSupply,
      burnedPercentage,
      tokenPriceETH,
      tokenPriceUSD,
      marketCapUSD,
      curveReservesQuoteETH,
      curveReservesTokens,
      curveAddress: resolvedCurve
    };
  } catch (err) {
    return null;
  }
}

export async function executeRealClaim(signer: ethers.Signer): Promise<string> {
  const contract = new ethers.Contract(PONS_V2_CONFIG.contracts.feeEscrow, ESCROW_ABI, signer);
  const tx = await contract.claim();
  return tx.hash;
}

export async function executeRealBuyback(
  signer: ethers.Signer,
  curveAddress: string,
  ethAmount: number,
  recipientAddress: string
): Promise<string> {
  const contract = new ethers.Contract(curveAddress, CURVE_ABI, signer);
  const val = ethers.parseEther(ethAmount.toString());
  const tx = await contract.buy(val, 0n, recipientAddress, { value: val });
  return tx.hash;
}

export async function executeRealBurn(
  signer: ethers.Signer,
  tokenAddress: string,
  amount: bigint
): Promise<string> {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const tx = await contract.transfer(PONS_V2_CONFIG.contracts.deadAddress, amount);
  return tx.hash;
}
