import { NextResponse } from 'next/server'

interface TokenData {
  id: string
  symbol: string
  name: string
  price: number
  volume24h: number
  priceChange24h: number
  priceChange7d: number
  priceChange30d: number
  marketCap: number
  marketCapRank: number
  ath: number
  athChangePercent: number
}

interface Signal {
  token: string
  name: string
  signal: 'BUY' | 'SELL' | 'WATCH' | 'HOLD'
  strength: 'STRONG' | 'MODERATE' | 'WEAK'
  score: number       // 0-100 bullish score
  price: number
  change24h: number
  change7d: number
  change30d: number
  volume24h: number
  reasoning: string
  triggers: string[]
  risks: string[]
  severity: 'high' | 'medium' | 'low'
  type: string
  change: string
  timestamp: string
}

// Fetch real market data with 7d and 30d changes
async function fetchTopTokens(): Promise<TokenData[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets' +
      '?vs_currency=usd' +
      '&order=market_cap_desc' +
      '&per_page=50' +
      '&page=1' +
      '&sparkline=false' +
      '&price_change_percentage=24h,7d,30d',
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      volume24h: coin.total_volume,
      priceChange24h: coin.price_change_percentage_24h || 0,
      priceChange7d: coin.price_change_percentage_7d_in_currency || 0,
      priceChange30d: coin.price_change_percentage_30d_in_currency || 0,
      marketCap: coin.market_cap || 0,
      marketCapRank: coin.market_cap_rank || 999,
      ath: coin.ath || 0,
      athChangePercent: coin.ath_change_percentage || 0,
    }))
  } catch {
    return []
  }
}

/**
 * Generate a BUY/SELL/WATCH signal using multi-timeframe momentum analysis.
 * 
 * Scoring system (0-100 bullish):
 * - 30d trend (40 pts): main trend direction
 * - 7d trend (30 pts): intermediate momentum  
 * - 24h action (20 pts): entry timing
 * - Volume (10 pts): confirming volume
 * 
 * Signal mapping:
 * - Score 65+: BUY (momentum building)
 * - Score 55-64: WATCH (potential setup forming)
 * - Score 35-54: HOLD (no clear direction)
 * - Score <35: SELL/AVOID (downtrend)
 */
function generateSignal(token: TokenData): Signal {
  let score = 50  // Neutral baseline
  const triggers: string[] = []
  const risks: string[] = []
  
  // === 30-DAY TREND (40 points max) ===
  if (token.priceChange30d > 20) {
    score += 20
    triggers.push(`Strong 30d rally: +${token.priceChange30d.toFixed(1)}%`)
  } else if (token.priceChange30d > 5) {
    score += 10
    triggers.push(`Positive 30d trend: +${token.priceChange30d.toFixed(1)}%`)
  } else if (token.priceChange30d < -20) {
    score -= 20
    risks.push(`30d downtrend: ${token.priceChange30d.toFixed(1)}%`)
  } else if (token.priceChange30d < -5) {
    score -= 10
    risks.push(`Weak 30d: ${token.priceChange30d.toFixed(1)}%`)
  }
  
  // === 7-DAY MOMENTUM (30 points max) ===
  if (token.priceChange7d > 15) {
    score += 20
    triggers.push(`7d breakout: +${token.priceChange7d.toFixed(1)}%`)
  } else if (token.priceChange7d > 5) {
    score += 12
    triggers.push(`7d momentum: +${token.priceChange7d.toFixed(1)}%`)
  } else if (token.priceChange7d > 0) {
    score += 5
    triggers.push(`7d positive: +${token.priceChange7d.toFixed(1)}%`)
  } else if (token.priceChange7d < -15) {
    score -= 20
    risks.push(`7d breakdown: ${token.priceChange7d.toFixed(1)}%`)
  } else if (token.priceChange7d < -5) {
    score -= 12
    risks.push(`7d weakness: ${token.priceChange7d.toFixed(1)}%`)
  } else {
    score -= 5
    risks.push(`7d negative: ${token.priceChange7d.toFixed(1)}%`)
  }
  
  // === 24-HOUR ACTION (20 points max) ===
  if (token.priceChange24h > 10) {
    score += 15
    triggers.push(`24h surge: +${token.priceChange24h.toFixed(1)}%`)
  } else if (token.priceChange24h > 3) {
    score += 8
    triggers.push(`24h up: +${token.priceChange24h.toFixed(1)}%`)
  } else if (token.priceChange24h > 0) {
    score += 3
  } else if (token.priceChange24h < -10) {
    score -= 15
    risks.push(`24h dump: ${token.priceChange24h.toFixed(1)}%`)
  } else if (token.priceChange24h < -3) {
    score -= 8
    risks.push(`24h selling: ${token.priceChange24h.toFixed(1)}%`)
  } else {
    score -= 3
  }
  
  // === VOLUME CONFIRMATION (10 points max) ===
  // High volume tokens get a signal quality boost
  if (token.volume24h > 2_000_000_000) {
    score += 7
    triggers.push(`Massive volume: $${(token.volume24h/1e9).toFixed(1)}B`)
  } else if (token.volume24h > 500_000_000) {
    score += 5
    triggers.push(`High volume: $${(token.volume24h/1e9).toFixed(1)}B`)
  } else if (token.volume24h > 100_000_000) {
    score += 3
  } else {
    score -= 3
    risks.push('Low liquidity')
  }
  
  // === SPECIAL CONDITIONS ===
  
  // Trend alignment: all 3 timeframes pointing same direction
  const allBullish = token.priceChange30d > 0 && token.priceChange7d > 0 && token.priceChange24h > 0
  const allBearish = token.priceChange30d < 0 && token.priceChange7d < 0 && token.priceChange24h < 0
  
  if (allBullish) {
    score += 10
    triggers.push('All timeframes aligned ✓')
  } else if (allBearish) {
    score -= 10
    risks.push('All timeframes bearish')
  }
  
  // ATH proximity (potential resistance/target)
  if (token.athChangePercent > -20) {
    risks.push(`Near ATH (${token.athChangePercent.toFixed(0)}% below)`)
  } else if (token.athChangePercent < -80) {
    triggers.push(`Deep ATH discount: ${token.athChangePercent.toFixed(0)}% from ATH`)
  }
  
  // Cap score
  score = Math.min(100, Math.max(0, score))
  
  // === DETERMINE SIGNAL ===
  let signal: Signal['signal']
  let strength: Signal['strength']
  let reasoning: string
  let signalType: string
  let severity: Signal['severity']
  
  if (score >= 72) {
    signal = 'BUY'
    strength = 'STRONG'
    reasoning = `Strong bullish momentum across multiple timeframes. ${triggers.slice(0, 2).join(', ')}.`
    signalType = 'Buy Signal'
    severity = 'high'
  } else if (score >= 62) {
    signal = 'BUY'
    strength = 'MODERATE'
    reasoning = `Bullish momentum building. ${triggers.slice(0, 2).join(', ')}.`
    signalType = 'Buy Signal'
    severity = 'medium'
  } else if (score >= 55) {
    signal = 'WATCH'
    strength = 'MODERATE'
    reasoning = `Potential setup forming — momentum improving but not confirmed. Watch for follow-through.`
    signalType = 'Watch'
    severity = 'low'
  } else if (score >= 40) {
    signal = 'HOLD'
    strength = 'WEAK'
    reasoning = `No clear edge. Mixed signals. Wait for clearer direction.`
    signalType = 'Hold'
    severity = 'low'
  } else if (score >= 28) {
    signal = 'SELL'
    strength = 'MODERATE'
    reasoning = `Bearish momentum. ${risks.slice(0, 2).join(', ')}.`
    signalType = 'Sell Signal'
    severity = 'medium'
  } else {
    signal = 'SELL'
    strength = 'STRONG'
    reasoning = `Strong downtrend. ${risks.slice(0, 2).join(', ')}.`
    signalType = 'Sell Signal'
    severity = 'high'
  }
  
  const changeDisplay = token.priceChange24h > 0 
    ? `+${token.priceChange24h.toFixed(1)}%` 
    : `${token.priceChange24h.toFixed(1)}%`
  
  return {
    token: token.symbol,
    name: token.name,
    signal,
    strength,
    score,
    price: token.price,
    change24h: token.priceChange24h,
    change7d: token.priceChange7d,
    change30d: token.priceChange30d,
    volume24h: token.volume24h,
    reasoning,
    triggers,
    risks,
    severity,
    type: signalType,
    change: changeDisplay,
    timestamp: new Date().toISOString(),
  }
}

export async function GET() {
  const tokens = await fetchTopTokens()
  const signals = tokens.map(generateSignal)
  
  // Sort: BUY signals first, then by score
  const sorted = signals.sort((a, b) => {
    const signalPriority = { BUY: 4, WATCH: 3, HOLD: 2, SELL: 1 }
    const aPri = signalPriority[a.signal] || 0
    const bPri = signalPriority[b.signal] || 0
    if (aPri !== bPri) return bPri - aPri
    return b.score - a.score
  })
  
  // Stats
  const buys = signals.filter(s => s.signal === 'BUY').length
  const sells = signals.filter(s => s.signal === 'SELL').length
  const watches = signals.filter(s => s.signal === 'WATCH').length
  const marketSentiment = buys > sells * 1.5 ? 'BULLISH' 
    : sells > buys * 1.5 ? 'BEARISH' 
    : 'NEUTRAL'
  
  return NextResponse.json({
    alerts: sorted,
    scanned: tokens.length,
    summary: {
      buys,
      sells,
      watches,
      marketSentiment,
    },
    timestamp: new Date().toISOString(),
  })
}
