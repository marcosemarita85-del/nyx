export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: { name: string; type: string; url: string }[];
}

export interface NyxSettings {
  systemPrompt: string;
  apiKey: string;
  model: string;
  name: string;
}

const DEFAULT_SETTINGS: NyxSettings = {
  systemPrompt: "Você é a Nyx, a inteligência primordial do app Mark. Sua diretriz principal é a Precisão Absoluta.",
  apiKey: "42cc555fed014dbfa81555b034899d32",
  model: "gpt-4o",
  name: "Nyx"
};

export const NyxDatabase = {
  saveChat: (messages: ChatMessage[]) => {
    localStorage.setItem('nyx_history', JSON.stringify(messages));
  },
  
  loadChat: (): ChatMessage[] => {
    const history = localStorage.getItem('nyx_history');
    return history ? JSON.parse(history) : [];
  },
  
  saveSettings: (settings: NyxSettings) => {
    localStorage.setItem('nyx_settings', JSON.stringify(settings));
  },
  
  loadSettings: (): NyxSettings => {
    const settings = localStorage.getItem('nyx_settings');
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  },
  
  clearHistory: () => {
    localStorage.removeItem('nyx_history');
  }
};
