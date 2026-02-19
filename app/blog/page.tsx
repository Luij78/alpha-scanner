import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Crypto Trading Blog — AlphaScanner',
  description: 'Crypto trading strategies, scanner reviews, momentum analysis, and buy/sell signal guides. Updated weekly.',
  keywords: 'crypto trading blog, crypto scanner, momentum trading, crypto signals',
}

const articles = [
  {
    slug: '/blog/crypto-trading-signal-api',
    title: 'Best Free Crypto Trading Signal APIs 2026: Build Your Own Bot',
    desc: 'Compare CoinGecko, Binance, TaAPI, and AlphaScanner APIs. Which gives you ready-to-use BUY/SELL signals vs raw data you have to process yourself?',
    date: 'February 2026',
    read: '11 min',
    tag: 'APIs',
  },
  {
    slug: '/blog/crypto-telegram-signal-bots',
    title: 'Best Crypto Telegram Signal Bots 2026: Free vs Paid Compared',
    desc: 'We tested 10+ Telegram signal bots. Here are the 5 best free options, why momentum scanners beat social bots, and how to avoid getting rekt.',
    date: 'February 2026',
    read: '8 min',
    tag: 'Bots',
  },
  {
    slug: '/blog/crypto-momentum-trading',
    title: 'Crypto Momentum Trading: How Dual Momentum Beat Buy-and-Hold by 42.7%',
    desc: 'Backtested on SOL over 180 days. Real results, real alpha. Step-by-step guide to the Dual Momentum strategy.',
    date: 'February 2026',
    read: '10 min',
    tag: 'Strategy',
  },
  {
    slug: '/blog/crypto-buy-sell-signals',
    title: 'Free Crypto Buy & Sell Signals: How to Use Momentum Scoring',
    desc: 'Understanding the 0-100 scoring system, multi-timeframe analysis, and how to act on BUY/SELL signals without losing your shirt.',
    date: 'February 2026',
    read: '7 min',
    tag: 'Signals',
  },
  {
    slug: '/blog/best-crypto-scanners',
    title: 'Best Crypto Scanners in 2026: Free & Paid Tools Compared',
    desc: 'CoinGecko vs TradingView vs Nansen vs AlphaScanner. Features, pricing, and which is right for you.',
    date: 'February 2026',
    read: '8 min',
    tag: 'Reviews',
  },
]

export default function BlogIndex() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1b2a 50%, #1b2838 100%)',
      color: '#e0e0e0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '60px 20px',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link href="/" style={{ color: '#00d4ff', textDecoration: 'none', fontSize: '.9rem' }}>← Back to Scanner</Link>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '24px 0 8px' }}>
          AlphaScanner Blog
        </h1>
        <p style={{ color: '#64748b', marginBottom: '40px' }}>
          Crypto trading strategies, scanner guides, and market analysis. Written by traders, for traders.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {articles.map(a => (
            <Link key={a.slug} href={a.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '24px',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '.75rem',
                    padding: '2px 8px',
                    background: 'rgba(0,212,255,0.1)',
                    color: '#00d4ff',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}>{a.tag}</span>
                  <span style={{ fontSize: '.8rem', color: '#64748b' }}>{a.date} · {a.read}</span>
                </div>
                <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 8px', fontWeight: 600 }}>{a.title}</h2>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '.95rem', lineHeight: 1.6 }}>{a.desc}</p>
              </article>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '48px', padding: '24px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: '#fff', fontWeight: 600, marginBottom: '8px' }}>Want signals in your inbox?</p>
          <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '.9rem' }}>Join the waitlist for daily BUY/SELL email reports.</p>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            color: '#000',
            borderRadius: '8px',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Open Scanner & Join Waitlist →
          </Link>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', marginTop: '48px', color: '#64748b', fontSize: '.85rem' }}>
          <p>Built by <a href="https://x.com/luij78" style={{color:'#00d4ff',textDecoration:'none'}}>@luij78</a> · 
          More tools at <a href="https://luis-tools-store.vercel.app" style={{color:'#00d4ff',textDecoration:'none'}}>luis-tools-store.vercel.app</a></p>
        </div>
      </div>
    </div>
  )
}
