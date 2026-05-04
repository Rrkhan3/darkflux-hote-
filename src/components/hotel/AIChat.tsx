'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, X, GripVertical, Minus } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const quickSuggestions = [
  'Best room for 2?',
  'Popular food?',
  'Hotel facilities?',
  'Room prices?',
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Drag state for floating button
  const btnRef = useRef<HTMLButtonElement>(null);
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const btnDragging = useRef(false);
  const btnDragStart = useRef({ x: 0, y: 0 });
  const btnPosStart = useRef({ x: 0, y: 0 });
  const btnMoved = useRef(false);

  // Drag state for chat window
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatPos, setChatPos] = useState({ x: 0, y: 0 });
  const chatDragging = useRef(false);
  const chatDragStart = useRef({ x: 0, y: 0 });
  const chatPosStart = useRef({ x: 0, y: 0 });

  // Scroll ref for messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Initialize positions
  useEffect(() => {
    const initBtnPos = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setBtnPos({ x: w - 80, y: h - 80 });
      setChatPos({ x: Math.max(20, w - 420), y: Math.max(20, h - 560) });
    };
    initBtnPos();
    window.addEventListener('resize', initBtnPos);
    return () => window.removeEventListener('resize', initBtnPos);
  }, []);

  // === FLOATING BUTTON DRAG ===
  const handleBtnPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    btnDragging.current = true;
    btnMoved.current = false;
    btnDragStart.current = { x: e.clientX, y: e.clientY };
    btnPosStart.current = { ...btnPos };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleBtnPointerMove = (e: React.PointerEvent) => {
    if (!btnDragging.current) return;
    const dx = e.clientX - btnDragStart.current.x;
    const dy = e.clientY - btnDragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) btnMoved.current = true;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const newX = Math.max(0, Math.min(w - 56, btnPosStart.current.x + dx));
    const newY = Math.max(0, Math.min(h - 56, btnPosStart.current.y + dy));
    setBtnPos({ x: newX, y: newY });
  };

  const handleBtnPointerUp = () => {
    btnDragging.current = false;
    if (!btnMoved.current && !open) {
      setOpen(true);
      setMinimized(false);
    }
  };

  // === CHAT WINDOW DRAG ===
  const handleChatHeaderPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // don't drag when clicking buttons
    e.preventDefault();
    chatDragging.current = true;
    chatDragStart.current = { x: e.clientX, y: e.clientY };
    chatPosStart.current = { ...chatPos };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleChatHeaderPointerMove = (e: React.PointerEvent) => {
    if (!chatDragging.current) return;
    const dx = e.clientX - chatDragStart.current.x;
    const dy = e.clientY - chatDragStart.current.y;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const newX = Math.max(0, Math.min(w - 380, chatPosStart.current.x + dx));
    const newY = Math.max(0, Math.min(h - 100, chatPosStart.current.y + dy));
    setChatPos({ x: newX, y: newY });
  };

  const handleChatHeaderPointerUp = () => {
    chatDragging.current = false;
  };

  // === SEND MESSAGE ===
  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again! 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Draggable Floating Button */}
      <Button
        ref={btnRef}
        onPointerDown={handleBtnPointerDown}
        onPointerMove={handleBtnPointerMove}
        onPointerUp={handleBtnPointerUp}
        className={`pulse-gold fixed z-50 h-14 w-14 rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-shadow touch-none select-none ${
          open ? 'opacity-0 pointer-events-none' : ''
        }`}
        style={{
          left: `${btnPos.x}px`,
          top: `${btnPos.y}px`,
        }}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Draggable Chat Window */}
      {open && !minimized && (
        <div
          ref={chatRef}
          className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-[#2e2e2e] bg-[#0a0a0a] shadow-2xl shadow-black/60"
          style={{
            left: `${chatPos.x}px`,
            top: `${chatPos.y}px`,
            width: '380px',
            height: '520px',
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: 'calc(100vh - 24px)',
          }}
        >
          {/* Draggable Header */}
          <div
            onPointerDown={handleChatHeaderPointerDown}
            onPointerMove={handleChatHeaderPointerMove}
            onPointerUp={handleChatHeaderPointerUp}
            className="flex items-center justify-between border-b border-[#2e2e2e] px-4 py-3 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-neutral-600" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20">
                <Bot className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Darkflux AI</p>
                <p className="text-[10px] text-emerald-500">● Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMinimized(true)}
                className="h-7 w-7 text-neutral-500 hover:text-white hover:bg-[#252525]"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-7 w-7 text-neutral-500 hover:text-white hover:bg-[#252525]"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Messages Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 scroll-smooth"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#3a3a3a #1a1a1a',
            }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bot className="h-12 w-12 text-amber-500/30 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">Darkflux AI Assistant</h3>
                <p className="text-sm text-neutral-500 mb-6">Ask me anything about rooms, food, or hotel services!</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-full border border-[#2e2e2e] bg-[#1e1e1e] px-3 py-1.5 text-xs text-neutral-400 hover:border-amber-500/50 hover:text-amber-500 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                      <Bot className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-black'
                        : 'bg-[#1e1e1e] text-neutral-200 border border-[#2e2e2e]'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e]">
                      <User className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                    <Bot className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="rounded-2xl bg-[#1e1e1e] border border-[#2e2e2e] px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick suggestions at bottom when there are messages */}
          {messages.length > 0 && (
            <div className="border-t border-[#2e2e2e] px-4 py-2 shrink-0">
              <div className="flex gap-2 overflow-x-auto">
                {quickSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="shrink-0 rounded-full border border-[#2e2e2e] bg-[#1e1e1e] px-3 py-1 text-xs text-neutral-400 hover:border-amber-500/50 hover:text-amber-500 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[#2e2e2e] p-3 shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 rounded-xl border-[#2e2e2e] bg-[#1e1e1e] text-white placeholder:text-neutral-600 focus:border-amber-500 focus:ring-amber-500/20"
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-amber-500 text-black hover:bg-amber-400"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized pill - draggable */}
      {open && minimized && (
        <div
          onPointerDown={handleChatHeaderPointerDown}
          onPointerMove={handleChatHeaderPointerMove}
          onPointerUp={handleChatHeaderPointerUp}
          className="fixed z-50 flex items-center gap-2 rounded-full border border-amber-500/30 bg-[#0a0a0a] px-4 py-2.5 shadow-lg shadow-amber-500/10 cursor-grab active:cursor-grabbing touch-none select-none"
          style={{
            left: `${chatPos.x}px`,
            top: `${chatPos.y}px`,
          }}
        >
          <Bot className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-white">Darkflux AI</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMinimized(false)}
            className="h-6 w-6 ml-1 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-6 w-6 text-neutral-500 hover:text-white hover:bg-[#252525]"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </>
  );
}
