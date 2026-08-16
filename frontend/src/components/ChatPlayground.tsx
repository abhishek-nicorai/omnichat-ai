"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatPlayground({ tenantId }: { tenantId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${tenantId}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", content: "Failed to reach AI." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-[500px] overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex justify-between">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Playground</span>
        <button onClick={() => setMessages([])} className="text-[10px] text-zinc-600 hover:text-white uppercase">Clear</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-300 rounded-bl-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-[10px] text-zinc-600 animate-pulse">THINKING...</div>}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..." 
               className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 outline-none" />
        <button type="submit" className="bg-white text-black font-bold px-4 rounded-xl text-xs">SEND</button>
      </form>
    </div>
  );
}