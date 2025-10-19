

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
import { Loader2, User as UserIcon, Book, Utensils, Laptop, Bed, Info, AlertTriangle } from 'lucide-react';
import { useState, type ChangeEvent, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { useRazorpay } from '@/hooks/use-razorpay';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

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
  const { user, loading, supabase, role, vendorCategories: userVendorCategories } = useAuth();
  const { openCheckout, isLoaded } = useRazorpay();
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
  const vendorTrialStartedAt = user?.user_metadata?.vendor_trial_started_at
    ? new Date(user.user_metadata.vendor_trial_started_at)
    : null;
  const vendorTrialExpiresAt = user?.user_metadata?.vendor_trial_expires_at
    ? new Date(user.user_metadata.vendor_trial_expires_at)
    : null;
  const isTrialActive = vendorTrialExpiresAt ? new Date() <= vendorTrialExpiresAt : false;
  const hasRecordedPayment = Boolean(user?.user_metadata?.last_payment_id);
  const isVendorActive = rawVendorActive && (isTrialActive || hasRecordedPayment);
  const isTrialEligible = !vendorTrialStartedAt;

  const vendorMonetization = monetizationSettings?.vendor;
  const planPrice = vendorMonetization?.price_per_service_per_month ?? 100;
  const discountedPrice = 100;
  const originalPrice = 1000;
  const shouldCharge = selectedRole === 'vendor' && vendorMonetization?.charge_for_platform_access && vendorCategoryCount > 0;
  const requiresImmediatePayment = shouldCharge && !isTrialEligible && !isTrialActive && !isVendorActive && planPrice > 0;
  const totalCost = vendorCategoryCount * (vendorMonetization?.price_per_service_per_month ?? 0);
  const showPaymentAlert =
    selectedRole === 'vendor' &&
    vendorMonetization?.charge_for_platform_access &&
    !isVendorActive &&
    vendorCategoryCount > 0;
  const submitLabel = (() => {
    if (selectedRole !== 'vendor') return 'Save Changes';
    if (shouldCharge && isTrialEligible) return 'Activate Free Trial';
    if (requiresImmediatePayment) return `Pay ₹${discountedPrice}/mo (₹${originalPrice}/mo) and Save`;
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
    const wantsVendorRole = values.role === 'vendor';
    const hasSelectedServices = (values.vendorCategories?.length ?? 0) > 0;
    const planActive = wantsVendorRole && vendorSettings?.charge_for_platform_access && hasSelectedServices;
    const planPriceForSubmission = vendorSettings?.price_per_service_per_month ?? discountedPrice;
    const requiresPayment = planActive && !isTrialEligible && !isTrialActive && !isVendorActive;

    if (planActive && isTrialEligible) {
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
      const totalCost = planPriceForSubmission;

      if (totalCost <= 0) {
        // If cost is zero, just activate them
        await saveProfile(values, { activateVendor: true });
        return;
      }
  
      try {
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalCost * 100, currency: 'INR' }),
        });
  
        const order = await response.json();
        if (!response.ok) throw new Error(order.error || 'Failed to create payment order.');
  
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'UniNest Vendor Subscription',
          description: `Monthly access at ₹${discountedPrice} (₹${originalPrice} value).`,
          order_id: order.id,
          handler: async (response: any) => {
            // On successful payment, save the profile with active status
            await saveProfile(values, {
              activateVendor: true,
              paymentId: response.razorpay_payment_id,
            });
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
      await saveProfile(values, { activateVendor: isVendorActive });
    }
  };

  type SaveProfileOptions = {
    activateVendor?: boolean;
    paymentId?: string;
    trial?: {
      startedAt: string;
      expiresAt: string;
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
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>Please log in to view your settings.</div>
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{role === 'vendor' ? 'Vendor Profile' : 'Student Profile'}</CardTitle>
          <CardDescription>Update your avatar. This will be visible to other users.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="size-24">
                <AvatarImage src={previewUrl || user?.user_metadata?.avatar_url || ''} alt="User avatar" />
                <AvatarFallback>
                    <UserIcon className="size-12" />
                </AvatarFallback>
            </Avatar>
            <div className="grid w-full max-w-sm items-center gap-2">
                <Input id="picture" type="file" onChange={(e) => handleFileChange(e, 'avatar')} accept="image/png, image/jpeg" />
                <Button onClick={handlePhotoUpload} disabled={isPhotoLoading || !selectedFile}>
                    {isPhotoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload Photo
                </Button>
            </div>
        </CardContent>
      </Card>
      
      {role === 'vendor' && (
        <Card>
            <CardHeader>
            <CardTitle>Shop Banner</CardTitle>
            <CardDescription>Upload a banner image for your shop profile page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {bannerPreviewUrl && (
                    <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden">
                        <Image src={bannerPreviewUrl} alt="Banner preview" fill objectFit="cover"/>
                    </div>
                )}
                <div className="grid w-full max-w-sm items-center gap-2">
                    <Input id="banner" type="file" onChange={(e) => handleFileChange(e, 'banner')} accept="image/png, image/jpeg" />
                    <Button onClick={handleBannerUpload} disabled={isBannerLoading || !selectedBannerFile}>
                        {isBannerLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload Banner
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
               <FormField
                control={profileForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I am a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="student" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Student
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="vendor" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Vendor
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {profileForm.watch('role') === 'vendor' && (
                <FormField
                  control={profileForm.control}
                  name="vendorCategories"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Services Provided</FormLabel>
                        <FormDescription>
                          Select the categories that apply to your business.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {vendorCategoriesList.map((item) => (
                          <FormField
                            key={item.id}
                            control={profileForm.control}
                            name="vendorCategories"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
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
                                  <FormLabel className="font-normal flex items-center gap-2">
                                      <item.icon className="size-4" />
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
              )}

              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
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
                      <Input placeholder="your_unique_handle" {...field} />
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
                      <Input placeholder="name@example.com" {...field} disabled />
                    </FormControl>
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
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {profileForm.watch('role') === 'vendor' && (
                  <Card className="bg-muted/50 p-4">
                    <h4 className="font-semibold mb-2">Business Details</h4>
                     <FormField
                        control={profileForm.control}
                        name="openingHours"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Opening Hours / Time Slots</FormLabel>
                            <FormDescription>For libraries or services, list each available shift on a new line (e.g., 9am-1pm).</FormDescription>
                            <FormControl>
                            <Textarea placeholder={"9am - 1pm\n2pm - 8pm"} className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                  </Card>
              )}

              <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitLabel}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password here. Make sure it is a strong one.</CardDescription>
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
                        <Input type="password" placeholder="••••••••" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" disabled={isPasswordLoading}>
                 {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    