import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
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
      const url = new URL(process.env.DATABASE_URL);
      const dbName = url.pathname.substring(1) || "tradequote";
      
      // First connect without database to ensure it exists
      const connection = await mysql.createConnection({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        ssl: {
          rejectUnauthorized: true,
        },
      });
      
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await connection.end();

      // Now connect to the actual database
      const pool = mysql.createPool({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: dbName,
        ssl: {
          rejectUnauthorized: true,
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      
      _db = drizzle(pool);
      console.log("[Database] Connected to", url.hostname, "database:", dbName);
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
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAppUserByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appUsers).where(eq(appUsers.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function createAppUser(user: InsertAppUser) {
  const db = await getDb();
  if (!db) return;
  await db.insert(appUsers).values(user);
}

export async function updateAppUser(userId: number, data: Partial<InsertAppUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(appUsers).set(data).where(eq(appUsers.userId, userId));
}

// ─── Profile Helpers ──────────────────────────────────────────────────────────

export async function getHomeownerProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(homeownerProfiles).where(eq(homeownerProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function createHomeownerProfile(userId: number, propertyType: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(homeownerProfiles).values({ userId, propertyType });
}

export async function getTradespersonProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tradespersonProfiles).where(eq(tradespersonProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function createTradespersonProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(tradespersonProfiles).values({ userId, ...data });
}

export async function updateTradespersonProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(tradespersonProfiles).set(data).where(eq(tradespersonProfiles.userId, userId));
}

// ─── Job Helpers ──────────────────────────────────────────────────────────

export async function getTradeCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tradeCategories).where(eq(tradeCategories.isActive, true)).orderBy(tradeCategories.sortOrder);
}

export async function seedTradeCategories() {
  const db = await getDb();
  if (!db) return;
  const categories = [
    { name: "Plumbing", slug: "plumbing", icon: "water" },
    { name: "Electrical", slug: "electrical", icon: "flash" },
    { name: "Building", slug: "building", icon: "construct" },
    { name: "Painting", slug: "painting", icon: "brush" },
    { name: "Carpentry", slug: "carpentry", icon: "hammer" },
    { name: "Roofing", slug: "roofing", icon: "home" },
    { name: "Gardening", slug: "gardening", icon: "leaf" },
    { name: "Cleaning", slug: "cleaning", icon: "sparkles" },
  ];
  for (const cat of categories) {
    await db.insert(tradeCategories).values(cat).onDuplicateKeyUpdate({ set: cat });
  }
}

export async function createJob(job: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(jobs).values(job);
  return result.insertId;
}

export async function getJobsByHomeowner(homeownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(eq(jobs.homeownerId, homeownerId)).orderBy(desc(jobs.createdAt));
}

export async function getOpenJobs(limit = 50) {
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

export async function updateJobStatus(id: number, status: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(jobs).set({ status }).where(eq(jobs.id, id));
}

export async function addJobPhoto(jobId: number, photoUrl: string, caption?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(jobPhotos).values({ jobId, photoUrl, caption });
}

export async function getJobPhotos(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobPhotos).where(eq(jobPhotos.jobId, jobId));
}

// ─── Quote Helpers ──────────────────────────────────────────────────────────

export async function createQuote(quote: InsertQuote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(quotes).values(quote);
  return result.insertId;
}

export async function getQuotesByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotes).where(eq(quotes.jobId, jobId)).orderBy(desc(quotes.createdAt));
}

export async function getQuotesByTradesperson(tradespersonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quotes).where(eq(quotes.tradespersonId, tradespersonId)).orderBy(desc(quotes.createdAt));
}

export async function acceptQuote(quoteId: number, jobId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(quotes).set({ status: "accepted" }).where(eq(quotes.id, quoteId));
  await db.update(jobs).set({ status: "accepted", acceptedQuoteId: quoteId }).where(eq(jobs.id, jobId));
}

export async function updateQuoteStatus(id: number, status: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(quotes).set({ status }).where(eq(quotes.id, id));
}

// ─── Message Helpers ──────────────────────────────────────────────────────────

export async function getConversationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations).where(or(eq(conversations.homeownerId, userId), eq(conversations.tradespersonId, userId))).orderBy(desc(conversations.lastMessageAt));
}

export async function getMessagesByConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
}

export async function sendMessage(msg: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(messages).values(msg);
  await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, msg.conversationId));
  return result.insertId;
}

export async function getOrCreateConversation(jobId: number, homeownerId: number, tradespersonId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(conversations).where(and(eq(conversations.jobId, jobId), eq(conversations.homeownerId, homeownerId), eq(conversations.tradespersonId, tradespersonId))).limit(1);
  if (existing.length > 0) return existing[0].id;
  const [result] = await db.insert(conversations).values({ jobId, homeownerId, tradespersonId });
  return result.insertId;
}

// ─── Review Helpers ──────────────────────────────────────────────────────────

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(reviews).values(review);
  return result.insertId;
}

export async function getReviewsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.revieweeId, userId)).orderBy(desc(reviews.createdAt));
}

// ─── Progress Helpers ──────────────────────────────────────────────────────────

export async function addProgressUpdate(update: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(progressUpdates).values(update);
  return result.insertId;
}

export async function getProgressUpdatesByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(progressUpdates).where(eq(progressUpdates.jobId, jobId)).orderBy(desc(progressUpdates.createdAt));
}

export async function createJobMilestones(jobId: number, milestones: { title: string, description: string }[]) {
  const db = await getDb();
  if (!db) return;
  for (const m of milestones) {
    await db.insert(progressUpdates).values({
      jobId,
      isMilestone: true,
      milestoneTitle: m.title,
      description: m.description,
      milestoneStatus: "pending",
      tradespersonId: 0, // System-generated milestones don't have a tradesperson yet
    });
  }
}

// ─── Notification Helpers ──────────────────────────────────────────────────────────

export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
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

// ─── Credential Helpers ──────────────────────────────────────────────────────────

export async function getCredentialsByTradesperson(tradespersonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(credentials).where(eq(credentials.tradespersonId, tradespersonId));
}

export async function addCredential(cred: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(credentials).values(cred);
  return result.insertId;
}

// ─── Favourite Helpers ──────────────────────────────────────────────────────────

export async function getFavouritesByHomeowner(homeownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(favourites).where(eq(favourites.homeownerId, homeownerId));
}

export async function addFavourite(homeownerId: number, tradespersonId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(favourites).values({ homeownerId, tradespersonId });
}

export async function removeFavourite(homeownerId: number, tradespersonId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(favourites).where(and(eq(favourites.homeownerId, homeownerId), eq(favourites.tradespersonId, tradespersonId)));
}

// ─── Availability Helpers ──────────────────────────────────────────────────────────

export async function getAvailabilitySlots(tradespersonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(availabilitySlots).where(eq(availabilitySlots.tradespersonId, tradespersonId));
}

export async function addAvailabilitySlot(slot: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(availabilitySlots).values(slot);
  return result.insertId;
}

export async function removeAvailabilitySlot(slotId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(availabilitySlots).where(eq(availabilitySlots.id, slotId));
}

// ─── Job Alert Helpers ──────────────────────────────────────────────────────────

export async function getJobAlertsByTradesperson(tradespersonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobAlerts).where(eq(jobAlerts.tradespersonId, tradespersonId));
}

export async function createJobAlert(alert: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(jobAlerts).values(alert);
  return result.insertId;
}

export async function updateJobAlert(alertId: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(jobAlerts).set(data).where(eq(jobAlerts.id, alertId));
}

export async function deleteJobAlert(alertId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobAlerts).where(eq(jobAlerts.id, alertId));
}
