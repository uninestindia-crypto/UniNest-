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

const toMB = (bytes: number) => bytes / (1024 * 1024);

const getInitialAssets = (assets: BrandingAssets | null): BrandingAssets => ({
  logoUrl: assets?.logoUrl ?? null,
  faviconUrl: assets?.faviconUrl ?? null,
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
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeFavicon, setRemoveFavicon] = useState(false);

  useEffect(() => () => {
    if (logoState.preview) URL.revokeObjectURL(logoState.preview);
    if (faviconState.preview) URL.revokeObjectURL(faviconState.preview);
  }, [logoState.preview, faviconState.preview]);

  useEffect(() => {
    setRemoveLogo(false);
    setRemoveFavicon(false);
    setLogoState({ file: null, preview: null });
    setFaviconState({ file: null, preview: null });
  }, [normalizedInitial.logoUrl, normalizedInitial.faviconUrl]);

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

  const logoPreview = logoState.preview ?? (!removeLogo ? normalizedInitial.logoUrl : null);
  const faviconPreview = faviconState.preview ?? (!removeFavicon ? normalizedInitial.faviconUrl : null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData();
        if (logoState.file) formData.append('logo', logoState.file);
        if (faviconState.file) formData.append('favicon', faviconState.file);
        formData.append('removeLogo', String(removeLogo));
        formData.append('removeFavicon', String(removeFavicon));

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

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-6">
        <CardHeader>
          <CardTitle>Branding assets</CardTitle>
          <CardDescription>Upload your custom logo and favicon for UniNest surfaces.</CardDescription>
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
