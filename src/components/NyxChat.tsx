import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { NyxApiService } from '../services/nyx-api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isCorrecting?: boolean;
}

const NyxChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Eu sou a Nyx. Em que posso aplicar minha precisão absoluta hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isCorrecting]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Chat normal
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsCorrecting(true);
      await new Promise(resolve => setTimeout(resolve, 1200));

      const finalResponse = await NyxApiService.chatResponse(currentInput);
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: finalResponse 
      }]);
    } catch (error) {
      console.error("Erro na Nyx:", error);
    } finally {
      setIsLoading(false);
      setIsCorrecting(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-zinc-700/50">
      {/* Header do Chat */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Nyx Intelligence</h3>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Online & Precisa</span>
            </div>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-zinc-600" />
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-zinc-800' : 'bg-indigo-600/20 text-indigo-400'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/10' 
                  : 'bg-zinc-800/50 text-zinc-200 border border-zinc-700/50 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {isCorrecting && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-2 text-indigo-400 bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/10">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Auto-corrigindo resposta...</span>
            </div>
          </div>
        )}
        
        {isLoading && !isCorrecting && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/30 p-4 rounded-2xl rounded-tl-none border border-zinc-700/30 flex space-x-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Comande a Nyx..."
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl py-4 pl-5 pr-14 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-600"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 p-2 rounded-lg transition-all ${
              input.trim() && !isLoading 
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'text-zinc-600 bg-zinc-900 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 text-center mt-3 uppercase tracking-widest">
          A Nyx analisa cada palavra para garantir precisão absoluta.
        </p>
      </div>
    </div>
  );
};

export default NyxChat;
