import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "./_core/env";
import {
  appUsers,
  availabilitySlots,
  conversations,
  credentials,
  favourites,
  homeownerProfiles,
  jobAlerts,
  jobPhotos,
  jobs,
  messages,
  notifications,
  progressUpdates,
  quotes,
  reviews,
  tradeCategories,
  tradespersonProfiles,
  users,
  type AppUser,
  type InsertAppUser,
  type InsertJob,
  type InsertMessage,
  type InsertQuote,
  type InsertReview,
  type InsertUser,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, {
        connection: {
          ssl: {
            rejectUnauthorized: true,
          },
        },
      });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Core User Helpers ──────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    });
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── App User Helpers ───────────────────────────────────────────────────────────

export async function getAppUserByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appUsers).where(eq(appUsers.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function createAppUser(data: InsertAppUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appUsers).values(data);
  return result[0].insertId;
}

export async function updateAppUser(userId: number, data: Partial<AppUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(appUsers).set(data).where(eq(appUsers.userId, userId));
}

export async function getHomeownerProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(homeownerProfiles).where(eq(homeownerProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function createHomeownerProfile(userId: number, propertyType: "house" | "flat" | "bungalow" | "commercial" | "other") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(homeownerProfiles).values({ userId, propertyType });
}

export async function getTradespersonProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tradespersonProfiles).where(eq(tradespersonProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function createTradespersonProfile(
  userId: number,
  data: { businessName?: string; bio?: string; yearsExperience?: number; serviceRadiusMiles: number }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tradespersonProfiles).values({ userId, ...data });
}

export async function updateTradespersonProfile(userId: number, data: Partial<typeof tradespersonProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tradespersonProfiles).set(data).where(eq(tradespersonProfiles.userId, userId));
}

// ─── Trade Categories ───────────────────────────────────────────────────────────

export async function getTradeCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tradeCategories).where(eq(tradeCategories.isActive, true)).orderBy(tradeCategories.sortOrder);
}

export async function seedTradeCategories() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(tradeCategories).limit(1);
  if (existing.length > 0) return;
  const categories = [
    { name: "Plumbing", slug: "plumbing", icon: "drop.fill", riskLevel: "medium" as const, sortOrder: 1 },
    { name: "Electrical", slug: "electrical", icon: "bolt.fill", riskLevel: "high" as const, sortOrder: 2 },
    { name: "Gas & Heating", slug: "gas-heating", icon: "flame.fill", riskLevel: "high" as const, sortOrder: 3 },
    { name: "Building & Construction", slug: "building", icon: "hammer.fill", riskLevel: "high" as const, sortOrder: 4 },
    { name: "Painting & Decorating", slug: "painting", icon: "paintbrush.fill", riskLevel: "low" as const, sortOrder: 5 },
    { name: "Carpentry & Joinery", slug: "carpentry", icon: "wrench.fill", riskLevel: "medium" as const, sortOrder: 6 },
    { name: "Roofing", slug: "roofing", icon: "house.fill", riskLevel: "high" as const, sortOrder: 7 },
    { name: "Tiling", slug: "tiling", icon: "grid.2x2.fill", riskLevel: "low" as const, sortOrder: 8 },
    { name: "Landscaping & Gardening", slug: "landscaping", icon: "leaf.fill", riskLevel: "low" as const, isGreenCategory: true, sortOrder: 9 },
    { name: "Cleaning", slug: "cleaning", icon: "sparkles", riskLevel: "low" as const, sortOrder: 10 },
    { name: "Locksmith", slug: "locksmith", icon: "key.fill", riskLevel: "medium" as const, sortOrder: 11 },
    { name: "Plastering", slug: "plastering", icon: "paintbrush.fill", riskLevel: "low" as const, sortOrder: 12 },
    { name: "Solar & Renewables", slug: "solar", icon: "sun.max.fill", riskLevel: "medium" as const, isGreenCategory: true, sortOrder: 13 },
    { name: "Extensions & Conversions", slug: "extensions", icon: "building.2.fill", riskLevel: "high" as const, sortOrder: 14 },
    { name: "Bathroom Fitting", slug: "bathroom", icon: "bathtub.fill", riskLevel: "medium" as const, sortOrder: 15 },
    { name: "Kitchen Fitting", slug: "kitchen", icon: "kitchen.fill", riskLevel: "medium" as const, sortOrder: 16 },
    { name: "Windows & Doors", slug: "windows-doors", icon: "window.ceiling.closed", riskLevel: "medium" as const, sortOrder: 17 },
    { name: "Other", slug: "other", icon: "wrench.and.screwdriver.fill", riskLevel: "medium" as const, sortOrder: 99 },
  ];
  await db.insert(tradeCategories).values(categories);
}

// ─── Jobs ───────────────────────────────────────────────────────────────────────

export async function createJob(data: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(jobs).values(data);
  return result[0].insertId;
}

export async function getJobsByHomeowner(homeownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(eq(jobs.homeownerId, homeownerId)).orderBy(desc(jobs.createdAt));
}

export async function getOpenJobs(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(eq(jobs.status, "open")).orderBy(desc(jobs.createdAt)).limit(limit);
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateJobStatus(id: number, status: typeof jobs.$inferInsert["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(jobs).set({ status }).where(eq(jobs.id, id));
}

export async function addJobPhoto(jobId: number, photoUrl: string, caption?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(jobPhotos).values({ jobId, photoUrl, caption });
}

export async function getJobPhotos(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobPhotos).where(eq(jobPhotos.jobId, jobId));
}

// ─── Quotes ─────────────────────────────────────────────────────────────────────

export async function createQuote(data: InsertQuote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(quotes).values(data);
  return result[0].insertId;
}

export async function getQuotesByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotes).where(eq(quotes.jobId, jobId)).orderBy(desc(quotes.isBoosted), desc(quotes.createdAt));
}

export async function getQuotesByTradesperson(tradespersonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotes).where(eq(quotes.tradespersonId, tradespersonId)).orderBy(desc(quotes.createdAt));
}

export async function updateQuoteStatus(id: number, status: typeof quotes.$inferInsert["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotes).set({ status }).where(eq(quotes.id, id));
}

export async function acceptQuote(quoteId: number, jobId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(quotes).set({ status: "accepted" }).where(eq(quotes.id, quoteId));
  await db.update(quotes).set({ status: "rejected" }).where(and(eq(quotes.jobId, jobId), eq(quotes.status, "pending")));
  await db.update(jobs).set({ status: "accepted", acceptedQuoteId: quoteId }).where(eq(jobs.id, jobId));
}

// ─── Conversations & Messages ───────────────────────────────────────────────────

export async function getOrCreateConversation(jobId: number, homeownerId: number, tradespersonId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(conversations)
    .where(and(eq(conversations.jobId, jobId), eq(conversations.tradespersonId, tradespersonId))).limit(1);
  if (existing[0]) return existing[0].id;
  const result = await db.insert(conversations).values({ jobId, homeownerId, tradespersonId });
  return result[0].insertId;
}

export async function getConversationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations)
    .where(or(eq(conversations.homeownerId, userId), eq(conversations.tradespersonId, userId)))
    .orderBy(desc(conversations.lastMessageAt));
}

export async function getMessagesByConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
}

export async function sendMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values(data);
  await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, data.conversationId));
  return result[0].insertId;
}

// ─── Reviews ────────────────────────────────────────────────────────────────────

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const visibleAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const result = await db.insert(reviews).values({ ...data, visibleAt });
  return result[0].insertId;
}

export async function getReviewsByUser(revieweeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews)
    .where(and(eq(reviews.revieweeId, revieweeId), eq(reviews.isVisible, true)))
    .orderBy(desc(reviews.createdAt));
}

// ─── Progress Updates ───────────────────────────────────────────────────────────

export async function addProgressUpdate(data: typeof progressUpdates.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(progressUpdates).values(data);
  return result[0].insertId;
}

export async function getProgressUpdatesByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(progressUpdates).where(eq(progressUpdates.jobId, jobId)).orderBy(progressUpdates.createdAt);
}

// ─── Notifications ──────────────────────────────────────────────────────────────

export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

// ─── Credentials ────────────────────────────────────────────────────────────────

export async function getCredentialsByTradesperson(tradespersonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(credentials).where(eq(credentials.tradespersonId, tradespersonId));
}

export async function addCredential(data: typeof credentials.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(credentials).values(data);
  return result[0].insertId;
}

// ─── Favourites ─────────────────────────────────────────────────────────────────

export async function getFavouritesByHomeowner(homeownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(favourites).where(eq(favourites.homeownerId, homeownerId));
}

export async function addFavourite(homeownerId: number, tradespersonId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(favourites).values({ homeownerId, tradespersonId });
}

export async function removeFavourite(homeownerId: number, tradespersonId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(favourites).where(and(eq(favourites.homeownerId, homeownerId), eq(favourites.tradespersonId, tradespersonId)));
}

// ─── Availability Slots ─────────────────────────────────────────────────────────────────
export async function getAvailabilitySlots(tradespersonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(availabilitySlots).where(eq(availabilitySlots.tradespersonId, tradespersonId));
}
export async function addAvailabilitySlot(data: { tradespersonId: number; date: string; startTime: string; endTime: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(availabilitySlots).values(data);
  return result[0].insertId;
}
export async function removeAvailabilitySlot(slotId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(availabilitySlots).where(eq(availabilitySlots.id, slotId));
}


// ─── Job Alerts ─────────────────────────────────────────────────────────────────
export async function getJobAlertsByTradesperson(tradespersonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobAlerts).where(eq(jobAlerts.tradespersonId, tradespersonId));
}
export async function createJobAlert(data: { tradespersonId: number; tradeCategory: string; postcode: string; radiusMiles: number; minBudget?: number; maxBudget?: number; enabled: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(jobAlerts).values(data);
  return result[0].insertId;
}
export async function updateJobAlert(alertId: number, updates: { enabled?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(jobAlerts).set(updates).where(eq(jobAlerts.id, alertId));
}
export async function deleteJobAlert(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(jobAlerts).where(eq(jobAlerts.id, alertId));
}
