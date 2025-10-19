'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { updateHomePoster } from '@/app/admin/marketing/actions';
import type { HomePosterConfig, HomeHeroSlide } from '@/lib/types';
import { defaultHomePosterConfig } from '@/lib/home-poster';
import { Plus, Trash2, ImageIcon, Loader2 } from 'lucide-react';

const MAX_SLIDES = 5;

type SlideFormState = HomeHeroSlide & {
  imageFile: File | null;
  imagePreview: string | null;
};

type HomePosterFormProps = {
  initialConfig: HomePosterConfig;
};

const mapConfigToState = (config: HomePosterConfig): SlideFormState[] =>
  config.heroSlides.map((slide, index) => ({
    id: slide.id ?? `slide-${index}`,
    title: slide.title,
    subtitle: slide.subtitle ?? '',
    imageUrl: slide.imageUrl,
    ctaLabel: slide.ctaLabel ?? '',
    ctaHref: slide.ctaHref ?? '',
    secondaryCtaLabel: slide.secondaryCtaLabel ?? '',
    secondaryCtaHref: slide.secondaryCtaHref ?? '',
    tag: slide.tag ?? '',
    imageFile: null,
    imagePreview: null,
  }));

const createEmptySlide = (index: number): SlideFormState => ({
  id: `new-slide-${Date.now()}-${index}`,
  title: '',
  subtitle: '',
  imageUrl: '',
  ctaLabel: '',
  ctaHref: '',
  secondaryCtaLabel: '',
  secondaryCtaHref: '',
  tag: '',
  imageFile: null,
  imagePreview: null,
});

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function HomePosterForm({ initialConfig }: HomePosterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const normalizedInitial = useMemo(() => mapConfigToState(initialConfig), [initialConfig]);
  const [slides, setSlides] = useState<SlideFormState[]>(normalizedInitial);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSlides(mapConfigToState(initialConfig));
  }, [initialConfig]);

  useEffect(() => {
    return () => {
      slides.forEach((slide) => {
        if (slide.imagePreview) {
          URL.revokeObjectURL(slide.imagePreview);
        }
      });
    };
  }, [slides]);

  const updateSlideAt = (index: number, patch: Partial<SlideFormState>) => {
    setSlides((prev) =>
      prev.map((slide, idx) =>
        idx === index
          ? {
              ...slide,
              ...patch,
            }
          : slide,
      ),
    );
  };

  const handleImageChange = (index: number, file: File | null) => {
    updateSlideAt(index, (prev => {
      if (prev.imagePreview) {
        URL.revokeObjectURL(prev.imagePreview);
      }
      const nextPreview = file ? URL.createObjectURL(file) : null;
      return {
        imageFile: file,
        imagePreview: nextPreview,
        imageUrl: file ? prev.imageUrl : prev.imageUrl,
      } as Partial<SlideFormState>;
    })(slides[index]));
  };

  const handleAddSlide = () => {
    if (slides.length >= MAX_SLIDES) return;
    setSlides((prev) => [...prev, createEmptySlide(prev.length)]);
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length === 1) {
      toast({ variant: 'destructive', title: 'At least one slide is required.' });
      return;
    }
    const target = slides[index];
    if (target.imagePreview) {
      URL.revokeObjectURL(target.imagePreview);
    }
    setSlides((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleResetDefaults = () => {
    setSlides(mapConfigToState(defaultHomePosterConfig));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    for (let i = 0; i < slides.length; i += 1) {
      const slide = slides[i];
      if (!slide.title.trim()) {
        toast({ variant: 'destructive', title: `Slide ${i + 1} needs a title.` });
        return;
      }
      if (!slide.imageUrl && !slide.imageFile) {
        toast({ variant: 'destructive', title: `Slide ${i + 1} needs an image.` });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = slides.map((slide) => ({
        id: slide.id,
        title: slide.title.trim(),
        subtitle: toNullable(slide.subtitle),
        imageUrl: toNullable(slide.imageUrl ?? ''),
        ctaLabel: toNullable(slide.ctaLabel),
        ctaHref: toNullable(slide.ctaHref),
        secondaryCtaLabel: toNullable(slide.secondaryCtaLabel),
        secondaryCtaHref: toNullable(slide.secondaryCtaHref),
        tag: toNullable(slide.tag),
      }));

      const formData = new FormData();
      formData.append('slides', JSON.stringify(payload));
      slides.forEach((slide, index) => {
        if (slide.imageFile) {
          formData.append(`slide-${index}-image`, slide.imageFile);
        }
      });

      const result = await updateHomePoster(formData);

      if (result.error) {
        toast({ variant: 'destructive', title: 'Failed to save poster', description: result.error });
      } else {
        toast({ title: 'Home poster updated successfully.' });
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error occurred.';
      toast({ variant: 'destructive', title: 'Failed to save poster', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Home hero poster</CardTitle>
          <CardDescription>Control the carousel slides displayed on the public dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {slides.map((slide, index) => (
            <div key={slide.id} className="rounded-xl border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Slide {index + 1}</h3>
                {slides.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSlide(index)}>
                    <Trash2 className="size-4" />
                    <span className="sr-only">Remove slide</span>
                  </Button>
                )}
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`slide-${index}-title`}>Title</Label>
                  <Input
                    id={`slide-${index}-title`}
                    value={slide.title}
                    onChange={(event) => updateSlideAt(index, { title: event.target.value })}
                    placeholder="Celebrate the big sale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`slide-${index}-tag`}>Tag</Label>
                  <Input
                    id={`slide-${index}-tag`}
                    value={slide.tag}
                    onChange={(event) => updateSlideAt(index, { tag: event.target.value })}
                    placeholder="Limited time"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`slide-${index}-subtitle`}>Subtitle</Label>
                  <Textarea
                    id={`slide-${index}-subtitle`}
                    value={slide.subtitle}
                    onChange={(event) => updateSlideAt(index, { subtitle: event.target.value })}
                    placeholder="Unlock exclusive student offers before they disappear."
                    rows={2}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`slide-${index}-cta-label`}>Primary CTA label</Label>
                  <Input
                    id={`slide-${index}-cta-label`}
                    value={slide.ctaLabel}
                    onChange={(event) => updateSlideAt(index, { ctaLabel: event.target.value })}
                    placeholder="Shop now"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`slide-${index}-cta-href`}>Primary CTA link</Label>
                  <Input
                    id={`slide-${index}-cta-href`}
                    value={slide.ctaHref}
                    onChange={(event) => updateSlideAt(index, { ctaHref: event.target.value })}
                    placeholder="/marketplace"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`slide-${index}-secondary-label`}>Secondary CTA label</Label>
                  <Input
                    id={`slide-${index}-secondary-label`}
                    value={slide.secondaryCtaLabel}
                    onChange={(event) => updateSlideAt(index, { secondaryCtaLabel: event.target.value })}
                    placeholder="Learn more"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`slide-${index}-secondary-href`}>Secondary CTA link</Label>
                  <Input
                    id={`slide-${index}-secondary-href`}
                    value={slide.secondaryCtaHref}
                    onChange={(event) => updateSlideAt(index, { secondaryCtaHref: event.target.value })}
                    placeholder="/feed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hero image</Label>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative h-32 w-full max-w-sm overflow-hidden rounded-lg border bg-muted">
                    {slide.imagePreview ? (
                      <Image
                        src={slide.imagePreview}
                        alt={`Slide ${index + 1} preview`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 320px, 100vw"
                      />
                    ) : slide.imageUrl ? (
                      <Image
                        src={slide.imageUrl}
                        alt={`Slide ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 320px, 100vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageChange(index, event.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-muted-foreground">Recommended 1600×500 JPG or PNG.</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleAddSlide} disabled={slides.length >= MAX_SLIDES}>
              <Plus className="mr-2 size-4" /> Add slide
            </Button>
            <Button type="button" variant="ghost" onClick={handleResetDefaults}>
              Restore defaults
            </Button>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
