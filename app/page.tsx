'use client'
import { useState, useEffect, useCallback } from 'react'

const OWNER_CODE = 'skipper2026'

type Alert = { token: string; type: string; change: string; severity: string; price: number; volume: number; timestamp: string }

function LiveFeed({ alerts }: { alerts: Alert[] }) {
  const sevColor: Record<string, string> = {
    high: 'text-red-400 bg-red-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    low: 'text-green-400 bg-green-400/10',
  }

  if (alerts.length === 0) {
    return <p className="text-gray-500 text-center py-8">Scanning... waiting for signals</p>
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-center justify-between bg-[#111] border border-[#222] rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${sevColor[a.severity] || sevColor.low}`}>{a.severity.toUpperCase()}</span>
            <span className="font-bold text-white">{a.token}</span>
            <span className="text-sm text-gray-400">{a.type}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 font-mono">${a.price < 1 ? a.price.toFixed(4) : a.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className={`font-mono font-bold ${a.change.startsWith('+') || a.change.startsWith('$') ? 'text-green-400' : 'text-red-400'}`}>{a.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [scanned, setScanned] = useState(0)
  const [lastScan, setLastScan] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [showCodePrompt, setShowCodePrompt] = useState(false)
  const [email, setEmail] = useState('')
  const [waitlistMsg, setWaitlistMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkoutMsg, setCheckoutMsg] = useState('')

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/scan')
      const data = await res.json()
      setAlerts(data.alerts || [])
      setScanned(data.scanned || 0)
      setLastScan(new Date(data.timestamp).toLocaleTimeString())
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    // Check localStorage for owner
    if (typeof window !== 'undefined' && localStorage.getItem('alpha_owner') === 'true') {
      setIsOwner(true)
    }
    fetchAlerts()
    const iv = setInterval(fetchAlerts, 60000) // refresh every 60s
    return () => clearInterval(iv)
  }, [fetchAlerts])

  const checkCode = () => {
    if (codeInput === OWNER_CODE) {
      setIsOwner(true)
      localStorage.setItem('alpha_owner', 'true')
      setShowCodePrompt(false)
      setCodeInput('')
    } else {
      setCodeInput('')
    }
  }

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

  const handleCheckout = async (plan: string) => {
    setCheckoutMsg('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: email || undefined }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutMsg(data.error || 'Checkout coming soon — join the waitlist!')
      }
    } catch {
      setCheckoutMsg('Checkout coming soon — join the waitlist!')
    }
  }

  const visibleAlerts = isOwner ? alerts : alerts.slice(0, 3)

  return (
    <main className="min-h-screen">
      {/* Owner badge */}
      {isOwner && (
        <div className="bg-[#7b2ff7] text-white text-center py-1 text-sm font-mono">
          OWNER MODE — Full access unlocked
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ff8810] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-[#00ff88] to-[#7b2ff7] bg-clip-text text-transparent leading-tight">
            AlphaScanner
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Real-time unusual crypto activity detection. Powered by CoinGecko data. No fake numbers, no simulated feeds — what you see is what&apos;s happening.
          </p>
          {!isOwner && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
              <input
                type="email"
                placeholder="Enter your email for updates"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="px-5 py-3 bg-[#111] border border-[#333] rounded-lg text-white w-72 focus:border-[#00ff88] focus:outline-none transition"
              />
              <button onClick={joinWaitlist} disabled={loading} className="px-8 py-3 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00dd77] transition disabled:opacity-50">
                {loading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </div>
          )}
          {waitlistMsg && <p className="text-sm text-[#00ff88] mb-2">{waitlistMsg}</p>}
        </div>
      </section>

      {/* Live Feed */}
      <section className="px-4 py-16">
        <div className="flex justify-between items-center max-w-3xl mx-auto mb-4">
          <h2 className="text-2xl font-bold">Live Alerts</h2>
          <div className="text-sm text-gray-500">
            {scanned > 0 && <span>{scanned} tokens scanned</span>}
            {lastScan && <span className="ml-3">Last scan: {lastScan}</span>}
          </div>
        </div>
        <LiveFeed alerts={visibleAlerts} />
        {!isOwner && alerts.length > 3 && (
          <p className="text-center text-gray-500 mt-4 text-sm">
            Showing 3 of {alerts.length} alerts.{' '}
            <button onClick={() => setShowCodePrompt(true)} className="text-[#00ff88] underline">
              Enter owner code
            </button>{' '}
            for full access.
          </p>
        )}
        {isOwner && (
          <p className="text-center text-gray-500 mt-4 text-sm">
            Showing all {alerts.length} alerts. Auto-refreshes every 60 seconds.
          </p>
        )}
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="font-bold mb-2">Scan</h3>
            <p className="text-sm text-gray-400">Pulls real market data from CoinGecko every 60 seconds. Top 100 tokens by market cap.</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold mb-2">Detect</h3>
            <p className="text-sm text-gray-400">Flags tokens with &gt;15% price movement or &gt;$1B volume. Sorted by severity.</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🔔</div>
            <h3 className="font-bold mb-2">Alert</h3>
            <p className="text-sm text-gray-400">Shows results instantly. No delay, no paywall on the data itself.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16 max-w-4xl mx-auto" id="pricing">
        <h2 className="text-2xl font-bold mb-2 text-center">Pricing</h2>
        <p className="text-gray-400 text-center mb-10">Start free. Upgrade when you need the edge.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="font-bold text-lg mb-1">Free</h3>
            <p className="text-3xl font-extrabold mb-4">$0<span className="text-sm text-gray-500 font-normal">/mo</span></p>
            <ul className="text-sm text-gray-400 space-y-2 mb-6">
              <li>Top 100 tokens scanned</li>
              <li>60-second refresh</li>
              <li>3 alerts visible</li>
              <li>Web dashboard only</li>
            </ul>
            <div className="text-center text-sm text-gray-500">Current plan</div>
          </div>
          {/* Pro */}
          <div className="bg-[#111] border-2 border-[#00ff88] rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
            <h3 className="font-bold text-lg mb-1">Pro</h3>
            <p className="text-3xl font-extrabold mb-4">$29<span className="text-sm text-gray-500 font-normal">/mo</span></p>
            <ul className="text-sm text-gray-400 space-y-2 mb-6">
              <li>Top 500 tokens + DEX</li>
              <li>15-second refresh</li>
              <li>Unlimited alerts</li>
              <li>Telegram notifications</li>
              <li>Custom filters</li>
              <li>API access</li>
            </ul>
            <button onClick={() => handleCheckout('pro')} className="w-full py-3 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00dd77] transition">
              Subscribe — $29/mo
            </button>
          </div>
          {/* Fund */}
          <div className="bg-[#111] border border-[#7b2ff7] rounded-xl p-6">
            <h3 className="font-bold text-lg mb-1">Fund</h3>
            <p className="text-3xl font-extrabold mb-4">$99<span className="text-sm text-gray-500 font-normal">/mo</span></p>
            <ul className="text-sm text-gray-400 space-y-2 mb-6">
              <li>Everything in Pro</li>
              <li>Whale wallet tracking</li>
              <li>Smart money flow alerts</li>
              <li>Backtesting engine</li>
              <li>Priority support</li>
              <li>Multi-exchange scanning</li>
            </ul>
            <button onClick={() => handleCheckout('fund')} className="w-full py-3 bg-[#7b2ff7] text-white font-bold rounded-lg hover:bg-[#6a20e0] transition">
              Subscribe — $99/mo
            </button>
          </div>
        </div>
        {checkoutMsg && <p className="text-center text-sm mt-4 text-yellow-400">{checkoutMsg}</p>}
      </section>

      {/* Roadmap */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Roadmap</h2>
        <div className="space-y-4">
          <div className="bg-[#111] border border-[#00ff8840] rounded-lg p-4">
            <span className="text-[#00ff88] text-xs font-mono">NOW</span>
            <p className="font-bold mt-1">Free scanner — top 100 tokens, 60s refresh, real CoinGecko data</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <span className="text-yellow-400 text-xs font-mono">NEXT</span>
            <p className="font-bold mt-1">Telegram alerts, DEX token scanning, whale wallet tracking</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-4">
            <span className="text-gray-500 text-xs font-mono">LATER</span>
            <p className="font-bold mt-1">Pro tier ($29/mo) — custom filters, API access, backtesting</p>
          </div>
        </div>
      </section>

      {/* Owner Code Modal */}
      {showCodePrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowCodePrompt(false)}>
          <div className="bg-[#111] border border-[#333] rounded-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">Owner Access</h3>
            <input
              type="password"
              placeholder="Enter passcode"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkCode()}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white mb-3 focus:border-[#7b2ff7] focus:outline-none"
              autoFocus
            />
            <button onClick={checkCode} className="w-full py-2 bg-[#7b2ff7] text-white font-bold rounded-lg hover:bg-[#6a20e0] transition">
              Unlock
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-[#222] py-8 px-4 text-center text-sm text-gray-500">
        <p>AlphaScanner © 2026. Data from CoinGecko. Not financial advice.</p>
      </footer>
    </main>
  )
}
