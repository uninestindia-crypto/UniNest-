import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HandleSetupForm from '@/components/profile/handle-setup-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function ProfileHandleSetupPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const handle = user.user_metadata?.handle;
  if (handle) {
    redirect(`/profile/${handle}`);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Choose your profile handle</CardTitle>
          <CardDescription>
            This handle will appear in your public profile link. Use only lowercase letters, numbers, or underscores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HandleSetupForm initialHandle={handle ?? ''} />
        </CardContent>
      </Card>
    </div>
  );
}
