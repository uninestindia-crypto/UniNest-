
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { submitApplication } from '@/app/workspace/internships/[id]/apply/actions';
import { useAuth } from '@/hooks/use-auth';


const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone_number: z.string().min(10, 'Please enter a valid phone number.'),
  whatsapp_number: z.string().min(10, 'Please enter a valid WhatsApp number.'),
  coverLetter: z.string().optional(),
  resume: z.any().refine(file => file instanceof File, "Resume is required."),
});

type ApplicationFormProps = {
    internshipId: number;
};

export default function ApplicationForm({ internshipId }: ApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const loginRedirectPath = `/login?redirect=/workspace/internships/${internshipId}/apply`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      whatsapp_number: '',
      coverLetter: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone_number: user.user_metadata?.phone_number || '',
        whatsapp_number: user.user_metadata?.whatsapp_number || '',
        coverLetter: '',
        resume: undefined,
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(loginRedirectPath);
    }
  }, [loading, user, router, loginRedirectPath]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please log in to submit your application.' });
      router.replace(loginRedirectPath);
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('internshipId', String(internshipId));
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('phone_number', values.phone_number);
    formData.append('whatsapp_number', values.whatsapp_number);
    formData.append('coverLetter', values.coverLetter || '');
    if (values.resume) {
        formData.append('resume', values.resume);
    }

    const result = await submitApplication(formData);
    
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Success!', description: 'Your application has been submitted.' });
      router.push(`/workspace/internships/${internshipId}`);
    }
    
    setIsLoading(false);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading application form...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Redirecting to login...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Application</CardTitle>
        <CardDescription>Fill out your details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="phone_number" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="whatsapp_number" render={({ field }) => (
                    <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
             <FormField control={form.control} name="coverLetter" render={({ field }) => (
                <FormItem><FormLabel>Cover Letter (Optional)</FormLabel><FormControl><Textarea placeholder="Why are you a good fit for this role?" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="resume" render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                    <FormLabel>Resume/Pitch (PDF)</FormLabel>
                    <FormControl>
                        <Input 
                            type="file" 
                            accept=".pdf" 
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onChange(file);
                            }} 
                            {...rest} 
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
             )} />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
