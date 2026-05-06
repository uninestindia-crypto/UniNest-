'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Tag, Trash2, Plus, Loader2, Percent, Calendar, Package } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};

type Offer = {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  productId: number | null;
  productName: string | null;
  validUntil: string | null;
  createdAt: string;
  isActive: boolean;
};

type VendorPromotionsContentProps = {
  vendorId: string;
  initialOffers: Offer[];
  products: Product[];
};

export default function VendorPromotionsContent({
  vendorId,
  initialOffers,
  products,
}: VendorPromotionsContentProps) {
  const { toast } = useToast();
  const { supabase } = useAuth();
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [validUntil, setValidUntil] = useState('');

  const saveOffers = async (updatedOffers: Offer[]) => {
    if (!supabase) return;
    await supabase.from('platform_settings').upsert({
      key: `vendor_offers_${vendorId}`,
      value: updatedOffers,
    });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Title required', description: 'Give your offer a title.' });
      return;
    }
    const discount = Number(discountPercent);
    if (!discount || discount < 1 || discount > 90) {
      toast({ variant: 'destructive', title: 'Invalid discount', description: 'Enter a discount between 1% and 90%.' });
      return;
    }

    setIsSaving(true);
    try {
      const selectedProduct = products.find((p) => p.id === Number(selectedProductId));
      const newOffer: Offer = {
        id: `offer_${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        discountPercent: discount,
        productId: selectedProduct?.id || null,
        productName: selectedProduct?.name || null,
        validUntil: validUntil || null,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      const updatedOffers = [newOffer, ...offers];
      await saveOffers(updatedOffers);
      setOffers(updatedOffers);

      // Reset form
      setTitle('');
      setDescription('');
      setDiscountPercent('');
      setSelectedProductId('');
      setValidUntil('');
      setShowForm(false);

      toast({ title: 'Offer created!', description: `"${newOffer.title}" is now visible to students.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save the offer. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (offerId: string) => {
    const updatedOffers = offers.map((o) => (o.id === offerId ? { ...o, isActive: !o.isActive } : o));
    setOffers(updatedOffers);
    await saveOffers(updatedOffers);
    toast({ title: 'Updated', description: 'Offer status changed.' });
  };

  const handleDelete = async (offerId: string) => {
    setIsDeleting(offerId);
    try {
      const updatedOffers = offers.filter((o) => o.id !== offerId);
      await saveOffers(updatedOffers);
      setOffers(updatedOffers);
      toast({ title: 'Offer removed', description: 'The offer has been deleted.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the offer.' });
    } finally {
      setIsDeleting(null);
    }
  };

  const activeOffers = offers.filter((o) => o.isActive);
  const inactiveOffers = offers.filter((o) => !o.isActive);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-card border shadow-sm p-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="size-6 text-primary" />
            Offers & Discounts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create special offers to attract more students to your listings.
          </p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)} className="w-full sm:w-auto">
          <Plus className="mr-2 size-4" />
          {showForm ? 'Cancel' : 'Create Offer'}
        </Button>
      </div>

      {/* Create Offer Form */}
      {showForm && (
        <Card className="rounded-2xl shadow-sm border border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">New Offer</CardTitle>
            <CardDescription>Fill in the details below. Students will see this on your listing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="offer-title">Offer Title *</Label>
                <Input
                  id="offer-title"
                  placeholder="e.g. Summer Special - 20% Off"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-discount">Discount % *</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="offer-discount"
                    type="number"
                    min={1}
                    max={90}
                    placeholder="e.g. 20"
                    className="pl-9"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="offer-product">Apply to (Optional)</Label>
                <select
                  id="offer-product"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All my listings</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-valid">Valid Until (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="offer-valid"
                    type="date"
                    className="pl-9"
                    value={validUntil}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-description">Description (Optional)</Label>
              <Textarea
                id="offer-description"
                placeholder="e.g. Available for new students joining this semester. Contact us to avail."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleCreate} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Offer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Offers */}
      {activeOffers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Active Offers ({activeOffers.length})
          </h2>
          {activeOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onToggle={handleToggleActive}
              onDelete={handleDelete}
              isDeleting={isDeleting === offer.id}
            />
          ))}
        </div>
      )}

      {/* Paused Offers */}
      {inactiveOffers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Paused ({inactiveOffers.length})
          </h2>
          {inactiveOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onToggle={handleToggleActive}
              onDelete={handleDelete}
              isDeleting={isDeleting === offer.id}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {offers.length === 0 && !showForm && (
        <Card className="rounded-2xl border-dashed border-2 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Tag className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Create a discount offer to attract more students. Offers appear directly on your listing page.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 size-4" />
              Create Your First Offer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="rounded-2xl border bg-muted/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-2 text-foreground">💡 Tips for effective offers</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Use offers at semester start (June & December) for maximum impact</li>
            <li>• A 10–20% discount is enough to stand out without hurting profit</li>
            <li>• Add a deadline to create urgency — "Valid until 30 June"</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function OfferCard({
  offer,
  onToggle,
  onDelete,
  isDeleting,
}: {
  offer: Offer;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const isExpired = offer.validUntil ? new Date(offer.validUntil) < new Date() : false;

  return (
    <Card className={`rounded-2xl border shadow-sm ${!offer.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-semibold">{offer.title}</span>
              <Badge variant="secondary" className="text-xs font-bold text-green-700 bg-green-100">
                {offer.discountPercent}% OFF
              </Badge>
              {isExpired && (
                <Badge variant="outline" className="text-xs text-red-500 border-red-300">
                  Expired
                </Badge>
              )}
              {!offer.isActive && (
                <Badge variant="outline" className="text-xs">
                  Paused
                </Badge>
              )}
            </div>
            {offer.description && (
              <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              {offer.productName ? (
                <span className="flex items-center gap-1">
                  <Package className="size-3" /> {offer.productName}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Package className="size-3" /> All listings
                </span>
              )}
              {offer.validUntil && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  Until {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(offer.id)}
              className="text-xs"
            >
              {offer.isActive ? 'Pause' : 'Activate'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8"
              onClick={() => onDelete(offer.id)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
