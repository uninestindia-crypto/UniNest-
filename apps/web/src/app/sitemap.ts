import type { MetadataRoute } from 'next';

const baseUrl = 'https://uninest.co.in';

const staticRoutes: Array<{
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
}> = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/hostels', changeFrequency: 'daily', priority: 1.0 },
    { path: '/marketplace', changeFrequency: 'daily', priority: 0.9 },
    { path: '/workspace', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/feed', changeFrequency: 'always', priority: 0.8 },
    { path: '/social', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/donate', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

export const revalidate = 86400; // 24 hours

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
