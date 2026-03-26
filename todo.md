# TradeQuote UK — TODO

## Branding & Setup
- [x] Generate app logo/icon
- [x] Update theme colors (blue primary brand)
- [x] Update app.config.ts with app name and logo
- [x] Update icon-symbol.tsx with all required icons
- [x] Update tailwind.config.js with brand colors

## Database Schema
- [x] Define users table with role, postcode, subscription fields
- [x] Define jobs table with category, status, urgency, budget
- [x] Define quotes table with price, timeline, status, boost
- [x] Define trade_categories table
- [x] Define messages/conversations tables
- [x] Define reviews table (bidirectional)
- [x] Define credentials table for tradespeople
- [x] Run db:push migrations

## Backend API (tRPC)
- [x] Auth: register, login, profile update
- [x] Jobs: create, list, get, update status
- [x] Quotes: submit, list, accept, reject
- [x] Messages: send, list conversations, get thread
- [x] Reviews: create, list by user
- [x] Notifications: list, mark read
- [x] Credentials: list, add
- [x] Favourites: list, add, remove
- [x] Progress updates: add, list

## Auth & Onboarding Screens
- [x] Welcome/splash screen
- [x] Role selection screen (homeowner vs tradesperson)
- [x] Personal details form
- [x] Tradesperson business details form
- [x] Profile setup via tRPC

## Homeowner Screens
- [x] Homeowner home dashboard with active jobs
- [x] Job posting wizard (category, details, budget, timing, confirm)
- [x] My jobs list with status filters and search
- [x] Job detail with quotes list
- [x] Accept/reject quote with confirmation

## Tradesperson Screens
- [x] Browse available jobs (open jobs feed)
- [x] Submit quote form with boost option
- [x] My quotes list
- [x] Tradesperson public profile with reviews

## Shared Screens
- [x] Messages list (conversations)
- [x] Message thread (chat UI with real-time polling)
- [x] Tradesperson public profile with credentials
- [x] Notifications centre with mark-read
- [x] Profile tab with stats, subscription, settings

## Navigation
- [x] Role-based tab bar (5 tabs: Home, Jobs, Messages, Alerts, Profile)
- [x] Auth flow routing (onboarding screen)
- [x] Modal screens for job post, quote submit, job detail

## Polish
- [x] Loading states on all async operations
- [x] Empty states for all list screens
- [x] Error handling on forms
- [x] Haptic feedback on key actions (quote submit, job post)
- [x] Unread badge on Messages tab

## Remaining / Future
- [ ] Earnings dashboard with charts (tradesperson)
- [ ] Credentials wallet screen (tradesperson)
- [ ] Favourite tradespeople screen (homeowner)
- [ ] Progress update posting screen
- [ ] Maintenance plan screen
- [ ] Referral dashboard
- [ ] Push notifications integration
- [ ] Escrow payment flow
- [ ] Search tradespeople with map

## Bug Fixes
- [x] Fix OAuth callback error "Missing code or state parameter" on app open
- [x] Handle unauthenticated users gracefully in onboarding flow
- [x] Prevent redirect to oauth/callback when no auth code present

## Current Issues
- [x] Emergency call-out button does not work

## New Features to Add
- [x] Boost promotion for emergency jobs (£3 boost to top of list for 24h)
- [x] Tradesperson response time tracking (display on profiles)
- [x] Job expiry countdown timer (on active jobs)


## Upcoming Features
- [x] Tradesperson availability calendar (set available dates/times)
- [x] Display availability on profiles and job posting flow
- [x] Availability slot management screen for tradespeople


## Current Bugs
- [x] Profile tab navigation — tabs under profile are not clickable

## Profile Settings Screens to Build
- [x] Edit Profile screen
- [x] Privacy & Security screen
- [x] Notification Preferences screen
- [x] Payment Methods screen
- [x] Help Centre screen
- [ ] Terms & Conditions screen
- [ ] Privacy Policy screen
