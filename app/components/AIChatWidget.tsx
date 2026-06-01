'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Button from './ui/button';

export default function AIChatWidget({
  coinId,
  price,
  change,
  tradeScore,
}: {
  coinId: string;
  price: number;
  change: number;
  tradeScore: number;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'ai'; text: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuick, setActiveQuick] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* 🔥 AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* 🔥 COIN LOGO */
  const getCoinLogo = () => {
    if (coinId === 'bitcoin') return 'https://cryptoicons.org/api/icon/btc/32';
    if (coinId === 'ethereum') return 'https://cryptoicons.org/api/icon/eth/32';
    return 'https://cryptoicons.org/api/icon/btc/32';
  };

  /* 🔥 TYPEWRITER */
  const typeMessage = async (text: string) => {
    let current = '';

    for (let i = 0; i < text.length; i++) {
      current += text[i];

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'ai', text: current };
        return updated;
      });

      await new Promise((r) => setTimeout(r, 10));
    }
  };

  /* 🔥 SEND */
  const sendMessage = async (customMessage?: string, type?: string) => {
    const userMsg = customMessage || input;
    if (!userMsg.trim()) return;

    setActiveQuick(type || null);
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 300));

      const res = await axios.post('/api/ai', {
        message: userMsg,
        coinId,
        price,
        change,
        tradeScore,
      });

      const aiText = res.data.reply;

      // placeholder for typing effect
      setMessages((prev) => [...prev, { role: 'ai', text: '' }]);

      await typeMessage(aiText);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'AI error. Try again.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => setActiveQuick(null), 1200);
    }
  };

  /* 🔥 CONFIDENCE */
  const getConfidence = () => {
    if (tradeScore >= 75)
      return { label: 'High', color: 'bg-green-500', width: '90%' };
    if (tradeScore >= 55)
      return { label: 'Medium', color: 'bg-yellow-500', width: '60%' };
    return { label: 'Low', color: 'bg-red-500', width: '30%' };
  };

  const confidence = getConfidence();

  return (
    <>
      {/* FLOAT BUTTON */}
      <div className="fixed bottom-5 right-5 z-50">
        <Button onClick={() => setOpen(!open)}>
          🤖 AI
        </Button>
      </div>

      {/* CHAT CONTAINER */}
      <div
        className={`fixed bottom-16 right-5 w-80 z-50 transition-all duration-300 origin-bottom-right
        ${open ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        <div
  className={`
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    rounded-xl
    shadow-2xl
    flex flex-col
    overflow-hidden
  `}
>
          {/* HEADER */}
          <div className="p-3 border-b border-white/10 text-white flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />

            <img
              src={getCoinLogo()}
              alt="coin"
              className="w-5 h-5 rounded-full"
            />

            <span className="font-semibold">
              AI • {coinId.toUpperCase()}
            </span>
          </div>

          {/* CONFIDENCE */}
          <div className="px-3 py-2 border-b border-white/10">
            <div className="text-xs text-gray-400 mb-1">
              Confidence: {confidence.label}
            </div>

            <div className="w-full bg-neutral-700 h-2 rounded">
              <div
                className={`h-2 rounded ${confidence.color}`}
                style={{ width: confidence.width }}
              />
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="flex flex-wrap gap-2 p-2 border-b border-white/10">
            <Button
              size="sm"
              variant={activeQuick === 'market' ? 'primary' : 'ghost'}
              onClick={() =>
                sendMessage('How is the market right now?', 'market')
              }
            >
              📊 Market
            </Button>

            <Button
              size="sm"
              variant={activeQuick === 'buy' ? 'primary' : 'ghost'}
              onClick={() =>
                sendMessage(`Should I buy ${coinId}?`, 'buy')
              }
            >
              🟢 Buy
            </Button>

            <Button
              size="sm"
              variant={activeQuick === 'sell' ? 'primary' : 'ghost'}
              onClick={() =>
                sendMessage(`Should I sell ${coinId}?`, 'sell')
              }
            >
              🔴 Sell
            </Button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-80">
            {messages.length === 0 && (
              <p className="text-gray-500 text-xs">
                Ask about market, buy/sell, or trends...
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded animate-fadeIn ${
                  msg.role === 'user'
                    ? 'bg-blue-500/80 backdrop-blur-md text-white ml-auto'
                    : 'bg-white/10 backdrop-blur-md text-gray-200'
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <p className="text-gray-400 text-xs animate-pulse">
                AI is thinking...
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-2 flex gap-2 border-t border-white/10">
            <input
              className="flex-1 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded outline-none"
              placeholder="Ask AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <Button size="sm" onClick={() => sendMessage()}>
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}