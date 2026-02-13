import { NextResponse } from 'next/server'

interface TokenData {
  symbol: string
  price: number
  volume24h: number
  volumeChange: number
  priceChange24h: number
}

// Fetch real data from CoinGecko (free, no API key)
async function fetchTopTokens(): Promise<TokenData[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false',
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      volume24h: coin.total_volume,
      volumeChange: coin.price_change_percentage_24h || 0,
      priceChange24h: coin.price_change_percentage_24h || 0,
    }))
  } catch {
    return []
  }
}

function detectAnomalies(tokens: TokenData[]) {
  const alerts: any[] = []

  for (const t of tokens) {
    // Volume spike: >50% price change
    if (Math.abs(t.priceChange24h) > 15) {
      alerts.push({
        token: t.symbol,
        type: t.priceChange24h > 0 ? 'Price Surge' : 'Price Dump',
        severity: Math.abs(t.priceChange24h) > 30 ? 'high' : 'medium',
        change: `${t.priceChange24h > 0 ? '+' : ''}${t.priceChange24h.toFixed(1)}%`,
        price: t.price,
        volume: t.volume24h,
        timestamp: new Date().toISOString(),
      })
    }

    // High volume tokens
    if (t.volume24h > 1_000_000_000) {
      alerts.push({
        token: t.symbol,
        type: 'High Volume',
        severity: 'low',
        change: `$${(t.volume24h / 1e9).toFixed(1)}B vol`,
        price: t.price,
        volume: t.volume24h,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return alerts.sort((a, b) => {
    const sev = { high: 3, medium: 2, low: 1 }
    return (sev[b.severity as keyof typeof sev] || 0) - (sev[a.severity as keyof typeof sev] || 0)
  }).slice(0, 20)
}

export async function GET() {
  const tokens = await fetchTopTokens()
  const alerts = detectAnomalies(tokens)
  return NextResponse.json({
    alerts,
    scanned: tokens.length,
    timestamp: new Date().toISOString(),
  })
}
