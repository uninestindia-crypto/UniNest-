import type { HomePosterConfig } from '@/lib/types';

export const defaultHomePosterConfig: HomePosterConfig = {
  heroSlides: [
    {
      id: 'default-1',
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
};
