
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase, Building2, Mail, Phone, UploadCloud, CheckCircle2, User, PhoneCall } from 'lucide-react';
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
  internship: {
    id: number | string;
    role: string;
    company: string;
  };
};

export default function ApplicationForm({ internship }: ApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const loginRedirectPath = `/login?redirect=/workspace/internships/${internship.id}/apply`;

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
    formData.append('internshipId', String(internship.id));
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
      router.push(`/workspace/internships/${internship.id}`);
    }

    setIsLoading(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="animate-pulse">Preparing your application space...</p>
      </div>
    );
  }

  if (!user) {
    return null; // The useEffect will handle the redirect
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">

      {/* Left Column: Role Details & Instructions */}
      <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            <Briefcase className="mr-2 h-4 w-4" />
            Internship Application
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {internship.role}
          </h1>
          <div className="flex items-center text-xl text-muted-foreground font-medium">
            <Building2 className="mr-2 h-5 w-5" />
            {internship.company}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/50 border p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-lg flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            What you need to know
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span>
              Ensure your resume is updated and exported as a PDF.
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span>
              A strong, tailored cover letter drastically improves your chances.
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span>
              Double-check your contact details so the recruiter can reach you.
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Glassmorphic Form */}
      <div className="lg:col-span-7 relative group">

        {/* Decorative background glows */}
        <div className="absolute -inset-1 blur-3xl opacity-30 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl -z-10 transition-opacity duration-500 group-hover:opacity-50" />

        <Card className="border shadow-2xl bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 overflow-hidden relative">
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 absolute top-0 left-0" />

          <CardContent className="p-8 sm:p-10 space-y-8 mt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Personal Information Section */}
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Personal Information</h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name</FormLabel>
                        <FormControl>
                          <Input className="bg-white/50 dark:bg-black/20 focus-visible:ring-indigo-500" placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</FormLabel>
                        <FormControl>
                          <Input type="email" className="bg-white/50 dark:bg-black/20 focus-visible:ring-indigo-500 opacity-70" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="phone_number" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Mobile Number</FormLabel>
                        <FormControl>
                          <Input type="tel" className="bg-white/50 dark:bg-black/20 focus-visible:ring-indigo-500" placeholder="+91..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="whatsapp_number" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5"><PhoneCall className="h-3.5 w-3.5" /> WhatsApp</FormLabel>
                        <FormControl>
                          <Input type="tel" className="bg-white/50 dark:bg-black/20 focus-visible:ring-indigo-500" placeholder="+91..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Application Details Section */}
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Application Documents</h3>

                  <FormField control={form.control} name="coverLetter" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Letter (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none h-32 bg-white/50 dark:bg-black/20 focus-visible:ring-indigo-500"
                          placeholder="Briefly explain why you're a great fit for this specific role and team..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="resume" render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">Resume / CV (PDF)</FormLabel>
                      <FormControl>
                        <div className="relative group/upload cursor-pointer">
                          <Input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) onChange(file);
                            }}
                            {...rest}
                          />
                          <div className={`p-6 border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center ${value ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-muted-foreground/25 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                            <div className={`p-3 rounded-full ${value ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                              <UploadCloud className="h-6 w-6" />
                            </div>
                            <div>
                              {value ? (
                                <p className="font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">
                                  {(value as File).name}
                                </p>
                              ) : (
                                <>
                                  <p className="font-semibold text-foreground">Click or drag PDF to upload</p>
                                  <p className="text-xs text-muted-foreground mt-1">Maximum file size: 5MB</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base font-semibold h-12 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground mt-4">
                  By submitting, you agree to UniNest's terms and privacy policy.
                  Your data will be securely shared with the hiring company.
                </p>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
