'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { PlatformSettings } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { updateSettings } from '@/app/admin/settings/actions';

const studentMonetizationSettingSchema = z.object({
  charge_for_posts: z.boolean(),
  post_price: z.coerce.number().min(0, 'Price must be a positive number.'),
});

const vendorMonetizationSettingSchema = z.object({
  charge_for_platform_access: z.boolean(),
  price_per_service_per_month: z.coerce.number().min(0, 'Price must be a positive number.'),
});

const applicationVisibilitySchema = z.object({
  showCompetitionApplicants: z.boolean(),
  showInternshipApplicants: z.boolean(),
});

const formSchema = z.object({
  student: studentMonetizationSettingSchema,
  vendor: vendorMonetizationSettingSchema,
  applicationVisibility: applicationVisibilitySchema,
  start_date: z.date().optional().nullable(),
});

type SettingsFormProps = {
    currentSettings: PlatformSettings;
}

export default function SettingsForm({ currentSettings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        student: {
            charge_for_posts: currentSettings.student.charge_for_posts,
            post_price: currentSettings.student.post_price,
        },
        vendor: {
            charge_for_platform_access: currentSettings.vendor.charge_for_platform_access,
            price_per_service_per_month: currentSettings.vendor.price_per_service_per_month,
        },
        applicationVisibility: {
            showCompetitionApplicants: currentSettings.applicationVisibility.showCompetitionApplicants,
            showInternshipApplicants: currentSettings.applicationVisibility.showInternshipApplicants,
        },
        start_date: currentSettings.start_date ? new Date(currentSettings.start_date) : null,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Prepare the data for the server action, ensuring date is a string
    const dataToSend = {
      ...values,
      start_date: values.start_date ? values.start_date.toISOString() : null,
    };

    try {
        const result = await updateSettings(dataToSend);

        if (result.error) {
            throw new Error(result.error);
        }

        toast({ title: 'Success', description: 'Settings updated successfully.' });
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg">
        
        {/* Student Settings */}
        <div className='space-y-6 rounded-lg border p-4'>
            <h3 className="text-lg font-semibold">Student Monetization</h3>
            <FormField
            control={form.control}
            name="student.charge_for_posts"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
                <div className="space-y-0.5">
                    <FormLabel className="text-base">Charge Per Listing</FormLabel>
                    <FormDescription>
                    Charge students a fee for creating a new product listing.
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="student.post_price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Student Listing Price (INR)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {/* Vendor Settings */}
        <div className='space-y-6 rounded-lg border p-4'>
            <h3 className="text-lg font-semibold">Vendor Monetization</h3>
            <FormField
            control={form.control}
            name="vendor.charge_for_platform_access"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
                <div className="space-y-0.5">
                    <FormLabel className="text-base">Charge for Platform Access</FormLabel>
                    <FormDescription>
                     Charge vendors a monthly subscription fee per service they provide.
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="vendor.price_per_service_per_month"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price per Service per Month (INR)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 500" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Separator />

        {/* Application Visibility */}
        <div className='space-y-6 rounded-lg border p-4'>
            <h3 className="text-lg font-semibold">Application Visibility</h3>
            <FormField
              control={form.control}
              name="applicationVisibility.showCompetitionApplicants"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show Competition Applicants</FormLabel>
                    <FormDescription>
                      Display the applicants tab and count on competition detail pages.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicationVisibility.showInternshipApplicants"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show Internship Applicants</FormLabel>
                    <FormDescription>
                      Display the applicants card on internship detail pages.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
        </div>

        <Separator />

        {/* Global Settings */}
        <h3 className="text-lg font-semibold">Global Settings</h3>
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Monetization Start Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                If set, all charges will only begin on or after this date.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All Settings
        </Button>
      </form>
    </Form>
  );
}
