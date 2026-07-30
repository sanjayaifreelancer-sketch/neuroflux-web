'use client';

interface ArticleCardProps {
  id: string;
  source: string;
  icon: string;
  category: string;
  title: string;
  content: string;
  url: string;
  image?: string;
  youtube_id?: string;
  timestamp: string;
}

export default function ArticleCard({ article }: { article: ArticleCardProps }) {
  const date = new Date(article.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour12: false });
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isVideo = !!article.youtube_id;

  return (
    <a
      href={isVideo ? `/videos` : `/news/${article.id}`}
      className="group block bg-black/60 border border-gray-800 hover:border-cyan-500/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.08)] backdrop-blur-sm"
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-900 overflow-hidden">
        {isVideo ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-cyan-900/50">
            <div className="text-center">
              <div className="text-4xl mb-2">▶</div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-wider">Video</div>
            </div>
          </div>
        ) : article.image && !article.image.includes('placeholder') ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-3xl opacity-30">📄</div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl opacity-30">{article.icon}</span>
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] uppercase tracking-wider rounded bg-black/70 text-cyan-400 border border-cyan-500/30">
          {article.category}
        </span>

        {/* Source badge */}
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] uppercase tracking-wider rounded bg-black/70 text-pink-400 border border-pink-500/20">
          {article.source}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2 font-mono">
          <span>{dateStr}</span>
          <span>•</span>
          <span>{timeStr}</span>
          <span>•</span>
          <span className="text-cyan-600">{article.icon}</span>
        </div>
        <h3 className="text-sm md:text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2">
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
          {article.content}
        </p>
      </div>
    </a>
  );
}
