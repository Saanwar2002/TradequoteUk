# 🛠️ TradeQuote UK: Features & Functions Guide

Welcome to your project's technical guide! This document breaks down the core features of **TradeQuote UK** into easy-to-follow sections for your reference.

---

### **1. 🧠 AI Cost Estimator**
The app uses **OpenAI GPT-4** to provide realistic UK market-based price estimates for home improvement jobs.
- **How it works**: When a homeowner describes a job, the AI analyzes the title, description, and category.
- **Key Output**: It provides a suggested price range in GBP (£) and a detailed reasoning breakdown (materials vs. labor).
- **File Reference**: `server/ai-service.ts`

### **2. ☁️ TiDB Cloud Integration**
Your app is connected to a professional-grade **TiDB Cloud** (MySQL-compatible) database.
- **Persistence**: All user profiles, job postings, quotes, and messages are stored permanently in your cloud cluster.
- **Scalability**: The database is configured for high availability and low latency across the UK.
- **File Reference**: `server/db.ts` & `drizzle.config.ts`

### **3. 📋 AI-Generated Job Checklists**
Every time a job is posted, the AI automatically creates a trade-specific project plan.
- **Bitesize Steps**: The AI generates a 5-step checklist tailored to the job (e.g., "Check for gas leaks" for plumbing).
- **Trust Building**: Both homeowners and tradespeople see the same milestones, keeping everyone aligned.
- **File Reference**: `server/routers.ts` (Job Creation logic)

### **4. 🎯 Smart Job Matching**
We've implemented a real SQL-based matching engine to connect homeowners with the right pros.
- **Filters**: Matches tradespeople by their trade category and postcode.
- **Scoring**: Ranks tradespeople based on their verification status and ratings.
- **File Reference**: `server/matching-service.ts`

### **5. 📸 Job Media (Photos & Videos)**
Homeowners can provide visual context for their projects to get more accurate quotes.
- **Multi-Media**: Supports uploading multiple high-resolution photos and short videos.
- **Gallery**: Tradespeople can view a horizontal media gallery on the job details page.
- **File Reference**: `app/job/post.tsx` & `app/job/[id].tsx`

### **6. 🏗️ Handyman Category**
Added **"Handyman Work"** as a core trade type to broaden the app's market reach.
- **UI Integration**: Fully integrated into the "Choose Trade" screen with a custom icon.
- **Database Support**: Recognized by the matching engine and AI estimator.

### **7. 🚀 Deployment & Security**
The app is prepared for permanent hosting on **Vercel**.
- **Security**: All sensitive keys (TiDB, OpenAI, JWT) are kept in the `.env` file and are **never** pushed to GitHub.
- **Build System**: Configured with a production-ready build engine for the web frontend.
- **File Reference**: `vercel.json` & `.env.example`

---

### **🔧 Developer Quick-Start**
1.  **Local Dev**: Run `pnpm dev` to start the frontend and backend.
2.  **Database Sync**: Run `pnpm db:push` to sync schema changes to TiDB Cloud.
3.  **Production Build**: Run `pnpm build` to prepare for deployment.

*Last Updated: March 26, 2026*
