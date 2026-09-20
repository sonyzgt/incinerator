import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';
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
      role: 'HOT Token Contract (CA)',
      address: PONS_V2_CONFIG.contracts.token,
      key: 'token',
      highlight: true,
      desc: 'Official deployed HOT token contract on Robinhood Chain.'
    },
    {
      role: 'Pons Bonding Curve DEX',
      address: PONS_V2_CONFIG.contracts.curve,
      key: 'curve',
      highlight: true,
      desc: 'DEX Bonding Curve where all autonomous buybacks are routed.'
    },
    {
      role: 'Fee Escrow (Claim Vault)',
      address: PONS_V2_CONFIG.contracts.feeEscrow,
      key: 'escrow',
      highlight: true,
      desc: 'Pons v2 creator fee escrow vault where volume fees accumulate.'
    },
    {
      role: 'Dead Burn Sink Address',
      address: PONS_V2_CONFIG.contracts.deadAddress,
      key: 'dead',
      highlight: true,
      desc: 'Permanent dead address receiving bought tokens to extinguish supply forever.'
    },
    {
      role: 'Launch Factory',
      address: PONS_V2_CONFIG.contracts.factory,
      key: 'factory',
      desc: 'Canonical launch factory on Robinhood Chain deploying tokens & curves.'
    },
    {
      role: 'Buyback Vault',
      address: PONS_V2_CONFIG.contracts.buybackVault,
      key: 'buyback',
      desc: 'Protocol vault releasing vested buyback tokens linearly over 5 years.'
    }
  ];

  return (
    <div className="rounded-2xl bg-[#0c1017] border border-zinc-800/80 p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/70">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Official Pons v2 Protocol Architecture
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified
              </span>
            </h4>
            <p className="text-xs text-zinc-400">
              Directly queried and audited from docs.ponsfamily.com/v2
            </p>
          </div>
        </div>

        <div>
          <a
            href="https://explorer.mainnet.chain.robinhood.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <span>Block Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
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
                ? 'bg-[#0e121a] border-zinc-800 hover:border-zinc-700 shadow-sm'
                : 'bg-[#090c12]/60 border-zinc-800/40 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-white truncate mr-2">
                {item.role}
              </span>
              <button
                onClick={() => copyToClipboard(item.address, item.key)}
                className="p-1 rounded bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy Address"
              >
                {copiedKey === item.key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed mb-2.5 line-clamp-2">
              {item.desc}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] font-mono">
              <span className="text-zinc-500">Address:</span>
              <span className="text-orange-300 font-medium">
                {item.address.substring(0, 8)}...{item.address.substring(item.address.length - 6)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
