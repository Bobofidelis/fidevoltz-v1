"use client";

import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Block {
  id: string;
  type: string;
  content: any;
}

interface BlockRendererProps {
  blocks: Block[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  return (
    <div className="space-y-8 text-lg leading-relaxed text-slate-700">
      {blocks.map((block) => (
        <div key={block.id}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: Block) {
  switch (block.type) {
    case "text":
      return (
        <div 
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: block.content.toString().replace(/\n/g, "<br/>") }} 
        />
      );

    case "heading":
      const Tag = (block.content.level || "h2") as "h2" | "h3" | "h4";
      return (
        <Tag className={cn(
          "font-bold text-slate-900 mt-8 mb-4",
          block.content.level === "h2" ? "text-3xl" : block.content.level === "h3" ? "text-2xl" : "text-xl"
        )}>
          {block.content.text}
        </Tag>
      );
    
    case "image":
      return (
        <figure className="my-8">
          <img 
            src={block.content.url} 
            alt={block.content.alt || "Project Image"} 
            className="w-full rounded-xl shadow-lg border border-slate-200"
          />
          {block.content.alt && (
            <figcaption className="text-center text-sm text-slate-500 mt-2 italic">
              {block.content.alt}
            </figcaption>
          )}
        </figure>
      );
    
    case "video":
      // Extract Video ID from YouTube URL
      const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      
      const videoId = getYoutubeId(block.content.url);
      
      if (!videoId) return null;

      return (
        <div className="aspect-video w-full my-8 rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-none"
          />
        </div>
      );
    
    case "code":
      return <CodeBlock language={block.content.language} code={block.content.code} />;
      
    default:
      return null;
  }
}

function CodeBlock({ language, code }: { language: string, code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 relative group rounded-lg overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-slate-700">
        <span className="text-xs font-semibold text-slate-400 uppercase">{language}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-slate-400 hover:text-white"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}
