import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as any })
}

const PLANS: Record<string, { name: string; price: number; interval: 'month' }> = {
  pro: { name: 'AlphaScanner Pro', price: 2900, interval: 'month' },
  fund: { name: 'AlphaScanner Fund', price: 9900, interval: 'month' },
}

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json()

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Payment coming soon — join the waitlist!' }, { status: 503 })
    }

    const p = PLANS[plan]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alpha-scanner-theta.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: p.name, description: `${p.name} — Real-time crypto unusual activity alerts` },
            unit_amount: p.price,
            recurring: { interval: p.interval },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}?checkout=success&plan=${plan}`,
      cancel_url: `${appUrl}?checkout=cancelled`,
      metadata: { plan },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
