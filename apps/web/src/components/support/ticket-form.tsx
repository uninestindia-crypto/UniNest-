

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  category: z.string({ required_error: 'Please select a category.' }),
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  description: z.string().min(20, 'Please provide a detailed description of the issue.'),
  screenshot: z.instanceof(File).optional(),
});

export default function SupportTicketForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isBucketReady, setIsBucketReady] = useState(false);
  const { toast } = useToast();
  const { user, supabase } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      description: '',
    },
  });

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!supabase || !user) return null;

    try {
      if (!isBucketReady) {
        const response = await fetch('/api/support/ensure-bucket', { method: 'POST' });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Unable to prepare storage bucket.');
        }
        setIsBucketReady(true);
      }

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('support-tickets')
        .upload(filePath, file, {
          contentType: file.type || 'application/octet-stream',
        });
      
      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('support-tickets')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error('Upload Error:', error);
      setIsBucketReady(false);
      return null;
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !supabase) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a ticket.' });
        return;
    }
    
    setIsLoading(true);

    let screenshotUrl: string | null = null;
    if (values.screenshot) {
      screenshotUrl = await uploadFile(values.screenshot);
      if (!screenshotUrl) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload screenshot.' });
        setIsLoading(false);
        return;
      }
    }
    
    const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        category: values.category,
        subject: values.subject,
        description: values.description,
        screenshot_url: screenshotUrl,
    });

    setIsLoading(false);

    if (error) {
        toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
    } else {
        toast({ title: 'Ticket Submitted!', description: 'Thank you for your feedback. Our team will review it shortly.' });
        form.reset();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a New Ticket</CardTitle>
        <CardDescription>We'll get back to you as soon as possible.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Bug Report">Bug Report</SelectItem>
                      <SelectItem value="Feature Request">Feature Request</SelectItem>
                      <SelectItem value="Billing Issue">Billing Issue</SelectItem>
                      <SelectItem value="General Feedback">General Feedback</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Unable to upload profile picture" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the issue in detail. Include steps to reproduce if it's a bug."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="screenshot"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Screenshot (Optional)</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Ticket
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
