'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { updateHomePoster } from '@/app/admin/marketing/actions';
import type { HomePosterConfig, HomeHeroSlide } from '@/lib/types';
import { defaultHomePosterConfig } from '@/lib/home-poster';
import { Plus, Trash2, ImageIcon, Loader2, ArrowDown, ArrowUp } from 'lucide-react';

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
  const [activeSlideId, setActiveSlideId] = useState<string | null>(normalizedInitial[0]?.id ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextSlides = mapConfigToState(initialConfig);
    setSlides(nextSlides);
    setActiveSlideId((prev) => {
      if (prev && nextSlides.some((slide) => slide.id === prev)) {
        return prev;
      }
      return nextSlides[0]?.id ?? null;
    });
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
    setSlides((prev) =>
      prev.map((slide, idx) => {
        if (idx !== index) {
          return slide;
        }
        if (slide.imagePreview) {
          URL.revokeObjectURL(slide.imagePreview);
        }
        return {
          ...slide,
          imageFile: file,
          imagePreview: file ? URL.createObjectURL(file) : null,
        };
      }),
    );
  };

  const handleAddSlide = () => {
    if (slides.length >= MAX_SLIDES) return;
    setSlides((prev) => {
      const nextSlide = createEmptySlide(prev.length);
      setActiveSlideId(nextSlide.id);
      return [...prev, nextSlide];
    });
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
    setSlides((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      setActiveSlideId((prevActive) => {
        if (prevActive && next.some((slide) => slide.id === prevActive)) {
          return prevActive;
        }
        return next[Math.max(0, index - 1)]?.id ?? null;
      });
      return next;
    });
  };

  const handleResetDefaults = () => {
    const nextSlides = mapConfigToState(defaultHomePosterConfig);
    setSlides(nextSlides);
    setActiveSlideId(nextSlides[0]?.id ?? null);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetId = slides[index]?.id;
    if (!targetId) {
      return;
    }
    setSlides((prev) => {
      const next = [...prev];
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= next.length) {
        return prev;
      }
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
    setActiveSlideId(targetId);
  };

  const getSlideIssues = (slide: SlideFormState) => {
    const issues: string[] = [];
    if (!slide.title.trim()) {
      issues.push('Title missing');
    }
    if (!slide.imageUrl && !slide.imageFile) {
      issues.push('Image missing');
    }
    return issues;
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
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            <p>Expand a slide to edit its content, update the hero image, and manage call-to-action links.</p>
            <p className="mt-1">Use the controls inside each slide to reorder or remove it. Add up to five slides.</p>
          </div>
          <Accordion
            type="single"
            collapsible
            value={activeSlideId ?? undefined}
            onValueChange={(value) => setActiveSlideId(value ?? null)}
            className="space-y-4"
          >
            {slides.map((slide, index) => {
              const validationIssues = getSlideIssues(slide);
              const title = slide.title.trim().length > 0 ? slide.title : 'Untitled slide';
              return (
                <AccordionItem key={slide.id} value={slide.id} className="rounded-xl border">
                  <div className="px-6">
                    <AccordionTrigger className="px-0 py-4">
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium text-muted-foreground">Slide {index + 1}</span>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-foreground">{title}</span>
                          {slide.tag && <Badge variant="secondary">{slide.tag}</Badge>}
                          {validationIssues.length === 0 ? (
                            <Badge variant="outline">Ready</Badge>
                          ) : (
                            validationIssues.map((issue) => (
                              <Badge key={issue} variant="destructive">
                                {issue}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="px-6 pb-6">
                    <div className="flex flex-col gap-2 pb-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMoveSlide(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="mr-2 size-4" /> Move up
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMoveSlide(index, 'down')}
                          disabled={index === slides.length - 1}
                        >
                          <ArrowDown className="mr-2 size-4" /> Move down
                        </Button>
                      </div>
                      {slides.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSlide(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" /> Remove slide
                        </Button>
                      )}
                    </div>
                    <div className="space-y-6">
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
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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
