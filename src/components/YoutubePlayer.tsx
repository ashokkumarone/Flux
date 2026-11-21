import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface YoutubePlayerProps {
  videoId: string;
  appMode: 'video' | 'audio';
  title: string;
  isPlaying?: boolean;
}

export default function YoutubePlayer({ videoId, appMode, title, isPlaying = true }: YoutubePlayerProps) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset loading whenever track changes
  useEffect(() => {
    setLoading(true);
  }, [videoId]);

  // Sync play/pause commands to iframe via YouTube postMessage API
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? 'playVideo' : 'pauseVideo';
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: command, args: [] }),
          '*'
        );
      } catch (err) {
        // ignore cross-origin postMessage errors
      }
    }
  }, [isPlaying]);

  // Clean embed URL with JS API enabled for pause/play control
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=0&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1&playsinline=1&iv_load_policy=3`;

  return (
    <div
      className={`relative w-full ${
        appMode === 'video'
          ? 'aspect-video rounded-2xl overflow-hidden bg-black border border-[#272727] shadow-2xl'
          : 'fixed bottom-1 right-1 w-1 h-1 opacity-5 pointer-events-none z-[-1] overflow-hidden'
      }`}
    >
      {appMode === 'video' && loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] text-white z-10">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-2" />
          <p className="text-xs text-[#888] font-medium tracking-wide">Syncing stream...</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        key={videoId}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setLoading(false)}
        className="w-full h-full"
      ></iframe>
    </div>
  );
}
