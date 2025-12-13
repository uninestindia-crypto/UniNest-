'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User as UserIcon, Book, Utensils, Laptop, Bed, Store, Shield, UserCircle } from 'lucide-react';
import { useState, type ChangeEvent, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { useRazorpay } from '@/hooks/use-razorpay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const vendorCategoriesList = [
  { id: "library", label: "Library", icon: Book },
  { id: "food mess", label: "Food Mess", icon: Utensils },
  { id: "cybercafe", label: "Cyber Café", icon: Laptop },
  { id: "hostels", label: "Hostels", icon: Bed },
] as const;

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email(),
  handle: z.string().min(3, { message: 'Handle must be at least 3 characters.' }).regex(/^[a-z0-9_]+$/, 'Handle can only contain lowercase letters, numbers, and underscores.'),
  contactNumber: z.string().optional(),
  bio: z.string().max(200, 'Bio must not exceed 200 characters.').optional(),
  openingHours: z.string().max(200, 'Opening hours must not exceed 200 characters.').optional(),
  role: z.enum(['student', 'vendor']),
  vendorCategories: z.array(z.string()).optional(),
});

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});


export default function SettingsContent() {
  const { toast } = useToast();
  const { user, loading, supabase, role } = useAuth();
  const { openCheckout } = useRazorpay();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isBannerLoading, setIsBannerLoading] = useState(false);
  const [monetizationSettings, setMonetizationSettings] = useState<any>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      handle: user?.user_metadata?.handle || '',
      contactNumber: user?.user_metadata?.contact_number || '',
      bio: user?.user_metadata?.bio || '',
      openingHours: user?.user_metadata?.opening_hours || '',
      role: user?.user_metadata?.role || 'student',
      vendorCategories: user?.user_metadata?.vendor_categories || [],
    },
  });

  const selectedRole = profileForm.watch('role');
  const watchedVendorCategories = profileForm.watch('vendorCategories');
  const vendorCategoryCount = watchedVendorCategories?.length ?? 0;
  const rawVendorActive = user?.user_metadata?.is_vendor_active || false;
  const vendorTrialExpiresAt = user?.user_metadata?.vendor_trial_expires_at
    ? new Date(user.user_metadata.vendor_trial_expires_at)
    : null;
  const isTrialActive = vendorTrialExpiresAt ? new Date() <= vendorTrialExpiresAt : false;
  const hasRecordedPayment = Boolean(user?.user_metadata?.last_payment_id);
  const isVendorActive = rawVendorActive && (isTrialActive || hasRecordedPayment);
  const isTrialEligible = !user?.user_metadata?.vendor_trial_started_at;

  const vendorMonetization = monetizationSettings?.vendor;
  const monetizationStartDate = monetizationSettings?.start_date ? new Date(monetizationSettings.start_date) : null;
  const monetizationHasStarted = !monetizationStartDate || new Date() >= monetizationStartDate;
  const pricePerService = vendorMonetization?.price_per_service_per_month ?? 0;
  const totalCost = vendorCategoryCount * pricePerService;
  const isChargeEnabled = Boolean(vendorMonetization?.charge_for_platform_access && monetizationHasStarted);
  const shouldCharge = selectedRole === 'vendor' && isChargeEnabled && vendorCategoryCount > 0;
  const requiresImmediatePayment = shouldCharge && !isTrialEligible && !isTrialActive && !isVendorActive && totalCost > 0;
  const submitLabel = (() => {
    if (selectedRole !== 'vendor') return 'Save Changes';
    if (shouldCharge && isTrialEligible) return 'Activate Free Trial';
    if (requiresImmediatePayment) return `Pay ₹${totalCost.toLocaleString('en-IN')}/mo`;
    if (shouldCharge && totalCost > 0) return `Pay ₹${totalCost.toLocaleString('en-IN')}/mo`;
    return 'Save Changes';
  })();

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const fetchMonetizationSettings = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'monetization')
        .single();
      setMonetizationSettings(data?.value);
    };

    fetchMonetizationSettings();

    if (user) {
      profileForm.reset({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        handle: user.user_metadata?.handle || '',
        contactNumber: user.user_metadata?.contact_number || '',
        bio: user.user_metadata?.bio || '',
        openingHours: user.user_metadata?.opening_hours || '',
        role: user.user_metadata?.role || 'student',
        vendorCategories: user.user_metadata?.vendor_categories || [],
      })
      if (user.user_metadata?.banner_url) {
        setBannerPreviewUrl(user.user_metadata.banner_url);
      }
    }
  }, [user, profileForm, supabase]);

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;

    const vendorSettings = monetizationSettings?.vendor;
    const monetizationStartDate = monetizationSettings?.start_date ? new Date(monetizationSettings.start_date) : null;
    const monetizationHasStarted = !monetizationStartDate || new Date() >= monetizationStartDate;
    const wantsVendorRole = values.role === 'vendor';
    const hasSelectedServices = (values.vendorCategories?.length ?? 0) > 0;
    const pricePerService = vendorSettings?.price_per_service_per_month ?? 0;
    const totalSelectedCost = (values.vendorCategories?.length ?? 0) * pricePerService;
    const chargeEnabled = Boolean(vendorSettings?.charge_for_platform_access && monetizationHasStarted);
    const shouldCharge = wantsVendorRole && chargeEnabled && hasSelectedServices;
    const requiresPayment = shouldCharge && !isTrialEligible && !isTrialActive && !isVendorActive && totalSelectedCost > 0;
    const canActivateVendor = wantsVendorRole && hasSelectedServices;

    if (shouldCharge && isTrialEligible) {
      const trialStart = new Date();
      const trialEnd = new Date(trialStart);
      trialEnd.setMonth(trialEnd.getMonth() + 3);
      await saveProfile(values, {
        activateVendor: true,
        trial: {
          startedAt: trialStart.toISOString(),
          expiresAt: trialEnd.toISOString(),
        },
      });
      return;
    }

    if (requiresPayment) {
      if (totalSelectedCost <= 0) {
        // If cost is zero, just activate them
        await saveProfile(values, { activateVendor: true });
        return;
      }

      setIsProfileLoading(true);

      try {
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalSelectedCost * 100, currency: 'INR' }),
        });

        const order = await response.json();
        if (!response.ok) throw new Error(order.error || 'Failed to create payment order.');

        const paidAmount = order.amount / 100;

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'UniNest Vendor Subscription',
          description: `Monthly access for ${values.vendorCategories?.length ?? 0} service${(values.vendorCategories?.length ?? 0) === 1 ? '' : 's'}.`,
          order_id: order.id,
          handler: async (paymentResponse: any, accessToken: string) => {
            if (!accessToken) {
              toast({ variant: 'destructive', title: 'Authentication Error', description: 'Session expired. Please log in again and retry payment.' });
              setIsProfileLoading(false);
              return;
            }

            const billingStart = new Date();
            const billingEnd = new Date(billingStart);
            billingEnd.setMonth(billingEnd.getMonth() + 1);

            try {
              const verificationResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  orderId: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  type: 'vendor_subscription',
                  amount: paidAmount,
                  servicesCount: values.vendorCategories?.length ?? 0,
                  categories: values.vendorCategories ?? [],
                  currency: order.currency,
                  billingPeriodStart: billingStart.toISOString(),
                  billingPeriodEnd: billingEnd.toISOString(),
                }),
              });

              const verificationResult = await verificationResponse.json();
              if (!verificationResponse.ok) {
                throw new Error(verificationResult.error || 'Failed to verify payment.');
              }

              const subscriptionPeriod = {
                billingPeriodStart: verificationResult.subscription?.billingPeriodStart ?? billingStart.toISOString(),
                billingPeriodEnd: verificationResult.subscription?.billingPeriodEnd ?? billingEnd.toISOString(),
              };

              await saveProfile(values, {
                activateVendor: true,
                paymentId: paymentResponse.razorpay_payment_id,
                subscription: subscriptionPeriod,
              });
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to verify payment.';
              toast({ variant: 'destructive', title: 'Payment Verification Failed', description: message });
              setIsProfileLoading(false);
            }
          },
          modal: { ondismiss: () => setIsProfileLoading(false) },
          prefill: { name: user.user_metadata?.full_name || '', email: user.email || '' },
          notes: { type: 'vendor_subscription', userId: user.id },
          theme: { color: '#4A90E2' },
        };
        openCheckout(options);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Could not connect to payment gateway.';
        toast({ variant: 'destructive', title: 'Payment Error', description: errorMessage });
        setIsProfileLoading(false);
      }
    } else {
      // No payment required, just save the profile
      await saveProfile(values, { activateVendor: canActivateVendor });
    }
  };

  type SaveProfileOptions = {
    activateVendor?: boolean;
    paymentId?: string;
    trial?: {
      startedAt: string;
      expiresAt: string;
    };
    subscription?: {
      billingPeriodStart: string;
      billingPeriodEnd: string;
    };
  };

  async function saveProfile(values: z.infer<typeof profileFormSchema>, options: SaveProfileOptions = {}) {
    if (!user || !supabase) return;
    setIsProfileLoading(true);

    const shouldActivateVendor = options.activateVendor ?? false;
    const userData = {
      ...user.user_metadata,
      full_name: values.fullName,
      handle: values.handle,
      contact_number: values.contactNumber,
      bio: values.bio,
      role: values.role,
      opening_hours: values.role === 'vendor' ? values.openingHours : undefined,
      vendor_categories: values.role === 'vendor' ? values.vendorCategories : [],
      is_vendor_active: values.role === 'vendor' ? shouldActivateVendor : false,
      last_payment_id: options.paymentId || user.user_metadata?.last_payment_id,
      vendor_trial_started_at: options.trial?.startedAt || user.user_metadata?.vendor_trial_started_at,
      vendor_trial_expires_at: options.trial?.expiresAt || user.user_metadata?.vendor_trial_expires_at,
      vendor_subscription_start_at: options.subscription?.billingPeriodStart || user.user_metadata?.vendor_subscription_start_at,
      vendor_subscription_end_at: options.subscription?.billingPeriodEnd || user.user_metadata?.vendor_subscription_end_at,
    };

    const { error: authError } = await supabase.auth.updateUser({ data: userData });
    if (authError) {
      toast({ variant: 'destructive', title: 'Auth Error', description: authError.message });
      setIsProfileLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').update({
      full_name: values.fullName,
      handle: values.handle,
      role: values.role,
    }).eq('id', user.id);

    if (profileError) {
      toast({ variant: 'destructive', title: 'Profile Error', description: 'Could not update public profile. ' + profileError.message });
    } else {
      toast({ title: 'Profile Updated', description: 'Your profile has been updated successfully.' });
      window.location.reload();
    }
    setIsProfileLoading(false);
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      passwordForm.reset();
    }
    setIsPasswordLoading(false);
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      const maxSize = 4 * 1024 * 1024; // 4MB

      if (!allowedTypes.includes(file.type)) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a JPG or PNG image.' });
        return;
      }
      if (file.size > maxSize) {
        toast({ variant: 'destructive', title: 'File Too Large', description: `Please select an image smaller than ${maxSize / 1024 / 1024}MB.` });
        return;
      }

      if (type === 'avatar') {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setSelectedBannerFile(file);
        setBannerPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile || !user) {
      toast({ variant: 'destructive', title: 'No file selected', description: 'Please select a photo to upload.' });
      return;
    }
    setIsPhotoLoading(true);

    const filePath = `${user.id}/${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, selectedFile);

    if (uploadError) {
      toast({ variant: 'destructive', title: 'Upload Error', description: uploadError.message });
      setIsPhotoLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: userUpdateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (userUpdateError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update profile picture in auth.' });
      setIsPhotoLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (profileError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update public profile picture.' });
    } else {
      toast({ title: 'Photo Uploaded', description: 'Your profile picture has been updated.' });
      setPreviewUrl(null);
      setSelectedFile(null);
      window.location.reload();
    }
    setIsPhotoLoading(false);
  }

  const handleBannerUpload = async () => {
    if (!selectedBannerFile || !user) {
      toast({ variant: 'destructive', title: 'No file selected', description: 'Please select a banner to upload.' });
      return;
    }
    setIsBannerLoading(true);

    const filePath = `${user.id}/banner-${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, selectedBannerFile);

    if (uploadError) {
      toast({ variant: 'destructive', title: 'Upload Error', description: uploadError.message });
      setIsBannerLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    const { error: userUpdateError } = await supabase.auth.updateUser({
      data: { banner_url: publicUrl }
    });

    if (userUpdateError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update banner in auth.' });
      setIsBannerLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ banner_url: publicUrl })
      .eq('id', user.id);

    if (profileError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update public profile banner.' });
    } else {
      toast({ title: 'Banner Uploaded', description: 'Your profile banner has been updated.' });
      setBannerPreviewUrl(null);
      setSelectedBannerFile(null);
      window.location.reload();
    }
    setIsBannerLoading(false);
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-destructive">Please log in to view your settings.</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, business details, and security preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border/50">
          <TabsTrigger value="profile" className="gap-2">
            <UserCircle className="size-4" />
            Profile
          </TabsTrigger>
          {role === 'vendor' && (
            <TabsTrigger value="shop" className="gap-2">
              <Store className="size-4" />
              Shop Details
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="gap-2">
            <Shield className="size-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid gap-6 md:grid-cols-[250px_1fr]">
            {/* Avatar Column */}
            <Card className="border-border/50 shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Avatar</CardTitle>
                <CardDescription>Your public profile picture.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="size-32 border-4 border-muted">
                  <AvatarImage src={previewUrl || user?.user_metadata?.avatar_url || ''} alt="User avatar" className="object-cover" />
                  <AvatarFallback>
                    <UserIcon className="size-12 opacity-50" />
                  </AvatarFallback>
                </Avatar>
                <div className="w-full space-y-2">
                  <Input id="picture" type="file" onChange={(e) => handleFileChange(e, 'avatar')} accept="image/png, image/jpeg" className="text-xs" />
                  <Button onClick={handlePhotoUpload} disabled={isPhotoLoading || !selectedFile} size="sm" className="w-full" variant="secondary">
                    {isPhotoLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Update Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info Column */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your personal details visible to others.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem className="space-y-2 md:col-span-2">
                            <FormLabel>I am a...</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                                  <FormControl>
                                    <RadioGroupItem value="student" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex items-center gap-2">
                                    <UserIcon className="size-4" /> Student
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                                  <FormControl>
                                    <RadioGroupItem value="vendor" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer flex items-center gap-2">
                                    <Store className="size-4" /> Vendor
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="bg-muted/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="handle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="john_doe" {...field} className="bg-muted/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="name@example.com" {...field} disabled className="bg-muted" />
                            </FormControl>
                            <FormDescription className="text-xs">Email cannot be changed.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 99999 99999" {...field} className="bg-muted/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us a little bit about yourself..."
                              className="resize-none min-h-[100px] bg-muted/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isProfileLoading} className="min-w-[150px]">
                        {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {profileForm.watch('role') === 'student' ? 'Save Profile' : 'Next Step (Shop)'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shop Tab (Vendor Only) */}
        {role === 'vendor' && (
          <TabsContent value="shop" className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid gap-6 md:grid-cols-1">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Shop Details</CardTitle>
                  <CardDescription>Configure your business presence and services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Banner Section */}
                  <div className="space-y-4 rounded-lg bg-muted/30 p-4 border border-border/30">
                    <h4 className="font-medium text-sm">Shop Banner</h4>
                    {bannerPreviewUrl && (
                      <div className="relative w-full aspect-[21/9] rounded-md overflow-hidden bg-muted border">
                        <Image src={bannerPreviewUrl} alt="Banner preview" fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex gap-4 items-center">
                      <Input id="banner" type="file" onChange={(e) => handleFileChange(e, 'banner')} accept="image/png, image/jpeg" className="max-w-xs bg-background" />
                      <Button onClick={handleBannerUpload} disabled={isBannerLoading || !selectedBannerFile} size="sm" variant="secondary">
                        {isBannerLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        Upload Banner
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="vendorCategories"
                        render={() => (
                          <FormItem>
                            <FormLabel>Services Provided</FormLabel>
                            <FormDescription>Select the categories that define your business.</FormDescription>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                              {vendorCategoriesList.map((item) => (
                                <FormField
                                  key={item.id}
                                  control={profileForm.control}
                                  name="vendorCategories"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item.id}
                                        className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), item.id])
                                                : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer w-full">
                                          <item.icon className="size-4 text-muted-foreground" />
                                          {item.label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="openingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opening Hours</FormLabel>
                            <FormControl>
                              <Textarea placeholder={"9am - 1pm\n2pm - 8pm"} className="resize-none font-mono text-sm bg-muted/20" rows={4} {...field} />
                            </FormControl>
                            <FormDescription>For multiple slots, use new lines.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isProfileLoading} size="lg">
                          {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {submitLabel}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card className="border-border/50 shadow-sm max-w-xl">
            <CardHeader>
              <CardTitle className="text-lg">Security & Password</CardTitle>
              <CardDescription>Manage your password and authentication settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="bg-muted/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="bg-muted/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPasswordLoading} variant="destructive" className="w-full mt-4">
                    {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}