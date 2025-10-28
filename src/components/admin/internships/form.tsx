
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createInternship, updateInternship } from '@/app/admin/internships/actions';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

type Internship = {
    id: number;
    role: string;
    company: string;
    stipend: number;
    stipend_period: string;
    location: string;
    deadline: string;
    image_url: string | null;
    details_pdf_url: string | null;
};

const formSchema = z.object({
  role: z.string().min(3, 'Role must be at least 3 characters.'),
  company: z.string().min(2, 'Company name must be at least 2 characters.'),
  stipend: z.coerce.number().min(0, 'Stipend must be a positive number.'),
  stipend_period: z.string().optional(),
  location: z.string().min(2, 'Location is required.'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  image: z.any().optional(),
  details_pdf: z.any().optional(),
});

type InternshipFormProps = {
    internship?: Internship;
};

export default function InternshipForm({ internship }: InternshipFormProps) {
  const isEditMode = !!internship;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: internship?.role || '',
      company: internship?.company || '',
      stipend: internship?.stipend || 0,
      stipend_period: internship?.stipend_period || 'monthly',
      location: internship?.location || '',
      deadline: internship ? new Date(internship.deadline).toISOString().split('T')[0] : '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please sign in again to manage internships.' });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('role', values.role);
    formData.append('company', values.company);
    formData.append('stipend', values.stipend.toString());
    formData.append('stipend_period', values.stipend_period || 'monthly');
    formData.append('location', values.location);
    formData.append('deadline', values.deadline);
    if (values.image) formData.append('image', values.image);
    if (values.details_pdf) formData.append('details_pdf', values.details_pdf);

    if (!isEditMode) {
      formData.append('creator_id', user.id);
    }

    const result = isEditMode
        ? await updateInternship(internship.id, formData)
        : await createInternship(formData);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Success!', description: `Internship ${isEditMode ? 'updated' : 'created'} successfully.` });
      router.refresh();
      router.push('/admin/internships');
    }
    
    setIsLoading(false);
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{isEditMode ? 'Edit' : 'Create'} Internship</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="e.g., Software Engineer Intern" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="company" render={({ field }) => (
                            <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="e.g., Google" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="stipend" render={({ field }) => (
                            <FormItem><FormLabel>Stipend (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="stipend_period" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stipend Period</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="lump-sum">Lump-sum</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                         <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Remote" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="deadline" render={({ field }) => (
                        <FormItem><FormLabel>Application Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                     )} />
                    <div className="grid md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Company Logo / Banner</FormLabel>
                                {isEditMode && internship.image_url && (
                                    <div className="mb-2"><Image src={internship.image_url} alt="Current banner" width={100} height={50} className="rounded-md object-cover" /></div>
                                )}
                                <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <FormField control={form.control} name="details_pdf" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Job Description (PDF)</FormLabel>
                                {isEditMode && internship.details_pdf_url && (
                                    <div className="mb-2"><a href={internship.details_pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">View current PDF</a></div>
                                )}
                                <FormControl><Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl>
                                <FormMessage />
                             </FormItem>
                         )} />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Save Changes' : 'Create Internship'}
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
