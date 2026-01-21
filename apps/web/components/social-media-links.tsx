"use client";

import { usePublicSiteSettings } from "@/lib/hooks/use-public-settings";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle } from "lucide-react";
import Link from "next/link";

interface SocialMediaLinksProps {
  className?: string;
  iconSize?: number;
  showLabels?: boolean;
}

export function SocialMediaLinks({ className = "", iconSize = 20, showLabels = false }: SocialMediaLinksProps) {
  const { data: siteSettings } = usePublicSiteSettings('social');

  if (!siteSettings?.grouped?.social) {
    return null;
  }

  const social = siteSettings.grouped.social;

  const platforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: social['social.facebook'],
      show: social['social.show.facebook'],
      color: '#1877F2'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: social['social.twitter'],
      show: social['social.show.twitter'],
      color: '#1DA1F2'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: social['social.instagram'],
      show: social['social.show.instagram'],
      color: '#E4405F'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: social['social.linkedin'],
      show: social['social.show.linkedin'],
      color: '#0077B5'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: social['social.youtube'],
      show: social['social.show.youtube'],
      color: '#FF0000'
    },
    {
      name: 'TikTok',
      icon: () => (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      url: social['social.tiktok'],
      show: social['social.show.tiktok'],
      color: '#000000'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: social['social.whatsapp'],
      show: social['social.show.whatsapp'],
      color: '#25D366'
    },
    {
      name: 'Reddit',
      icon: () => (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ),
      url: social['social.reddit'],
      show: social['social.show.reddit'],
      color: '#FF4500'
    },
  ];

  const visiblePlatforms = platforms.filter(platform => platform.show && platform.url);

  if (visiblePlatforms.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {visiblePlatforms.map((platform) => {
        const Icon = platform.icon;
        return (
          <Link
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm ring-1 ring-slate-200 hover:ring-2 hover:ring-opacity-100 transition-all duration-300 transform hover:scale-110"
            style={{ 
                // Apply a subtle brand color ring on hover
                '--hover-ring-color': platform.color 
            } as any}
            aria-label={platform.name}
          >
            <Icon size={iconSize} style={{ color: platform.color }} className="transition-transform group-hover:scale-110" />
            {showLabels && <span className="text-xs font-semibold text-slate-700 ml-2">{platform.name}</span>}
          </Link>
        );
      })}
    </div>
  );
}
