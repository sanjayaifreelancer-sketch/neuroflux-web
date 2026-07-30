#!/usr/bin/env python3
"""
NeuroFlux Pulse Engine v3.0 — Full multimedia news engine
Scrapes RSS, extracts images/media, creates rich article feed.
"""

import os, re, json, hashlib, datetime, logging, html
from typing import Optional
from pathlib import Path
from urllib.parse import urljoin

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')
log = logging.getLogger('neuroflux')

SOURCES = [
    {
        "name": "AI News",
        "url": "https://www.artificialintelligence-news.com/feed/",
        "category": "news",
        "icon": "📰"
    },
    {
        "name": "TechCrunch AI",
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "category": "news",
        "icon": "🔥"
    },
    {
        "name": "VentureBeat AI",
        "url": "https://venturebeat.com/category/ai/feed/",
        "category": "news",
        "icon": "📊"
    },
    {
        "name": "ArXiv",
        "url": "https://rss.arxiv.org/rss/cs.AI",
        "category": "papers",
        "icon": "📄"
    },
    {
        "name": "Reddit AI",
        "url": "https://www.reddit.com/r/artificial/.rss",
        "category": "discussion",
        "icon": "💬"
    },
    {
        "name": "HN AI",
        "url": "https://hnrss.org/frontpage?q=AI+OR+machine+learning+OR+neural+OR+LLM+OR+GPT+OR+deep+learning",
        "category": "discussion",
        "icon": "🔥"
    },
    {
        "name": "MIT AI",
        "url": "https://news.mit.edu/topic/artificial-intelligence2/rss",
        "category": "research",
        "icon": "🔬"
    },
]


class NeuroFluxPulse:
    def __init__(self, output_path: Optional[str] = None):
        self.output_path = output_path or str(
            Path(__file__).resolve().parent.parent / "public" / "feed.json"
        )
        self.seen_ids: set = set()

    def extract_image(self, entry) -> Optional[str]:
        """Extract the best image URL from an RSS entry."""
        # Try media:content
        if hasattr(entry, 'media_content') and entry.media_content:
            for m in entry.media_content:
                url = m.get('url', '')
                if url and not url.endswith('.svg'):
                    return url

        # Try media:thumbnail
        if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
            return entry.media_thumbnail[0].get('url')

        # Try enclosures
        if hasattr(entry, 'enclosures') and entry.enclosures:
            for e in entry.enclosures:
                url = e.get('href', '')
                if url and any(ext in url for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
                    return url

        # Try to extract from content HTML
        content = ''
        if hasattr(entry, 'content') and entry.content:
            content = entry.content[0].get('value', '')
        elif hasattr(entry, 'summary'):
            content = entry.summary

        if content:
            # Find first <img> tag
            img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
            if img_match:
                src = img_match.group(1)
                if src.startswith('/'):
                    # Make absolute URL
                    from urllib.parse import urlparse
                    domain = urlparse(entry.get('link', '')).netloc
                    src = f"https://{domain}{src}"
                return src

        return None

    def extract_youtube(self, content: str) -> Optional[str]:
        """Extract YouTube video ID from content."""
        patterns = [
            r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
            r'(?:https?://)?(?:www\.)?youtu\.be/([a-zA-Z0-9_-]+)',
            r'(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]+)',
        ]
        for p in patterns:
            match = re.search(p, content)
            if match:
                return match.group(1)
        return None

    def determine_category(self, source: dict, title: str, content: str) -> str:
        """Determine article category from source and content."""
        if source['category'] == 'papers':
            return 'papers'
        
        # Check for video content
        yt_id = self.extract_youtube(content)
        if yt_id:
            return 'videos'
        
        # Check for research keywords
        research_kw = ['research', 'study', 'paper', 'academic', 'researchers', 'university', 'lab']
        if any(kw in title.lower() for kw in research_kw):
            return 'research'
        
        return source['category'] if source['category'] != 'discussion' else 'news'

    def clean_text(self, text: str, max_len: int = 300) -> str:
        text = re.sub(r'<[^>]+>', '', text)
        text = html.unescape(text)
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'^(Abstract|Summary|Description):\s*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\[&#8230;\]$', '', text)
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
            for entry in feed.entries[:12]:
                title = entry.get('title', '').strip()
                link = entry.get('link', '')
                
                # Get content/summary
                content_html = ''
                if hasattr(entry, 'content') and entry.content:
                    content_html = entry.content[0].get('value', '')
                elif hasattr(entry, 'summary'):
                    content_html = entry.summary

                clean_summary = self.clean_text(content_html, 280)
                published = entry.get('published_parsed') or entry.get('updated_parsed')
                uid = hashlib.md5(f"{title}{link}".encode()).hexdigest()[:10]

                if published:
                    ts = datetime.datetime(*published[:6]).isoformat() + 'Z'
                else:
                    ts = datetime.datetime.utcnow().isoformat() + 'Z'

                # Extract image
                image = self.extract_image(entry)
                if not image:
                    # Try from content HTML again more aggressively
                    img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content_html)
                    if img_match:
                        image = img_match.group(1)

                # Extract YouTube
                youtube_id = self.extract_youtube(content_html or title)

                items.append({
                    "id": uid,
                    "source": source['name'],
                    "icon": source['icon'],
                    "category": self.determine_category(source, title, content_html),
                    "title": title[:150],
                    "content": clean_summary,
                    "url": link,
                    "image": image or f"/images/placeholder-{source['category']}.jpg",
                    "youtube_id": youtube_id,
                    "timestamp": ts,
                })
            log.info(f"✅ {len(items)} items from {source['name']}")
            return items
        except Exception as e:
            log.error(f"❌ Error: {source['name']}: {e}")
            return []

    def run_pulse(self):
        log.info("=" * 60)
        log.info("🧠 NEUROFLUX PULSE ENGINE v3.0")
        log.info(f"⏰ {datetime.datetime.utcnow().isoformat()} UTC")
        log.info("=" * 60)

        all_items = []
        for source in SOURCES:
            items = self.fetch_rss(source)
            for item in items:
                if item['id'] not in self.seen_ids:
                    self.seen_ids.add(item['id'])
                    all_items.append(item)

        all_items.sort(key=lambda x: x['timestamp'], reverse=True)
        all_items = all_items[:100]

        # Add content to feed.json
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        with open(self.output_path, 'w', encoding='utf-8') as f:
            json.dump(all_items, f, indent=2, ensure_ascii=False)

        # Count by category
        cats = {}
        for item in all_items:
            c = item['category']
            cats[c] = cats.get(c, 0) + 1

        log.info(f"✅ Published {len(all_items)} articles")
        for cat, count in sorted(cats.items()):
            log.info(f"   {cat}: {count}")
        return all_items


if __name__ == '__main__':
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent.parent / '.env.local'
    if env_path.exists():
        load_dotenv(str(env_path))
    NeuroFluxPulse().run_pulse()
