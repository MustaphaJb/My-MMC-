import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, User, MessageCircle, Shield } from 'lucide-react';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content: 'Assalamu Alaikum! I am the MMC Matrimonial Assistant. I can help answer questions about the one-time ₦5,000 membership fee, our 5-photo verification process, digital MMC permit cards, or Islamic matrimonial guidelines. How may I assist you?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminWaUrl, setAdminWaUrl] = useState('#');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/contact/admin-whatsapp-link')
      .then(res => res.json())
      .then(data => {
        if (data.waUrl) setAdminWaUrl(data.waUrl);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userText }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: newHistory.slice(0, -1)
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply || 'MMC is a Muslim marriage-matching service with a one-time ₦5,000 fee, 5-photo upload requirement, and digital permit cards. If you need direct human assistance, please click below to chat with the MMC Admin.'
          }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I could not reach the server right now. You can chat directly with the MMC Admin on WhatsApp using the button below.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#04241d]/95 backdrop-blur-2xl shadow-2xl border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="bg-black/30 text-white p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-serif">MMC AI Matrimonial Assistant</h3>
            <span className="text-[10px] text-[#c5a059] block font-mono">Available 24/7 for Inquiries</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-transparent">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-[#c5a059] text-white rounded-tr-none shadow-md'
                  : 'bg-white/10 text-white/90 border border-white/15 backdrop-blur-md shadow-sm rounded-tl-none'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 mt-1">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-center text-white/50 text-xs py-2">
            <div className="w-6 h-6 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-white/70 flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Direct WhatsApp Fallback CTA */}
      <div className="p-2.5 bg-black/40 text-white/70 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] backdrop-blur-md">
        <span>Need human help?</span>
        <a
          href={adminWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 rounded-lg bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 font-bold flex items-center gap-1 transition"
        >
          <MessageCircle className="w-3 h-3 text-[#c5a059]" />
          <span>Chat with Admin</span>
        </a>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-black/30 border-t border-white/10 flex items-center gap-2 backdrop-blur-md">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about ₦5,000 fee, 5 photos, permit card..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 text-xs focus:ring-2 focus:ring-[#c5a059] focus:outline-none backdrop-blur-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38f4a] text-white disabled:bg-white/10 disabled:text-white/30 transition shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
