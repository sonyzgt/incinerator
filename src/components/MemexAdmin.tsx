import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Key,
  Coins,
  Eye,
  EyeOff,
  Save,
  Check,
  ArrowLeft,
  ShieldAlert,
  Wallet,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface MemexAdminProps {
  onBack?: () => void;
}

export function MemexAdmin({ onBack }: MemexAdminProps) {
  const [privateKey, setPrivateKey] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
  const [derivedWallet, setDerivedWallet] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Load existing values on mount from localStorage or API
  useEffect(() => {
    const loadSavedConfig = async () => {
      let loadedKey = '';
      let loadedToken = '';

      // 1. Coba ambil dari localStorage
      try {
        const storedKey = localStorage.getItem('memex_private_key');
        const storedToken = localStorage.getItem('memex_token_address');
        if (storedKey) loadedKey = storedKey;
        if (storedToken) loadedToken = storedToken;
      } catch (e) {
        // ignore
      }

      // 2. Coba fetch dari server jika ada
      try {
        const res = await fetch('/api/admin/config');
        if (res.ok) {
          const json = await res.json();
          if (json.tokenAddress && !loadedToken) loadedToken = json.tokenAddress;
          if (json.privateKey && !loadedKey) loadedKey = json.privateKey;
        }
      } catch (e) {
        // server mungkin belum aktif
      }

      if (loadedKey) setPrivateKey(loadedKey);
      if (loadedToken) setTokenAddress(loadedToken);
    };

    loadSavedConfig();
  }, []);

  // Validasi dan hitung derived wallet dari private key secara real-time
  useEffect(() => {
    const trimmed = privateKey.trim();
    if (!trimmed) {
      setDerivedWallet(null);
      return;
    }

    try {
      const formatted = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
      if (formatted.length === 66) {
        const wallet = new ethers.Wallet(formatted);
        setDerivedWallet(wallet.address);
      } else {
        setDerivedWallet(null);
      }
    } catch {
      setDerivedWallet(null);
    }
  }, [privateKey]);

  // Validasi token address
  useEffect(() => {
    const trimmed = tokenAddress.trim().toLowerCase();
    const valid = trimmed.startsWith('0x') && trimmed.length === 42 && ethers.isAddress(trimmed);
    setIsTokenValid(valid);
  }, [tokenAddress]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSaving(true);
    setSaveStatus('idle');
    setStatusMessage('');

    const cleanToken = tokenAddress.trim();
    const cleanKey = privateKey.trim();

    try {
      const cleanCreator = derivedWallet || '';

      // 1. Simpan ke localStorage
      localStorage.setItem('memex_token_address', cleanToken);
      localStorage.setItem('memex_private_key', cleanKey);
      if (cleanCreator) {
        localStorage.setItem('memex_creator_address', cleanCreator);
      }

      // 2. Trigger real-time sync event untuk frontend engine
      window.dispatchEvent(new Event('memex_config_updated'));

      // 3. Kirim ke API internal Vite / backend agar tersimpan ke .env dan bot-config.json
      let savedToBackend = false;
      try {
        const res = await fetch('/api/admin/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenAddress: cleanToken,
            privateKey: cleanKey,
            creatorAddress: cleanCreator
          })
        });
        if (res.ok) {
          savedToBackend = true;
        }
      } catch {
        // fallback
      }

      // 4. Jika bot berjalan di port 5010, sync juga langsung ke bot API
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenAddress: cleanToken,
            privateKey: cleanKey,
            creatorAddress: cleanCreator
          })
        });
      } catch {
        // bot mungkin sedang offline
      }

      setSaveStatus('success');
      setStatusMessage(
        savedToBackend
          ? 'Konfigurasi berhasil disimpan ke sistem dan file environment.'
          : 'Konfigurasi berhasil disimpan di browser lokal.'
      );

      setTimeout(() => {
        setSaveStatus('idle');
      }, 4000);
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(`Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const navigateToDashboard = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-[#f5f3ef] font-satoshi flex flex-col selection:bg-white selection:text-[#090a0d]">
      {/* Header */}
      <header className="h-16 px-4 sm:px-8 md:px-12 flex items-center justify-between border-b border-zinc-800/80 bg-[#090a0d]/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={navigateToDashboard}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-6 h-6 rounded-md object-contain border border-white/20"
            />
            <span className="font-bold tracking-tight text-white text-sm sm:text-base">
              INCINERATOR
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LiquidMetalButton
            label="Dashboard"
            size="sm"
            viewMode="text"
            onClick={navigateToDashboard}
          />
        </div>
      </header>

      {/* Main Admin Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-xl w-full">
          {/* Card Container */}
          <div className="bg-[#111318] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Ambient Silver Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

            {/* Header Content */}
            <div className="mb-6 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/60 text-xs font-mono text-zinc-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-white" />
                Endpoint /memex
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
                Admin Panel
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
                Konfigurasi kredensial operator dan target token address untuk siklus eksekusi engine.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 relative z-10">
              {/* Field 1: Private Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <Key className="w-4 h-4 text-white" />
                    Private Key
                  </label>
                  {derivedWallet && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Valid Key
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPrivateKey ? 'text' : 'password'}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Masukkan private key operator (0x...)"
                    className="w-full bg-[#0a0b0e] border border-zinc-700/70 focus:border-white focus:ring-1 focus:ring-white rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-600 outline-none transition-all pr-11"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                    title={showPrivateKey ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPrivateKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Derived Wallet Address Display */}
                {derivedWallet ? (
                  <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-2.5 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="text-[11px] font-mono text-zinc-300 truncate">
                      <span className="text-zinc-400">Address: </span>
                      <span className="text-emerald-400 font-semibold">{derivedWallet}</span>
                    </div>
                  </div>
                ) : privateKey.trim().length > 0 ? (
                  <p className="text-[11px] text-amber-400/90 font-mono">
                    Format private key belum valid (harus 64 hex characters).
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Private key disimpan aman untuk transaksi on-chain otomatis.
                  </p>
                )}
              </div>

              {/* Field 2: Token Address */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-white" />
                    Token Address
                  </label>
                  {isTokenValid && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Valid Address
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="0x... (Alamat kontrak token)"
                    className="w-full bg-[#0a0b0e] border border-zinc-700/70 focus:border-white focus:ring-1 focus:ring-white rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-600 outline-none transition-all"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                {tokenAddress.trim().length > 0 && !isTokenValid ? (
                  <p className="text-[11px] text-amber-400/90 font-mono">
                    Harus alamat EVM valid 42 karakter (dimulai 0x).
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Token kontrak yang akan dipantau dan di-burn oleh engine.
                  </p>
                )}
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
                    saveStatus === 'success'
                      ? 'bg-emerald-950/30 border-emerald-700/40 text-emerald-300'
                      : 'bg-red-950/30 border-red-700/40 text-red-300'
                  }`}
                >
                  {saveStatus === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  )}
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_25px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-black" />
                      Simpan Konfigurasi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
export default MemexAdmin;
