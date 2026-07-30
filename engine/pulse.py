#!/usr/bin/env python3
"""
NeuroFlux PULSE ENGINE v4.0 — PERPETUAL APPEND-ONLY
Never deletes. Never overwrites. Only adds new unique articles.
Runs every 60 minutes via GitHub Actions or manually.
"""

import os, re, json, hashlib, datetime, logging, html, time
from typing import Optional, List, Dict
from pathlib import Path
from urllib.parse import urlparse

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')
log = logging.getLogger('neuroflux')

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "public"
FEED_PATH = PUBLIC_DIR / "feed.json"
SEEN_URLS_PATH = PUBLIC_DIR / ".seen_urls.json"

SOURCES = [
    # === AI NEWS SITES ===
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
        "name": "Wired AI",
        "url": "https://www.wired.com/feed/tag/ai/latest/rss",
        "category": "news",
        "icon": "⚡"
    },
    {
        "name": "MarkTechPost",
        "url": "https://www.marktechpost.com/feed/",
        "category": "news",
        "icon": "📡"
    },
    {
        "name": "Analytics Vidhya",
        "url": "https://www.analyticsvidhya.com/blog/feed/",
        "category": "news",
        "icon": "📘"
    },
    {
        "name": "KDnuggets",
        "url": "https://www.kdnuggets.com/feed",
        "category": "news",
        "icon": "💡"
    },
    {
        "name": "Synced",
        "url": "https://syncedreview.com/feed/",
        "category": "research",
        "icon": "🔬"
    },
    # === GOOGLE NEWS AGGREGATE ===
    {
        "name": "Google News AI",
        "url": "https://news.google.com/rss/search?q=artificial+intelligence+AI+machine+learning&hl=en-US&gl=US&ceid=US:en",
        "category": "news",
        "icon": "🌐"
    },
    # === RESEARCH & PAPERS ===
    {
        "name": "ArXiv",
        "url": "https://rss.arxiv.org/rss/cs.AI",
        "category": "papers",
        "icon": "📄"
    },
    {
        "name": "ScienceDaily AI",
        "url": "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml",
        "category": "research",
        "icon": "🔬"
    },
    {
        "name": "Google DeepMind",
        "url": "https://deepmind.google/blog/rss.xml",
        "category": "research",
        "icon": "🧠"
    },
    {
        "name": "IBM Research AI",
        "url": "https://www.ibm.com/thought-leadership/institute-business-value/rss/ai.xml",
        "category": "research",
        "icon": "🏢"
    },
    # === DISCUSSION ===
    {
        "name": "Reddit AI",
        "url": "https://www.reddit.com/r/artificial/.rss",
        "category": "discussion",
        "icon": "💬"
    },
    {
        "name": "HN AI",
        "url": "https://hnrss.org/frontpage?q=AI+OR+machine+learning+OR+neural+OR+LLM+OR+GPT+OR+deep+learning+OR+transformer",
        "category": "discussion",
        "icon": "🔥"
    },
    # === YOUTUBE CHANNELS ===
    {
        "name": "Two Minute Papers",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg",
        "category": "videos",
        "icon": "🎥",
        "is_youtube": True
    },
    {
        "name": "Siraj Raval",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCWN3xxRkmTPmbKwht9FuE5A",
        "category": "videos",
        "icon": "🎥",
        "is_youtube": True
    },
]


class PerpetualPulseEngine:
    def __init__(self):
        self.existing: List[Dict] = []
        self.seen_urls: set = set()
        self.load_existing()

    def load_existing(self):
        """Load existing feed.json and seen URLs — NEVER DELETE. Only append."""
        if FEED_PATH.exists():
            try:
                with open(FEED_PATH, 'r', encoding='utf-8') as f:
                    self.existing = json.load(f)
                log.info(f"📂 Loaded {len(self.existing)} existing articles")
                for a in self.existing:
                    if a.get('url'):
                        self.seen_urls.add(a['url'])
                    if a.get('id'):
                        self.seen_urls.add(a['id'])
            except Exception as e:
                log.warning(f"⚠️ Could not load feed.json: {e}")
                self.existing = []
        else:
            log.info("📂 No existing feed.json — starting fresh")
            self.existing = []
        
        # Load persistent seen URLs cache
        if SEEN_URLS_PATH.exists():
            try:
                with open(SEEN_URLS_PATH, 'r') as f:
                    cached = json.load(f)
                    self.seen_urls.update(cached)
                log.info(f"📂 Loaded {len(cached)} cached seen URLs")
            except:
                pass

    def save_seen_urls(self):
        """Persist seen URLs to avoid re-processing on next run."""
        seen_list = list(self.seen_urls)
        with open(SEEN_URLS_PATH, 'w') as f:
            json.dump(seen_list, f)

    def extract_image(self, entry) -> Optional[str]:
        """Extract the best image URL from an RSS entry."""
        # Try media:content
        if hasattr(entry, 'media_content') and entry.media_content:
            for m in entry.media_content:
                url = m.get('url', '')
                if url and not url.endswith('.svg') and len(url) > 20:
                    return url
        # Try media:thumbnail
        if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
            return entry.media_thumbnail[0].get('url')
        # Try enclosures
        if hasattr(entry, 'enclosures') and entry.enclosures:
            for e in entry.enclosures:
                url = e.get('href', '')
                if url and any(ext in url for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    return url
        # Extract from HTML content
        content = self.get_content_html(entry)
        if content:
            img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
            if img_match:
                src = img_match.group(1)
                if src.startswith('/'):
                    domain = urlparse(entry.get('link', '')).netloc
                    src = f"https://{domain}{src}"
                return src
        return None

    def get_content_html(self, entry) -> str:
        if hasattr(entry, 'content') and entry.content:
            return entry.content[0].get('value', '')
        if hasattr(entry, 'summary'):
            return entry.summary
        return ''

    def extract_youtube(self, entry, source: dict) -> Optional[str]:
        """Extract YouTube video ID."""
        # For YouTube RSS feeds, the link contains the video ID
        link = entry.get('link', '')
        yt_match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]+)', link)
        if yt_match:
            return yt_match.group(1)
        # Also check content
        content = self.get_content_html(entry) + entry.get('title', '')
        yt_match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]+)', content)
        if yt_match:
            return yt_match.group(1)
        return None

    def clean_text(self, text: str, max_len: int = 300) -> str:
        text = re.sub(r'<[^>]+>', '', text)
        text = html.unescape(text)
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'\[&#8230;\]$', '', text)
        text = re.sub(r'^(Abstract|Summary|Description):\s*', '', text, flags=re.IGNORECASE)
        if len(text) > max_len:
            text = text[:max_len-3] + '...'
        return text

    def determine_category(self, source: dict, title: str, content: str, link: str) -> str:
        """Smart category assignment."""
        if source.get('is_youtube'):
            return 'videos'
        if source['category'] == 'papers':
            return 'papers'
        # Check for YouTube link
        if re.search(r'(youtube\.com|youtu\.be)', content + link):
            return 'videos'
        # Check for research keywords
        research_kw = ['research', 'study', 'paper', 'academic', 'university', 'nature', 'science']
        if any(kw in title.lower() for kw in research_kw):
            return 'research'
        return source['category'] if source['category'] not in ('discussion',) else 'news'

    def is_duplicate(self, url: str, title: str) -> bool:
        """Check if we've seen this article before."""
        if url and url in self.seen_urls:
            return True
        title_hash = hashlib.md5(title.encode()).hexdigest()
        if title_hash in self.seen_urls:
            return True
        return False

    def mark_seen(self, url: str, title: str):
        """Mark URL and title as seen."""
        if url:
            self.seen_urls.add(url)
        self.seen_urls.add(hashlib.md5(title.encode()).hexdigest())

    def process_youtube_entry(self, entry, source: dict) -> Optional[Dict]:
        """Process YouTube RSS entry specially."""
        try:
            title = entry.get('title', '').strip()
            link = entry.get('link', '')
            if not title or not link:
                return None
            if self.is_duplicate(link, title):
                return None

            # YouTube RSS has different structure
            yt_id = None
            yt_match = re.search(r'video_id=([a-zA-Z0-9_-]+)', link)
            if yt_match:
                yt_id = yt_match.group(1)
            if not yt_id:
                yt_match = re.search(r'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)', link)
                if yt_match:
                    yt_id = yt_match.group(1)
            if not yt_id:
                yt_match = re.search(r'youtu\.be/([a-zA-Z0-9_-]+)', link)
                if yt_match:
                    yt_id = yt_match.group(1)
            if not yt_id:
                return None

            # Get thumbnail
            image = f"https://img.youtube.com/vi/{yt_id}/maxresdefault.jpg"
            summary = entry.get('description', '') or entry.get('summary', '')
            clean = self.clean_text(summary, 250)
            published = entry.get('published_parsed') or entry.get('updated_parsed')
            ts = datetime.datetime(*published[:6]).isoformat() + 'Z' if published else datetime.datetime.utcnow().isoformat() + 'Z'
            uid = hashlib.md5(f"{title}{link}".encode()).hexdigest()[:10]

            item = {
                "id": uid,
                "source": source['name'],
                "icon": source['icon'],
                "category": "videos",
                "title": title[:150],
                "content": clean,
                "url": link,
                "image": image,
                "youtube_id": yt_id,
                "timestamp": ts,
            }
            self.mark_seen(link, title)
            return item
        except Exception as e:
            log.error(f"❌ YouTube error: {e}")
            return None

    def process_entry(self, entry, source: dict) -> Optional[Dict]:
        """Process a standard RSS entry."""
        try:
            title = entry.get('title', '').strip()
            link = entry.get('link', '')
            if not title or not link:
                return None
            if self.is_duplicate(link, title):
                return None

            content_html = self.get_content_html(entry)
            clean_summary = self.clean_text(content_html, 250)
            published = entry.get('published_parsed') or entry.get('updated_parsed')
            ts = datetime.datetime(*published[:6]).isoformat() + 'Z' if published else datetime.datetime.utcnow().isoformat() + 'Z'
            uid = hashlib.md5(f"{title}{link}".encode()).hexdigest()[:10]

            # Extract image
            image = self.extract_image(entry)
            if not image:
                img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content_html)
                if img_match:
                    image = img_match.group(1)

            # Extract YouTube
            youtube_id = self.extract_youtube(entry, source)

            item = {
                "id": uid,
                "source": source['name'],
                "icon": source['icon'],
                "category": self.determine_category(source, title, content_html, link),
                "title": title[:150],
                "content": clean_summary,
                "url": link,
                "image": image or f"/images/placeholder-{source['category']}.jpg",
                "youtube_id": youtube_id,
                "timestamp": ts,
            }
            self.mark_seen(link, title)
            return item
        except Exception as e:
            log.error(f"❌ Process error: {e}")
            return None

    def fetch_source(self, source: dict) -> int:
        """Fetch RSS from one source. Returns count of NEW articles found."""
        import feedparser
        try:
            log.info(f"📡 {source['icon']} {source['name']}")
            feed = feedparser.parse(source['url'])
            if feed.bozo and not feed.entries:
                log.warning(f"⚠️ Bad feed: {source['name']} — {feed.bozo_exception if hasattr(feed, 'bozo_exception') else 'unknown'}")
                return 0

            new_count = 0
            for entry in feed.entries[:15]:
                if source.get('is_youtube'):
                    item = self.process_youtube_entry(entry, source)
                else:
                    item = self.process_entry(entry, source)
                if item:
                    self.existing.append(item)
                    new_count += 1

            log.info(f"   → +{new_count} new from {source['name']}")
            return new_count
        except Exception as e:
            log.error(f"❌ Fetch error {source['name']}: {e}")
            return 0

    def run_pulse(self) -> int:
        """Run the full pulse. Returns count of new articles."""
        log.info("=" * 65)
        log.info(f"🧠 NEUROFLUX PULSE v4.0 — PERPETUAL APPEND-ONLY")
        log.info(f"⏰ {datetime.datetime.utcnow().isoformat()} UTC")
        log.info(f"📚 Starting with {len(self.existing)} existing articles")
        log.info("=" * 65)

        start_count = len(self.existing)

        for source in SOURCES:
            try:
                self.fetch_source(source)
                self.save_seen_urls()
            except Exception as e:
                log.error(f"❌ Fatal error for {source['name']}: {e}")
                continue

        # Sort by timestamp descending (newest first for display)
        self.existing.sort(key=lambda x: x['timestamp'], reverse=True)

        # Write feed.json — APPEND ONLY, never trim
        PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
        with open(FEED_PATH, 'w', encoding='utf-8') as f:
            json.dump(self.existing, f, indent=2, ensure_ascii=False)

        new_count = len(self.existing) - start_count

        # Count stats
        cats = {}
        sources_active = {}
        for a in self.existing:
            c = a.get('category', 'news')
            cats[c] = cats.get(c, 0) + 1
            s = a.get('source', 'unknown')
            sources_active[s] = sources_active.get(s, 0) + 1

        log.info("=" * 65)
        log.info(f"✅ TOTAL: {len(self.existing)} articles (+{new_count} new this cycle)")
        for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
            log.info(f"   {cat}: {count}")
        log.info("=" * 65)
        log.info(f"📊 Active sources: {len(sources_active)}")
        for src, count in sorted(sources_active.items(), key=lambda x: -x[1])[:5]:
            log.info(f"   {src}: {count} articles")
        log.info("=" * 65)

        return new_count


if __name__ == '__main__':
    from dotenv import load_dotenv
    env_path = BASE_DIR / '.env.local'
    if env_path.exists():
        load_dotenv(str(env_path))
    engine = PerpetualPulseEngine()
    engine.run_pulse()
