import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Loader2, Plus, 
  Image as ImageIcon, Mic, FileText, 
  Menu, History, Settings, MoreVertical, X,
  Trash2, Download
} from 'lucide-react';
import { NyxDatabase } from '../services/database';
import { NyxApiService } from '../services/nyx-api';
import type { ChatMessage } from '../services/database';
import NyxCoreSettings from './NyxCoreSettings';

const GeminiInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; type: string; url: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar histórico ao iniciar
  useEffect(() => {
    const history = NyxDatabase.loadChat();
    if (history.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Olá! Eu sou a Nyx. Como posso ajudar com sua criatividade hoje? Posso gerar imagens, vídeos, áudios e analisar seus documentos.',
        timestamp: Date.now()
      }]);
    } else {
      setMessages(history);
    }
  }, []);

  // Salvar sempre que mudar
  useEffect(() => {
    if (messages.length > 0) {
      NyxDatabase.saveChat(messages);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Lógica de Geração de Mídia (Integrada)
      const isMediaRequest = /gerar (imagem|foto|video|filme|audio)/i.test(currentInput);
      
      if (isMediaRequest) {
        setIsCorrecting(true);
        if (/imagem|foto/i.test(currentInput)) {
          const res = await NyxApiService.generateImage(currentInput);
          if (res?.success) {
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `Visão primordial gerada:\n\n![Resultado](${res.url})\n\n${res.revised_prompt}`,
              timestamp: Date.now()
            }]);
          }
        } else if (/video|filme/i.test(currentInput)) {
          const res = await NyxApiService.generateVideo(currentInput);
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: res.message,
            timestamp: Date.now()
          }]);
        }
        setIsCorrecting(false);
      } else {
        // Chat normal com IA
        setIsCorrecting(true);
        const response = await NyxApiService.chatResponse(currentInput);
        setIsCorrecting(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsCorrecting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Sidebar estilo Gemini */}
      <aside className={`transition-all duration-300 bg-[#1e1f20] flex flex-col ${sidebarOpen ? 'w-72' : 'w-0 opacity-0'} border-r border-[#333537]`}>
        <div className="p-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-[#333537] rounded-full transition-all text-[#c4c7c5]">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-medium text-lg text-[#e3e3e3]">Nyx History</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#333537]/50 hover:bg-[#333537] border border-[#444648]/30 rounded-full transition-all text-sm font-medium text-[#e3e3e3]">
            <Plus className="w-5 h-5 text-[#8e918f]" />
            Nova Conversa
          </button>
          
          <div className="mt-8 px-4 text-xs font-bold text-[#8e918f] uppercase tracking-widest mb-4">Recentes</div>
          {/* Histórico simulado ou carregado */}
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#333537] rounded-full transition-all text-sm truncate text-[#c4c7c5]">
              <History className="w-4 h-4 text-[#8e918f]" />
              Identidade Visual Nyx
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#333537] space-y-1">
          <button onClick={() => { NyxDatabase.clearHistory(); window.location.reload(); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#333537] text-[#8e918f] hover:text-red-400 rounded-full transition-all text-sm">
            <Trash2 className="w-4 h-4" />
            Limpar Histórico
          </button>
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#333537] text-[#8e918f] hover:text-[#e3e3e3] rounded-full transition-all text-sm">
            <Settings className="w-4 h-4" />
            Nyx Core
          </button>
        </div>
      </aside>

      {showSettings && <NyxCoreSettings onClose={() => setShowSettings(false)} />}

      {/* Área Principal */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="p-4 flex items-center justify-between">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-[#333537] rounded-full transition-all text-[#c4c7c5]">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium text-[#e3e3e3]">Nyx</span>
            <span className="bg-[#333537] text-[#8e918f] text-[10px] px-2 py-0.5 rounded font-bold">PRO</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#333537] border border-[#444648] flex items-center justify-center text-[#e3e3e3] font-bold text-sm">MV</div>
        </header>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-20 lg:px-40 py-8 space-y-10 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-4 md:gap-8 group animate-in fade-in duration-500">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' 
                ? 'bg-gradient-to-tr from-[#1a73e8] via-[#8e24aa] to-[#d81b60] border border-[#ffffff10]' 
                : 'bg-[#333537] border border-[#444648]'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-[#e3e3e3]" /> : <User className="w-5 h-5 text-[#e3e3e3]" />}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="font-medium text-[#e3e3e3] text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
                
                {msg.attachments && (
                  <div className="flex flex-wrap gap-2">
                    {msg.attachments.map((file, idx) => (
                      <div key={idx} className="bg-[#1e1f20] border border-[#333537] p-2 rounded-xl flex items-center gap-3 max-w-xs">
                        {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-blue-400" /> : <FileText className="w-4 h-4 text-zinc-400" />}
                        <span className="text-xs truncate max-w-[120px]">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-[#333537] rounded-full"><Download className="w-4 h-4 text-[#8e918f]" /></button>
                    <button className="p-2 hover:bg-[#333537] rounded-full"><MoreVertical className="w-4 h-4 text-[#8e918f]" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isCorrecting && (
            <div className="flex gap-4 md:gap-8 animate-pulse">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#333537] flex-shrink-0" />
              <div className="flex items-center gap-2 text-[#8e918f] text-sm italic">
                <Loader2 className="w-4 h-4 animate-spin" />
                A Nyx está refinando sua consciência...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Área (Gemini Style) */}
        <div className="p-4 md:px-20 lg:px-40 pb-10">
          <div className="relative max-w-4xl mx-auto bg-[#1e1f20] border border-transparent focus-within:border-[#333537] rounded-3xl transition-all shadow-xl">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="p-4 flex flex-wrap gap-2 border-b border-[#333537]">
                {attachments.map((file, idx) => (
                  <div key={idx} className="relative group bg-[#333537] p-2 rounded-lg flex items-center gap-2">
                    <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end p-2 md:p-4 gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="p-2 md:p-3 hover:bg-[#333537] rounded-full text-[#c4c7c5] transition-all hover:text-[#e3e3e3]">
                <Plus className="w-6 h-6" />
              </button>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Digite algo aqui"
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 text-[#e3e3e3] placeholder-[#8e918f] py-2 md:py-3 resize-none max-h-60"
              />

              <div className="flex items-center gap-1 md:gap-2 pr-2">
                <button className="p-2 md:p-3 hover:bg-[#333537] rounded-full text-[#c4c7c5] hover:text-[#e3e3e3] transition-all"><Mic className="w-6 h-6" /></button>
                <button className="p-2 md:p-3 hover:bg-[#333537] rounded-full text-[#c4c7c5] hover:text-[#e3e3e3] transition-all"><ImageIcon className="w-6 h-6" /></button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() && attachments.length === 0}
                  className={`p-2 md:p-3 rounded-full transition-all ${input.trim() ? 'text-[#8ab4f8] hover:bg-[#333537]' : 'text-[#4e4f50]'}`}
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-[#8e918f] mt-4">
            A Nyx pode apresentar informações imprecisas, inclusive sobre pessoas, por isso cheque suas respostas.
          </p>
        </div>
      </main>
    </div>
  );
};

export default GeminiInterface;
