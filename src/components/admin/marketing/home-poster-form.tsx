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
import type {
  HomePosterConfig,
  HomeHeroSlide,
  HomeQuickAccessCard,
  HomeCuratedCollection,
} from '@/lib/types';
import { defaultHomePosterConfig } from '@/lib/home-poster';
import { Plus, Trash2, ImageIcon, Loader2, ArrowDown, ArrowUp, Undo2 } from 'lucide-react';

const MAX_SLIDES = 5;
const MAX_QUICK_ACCESS = 6;
const MAX_CURATED = 6;

type SlideFormState = HomeHeroSlide & {
  imageFile: File | null;
  imagePreview: string | null;
};

type QuickAccessFormState = HomeQuickAccessCard & {
  imageFile: File | null;
  imagePreview: string | null;
};

type CuratedCollectionFormState = HomeCuratedCollection & {
  imageFile: File | null;
  imagePreview: string | null;
};

type HomePosterFormProps = {
  initialConfig: HomePosterConfig;
};

const mapConfigToSlides = (config: HomePosterConfig): SlideFormState[] =>
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

const mapConfigToQuickAccess = (config: HomePosterConfig): QuickAccessFormState[] => {
  const source =
    Array.isArray(config.quickAccessCards) && config.quickAccessCards.length > 0
      ? config.quickAccessCards
      : defaultHomePosterConfig.quickAccessCards;
  return source.map((card, index) => ({
    id: card.id && card.id.trim().length > 0 ? card.id : `quick-${index}`,
    title: card.title,
    description: card.description,
    href: card.href,
    imageUrl: card.imageUrl,
    icon: card.icon ?? '',
    imageFile: null,
    imagePreview: null,
  }));
};

const mapConfigToCuratedCollections = (config: HomePosterConfig): CuratedCollectionFormState[] => {
  const source =
    Array.isArray(config.curatedCollections) && config.curatedCollections.length > 0
      ? config.curatedCollections
      : defaultHomePosterConfig.curatedCollections;
  return source.map((collection, index) => ({
    id: collection.id && collection.id.trim().length > 0 ? collection.id : `collection-${index}`,
    title: collection.title,
    description: collection.description,
    href: collection.href,
    imageUrl: collection.imageUrl,
    imageFile: null,
    imagePreview: null,
  }));
};

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

const createEmptyQuickAccess = (index: number): QuickAccessFormState => ({
  id: `new-quick-${Date.now()}-${index}`,
  title: '',
  description: '',
  href: '',
  imageUrl: '',
  icon: '',
  imageFile: null,
  imagePreview: null,
});

const createEmptyCollection = (index: number): CuratedCollectionFormState => ({
  id: `new-collection-${Date.now()}-${index}`,
  title: '',
  description: '',
  href: '',
  imageUrl: '',
  imageFile: null,
  imagePreview: null,
});

const toNullable = (value: string | null | undefined) => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export default function HomePosterForm({ initialConfig }: HomePosterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const normalizedInitial = useMemo(
    () => ({
      slides: mapConfigToSlides(initialConfig),
      quickAccess: mapConfigToQuickAccess(initialConfig),
      curatedCollections: mapConfigToCuratedCollections(initialConfig),
    }),
    [initialConfig],
  );
  const [slides, setSlides] = useState<SlideFormState[]>(normalizedInitial.slides);
  const [quickAccessCards, setQuickAccessCards] = useState<QuickAccessFormState[]>(normalizedInitial.quickAccess);
  const [curatedCollections, setCuratedCollections] = useState<CuratedCollectionFormState[]>(normalizedInitial.curatedCollections);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(normalizedInitial.slides[0]?.id ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextState = {
      slides: mapConfigToSlides(initialConfig),
      quickAccess: mapConfigToQuickAccess(initialConfig),
      curatedCollections: mapConfigToCuratedCollections(initialConfig),
    };
    setSlides((prev) => {
      prev.forEach((slide) => {
        if (slide.imagePreview) {
          URL.revokeObjectURL(slide.imagePreview);
        }
      });
      return nextState.slides;
    });
    setQuickAccessCards((prev) => {
      prev.forEach((card) => {
        if (card.imagePreview) {
          URL.revokeObjectURL(card.imagePreview);
        }
      });
      return nextState.quickAccess;
    });
    setCuratedCollections((prev) => {
      prev.forEach((collection) => {
        if (collection.imagePreview) {
          URL.revokeObjectURL(collection.imagePreview);
        }
      });
      return nextState.curatedCollections;
    });
    setActiveSlideId((prev) => {
      if (prev && nextState.slides.some((slide) => slide.id === prev)) {
        return prev;
      }
      return nextState.slides[0]?.id ?? null;
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

  useEffect(() => {
    return () => {
      quickAccessCards.forEach((card) => {
        if (card.imagePreview) {
          URL.revokeObjectURL(card.imagePreview);
        }
      });
    };
  }, [quickAccessCards]);

  useEffect(() => {
    return () => {
      curatedCollections.forEach((collection) => {
        if (collection.imagePreview) {
          URL.revokeObjectURL(collection.imagePreview);
        }
      });
    };
  }, [curatedCollections]);

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
    slides.forEach((slide) => {
      if (slide.imagePreview) {
        URL.revokeObjectURL(slide.imagePreview);
      }
    });
    quickAccessCards.forEach((card) => {
      if (card.imagePreview) {
        URL.revokeObjectURL(card.imagePreview);
      }
    });
    curatedCollections.forEach((collection) => {
      if (collection.imagePreview) {
        URL.revokeObjectURL(collection.imagePreview);
      }
    });
    const nextState = {
      slides: mapConfigToSlides(defaultHomePosterConfig),
      quickAccess: mapConfigToQuickAccess(defaultHomePosterConfig),
      curatedCollections: mapConfigToCuratedCollections(defaultHomePosterConfig),
    };
    setSlides(nextState.slides);
    setQuickAccessCards(nextState.quickAccess);
    setCuratedCollections(nextState.curatedCollections);
    setActiveSlideId(nextState.slides[0]?.id ?? null);
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

  const updateQuickAccessAt = (index: number, patch: Partial<QuickAccessFormState>) => {
    setQuickAccessCards((prev) =>
      prev.map((card, idx) =>
        idx === index
          ? {
              ...card,
              ...patch,
            }
          : card,
      ),
    );
  };

  const handleQuickAccessImageChange = (index: number, file: File | null) => {
    setQuickAccessCards((prev) =>
      prev.map((card, idx) => {
        if (idx !== index) {
          return card;
        }
        if (card.imagePreview) {
          URL.revokeObjectURL(card.imagePreview);
        }
        return {
          ...card,
          imageFile: file,
          imagePreview: file ? URL.createObjectURL(file) : null,
        };
      }),
    );
  };

  const resetQuickAccessImage = (index: number) => {
    setQuickAccessCards((prev) =>
      prev.map((card, idx) => {
        if (idx !== index) {
          return card;
        }
        if (card.imagePreview) {
          URL.revokeObjectURL(card.imagePreview);
        }
        return {
          ...card,
          imageFile: null,
          imagePreview: null,
        };
      }),
    );
  };

  const handleAddQuickAccess = () => {
    if (quickAccessCards.length >= MAX_QUICK_ACCESS) return;
    setQuickAccessCards((prev) => [...prev, createEmptyQuickAccess(prev.length)]);
  };

  const handleRemoveQuickAccess = (index: number) => {
    if (quickAccessCards.length === 1) {
      toast({ variant: 'destructive', title: 'At least one quick access card is required.' });
      return;
    }
    setQuickAccessCards((prev) => {
      const target = prev[index];
      if (target?.imagePreview) {
        URL.revokeObjectURL(target.imagePreview);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleMoveQuickAccess = (index: number, direction: 'up' | 'down') => {
    setQuickAccessCards((prev) => {
      const next = [...prev];
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= next.length) {
        return prev;
      }
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  };

  const updateCollectionAt = (index: number, patch: Partial<CuratedCollectionFormState>) => {
    setCuratedCollections((prev) =>
      prev.map((collection, idx) =>
        idx === index
          ? {
              ...collection,
              ...patch,
            }
          : collection,
      ),
    );
  };

  const handleCuratedCollectionImageChange = (index: number, file: File | null) => {
    setCuratedCollections((prev) =>
      prev.map((collection, idx) => {
        if (idx !== index) {
          return collection;
        }
        if (collection.imagePreview) {
          URL.revokeObjectURL(collection.imagePreview);
        }
        return {
          ...collection,
          imageFile: file,
          imagePreview: file ? URL.createObjectURL(file) : null,
        };
      }),
    );
  };

  const resetCuratedCollectionImage = (index: number) => {
    setCuratedCollections((prev) =>
      prev.map((collection, idx) => {
        if (idx !== index) {
          return collection;
        }
        if (collection.imagePreview) {
          URL.revokeObjectURL(collection.imagePreview);
        }
        return {
          ...collection,
          imageFile: null,
          imagePreview: null,
        };
      }),
    );
  };

  const handleAddCollection = () => {
    if (curatedCollections.length >= MAX_CURATED) return;
    setCuratedCollections((prev) => [...prev, createEmptyCollection(prev.length)]);
  };

  const handleRemoveCollection = (index: number) => {
    if (curatedCollections.length === 1) {
      toast({ variant: 'destructive', title: 'At least one curated collection is required.' });
      return;
    }
    setCuratedCollections((prev) => {
      const target = prev[index];
      if (target?.imagePreview) {
        URL.revokeObjectURL(target.imagePreview);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleMoveCollection = (index: number, direction: 'up' | 'down') => {
    setCuratedCollections((prev) => {
      const next = [...prev];
      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= next.length) {
        return prev;
      }
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
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

  const getQuickAccessIssues = (card: QuickAccessFormState) => {
    const issues: string[] = [];
    if (!card.title.trim()) {
      issues.push('Title missing');
    }
    if (!card.description.trim()) {
      issues.push('Description missing');
    }
    if (!card.href.trim()) {
      issues.push('Link missing');
    }
    if (!card.imageUrl.trim() && !card.imageFile) {
      issues.push('Image URL missing');
    }
    return issues;
  };

  const getCollectionIssues = (collection: CuratedCollectionFormState) => {
    const issues: string[] = [];
    if (!collection.title.trim()) {
      issues.push('Title missing');
    }
    if (!collection.description.trim()) {
      issues.push('Description missing');
    }
    if (!collection.href.trim()) {
      issues.push('Link missing');
    }
    if (!collection.imageUrl.trim() && !collection.imageFile) {
      issues.push('Image URL missing');
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

    for (let i = 0; i < quickAccessCards.length; i += 1) {
      const card = quickAccessCards[i];
      const issues = getQuickAccessIssues(card);
      if (issues.length > 0) {
        toast({ variant: 'destructive', title: `Quick access card ${i + 1} has issues: ${issues.join(', ')}` });
        return;
      }
    }

    for (let i = 0; i < curatedCollections.length; i += 1) {
      const collection = curatedCollections[i];
      const issues = getCollectionIssues(collection);
      if (issues.length > 0) {
        toast({ variant: 'destructive', title: `Curated collection ${i + 1} has issues: ${issues.join(', ')}` });
        return;
      }
    }

    try {
      const slidePayload = slides.map((slide) => ({
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

      const quickAccessPayload = quickAccessCards.map((card, index) => {
        const icon = toNullable(card.icon);
        return {
          id: card.id,
          title: card.title.trim(),
          description: card.description.trim(),
          href: card.href.trim(),
          imageUrl: card.imageUrl.trim(),
          icon: icon ?? undefined,
        };
      });

      const curatedCollectionsPayload = curatedCollections.map((collection) => ({
        id: collection.id,
        title: collection.title.trim(),
        description: collection.description.trim(),
        href: collection.href.trim(),
        imageUrl: collection.imageUrl.trim(),
      }));

      const formData = new FormData();
      formData.append('heroSlides', JSON.stringify(slidePayload));
      formData.append('quickAccessCards', JSON.stringify(quickAccessPayload));
      formData.append('curatedCollections', JSON.stringify(curatedCollectionsPayload));
      slides.forEach((slide, index) => {
        if (slide.imageFile) {
          formData.append(`slide-${index}-image`, slide.imageFile);
        }
      });
      quickAccessCards.forEach((card, index) => {
        if (card.imageFile) {
          formData.append(`quick-${index}-image`, card.imageFile);
        }
      });
      curatedCollections.forEach((collection, index) => {
        if (collection.imageFile) {
          formData.append(`collection-${index}-image`, collection.imageFile);
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

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Quick access cards</h3>
              <p className="text-sm text-muted-foreground">These cards appear below the hero carousel to highlight key areas.</p>
            </div>
            <div className="grid gap-6">
              {quickAccessCards.map((card, index) => {
                const issues = getQuickAccessIssues(card);
                return (
                  <div key={card.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">Card {index + 1}</Badge>
                        {issues.length === 0 ? (
                          <Badge variant="outline">Ready</Badge>
                        ) : (
                          issues.map((issue) => (
                            <Badge key={issue} variant="destructive">
                              {issue}
                            </Badge>
                          ))
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMoveQuickAccess(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="mr-2 size-4" /> Move up
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMoveQuickAccess(index, 'down')}
                          disabled={index === quickAccessCards.length - 1}
                        >
                          <ArrowDown className="mr-2 size-4" /> Move down
                        </Button>
                        {quickAccessCards.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuickAccess(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" /> Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`quick-${index}-title`}>Title</Label>
                        <Input
                          id={`quick-${index}-title`}
                          value={card.title}
                          onChange={(event) => updateQuickAccessAt(index, { title: event.target.value })}
                          placeholder="Marketplace deals"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`quick-${index}-href`}>Link</Label>
                        <Input
                          id={`quick-${index}-href`}
                          value={card.href}
                          onChange={(event) => updateQuickAccessAt(index, { href: event.target.value })}
                          placeholder="/marketplace"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor={`quick-${index}-description`}>Description</Label>
                        <Textarea
                          id={`quick-${index}-description`}
                          value={card.description}
                          onChange={(event) => updateQuickAccessAt(index, { description: event.target.value })}
                          placeholder="Fresh finds under ₹199"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`quick-${index}-imageUrl`}>Image URL</Label>
                        <Input
                          id={`quick-${index}-imageUrl`}
                          value={card.imageUrl}
                          onChange={(event) => updateQuickAccessAt(index, { imageUrl: event.target.value })}
                          placeholder="https://..."
                        />
                        <div className="flex items-center gap-3 pt-2">
                          <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-muted">
                            {card.imagePreview ? (
                              <Image src={card.imagePreview} alt={`Quick access ${index + 1}`} fill className="object-cover" sizes="80px" />
                            ) : card.imageUrl ? (
                              <Image src={card.imageUrl} alt={`Quick access ${index + 1}`} fill className="object-cover" sizes="80px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <ImageIcon className="size-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleQuickAccessImageChange(index, event.target.files?.[0] ?? null)}
                            />
                            {(card.imageFile || card.imagePreview || card.imageUrl) && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => resetQuickAccessImage(index)}>
                                <Undo2 className="mr-2 size-4" /> Reset image
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`quick-${index}-icon`}>Icon (optional)</Label>
                        <Input
                          id={`quick-${index}-icon`}
                          value={card.icon ?? ''}
                          onChange={(event) => updateQuickAccessAt(index, { icon: event.target.value })}
                          placeholder="package"
                        />
                        <p className="text-xs text-muted-foreground">Provide a Lucide icon name if you want to override the default.</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddQuickAccess}
              disabled={quickAccessCards.length >= MAX_QUICK_ACCESS}
            >
              <Plus className="mr-2 size-4" /> Add quick access card
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Curated collections</h3>
              <p className="text-sm text-muted-foreground">Showcase featured content blocks near the bottom of the home page.</p>
            </div>
            <div className="grid gap-6">
              {curatedCollections.map((collection, index) => {
                const issues = getCollectionIssues(collection);
                return (
                  <div key={collection.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">Collection {index + 1}</Badge>
                        {issues.length === 0 ? (
                          <Badge variant="outline">Ready</Badge>
                        ) : (
                          issues.map((issue) => (
                            <Badge key={issue} variant="destructive">
                              {issue}
                            </Badge>
                          ))
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMoveCollection(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="mr-2 size-4" /> Move up
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMoveCollection(index, 'down')}
                          disabled={index === curatedCollections.length - 1}
                        >
                          <ArrowDown className="mr-2 size-4" /> Move down
                        </Button>
                        {curatedCollections.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCollection(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" /> Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`collection-${index}-title`}>Title</Label>
                        <Input
                          id={`collection-${index}-title`}
                          value={collection.title}
                          onChange={(event) => updateCollectionAt(index, { title: event.target.value })}
                          placeholder="Upgrade your hostel life"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`collection-${index}-href`}>Link</Label>
                        <Input
                          id={`collection-${index}-href`}
                          value={collection.href}
                          onChange={(event) => updateCollectionAt(index, { href: event.target.value })}
                          placeholder="/marketplace?category=hostel"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor={`collection-${index}-description`}>Description</Label>
                        <Textarea
                          id={`collection-${index}-description`}
                          value={collection.description}
                          onChange={(event) => updateCollectionAt(index, { description: event.target.value })}
                          placeholder="Comfort essentials and gadgets from verified vendors."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`collection-${index}-imageUrl`}>Image URL</Label>
                        <Input
                          id={`collection-${index}-imageUrl`}
                          value={collection.imageUrl}
                          onChange={(event) => updateCollectionAt(index, { imageUrl: event.target.value })}
                          placeholder="https://..."
                        />
                        <div className="flex items-center gap-3 pt-2">
                          <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-muted">
                            {collection.imagePreview ? (
                              <Image src={collection.imagePreview} alt={`Collection ${index + 1}`} fill className="object-cover" sizes="80px" />
                            ) : collection.imageUrl ? (
                              <Image src={collection.imageUrl} alt={`Collection ${index + 1}`} fill className="object-cover" sizes="80px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <ImageIcon className="size-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleCuratedCollectionImageChange(index, event.target.files?.[0] ?? null)}
                            />
                            {(collection.imageFile || collection.imagePreview || collection.imageUrl) && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => resetCuratedCollectionImage(index)}>
                                <Undo2 className="mr-2 size-4" /> Reset image
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCollection}
              disabled={curatedCollections.length >= MAX_CURATED}
            >
              <Plus className="mr-2 size-4" /> Add curated collection
            </Button>
          </div>
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
