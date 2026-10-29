// Storefront marketing content that admins manage from Dashboard → Settings → Storefront.
// Values may contain {tokens} that are replaced with live numbers from the database.

export interface StorefrontStat {
  value: string;
  label: string;
}

export interface StorefrontContent {
  storeStats: StorefrontStat[];
  heroBadge: string;
}

export const STOREFRONT_TOKENS = {
  productsInStock: 'Products currently in stock (stock above 0)',
  products: 'All products visible in the store',
  unitsInStock: 'Total units across all products in stock',
  categories: 'Number of product categories',
  avgRating: 'Average star rating of approved reviews (e.g. 4.7)',
  reviews: 'Number of approved product reviews',
  projects: 'Published projects / tutorials',
  users: 'Registered user accounts',
  ordersDelivered: 'Orders marked Delivered or Completed',
} as const;

export type StorefrontToken = keyof typeof STOREFRONT_TOKENS;
export type StorefrontCounts = Record<StorefrontToken, number>;

export const DEFAULT_STOREFRONT: StorefrontContent = {
  storeStats: [
    { value: '{productsInStock}', label: 'Products in stock' },
    { value: 'Same-Day', label: 'Order dispatch' },
    { value: '{categories}', label: 'Categories' },
    { value: '{avgRating}★', label: 'Customer rating' },
  ],
  heroBadge: 'Join {users}+ makers building the future',
};

export const STOREFRONT_KEYS = {
  storeStats: 'storefront.storeStats',
  heroBadge: 'storefront.heroBadge',
} as const;

const TOKEN_RE = /\{(\w+)\}/g;

function formatCount(token: StorefrontToken, n: number) {
  if (token === 'avgRating') return n.toFixed(1);
  return n.toLocaleString('en-NG');
}

/**
 * Replace {tokens} with live numbers. Returns null when the text relies on a token
 * whose live value is 0, so the UI can hide e.g. "0★ From 0 reviews" instead of showing it.
 */
export function resolveTokens(text: string, counts: StorefrontCounts): string | null {
  let usesZero = false;
  const out = text.replace(TOKEN_RE, (match, name: string) => {
    if (!(name in counts)) return match;
    const n = counts[name as StorefrontToken];
    if (!n) usesZero = true;
    return formatCount(name as StorefrontToken, n);
  });
  return usesZero ? null : out;
}
