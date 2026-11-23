// Ask the image CDN for a right-sized, compressed, modern-format (WebP/AVIF) version of an image
// instead of the full-size original. Unknown hosts are returned unchanged.
export function optimizedImage(url: string | null | undefined, width: number): string {
  if (!url) return '';
  try {
    // Cloudinary: https://res.cloudinary.com/<cloud>/image/upload/<existing transforms?>/v123/file.jpg
    if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
      const [base, rest] = url.split('/image/upload/');
      if (/^(f_auto|q_auto|w_\d)/.test(rest)) return url; // already transformed
      return `${base}/image/upload/f_auto,q_auto,c_limit,w_${width}/${rest}`;
    }
    // Unsplash supports the same idea through query parameters
    if (url.includes('images.unsplash.com')) {
      const u = new URL(url);
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', '70');
      return u.toString();
    }
  } catch {
    // fall through to the original URL
  }
  return url;
}

/** srcset for a responsive <img>, so phones download a phone-sized file */
export function imageSrcSet(url: string | null | undefined, widths: number[]): string | undefined {
  if (!url) return undefined;
  const sets = widths.map((w) => `${optimizedImage(url, w)} ${w}w`);
  // only useful when the CDN actually resizes (unknown hosts return the same URL for every width)
  return new Set(sets.map((s) => s.split(' ')[0])).size > 1 ? sets.join(', ') : undefined;
}
