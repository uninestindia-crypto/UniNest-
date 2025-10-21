#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const targets = [
  { key: 'pwaIcon192Url', output: path.join(projectRoot, 'public', 'icons', 'icon-192x192.png') },
  { key: 'pwaIcon512Url', output: path.join(projectRoot, 'public', 'icons', 'icon-512x512.png') },
  { key: 'pwaIcon1024Url', output: path.join(projectRoot, 'public', 'icons', 'icon-1024x1024.png') },
  { key: 'pwaScreenshotDesktopUrl', output: path.join(projectRoot, 'public', 'screenshots', 'dashboard-desktop.png') },
  { key: 'pwaScreenshotMobileUrl', output: path.join(projectRoot, 'public', 'screenshots', 'dashboard-mobile.png') },
];

async function fetchBrandingAssets() {
  const endpoint = new URL('/rest/v1/platform_settings', SUPABASE_URL);
  endpoint.searchParams.set('select', 'value');
  endpoint.searchParams.set('key', 'eq.branding_assets');

  const response = await fetch(endpoint, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch branding assets: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return payload?.[0]?.value ?? {};
}

async function downloadAndWrite(url, outputPath) {
  const dir = path.dirname(outputPath);
  await mkdir(dir, { recursive: true });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, buffer);
}

(async () => {
  try {
    const assets = await fetchBrandingAssets();

    const results = await Promise.all(
      targets.map(async ({ key, output }) => {
        const assetUrl = assets?.[key];
        if (!assetUrl || typeof assetUrl !== 'string' || assetUrl.trim().length === 0) {
          return { key, skipped: true };
        }

        try {
          await downloadAndWrite(assetUrl, output);
          return { key, skipped: false };
        } catch (error) {
          return { key, skipped: false, error };
        }
      }),
    );

    let hadError = false;
    results.forEach((result) => {
      if (result.skipped) {
        console.log(`Skipped ${result.key}: no Supabase URL set.`);
        return;
      }

      if (result.error) {
        hadError = true;
        console.error(`Failed to sync ${result.key}:`, result.error instanceof Error ? result.error.message : result.error);
      } else {
        console.log(`Synced ${result.key}.`);
      }
    });

    if (hadError) {
      process.exitCode = 1;
    } else {
      console.log('PWA fallback assets are up to date.');
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
