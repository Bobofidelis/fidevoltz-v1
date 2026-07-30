"use client";

import { cn } from "@/lib/utils";
import { Copy, Check, Package, ShoppingCart, Info, AlertTriangle, Lightbulb, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { AddToCartBOMButton } from "./AddToCartBOMButton";

function parseBasicMarkdown(text: string) {
  if (!text) return "";
  return text
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-slate-900">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold mt-10 mb-6 text-slate-900">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
    .replace(/\n/g, '<br/>');
}

interface Block {
  id: string;
  type: string;
  content: any;
}

interface BlockRendererProps {
  blocks: Block[];
  slug?: string;
}

export function BlockRenderer({ blocks, slug }: BlockRendererProps) {
  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  return (
    <div className="space-y-8 text-lg leading-relaxed text-slate-700">
      {blocks.map((block) => (
        <div key={block.id}>
          {renderBlock(block, slug)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: Block, slug?: string) {
  switch (block.type) {
    case "text":
      return (
        <div 
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: block.content.toString().replace(/\n/g, "<br/>") }} 
        />
      );

    case "markdown":
      return (
        <div 
          className="prose prose-slate max-w-none space-y-2 text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseBasicMarkdown(block.content) }} 
        />
      );

    case "alert":
      const { type, title, text } = block.content;
      const alertStyles = {
        info: "bg-blue-50 border-blue-200 text-blue-900",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
        tip: "bg-emerald-50 border-emerald-200 text-emerald-900",
        danger: "bg-red-50 border-red-200 text-red-900"
      };
      
      const Icon = type === "warning" ? AlertTriangle : type === "tip" ? Lightbulb : type === "danger" ? ShieldAlert : Info;
      const IconColor = type === "warning" ? "text-yellow-600" : type === "tip" ? "text-emerald-600" : type === "danger" ? "text-red-600" : "text-blue-600";

      return (
        <div className={cn("my-8 p-6 rounded-xl border flex gap-4 items-start shadow-sm", alertStyles[type as keyof typeof alertStyles] || alertStyles.info)}>
          <div className="mt-1">
            <Icon className={cn("w-6 h-6", IconColor)} />
          </div>
          <div className="flex-1 space-y-2">
            {title && <h4 className="font-bold text-lg">{title}</h4>}
            <div dangerouslySetInnerHTML={{ __html: text ? text.replace(/\n/g, "<br/>") : "" }} />
          </div>
        </div>
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
    
    case "image": {
      const urls = block.content.urls || (block.content.url ? [block.content.url] : []);
      if (urls.length === 0) return null;

      const sizeClasses: Record<string, string> = {
        xs: "max-w-xs mx-auto",
        small: "max-w-sm mx-auto",
        default: "max-w-2xl mx-auto",
        large: "max-w-4xl mx-auto",
        xl: "max-w-6xl mx-auto",
        full: "w-full",
      };
      const sizeClass = sizeClasses[block.content.size as string] || "w-full";

      const aspectRatioClasses: Record<string, string> = {
        square: "aspect-square",
        portrait: "aspect-[3/4]",
        landscape: "aspect-[4/3]",
        wide: "aspect-video",
        auto: "h-auto",
      };
      const imgClass = aspectRatioClasses[(block.content.aspectRatio as string) || "auto"] || "h-auto";

      const cols = (block.content.columns || 3) as 2 | 3 | 4;
      const gridColClasses: Record<2|3|4, string> = { 2: "grid-cols-2", 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" };
      const layout = block.content.layout || "single";

      const containerClass =
        layout === "grid" && urls.length > 1
          ? `grid ${gridColClasses[cols]} gap-3 md:gap-4`
          : layout === "masonry" && urls.length > 1
          ? `columns-2 ${cols >= 3 ? "md:columns-3" : ""} ${cols >= 4 ? "lg:columns-4" : ""} gap-3`
          : "space-y-4";

      return (
        <figure className={`my-8 ${sizeClass}`}>
          <div className={containerClass}>
            {urls.map((u: string, idx: number) => (
              <img
                key={idx}
                src={u}
                alt={block.content.alt || `Project Image ${idx + 1}`}
                className={`w-full object-cover rounded-xl shadow-md border border-slate-100 ${imgClass} ${layout === "masonry" ? "mb-3 break-inside-avoid" : ""}`}
              />
            ))}
          </div>
          {block.content.alt && (
            <figcaption className="text-center text-sm text-slate-500 mt-4 italic">
              {block.content.alt}
            </figcaption>
          )}
        </figure>
      );
    }
    
    case "video":
      if (!block.content.url) return null;
      
      // Extract Video ID from YouTube URL
      const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      
      const videoId = getYoutubeId(block.content.url);
      
      if (!videoId) {
        // Fallback to native video if not a YouTube URL
        return (
          <div className="aspect-video w-full my-8 rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
            <video src={block.content.url} controls className="w-full h-full object-contain" />
          </div>
        );
      }

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
      
    case "youtube":
      const ytId = block.content.url ? block.content.url.split("v=")[1]?.split("&")[0] || block.content.url.split("youtu.be/")[1] : null;
      if (!ytId) return null;
      return (
        <div className="aspect-video w-full my-8 rounded-xl overflow-hidden shadow-2xl border border-red-500/20 bg-slate-900">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${ytId}`}
            title="YouTube video tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-none"
          />
        </div>
      );
    
    case "code":
      return <CodeBlock language={block.content.language} code={block.content.code} />;
      
    case "project_kit":
      return (
        <div className="my-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-xl border border-blue-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 text-blue-500/10 group-hover:text-blue-500/20 transition-colors duration-500">
            <Package className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-shrink-0 bg-blue-600 rounded-2xl p-4 shadow-lg shadow-blue-900/50">
              <Package className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {block.content.title || "📦 THE FIDEVOLTZ PROJECT KIT"}
              </h3>
              <p className="text-blue-100/80 leading-relaxed text-lg">
                {block.content.description || "Skip the hassle of hunting for compatible parts and dealing with dead components. Get everything you need to build this exact project in one box."}
              </p>
              
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-300">
                  <strong className="text-white">Includes:</strong> {block.content.includes || "All necessary components pre-tested."}
                </p>
              </div>
              
              <p className="text-sm font-medium text-blue-300 flex items-center gap-2">
                <Check className="w-4 h-4" /> {block.content.guarantee || "Guaranteed to work with the code below."}
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-8 pt-8 border-t border-slate-700/50 flex justify-center md:justify-end">
            <Link href={block.content.productLink || "#"}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 shadow-lg shadow-blue-900/50 h-14 text-lg w-full md:w-auto">
                <ShoppingCart className="mr-3 w-5 h-5" />
                {block.content.buttonText || "Buy the Complete Kit"}
              </Button>
            </Link>
          </div>
        </div>
      );

    case "bom":
      return (
        <div className="my-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            {block.content.title || "Hardware Requirements & Bill of Materials"}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-900">Component</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Quantity</th>
                  <th className="px-6 py-4 font-semibold text-slate-900">Specs / Notes</th>
                  <th className="px-6 py-4 font-semibold text-slate-900 text-right">FideVoltz Store</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {block.content.items && Array.isArray(block.content.items) ? (
                  block.content.items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {item.quantity ? (
                          <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-xs font-bold">
                            {item.quantity}{/^\d+$/.test(String(item.quantity).trim()) ? 'x' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Optional</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.specs}</td>
                      <td className="px-6 py-4 text-right">
                        {item.productLink ? (
                          <AddToCartBOMButton item={item} />
                        ) : (
                          <span className="text-slate-400 text-xs uppercase tracking-wider">Supplied</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No components listed.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "ad":
      if (!slug) return null; // We need the page slug to fetch targeted ads
      return (
        <div className="my-8">
          <AdSlot page={`projects/${slug}`} zone={block.content.zone || "CONTENT_MIDDLE"} className="w-full" />
        </div>
      );

    case "campaign_data":
      // Completely hide this block on the public frontend. It's only for the dashboard.
      return null;

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
