/** Parse a project's stored content (JSON blocks, a JSON string, or legacy HTML) into blocks */
export function parseBlocks(content: unknown): any[] {
  if (Array.isArray(content)) return content;
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [{ id: '1', type: 'text', content }];
    } catch {
      return [{ id: 'legacy-html', type: 'text', content }];
    }
  }
  return content && typeof content === 'object' ? [content] : [];
}

/** About 200 words per minute, counted from what readers actually see */
export function readingMinutes(blocks: any[]) {
  const words = blocks
    .filter((b) => b?.type !== 'campaign_data')
    .map((b) => (typeof b?.content === 'string' ? b.content : JSON.stringify(b?.content ?? '')))
    .join(' ')
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
