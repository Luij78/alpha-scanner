import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false',
      { next: { revalidate: 120 } }
    )
    if (!res.ok) return NextResponse.json({ error: 'API unavailable' }, { status: 503 })
    const data = await res.json()

    // Find the 3 most interesting movers for free tier
    const movers = data
      .filter((c: any) => Math.abs(c.price_change_percentage_24h || 0) > 5)
      .sort((a: any, b: any) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
      .slice(0, 3)
      .map((c: any) => ({
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        price: c.current_price,
        change24h: c.price_change_percentage_24h?.toFixed(1) + '%',
        volume: c.total_volume,
        marketCap: c.market_cap,
        image: c.image,
      }))

    const totalAlerts = data.filter((c: any) => Math.abs(c.price_change_percentage_24h || 0) > 5).length

    return NextResponse.json({
      free: movers,
      totalAlerts,
      hiddenAlerts: Math.max(0, totalAlerts - 3),
      message: totalAlerts > 3 ? `${totalAlerts - 3} more alerts available with Pro ($29/mo)` : 'All clear — no hidden alerts',
      upgradeUrl: '/api/checkout?plan=pro',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
