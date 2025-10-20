import type { HomePosterConfig } from '@/lib/types';

export const defaultHomePosterConfig: HomePosterConfig = {
  heroSlides: [
    {
      id: 'default-hero-1',
      title: 'Experience UniNest',
      subtitle: "Connect, learn, and shop smarter with India's favorite student hub",
      imageUrl: 'https://placehold.co/1600x500/orange/white?text=Welcome+to+UniNest',
      ctaLabel: 'Join Now',
      ctaHref: '/signup',
      secondaryCtaLabel: 'Explore',
      secondaryCtaHref: '/feed',
      tag: 'Featured',
    },
  ],
  quickAccessCards: [
    {
      id: 'default-quick-1',
      title: 'Marketplace deals',
      description: 'Fresh finds under ₹199',
      href: '/marketplace',
      imageUrl: 'https://placehold.co/400x220/ffe2cc/31220c?text=Marketplace',
      icon: 'package',
    },
    {
      id: 'default-quick-2',
      title: 'Peer study rooms',
      description: 'Start a collaborative session',
      href: '/workspace',
      imageUrl: 'https://placehold.co/400x220/d6e6ff/0a1f44?text=Study+Hub',
      icon: 'users',
    },
    {
      id: 'default-quick-3',
      title: 'Download fresh notes',
      description: 'Expert summaries & solved papers',
      href: '/notes',
      imageUrl: 'https://placehold.co/400x220/e4f7d7/143a04?text=Notes',
      icon: 'book-open',
    },
    {
      id: 'default-quick-4',
      title: 'Join the social buzz',
      description: 'Trending conversations from campuses',
      href: '/feed',
      imageUrl: 'https://placehold.co/400x220/f4e2ff/240835?text=Social+Feed',
      icon: 'arrow-right',
    },
  ],
  curatedCollections: [
    {
      id: 'default-collection-1',
      title: 'Last-minute competition prep',
      description: 'Register for top hackathons and contests closing soon.',
      href: '/workspace/competitions',
      imageUrl: 'https://placehold.co/500x300/fff0f0/661111?text=Competitions',
    },
    {
      id: 'default-collection-2',
      title: 'Internships ready to apply',
      description: 'Handpicked roles from verified partners for UniNest students.',
      href: '/workspace/internships',
      imageUrl: 'https://placehold.co/500x300/ebfff4/0b3d24?text=Internships',
    },
    {
      id: 'default-collection-3',
      title: 'Upgrade your hostel life',
      description: 'Comfort essentials and gadgets from verified vendors.',
      href: '/marketplace?category=hostel',
      imageUrl: 'https://placehold.co/500x300/eff3ff/172152?text=Hostel+Essentials',
    },
  ],
};
