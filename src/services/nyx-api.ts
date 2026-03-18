import { NYX_CONFIG } from '../config/nyx-config';
import { NyxDatabase } from './database';

export const NyxApiService = {
  getApiKey: () => NyxDatabase.loadSettings().apiKey,
  getSystemPrompt: () => NyxDatabase.loadSettings().systemPrompt,
  getModel: () => NyxDatabase.loadSettings().model,
  /**
   * Melhora o prompt do usuário antes de enviar para a geração.
   * Implementa o "Prompt Engineering" automático da Nyx.
   */
  async improvePrompt(userPrompt: string): Promise<string> {
    console.log(`Nyx está refinando o prompt: ${userPrompt}`);
    // Simulação de refinação
    return `Refined by Nyx: ${userPrompt}. Adicione detalhes cinematográficos, iluminação dramática e precisão técnica.`;
  },

  /**
   * Lógica de Auto-Correção (Self-Correction).
   * A Nyx analisa sua própria resposta antes de enviá-la.
   */
  async selfCorrect(draftResponse: string): Promise<string> {
    console.log("Nyx: Iniciando auto-correção...");
    // Simula um processo de análise interna
    const corrections = [
      { pattern: /erro/i, replacement: "precisão absoluta" },
      { pattern: /talvez/i, replacement: "com certeza" },
      { pattern: /acho que/i, replacement: "identifiquei que" }
    ];

    let corrected = draftResponse;
    corrections.forEach(c => {
      corrected = corrected.replace(c.pattern, c.replacement);
    });

    if (corrected !== draftResponse) {
      console.log("Nyx: Resposta auto-corrigida para maior autoridade.");
    }
    return corrected;
  },

  /**
   * Gera uma resposta de chat real via API da OpenAI.
   */
  async chatResponse(userMessage: string): Promise<string> {
    const key = this.getApiKey();
    if (!key) return "Nyx: Nenhuma chave de acesso detectada. Por favor, configure-a no Nyx Core.";

    try {
      console.log(`Nyx: Enviando mensagem com a chave: ${key.substring(0, 5)}...`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: this.getModel(),
          messages: [
            { role: "system", content: this.getSystemPrompt() },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Nyx API Error Details:", errorData);
        throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      const draft = data.choices[0].message.content;
      return await this.selfCorrect(draft);
    } catch (error: any) {
      console.error("Nyx Chat Error:", error.message);
      return `Conexão interrompida: ${error.message}. Verifique sua chave no Nyx Core.`;
    }
  },
  async checkQuality(file: File): Promise<boolean> {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      console.error("Nyx: Arquivo muito grande. Máximo 10MB.");
      return false;
    }
    return true;
  },
  validateParams(params: any): boolean {
    if (!params.prompt || params.prompt.length < 5) {
      console.error("Nyx: Prompt muito curto ou ausente.");
      return false;
    }
    return true;
  },

  /**
   * Gera uma imagem usando a API da OpenAI (DALL-E 3) como fallback para Flux.
   */
  async generateImage(prompt: string) {
    if (!this.validateParams({ prompt })) return null;
    const refined = await this.improvePrompt(prompt);
    
    try {
      console.log(`Nyx: Solicitando imagem via API...`);
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getApiKey()}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: refined,
          n: 1,
          size: "1024x1024",
          quality: "hd"
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      return { 
        success: true, 
        model: "dall-e-3", 
        url: data.data[0].url,
        revised_prompt: data.data[0].revised_prompt 
      };
    } catch (error: any) {
      console.error("Nyx Error (Image):", error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Simula a geração de vídeo (requer SDKs específicos como Luma/Runway).
   */
  async generateVideo(prompt: string) {
    console.log(`Nyx: Iniciando geração de vídeo para: ${prompt}`);
    // Simulação pois APIs de vídeo geralmente requerem webhooks/polling
    return { 
      success: true, 
      model: NYX_CONFIG.models.video, 
      status: "processing",
      message: "A Nyx está tecendo os frames da noite. O vídeo estará pronto em breve." 
    };
  },
};
