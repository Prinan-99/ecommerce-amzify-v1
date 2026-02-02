
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, User, Bot, ExternalLink } from 'lucide-react';
import { chatWithAmzify } from '../services/geminiService';
import { ChatMessage, GroundingSource } from '../types';

const AISearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const result = await chatWithAmzify(userText, messages);
    setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    setSources(result.sources);
    setIsLoading(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 flex items-end gap-3 transition-all duration-300`}>
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col max-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold">Amzify Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl flex gap-3 bg-white text-slate-800 shadow-sm border border-slate-100">
                  <div className="flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-sm leading-relaxed">Hello! I'm Amzify AI, your personal shopping concierge. Looking for something specific or need some inspiration for a gift?</p>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl flex gap-3 ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 shadow-sm border border-slate-100'}`}>
                  <div className="flex-shrink-0 mt-1">
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-500" />}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span className="text-sm text-slate-500">Amzify AI is thinking...</span>
                </div>
              </div>
            )}
            {!isLoading && sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Sources</p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s, i) => (
                    <a key={i} href={s.web?.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] bg-slate-200 px-2 py-1 rounded hover:bg-slate-300 transition-colors">
                      {s.web?.title || 'Link'} <ExternalLink className="w-2 h-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Amzify AI anything..."
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-slate-900 text-white p-2 rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 text-white h-14 px-5 hover:px-6 transition-all duration-300 ease-in-out rounded-full shadow-2xl hover:shadow-indigo-500/30 hover:bg-slate-800 flex items-center justify-center gap-2 group flex-shrink-0"
      >
        <Sparkles className="w-6 h-6 text-indigo-400 group-hover:animate-pulse" />
        <span className="font-black text-xs uppercase tracking-widest">
          Ask AI
        </span>
      </button>
    </div>
  );
};

export default AISearch;
