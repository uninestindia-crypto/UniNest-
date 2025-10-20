
'use client';

import { useState } from 'react';
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
