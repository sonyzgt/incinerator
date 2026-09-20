import React, { useState, useEffect } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
  Save,
  RotateCcw,
  Play,
  Terminal,
  ArrowLeft,
  Flame,
  Check,
  Copy,
  AlertTriangle,
  Sliders,
  Radio,
  Sparkles,
  Server,
  Activity,
  RefreshCw
} from 'lucide-react';
import { MachineConfig, FlywheelState } from '../types';
import { PONS_V2_CONFIG } from '../contracts';
import { fetchTokenCurve } from '../utils/web3';

interface AdminPanelProps {
  config: MachineConfig;
  state: FlywheelState;
  onSaveConfig: (cfg: MachineConfig) => void;
  onResetDefaults: () => void;
  onTriggerCycle: () => void;
  onNavigateHome: () => void;
}

const ADMIN_SECRET = 'Sonyfree24@';

interface DaemonStatusData {
  online: boolean;
  status: 'standby' | 'active' | 'error';
  walletAddress: string;
  tokenAddress: string;
  curveAddress: string;
  claimThresholdETH: string;
  escrowBalanceETH: string;
  totalCyclesExecuted: number;
  lastCycleTime: string;
  pollIntervalSeconds: number;
  logs: Array<{
    timestamp: string;
    type: 'info' | 'success' | 'warn' | 'error';
    message: string;
  }>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  config,
  state,
  onSaveConfig,
  onResetDefaults,
  onTriggerCycle,
  onNavigateHome,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('hot_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Form State
  const [formData, setFormData] = useState<MachineConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedBot, setCopiedBot] = useState(false);

  // VPS Daemon State
  const [daemonStatus, setDaemonStatus] = useState<DaemonStatusData | null>(null);
  const [isTriggeringDaemon, setIsTriggeringDaemon] = useState(false);
  const [daemonMessage, setDaemonMessage] = useState<string | null>(null);

  // Fetch Daemon Status
  const fetchDaemonStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDaemonStatus(json.data);
        }
      } else {
        setDaemonStatus(null);
      }
    } catch (e) {
      setDaemonStatus(null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDaemonStatus();
    const interval = setInterval(fetchDaemonStatus, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Auto-detect Curve Address from Token CA
  useEffect(() => {
    const checkCurve = async () => {
      const addr = formData.tokenAddress.trim();
      if (addr.length === 42 && addr.startsWith('0x')) {
        const detected = await fetchTokenCurve(addr, formData.rpcUrl);
        if (detected && detected.toLowerCase() !== formData.curveAddress.toLowerCase()) {
          setFormData((prev) => ({ ...prev, curveAddress: detected }));
        }
      }
    };
    checkCurve();
  }, [formData.tokenAddress, formData.rpcUrl]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_SECRET) {
      sessionStorage.setItem('hot_admin_auth', 'true');
      sessionStorage.setItem('hot_admin_pw', passwordInput);
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('hot_admin_auth');
    sessionStorage.removeItem('hot_admin_pw');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Handle Save (Simpan ke Frontend + Sinkron ke Bot VPS via API)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    // 1. Simpan di state browser & localStorage
    onSaveConfig(formData);

    // 2. Kirim ke Server Bot VPS
    const adminPw = sessionStorage.getItem('hot_admin_pw') || ADMIN_SECRET;
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPw,
          tokenAddress: formData.tokenAddress,
          curveAddress: formData.curveAddress,
          claimThresholdETH: formData.claimThresholdETH,
          pollIntervalSeconds: formData.cycleIntervalSeconds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveMessage('✅ Settings saved successfully & synced to VPS Bot!');
        fetchDaemonStatus();
      } else {
        setSaveMessage(`Saved locally. VPS Bot: ${data.error || 'Sync failed'}`);
      }
    } catch (err) {
      setSaveMessage('Saved in local browser. (VPS Bot endpoint unreachable)');
    } finally {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    }
  };

  // Trigger On-Chain Cycle on VPS Bot
  const handleTriggerVPSCycle = async () => {
    setIsTriggeringDaemon(true);
    setDaemonMessage(null);
    const adminPw = sessionStorage.getItem('hot_admin_pw') || ADMIN_SECRET;
    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPw }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDaemonMessage('⚡ Flywheel Cycle triggered on VPS Bot!');
        setTimeout(fetchDaemonStatus, 1500);
      } else {
        setDaemonMessage(`Failed: ${data.error || 'Unknown'}`);
      }
    } catch (e: any) {
      setDaemonMessage('Failed to reach bot API server.');
    } finally {
      setIsTriggeringDaemon(false);
      setTimeout(() => setDaemonMessage(null), 4000);
    }
  };

  // Quick set CA to none
  const setCaToNone = () => {
    setFormData((prev) => ({ ...prev, tokenAddress: 'none' }));
  };

  // Copy bot script command
  const copyBotCommand = () => {
    const command = `pm2 start "npm run bot" --name "hot-bot"`;
    navigator.clipboard.writeText(command);
    setCopiedBot(true);
    setTimeout(() => setCopiedBot(false), 2000);
  };

  // -------------------------------------------------------------
  // 1. LOGIN SCREEN (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col justify-center items-center px-4 font-hand selection:bg-amber-400 selection:text-slate-950">
        <div className="w-full max-w-md bg-[#131924] sketch-box p-8 border-2 border-slate-700 shadow-2xl relative overflow-hidden">
          {/* Top subtle ribbon */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black -rotate-3 shadow-[3px_3px_0px_#000]">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div>
              <h1 className="text-2xl font-sketch font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span>HOT ADMIN PORTAL</span>
              </h1>
              <div className="inline-block mt-1 px-2.5 py-0.5 bg-rose-950/80 border border-rose-600/60 rounded text-[11px] font-mono text-rose-300">
                RESTRICTED ACCESS &bull; SECURE PORTAL
              </div>
            </div>

            <p className="font-hand text-sm text-slate-400">
              Enter admin password to access autonomous engine controls &amp; token configuration.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-sketch text-amber-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(false);
                  }}
                  placeholder="Enter administrator password..."
                  className={`w-full px-3.5 py-2.5 bg-[#090d13] border rounded-lg text-white font-mono text-sm focus:outline-none transition-colors pr-10 ${
                    authError
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-700 focus:border-amber-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <span className="text-xs text-rose-400 font-hand mt-1 block">
                  Password incorrect. Access denied.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-sketch font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Admin Controls</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Admin Top Navigation */}
      <header className="w-full bg-[#080B10] border-b border-cyan-500/20 px-4 sm:px-8 py-3 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2 bg-[#1b2331] hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white flex items-center gap-1.5 font-sketch text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Machine</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs font-mono">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-sketch font-black text-white flex items-center gap-2">
                  <span>HOT ENGINE CONTROL CENTER</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[10px] font-mono">
                    ADMIN MODE
                  </span>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#18202c] border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
              <span className="text-emerald-400">●</span>
              <span>Authenticated</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 rounded-lg text-xs font-sketch flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* VPS Bot Daemon Status Bar */}
        <div className="p-4 bg-[#141b26] sketch-box border-2 border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Server className={`w-5 h-5 ${daemonStatus?.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sketch text-sm text-white font-bold tracking-wide">
                  VPS Autonomous Bot Daemon:
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                    daemonStatus?.status === 'active'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : daemonStatus?.status === 'standby'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {daemonStatus ? daemonStatus.status : 'Connecting to VPS...'}
                </span>
              </div>

              <p className="font-hand text-xs text-slate-400">
                {daemonStatus?.status === 'active'
                  ? `Bot is actively monitoring Fee Escrow 24/7. Active Token Address: ${daemonStatus.tokenAddress}`
                  : daemonStatus?.status === 'standby'
                  ? 'Bot running in PM2, ready to execute flywheel as soon as Token CA is configured below!'
                  : 'Run `pm2 start "npm run bot" --name "hot-bot"` on VPS to activate.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={fetchDaemonStatus}
              className="px-3 py-1.5 bg-[#1b2331] hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-sketch text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>

            {daemonStatus && (
              <button
                onClick={handleTriggerVPSCycle}
                disabled={isTriggeringDaemon}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-black font-sketch font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{isTriggeringDaemon ? 'Triggering...' : 'Trigger VPS Cycle'}</span>
              </button>
            )}
          </div>
        </div>

        {daemonMessage && (
          <div className="p-3 bg-amber-950/80 border border-amber-600 rounded-lg text-amber-300 font-sketch text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{daemonMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Configuration Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#141b26] sketch-box p-6 border-2 border-slate-700 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <h2 className="font-sketch text-lg text-white font-bold">
                    Token &amp; Flywheel Parameters
                  </h2>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Chain: Robinhood (4663)
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4 font-hand text-base">
                {/* Token Symbol & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sketch text-amber-300 mb-1">
                      Token Symbol ($)
                    </label>
                    <input
                      type="text"
                      value={formData.tokenSymbol}
                      onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                      placeholder="HOT"
                      className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sketch text-amber-300 mb-1">
                      Token Name
                    </label>
                    <input
                      type="text"
                      value={formData.tokenName}
                      onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                      placeholder="HOT"
                      className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Token Contract Address (CA) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-sketch text-amber-300">
                      Token Contract Address (CA)
                    </label>
                    <button
                      type="button"
                      onClick={setCaToNone}
                      className="text-xs font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Set to "none"
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.tokenAddress}
                    onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                    placeholder="none or 0x..."
                    className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 block mt-1">
                    Enter Token CA from Pons. Once you click <b className="text-amber-300">Save</b>, the VPS Bot will immediately begin autonomous flywheel processing!
                  </span>
                </div>

                {/* Pons Curve Address */}
                <div>
                  <label className="block text-xs font-sketch text-amber-300 mb-1">
                    Pons Bonding Curve Address
                  </label>
                  <input
                    type="text"
                    value={formData.curveAddress}
                    onChange={(e) => setFormData({ ...formData, curveAddress: e.target.value })}
                    placeholder="0xa92fDeb8a2387D9Ef8e3b87d5EF68a0BC4D0fcDa"
                    className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 block mt-1">
                    Curve DEX where market buyback is executed via <code className="text-emerald-400">curve.buy()</code>.
                  </span>
                </div>

                {/* Creator / Fee Recipient Address */}
                <div>
                  <label className="block text-xs font-sketch text-amber-300 mb-1">
                    Creator / Fee Recipient Address (Escrow Beneficiary)
                  </label>
                  <input
                    type="text"
                    value={formData.creatorAddress}
                    onChange={(e) => setFormData({ ...formData, creatorAddress: e.target.value })}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Claim Threshold & Interval */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sketch text-amber-300 mb-1">
                      Claim Fee Threshold (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.0001"
                      value={formData.claimThresholdETH}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          claimThresholdETH: parseFloat(e.target.value) || 0.01,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Cycle triggers when accumulated fee reaches &ge; this threshold.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-sketch text-amber-300 mb-1">
                      Polling Interval (Seconds)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="60"
                      value={formData.cycleIntervalSeconds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cycleIntervalSeconds: parseInt(e.target.value, 10) || 10,
                        })
                      }
                      className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Frequency of bot checking Escrow balance on-chain.
                    </span>
                  </div>
                </div>

                {/* RPC URL */}
                <div>
                  <label className="block text-xs font-sketch text-amber-300 mb-1">
                    Robinhood Chain RPC URL
                  </label>
                  <input
                    type="text"
                    value={formData.rpcUrl}
                    onChange={(e) => setFormData({ ...formData, rpcUrl: e.target.value })}
                    placeholder="https://rpc.mainnet.chain.robinhood.com"
                    className="w-full px-3 py-2 bg-[#0a0f16] border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Submit & Reset Buttons */}
                <div className="pt-4 border-t-2 border-dashed border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onResetDefaults();
                      setFormData({ ...config });
                    }}
                    className="px-4 py-2 bg-[#17202c] hover:bg-slate-800 text-slate-300 font-sketch text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-sketch font-bold rounded-lg flex items-center gap-2 transition-all shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving & Syncing...' : 'Save & Sync to Bot'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Engine Operations & Bot Integration (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Engine Control Box */}
            <div className="bg-[#141b26] sketch-box p-5 border-2 border-slate-700 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-sketch text-base border-b border-dashed border-slate-700 pb-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Real-time On-Chain Stats</span>
              </div>

              <div className="space-y-3 font-hand text-sm">
                <div className="p-3 bg-[#0c1017] rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Accumulated Escrow:</span>
                  <span className="font-mono text-xs text-amber-300 font-bold">
                    {daemonStatus ? `${daemonStatus.escrowBalanceETH} ETH` : `${state.currentEscrowBalanceETH.toFixed(4)} ETH`}
                  </span>
                </div>

                <div className="p-3 bg-[#0c1017] rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Total Cycles Completed:</span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {daemonStatus ? daemonStatus.totalCyclesExecuted : state.cycleCount}
                  </span>
                </div>

                <div className="p-3 bg-[#0c1017] rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Last Checked:</span>
                  <span className="font-mono text-xs text-slate-300">
                    {daemonStatus?.lastCycleTime || 'Pending'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onTriggerCycle}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sketch text-xs rounded-lg transition-all border border-slate-600 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Browser Animation</span>
                </button>
              </div>
            </div>

            {/* Live VPS Bot Daemon Console */}
            <div className="bg-[#141b26] sketch-box p-5 border-2 border-slate-700 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-dashed border-slate-700 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-sketch text-sm">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Live VPS Bot Console</span>
                </div>
                <button
                  onClick={copyBotCommand}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                >
                  {copiedBot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBot ? 'Copied' : 'PM2 CMD'}</span>
                </button>
              </div>

              {daemonStatus && daemonStatus.logs && daemonStatus.logs.length > 0 ? (
                <div className="p-2.5 bg-[#080c12] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto space-y-1">
                  {daemonStatus.logs.slice(0, 8).map((log, idx) => (
                    <div key={idx} className="leading-tight">
                      <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                      <span className={
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'error' ? 'text-rose-400' :
                        log.type === 'warn' ? 'text-amber-400' : 'text-cyan-400'
                      }>
                        [{log.type.toUpperCase()}]
                      </span>{' '}
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#090d13] rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div>Status: <span className="text-amber-400">Run in PM2 on VPS</span></div>
                  <div className="text-slate-500 text-[10px]">Command: pm2 start "npm run bot" --name "hot-bot"</div>
                </div>
              )}

              <div className="text-[11px] text-slate-400 font-hand flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Saving Token CA in the form automatically updates the VPS bot in real time!</span>
              </div>
            </div>

            {/* Fixed Pons Protocol Addresses */}
            <div className="p-4 bg-[#0e131b] rounded-xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1.5">
              <div className="text-slate-300 font-sketch text-xs">Pons Protocol Contracts:</div>
              <div>Factory: <span className="text-slate-500">{PONS_V2_CONFIG.contracts.factory.substring(0, 14)}...</span></div>
              <div>Escrow: <span className="text-slate-500">{PONS_V2_CONFIG.contracts.feeEscrow.substring(0, 14)}...</span></div>
              <div>Dead Sink: <span className="text-rose-400">{PONS_V2_CONFIG.contracts.deadAddress.substring(0, 14)}...</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
