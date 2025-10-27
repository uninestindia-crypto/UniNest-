import { NextResponse } from 'next/server';

const buildTime = process.env.BUILD_TIMESTAMP
  ?? process.env.VERCEL_GIT_COMMIT_TIMESTAMP
  ?? process.env.VERCEL_DEPLOYMENT_DATETIME
  ?? new Date().toISOString();

const appVersion = process.env.NEXT_PUBLIC_APP_VERSION
  ?? process.env.APP_VERSION
  ?? process.env.VERCEL_GIT_COMMIT_SHA
  ?? process.env.VERCEL_DEPLOYMENT_ID
  ?? process.env.NEXT_BUILD_ID
  ?? 'dev';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    {
      appVersion,
      buildTime,
    },
    {
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate',
        pragma: 'no-cache',
        expires: '0',
      },
    },
  );
}
