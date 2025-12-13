'use client';

import { useState } from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/icons';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }
      
      toast({
        title: 'Success!',
        description: result.message,
      });

      setMessage(result.message + " You will be redirected to the login page shortly.");
      
      // Redirect to login page after a delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Promotion Failed',
        description: errorMessage,
      });
      setMessage(`Error: ${errorMessage}`);
    }
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-sm">
            <Link href="/" className="flex items-center justify-center gap-2 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                    <Logo className="size-6 text-white" />
                </div>
                <h1 className="text-2xl font-headline font-bold">UniNest</h1>
            </Link>
            <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Admin User Setup</CardTitle>
                <CardDescription>
                Enter the email of an existing user to promote them to an administrator. This is a one-time setup.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>User Email</FormLabel>
                        <FormControl>
                            <Input placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Make Admin
                    </Button>
                </form>
                </Form>
                {message && <p className="mt-4 text-center text-sm text-muted-foreground">{message}</p>}
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
