#!/usr/bin/env python3
"""
NeuroFlux PULSE ENGINE v5.0 — PERPETUAL + REAL IMAGE BACKFILL
Never deletes. Only adds. Every article gets a REAL image:
  1. RSS media tags (already working)
  2. og:image / twitter:image fetched from the actual article page
  3. Branded cyberpunk SVG card (papers, blocked sites)
Runs hourly via GitHub Actions.
"""

import os, re, json, hashlib, datetime, logging, html, time
from typing import Optional, List, Dict
from pathlib import Path
from urllib.parse import urlparse, quote
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')
log = logging.getLogger('neuroflux')

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "public"
FEED_PATH = PUBLIC_DIR / "feed.json"
SEEN_URLS_PATH = PUBLIC_DIR / ".seen_urls.json"
FALLBACK_DIR = PUBLIC_DIR / "images"
FALLBACK_DIR.mkdir(parents=True, exist_ok=True)

BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

SOURCES = [
    {"name": "AI News", "url": "https://www.artificialintelligence-news.com/feed/", "category": "news", "icon": "📰"},
    {"name": "TechCrunch AI", "url": "https://techcrunch.com/category/artificial-intelligence/feed/", "category": "news", "icon": "🔥"},
    {"name": "VentureBeat AI", "url": "https://venturebeat.com/category/ai/feed/", "category": "news", "icon": "📊"},
    {"name": "Wired AI", "url": "https://www.wired.com/feed/tag/ai/latest/rss", "category": "news", "icon": "⚡"},
    {"name": "The Verge AI", "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "category": "news", "icon": "📰"},
    {"name": "Engadget", "url": "https://www.engadget.com/rss.xml", "category": "news", "icon": "📱", "ai_filter": True},
    {"name": "NVIDIA Blog", "url": "https://blogs.nvidia.com/feed/", "category": "research", "icon": "🟢"},
    {"name": "MarkTechPost", "url": "https://www.marktechpost.com/feed/", "category": "news", "icon": "📡"},
    {"name": "Analytics Vidhya", "url": "https://www.analyticsvidhya.com/blog/feed/", "category": "news", "icon": "📘"},
    {"name": "KDnuggets", "url": "https://www.kdnuggets.com/feed", "category": "news", "icon": "💡"},
    {"name": "Synced", "url": "https://syncedreview.com/feed/", "category": "research", "icon": "🔬"},
    {"name": "ArXiv", "url": "https://rss.arxiv.org/rss/cs.AI", "category": "papers", "icon": "📄"},
    {"name": "ScienceDaily AI", "url": "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml", "category": "research", "icon": "🔬"},
    {"name": "Google DeepMind", "url": "https://deepmind.google/blog/rss.xml", "category": "research", "icon": "🧠"},
    {"name": "HuggingFace Blog", "url": "https://huggingface.co/blog/feed.xml", "category": "research", "icon": "🤗"},
    {"name": "MIT Tech Review", "url": "https://www.technologyreview.com/topic/artificial-intelligence/feed", "category": "research", "icon": "🎓"},
    {"name": "Reddit AI", "url": "https://www.reddit.com/r/artificial/.rss", "category": "discussion", "icon": "💬"},
    {"name": "HN AI", "url": "https://hnrss.org/frontpage?q=AI+OR+machine+learning+OR+neural+OR+LLM+OR+GPT+OR+deep+learning+OR+transformer", "category": "discussion", "icon": "🔥"},
    {"name": "Two Minute Papers", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg", "category": "videos", "icon": "🎥", "is_youtube": True},
    {"name": "Siraj Raval", "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCWN3xxRkmTPmbKwht9FuE5A", "category": "videos", "icon": "🎥", "is_youtube": True},
]


def fetch_og_image(url: str, timeout: int = 8) -> Optional[str]:
    """Fetch a page and extract the real og:image / twitter:image."""
    try:
        r = requests.get(url, headers=BROWSER_HEADERS, timeout=timeout, allow_redirects=True)
        if r.status_code != 200:
            return None
        html_text = r.text
        candidates = []

        # og:image (both attribute orders)
        for m in re.finditer(r'property=["\']og:image["\'][^>]*content=["\']([^"\']+)', html_text):
            candidates.append(m.group(1))
        for m in re.finditer(r'content=["\']([^"\']+)["\'][^>]*property=["\']og:image', html_text):
            candidates.append(m.group(1))
        # twitter:image
        for m in re.finditer(r'name=["\']twitter:image["\'][^>]*content=["\']([^"\']+)', html_text):
            candidates.append(m.group(1))
        for m in re.finditer(r'content=["\']([^"\']+)["\'][^>]*name=["\']twitter:image', html_text):
            candidates.append(m.group(1))

        for c in candidates:
            c = html.unescape(c).strip()
            if not c.startswith('http'):
                if c.startswith('//'):
                    c = 'https:' + c
                else:
                    continue
            c = c.split(' ')[0]
            low = c.lower()
            if any(bad in low for bad in ['logo', 'favicon', 'avatar', 'icon', 'sprite', 'placeholder', 'transparent']):
                continue
            if any(ext in low for ext in ['.svg', '.gif', '.ico']):
                continue
            # Prefer bigger images: og:image often has sizing params; filter tiny 1x1
            return c
        return None
    except Exception:
        return None


def wrap_text(text: str, max_chars: int = 32) -> List[str]:
    """Wrap title into lines for SVG cards."""
    words = text.split()
    lines, cur = [], ''
    for w in words:
        if len(cur) + len(w) + 1 > max_chars:
            if cur:
                lines.append(cur)
            cur = w
        else:
            cur = (cur + ' ' + w).strip()
    if cur:
        lines.append(cur)
    return lines[:3]


def generate_fallback_svg(article: Dict) -> str:
    """Create a branded cyberpunk SVG thumbnail for articles without real images."""
    a_id = article['id']
    cat = article.get('category', 'news')
    source = article.get('source', 'NeuroFlux')
    title = article.get('title', '')[:140]

    # Palette per category
    palettes = {
        'papers': ('#0a0a1a', '#6d28d9', '#22d3ee', 'ARXIV PAPER'),
        'research': ('#050d0a', '#0d9488', '#4ade80', 'RESEARCH'),
        'videos': ('#120510', '#db2777', '#f472b6', 'VIDEO'),
        'discussion': ('#050510', '#7c3aed', '#a78bfa', 'DISCUSSION'),
        'news': ('#050508', '#0ea5e9', '#22d3ee', 'AI NEWS'),
    }
    bg1, accent, accent2, tag = palettes.get(cat, palettes['news'])

    lines = wrap_text(title)
    y_start = 130
    text_els = []
    for i, line in enumerate(lines):
        text_els.append(
            f'<text x="480" y="{y_start + i * 34}" font-family="Orbitron, Arial, sans-serif" '
            f'font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle">{html.escape(line)}</text>'
        )

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{bg1}"/>
      <stop offset="100%" style="stop-color:{accent}22"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:{accent};stop-opacity:0"/>
      <stop offset="50%" style="stop-color:{accent2};stop-opacity:0.9"/>
      <stop offset="100%" style="stop-color:{accent};stop-opacity:0"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#bg)"/>
  <rect x="0" y="0" width="640" height="4" fill="url(#glow)"/>
  <rect x="0" y="356" width="640" height="4" fill="url(#glow)"/>
  <circle cx="60" cy="300" r="120" fill="{accent}" opacity="0.12"/>
  <circle cx="590" cy="60" r="100" fill="{accent2}" opacity="0.10"/>
  <rect x="24" y="24" width="140" height="26" rx="13" fill="{accent}" opacity="0.9"/>
  <text x="94" y="42" font-family="Orbitron, Arial, sans-serif" font-size="12" font-weight="700" fill="#050505" text-anchor="middle" letter-spacing="2">{tag}</text>
  <text x="480" y="52" font-family="Orbitron, Arial, sans-serif" font-size="14" fill="{accent2}" text-anchor="middle" letter-spacing="1">{html.escape(source.upper())}</text>
  {''.join(text_els)}
  <circle cx="320" cy="320" r="6" fill="{accent2}" opacity="0.8"/>
  <text x="320" y="334" font-family="Orbitron, Arial, sans-serif" font-size="9" fill="{accent2}" opacity="0.5" text-anchor="middle" letter-spacing="3">NEUROFLUX</text>
</svg>'''
    return svg


class PerpetualPulseEngine:
    def __init__(self):
        self.existing: List[Dict] = []
        self.seen_urls: set = set()
        self.load_existing()

    def load_existing(self):
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
            self.existing = []
        if SEEN_URLS_PATH.exists():
            try:
                with open(SEEN_URLS_PATH, 'r') as f:
                    self.seen_urls.update(json.load(f))
            except Exception:
                pass

    def save_seen_urls(self):
        with open(SEEN_URLS_PATH, 'w') as f:
            json.dump(list(self.seen_urls), f)

    # ---------- RSS processing (v4 logic) ----------

    def is_generic_image(self, url: str) -> bool:
        """Detect generic icons/banners that aren't real article images."""
        low = url.lower()
        bad_domains = ['lh3.googleusercontent.com', 'googleusercontent.com']
        bad_patterns = ['ai-expo-banner', 'expo-banner', 'newsletter-signup', 'default', 'generic']
        if any(d in low for d in bad_domains):
            return True
        if any(p in low for p in bad_patterns):
            return True
        return False

    def extract_image(self, entry) -> Optional[str]:
        if hasattr(entry, 'media_content') and entry.media_content:
            for m in entry.media_content:
                url = m.get('url', '')
                if url and not url.endswith('.svg') and len(url) > 20 and not self.is_generic_image(url):
                    return url
        if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
            return entry.media_thumbnail[0].get('url')
        if hasattr(entry, 'enclosures') and entry.enclosures:
            for e in entry.enclosures:
                url = e.get('href', '')
                if url and any(ext in url for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    return url
        content = self.get_content_html(entry)
        if content:
            # Skip ad banners (small width/height)
            img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content)
            if img_match:
                src = img_match.group(1)
                width_m = re.search(r'width=["\'](\d+)', img_match.group(0))
                if width_m and int(width_m.group(1)) < 300:
                    return None
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
        link = entry.get('link', '')
        yt_match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([a-zA-Z0-9_-]+)', link)
        if yt_match:
            return yt_match.group(1)
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
        if source.get('is_youtube'):
            return 'videos'
        if source['category'] == 'papers':
            return 'papers'
        if re.search(r'(youtube\.com|youtu\.be)', content + link):
            return 'videos'
        research_kw = ['research', 'study', 'paper', 'academic', 'university', 'nature', 'science']
        if any(kw in title.lower() for kw in research_kw):
            return 'research'
        return source['category'] if source['category'] != 'discussion' else 'news'

    def is_duplicate(self, url: str, title: str) -> bool:
        if url and url in self.seen_urls:
            return True
        title_hash = hashlib.md5(title.encode()).hexdigest()
        if title_hash in self.seen_urls:
            return True
        return False

    def mark_seen(self, url: str, title: str):
        if url:
            self.seen_urls.add(url)
        self.seen_urls.add(hashlib.md5(title.encode()).hexdigest())

    def resolve_google_news_url(self, url: str) -> str:
        """Unwrap news.google.com redirect to the real article URL."""
        if 'news.google.com' not in url:
            return url
        try:
            r = requests.head(url, headers=BROWSER_HEADERS, timeout=8, allow_redirects=True)
            return r.url or url
        except Exception:
            return url

    def process_youtube_entry(self, entry, source: dict) -> Optional[Dict]:
        try:
            title = entry.get('title', '').strip()
            link = entry.get('link', '')
            if not title or not link:
                return None
            if self.is_duplicate(link, title):
                return None
            yt_id = None
            for pat in [r'video_id=([a-zA-Z0-9_-]+)', r'youtube\.com/watch\?v=([a-zA-Z0-9_-]+)', r'youtu\.be/([a-zA-Z0-9_-]+)']:
                m = re.search(pat, link)
                if m:
                    yt_id = m.group(1)
                    break
            if not yt_id:
                return None
            summary = entry.get('description', '') or entry.get('summary', '')
            clean = self.clean_text(summary, 250)
            published = entry.get('published_parsed') or entry.get('updated_parsed')
            ts = datetime.datetime(*published[:6]).isoformat() + 'Z' if published else datetime.datetime.utcnow().isoformat() + 'Z'
            uid = hashlib.md5(f"{title}{link}".encode()).hexdigest()[:10]
            item = {
                "id": uid, "source": source['name'], "icon": source['icon'],
                "category": "videos", "title": title[:150], "content": clean,
                "url": link, "image": f"https://img.youtube.com/vi/{yt_id}/maxresdefault.jpg",
                "youtube_id": yt_id, "timestamp": ts,
            }
            self.mark_seen(link, title)
            return item
        except Exception as e:
            log.error(f"❌ YouTube error: {e}")
            return None

    def is_ai_relevant(self, title: str, content: str = '') -> bool:
        """Filter for AI-related content (used on general tech feeds)."""
        text = f"{title} {content}".lower()
        keywords = [
            'ai', 'artificial intelligence', 'machine learning', 'deep learning',
            'neural', 'llm', 'gpt', 'chatbot', 'openai', 'anthropic', 'gemini',
            'copilot', 'transformer', 'diffusion', 'model', 'agent', 'nvidia',
            'gpu', 'robotics', 'computer vision', 'nlp', 'hugging face',
        ]
        return any(k in text for k in keywords)

    def process_entry(self, entry, source: dict) -> Optional[Dict]:
        try:
            title = entry.get('title', '').strip()
            link = entry.get('link', '')
            if not title or not link:
                return None
            if self.is_duplicate(link, title):
                return None
            content_html = self.get_content_html(entry)
            # AI relevance filter for general feeds
            if source.get('ai_filter') and not self.is_ai_relevant(title, content_html):
                return None
            clean_summary = self.clean_text(content_html, 250)
            published = entry.get('published_parsed') or entry.get('updated_parsed')
            ts = datetime.datetime(*published[:6]).isoformat() + 'Z' if published else datetime.datetime.utcnow().isoformat() + 'Z'
            uid = hashlib.md5(f"{title}{link}".encode()).hexdigest()[:10]

            image = self.extract_image(entry)
            youtube_id = self.extract_youtube(entry, source)

            item = {
                "id": uid, "source": source['name'], "icon": source['icon'],
                "category": self.determine_category(source, title, content_html, link),
                "title": title[:150], "content": clean_summary,
                "url": link, "image": image, "youtube_id": youtube_id, "timestamp": ts,
            }
            self.mark_seen(link, title)
            return item
        except Exception as e:
            log.error(f"❌ Process error: {e}")
            return None

    def fetch_source(self, source: dict) -> int:
        import feedparser
        try:
            log.info(f"📡 {source['icon']} {source['name']}")
            feed = feedparser.parse(source['url'])
            if feed.bozo and not feed.entries:
                log.warning(f"⚠️ Bad feed: {source['name']}")
                return 0
            new_count = 0
            for entry in feed.entries[:15]:
                item = self.process_youtube_entry(entry, source) if source.get('is_youtube') else self.process_entry(entry, source)
                if item:
                    self.existing.append(item)
                    new_count += 1
            if new_count:
                log.info(f"   → +{new_count} new from {source['name']}")
            return new_count
        except Exception as e:
            log.error(f"❌ Fetch error {source['name']}: {e}")
            return 0

    # ---------- v5: REAL IMAGE BACKFILL ----------

    def cleanup_generic_images(self):
        """Replace images shared by 3+ articles (generic icons/banners) with real og:images."""
        from collections import Counter
        img_counts = Counter(a.get('image', '') for a in self.existing if a.get('image'))
        shared = {img for img, n in img_counts.items() if n >= 3 and 'fallback' not in img}
        if not shared:
            return 0

        affected = [a for a in self.existing if a.get('image') in shared]
        log.info(f"🧹 Found {len(affected)} articles with generic/shared images — fetching real ones...")

        def refetch(article):
            if 'news.google.com' in article.get('url', ''):
                real = self.resolve_google_news_url(article['url'])
                if real and real != article['url']:
                    article['url'] = real
                    self.seen_urls.add(real)
            img = fetch_og_image(article.get('url', ''))
            return article, img

        fixed = 0
        with ThreadPoolExecutor(max_workers=10) as ex:
            futures = [ex.submit(refetch, a) for a in affected]
            for fut in as_completed(futures):
                article, img = fut.result()
                if img:
                    article['image'] = img
                    fixed += 1

        # Generate branded fallbacks for those still generic
        for a in affected:
            if not a.get('image') or a['image'] in shared:
                try:
                    svg = generate_fallback_svg(a)
                    fname = f"fallback-{a['id']}.svg"
                    (FALLBACK_DIR / fname).write_text(svg, encoding='utf-8')
                    a['image'] = f"/images/{fname}"
                    a['fallback'] = True
                except Exception as e:
                    log.error(f"❌ SVG error: {e}")

        log.info(f"🧹 Replaced {fixed} generic images with real article images")
        return fixed

    def backfill_images(self):
        """Fetch real og:images for every article missing one. Never touches existing images."""
        missing = [
            a for a in self.existing
            if not a.get('image') or 'placeholder' in a.get('image', '')
        ]
        if not missing:
            log.info("🖼️ All articles already have images")
            return

        log.info(f"🖼️ Backfilling real images for {len(missing)} articles...")

        def try_fetch(article):
            # Resolve Google News redirects to real URLs first
            if 'news.google.com' in article.get('url', ''):
                real = self.resolve_google_news_url(article['url'])
                if real and real != article['url']:
                    article['url'] = real
                    self.seen_urls.add(real)
            img = fetch_og_image(article.get('url', ''))
            return article, img

        done = 0
        with ThreadPoolExecutor(max_workers=10) as ex:
            futures = [ex.submit(try_fetch, a) for a in missing]
            for fut in as_completed(futures):
                article, img = fut.result()
                if img:
                    article['image'] = img
                done += 1
                if done % 10 == 0:
                    log.info(f"   ...{done}/{len(missing)}")

        # Generate branded SVG fallbacks for what's still missing
        still_missing = [a for a in missing if not a.get('image') or 'placeholder' in a.get('image', '')]
        for a in still_missing:
            try:
                svg = generate_fallback_svg(a)
                fname = f"fallback-{a['id']}.svg"
                (FALLBACK_DIR / fname).write_text(svg, encoding='utf-8')
                a['image'] = f"/images/{fname}"
                a['fallback'] = True
            except Exception as e:
                log.error(f"❌ SVG fallback error: {e}")

        with_img = sum(1 for a in self.existing if a.get('image') and 'placeholder' not in a['image'])
        log.info(f"🖼️ Image coverage: {with_img}/{len(self.existing)} ({100*with_img//max(1,len(self.existing))}%)")

    # ---------- Main ----------

    def run_pulse(self) -> int:
        log.info("=" * 65)
        log.info("🧠 NEUROFLUX PULSE v5.0 — PERPETUAL + REAL IMAGES")
        log.info(f"⏰ {datetime.datetime.utcnow().isoformat()} UTC")
        log.info(f"📚 Starting with {len(self.existing)} existing articles")
        log.info("=" * 65)

        start_count = len(self.existing)

        for source in SOURCES:
            try:
                self.fetch_source(source)
                self.save_seen_urls()
            except Exception as e:
                log.error(f"❌ Fatal for {source['name']}: {e}")
                continue

        # NEW: backfill real images for anything missing (existing + new)
        self.backfill_images()
        # NEW: replace generic shared icons with real per-article images
        self.cleanup_generic_images()

        self.existing.sort(key=lambda x: x['timestamp'], reverse=True)

        PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
        with open(FEED_PATH, 'w', encoding='utf-8') as f:
            json.dump(self.existing, f, indent=2, ensure_ascii=False)

        new_count = len(self.existing) - start_count
        cats = {}
        for a in self.existing:
            cats[a.get('category', 'news')] = cats.get(a.get('category', 'news'), 0) + 1

        with_img = sum(1 for a in self.existing if a.get('image') and 'placeholder' not in a['image'])
        log.info("=" * 65)
        log.info(f"✅ TOTAL: {len(self.existing)} articles (+{new_count} new)")
        log.info(f"🖼️ Images: {with_img}/{len(self.existing)}")
        for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
            log.info(f"   {cat}: {count}")
        log.info("=" * 65)
        return new_count


if __name__ == '__main__':
    from dotenv import load_dotenv
    env_path = BASE_DIR / '.env.local'
    if env_path.exists():
        load_dotenv(str(env_path))
    engine = PerpetualPulseEngine()
    engine.run_pulse()
