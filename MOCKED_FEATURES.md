# TradequoteUk: Mocked Features & Integration Roadmap

This document provides a comprehensive overview of the features currently implemented using mock data and services in the **TradequoteUk** application. It serves as a guide for developers to understand the current state and the steps required to connect these features to a live database and external APIs.

---

## 1. AI-Powered Quote Estimation

### **Current Implementation**
- **Service:** `server/ai-service.ts`
- **API Endpoint:** `trpc.jobs.estimate`
- **Mock Logic:** Simulates an AI analysis by calculating a price range based on the job category and description length. It includes a simulated network delay of 1.5 seconds to mimic real AI processing.
- **Frontend Integration:** Integrated into the "Post a Job" flow (`app/job/post.tsx`). Homeowners see an "AI Price Estimate" card during the budget step.

### **Data Structure**
```typescript
interface AIEstimate {
  minPrice: number;
  maxPrice: number;
  reasoning: string;
  confidence: number;
}
```

### **Roadmap to Real Integration**
1.  **LLM Integration:** Replace the mock logic in `server/ai-service.ts` with a call to an LLM API (e.g., OpenAI GPT-4).
2.  **Prompt Engineering:** Develop a robust prompt that includes historical job data and current UK market rates for more accurate estimations.
3.  **Database Logging:** Store the AI-generated estimates in a new `ai_estimates` table to track accuracy over time.

---

## 2. Real-Time Project Timeline & Milestones

### **Current Implementation**
- **Component:** `components/project-timeline.tsx`
- **API Endpoint:** `trpc.progress.byJob`
- **Mock Logic:** The backend procedure `progress.updateMilestone` currently returns a success response without updating the database. The frontend displays a vertical timeline of progress updates and milestones.
- **Frontend Integration:** Integrated into the Job Details screen (`app/job/[id].tsx`) for jobs with an "In Progress" status.

### **Data Structure**
```typescript
interface ProgressUpdate {
  id: number;
  jobId: number;
  title?: string;
  description?: string;
  photoUrl?: string;
  isMilestone: boolean;
  milestoneTitle?: string;
  status: "pending" | "completed" | "verified";
  createdAt: Date;
}
```

### **Roadmap to Real Integration**
1.  **Database Connection:** Connect the `progress.add` and `progress.byJob` procedures to the `progress_updates` table in the TiDB database.
2.  **Milestone Verification Logic:** Implement the logic in `progress.updateMilestone` to update the status in the database and trigger notifications for the homeowner.
3.  **Photo Storage:** Integrate an S3-compatible storage service for uploading and retrieving progress photos.

---

## 3. Smart Job Matching & Alerts

### **Current Implementation**
- **Service:** `server/matching-service.ts`
- **API Endpoint:** `trpc.jobs.smartMatch`
- **Mock Logic:** Returns a hardcoded list of tradespeople with pre-defined ratings, distances, and match scores. It simulates a 1.2-second delay for the "matching algorithm."
- **Frontend Integration:** Integrated into the Homeowner Jobs screen (`app/(tabs)/jobs.tsx`) using the `SmartMatchingCard` component.

### **Data Structure**
```typescript
interface TradespersonMatch {
  id: number;
  name: string;
  businessName: string;
  rating: number;
  distance: number;
  matchScore: number;
  specialties: string[];
  verified: boolean;
}
```

### **Roadmap to Real Integration**
1.  **Matching Algorithm:** Replace the mock service with a real SQL query or search engine (e.g., Elasticsearch) that filters `tradesperson_profiles` by category, location (using geospatial queries), and availability.
2.  **Scoring System:** Implement a scoring algorithm that weights ratings, proximity, and historical job completion rates.
3.  **Real-Time Alerts:** Connect the `job_alerts` table to a background worker that sends push notifications to tradespeople when a matching job is posted.

---

## 4. Mock Authentication (Sandbox Mode)

### **Current Implementation**
- **Backend Route:** `GET /api/auth/mock`
- **Frontend Integration:** The "Sign In" button in `app/onboarding.tsx` redirects to the mock route when running in the sandbox environment.
- **Mock Logic:** Bypasses the OAuth server and creates a session for a "Sandbox User" (`mock-user-id`).

### **Roadmap to Real Integration**
1.  **OAuth Configuration:** Set the `EXPO_PUBLIC_OAUTH_SERVER_URL` and `EXPO_PUBLIC_APP_ID` environment variables.
2.  **Revert Mock Logic:** Remove the conditional redirect in `app/onboarding.tsx` to re-enable the standard `startOAuthLogin()` flow.

---

## 5. Database Integration (TiDB Cloud)

### **Current Status**
The application is configured to use **Drizzle ORM** with a **TiDB Cloud** (MySQL-compatible) database. The schema is defined in `drizzle/schema.ts`.

### **Steps to Connect Real Database**
1.  **Environment Variables:** Update the `.env` file with the correct `DATABASE_URL` (including the password).
2.  **SSL Configuration:** Ensure the `ssl` parameter is correctly set in the connection string (e.g., `?ssl={"rejectUnauthorized":true}`).
3.  **Run Migrations:** Execute `pnpm db:push` to synchronize the schema with the live database.
4.  **Seed Data:** Run the `seed` mutation via the API or a script to populate the `trade_categories` table.

---

**Documented by Manus AI**
*Date: March 26, 2026*
