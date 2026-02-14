# AlphaScanner Email Automation Spec

## Goal
Turn waitlist signups into paying customers through automated email nurture sequence.

## Current State
- Waitlist API exists: POST /api/waitlist saves emails to JSON file
- No email sending capability
- No nurture sequence

## What We Need

### 1. Email Service Setup
**Provider:** Resend (free tier: 100 emails/day, 3,000/month)
- API key setup
- Domain verification (prompt-pack-site.vercel.app or alphascanner.app)
- From address: alerts@alphascanner.app

### 2. Email Sequence (5 emails over 7 days)
**Day 0** (immediate):
- Subject: "Your AlphaScanner access is ready"
- Body: Welcome, what AlphaScanner does, owner code: skipper2026 for instant access
- CTA: "Try it free with owner code" → link to app

**Day 2**:
- Subject: "3 signals your competition isn't watching"
- Body: Educational (volume spikes, whale movements, sentiment shifts)
- CTA: "See live alerts" → app link

**Day 4**:
- Subject: "Free vs Pro: What you're missing"
- Body: Feature comparison (free = 5 alerts/day, Pro = unlimited + custom thresholds)
- CTA: "Upgrade to Pro for $29/mo"

**Day 6**:
- Subject: "Last chance: 20% off Pro tier"
- Body: Urgency (offer expires in 24h), social proof (fake testimonial risk — use real data instead)
- CTA: "Claim discount" → checkout link

**Day 7**:
- Subject: "Still watching the market manually?"
- Body: Pain point reminder, missed opportunities cost
- CTA: "Automate your edge" → app link

### 3. Technical Implementation

**File:** email-automation/
- send-welcome.js — Sends day 0 email immediately on signup
- daily-drip.js — Cron job (runs daily at 9 AM EST)
  - Reads waitlist.json
  - Checks each email's signup_date
  - Sends appropriate email based on days since signup
  - Marks as sent in waitlist.json (sent_emails: [])

**Waitlist JSON schema update:**
```json
{
  "email": "user@example.com",
  "timestamp": "2026-02-13T23:00:00Z",
  "sent_emails": ["day0", "day2"], // Track which emails sent
  "converted": false,
  "conversion_date": null
}
```

**Email templates:** HTML with inline CSS (mobile-responsive)

### 4. Analytics Tracking
- Open rate (Resend provides this)
- Click rate (UTM params: ?utm_source=email&utm_medium=drip&utm_campaign=day2)
- Conversion rate (track paid signups, mark converted: true)

### 5. Safety
- Unsubscribe link in every email (required by law)
- Respect "do not contact" list
- Rate limit: max 100/day (Resend free tier limit)

## Build Priority
1. Day 0 welcome email (highest value — immediate engagement)
2. Daily drip cron job
3. Email templates (days 2, 4, 6, 7)
4. Analytics dashboard (track opens/clicks/conversions)

## Time Estimate
- 30-45 minutes for complete implementation
- Requires: Resend API key from Luis

## Expected Impact
- 10% conversion from waitlist → trial users (using owner code)
- 2-5% conversion trial → paid ($29/mo)
- If 50 waitlist signups → 5 trials → 1-2 paid customers = $29-58 MRR

