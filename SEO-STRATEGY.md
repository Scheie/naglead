# NagLead — SEO & Growth Strategy

## Target Market

**Primary:** Solo cleaning businesses (residential + commercial)
- Highest lead volume of any trade
- Speed of response is everything — 21x more likely to win if you reply in 5 minutes
- Current tools too expensive (Jobber $39/mo, GoHighLevel $97/mo) or too complex (HubSpot)
- NagLead fills the gap between phone notes ($0) and full CRM ($39-97/mo)

**Secondary:** Plumbers, electricians, landscapers, handymen, painters

---

## Technical SEO (Done)

- [x] Title tag + meta description
- [x] Open Graph + Twitter Card meta tags
- [x] Sitemap.xml (auto-generated)
- [x] robots.txt
- [x] Canonical URLs
- [x] JSON-LD structured data (SoftwareApplication schema with pricing)
- [x] Keywords targeting trade-specific long-tail terms
- [x] Fast page load via Vercel CDN
- [x] Security headers (HSTS, X-Frame-Options, etc.)
- [ ] Submit to Google Search Console + submit sitemap
- [ ] Submit to Bing Webmaster Tools

---

## Content SEO — Blog Strategy

Blog lives at `/blog` on naglead.com. Each post targets a specific long-tail keyword cluster.

### Priority 1: Bottom-of-funnel (people ready to buy)

| Post | Target keywords | Status |
|------|----------------|--------|
| "How to follow up on cleaning leads without a CRM" | cleaning leads follow up, no CRM | First post |
| "NagLead vs Jobber: Which is right for solo cleaners?" | jobber alternative, simple cleaning CRM | Planned |
| "NagLead vs Less Annoying CRM" | less annoying CRM alternative | Planned |
| "Best lead tracker for cleaning businesses in 2026" | best CRM cleaning business 2026 | Planned |

### Priority 2: Problem-aware (know they have a problem)

| Post | Target keywords | Status |
|------|----------------|--------|
| "Why cleaners lose 40% of their leads (and one fix)" | cleaning business lost leads | Planned |
| "The 5-minute rule: How fast you respond decides who gets the job" | respond to leads fast | Planned |
| "Stop using spreadsheets to track your leads" | track leads without spreadsheet | Planned |

### Priority 3: Trade-specific (expand to other trades)

| Post | Target keywords | Status |
|------|----------------|--------|
| "Lead tracking for plumbers who hate CRMs" | plumber lead management | Planned |
| "Electrician lead follow-up: the simple system" | electrician lead tracker | Planned |
| "Landscaping leads: stop losing jobs to faster competitors" | landscaper CRM alternative | Planned |

### Blog content rules:
- 800-1,200 words max (no fluff)
- Clear H1, H2 structure for SEO
- Include a CTA to sign up at the end
- Use real examples and trade-specific language
- No generic "10 tips" listicles — be opinionated

---

## Reddit Strategy

### Target subreddits

| Subreddit | Audience | Approach |
|-----------|----------|----------|
| r/CleaningBusiness | Solo cleaning owners | Primary — most relevant |
| r/maids | House cleaning operators | Direct audience |
| r/smallbusiness | General small business | Broader reach, high volume |
| r/sweatystartup | Service business founders | Tech-savvy audience |
| r/plumbing | Plumbers | Trade-specific expansion |
| r/electricians | Electricians | Trade-specific expansion |
| r/HVAC | HVAC techs | Trade-specific expansion |
| r/Landscaping | Landscapers | Trade-specific expansion |
| r/freelance | Freelancers | General audience |

### Post types that work

**1. Problem validation (not promotional)**
> "Cleaning business owners — how do you track leads? I keep losing jobs because I forget to call people back. What do you use?"

**2. Honest builder post (after product exists)**
> "I built a $10/month app that just nags you to call your leads back. No CRM, no pipeline — just reminders. Looking for 10 cleaners to try free and tell me if it's useful."

**3. Reply to existing threads**
Search for threads asking "how do you track leads?" or "what CRM do you use?" and reply with genuine help. Mention NagLead naturally if relevant.

### Rules:
- Lead with the problem, not the product
- Disclose affiliation ("I built this")
- Offer free trial, not a sales pitch
- Be specific — trade language, real numbers, screenshots
- Never spam — one post per subreddit per week max
- Respond to DMs and follow-up questions

---

## Google Search Console

- [ ] Verify naglead.com via DNS TXT record in Cloudflare
- [ ] Submit sitemap: `https://naglead.com/sitemap.xml`
- [ ] Monitor Core Web Vitals
- [ ] Monitor keyword impressions and clicks
- [ ] Check for crawl errors weekly

---

## Metrics to Track (PostHog)

- Landing page → Signup conversion rate
- Signup → First lead added
- First lead → Paid upgrade
- Blog → Signup attribution (which posts drive signups)
- Reddit referral traffic

---

## What NOT to do

- Don't compete on "CRM" keywords (HubSpot/Salesforce own them)
- Don't launch on Product Hunt (wrong audience — trades aren't there)
- Don't build an affiliate program early (attracts wrong partners)
- Don't rely on App Store discovery (search volume too low)
- Don't write generic marketing content — be trade-specific and opinionated
