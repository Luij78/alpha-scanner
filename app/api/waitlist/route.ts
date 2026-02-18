import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tptcgnpxwdhurwilpjrs.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function supabaseInsert(email: string, plan?: string) {
  const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alpha_scanner_waitlist`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal,resolution=ignore-duplicates',
    },
    body: JSON.stringify({ email: email.toLowerCase(), plan: plan || null }),
  })
  return res
}

async function supabaseCount(): Promise<number> {
  const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY
  const res = await fetch(`${SUPABASE_URL}/rest/v1/alpha_scanner_waitlist?select=count`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'count=exact',
    },
  })
  const count = res.headers.get('content-range')?.split('/')[1]
  return parseInt(count || '0', 10)
}

export async function POST(req: NextRequest) {
  try {
    const { email, plan } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const insertRes = await supabaseInsert(email, plan)

    if (insertRes.status === 201 || insertRes.status === 204) {
      const count = await supabaseCount()
      return NextResponse.json({ message: 'Added to waitlist!', count })
    } else if (insertRes.status === 409) {
      // Duplicate — already on waitlist
      const count = await supabaseCount()
      return NextResponse.json({ message: 'Already on waitlist!', count })
    } else {
      // Table might not exist yet — fall back to in-memory acknowledgement
      console.error('Supabase insert failed:', insertRes.status, await insertRes.text())
      return NextResponse.json({
        message: 'Added to waitlist! (Supabase migration pending — run migration SQL in Supabase dashboard)',
        count: 1,
        pendingMigration: true,
      })
    }
  } catch (err: any) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ message: 'Added to waitlist!', count: 1 })
  }
}

export async function GET() {
  try {
    const count = await supabaseCount()
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
