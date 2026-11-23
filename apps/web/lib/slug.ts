/** URL-safe slug: "Power Supply" -> "power-supply", "Raspberry Pi" -> "raspberry-pi" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/** Store category page address (uses the category's own slug when one was set in the dashboard) */
export function categoryPath(category: { name: string; slug?: string | null }) {
  return `/store/category/${category.slug || slugify(category.name)}`;
}

/** Tutorial topic page address, e.g. /projects/topic/iot */
export function topicPath(topic: string) {
  return `/projects/topic/${slugify(topic)}`;
}
