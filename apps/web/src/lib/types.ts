
import type { User } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  handle: string | null;
  bio?: string | null;
  followers?: { count: number }[];
  following?: { count: number }[];
};

export type Room = {
  id: string;
  name: string | null;
  avatar: string | null;
  last_message: string | null;
  last_message_timestamp: string | null;
  unread_count: number | null;
  room_created_at: string;
};

export type Message = {
  id: string;
  content: string;
  created_at: string;
  room_id: string;
  user_id: string;
  profile: Profile | null;
};

export type Product = {
  id: number;
  created_at: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  seller_id: string;
  description: string;
  location: string | null;
  total_seats: number | null;
  parent_product_id: number | null;
  status: string;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  opening_hours?: string[] | null;
  amenities?: string[] | null;
  meal_plan?: {
    breakfast?: string | null;
    lunch?: string | null;
    dinner?: string | null;
  } | null;
  subscription_price?: number | null;
  special_notes?: string | null;
  room_types?: string[] | null;
  utilities_included?: string[] | null;
  house_rules?: string | null;
  occupancy?: number | null;
  furnishing?: string | null;
  hourly_slots?: string[] | null;
  services_offered?: string[] | null;
  equipment_specs?: string | null;
  app_number?: string | null;
  app_store_url?: string | null;
  play_store_url?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  seller: {
    id: string;
    full_name: string;
    avatar_url: string;
    handle: string;
    user_metadata: any;
  };
  // This field is for the raw query result
  profiles?: {
    full_name: string;
  };
};

export type Note = {
  id: number;
  created_at: string;
  user_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  tags: string[] | null;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export type Order = {
  id: number;
  created_at: string;
  buyer_id: string;
  vendor_id: string;
  total_amount: number;
  razorpay_payment_id: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'completed' | null;
  booking_date?: string | null;
  booking_slot?: string | null;
  order_items: OrderItem[];
  buyer: Profile;
}

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string | null;
  },
  seat_number?: number;
  library_id?: number;
}

export type Notification = {
  id: number;
  created_at: string;
  user_id: string;
  sender_id: string;
  type: 'new_follower' | 'new_post' | 'new_message' | 'new_competition' | 'new_internship';
  post_id: number | null;
  is_read: boolean;
  sender: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export type PostWithAuthor = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  likes: { count: number }[];
  comments: any[];
  profiles: {
    full_name: string;
    avatar_url: string;
    handle: string;
  } | null;
  isLiked: boolean;
  isFollowed: boolean;
};

type StudentMonetizationSetting = {
  charge_for_posts: boolean;
  post_price: number;
}

type VendorMonetizationSetting = {
  charge_for_platform_access: boolean;
  price_per_service_per_month: number;
}

export type MonetizationSettings = {
  student: StudentMonetizationSetting;
  vendor: VendorMonetizationSetting;
  start_date: string | null;
};

export type ApplicationVisibilitySettings = {
  showCompetitionApplicants: boolean;
  showInternshipApplicants: boolean;
};

export type PlatformSettings = MonetizationSettings & {
  applicationVisibility: ApplicationVisibilitySettings;
};

export type SupportTicket = {
  id: number;
  created_at: string;
  user_id: string;
  category: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Archived';
  priority: 'Low' | 'Medium' | 'High';
  screenshot_url?: string | null;
  profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
};

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
  icon: string | LucideIcon;
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

export type VendorPromotion = {
  id: string;
  name: string;
  audience?: string;
  uplift?: string;
  dates?: string;
  budget?: string;
};

export type VendorPromotionsByStatus = {
  active: VendorPromotion[];
  scheduled: VendorPromotion[];
  completed: VendorPromotion[];
};

export type BrandingAssets = {
  logoUrl: string | null;
  faviconUrl: string | null;
  pwaIcon192Url: string | null;
  pwaIcon512Url: string | null;
  pwaIcon1024Url: string | null;
  pwaScreenshotDesktopUrl: string | null;
  pwaScreenshotMobileUrl: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  brandName?: string | null;
  brandDescription?: string | null;
};

export type CompetitionEntry = {
  id: number;
  user_id: string;
  competition_id: number;
  created_at: string;
  payment_id: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  pitch_deck_url: string | null;
  competitions: {
    id: number;
    title: string;
    prize: number;
    deadline: string;
    image_url: string | null;
    winner_id: string | null;
  };
};

export type InternshipApplication = {
  id: number;
  user_id: string;
  internship_id: number;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  resume_url: string | null;
  cover_letter: string | null;
  internships: {
    id: number;
    role: string;
    company: string;
    stipend: number;
    deadline: string;
    location: string;
    image_url: string | null;
  };
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
