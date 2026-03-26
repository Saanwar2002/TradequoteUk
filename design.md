# TradeQuote UK — Mobile App Design Plan

## Brand Identity

**Primary Color:** `#FF6B35` — Energetic orange (trust, action, UK trade industry feel)
**Secondary Color:** `#1A3C5E` — Deep navy (authority, professionalism, UK heritage)
**Accent:** `#22C55E` — Green (verified, success, eco)
**Background:** `#FFFFFF` / `#F8F9FA` light, `#0F1923` dark
**Surface:** `#FFFFFF` / `#1C2B3A` dark
**Muted:** `#6B7280`

## Screen List

### Auth & Onboarding
1. **Welcome / Splash** — Logo, tagline, "Get Started" CTA, "I'm a Tradesperson" CTA
2. **Role Selection** — Homeowner vs Tradesperson card selection
3. **Sign Up** — Email, password, name, postcode
4. **Login** — Email/password, forgot password
5. **Email Verification** — OTP entry screen
6. **Homeowner Onboarding** — Property type, postcode confirmation
7. **Tradesperson Onboarding** — Business name, trade categories, service radius, years experience

### Homeowner Screens
8. **Homeowner Home** — Active jobs, quick post job CTA, recent activity, featured tradespeople
9. **Job Posting Wizard Step 1** — Trade category selection (grid with icons)
10. **Job Posting Wizard Step 2** — Job description with AI prompts
11. **Job Posting Wizard Step 3** — Photo upload (up to 10)
12. **Job Posting Wizard Step 4** — Budget range / "Not sure"
13. **Job Posting Wizard Step 5** — Urgency level (Normal / Urgent / Emergency)
14. **Job Posting Wizard Step 6** — Preferred start date
15. **Job Posting Wizard Step 7** — Group job option + confirm
16. **Live Quotes Dashboard** — Real-time incoming quotes with sliding animation
17. **Quote Detail** — Tradesperson info, price, timeline, message, accept/reject
18. **My Jobs** — All jobs list with status filters
19. **Job Detail** — Full job info, progress updates, escrow status
20. **Favourite Tradespeople** — Saved tradespeople with rebook option
21. **Maintenance Plan** — Subscription management, scheduled services
22. **Guarantee Selection** — 3-tier guarantee at checkout

### Tradesperson Screens
23. **Tradesperson Dashboard** — Incoming jobs, active quotes, earnings summary, calendar
24. **Job Notifications** — New jobs matching criteria with accept/quote CTA
25. **Submit Quote Form** — Price, timeline, message, quote boost option
26. **My Quotes** — All submitted quotes with status
27. **Active Jobs** — Accepted jobs with progress tracking
28. **Post Progress Update** — Photo upload, milestone markers, text update
29. **Earnings Dashboard** — Weekly/monthly charts, job count, commission breakdown
30. **Credentials Wallet** — Upload and manage certifications with expiry tracking
31. **Availability Calendar** — Mark available/booked/holiday days
32. **Public Profile** — Portfolio, ratings, bio, trade categories

### Shared Screens
33. **Messages List** — All conversations sorted by recent
34. **Message Thread** — Full chat with photos, templates, job context header
35. **Search Tradespeople** — Search with filters (verified, eco, rating, distance)
36. **Tradesperson Profile View** — Public profile with reviews, portfolio
37. **Reviews Screen** — Full review history with rating breakdown
38. **Notifications Centre** — All notifications with type filters
39. **Account Settings** — Profile, notifications, subscription, privacy
40. **Referral Dashboard** — Referral code, share options, rewards tracking

## Key User Flows

### Homeowner Posts a Job
Home → "Post a Job" → Wizard (8 steps) → Job Live → Quotes Dashboard → Accept Quote → Escrow → Job Complete → Review

### Tradesperson Quotes on a Job
Notification → Job Detail → Submit Quote → Quote Accepted → Message Homeowner → Post Progress → Complete Job → Review

### Emergency Job Flow
Home → "Emergency" button → Simplified form → Red flag posted → Push to nearby tradespeople → First accept wins 30-min window

## Layout Principles

- **Tab Bar (Homeowner):** Home | My Jobs | Post Job | Messages | Profile
- **Tab Bar (Tradesperson):** Dashboard | Jobs | Quotes | Messages | Profile
- **Card-based UI** for jobs and quotes — scannable at a glance
- **Status badges** — color-coded (orange=pending, blue=active, green=complete, red=emergency)
- **Progress indicators** in job wizard — step dots at top
- **Bottom sheet modals** for quick actions (accept quote, post update)
- **Pull-to-refresh** on all list screens
- **Haptic feedback** on quote acceptance, job posting, payment release
