import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PwaInstallPayload {
  platform: 'ios' | 'android'
  userAgent?: string
  timestamp?: string
}

type InsertPayload = {
  platform: string
  user_agent: string | null
  installed_at: string
  ip_address: string | null
}

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PwaInstallPayload | null

    if (!body || (body.platform !== 'ios' && body.platform !== 'android')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const installedAt = body.timestamp ?? new Date().toISOString()
    const userAgent = body.userAgent ?? request.headers.get('user-agent') ?? null
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

    const payload: InsertPayload = {
      platform: body.platform,
      user_agent: userAgent,
      installed_at: installedAt,
      ip_address: ipAddress,
    }

    if (!supabaseAdmin) {
      console.warn('[pwa-install] Supabase service key missing; skipping persistence.', payload)

      return NextResponse.json({
        success: true,
        stored: false,
        message: 'Install tracked locally. Configure SUPABASE_SERVICE_KEY to persist events.',
      })
    }

    const { error } = await supabaseAdmin.from('pwa_installs').insert(payload)

    if (error) {
      console.error('[pwa-install] failed to store event', error)
      return NextResponse.json({ error: 'Failed to record install event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[pwa-install] unexpected error', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
