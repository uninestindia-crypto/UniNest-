
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
import { Loader2 } from 'lucide-react';
import { createCompetition, updateCompetition } from '@/app/admin/competitions/actions';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

type Competition = {
    id: number;
    title: string;
    description: string;
    prize: number;
    entry_fee: number;
    deadline: string;
    image_url: string | null;
    details_pdf_url: string | null;
};

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Please provide a more detailed description.'),
  prize: z.coerce.number().min(0, 'Prize must be a positive number.'),
  entry_fee: z.coerce.number().min(0, 'Entry fee must be a positive number.'),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  image: z.any().optional(),
  details_pdf: z.any().optional(),
});

type CompetitionFormProps = {
    competition?: Competition;
};

export default function CompetitionForm({ competition }: CompetitionFormProps) {
  const isEditMode = !!competition;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: competition?.title || '',
      description: competition?.description || '',
      prize: competition?.prize || 0,
      entry_fee: competition?.entry_fee || 0,
      deadline: competition ? new Date(competition.deadline).toISOString().split('T')[0] : '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please sign in again to manage competitions.' });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
        if (value) {
            formData.append(key, value);
        }
    });

    if (!isEditMode) {
      formData.append('creator_id', user.id);
    }

    const result = isEditMode 
        ? await updateCompetition(competition.id, formData)
        : await createCompetition(formData);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      toast({ title: 'Success!', description: `Competition ${isEditMode ? 'updated' : 'created'} successfully.` });
      router.refresh(); // This re-fetches server-side data
      router.push('/admin/competitions');
    }
    
    setIsLoading(false);
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{isEditMode ? 'Edit' : 'Create'} Competition</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., National Robotics Challenge" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed description of the competition..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="prize" render={({ field }) => (
                            <FormItem><FormLabel>Prize Pool (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="entry_fee" render={({ field }) => (
                            <FormItem><FormLabel>Entry Fee (INR)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="deadline" render={({ field }) => (
                            <FormItem><FormLabel>Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Banner Image</FormLabel>
                                {isEditMode && competition.image_url && (
                                    <div className="mb-2"><Image src={competition.image_url} alt="Current banner" width={100} height={50} className="rounded-md object-cover" /></div>
                                )}
                                <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                         <FormField control={form.control} name="details_pdf" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Details PDF</FormLabel>
                                {isEditMode && competition.details_pdf_url && (
                                    <div className="mb-2"><a href={competition.details_pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">View current PDF</a></div>
                                )}
                                <FormControl><Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Save Changes' : 'Create Competition'}
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
