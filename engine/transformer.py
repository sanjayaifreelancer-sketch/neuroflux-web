import os
import datetime
import json
import requests
from dotenv import load_dotenv

load_dotenv(r'C:\work\Hermis data\.env.local')

class NeuroFluxEngine:
    def __init__(self):
        self.api_key = os.getenv('NVIDIA_API_KEY_1') or os.getenv('NVIDIA_API_KEY_2')
        self.api_url = "https://ai.nvidia.com/ni/v1/chat/completions"
        self.output_path = os.path.join(os.path.dirname(__file__), '../public/feed.json')

    def run_pulse(self):
        print("[SYSTEM] Pulse Cycle Starting...")
        # Simulated source data - in production, this uses Scrapy
        raw_data = [
            {"source": "AI-News", "msg": "NVIDIA Blackwell architecture enters mass production phase."},
            {"source": "X-Pulse", "msg": "New transformer pattern discovered by researchers."}
        ]
        
        processed = []
        for item in raw_data:
            print(f"[ENGINE] Processing: {item['msg'][:30]}...")
            # In real usage, we call NVIDIA NIM here. 
            # For the build phase, we ensure JSON structure exists.
            transformed = f"NEURAL-SYNC: {item['msg']}" 
            processed.append({
                "id": os.urandom(4).hex(),
                "timestamp": datetime.datetime.now().isoformat(),
                "source": item['source'],
                "content": transformed
            })

        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        with open(self.output_path, 'w', encoding='utf-8') as f:
            json.dump(processed, f, indent=4)
        print("[SUCCESS] Pulse Complete. Feed updated.")

if __name__ == '__main__':
    NeuroFluxEngine().run_pulse()