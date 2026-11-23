"use client";

import { useState } from "react";
import { Play } from "lucide-react";

// Shows the video's thumbnail and loads YouTube's player (several MB of scripts) only when the
// reader presses play. Embedding the player directly slowed every tutorial page down.
export function YouTubeEmbed({ videoId, title = "YouTube video" }: { videoId: string; title?: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-none h-full w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group relative h-full w-full cursor-pointer"
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-red-600 shadow-lg transition-transform group-hover:scale-110">
        <Play className="h-8 w-8 fill-white text-white" />
      </span>
    </button>
  );
}
