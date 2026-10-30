import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

// Renders client components with data already loaded on the server, so products and
// stats are in the initial HTML that search engines read (not just after JavaScript runs).
export function Prefetched({
  queries,
  children,
}: {
  queries: { key: readonly string[]; data: unknown }[];
  children: React.ReactNode;
}) {
  const client = new QueryClient();
  for (const { key, data } of queries) client.setQueryData(key, data);
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
}
