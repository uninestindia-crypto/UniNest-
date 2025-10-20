'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Share2, Copy, CheckCheck, Send, MessageCircle, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type OpportunityShareButtonProps = {
  title: string;
  sharePath: string;
  description?: string;
  buttonLabel?: string;
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  buttonSize?: React.ComponentProps<typeof Button>['size'];
  className?: string;
};

export function OpportunityShareButton({
  title,
  sharePath,
  description,
  buttonLabel = 'Share',
  buttonVariant = 'outline',
  buttonSize = 'sm',
  className,
}: OpportunityShareButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return sharePath;
    }
    if (sharePath.startsWith('http')) {
      return sharePath;
    }
    const base = window.location.origin;
    return new URL(sharePath, base).toString();
  }, [sharePath]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: 'Link copied', description: 'The opportunity link is ready to share.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Copy failed', description: 'Please try again.' });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description ?? title,
          url: shareUrl,
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          toast({ variant: 'destructive', title: 'Share failed', description: 'Please try again.' });
        }
      }
    } else {
      handleCopy();
    }
  };

  const socialLinks = [
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: Linkedin,
    },
    {
      label: 'Share on X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      icon: Twitter,
    },
    {
      label: 'Share on WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`,
      icon: MessageCircle,
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size={buttonSize}
          variant={buttonVariant}
          className={cn('justify-center gap-2 rounded-full', className)}
        >
          <Share2 className="size-4" />
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] space-y-4 rounded-2xl border bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <Button size="icon" variant="secondary" onClick={handleNativeShare} className="rounded-full">
            <Send className="size-4" />
          </Button>
        </div>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-2">
            <Input readOnly value={shareUrl} className="h-9 flex-1 bg-background" />
            <Button size="sm" variant="secondary" onClick={handleCopy} className="gap-2 rounded-full">
              {copied ? <CheckCheck className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {socialLinks.map((option) => (
            <Button key={option.label} asChild variant="ghost" className="justify-start gap-2 rounded-full">
              <Link href={option.href} target="_blank" rel="noopener noreferrer">
                <option.icon className="size-4" />
                {option.label}
              </Link>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
