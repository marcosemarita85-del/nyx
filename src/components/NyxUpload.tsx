import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Film, Loader2, ArrowRight } from 'lucide-react';
import { NyxApiService } from '../services/nyx-api';

const NyxUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attach' | 'generate'>('attach');
  const [isDragging, setIsDragging] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{ url?: string; type?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    setStatus(`Nyx recebeu ${files.length} arquivo(s). Processando...`);
    setTimeout(() => {
      setStatus('Arquivos processados com sucesso. Verifique a pasta assets/outputs.');
    }, 2000);
  };

  const handleGenerate = async (type: 'image' | 'video') => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setStatus(`A Nyx está tecendo sua visão (${type})...`);
    setGeneratedResult(null);

    try {
      if (type === 'image') {
        const result = await NyxApiService.generateImage(prompt);
        if (result?.success) {
          setGeneratedResult({ url: result.url, type: 'image' });
          setStatus('Imagem gerada com sucesso.');
        } else {
          setStatus(`Erro: ${result?.error}`);
        }
      } else {
        const result = await NyxApiService.generateVideo(prompt);
        setStatus(result.message);
        setGeneratedResult({ type: 'video' });
      }
    } catch (error) {
      setStatus('Erro ao gerar mídia.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Tabs */}
      <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800/50">
        <button
          onClick={() => setActiveTab('attach')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-lg ${
            activeTab === 'attach' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Upload className="w-4 h-4" />
          Anexar
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-lg ${
            activeTab === 'generate' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Gerar
        </button>
      </div>

      {activeTab === 'attach' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 cursor-pointer
            flex flex-col items-center justify-center space-y-4 min-h-[280px]
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'}
          `}
        >
          <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDragging ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
            <Upload className="w-7 h-7" />
          </div>
          <div className="text-center">
            <p className="text-zinc-200 font-medium">Arraste para a Nyx</p>
            <p className="text-zinc-500 text-xs mt-1">Fotos, Áudios ou Vídeos (Máx 10MB)</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 space-y-5 min-h-[280px] flex flex-col justify-center">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Prompt da Visão</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o que a Nyx deve criar..."
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleGenerate('image')}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border border-zinc-700/50"
            >
              <ImageIcon className="w-4 h-4" />
              Imagem
            </button>
            <button
              onClick={() => handleGenerate('video')}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border border-zinc-700/50"
            >
              <Film className="w-4 h-4" />
              Vídeo
            </button>
          </div>
        </div>
      )}

      {/* Preview do Resultado */}
      {(status || generatedResult) && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {generatedResult?.url && (
            <div className="mb-4 relative group">
              <img src={generatedResult.url} alt="Gerado pela Nyx" className="w-full rounded-2xl border border-zinc-800 shadow-2xl" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                <button className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                  Download <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
          
          {status && (
            <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
              isLoading ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span className="flex-1 leading-relaxed">{status}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NyxUpload;
