import React, { useState, useRef, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { Sparkles, Send, X, MessageCircle } from 'lucide-react';

interface InsightData {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const LoadingDots: React.FC = () => (
  <div className="flex gap-1.5">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

const AIGrowthAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hi! I'm your AI Growth Assistant. Let me help you maximize your Amzify seller potential! 🚀" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightData[]>([
    { label: 'Revenue Growth', value: '+24%', icon: '📈', color: 'from-blue-600 to-blue-400' },
    { label: 'Active Orders', value: '1,243', icon: '📦', color: 'from-purple-600 to-purple-400' },
    { label: 'Conversion Rate', value: '3.2%', icon: '🎯', color: 'from-green-600 to-green-400' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiKey = (import.meta as any).env.VITE_CLAUDE_API_KEY || '';
      const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const systemPrompt = `You are the Amzify AI Growth Assistant - a friendly, data-driven expert helping sellers maximize their business potential.

Amzify Premium Features:
- Advanced analytics & AI insights
- Global shipping network (150+ countries)
- Smart inventory management
- Marketing automation tools
- Dynamic pricing engine
- 24/7 dedicated seller support
- Fraud detection system

Your approach:
1. Ask clarifying questions about their business
2. Provide specific, actionable recommendations
3. Highlight ROI opportunities
4. Share best practices from top sellers
5. Suggest features that match their needs

Be conversational, professional, and growth-focused. Keep responses under 200 words.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          ...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          })),
          { role: 'user', content: userMsg }
        ],
      });

      const aiResponse = response.content[0].type === 'text' 
        ? response.content[0].text 
        : "I'm having trouble processing that. Try asking about pricing strategies, inventory management, or marketing tips!";
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('AI Growth Assistant Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm temporarily offline, but our support team is always available! Chat with them anytime." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[650px] w-full max-w-5xl md:w-[1100px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 p-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Growth Assistant</h3>
                <p className="text-xs text-white/70">Powered by advanced analytics</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Chat Section */}
            <div className="flex-1 flex flex-col border-r border-slate-200">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed transition-all duration-300 ${
                      m.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg rounded-br-none' 
                      : 'bg-white text-slate-800 shadow-md border border-slate-100 rounded-bl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="bg-white shadow-md border border-slate-100 rounded-2xl rounded-bl-none px-5 py-3">
                      <LoadingDots />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Section */}
              <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about growth strategies, features, pricing..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 placeholder-slate-400"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Analytics Sidebar */}
            <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 p-6 overflow-y-auto">
              <h4 className="text-white font-bold text-sm mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Your Growth Metrics
              </h4>
              
              <div className="space-y-4">
                {insights.map((insight, idx) => (
                  <div 
                    key={idx}
                    className="group rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className={`bg-gradient-to-br ${insight.color} p-4 text-white`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{insight.icon}</span>
                        <div className="text-right">
                          <p className="text-xs text-white/70 font-medium">{insight.label}</p>
                          <p className="text-lg font-bold group-hover:scale-110 transition-transform duration-300">{insight.value}</p>
                        </div>
                      </div>
                      <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/60 rounded-full w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips Section */}
              <div className="mt-8 pt-6 border-t border-slate-700">
                <h4 className="text-white/70 font-bold text-xs mb-4 uppercase tracking-wider">💡 Quick Tips</h4>
                <div className="space-y-3 text-xs text-white/60">
                  <div className="bg-slate-700/50 p-3 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                    <p className="font-medium text-white/80">High-Quality Images</p>
                    <p className="text-white/50">Increase conversions by 40%+</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                    <p className="font-medium text-white/80">Competitive Pricing</p>
                    <p className="text-white/50">Use our pricing engine</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                    <p className="font-medium text-white/80">Customer Reviews</p>
                    <p className="text-white/50">Build trust with feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group relative active:scale-95"
        >
          <div className="relative">
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-2 -right-2 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
            </span>
          </div>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            💬 Ask AI for Growth Tips
          </div>
        </button>
      )}
    </div>
  );
};

export default AIGrowthAssistant;
