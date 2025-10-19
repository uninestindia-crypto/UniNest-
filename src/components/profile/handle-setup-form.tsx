'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const handleSchema = z.object({
  handle: z
    .string()
    .min(3, { message: 'Handle must be at least 3 characters.' })
    .max(24, { message: 'Handle must not exceed 24 characters.' })
    .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers, or underscores only.'),
});

type HandleSetupFormProps = {
  initialHandle?: string;
};

type HandleFormValues = z.infer<typeof handleSchema>;

export default function HandleSetupForm({ initialHandle }: HandleSetupFormProps) {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<HandleFormValues>({
    resolver: zodResolver(handleSchema),
    defaultValues: {
      handle: initialHandle || '',
    },
  });

  const onSubmit = async (values: HandleFormValues) => {
    if (!user || !supabase) {
      return;
    }

    setSubmitting(true);

    const { data: existingHandle, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', values.handle)
      .maybeSingle();

    if (fetchError) {
      toast({ variant: 'destructive', title: 'Error', description: fetchError.message });
      setSubmitting(false);
      return;
    }

    if (existingHandle && existingHandle.id !== user.id) {
      form.setError('handle', { type: 'manual', message: 'This handle is already taken. Try another one.' });
      setSubmitting(false);
      return;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        handle: values.handle,
      },
    });

    if (authError) {
      toast({ variant: 'destructive', title: 'Error', description: authError.message });
      setSubmitting(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ handle: values.handle })
      .eq('id', user.id);

    if (profileError) {
      toast({ variant: 'destructive', title: 'Error', description: profileError.message });
      setSubmitting(false);
      return;
    }

    toast({ title: 'Handle saved', description: 'Your profile handle is ready to use.' });
    router.push(`/profile/${values.handle}`);
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Handle</FormLabel>
              <FormControl>
                <Input placeholder="e.g. uninest_student" {...field} autoComplete="off" disabled={submitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Saving
            </span>
          ) : (
            'Save handle'
          )}
        </Button>
      </form>
    </Form>
  );
}
