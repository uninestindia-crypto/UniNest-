import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { ensureBucketExists } from '@/lib/supabase/storage';

const BUCKET = 'competition-pitches';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service role key is not configured.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const pitch = formData.get('pitch');
    const competitionId = formData.get('competitionId');

    if (!(pitch instanceof File)) {
      return NextResponse.json({ error: 'Pitch file is required.' }, { status: 400 });
    }

    if (!competitionId) {
      return NextResponse.json({ error: 'competitionId is required.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error: bucketError } = await ensureBucketExists(supabaseAdmin, BUCKET);
    if (bucketError) {
      console.error('Bucket Error:', bucketError);
      return NextResponse.json({ error: 'Failed to prepare storage bucket.' }, { status: 500 });
    }

    const fileExt = pitch.name.split('.').pop();
    const sanitizedExt = fileExt ? fileExt.replace(/[^a-zA-Z0-9]/g, '') : 'pdf';
    const filePath = `${user.id}/${competitionId}-${Date.now()}.${sanitizedExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, pitch, {
        cacheControl: '3600',
        upsert: false,
        contentType: pitch.type || 'application/octet-stream',
      });

    if (uploadError) {
      console.error('Pitch upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload pitch.' }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);
    if (!publicUrlData?.publicUrl) {
      return NextResponse.json({ error: 'Failed to retrieve uploaded file URL.' }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Unexpected pitch upload error:', error);
    return NextResponse.json({ error: 'Unexpected error while uploading pitch.' }, { status: 500 });
  }
}
