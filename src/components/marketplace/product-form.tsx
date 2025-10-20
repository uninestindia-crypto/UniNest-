
'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRazorpay } from '@/hooks/use-razorpay';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createProduct, updateProduct } from '@/app/marketplace/actions';

const studentCategories = ["Books", "Other Products"];

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Please provide a more detailed description.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string({ required_error: "Please select a category." }),
  image: z.any().optional(),
  location: z.string().optional(),
  phone_number: z.string().optional(),
  whatsapp_number: z.string().optional(),
  total_seats: z.string().optional(),
  opening_hours: z.string().optional(),
  amenities: z.string().optional(),
  meal_plan_breakfast: z.string().optional(),
  meal_plan_lunch: z.string().optional(),
  meal_plan_dinner: z.string().optional(),
  subscription_price: z.string().optional(),
  special_notes: z.string().optional(),
  room_types: z.string().optional(),
  utilities_included: z.string().optional(),
  house_rules: z.string().optional(),
  occupancy: z.string().optional(),
  furnishing: z.string().optional(),
  hourly_slots: z.string().optional(),
  services_offered: z.string().optional(),
  equipment_specs: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ProductFormProps = {
  product?: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
    location: string | null;
    phone_number?: string | null;
    whatsapp_number?: string | null;
    total_seats?: number | null;
    opening_hours?: string[] | null;
    amenities?: string[] | null;
    meal_plan?: { breakfast?: string | null; lunch?: string | null; dinner?: string | null } | null;
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
  };
  chargeForPosts?: boolean;
  postPrice?: number;
}

export default function ProductForm({ product, chargeForPosts = false, postPrice = 0 }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, supabase, role, vendorCategories: userVendorCategories, vendorSubscriptionStatus } = useAuth();
  const { openCheckout, isLoaded } = useRazorpay();
  const isEditMode = !!product;

  const formatList = useMemo(() => (value?: string[] | null) => (value && value.length > 0 ? value.join('\n') : ''), []);

  const getAvailableCategories = () => {
    if (role === 'vendor') {
        const vendorServices = (userVendorCategories || []).map((c: string) => {
            if (c === 'library') return 'Library';
            if (c === 'food mess') return 'Food Mess';
            if (c === 'cybercafe') return 'Cyber Café';
            if (c === 'hostels') return ['Hostels', 'Hostel Room'];
            return c;
        }).flat();
        
        if (isEditMode && product?.category && !vendorServices.includes(product.category)) {
            vendorServices.push(product.category);
        }
        return [...new Set(vendorServices)];
    }
    
    return studentCategories;
  }

  const availableCategories = getAvailableCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
      location: product?.location || '',
      phone_number: product?.phone_number || user?.user_metadata?.contact_number || '',
      whatsapp_number: product?.whatsapp_number || user?.user_metadata?.whatsapp_number || '',
      total_seats: product?.total_seats ? String(product.total_seats) : '',
      opening_hours: formatList(product?.opening_hours || null),
      amenities: formatList(product?.amenities || null),
      meal_plan_breakfast: product?.meal_plan?.breakfast || '',
      meal_plan_lunch: product?.meal_plan?.lunch || '',
      meal_plan_dinner: product?.meal_plan?.dinner || '',
      subscription_price: product?.subscription_price != null ? String(product.subscription_price) : '',
      special_notes: product?.special_notes || '',
      room_types: formatList(product?.room_types || null),
      utilities_included: formatList(product?.utilities_included || null),
      house_rules: product?.house_rules || '',
      occupancy: product?.occupancy != null ? String(product.occupancy) : '',
      furnishing: product?.furnishing || '',
      hourly_slots: formatList(product?.hourly_slots || null),
      services_offered: formatList(product?.services_offered || null),
      equipment_specs: product?.equipment_specs || '',
    },
  });
  
  const selectedCategory = form.watch('category');

  const handleFormSubmit = async (values: FormValues, paymentId?: string) => {
      setIsLoading(true);
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
              if (key === 'image' && value instanceof File) {
                  formData.append(key, value);
              } else if (typeof value !== 'object') {
                  formData.append(key, String(value));
              }
          }
      });
       if (paymentId) {
            formData.append('razorpay_payment_id', paymentId);
        }

      const result = isEditMode
          ? await updateProduct(product.id, formData)
          : await createProduct(formData);

      if (result.error) {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
          toast({ title: 'Success!', description: `Product ${isEditMode ? 'updated' : 'created'} successfully.` });
          const destination = role === 'vendor' ? '/vendor/products' : '/marketplace';
          router.push(destination);
          router.refresh();
      }

      setIsLoading(false);
  }

  async function onSubmit(values: FormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }

    if (role === 'vendor' && !vendorSubscriptionStatus.isVendorActive) {
        toast({
          variant: 'destructive',
          title: 'Access required',
          description: 'Activate your subscription or start a trial to publish listings.',
        });
        return;
    }

    const requireListField = (field: keyof FormValues, message: string) => {
      const current = values[field];
      if (!current || (typeof current === 'string' && current.trim().length === 0)) {
        toast({ variant: 'destructive', title: 'Missing information', description: message });
        return false;
      }
      return true;
    };

    if (selectedCategory === 'Library') {
      if (!requireListField('total_seats', 'Enter total seats for your library.')) return;
      if (!requireListField('opening_hours', 'Provide at least one time slot for your library.')) return;
    }

    if (selectedCategory === 'Hostels') {
      if (!requireListField('room_types', 'List the room types available.')) return;
      if (!requireListField('utilities_included', 'List the utilities included for your hostel.')) return;
    }

    if (selectedCategory === 'Hostel Room') {
      if (!requireListField('occupancy', 'Provide the occupancy (beds) for this room.')) return;
    }

    if (selectedCategory === 'Food Mess') {
      if (!requireListField('meal_plan_breakfast', 'Describe the breakfast plan.')) return;
      if (!requireListField('meal_plan_lunch', 'Describe the lunch plan.')) return;
      if (!requireListField('meal_plan_dinner', 'Describe the dinner plan.')) return;
    }

    if (selectedCategory === 'Cyber Café') {
      if (!requireListField('hourly_slots', 'List the hourly slots available.')) return;
      if (!requireListField('services_offered', 'List the services offered.')) return;
    }

    if (isEditMode) {
        await handleFormSubmit(values);
        return;
    }

    if (chargeForPosts && postPrice > 0) {
        setIsLoading(true);
        try {
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: postPrice * 100, currency: 'INR' }),
            });
        
            const order = await response.json();
            if (!response.ok) throw new Error(order.error || 'Failed to create payment order.');

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
                amount: order.amount,
                currency: order.currency,
                name: 'UniNest Listing Fee',
                description: `One-time fee for posting "${values.name}"`,
                order_id: order.id,
                handler: async function (response: any) {
                    await handleFormSubmit(values, response.razorpay_payment_id);
                },
                modal: { ondismiss: () => setIsLoading(false) },
                prefill: { name: user?.user_metadata?.full_name || '', email: user?.email || '' },
                notes: { type: 'listing_fee', userId: user?.id, productName: values.name },
                theme: { color: '#4A90E2' },
            };
            openCheckout(options);

        } catch(error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'Could not connect to the payment gateway.';
            toast({ variant: 'destructive', title: 'Payment Error', description: errorMessage });
            setIsLoading(false);
        }

    } else {
        await handleFormSubmit(values);
    }
  }
  
  const isLibraryOrHostel = selectedCategory === 'Library' || selectedCategory === 'Hostels';

  return (
    <Card>
        <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Listing' : 'Create New Listing'}</CardTitle>
            <CardDescription>{isEditMode ? 'Update the details below.' : 'All fields are required.'}</CardDescription>
        </CardHeader>
        <CardContent>
            {chargeForPosts && !isEditMode && postPrice > 0 && (
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Listing Fee</AlertTitle>
                    <AlertDescription>
                        A one-time fee of <strong>₹{postPrice}</strong> is required to publish this listing.
                    </AlertDescription>
                </Alert>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode || availableCategories.length === 0}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={availableCategories.length === 0 ? "No categories available for your account" : "Select a category"} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {availableCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {role === 'vendor' && availableCategories.length === 0 && (
                            <p className="text-sm text-muted-foreground">Go to <a href="/settings" className="underline text-primary">Settings</a> to select your vendor categories.</p>
                        )}
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>{selectedCategory === 'Library' ? 'Library Name' : selectedCategory === 'Hostels' ? 'Hostel Name' : selectedCategory === 'Hostel Room' ? 'Room Name/Number' : 'Product Name'}</FormLabel><FormControl><Input placeholder={selectedCategory === 'Library' ? "e.g., Central City Library" : "e.g., Gently Used Physics Textbook"} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your product, its condition, etc." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel>{selectedCategory === 'Library' ? 'Price per Seat (INR)' : selectedCategory === 'Hostel Room' ? 'Price per month (INR)' : 'Price (INR)'}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    {isLibraryOrHostel && (
                        <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Near Main Campus" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                    )}

                    {selectedCategory === 'Library' && (
                      <>
                        <FormField control={form.control} name="total_seats" render={({ field }) => (
                          <FormItem><FormLabel>Total Seats</FormLabel><FormControl><Input type="number" placeholder="e.g., 80" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="opening_hours" render={({ field }) => (
                          <FormItem><FormLabel>Time Slots / Opening Hours</FormLabel><FormControl><Textarea placeholder="One slot per line, e.g. 08:00 - 10:00" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="amenities" render={({ field }) => (
                          <FormItem><FormLabel>Amenities</FormLabel><FormControl><Textarea placeholder="List amenities, one per line" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </>
                    )}

                    {selectedCategory === 'Hostels' && (
                      <>
                        <FormField control={form.control} name="room_types" render={({ field }) => (
                          <FormItem><FormLabel>Room Types</FormLabel><FormControl><Textarea placeholder="One room type per line, e.g. Deluxe Twin - 2 beds - ₹12000" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="utilities_included" render={({ field }) => (
                          <FormItem><FormLabel>Utilities Included</FormLabel><FormControl><Textarea placeholder="One utility per line (Wi-Fi, Laundry, etc.)" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="house_rules" render={({ field }) => (
                          <FormItem><FormLabel>House Rules</FormLabel><FormControl><Textarea placeholder="Share important rules for tenants" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </>
                    )}

                    {selectedCategory === 'Hostel Room' && (
                      <>
                        <FormField control={form.control} name="occupancy" render={({ field }) => (
                          <FormItem><FormLabel>Occupancy (Beds)</FormLabel><FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="furnishing" render={({ field }) => (
                          <FormItem><FormLabel>Furnishing Details</FormLabel><FormControl><Textarea placeholder="Describe furniture and inclusions" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </>
                    )}

                    {selectedCategory === 'Food Mess' && (
                      <>
                        <FormField control={form.control} name="meal_plan_breakfast" render={({ field }) => (
                          <FormItem><FormLabel>Breakfast Plan</FormLabel><FormControl><Textarea placeholder="Describe breakfast items" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="meal_plan_lunch" render={({ field }) => (
                          <FormItem><FormLabel>Lunch Plan</FormLabel><FormControl><Textarea placeholder="Describe lunch items" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="meal_plan_dinner" render={({ field }) => (
                          <FormItem><FormLabel>Dinner Plan</FormLabel><FormControl><Textarea placeholder="Describe dinner items" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="subscription_price" render={({ field }) => (
                          <FormItem><FormLabel>Monthly Subscription Price (INR)</FormLabel><FormControl><Input type="number" placeholder="e.g., 4500" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="special_notes" render={({ field }) => (
                          <FormItem><FormLabel>Special Notes</FormLabel><FormControl><Textarea placeholder="Add dietary info, delivery options, etc." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </>
                    )}

                    {selectedCategory === 'Cyber Café' && (
                      <>
                        <FormField control={form.control} name="hourly_slots" render={({ field }) => (
                          <FormItem><FormLabel>Hourly Slots</FormLabel><FormControl><Textarea placeholder="List bookable slots, one per line" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="services_offered" render={({ field }) => (
                          <FormItem><FormLabel>Services Offered</FormLabel><FormControl><Textarea placeholder="List services such as Printing, Gaming PCs, etc." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="equipment_specs" render={({ field }) => (
                          <FormItem><FormLabel>Equipment Specifications</FormLabel><FormControl><Textarea placeholder="Highlight hardware specs or add-ons" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </>
                    )}

                    {role === 'vendor' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="phone_number" render={({ field }) => (
                                <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input type="tel" placeholder="Your business phone" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="whatsapp_number" render={({ field }) => (
                                <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input type="tel" placeholder="Your WhatsApp contact" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    )}
                   
                     <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormLabel>{isLibraryOrHostel ? 'Main Image' : 'Product Image'}</FormLabel>
                            {isEditMode && product.image_url && !value && (
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground mb-2">Current image:</p>
                                    <Image src={product.image_url} alt="Current product image" width={100} height={100} className="rounded-md" />
                                </div>
                            )}
                            <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl>
                            <FormMessage />
                        </FormItem>
                     )} />
                    <Button type="submit" disabled={isLoading || (chargeForPosts && !isEditMode && !isLoaded)}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode 
                            ? 'Save Changes' 
                            : chargeForPosts && postPrice > 0
                                ? `Proceed to Pay ₹${postPrice}`
                                : 'Create Listing'
                        }
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
