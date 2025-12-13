
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Logo } from '../icons';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!supabase) {
        toast({ variant: 'destructive', title: 'Authentication is not configured.'});
        setIsLoading(false);
        return;
    }
    const { data, error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
      setIsLoading(false);
    } else {
      toast({ title: 'Welcome back!' });
      // Role-based redirection
      const userRole = data.user?.user_metadata?.role;
      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'vendor') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/');
      }
      // No longer need router.refresh() here, as it's handled by the AuthProvider
    }
    // setIsLoading(false) is moved to prevent a flash of the button being enabled before navigation
  }

  return (
    <div className="w-full max-w-sm mx-auto">
        <Link href="/" className="flex items-center gap-2 justify-center mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                <Logo className="size-6 text-white" />
            </div>
            <h1 className="text-2xl font-headline font-bold">UniNest</h1>
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome Back!</CardTitle>
            <CardDescription>Log in to continue to your digital campus.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log In
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-bold primary-gradient bg-clip-text text-transparent hover:brightness-125">
                Sign up
              </Link>
            </p>
             <Link href="/password-reset" className="text-sm primary-gradient bg-clip-text text-transparent hover:brightness-125">
                Forgot password?
              </Link>
          </CardFooter>
        </Card>
    </div>
  );
}
