// This file is now deprecated and has been replaced by the server action
// in src/app/admin/settings/actions.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ error: 'This API route is deprecated. Please use the new server action.' }, { status: 410 });
}
