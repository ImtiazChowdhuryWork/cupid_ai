# Cupid AI

AI-powered flirting assistant. Users paste a conversation and get 5 tailored response suggestions across 5 modes — witty, sincere, confident, thoughtful, and casual — powered by Claude API with consistent JSON schema enforcement.

---

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Current Build State](#current-build-state)
5. [3-Month Roadmap](#3-month-roadmap)
6. [Month 1 Specs — Dashboard Additions](#month-1-specs--dashboard-additions)
7. [Month 2 Specs — Profile Redesign](#month-2-specs--profile-redesign)
8. [Month 3 Specs — Cupid Coach Tier](#month-3-specs--cupid-coach-tier)
9. [Strategic Ideas Backlog](#strategic-ideas-backlog)
10. [Running Everything](#running-everything)
11. [API Endpoints](#api-endpoints)
12. [Mobile App Conventions](#mobile-app-conventions)
13. [Adding a New Feature](#adding-a-new-feature)

---

## Repository Structure

```
cupid_ai/
├── mobile/       ← Flutter app (BLoC, GoRouter, GetIt, screenutil)
├── ai_service/   ← Python + FastAPI — prompt engineering + Claude API
├── backend/      ← Golang + Gin — auth, users, rate limiting, history
├── dashboard/    ← Next.js 16 — CEO + marketing admin panel
└── README.md     ← this file (canonical spec + roadmap)
```

Each folder is self-contained with its own `.gitignore`, dependencies, and README.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Flutter App                          │
│       auth · UI · response display · offline cache          │
└─────────────────────┬───────────────────────────────────────┘
                      │  REST + JWT  ·  port 8080
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Golang Backend                           │
│   auth · users · rate limiting · history · PostgreSQL       │
└─────────────────────┬───────────────────────────────────────┘
                      │  internal REST  ·  port 8001
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Microservice                            │
│   prompt engineering · schema enforcement · retry logic     │
└─────────────────────┬───────────────────────────────────────┘
                      │  Claude API (key lives here only)
                      ▼
                  Anthropic Claude

┌─────────────────────────────────────────────────────────────┐
│                  Admin Dashboard                            │
│  Next.js · CEO business metrics · marketing analytics       │
│              port 3000  ·  connects to backend              │
└─────────────────────────────────────────────────────────────┘
```

**Why this architecture:**
- **Consistency** — AI microservice locks Claude into fixed schema. Always 5 suggestions, always one per mode, always valid JSON.
- **Security** — Claude API key never leaves the AI service. Flutter has no idea it exists.
- **Cost control** — Golang backend enforces rate limits before any request reaches the AI service.
- **Replaceability** — Swap Claude → GPT-4 → Gemini without touching Flutter or Golang. Only the AI service changes.

---

## Tech Stack

| Layer | Technology | Port | Status |
|---|---|---|---|
| Mobile | Flutter 3.x + BLoC + GoRouter + GetIt | — | ✅ Running |
| Golang backend | Gin + JWT + CORS + PostgreSQL 17 | 8080 | ✅ Running |
| AI microservice | Python 3.12 + FastAPI | 8001 | ✅ Running |
| Dashboard | Next.js 16 + Recharts | 3000 | ✅ Running |
| Database | PostgreSQL 17 | 5432 | ✅ Running |
| Cache | Redis | — | ⏳ Planned |
| AI model | Claude API (Anthropic) | — | ⏳ Key pending |

---

## Current Build State

### Mobile App (Flutter)
- Splash screen → Login/Signup → 4-tab home shell (PageView + animated nav)
- **Auth** — real JWT login/signup working end-to-end with Golang backend
- **Analysis** — conversation input → 5 response cards with mode badges + confidence scores
- **History** — paginated past analyses with skeleton loading
- **Profile** — basic: tier badge, usage bar, streak stats, display name edit, logout
- DEV bypass button on login (debug only, stripped from release)
- Backend URL: `http://192.168.1.115:8080/api/v1` (physical device via same WiFi)

### Golang Backend
All endpoints tested and working:

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/health` | None |
| POST | `/api/v1/auth/register` | None |
| POST | `/api/v1/auth/login` | None |
| GET | `/api/v1/profile` | Bearer |
| PATCH | `/api/v1/profile` | Bearer |
| POST | `/api/v1/analysis` | Bearer |
| GET | `/api/v1/analysis/history` | Bearer |

### AI Microservice
- `/health` and `/analyze` endpoints working
- Blocked on Claude API key (set in `ai_service/.env`)

### Admin Dashboard (9 pages)

**Business:** Overview · Revenue · Users · Analytics · Forecast

**Marketing:** Acquisition (CAC, LTV, LTV:CAC, channel ROI) · Campaigns (ads, A/B tests, email)

**System:** Alerts · Settings (API key, pricing editor, feature flags, maintenance)

---

## 3-Month Roadmap

### Month 1 — Dashboard Depth (High ROI, Low Risk)

Four critical blind spots the current dashboard doesn't cover:

| Addition | Why It Matters |
|---|---|
| Cohort retention table + curves | Reveals whether product stickiness is improving or declining — before revenue reports show the problem |
| Customer health score (0–100) | Enables proactive churn intervention before users are already gone |
| Unit economics sensitivity grid | Shows how fragile your forecasts are — one shift in CAC or churn breaks the model |
| Claude API cost forecasting | Largest variable cost is opaque — one model price change destroys margin without warning |

### Month 2 — Profile Gamification (Retention Lever)

The current profile is basic and gives users no reason to open it. Rebuild into 7-tab experience:
- Your Story (progress, streaks, stats, monthly highlight)
- Achievements (badges, seasonal challenges, leaderboards)
- Insights (usage patterns, response effectiveness, conversation arc)
- Social (referral ladder, shareable responses)
- Preferences (response length, mode order, notification settings)
- Subscription (plan details, billing history, pause option)
- Privacy (data transparency, GDPR export, account deletion)

### Month 3 — Cupid Coach Tier (Revenue Upside)

New $29.99/month tier positioned between Monthly ($14.99) and Premium ($49.99):
- Weekly async coaching sessions via Claude
- Conversation strategy guides
- Advanced personal analytics
- Priority support

---

## Month 1 Specs — Dashboard Additions

### 1. Cohort Retention Table + Curves

**What it is:** A table showing what % of each monthly signup cohort is still active at Week 1, Week 2, Week 4, Month 2, Month 3.

**Why it matters:**
- LTV projections are worthless if retention is tanking
- If retention dropped from 45% to 25%, LTV of $50 is now $30
- You see this BEFORE revenue reports show the problem
- If Jan cohort retains 48% at Month 1 and Feb retains 31%, something broke in February

**Visual structure:**
```
Cohort Table (color-coded green → red):

Signup Month | Week 1 | Week 2 | Week 4 | Month 2 | Month 3
Nov 2025     | 100%   | 72%    | 48%    | 34%     | 28%
Dec 2025     | 100%   | 69%    | 45%    | 31%     | 24%
Jan 2026     | 100%   | 71%    | 48%    | —       | —
Feb 2026     | 100%   | 68%    | —      | —       | —
```

**Retention curve chart:** Animated line chart — one line per cohort, x-axis = weeks since signup, y-axis = % retained. Industry benchmark line (40% at Month 1 = healthy) overlaid as dashed line.

**Payback timeline per cohort:**
- Jan cohort: 3.2 months avg payback
- Feb cohort: 4.1 months (declining — investigate)

**Where it lives:** New sub-section on Analytics page, below the conversion funnel.

**Backend endpoint needed:** `GET /api/v1/admin/cohorts` → returns cohort data grouped by signup month.

---

### 2. Customer Health Score

**What it is:** A composite 0–100 score per user, automatically calculated.

**Why it matters:** You cannot intervene on at-risk users without a model. "At-risk" currently means "segment = at_risk" — that's manual and reactive. A health score is automatic and predictive.

**Score components (each 0–100, weighted average):**
```
Engagement (40% weight):
  - Days since last analysis: 0 days = 100, 7+ days = 0

Usage intensity (25% weight):
  - Analyses/week vs tier limit: at 100% of limit = 100, at 0% = 0

Feature breadth (15% weight):
  - Distinct features used (history, save, copy): 3+ features = 100

Payment health (10% weight):
  - Days until renewal: 30+ days = 100, <3 days = 20

Satisfaction proxy (10% weight):
  - Response mode diversity: using 4-5 modes = 100, only 1 mode = 20
```

**Segmentation:**
- 🔴 0–33: At-risk — churn likely within 30 days → trigger win-back email
- 🟡 34–66: Stable — no immediate action
- 🟢 67–100: Healthy — expansion opportunity (upsell)

**Health trend by cohort:**
- Jan cohort: 60% Green, 30% Yellow, 10% Red
- Feb cohort: 40% Green, 40% Yellow, 20% Red → alert if Red > 15%

**Intervention prompts:**
- "5 Red users haven't opened app in 7 days. Send win-back email?"
- "12 Premium users haven't used history. Consider feature education?"

**Where it lives:** New card on Overview page + column in Users table.

**Backend endpoint needed:** `GET /api/v1/admin/users/:id/health-score`

---

### 3. Unit Economics Sensitivity Grid

**What it is:** A 3×3 grid showing how net profit changes as CAC and churn vary.

**Why it matters:** Current forecasts assume fixed CAC and churn. One bad month of paid ads (CAC goes from $10 to $15) combined with a product regression (churn goes from 8% to 12%) can wipe out all margin. The grid makes this visible.

**Grid structure:**
```
                    CAC
                 $8    $10    $12
              ┌──────┬──────┬──────┐
Churn   8%   │ $148  │ $125  │ $103 │  ← LTV:CAC
       10%   │ $118  │  $99  │  $82 │
       12%   │  $98  │  $82  │  $68 │
              └──────┴──────┴──────┘
              Cells = Net LTV after CAC deducted
```

Color-code: Green (LTV > $100), Yellow ($60–100), Red (< $60).

**Breakeven user count tracker:**
```
"At current churn (10%) + CAC ($10) + LTV ($99):
 Breakeven requires 58 paid users.
 You have 297. You're 239 users above breakeven. ✅"
```

**Price sensitivity simulation:**
- "If Monthly tier → $16.99: revenue +13%, but assume 2% more churn"
- "Net impact: +$2,100 MRR if conversion drop < 4%"

**Where it lives:** New card on Revenue page, below MRR growth sparkline.

---

### 4. Claude API Cost Forecasting

**What it is:** Real-time tracking of Claude API spend with forward projection and anomaly detection.

**Why it matters:** Claude API is your largest variable cost. Right now it's a black box. If a few power users run 50+ analyses each, your daily bill spikes and you don't know until the invoice. One model pricing change from Anthropic and your margins drop 20% overnight.

**Components:**

**Cost per analysis trend (line chart, 90 days):**
- Y-axis: $/analysis
- If trending from $0.004 → $0.006, red alert
- Drill-down: "What changed? Longer conversations? Model price increase?"

**Monthly bill forecast:**
```
Month-to-date: $412
Projected by month-end: $1,240
Monthly budget: $1,000
Status: ⚠ On pace to exceed budget by 24%
```

**Efficiency levers panel:**
```
Current cache hit rate: 15%
→ If you increase to 40%: save $800/month

Free tier limit: 3/day
→ If reduced to 2/day: save $400/month, churn up est. 1-2%

Model: Claude Opus 4.7 (all users)
→ If Free tier moves to Haiku: save $650/month, quality down ~5%
```

**Model cost comparison:**
| Model | Cost/analysis | Quality | Recommended for |
|---|---|---|---|
| Claude Opus 4.7 | $0.030 | Best | Premium users |
| Claude Sonnet 4.6 | $0.006 | Great | Monthly users |
| Claude Haiku 4.5 | $0.0002 | Good | Free tier |

**Where it lives:** New section on Revenue page + widget on Overview.

**Backend endpoint needed:** `GET /api/v1/admin/api-costs` → returns daily cost per analysis, total spend, cache hit rate.

---

## Month 2 Specs — Profile Redesign

### Goal

Transform profile from a settings page nobody opens into a reason to open the app daily. The profile should be:
- **Progress Dashboard** — your flirting journey, milestones, achievements
- **Social Hub** — share responses, invite friends, referral ladder
- **Insight Engine** — understand your own patterns and growth
- **Preference Center** — personalize your experience
- **Subscription Control** — crystal-clear billing and value
- **Trust Panel** — privacy, data, account security

### Tab 1: Your Story (Default)

**Hero — Progress Card:**
```
┌─────────────────────────────────────────┐
│  You're on a 🔥 15-day streak!          │
│  [████████████░░░░░] 15 / 30 days       │
│  Next: 30-day Super Streak              │
│  Reward: +7 free analyses + badge       │
│  [⚡ Keep It Going]  [See All Rewards]  │
└─────────────────────────────────────────┘
```
- Animated flame when opened
- Countdown to next milestone with reward preview
- If streak at risk (not used today), banner shows at top
- "Keep It Going" sends user directly to Analyze tab

**Stats at a Glance (horizontal scroll cards):**
- Total analyses (lifetime) — tap for month-by-month chart
- Best streak (personal record)
- Total responses generated
- Days active this month

**Response Mode Affinity (mini pie chart):**
```
Your Signature Style:
• Sincere: 38% — your favorite!
• Witty: 25%
• Casual: 18%
• Confident: 14%
• Thoughtful: 5%

"You're a hearts-first communicator."
```
- AI insight evolves as data grows
- Tap: "How does my style compare to other users?" (anonymized)

**Monthly Highlight Card:**
- Most active day
- Conversations analyzed
- Days active / days in month
- Favorite saved response
- Link to detailed monthly report

---

### Tab 2: Achievements

**Unlocked achievements grid (3 columns):**
```
[🔥 Day Keeper]     [💬 100 Analyses]   [🎯 Power User]
5-day streak        100 analyses used    500 responses
Unlocked Dec 15     Unlocked Jan 8       Unlocked Jan 20
```

**Locked achievements (grayed out with progress):**
```
[🏆 Legend]           [💎 Premium Master]   [🌟 Influencer]
"3/30 days"           "6 months premium"    "5 friends converted"
```

**Seasonal Challenge:**
```
🎯 May Challenge: Make Them Smile
Get 10 positive-response reactions in your conversations
Progress: [██████░░░░] 6 / 10
Reward: +14 free analyses | Days left: 12
```

**Leaderboard (opt-in, anonymous):**
```
🏆 This Month
1. @SarahJ — 156 analyses
2. @MikesStories — 142 analyses
3. @You — 127 analyses 📍
```
- Opt-in only, usernames only, no personal data
- Rank by: analyses, streak, badges

---

### Tab 3: Insights (power users only — show after 50+ analyses)

**Usage Pattern Summary:**
- Weekly analysis averages over last 30 days
- Trend: "You're getting more active ↑22%"
- Peak day: "Most active on Thursdays & Fridays"
- Speed: "You respond in 45 seconds — faster than 70% of users"

**Response Effectiveness:**
```
Mode      | Reply Rate | Avg Reply Time
Sincere   | 89%        | 3.2 hours ← Best!
Witty     | 72%        | 4.8 hours
Confident | 68%        | 5.1 hours
Casual    | 61%        | 6.3 hours
Thoughtful| 45%        | 8.0 hours
```
- Estimated from time-to-reply patterns
- Insight: "Your Sincere responses get fastest replies. Lean into emotional honesty!"

**Conversation Arc Patterns (after 100+ analyses):**
```
Early stage (msg 1–5):   Best mode → Witty     (builds engagement)
Middle stage (msg 6–15): Best mode → Sincere   (builds trust)
Late stage (msg 15+):    Best mode → Confident (moves forward)
```

---

### Tab 4: Social

**Referral Ladder:**
```
🎁 Invite Friends, Get Rewards

Your referral code: CUPID15
Friends invited: 3 | Converted: 1

Reward progress: ██░░░░░░░░ 1 / 5

Milestones:
1 friend → +7 analyses
3 friends → +30 analyses + "Friend Master" badge
5 friends → 1 free month + "Love Spreader" badge
10 friends → lifetime 5% discount + "Wingperson" status

[📱 Share Link]  [📋 Copy Code]  [👥 View Referrals]
```

**Share a Response:**
```
Your Best Response (This Week):
"I know a great coffee place near you 👀"
Mode: Confident | Score: 94%
[❤️ Save]  [📤 Share]  [📋 Copy]
👥 2 people used this response
```
- Share to Instagram Stories, WhatsApp, SMS
- Track: how many times shared

---

### Tab 5: Preferences

**Response defaults:**
- Length: Short / Medium / Long
- Default mode order (drag to reorder)
- Show confidence scores: on/off
- Show sentiment analysis: on/off
- Auto-suggest saved responses: on/off

**Notification preferences (granular):**
- Streak reminders (daily, custom time)
- Achievement unlocked (instant)
- Challenge progress (weekly)
- Subscription renewal (3 days before)
- Product tips (weekly)
- Separate toggles for push vs email

---

### Tab 6: Subscription

**Current Plan Hero Card:**
```
📱 Monthly Plan — $14.99/month

✅ Unlimited analyses
✅ Response history (90 days)
✅ Saved responses (unlimited)
✅ All 5 response modes
✅ Priority support

Renews: Jun 28, 2026
Auto-renew: ON [toggle]

[💳 Manage Billing]  [⬆️ Upgrade to Premium]
```

**Billing history:** Last 12 charges with invoice download.

**Plan comparison (shown when browsing upgrade):**
- Side-by-side Monthly vs Premium
- Honest: what does the extra $35/month actually get?

**Pause Subscription (smart churn prevention):**
```
📅 Need a break?
Pause for free — keep your streak & saved data.
Pause until: [date picker]
[Pause for 1 Month]
```
- Catches churn before user fully leaves
- If paused: "We miss you! Reactivate?" email at 3 weeks

---

### Tab 7: Privacy & Account

**Data transparency:**
```
🔒 Your Data
Account created: Dec 1, 2025
Data stored: 340 analyses, 127 saved responses

How your data is used:
✅ To generate response suggestions
✅ To improve AI model (anonymized only)
❌ Shared with third parties: NO
❌ Sold to advertisers: NO
```

**Account security:**
- Password last changed date + change button
- 2FA toggle (SMS)
- Recent login history

**Account actions:**
```
[📥 Download My Data (GDPR)]
[⏸️ Pause Subscription]
[🗑️ Delete Account]    ← requires confirmation, permanent
[🚪 Logout (all devices)]
```

---

## Month 3 Specs — Cupid Coach Tier

### Positioning

| Tier | Price | Target user |
|---|---|---|
| Free | $0 | Curious, casual |
| Monthly | $14.99 | Regular daters |
| **Coach** | **$29.99** | **Serious daters who want to improve** |
| Premium | $49.99 | Power users who want everything |

### What Coach Tier Includes

**Weekly Async Coaching Session (via Claude):**
- User submits: screenshot of conversation + what they're trying to achieve
- Claude analyzes: conversation arc, communication patterns, tone
- Returns in < 24 hours: "You're being too eager in message 3. Back off slightly. Here's why..."
- Not just responses — teaches strategy

**Conversation Strategy Guides (content library):**
- "How to ask for a second date without seeming desperate"
- "Red flags in their messages — and how to handle them"
- "Early-stage conversation playbook (messages 1–10)"
- "How to handle the 'what are you looking for?' question"
- "Moving from texting to in-person: the timing guide"

**Advanced Personal Analytics (beyond Insights tab):**
- Monthly "Dating Intelligence Report" (PDF + in-app)
- Response effectiveness by conversation stage
- Trend: are you improving month-over-month?
- Benchmark: "Your Sincere reply rate 89% vs avg 71%"

**Emotional Intelligence (EQ) Score:**
- Monthly 0–100 score
- Components: emotional honesty, flirtation ability, communication clarity
- Benchmarked: "Your EQ is 72, avg Cupid user is 61"
- Drives engagement: users want to improve score

### Implementation Notes
- Coaching sessions = Claude API calls with a specialized coaching system prompt
- Strategy guides = static content (Markdown, in-app rendered)
- EQ Score = computed from analysis history, updated monthly
- Gate behind Coach tier check in Golang backend

---

## Dashboard — Per-Page Deeper Features

These are the next level of improvements for each existing dashboard page — beyond the Month 1 additions. Build these after the 4 Month 1 specs are live.

### Overview (currently: KPIs + alerts + health bars + top users)

**Add:**
- **Business Health Gauge** — animated half-donut composite score: (LTV > $100) + (churn < 10%) + (CAC < $12) + (payback < 4 months) + (breakeven reached). Green if 4/5+, yellow 3/5, red <3/5
- **30-Day Outlook Card** — projected paid users, MRR, API cost based on current trajectory. "On track ✅" or "Off track ⚠️"
- **Top Opportunities Ranked** — "Fix Android churn (12 users) = +$150 MRR", "Increase cache 15%→25% = -$800 API cost"
- **Recent Feature Launches** — last 5 updates with early signal ("New 'Confident' mode launched 3 days ago: 34% of users tried it")

### Revenue (currently: MRR + charts + tier table)

**Add:**
- **MRR Waterfall Diagram** — month-over-month: Starting MRR + New subscriptions + Upgrades - Downgrades - Churned = Ending MRR. Shows exactly where growth comes from
- **Tier Mix Evolution** — stacked area chart of Free/Monthly/Premium users over time. Shows if you're shifting toward higher-value tiers
- **Lifetime Revenue per Cohort** — each cohort as a row, columns = Month 1/2/3/6/12 cumulative revenue. Are newer cohorts monetizing faster?
- **Churn Revenue Impact** — "127 users churned = $1,890 MRR lost. If churn 1% lower: +$189 MRR retained. Path to $100k MRR shifts by X weeks"
- **Price Elasticity Scenario Tester** — slider: "Monthly → $16.99?" → auto-calc revenue + churn impact → net MRR change

### Users (currently: 4 segments + churn risk + revenue + controls)

**Add:**
- **User Lifetime Timeline** — cohort median days to: signup → first analysis → 3+ analyses → hit limit → paid. Are new cohorts hitting paid faster?
- **Power User Deep Dive** — top 20 users by revenue, their weekly usage pattern, favorite modes, retention in months. Warning if power user suddenly goes dark
- **Segment Progression Sankey** — flow chart: New → Regular → Power (or exit). What % of New users graduate to Power?
- **Custom Cohort Analyzer** — "Users who used Sincere >50% of the time" → do they convert more? Churn less? Higher LTV?
- **Bulk Action Audit Trail** — log of all manual actions ("Granted 10 users free trial Jan 15") + did it impact retention?

### Analytics (currently: funnel + mode popularity + retention + usage patterns)

**Add:**
- **Funnel Drill-Downs** — for each funnel stage: what % of signups use within 24h/48h/7 days? How many days before hitting free limit? Cohort filter
- **Session Duration & Frequency** — avg session length (target: 90s), sessions/day per user. Rising or falling?
- **Feature Interaction Heatmap** — which features do users touch per session? If 90% only use response suggestions and 2% use history, extra features aren't driving value
- **Response Sentiment Distribution** — avg sentiment score per mode (Witty = 0.82 vs Sincere = 0.71). Witty feels more positive → might drive engagement
- **A/B Test Results Dashboard** — upload control/variant data → auto-calc statistical significance, winner badge, net MRR impact of winner

### Forecast (currently: 3 scenarios + projection charts + month table)

**Add:**
- **Assumption Sensitivity Sliders** — drag growth rate/churn/CAC in real-time, see revenue change instantly
- **Key Decision Points on Timeline** — "At realistic growth, you hit $100k MRR Month 11", "Hire second dev by Month 7 to avoid bottleneck", "Need $50k runway before breakeven"
- **Bear/Bull Risk Scenarios** — beyond conservative/optimistic: competitor launches (CAC doubles, churn +3%) vs viral moment (CAC halves, conversion +5%)
- **Unit Economics Evolution Chart** — LTV, CAC, churn, payback months forecasted over 12 months. Are margins improving or declining in each scenario?
- **1-Page Executive Summary Download** — board-ready PDF with key metrics + forecast

### Acquisition (currently: CAC + LTV + channel table + charts)

**Add:**
- **Per-Channel Deep-Dives** (click to expand):
  - Organic: search keywords, organic trend, brand search volume
  - Paid Social: by platform (TikTok/Instagram/YouTube), CPM trend, audience fatigue warning
  - Referral: top 10 referrers, referred user LTV vs organic LTV, referral conversion rate
  - Paid Search: top keywords by ROAS, bid strategy performance
- **LTV Segmentation by Channel** — Organic: LTV $120, churn 8% | Referral: LTV $130, churn 6% (best quality) | Paid Social: LTV $95, churn 12%
- **CAC Trend Forecasting** — if CAC rising $1/month, extrapolate: "In 6 months, paid social will be unprofitable"
- **Blended CAC Shift Simulator** — "If you move 20% budget from Paid Social to Referral, blended CAC drops $1.20"

### Campaigns (currently: ad table + A/B tests + email)

**Add:**
- **Campaign ROI Ranking** — rank by ROAS, show which campaigns are worth repeating vs killing
- **Incrementality Testing Framework** — holdout group vs test group to measure true lift (not stealing organic conversions)
- **Creative Performance Heatmap** — ad creative → CTR, CPC, conversion rate. Auto-flag fatigue ("This creative's CPC rose 40% in 7 days")
- **Email Cohort Analysis** — same email sent to Jan vs Feb signups: does older cohort engage more? Or email less effective over time?
- **Attribution Model Comparison** — last-click vs first-click vs multi-touch vs time-decay. How differently do models rank campaigns?

### Alerts (currently: filterable + read/unread + actions)

**Add:**
- **Smart Priority Ranking** — auto-rank by impact × urgency. Red = urgent + high impact. Blue = informational
- **Role-Based Alert Feeds** — CEO sees: MRR, churn, payback. Marketing sees: acquisition, campaigns. Ops sees: API costs, errors
- **Alert Action Workflow** — alert → suggested action → track if action resolved it (learning feedback loop)
- **Custom Alert Rules Builder** — "Alert if CAC > $12 OR churn hits 11%". Escalation: "If triggered 3x/week, escalate to Slack"

### Settings (currently: API key + pricing + feature flags + maintenance)

**Add:**
- **Multi-Key Management** — multiple Claude API keys with usage allocation. Key #1: 60% (primary), Key #2: 40% (failover). Auto-failover log
- **Pricing A/B Test Suite** — schedule: "Run Monthly at $16.99 for 10% of new signups from Mar 1". Auto-track conversion delta. Deploy winner to 100%
- **Feature Flag Rollout Tracker** — 0% (staging) → 10% → 50% → 100%. Monitor metrics per rollout %. Rollback button
- **Webhook Event Log** — user converts/churns/upgrades → logged + testable
- **Compliance Panel** — GDPR: one-click user data export. Audit log: who changed what and when. Backup schedule + last backup timestamp

---

## Dashboard — Additional Missing Sections

### Geographic & Device Breakdown

**Why:** Hidden pockets of opportunity or churn. iOS vs Android has different behavior patterns.

**Usage by Country:**
- DAU by country (USA, UK, Canada, India…)
- Conversion rate by country — USA 18%, UK 12%, India 8%
- LTV by country — USA $120, UK $95, India $30
- Use to decide: where to allocate marketing spend

**Device & OS Performance:**
- Paid user % on iOS vs Android (industry: iOS skews 60-65%)
- Churn by device (Android churn 12%, iOS 9% is typical)
- App crash rate per version
- Should you optimize iOS first?

**Where it lives:** New card on Analytics page.

---

### NPS + Qualitative Feedback

**Why:** Numbers don't tell the whole story. 10% churn could mean "too expensive" or "found competitor" — completely different responses required.

**NPS Trend:**
- Monthly score (0–100) + response rate
- Segment: Monthly users NPS 45 vs Premium users NPS 52
- Trend: rising or falling MoM

**Churn Reason Attribution:**
```
Last month: 15 users churned
• Too expensive: 5 (33%)
• Not using enough: 4 (27%)
• Found competitor: 3 (20%)
• Technical issues: 2 (13%)
• Life change: 1 (7%)
```
If "Too expensive" > 30% → pricing problem. If "Not using enough" > 30% → activation problem.

**Where it lives:** New sub-section on Analytics page.

---

### Win/Loss Analysis

**Why:** Early mover advantage. Track what's working before competitors copy.

**Post-signup survey (1 question, optional):**
- Why did you sign up? → "Needed AI help with dating" / "Curious about AI" / "Friend recommended" / "Saw on social"

**Post-conversion survey (1 question):**
- Why did you upgrade? → "Hit free limit" / "Premium features" / "Support the developer" / "Other"

**Exit interview (churn only):**
- Brief form: Why are you leaving?
- Even 10% response rate is valuable data

**Where it lives:** New section on Analytics page.

---

### Analytics Synthesis — Auto-Anomaly Detection

**Why:** You can't watch 9 dashboard pages manually. The dashboard should surface what needs attention.

**Intelligent Insights Feed (new page or widget on Overview):**
```
🔴 CRITICAL NOW
- API costs on pace to exceed budget by 40%
- Red health segment hit 22% (threshold: 15%)
- US conversion rate fell from 18% to 15% this week

🟡 WATCH THIS WEEK
- Premium churn rising: 8% → 10% over 3 months
- Android DAU growth slowing (was +12%/yr, now +8%)
- Sincere mode adoption climbing 28% → 38%

🟢 WINS THIS WEEK
- LTV:CAC hit 9:1 (target: 3:1)
- Jan cohort retention 48% (best cohort to date)
- Referral channel CAC dropped 20%
```

Auto-detection rules:
- Flag if any metric moves > 15% week-over-week
- Flag if Red health segment exceeds 15%
- Flag if API cost pace exceeds monthly budget
- Flag if conversion rate drops > 2 percentage points
- Celebrate if LTV:CAC exceeds 5:1

**Where it lives:** New "Insights" page in sidebar OR widget at top of Overview.

---

## Strategic Ideas Backlog

Ranked by ROI × effort (build in order when core roadmap is done):

### Tier 1 — High ROI, Manageable Effort

**1. Context-Aware Response Suggestions**
Currently returns 5 suggestions. Upgrade to contextual:
- Confidence per mode per conversation (not static)
- Risk warnings: "Confident might seem pushy here"
- Alternative angle: "You could also shift to topic X"
- Differentiates Free (5 responses) vs Monthly (5 + confidence) vs Coach (5 + analysis + strategy)

**2. Referral Gamification (Viral Growth Engine)**
Dating apps have 20–40% referral rates — highest of any category. Current referral is weak.
Upgrade: Referral ladder (1 friend → +7 analyses → 3 friends → +30 + badge → 5 friends → free month → 10 friends → lifetime 5% discount + Wingperson status). Make share link one-tap from profile.

**3. Post-Date Reflection Mode**
After user flags "heading on a date with [person]", follow up 24h later:
- "How'd it go?" → Amazing / Good / OK / Not great / Didn't happen
- Claude learns which conversation styles lead to successful dates
- Unlock "Post-Date Analytics" as premium: "This response style led to 3 successful dates for you"
- Adds outcome data — most powerful signal for model improvement

**4. Pre-Send Confidence Check**
Before sending response, user can ask:
- "Is this coming on too strong?" → AI rates: "8/10 intensity"
- "Am I being funny or mean?" → "Good humor, not mean-spirited ✅"
- "Should I send now or wait?" → "Wait 2 hours"
- Free tier: basic ("is this good?"). Premium: detailed analysis + timing.

### Tier 2 — Medium ROI, Consider After Tier 1

**5. Monthly Dating Intelligence Report**
- Auto-generated PDF/in-app monthly summary
- "You're best at sincere openers in early-stage conversations"
- Tied to Coach tier

**6. Success Stories Feature**
- Users submit: "I met someone using Cupid AI!"
- Public gallery (anonymized)
- Share to social: "I met them with help from Cupid AI 💕 #CupidAI"
- User-generated social proof for marketing

**7. Couple/Relationship Mode (future product line)**
- Same core, different context: established relationships
- Scenarios: "How to ask for what I need", "How to apologize", "How to handle conflict"
- New modes: Vulnerable, Assertive, Playful, Negotiating
- Extends TAM beyond dating

**8. Expert/Professional Integration (B2B2C)**
- White-label for dating coaches and therapists
- Coach monitors client progress, suggests responses
- B2B pricing: $50–500/month per coach seat
- New distribution channel without new user acquisition

### Tier 3 — Consider After Product-Market Fit

**9. SMS/WhatsApp Integration**
- Grant permission to read WhatsApp conversation with specific person
- Suggestions based on actual thread — no copy/paste
- Premium only (privacy-sensitive)
- Requires explicit consent + security audit before building

**10. Competitive Benchmarking in Dashboard**
- "Your CAC: $10 | SaaS benchmark: $12 | Status: ✅ Better"
- "Monthly churn: 10% | Dating app benchmark: 12–15% | Status: ✅ Better"
- Sourced from public SaaS/dating reports

**11. Incremental Attribution Testing**
- Holdout groups (no ads) vs test groups (ads)
- Measure true lift: "Are paid ads adding users or stealing organic conversions?"
- Only relevant at $5k+/month ad spend

### What to Kill / Deprioritize Now
- **Leaderboards** — nice-to-have, risk of unhealthy competition, build only after gamification core is solid
- **SMS/WhatsApp integration** — privacy minefield, distraction from core
- **Couples mode** — new product, not in current TAM, premature
- **White-label professional tier** — B2B complexity, needs BD resources

---

## Running Everything

### Prerequisites
- Go 1.26+, Python 3.12, Flutter 3.10+, Node 20+, PostgreSQL 17

### 1. PostgreSQL (Admin PowerShell — first time setup)

```powershell
# Start service
net start postgresql-17

# Password: cupidai2026
```

### 2. Golang Backend

```bash
cd backend
go run ./cmd/api
# → http://localhost:8080
# Auto-runs DB migrations on startup
```

### 3. AI Microservice

```bash
cd ai_service
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux
uvicorn app.main:app --reload --port 8001
# → http://localhost:8001
# Add ANTHROPIC_API_KEY to ai_service/.env first
```

### 4. Flutter App

```bash
cd mobile

# Poppins fonts (first time only)
cd assets/fonts
curl -L "https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrFJA.ttf" -o Poppins-Regular.ttf
curl -L "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9V1s.ttf" -o Poppins-Medium.ttf
curl -L "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLEj6V1s.ttf" -o Poppins-SemiBold.ttf
curl -L "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLCz7V1s.ttf" -o Poppins-Bold.ttf
cd ../..

flutter pub get
flutter run -d chrome          # web — uses localhost:8080
flutter run                    # Android — uses 192.168.1.115:8080 (same WiFi)
```

### 5. Admin Dashboard

```bash
cd dashboard
npm run dev
# → http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Health check |
| POST | `/api/v1/auth/register` | None | Create account |
| POST | `/api/v1/auth/login` | None | Login → JWT access + refresh tokens |
| GET | `/api/v1/profile` | Bearer | User profile + stats (streak, usage, tier) |
| PATCH | `/api/v1/profile` | Bearer | Update display name |
| POST | `/api/v1/analysis` | Bearer | Analyze conversation (rate-limited) |
| GET | `/api/v1/analysis/history` | Bearer | Paginated past analyses |

**Planned admin endpoints (Month 1):**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/stats` | Dashboard KPIs |
| GET | `/api/v1/admin/cohorts` | Cohort retention data |
| GET | `/api/v1/admin/users/:id/health-score` | User health score |
| GET | `/api/v1/admin/api-costs` | Claude API cost data |
| GET | `/api/v1/admin/revenue` | Revenue breakdown |
| GET | `/api/v1/admin/analytics` | Funnel + usage data |

---

## Mobile App Conventions

- **No `const` on `Text` widgets** referencing `AppTheme` or `AppTextStyles` — `.sp` sizes are runtime-computed via screenutil
- **Spacing** — `UIHelper.vMD` / `UIHelper.hSM` etc., never raw `SizedBox`
- **Colors** — always `AppColors.x`, never raw hex strings in widget code
- **Assets** — `Assets.icons.x` / `Assets.images.x` (type-safe), never raw path strings
- **Snackbars** — `AppSnackBar.success(context, msg)` / `.error()` / `.info()`
- **Dialogs** — `AppConfirmationDialog.show(context, title:..., message:...)`
- **Bottom sheets** — `AppBottomSheet.show(context, child:...)`

---

## Adding a New Feature

### Flutter — follow this pattern

```
mobile/lib/features/<name>/
├── domain/
│   ├── entities/       # Plain Dart, extends Equatable
│   ├── repositories/   # Abstract interface only
│   └── usecases/       # One class per operation
├── data/
│   ├── models/         # Entity subclass + fromJson()
│   ├── datasources/    # Interface + Dio implementation
│   └── repositories/   # Implements domain interface
└── presentation/
    ├── bloc/           # *Event, *State (sealed), *Bloc
    ├── pages/          # Full screens
    └── widgets/        # Screen-specific widgets
```

Register in `core/di/service_locator.dart`:

```dart
void _registerMyFeature() {
  sl.registerLazySingleton<MyDataSource>(() => MyDataSourceImpl(sl<Dio>()));
  sl.registerLazySingleton<MyRepository>(() => MyRepositoryImpl(sl<MyDataSource>()));
  sl.registerLazySingleton(() => MyUseCase(sl<MyRepository>()));
  sl.registerFactory(() => MyBloc(useCase: sl<MyUseCase>()));
}
```

### Dashboard — follow this pattern

1. Add mock data types + mock data to `dashboard/lib/api.ts`
2. Create `dashboard/app/(dashboard)/<page>/page.tsx`
3. Add entry to `navGroups` in `dashboard/components/layout/sidebar.tsx`
4. Use inline styles (not Tailwind classes) — Tailwind v4 config is minimal
5. All charts: Recharts with `ResponsiveContainer`
6. Build clean: `npm run build` must pass before committing

### Golang — follow this pattern

```
backend/internal/
├── models/           # Structs + request/response types
├── repository/       # DB queries (raw SQL, no ORM)
├── services/         # Business logic
└── handlers/         # HTTP handlers (bind → validate → service → respond)
```

Add route in `backend/cmd/api/main.go`.
