import type { APIRoute } from 'astro';

// Define all accommodations for sitemap
const accommodationSlugs = [
  // Luxury Dog Suites
  'sniffany-suite',
  'woofdorf',
  'barkingham-palace',
  'nasherville',
  'lapdog-land-suite',
  'huntington-manor-suite',
  'pawduree',
  'furrari',
  'tail-away',
  'the-fairy-dogmother',
  // Cattery Suites
  'clawrence-house',
  'twitcher',
  'pussy-porchens',
  'ragdoll-ranch',
  'bengal-bay',
  'paws-palace',
  'octopussy',
  'catsby',
  'whiskers-lounge',
  'hairy-potter',
  'chalet-cat',
  'cleocatara',
  // Standard Kennels
  'ruffs-retreat',
  'the-village'
];

export const GET: APIRoute = async () => {
  const siteUrl = 'https://glenugiekennels.co.uk';
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/accommodations', priority: '0.9', changefreq: 'weekly' },
    { url: '/booking', priority: '0.9', changefreq: 'daily' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/terms', priority: '0.5', changefreq: 'yearly' },
  ];

  const kennelPages = accommodationSlugs.map(slug => ({
    url: `/kennels/${slug}`,
    priority: '0.7',
    changefreq: 'weekly'
  }));

  const allPages = [...staticPages, ...kennelPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
