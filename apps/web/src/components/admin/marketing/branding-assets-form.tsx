'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { updateBrandingAssets } from '@/app/admin/marketing/actions';
import type { BrandingAssets } from '@/lib/types';
import { Loader2, ImageIcon, Upload, Undo2, Trash2 } from 'lucide-react';

const MAX_LOGO_SIZE_MB = 2;
const MAX_FAVICON_SIZE_MB = 1;
const MAX_PWA_ICON_SIZE_MB = 2;
const MAX_SCREENSHOT_SIZE_MB = 5;

const toMB = (bytes: number) => bytes / (1024 * 1024);

const getInitialAssets = (assets: BrandingAssets | null): BrandingAssets => ({
  logoUrl: assets?.logoUrl ?? null,
  faviconUrl: assets?.faviconUrl ?? null,
  pwaIcon192Url: assets?.pwaIcon192Url ?? null,
  pwaIcon512Url: assets?.pwaIcon512Url ?? null,
  pwaIcon1024Url: assets?.pwaIcon1024Url ?? null,
  pwaScreenshotDesktopUrl: assets?.pwaScreenshotDesktopUrl ?? null,
  pwaScreenshotMobileUrl: assets?.pwaScreenshotMobileUrl ?? null,
});

type BrandingAssetsFormProps = {
  initialAssets: BrandingAssets | null;
};

type FileState = {
  file: File | null;
  preview: string | null;
};

export default function BrandingAssetsForm({ initialAssets }: BrandingAssetsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const normalizedInitial = useMemo(() => getInitialAssets(initialAssets), [initialAssets]);

  const [logoState, setLogoState] = useState<FileState>({ file: null, preview: null });
  const [faviconState, setFaviconState] = useState<FileState>({ file: null, preview: null });
  const [pwaIcon192State, setPwaIcon192State] = useState<FileState>({ file: null, preview: null });
  const [pwaIcon512State, setPwaIcon512State] = useState<FileState>({ file: null, preview: null });
  const [pwaIcon1024State, setPwaIcon1024State] = useState<FileState>({ file: null, preview: null });
  const [screenshotDesktopState, setScreenshotDesktopState] = useState<FileState>({ file: null, preview: null });
  const [screenshotMobileState, setScreenshotMobileState] = useState<FileState>({ file: null, preview: null });
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeFavicon, setRemoveFavicon] = useState(false);
  const [removePwaIcon192, setRemovePwaIcon192] = useState(false);
  const [removePwaIcon512, setRemovePwaIcon512] = useState(false);
  const [removePwaIcon1024, setRemovePwaIcon1024] = useState(false);
  const [removeScreenshotDesktop, setRemoveScreenshotDesktop] = useState(false);
  const [removeScreenshotMobile, setRemoveScreenshotMobile] = useState(false);

  useEffect(
    () => () => {
      [
        logoState,
        faviconState,
        pwaIcon192State,
        pwaIcon512State,
        pwaIcon1024State,
        screenshotDesktopState,
        screenshotMobileState,
      ].forEach((state) => {
        if (state.preview) URL.revokeObjectURL(state.preview);
      });
    },
    [
      logoState.preview,
      faviconState.preview,
      pwaIcon192State.preview,
      pwaIcon512State.preview,
      pwaIcon1024State.preview,
      screenshotDesktopState.preview,
      screenshotMobileState.preview,
    ],
  );

  useEffect(() => {
    setRemoveLogo(false);
    setRemoveFavicon(false);
    setLogoState({ file: null, preview: null });
    setFaviconState({ file: null, preview: null });
    setPwaIcon192State({ file: null, preview: null });
    setPwaIcon512State({ file: null, preview: null });
    setPwaIcon1024State({ file: null, preview: null });
    setScreenshotDesktopState({ file: null, preview: null });
    setScreenshotMobileState({ file: null, preview: null });
    setRemovePwaIcon192(false);
    setRemovePwaIcon512(false);
    setRemovePwaIcon1024(false);
    setRemoveScreenshotDesktop(false);
    setRemoveScreenshotMobile(false);
  }, [
    normalizedInitial.logoUrl,
    normalizedInitial.faviconUrl,
    normalizedInitial.pwaIcon192Url,
    normalizedInitial.pwaIcon512Url,
    normalizedInitial.pwaIcon1024Url,
    normalizedInitial.pwaScreenshotDesktopUrl,
    normalizedInitial.pwaScreenshotMobileUrl,
  ]);

  const handleLogoChange = (file: File | null) => {
    if (logoState.preview) URL.revokeObjectURL(logoState.preview);
    if (file) {
      if (toMB(file.size) > MAX_LOGO_SIZE_MB) {
        toast({ variant: 'destructive', title: 'Logo too large', description: `Logo must be under ${MAX_LOGO_SIZE_MB}MB.` });
        return;
      }
      setLogoState({ file, preview: URL.createObjectURL(file) });
      setRemoveLogo(false);
    } else {
      setLogoState({ file: null, preview: null });
    }
  };

  const handleFaviconChange = (file: File | null) => {
    if (faviconState.preview) URL.revokeObjectURL(faviconState.preview);
    if (file) {
      if (toMB(file.size) > MAX_FAVICON_SIZE_MB) {
        toast({ variant: 'destructive', title: 'Favicon too large', description: `Favicon must be under ${MAX_FAVICON_SIZE_MB}MB.` });
        return;
      }
      setFaviconState({ file, preview: URL.createObjectURL(file) });
      setRemoveFavicon(false);
    } else {
      setFaviconState({ file: null, preview: null });
    }
  };

  const handlePwaIconChange = (
    file: File | null,
    setState: React.Dispatch<React.SetStateAction<FileState>>,
    setRemove: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setState((prev) => {
      if (prev.preview) URL.revokeObjectURL(prev.preview);
      return prev;
    });
    if (file) {
      if (toMB(file.size) > MAX_PWA_ICON_SIZE_MB) {
        toast({ variant: 'destructive', title: 'Icon too large', description: `PWA icons must be under ${MAX_PWA_ICON_SIZE_MB}MB.` });
        return;
      }
      setState({ file, preview: URL.createObjectURL(file) });
      setRemove(false);
    } else {
      setState({ file: null, preview: null });
    }
  };

  const handleScreenshotChange = (
    file: File | null,
    setState: React.Dispatch<React.SetStateAction<FileState>>,
    setRemove: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setState((prev) => {
      if (prev.preview) URL.revokeObjectURL(prev.preview);
      return prev;
    });
    if (file) {
      if (toMB(file.size) > MAX_SCREENSHOT_SIZE_MB) {
        toast({ variant: 'destructive', title: 'Screenshot too large', description: `Screenshots must be under ${MAX_SCREENSHOT_SIZE_MB}MB.` });
        return;
      }
      setState({ file, preview: URL.createObjectURL(file) });
      setRemove(false);
    } else {
      setState({ file: null, preview: null });
    }
  };

  const logoPreview = logoState.preview ?? (!removeLogo ? normalizedInitial.logoUrl : null);
  const faviconPreview = faviconState.preview ?? (!removeFavicon ? normalizedInitial.faviconUrl : null);
  const pwaIcon192Preview = pwaIcon192State.preview ?? (!removePwaIcon192 ? normalizedInitial.pwaIcon192Url : null);
  const pwaIcon512Preview = pwaIcon512State.preview ?? (!removePwaIcon512 ? normalizedInitial.pwaIcon512Url : null);
  const pwaIcon1024Preview = pwaIcon1024State.preview ?? (!removePwaIcon1024 ? normalizedInitial.pwaIcon1024Url : null);
  const screenshotDesktopPreview = screenshotDesktopState.preview ?? (!removeScreenshotDesktop ? normalizedInitial.pwaScreenshotDesktopUrl : null);
  const screenshotMobilePreview = screenshotMobileState.preview ?? (!removeScreenshotMobile ? normalizedInitial.pwaScreenshotMobileUrl : null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (logoState.file) formData.append('logo', logoState.file);
        if (faviconState.file) formData.append('favicon', faviconState.file);
        if (pwaIcon192State.file) formData.append('pwaIcon192', pwaIcon192State.file);
        if (pwaIcon512State.file) formData.append('pwaIcon512', pwaIcon512State.file);
        if (pwaIcon1024State.file) formData.append('pwaIcon1024', pwaIcon1024State.file);
        if (screenshotDesktopState.file) formData.append('pwaScreenshotDesktop', screenshotDesktopState.file);
        if (screenshotMobileState.file) formData.append('pwaScreenshotMobile', screenshotMobileState.file);
        formData.append('removeLogo', String(removeLogo));
        formData.append('removeFavicon', String(removeFavicon));
        formData.append('removePwaIcon192', String(removePwaIcon192));
        formData.append('removePwaIcon512', String(removePwaIcon512));
        formData.append('removePwaIcon1024', String(removePwaIcon1024));
        formData.append('removeScreenshotDesktop', String(removeScreenshotDesktop));
        formData.append('removeScreenshotMobile', String(removeScreenshotMobile));

        const result = await updateBrandingAssets(formData);

        if (!result.success) {
          toast({ variant: 'destructive', title: 'Failed to update branding', description: result.error ?? undefined });
          return;
        }

        toast({ title: 'Branding updated successfully.' });
        router.refresh();
      } catch (error) {
        const description = error instanceof Error ? error.message : 'Unexpected error occurred.';
        toast({ variant: 'destructive', title: 'Failed to update branding', description });
      }
    });
  };

  const resetLogo = () => {
    if (logoState.preview) URL.revokeObjectURL(logoState.preview);
    setLogoState({ file: null, preview: null });
    setRemoveLogo(false);
  };

  const resetFavicon = () => {
    if (faviconState.preview) URL.revokeObjectURL(faviconState.preview);
    setFaviconState({ file: null, preview: null });
    setRemoveFavicon(false);
  };

  const resetPwaIconState = (
    state: FileState,
    setState: React.Dispatch<React.SetStateAction<FileState>>,
    setRemove: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (state.preview) URL.revokeObjectURL(state.preview);
    setState({ file: null, preview: null });
    setRemove(false);
  };

  const resetScreenshotState = (
    state: FileState,
    setState: React.Dispatch<React.SetStateAction<FileState>>,
    setRemove: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (state.preview) URL.revokeObjectURL(state.preview);
    setState({ file: null, preview: null });
    setRemove(false);
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-6">
        <CardHeader>
          <CardTitle>Branding assets</CardTitle>
          <CardDescription>Upload your custom logo, favicon, and Progressive Web App icons/screenshots for UniNest surfaces.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Primary logo</Label>
                  <p className="text-sm text-muted-foreground">Shown in navigation bars and admin surfaces.</p>
                </div>
                {(logoState.file || normalizedInitial.logoUrl) && (
                  <Button type="button" variant="ghost" size="icon" onClick={resetLogo} aria-label="Reset logo">
                    <Undo2 className="size-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                  {logoPreview ? (
                    <Image src={logoPreview} alt="Logo preview" fill className="object-contain p-2" sizes="96px" />
                  ) : (
                    <ImageIcon className="size-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={(event) => handleLogoChange(event.target.files?.[0] ?? null)}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">PNG, JPG, or SVG up to {MAX_LOGO_SIZE_MB}MB. Recommended height ≥ 64px.</p>
                  {normalizedInitial.logoUrl && (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remove-logo" checked={removeLogo} disabled={logoState.file !== null} onCheckedChange={(checked) => setRemoveLogo(Boolean(checked))} />
                      <Label htmlFor="remove-logo" className="text-sm text-muted-foreground">
                        Remove existing logo
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Favicon</Label>
                  <p className="text-sm text-muted-foreground">Displayed in browser tabs and bookmarks.</p>
                </div>
                {(faviconState.file || normalizedInitial.faviconUrl) && (
                  <Button type="button" variant="ghost" size="icon" onClick={resetFavicon} aria-label="Reset favicon">
                    <Undo2 className="size-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                  {faviconPreview ? (
                    <Image src={faviconPreview} alt="Favicon preview" fill className="object-contain p-2" sizes="80px" />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <Input
                    type="file"
                    accept="image/png,image/x-icon,image/svg+xml"
                    onChange={(event) => handleFaviconChange(event.target.files?.[0] ?? null)}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">PNG, ICO, or SVG up to {MAX_FAVICON_SIZE_MB}MB. Suggested size 32×32.</p>
                  {normalizedInitial.faviconUrl && (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remove-favicon" checked={removeFavicon} disabled={faviconState.file !== null} onCheckedChange={(checked) => setRemoveFavicon(Boolean(checked))} />
                      <Label htmlFor="remove-favicon" className="text-sm text-muted-foreground">
                        Remove existing favicon
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <Separator />

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">PWA icons</h3>
              <p className="text-sm text-muted-foreground">Recommended PNG files with transparent backgrounds.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>192 × 192</Label>
                    <p className="text-sm text-muted-foreground">App icon shown on Android launchers.</p>
                  </div>
                  {(pwaIcon192State.file || normalizedInitial.pwaIcon192Url) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => resetPwaIconState(pwaIcon192State, setPwaIcon192State, setRemovePwaIcon192)}
                      aria-label="Reset 192 icon"
                    >
                      <Undo2 className="size-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                    {pwaIcon192Preview ? (
                      <Image src={pwaIcon192Preview} alt="192 icon preview" fill className="object-contain p-2" sizes="96px" />
                    ) : (
                      <ImageIcon className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Input
                      type="file"
                      accept="image/png"
                      onChange={(event) => handlePwaIconChange(event.target.files?.[0] ?? null, setPwaIcon192State, setRemovePwaIcon192)}
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">PNG up to {MAX_PWA_ICON_SIZE_MB}MB.</p>
                    {normalizedInitial.pwaIcon192Url && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remove-pwa-icon-192"
                          checked={removePwaIcon192}
                          disabled={pwaIcon192State.file !== null}
                          onCheckedChange={(checked) => setRemovePwaIcon192(Boolean(checked))}
                        />
                        <Label htmlFor="remove-pwa-icon-192" className="text-sm text-muted-foreground">
                          Remove existing 192 icon
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>512 × 512</Label>
                    <p className="text-sm text-muted-foreground">High-resolution install icon.</p>
                  </div>
                  {(pwaIcon512State.file || normalizedInitial.pwaIcon512Url) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => resetPwaIconState(pwaIcon512State, setPwaIcon512State, setRemovePwaIcon512)}
                      aria-label="Reset 512 icon"
                    >
                      <Undo2 className="size-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                    {pwaIcon512Preview ? (
                      <Image src={pwaIcon512Preview} alt="512 icon preview" fill className="object-contain p-2" sizes="96px" />
                    ) : (
                      <ImageIcon className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Input
                      type="file"
                      accept="image/png"
                      onChange={(event) => handlePwaIconChange(event.target.files?.[0] ?? null, setPwaIcon512State, setRemovePwaIcon512)}
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">PNG up to {MAX_PWA_ICON_SIZE_MB}MB.</p>
                    {normalizedInitial.pwaIcon512Url && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remove-pwa-icon-512"
                          checked={removePwaIcon512}
                          disabled={pwaIcon512State.file !== null}
                          onCheckedChange={(checked) => setRemovePwaIcon512(Boolean(checked))}
                        />
                        <Label htmlFor="remove-pwa-icon-512" className="text-sm text-muted-foreground">
                          Remove existing 512 icon
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>1024 × 1024</Label>
                    <p className="text-sm text-muted-foreground">Large icon for app stores and desktops.</p>
                  </div>
                  {(pwaIcon1024State.file || normalizedInitial.pwaIcon1024Url) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => resetPwaIconState(pwaIcon1024State, setPwaIcon1024State, setRemovePwaIcon1024)}
                      aria-label="Reset 1024 icon"
                    >
                      <Undo2 className="size-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                    {pwaIcon1024Preview ? (
                      <Image src={pwaIcon1024Preview} alt="1024 icon preview" fill className="object-contain p-2" sizes="96px" />
                    ) : (
                      <ImageIcon className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Input
                      type="file"
                      accept="image/png"
                      onChange={(event) => handlePwaIconChange(event.target.files?.[0] ?? null, setPwaIcon1024State, setRemovePwaIcon1024)}
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">PNG up to {MAX_PWA_ICON_SIZE_MB}MB.</p>
                    {normalizedInitial.pwaIcon1024Url && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remove-pwa-icon-1024"
                          checked={removePwaIcon1024}
                          disabled={pwaIcon1024State.file !== null}
                          onCheckedChange={(checked) => setRemovePwaIcon1024(Boolean(checked))}
                        />
                        <Label htmlFor="remove-pwa-icon-1024" className="text-sm text-muted-foreground">
                          Remove existing 1024 icon
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">PWA screenshots</h3>
              <p className="text-sm text-muted-foreground">Showcase key app screens for install prompts.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Desktop screenshot</Label>
                    <p className="text-sm text-muted-foreground">Recommended size 1280 × 720.</p>
                  </div>
                  {(screenshotDesktopState.file || normalizedInitial.pwaScreenshotDesktopUrl) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => resetScreenshotState(screenshotDesktopState, setScreenshotDesktopState, setRemoveScreenshotDesktop)}
                      aria-label="Reset desktop screenshot"
                    >
                      <Undo2 className="size-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-28 w-44 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                    {screenshotDesktopPreview ? (
                      <Image src={screenshotDesktopPreview} alt="Desktop screenshot preview" fill className="object-cover" sizes="176px" />
                    ) : (
                      <ImageIcon className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(event) =>
                        handleScreenshotChange(event.target.files?.[0] ?? null, setScreenshotDesktopState, setRemoveScreenshotDesktop)
                      }
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">PNG or JPG up to {MAX_SCREENSHOT_SIZE_MB}MB.</p>
                    {normalizedInitial.pwaScreenshotDesktopUrl && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remove-screenshot-desktop"
                          checked={removeScreenshotDesktop}
                          disabled={screenshotDesktopState.file !== null}
                          onCheckedChange={(checked) => setRemoveScreenshotDesktop(Boolean(checked))}
                        />
                        <Label htmlFor="remove-screenshot-desktop" className="text-sm text-muted-foreground">
                          Remove existing desktop screenshot
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mobile screenshot</Label>
                    <p className="text-sm text-muted-foreground">Recommended size 540 × 960.</p>
                  </div>
                  {(screenshotMobileState.file || normalizedInitial.pwaScreenshotMobileUrl) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => resetScreenshotState(screenshotMobileState, setScreenshotMobileState, setRemoveScreenshotMobile)}
                      aria-label="Reset mobile screenshot"
                    >
                      <Undo2 className="size-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-40 w-28 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                    {screenshotMobilePreview ? (
                      <Image src={screenshotMobilePreview} alt="Mobile screenshot preview" fill className="object-cover" sizes="112px" />
                    ) : (
                      <ImageIcon className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(event) =>
                        handleScreenshotChange(event.target.files?.[0] ?? null, setScreenshotMobileState, setRemoveScreenshotMobile)
                      }
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">PNG or JPG up to {MAX_SCREENSHOT_SIZE_MB}MB.</p>
                    {normalizedInitial.pwaScreenshotMobileUrl && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remove-screenshot-mobile"
                          checked={removeScreenshotMobile}
                          disabled={screenshotMobileState.file !== null}
                          onCheckedChange={(checked) => setRemoveScreenshotMobile(Boolean(checked))}
                        />
                        <Label htmlFor="remove-screenshot-mobile" className="text-sm text-muted-foreground">
                          Remove existing mobile screenshot
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Upload className="mt-0.5 size-4" />
                <div>
                  <p className="font-medium text-foreground">Tip: transparent PNG/SVG</p>
                  <p>Create versions with transparent backgrounds to support both light and dark themes.</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Trash2 className="mt-0.5 size-4" />
                <div>
                  <p className="font-medium text-foreground">Remove and reset</p>
                  <p>Select "Remove" to revert any asset back to the UniNest default iconography.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end space-x-3">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save branding
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
