'use client';

export default function AdBanner({ format = 'banner' }: { format?: 'banner' | 'rectangle' | 'leaderboard' }) {
  // Placeholder for AdSense — insert your publisher ID here
  // When ready, uncomment the <ins> tag and add your AdSense client ID
  return (
    <div className="w-full flex justify-center my-6">
      <div className="bg-black/40 border border-cyan-900/30 rounded-lg p-4 text-center text-[10px] text-gray-600 uppercase tracking-widest">
        <div className="text-[8px] mb-1">— Sponsored —</div>
        <div className="w-full h-[90px] flex items-center justify-center border border-dashed border-gray-800 rounded">
          <span className="text-gray-700 text-xs">Ad Space</span>
        </div>
        {/*
        Replace with your AdSense code:
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format={format === 'leaderboard' ? 'auto' : 'rectangle'}
        />
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        */}
      </div>
    </div>
  );
}
