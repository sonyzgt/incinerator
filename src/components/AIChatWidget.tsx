import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Flame,
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  '🔥 Berapa total token yang sudah dibakar?',
  '📋 Berapa alamat Smart Contract (CA)?',
  '⚡ Bagaimana cara kerja mesin buyback?',
  '🐦 Apa akun Twitter / X resmi JEVBURN?',
];

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! Saya adalah **JEVBURN AI Assistant** (powered by Venice.ai).\n\nAda yang bisa saya bantu terkait tokenomics, mekanisme buyback kurva, atau data pembakaran live di Robinhood Chain?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Local fallback response if backend /api/chat is not reachable
  const getLocalFallbackReply = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('ca') || lower.includes('contract') || lower.includes('address') || lower.includes('alamat')) {
      return `Alamat Smart Contract (CA) resmi **$JEVBURN**:\n\`0xa6a44f24780b95d467d482de278a017fd6d7c2b3\`\n\nJaringan: **Robinhood Chain (Chain ID: 4663)**\nDead Sink: \`0x000000000000000000000000000000000000dEaD\``;
    }
    if (lower.includes('burn') || lower.includes('bakar') || lower.includes('supply') || lower.includes('persen') || lower.includes('berapa')) {
      return `🔥 **Status Pembakaran Terkini:**\nLebih dari **152.000.000+ JEVBURN** (setara **15.2% dari total supply 1 Miliar**) telah hangus dibakar habis secara permanen ke alamat Dead Sink!\n\nLihat bukti transaksi blok explorer secara realtime di [jevburn.com/burn](https://jevburn.com/burn).`;
    }
    if (lower.includes('cara') || lower.includes('kerja') || lower.includes('mekanisme') || lower.includes('what is') || lower.includes('how')) {
      return `⚡ **Mekanisme Autonomous JEVBURN:**\n1. **Fee Escrow**: Volume trading di Pons Curve menghasilkan biaya yang ditampung di FeeEscrow.\n2. **Auto-Claim**: Saat threshold tercapai, bot menarik ETH fee tersebut.\n3. **DEX Buyback**: ETH langsung ditukar untuk membeli $JEVBURN di Curve DEX.\n4. **Dead Incineration**: 100% token yang dibeli langsung dibakar permanen ke \`0x000...dEaD\`.\n\nSemua berjalan 24/7 tanpa campur tangan manusia!`;
    }
    if (lower.includes('twitter') || lower.includes('x') || lower.includes('sosmed')) {
      return `Akun resmi kami di Twitter / X adalah **[@jevburns](https://x.com/jevburns)**. Pantau terus update pembakaran terbaru di sana!`;
    }
    return `Saya adalah **JEVBURN AI Assistant**. Anda bisa bertanya tentang token CA, total supply yang dibakar (15.2%+), mekanisme otonom DEX buyback, atau jaringan Robinhood Chain. Ada yang ingin Anda ketahui?`;
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.reply) {
          const aiMsg: ChatMessage = {
            id: `${Date.now()}-a`,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsLoading(false);
          return;
        }
      }
      throw new Error('API chat unreachable');
    } catch (err) {
      // Graceful instant fallback
      const reply = getLocalFallbackReply(text);
      const aiMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-satoshi selection:bg-[#ff5722] selection:text-[#090a0d]">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#ff5722] to-[#ff7a00] hover:brightness-110 text-white font-bold text-xs shadow-[0_0_25px_rgba(255,87,34,0.45)] hover:shadow-[0_0_35px_rgba(255,87,34,0.65)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <Bot className="w-4 h-4 text-white" />
          <span className="tracking-wide">Ask JEVBURN AI</span>
        </button>
      )}

      {/* Expanded Cyber Chat Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[540px] max-h-[85vh] rounded-2xl bg-[#0b0c10] border border-[#24252a] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-[#24252a] bg-[#101217] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#ff5722]/10 border border-[#ff5722]/30 flex items-center justify-center text-[#ff5722]">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white tracking-tight">JEVBURN AI</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ONLINE
                  </span>
                </div>
                <div className="text-[10px] text-[#8e8b85] font-mono">
                  Powered by Venice.ai
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#8e8b85] hover:text-white hover:bg-[#1a1c24] transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-md bg-[#ff5722]/15 border border-[#ff5722]/30 flex items-center justify-center text-[#ff5722] shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? 'bg-[#ff5722] text-white font-medium shadow-[0_2px_10px_rgba(255,87,34,0.3)]'
                        : 'bg-[#14151b] border border-[#24252a] text-[#e3e1dc]'
                    }`}
                  >
                    {msg.content}

                    {/* CA Quick-copy helper if message mentions CA */}
                    {msg.content.includes('0xa6a44f24780b95d467d482de278a017fd6d7c2b3') && (
                      <button
                        onClick={() => handleCopy('0xa6a44f24780b95d467d482de278a017fd6d7c2b3')}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#0b0c10] border border-[#ff5722]/40 text-[#ff5722] text-[10px] font-mono cursor-pointer hover:bg-[#ff5722]/10 transition-colors"
                      >
                        {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedText ? 'Copied CA!' : 'Copy CA'}</span>
                      </button>
                    )}

                    <div
                      className={`text-[9px] font-mono mt-1 ${
                        isUser ? 'text-white/70 text-right' : 'text-[#6a6770]'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-md bg-[#ff5722]/15 border border-[#ff5722]/30 flex items-center justify-center text-[#ff5722] shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-[#14151b] border border-[#24252a] rounded-xl px-3.5 py-2 text-xs text-[#a6a39d] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] ml-1 font-mono">Venice AI thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-t border-[#24252a] bg-[#0e0f14] overflow-x-auto flex gap-1.5 scrollbar-none">
            {PRESET_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt.replace(/^[^\w]+/, ''))}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-[#171821] hover:bg-[#20222e] border border-[#272833] text-[#a6a39d] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-[#24252a] bg-[#101217] flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya JEVBURN AI..."
              disabled={isLoading}
              className="flex-1 bg-[#0b0c10] border border-[#24252a] focus:border-[#ff5722] rounded-xl px-3 py-2 text-xs text-white placeholder-[#58555e] focus:outline-none transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-xl bg-[#ff5722] hover:bg-[#ff6f3d] disabled:opacity-40 disabled:hover:bg-[#ff5722] text-white transition-colors cursor-pointer"
              title="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
