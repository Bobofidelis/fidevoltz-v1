// Preset avatar configurations using DiceBear API
export const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'avataaars-neutral',
  'big-ears',
  'big-ears-neutral',
  'bottts',
  'bottts-neutral',
  'croodles',
  'croodles-neutral',
  'fun-emoji',
  'icons',
  'identicon',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'thumbs',
] as const;

export type AvatarStyle = typeof AVATAR_STYLES[number];

export const AVATAR_BACKGROUNDS = [
  'b6e3f4', // Light blue
  'c0aede', // Light purple
  'ffd5dc', // Light pink
  'd1d4f9', // Lavender
  'ffdfbf', // Peach
  'transparent', // No background
] as const;

export interface AvatarOptions {
  style: AvatarStyle;
  seed: string;
  backgroundColor?: string;
  radius?: number;
  size?: number;
}

// Generate preset avatars with variety
export function generatePresetAvatars(seed: string = 'user', count: number = 24): string[] {
  const styles: AvatarStyle[] = [
    'avataaars',
    'adventurer',
    'lorelei',
    'micah',
    'personas',
    'big-ears',
    'bottts',
    'pixel-art',
    'fun-emoji',
    'notionists',
    'open-peeps',
    'thumbs',
  ];
  
  const backgrounds = AVATAR_BACKGROUNDS.slice(0, -1); // Exclude transparent
  const avatars: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const style = styles[i % styles.length];
    const bg = backgrounds[i % backgrounds.length];
    const seedVariation = `${seed}-${i}`;
    avatars.push(generateAvatar({ 
      style, 
      seed: seedVariation, 
      backgroundColor: bg 
    }));
  }
  
  return avatars;
}

// Generate single avatar with options
export function generateAvatar(options: AvatarOptions): string {
  const { style, seed, backgroundColor, radius = 50, size = 200 } = options;
  const params = new URLSearchParams({
    seed,
    size: size.toString(),
    radius: radius.toString(),
    ...(backgroundColor && backgroundColor !== 'transparent' && { backgroundColor }),
  });
  
  return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`;
}

// Generate random avatar
export function generateRandomAvatar(): string {
  const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const randomSeed = Math.random().toString(36).substring(7);
  const randomBg = AVATAR_BACKGROUNDS[Math.floor(Math.random() * AVATAR_BACKGROUNDS.length)];
  
  return generateAvatar({
    style: randomStyle,
    seed: randomSeed,
    backgroundColor: randomBg,
  });
}

// Validate image URL
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Validate image file (base64)
export function isValidBase64Image(base64: string): boolean {
  const regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
  return regex.test(base64);
}
