#!/usr/bin/env python3
"""
NeuroFlux Pulse Engine v2.0
Real-time AI news scraper + NVIDIA NIM summarizer.
"""

import os
import re
import json
import hashlib
import datetime
import logging
from typing import Optional
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')
log = logging.getLogger('neuroflux')

SOURCES = [
    {"name": "ArXiv",     "url": "https://rss.arxiv.org/rss/cs.AI",                "type": "arxiv"},
    {"name": "Reddit AI", "url": "https://www.reddit.com/r/artificial/.rss",        "type": "reddit"},
    {"name": "TechCrunch","url": "https://techcrunch.com/category/artificial-intelligence/feed/", "type": "rss"},
    {"name": "VentureBeat","url": "https://venturebeat.com/category/ai/feed/",      "type": "rss"},
    {"name": "HN AI",     "url": "https://hnrss.org/frontpage?q=AI+OR+machine+learning+OR+neural+OR+LLM+OR+GPT", "type": "rss"},
]


class NeuroFluxPulse:
    def __init__(self, output_path: Optional[str] = None):
        self.output_path = output_path or str(
            Path(__file__).resolve().parent.parent / "public" / "feed.json"
        )
        self.seen_ids: set = set()
        self.articles: list = []

    def clean_text(self, text: str, max_len: int = 280) -> str:
        """Clean HTML, trim whitespace, shorten."""
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove common RSS boilerplate
        text = re.sub(r'^(Abstract|Summary|Description):\s*', '', text, flags=re.IGNORECASE)
        if len(text) > max_len:
            text = text[:max_len-3] + '...'
        return text

    def fetch_rss(self, source: dict) -> list:
        import feedparser
        try:
            log.info(f"📡 Fetching: {source['name']}")
            feed = feedparser.parse(source['url'])
            if feed.bozo and not feed.entries:
                log.warning(f"⚠️ Bad feed: {source['name']}")
                return []
            items = []
            for entry in feed.entries[:10]:
                title = entry.get('title', '').strip()
                link = entry.get('link', '')
                summary = entry.get('summary', entry.get('description', ''))
                published = entry.get('published_parsed') or entry.get('updated_parsed')
                summary = self.clean_text(summary, 280)

                # Get or generate a unique ID
                uid = hashlib.md5(f"{title}{link}".encode()).hexdigest()[:10]

                if published:
                    ts = datetime.datetime(*published[:6]).isoformat() + 'Z'
                else:
                    ts = datetime.datetime.utcnow().isoformat() + 'Z'

                items.append({
                    "id": uid,
                    "source": source['name'],
                    "title": title[:120],
                    "content": summary,
                    "url": link,
                    "timestamp": ts,
                })
            log.info(f"✅ {len(items)} items from {source['name']}")
            return items
        except Exception as e:
            log.error(f"❌ Error: {source['name']}: {e}")
            return []

    def summarize_with_nim(self, text: str) -> str:
        """Summarize with NVIDIA NIM. Falls back to clean text."""
        api_key = os.getenv('NVIDIA_API_KEY_1') or os.getenv('NVIDIA_API_KEY_2')
        if not api_key or len(text) < 30:
            return text

        try:
            import requests
            resp = requests.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "meta/llama-3.1-8b-instruct",
                    "messages": [
                        {"role": "system", "content": "Summarize this AI news in 1 sentence (max 200 chars). Output ONLY the summary."},
                        {"role": "user", "content": text[:1500]},
                    ],
                    "temperature": 0.2,
                    "max_tokens": 100,
                },
                timeout=10,
            )
            if resp.status_code == 200:
                summary = resp.json()['choices'][0]['message']['content'].strip()
                summary = re.sub(r'^["\']|["\']$', '', summary)
                if summary:
                    return summary
        except Exception as e:
            log.warning(f"⚠️ NIM failed: {e}")
        return text

    def format_content(self, item: dict) -> str:
        """Format content with source prefix and NIM summary if available."""
        source = item['source']
        prefixes = {
            "ArXiv": "📄",
            "Reddit AI": "💬",
            "TechCrunch": "📰",
            "VentureBeat": "📊",
            "HN AI": "🔥",
        }
        icon = prefixes.get(source, "📡")
        content = item['content']

        # For ArXiv, extract the actual paper title/topic
        if source == "ArXiv":
            content = re.sub(r'^arXiv:\S+\s+(Announce Type: \S+\s+)?(Abstract:\s*)?', '', content)

        # Try NIM summarization for longer content
        if len(content) > 100:
            summarized = self.summarize_with_nim(content)
            if summarized != content:
                content = summarized

        return f"{icon} {content}"

    def run_pulse(self):
        log.info("=" * 60)
        log.info("🧠 NEUROFLUX PULSE ENGINE v2.0")
        log.info(f"⏰ {datetime.datetime.utcnow().isoformat()} UTC")
        log.info("=" * 60)

        all_items = []
        for source in SOURCES:
            items = self.fetch_rss(source)
            for item in items:
                if item['id'] not in self.seen_ids:
                    self.seen_ids.add(item['id'])
                    item['content'] = self.format_content(item)
                    all_items.append(item)

        all_items.sort(key=lambda x: x['timestamp'], reverse=True)
        all_items = all_items[:50]

        if len(all_items) < 5:
            log.warning("⚠️ Low content, adding filler")
            all_items.append({
                "id": "sys_1", "source": "NeuroFlux",
                "title": "Pulse Active",
                "content": "🧠 Neural intelligence synthesis online. Scanning 6 streams for the next pulse.",
                "url": "", "timestamp": datetime.datetime.utcnow().isoformat() + 'Z',
            })

        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        with open(self.output_path, 'w', encoding='utf-8') as f:
            json.dump(all_items, f, indent=2, ensure_ascii=False)

        log.info(f"✅ Published {len(all_items)} articles")
        return all_items


if __name__ == '__main__':
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent.parent / '.env.local'
    if env_path.exists():
        load_dotenv(str(env_path))
    NeuroFluxPulse().run_pulse()
