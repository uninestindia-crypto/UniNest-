'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useBrandingAssets } from '@/components/branding/branding-provider';

type BrandingLogoProps = {
  className?: string;
  size?: number;
  fallbackClassName?: string;
};

export function BrandingLogo({ className, size = 32, fallbackClassName }: BrandingLogoProps) {
  const { assets } = useBrandingAssets();

  if (!assets.logoUrl) {
    return null;
  }

  return (
    <Image
      src={assets.logoUrl}
      alt="UniNest logo"
      width={size}
      height={size}
      className={cn('h-auto w-auto max-h-full max-w-full object-contain', className)}
      priority
    />
  );
}
