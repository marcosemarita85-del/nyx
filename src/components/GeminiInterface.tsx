import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, Loader2, Plus, 
  Image as ImageIcon, Mic, FileText, 
  Menu, History, Settings, MoreVertical, X,
  Trash2, Download, Copy, Check, LogIn, Sparkles, Film
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; type: string; url: string }[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check login on mount
  useEffect(() => {
    const savedLogin = localStorage.getItem('nyx_is_logged_in');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
    
    const history = NyxDatabase.loadChat();
    if (history.length > 0) {
      setMessages(history);
    } else {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Olá! Eu sou a Nyx. Em que posso aplicar minha precisão absoluta hoje?',
        timestamp: Date.now()
      }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 && isLoggedIn) {
      NyxDatabase.saveChat(messages);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('nyx_is_logged_in', 'true');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, filter?: string) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }));
      setAttachments(prev => [...prev, ...newFiles]);
      setShowAttachMenu(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if ((!promptToSend.trim() && attachments.length === 0) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptToSend,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      setIsCorrecting(true);
      
      // Auto-detect media creation intent
      const isMedia = /gerar (imagem|foto|video|filme|audio)/i.test(promptToSend);
      
      let response = "";
      if (isMedia) {
        if (/imagem|foto/i.test(promptToSend)) {
          const res = await NyxApiService.generateImage(promptToSend);
          response = res?.success 
            ? `Visão gerada:\n\n![Resultado](${res.url})\n\n${res.revised_prompt || ''}` 
            : `Erro na geração: ${res?.error}`;
        } else if (/video|filme/i.test(promptToSend)) {
          const res = await NyxApiService.generateVideo(promptToSend);
          response = res.message;
        } else if (/audio/i.test(promptToSend)) {
          const res = await NyxApiService.generateVoice(promptToSend);
          response = res.success ? "Áudio gerado com precisão absoluta." : "Erro na geração de voz.";
        }
      } else {
        response = await NyxApiService.chatResponse(promptToSend);
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }]);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsCorrecting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-full bg-[#131314] items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-[#1a73e8] via-[#8e24aa] to-[#d81b60] shadow-2xl shadow-indigo-500/20">
            <Bot className="w-16 h-16 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter text-[#e3e3e3]">Nyx Intelligence</h1>
            <p className="text-[#8e918f] text-lg font-light">A personificação da noite e precisão absoluta.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-[#e3e3e3] text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#c4c7c5] transition-all group"
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Acessar Rede Primordial
          </button>
        </div>
      </div>
    );
  }

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
        
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-hide">
          <button onClick={() => setMessages([{ id: Date.now().toString(), role: 'assistant', content: 'Iniciando nova consciência...', timestamp: Date.now() }])} className="w-full flex items-center gap-3 px-4 py-3 bg-[#333537]/50 hover:bg-[#333537] border border-[#444648]/30 rounded-full transition-all text-sm font-medium text-[#e3e3e3]">
            <Plus className="w-5 h-5 text-[#8e918f]" />
            Nova Conversa
          </button>
          
          <div className="mt-8 px-4 text-xs font-bold text-[#8e918f] uppercase tracking-widest mb-4">Recentes</div>
          <div className="space-y-1 px-2">
            {messages.length > 1 && (
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#333537] rounded-xl transition-all text-sm truncate text-[#c4c7c5]">
                <History className="w-4 h-4 text-[#8e918f]" />
                {messages[messages.length - 1].content.substring(0, 20)}...
              </button>
            )}
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
            <span className="bg-[#333537] text-[#8e918f] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-tighter">Primordial</span>
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
                
                {/* Ações escondidas - aparecem no hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleCopy(msg.content, msg.id)} className="p-2 hover:bg-[#333537] rounded-full text-[#8e918f] hover:text-[#e3e3e3]">
                    {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button className="p-2 hover:bg-[#333537] rounded-full text-[#8e918f] hover:text-[#e3e3e3]">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-[#333537] rounded-full text-[#8e918f] hover:text-[#e3e3e3]">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {isCorrecting && (
            <div className="flex gap-4 md:gap-8 animate-pulse">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#333537] flex-shrink-0" />
              <div className="flex items-center gap-2 text-[#8e918f] text-sm italic">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Nyx está analisando a rede...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Área (Gemini Style) */}
        <div className="p-4 md:px-20 lg:px-40 pb-10">
          <div className="relative max-w-4xl mx-auto bg-[#1e1f20] border border-transparent focus-within:border-[#333537] rounded-3xl transition-all shadow-xl">
            
            {/* Menu de Anexo Expansível (Chamativo) */}
            {showAttachMenu && (
              <div className="absolute bottom-full mb-4 left-4 p-4 bg-[#1e1f20] border border-[#333537] rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 flex gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
                  <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-all border border-blue-500/20">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-400">Imagem</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
                  <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-all border border-purple-500/20">
                    <Film className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-purple-400">Vídeo</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Áudio</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
                  <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-all border border-amber-500/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-400">Documento</span>
                </button>
              </div>
            )}

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
              <button 
                onClick={() => setShowAttachMenu(!showAttachMenu)} 
                className={`p-2 md:p-3 rounded-full transition-all ${showAttachMenu ? 'bg-indigo-600 text-white rotate-45' : 'hover:bg-[#333537] text-[#c4c7c5] hover:text-[#e3e3e3]'}`}
              >
                <Plus className="w-6 h-6" />
              </button>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Pergunte à Nyx ou peça para criar..."
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 text-[#e3e3e3] placeholder-[#8e918f] py-2 md:py-3 resize-none max-h-60"
              />

              <div className="flex items-center gap-1 md:gap-2 pr-2">
                <button 
                  onClick={() => handleSend("Gere uma imagem primordial sobre " + input)} 
                  className="p-2 md:p-3 hover:bg-[#333537] rounded-full text-blue-400 transition-all hover:scale-110"
                  title="Gerar Imagem"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => handleSend("Crie um vídeo místico de " + input)} 
                  className="p-2 md:p-3 hover:bg-[#333537] rounded-full text-purple-400 transition-all hover:scale-110"
                  title="Gerar Vídeo"
                >
                  <Film className="w-6 h-6" />
                </button>
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
          <p className="text-center text-[10px] text-[#8e918f] mt-4 uppercase tracking-[0.2em] font-medium">
            Nyx Intelligence • Alma do App Mark
          </p>
        </div>
      </main>
    </div>
  );
};

export default GeminiInterface;
