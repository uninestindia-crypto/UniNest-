
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
import { Separator } from '../ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Bed, Book, Utensils, Laptop } from 'lucide-react';

const vendorCategories = [
    { id: "library", label: "Library", icon: Book },
    { id: "food-mess", label: "Food Mess", icon: Utensils },
    { id: "cybercafe", label: "Cyber Café", icon: Laptop },
    { id: "hostels", label: "Hostels", icon: Bed },
] as const;

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
  userType: z.enum(["student", "vendor"], {
    required_error: "You need to select a role.",
  }),
  vendorCategories: z.array(z.string()).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(data => {
    if (data.userType === 'vendor') {
      return data.vendorCategories && data.vendorCategories.length > 0;
    }
    return true;
}, {
    message: "Please select at least one vendor category.",
    path: ["vendorCategories"],
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      vendorCategories: [],
    },
  });

  const userType = form.watch('userType');

  const slugifyHandle = (input: string) => {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_{2,}/g, '_');
  };

  const generateUniqueHandle = async (values: FormValues) => {
    const nameBase = slugifyHandle(values.fullName);
    const emailBase = slugifyHandle(values.email.split('@')[0] || '');
    const base = nameBase || emailBase || `uninest_user_${Math.random().toString(36).slice(2, 6)}`;

    if (!supabase) {
      return base;
    }

    let candidate = base;
    let counter = 1;

    while (counter <= 5) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', candidate)
        .maybeSingle();

      if (error) {
        break;
      }

      if (!data) {
        return candidate;
      }

      candidate = `${base}_${counter}`;
      counter += 1;
    }

    return `${base}_${Math.random().toString(36).slice(2, 6)}`;
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    if (!supabase) {
        toast({ variant: 'destructive', title: 'Auth not configured.'});
        setIsLoading(false);
        return;
    }

    const role = values.userType;
    const generatedHandle = await generateUniqueHandle(values);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role: role,
          full_name: values.fullName,
          handle: generatedHandle,
          vendor_categories: role === 'vendor' ? values.vendorCategories.map(c => c.replace('-', ' ')) : undefined
        }
      }
    });

    if (error) {
       toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message,
      });
    } else {
        const requiresEmailConfirmation = !data?.session;
        toast({
            title: 'Success!',
            description: requiresEmailConfirmation
              ? 'Check your email for a verification link.'
              : 'Account created successfully. You can log in now.',
        });
        router.push('/login');
    }
    
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Join the community and get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I am a...</FormLabel>
                   <FormControl>
                     <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={field.value === 'student' ? 'default' : 'outline'}
                          onClick={() => field.onChange('student')}
                        >
                          Student
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'vendor' ? 'default' : 'outline'}
                          onClick={() => field.onChange('vendor')}
                        >
                          Vendor
                        </Button>
                    </div>
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {userType === 'vendor' && (
              <FormField
                control={form.control}
                name="vendorCategories"
                render={({ field }) => (
                  <FormItem>
                     <Separator className="my-4" />
                    <div className="mb-4">
                      <FormLabel className="text-base">Vendor Categories</FormLabel>
                      <p className="text-sm text-muted-foreground">Select all that apply to your business.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                    {vendorCategories.map((item) => {
                        const isSelected = field.value?.includes(item.id);
                        return (
                             <Button
                                key={item.id}
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                className="h-auto justify-start p-4 text-left"
                                onClick={() => {
                                    const currentCategories = field.value || [];
                                    const newCategories = isSelected
                                        ? currentCategories.filter(c => c !== item.id)
                                        : [...currentCategories, item.id];
                                    field.onChange(newCategories);
                                }}
                              >
                                <div className="flex flex-col items-start gap-2">
                                  <item.icon className="size-5"/>
                                  <span className="font-semibold capitalize">{item.label}</span>
                                </div>
                            </Button>
                        )
                    })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
             <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || !userType}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">
            Log in
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
