import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

INPUT_DIR = "assets/inputs"
OUTPUT_DIR = "assets/outputs"

class NyxHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        
        file_path = event.src_path
        file_name = os.path.basename(file_path)
        print(f"Nyx detectou um novo arquivo: {file_name}")
        
        self.process_file(file_path, file_name)

    def process_file(self, file_path, file_name):
        # Filtro de Qualidade: Checar tamanho antes de processar
        size_mb = os.path.getsize(file_path) / (1024 * 1024)
        if size_mb > 50: # Exemplo: 50MB
            print(f"Nyx Error: Arquivo {file_name} é muito grande ({size_mb:.2f}MB). Pulando...")
            return

        # Lógica de processamento baseada na extensão
        ext = os.path.splitext(file_name)[1].lower()
        
        if ext in ['.jpg', '.jpeg', '.png']:
            self.handle_image(file_path, file_name)
        elif ext in ['.mp3', '.wav', '.m4a']:
            self.handle_audio(file_path, file_name)
        elif ext in ['.mp4', '.mov']:
            self.handle_video(file_path, file_name)
        else:
            print(f"Tipo de arquivo não suportado: {ext}")

    def handle_image(self, path, name):
        print(f"Nyx processando imagem com Flux: {name}")
        # Simulação de processamento
        output_name = f"nyx_flux_{name}"
        output_path = os.path.join(OUTPUT_DIR, output_name)
        
        # Aqui entraria a chamada real da API
        with open(output_path, 'w') as f:
            f.write(f"Resultado da Nyx via Flux para {name}")
        
        print(f"Nyx gerou uma variação em: {output_path}")

    def handle_audio(self, path, name):
        print(f"Nyx transcrevendo e narrando áudio com ElevenLabs: {name}")
        # Simulação de processamento
        output_name = f"nyx_voice_{name}.txt"
        output_path = os.path.join(OUTPUT_DIR, output_name)
        
        # Aqui entraria a chamada real da API (ElevenLabs)
        with open(output_path, 'w') as f:
            f.write(f"Transcrição e narração da Nyx para {name}")
            
        print(f"Nyx gerou a resposta em áudio em: {output_path}")

    def handle_video(self, path, name):
        print(f"Nyx processando vídeo com Luma: {name}")
        # Simulação de processamento
        output_name = f"nyx_luma_{name}"
        output_path = os.path.join(OUTPUT_DIR, output_name)
        
        # Aqui entraria a chamada real da API (Luma)
        with open(output_path, 'w') as f:
            f.write(f"Processamento de vídeo da Nyx para {name}")
            
        print(f"Nyx finalizou o vídeo em: {output_path}")

if __name__ == "__main__":
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR)
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    event_handler = NyxHandler()
    observer = Observer()
    observer.schedule(event_handler, INPUT_DIR, recursive=False)
    
    print(f"Nyx Orchestrator está ativo e monitorando {INPUT_DIR}...")
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
