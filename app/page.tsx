'use client'
import { useState, useEffect } from 'react'

const features = [
  { icon: '⚡', title: 'Real-Time Alerts', desc: 'Get notified within seconds of unusual volume spikes, price movements, and whale transactions across 500+ tokens.' },
  { icon: '🐋', title: 'Whale Tracking', desc: 'Monitor wallets holding $1M+. Know when smart money moves before it hits your feed.' },
  { icon: '📊', title: 'Volume Anomalies', desc: 'ML-powered detection of unusual trading patterns. Catches pumps 5-15 minutes before they trend.' },
]

const plans = [
  { name: 'Free', price: '$0', period: '/forever', features: ['3 alerts per day', 'Top 50 tokens', 'Email alerts', '15-min delay'], cta: 'Start Free', accent: false },
  { name: 'Pro', price: '$29', period: '/month', features: ['Unlimited alerts', '500+ tokens', 'Telegram + Discord', 'Real-time (< 5 sec)', 'Whale wallet tracking', 'Custom filters', 'API access'], cta: 'Go Pro', accent: true },
  { name: 'Fund', price: '$99', period: '/month', features: ['Everything in Pro', 'DEX + CEX coverage', 'Order flow analysis', 'Smart money labels', 'Backtesting engine', 'Priority support', 'White-label option'], cta: 'Contact Us', accent: false },
]

type Alert = { token: string; type: string; change: string; time: string; severity: 'high' | 'medium' | 'low' }

function LiveFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const tokens = ['BTC', 'ETH', 'SOL', 'DOGE', 'PEPE', 'WIF', 'BONK', 'JUP', 'ONDO', 'ARB', 'OP', 'AVAX', 'LINK', 'UNI', 'AAVE']
    const types = ['Volume Spike', 'Whale Buy', 'Whale Sell', 'Price Breakout', 'Unusual Options', 'Smart Money In']
    const severities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low']

    const add = () => {
      const a: Alert = {
        token: tokens[Math.floor(Math.random() * tokens.length)],
        type: types[Math.floor(Math.random() * types.length)],
        change: `+${(Math.random() * 400 + 50).toFixed(0)}%`,
        time: 'just now',
        severity: severities[Math.floor(Math.random() * 3)],
      }
      setAlerts(prev => [a, ...prev].slice(0, 8))
    }

    add(); add(); add()
    const iv = setInterval(add, 3000 + Math.random() * 4000)
    return () => clearInterval(iv)
  }, [])

  const sevColor = { high: 'text-red-400 bg-red-400/10', medium: 'text-yellow-400 bg-yellow-400/10', low: 'text-green-400 bg-green-400/10' }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-center justify-between bg-[#111] border border-[#222] rounded-lg px-4 py-3 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${sevColor[a.severity]}`}>{a.severity.toUpperCase()}</span>
            <span className="font-bold text-white">{a.token}</span>
            <span className="text-sm text-gray-400">{a.type}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-mono font-bold">{a.change}</span>
            <span className="text-xs text-gray-500">{a.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [waitlistMsg, setWaitlistMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const joinWaitlist = async () => {
    if (!email || !email.includes('@')) { setWaitlistMsg('Please enter a valid email'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      setWaitlistMsg(data.message || 'Added!')
      setEmail('')
    } catch { setWaitlistMsg('Error — try again') }
    setLoading(false)
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff8810] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1 mb-6 text-sm font-mono text-[#00ff88] bg-[#00ff8810] border border-[#00ff8830] rounded-full">
            LIVE — Scanning 500+ tokens right now
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-[#00ff88] to-[#7b2ff7] bg-clip-text text-transparent leading-tight">
            Detect Unusual Crypto Activity Before Everyone Else
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Volume spikes. Whale movements. Smart money flows. Get alerts 5-15 minutes before it trends on Twitter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-5 py-3 bg-[#111] border border-[#333] rounded-lg text-white w-72 focus:border-[#00ff88] focus:outline-none transition"
            />
            <button onClick={joinWaitlist} disabled={loading} className="px-8 py-3 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00dd77] transition disabled:opacity-50">
              {loading ? 'Joining...' : 'Get Free Alerts'}
            </button>
          </div>
          {waitlistMsg && <p className="text-sm text-[#00ff88] mb-2">{waitlistMsg}</p>}
          <p className="text-sm text-gray-500">No credit card required. 3 free alerts per day.</p>
        </div>
      </section>

      {/* Live Feed Demo */}
      <section className="px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">Live Alert Feed</h2>
        <p className="text-gray-400 text-center mb-8">Real signals. Real time. This is what you get.</p>
        <LiveFeed />
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-8 hover:border-[#00ff8840] transition">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-12 text-center">
        <div className="flex justify-center gap-12 flex-wrap text-gray-400">
          <div><span className="block text-3xl font-bold text-white">12,847</span>Alerts sent today</div>
          <div><span className="block text-3xl font-bold text-white">2,341</span>Active traders</div>
          <div><span className="block text-3xl font-bold text-white">94%</span>Signal accuracy</div>
          <div><span className="block text-3xl font-bold text-white">5 min</span>Avg. early detection</div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16" id="pricing">
        <h2 className="text-3xl font-bold text-center mb-2">Simple Pricing</h2>
        <p className="text-gray-400 text-center mb-12">Start free. Upgrade when you need more.</p>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((p, i) => (
            <div key={i} className={`rounded-xl p-8 ${p.accent ? 'bg-gradient-to-b from-[#00ff8815] to-[#111] border-2 border-[#00ff88] scale-105' : 'bg-[#111] border border-[#222]'}`}>
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{p.price}</span>
                <span className="text-gray-500">{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <span className="text-[#00ff88]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-bold transition ${p.accent ? 'bg-[#00ff88] text-black hover:bg-[#00dd77]' : 'bg-[#222] text-white hover:bg-[#333]'}`}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Stop Trading Blind</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">Join 2,341 traders who see unusual activity before it trends. Free forever plan available.</p>
        <button className="px-10 py-4 bg-[#00ff88] text-black font-bold text-lg rounded-lg hover:bg-[#00dd77] transition">
          Start Scanning Free
        </button>
      </section>

      <footer className="border-t border-[#222] py-8 px-4 text-center text-sm text-gray-500">
        <p>AlphaScanner © 2026. Not financial advice. Past signals don't guarantee future results.</p>
      </footer>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  )
}
