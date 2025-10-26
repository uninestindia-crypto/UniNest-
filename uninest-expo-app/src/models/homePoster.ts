export type HomeHeroSlide = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  tag?: string;
};

export type HomeQuickAccessCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  imageUrl: string;
  icon?: string;
};

export type HomeCuratedCollection = {
  id: string;
  title: string;
  description: string;
  href: string;
  imageUrl: string;
};

export type HomeMobileDeal = {
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
  icon: string;
};

export type HomeStat = {
  value: number;
  label: string;
  icon: string;
  isPlus?: boolean;
};

export type HomeTestimonial = {
  name: string;
  quote: string;
  school: string;
  avatar: string;
};

export type HomeTimelineItem = {
  year: string;
  title: string;
  description: string;
  icon: string;
};

export type HomePosterConfig = {
  heroSlides: HomeHeroSlide[];
  quickAccessCards: HomeQuickAccessCard[];
  curatedCollections: HomeCuratedCollection[];
  mobileDeals?: HomeMobileDeal[];
  stats?: HomeStat[];
  testimonials?: HomeTestimonial[];
  timeline?: HomeTimelineItem[];
};
