'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { updateBrandingAssets } from '@/app/admin/marketing/actions';
import type { BrandingAssets } from '@/lib/types';
import AssetUploader from './asset-uploader';
import { Loader2, Palette, Type, Smartphone, Hash } from 'lucide-react';

const getInitialAssets = (assets: BrandingAssets | null): BrandingAssets => ({
  logoUrl: assets?.logoUrl ?? null,
  faviconUrl: assets?.faviconUrl ?? null,
  pwaIcon192Url: assets?.pwaIcon192Url ?? null,
  pwaIcon512Url: assets?.pwaIcon512Url ?? null,
  pwaIcon1024Url: assets?.pwaIcon1024Url ?? null,
  pwaScreenshotDesktopUrl: assets?.pwaScreenshotDesktopUrl ?? null,
  pwaScreenshotMobileUrl: assets?.pwaScreenshotMobileUrl ?? null,
  primaryColor: assets?.primaryColor ?? '#4338CA', // Default indigo
  secondaryColor: assets?.secondaryColor ?? '#F97316', // Default orange
  brandName: assets?.brandName ?? 'UniNest',
  brandDescription: assets?.brandDescription ?? '',
});

type BrandingAssetsFormProps = {
  initialAssets: BrandingAssets | null;
};

type FileState = {
  file: File | null;
  remove: boolean;
};

export default function BrandingAssetsForm({ initialAssets }: BrandingAssetsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const normalizedInitial = useMemo(() => getInitialAssets(initialAssets), [initialAssets]);

  // Text & Colors
  const [brandName, setBrandName] = useState(normalizedInitial.brandName!);
  const [brandDescription, setBrandDescription] = useState(normalizedInitial.brandDescription!);
  const [primaryColor, setPrimaryColor] = useState(normalizedInitial.primaryColor!);
  const [secondaryColor, setSecondaryColor] = useState(normalizedInitial.secondaryColor!);

  // Files
  const [logo, setLogo] = useState<FileState>({ file: null, remove: false });
  const [favicon, setFavicon] = useState<FileState>({ file: null, remove: false });
  const [pwa192, setPwa192] = useState<FileState>({ file: null, remove: false });
  const [pwa512, setPwa512] = useState<FileState>({ file: null, remove: false });
  const [pwa1024, setPwa1024] = useState<FileState>({ file: null, remove: false });
  const [desktopShot, setDesktopShot] = useState<FileState>({ file: null, remove: false });
  const [mobileShot, setMobileShot] = useState<FileState>({ file: null, remove: false });

  // Reset effect when initialAssets change (e.g. after save)
  useEffect(() => {
    setLogo({ file: null, remove: false });
    setFavicon({ file: null, remove: false });
    setPwa192({ file: null, remove: false });
    setPwa512({ file: null, remove: false });
    setPwa1024({ file: null, remove: false });
    setDesktopShot({ file: null, remove: false });
    setMobileShot({ file: null, remove: false });
    // Text fields are controlled, we might want to update them if initial changes, useful for revalidation
    setBrandName(normalizedInitial.brandName!);
    setBrandDescription(normalizedInitial.brandDescription!);
    setPrimaryColor(normalizedInitial.primaryColor!);
    setSecondaryColor(normalizedInitial.secondaryColor!);
  }, [normalizedInitial]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData();

        // Text
        formData.append('brandName', brandName);
        formData.append('brandDescription', brandDescription);
        formData.append('primaryColor', primaryColor);
        formData.append('secondaryColor', secondaryColor);

        // Files
        if (logo.file) formData.append('logo', logo.file);
        if (favicon.file) formData.append('favicon', favicon.file);
        if (pwa192.file) formData.append('pwaIcon192', pwa192.file);
        if (pwa512.file) formData.append('pwaIcon512', pwa512.file);
        if (pwa1024.file) formData.append('pwaIcon1024', pwa1024.file);
        if (desktopShot.file) formData.append('pwaScreenshotDesktop', desktopShot.file);
        if (mobileShot.file) formData.append('pwaScreenshotMobile', mobileShot.file);

        // Remove flags
        formData.append('removeLogo', String(logo.remove));
        formData.append('removeFavicon', String(favicon.remove));
        formData.append('removePwaIcon192', String(pwa192.remove));
        formData.append('removePwaIcon512', String(pwa512.remove));
        formData.append('removePwaIcon1024', String(pwa1024.remove));
        formData.append('removeScreenshotDesktop', String(desktopShot.remove));
        formData.append('removeScreenshotMobile', String(mobileShot.remove));

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

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Brand Identity</h2>
        <p className="text-muted-foreground">Customize how your platform looks and feels.</p>
      </div>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-10 p-6">

          {/* Section: Brand Basics */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 text-lg font-semibold text-foreground">
              <Type className="size-5 text-primary" />
              <h3>Identity & Messaging</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. UniNest"
                />
                <p className="text-xs text-muted-foreground">Used in page titles and emails.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandDescription">Tagline / Description</Label>
                <Input
                  id="brandDescription"
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  placeholder="e.g. The Student Platform"
                />
                <p className="text-xs text-muted-foreground">Short description for meta tags.</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Section: Colors */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 text-lg font-semibold text-foreground">
              <Palette className="size-5 text-primary" />
              <h3>Color Palette</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full ring-1 ring-border shadow-sm">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%] cursor-pointer p-0 opacity-100"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Hash className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      value={primaryColor.replace('#', '')}
                      onChange={(e) => setPrimaryColor(`#${e.target.value}`)}
                      className="pl-8 font-mono uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Main brand color (buttons, links).</p>
              </div>

              <div className="space-y-3">
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full ring-1 ring-border shadow-sm">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="absolute -left-1/2 -top-1/2 h-[200%] w-[200%] cursor-pointer p-0 opacity-100"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Hash className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      value={secondaryColor.replace('#', '')}
                      onChange={(e) => setSecondaryColor(`#${e.target.value}`)}
                      className="pl-8 font-mono uppercase"
                      maxLength={7}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Accent color for highlights.</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Section: Assets */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 text-lg font-semibold text-foreground">
              <Smartphone className="size-5 text-primary" />
              <h3>Visual Assets</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <AssetUploader
                label="Primary Logo"
                description="Displayed in navigation and admin."
                currentUrl={normalizedInitial.logoUrl}
                onFileChange={(f) => setLogo(prev => ({ ...prev, file: f }))}
                onRemoveChange={(r) => setLogo(prev => ({ ...prev, remove: r }))}
                accept={{ 'image/png': [], 'image/svg+xml': [] }}
              />
              <AssetUploader
                label="Favicon"
                description="Browser tab icon (32x32)."
                currentUrl={normalizedInitial.faviconUrl}
                previewSize="sm"
                onFileChange={(f) => setFavicon(prev => ({ ...prev, file: f }))}
                onRemoveChange={(r) => setFavicon(prev => ({ ...prev, remove: r }))}
                accept={{ 'image/png': [], 'image/x-icon': [], 'image/svg+xml': [] }}
              />
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-medium text-foreground">PWA Icons (Mobile Install)</h4>
              <div className="grid gap-6 md:grid-cols-3">
                <AssetUploader
                  label="Icon 192px"
                  currentUrl={normalizedInitial.pwaIcon192Url}
                  previewSize="sm"
                  onFileChange={(f) => setPwa192(prev => ({ ...prev, file: f }))}
                  onRemoveChange={(r) => setPwa192(prev => ({ ...prev, remove: r }))}
                  accept={{ 'image/png': [] }}
                />
                <AssetUploader
                  label="Icon 512px"
                  currentUrl={normalizedInitial.pwaIcon512Url}
                  previewSize="md"
                  onFileChange={(f) => setPwa512(prev => ({ ...prev, file: f }))}
                  onRemoveChange={(r) => setPwa512(prev => ({ ...prev, remove: r }))}
                  accept={{ 'image/png': [] }}
                />
                <AssetUploader
                  label="Icon 1024px"
                  currentUrl={normalizedInitial.pwaIcon1024Url}
                  previewSize="md"
                  onFileChange={(f) => setPwa1024(prev => ({ ...prev, file: f }))}
                  onRemoveChange={(r) => setPwa1024(prev => ({ ...prev, remove: r }))}
                  accept={{ 'image/png': [] }}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-medium text-foreground">App Store Screenshots</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <AssetUploader
                  label="Desktop Screenshot"
                  description="1280x720 recommended."
                  currentUrl={normalizedInitial.pwaScreenshotDesktopUrl}
                  previewSize="wide"
                  onFileChange={(f) => setDesktopShot(prev => ({ ...prev, file: f }))}
                  onRemoveChange={(r) => setDesktopShot(prev => ({ ...prev, remove: r }))}
                  accept={{ 'image/png': [], 'image/jpeg': [] }}
                  maxSizeMB={5}
                />
                <AssetUploader
                  label="Mobile Screenshot"
                  description="540x960 recommended."
                  currentUrl={normalizedInitial.pwaScreenshotMobileUrl}
                  previewSize="mobile"
                  onFileChange={(f) => setMobileShot(prev => ({ ...prev, file: f }))}
                  onRemoveChange={(r) => setMobileShot(prev => ({ ...prev, remove: r }))}
                  accept={{ 'image/png': [], 'image/jpeg': [] }}
                  maxSizeMB={5}
                />
              </div>
            </div>

          </section>

        </CardContent>
        <CardFooter className="justify-end border-t bg-muted/20 p-6">
          <Button type="submit" size="lg" disabled={isPending} className="min-w-[150px]">
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
