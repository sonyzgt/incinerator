import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink, Terminal, Cpu } from 'lucide-react';
import { PONS_V2_CONFIG } from '../contracts';

export const PonsContractsCard: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const contracts = [
    {
      role: 'TOKEN CONTRACT [CA]',
      address: PONS_V2_CONFIG.contracts.token,
      key: 'token',
      highlight: true,
      desc: 'Canonical token ERC-20 contract deployed on Robinhood Chain.'
    },
    {
      role: 'BONDING CURVE DEX',
      address: PONS_V2_CONFIG.contracts.curve,
      key: 'curve',
      highlight: true,
      desc: 'Pons automated market maker curve executing programmatic buybacks.'
    },
    {
      role: 'FEE ESCROW VAULT',
      address: PONS_V2_CONFIG.contracts.feeEscrow,
      key: 'escrow',
      highlight: true,
      desc: 'On-chain fee accumulation vault liquidated via claim().'
    },
    {
      role: 'DEAD BURN SINK',
      address: PONS_V2_CONFIG.contracts.deadAddress,
      key: 'dead',
      highlight: true,
      desc: 'Irreversible incinerator address permanently extinguishing circulating tokens.'
    },
    {
      role: 'FACTORY DEPLOYER',
      address: PONS_V2_CONFIG.contracts.factory,
      key: 'factory',
      desc: 'Canonical launch factory deploying liquidity pools and curves.'
    },
    {
      role: 'BUYBACK VAULT',
      address: PONS_V2_CONFIG.contracts.buybackVault,
      key: 'buyback',
      desc: 'Linear 5-year protocol buyback distribution contract.'
    }
  ];

  return (
    <div className="w-full rounded-2xl bg-[#080B10] border border-cyan-500/25 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-400 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#0A0E15] border border-cyan-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-orbitron text-sm sm:text-base font-bold text-white tracking-wider flex items-center gap-2">
              CANONICAL SMART CONTRACT REGISTRY
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold">
                AUDITED &bull; VERIFIED
              </span>
            </h4>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Source: docs.ponsfamily.com/v2 // Robinhood Chain (ID: 4663)
            </p>
          </div>
        </div>

        <div>
          <a
            href="https://explorer.mainnet.chain.robinhood.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-cyan-200 px-3 py-1.5 rounded bg-[#0A0E15] border border-cyan-500/30 hover:border-cyan-400/50 transition-colors shadow-sm"
          >
            <span>RH EXPLORER</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Contracts Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {contracts.map((item) => (
          <div
            key={item.key}
            className={`p-3.5 rounded-xl border transition-all ${
              item.highlight
                ? 'bg-[#080C14] border-zinc-800 hover:border-cyan-500/40 shadow-sm'
                : 'bg-[#06080D] border-zinc-800/60 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-oxanium font-bold tracking-wider text-white truncate mr-2">
                {item.role}
              </span>
              <button
                onClick={() => copyToClipboard(item.address, item.key)}
                className="p-1 rounded bg-[#0A0E15] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 border border-zinc-800"
                title="Copy Address"
              >
                {copiedKey === item.key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-3 line-clamp-2 font-sans">
              {item.desc}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] font-mono">
              <span className="text-zinc-500">HEX:</span>
              <a
                href={`https://explorer.mainnet.chain.robinhood.com/address/${item.address}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{item.address.substring(0, 8)}...{item.address.substring(item.address.length - 6)}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
