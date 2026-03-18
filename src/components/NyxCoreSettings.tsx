import React, { useState } from 'react';
import { X, Save, Shield, Cpu, Key, UserCircle } from 'lucide-react';
import { NyxDatabase } from '../services/database';
import type { NyxSettings } from '../services/database';

interface NyxCoreSettingsProps {
  onClose: () => void;
}

const NyxCoreSettings: React.FC<NyxCoreSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<NyxSettings>(NyxDatabase.loadSettings());
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    NyxDatabase.saveSettings(settings);
    setShowSaved(true);
    setTimeout(() => {
      setShowSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1e1f20] w-full max-w-2xl rounded-3xl border border-[#333537] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#333537] flex items-center justify-between bg-[#1e1f20]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#e3e3e3]">Nyx Core</h2>
              <p className="text-xs text-[#8e918f] uppercase tracking-widest font-medium">Configuração da Alma</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#333537] rounded-full transition-colors">
            <X className="w-6 h-6 text-[#8e918f]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Personalidade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#e3e3e3]">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold">Diretriz Primordial (System Prompt)</h3>
            </div>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              placeholder="Defina a personalidade da Nyx..."
              className="w-full bg-[#131314] border border-[#333537] rounded-2xl p-4 text-sm text-[#e3e3e3] min-h-[120px] focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
            />
          </div>

          {/* API e Modelo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#e3e3e3]">
                <Key className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold">OpenAI API Key</h3>
              </div>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-[#131314] border border-[#333537] rounded-xl p-3 text-sm text-[#e3e3e3] focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#e3e3e3]">
                <UserCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold">Identidade</h3>
              </div>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Nome da IA"
                className="w-full bg-[#131314] border border-[#333537] rounded-xl p-3 text-sm text-[#e3e3e3] focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#8e918f] uppercase tracking-widest">Modelo de Inteligência</h3>
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full bg-[#131314] border border-[#333537] rounded-xl p-3 text-sm text-[#e3e3e3] focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
            >
              <option value="gpt-4o">GPT-4o (Recomendado)</option>
              <option value="gpt-4o-mini">GPT-4o mini (Econômico)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#333537] bg-[#1e1f20] flex items-center justify-end">
          <button
            onClick={handleSave}
            disabled={showSaved}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm transition-all ${
              showSaved 
              ? 'bg-emerald-500 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {showSaved ? (
              <>Salvo com Sucesso!</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Aplicar na Alma
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NyxCoreSettings;
