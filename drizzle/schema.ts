import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Core Users ────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ─── App Users (extended profile) ──────────────────────────────────────────────

export const appUsers = mysqlTable("app_users", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  appRole: mysqlEnum("appRole", ["homeowner", "tradesperson"]).notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  postcode: varchar("postcode", { length: 10 }).notNull(),
  profilePhotoUrl: text("profilePhotoUrl"),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  identityVerified: boolean("identityVerified").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro", "business"]).default("free").notNull(),
  loyaltyTier: mysqlEnum("loyaltyTier", ["bronze", "silver", "gold"]).default("bronze").notNull(),
  totalJobsCompleted: int("totalJobsCompleted").default(0).notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  referralCode: varchar("referralCode", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Homeowner Profiles ─────────────────────────────────────────────────────────

export const homeownerProfiles = mysqlTable("homeowner_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyType: mysqlEnum("propertyType", ["house", "flat", "bungalow", "commercial", "other"]).default("house").notNull(),
  maintenancePlanActive: boolean("maintenancePlanActive").default(false).notNull(),
  loyaltyCreditsGbp: decimal("loyaltyCreditsGbp", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Tradesperson Profiles ──────────────────────────────────────────────────────

export const tradespersonProfiles = mysqlTable("tradesperson_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  businessName: varchar("businessName", { length: 255 }),
  bio: text("bio"),
  yearsExperience: int("yearsExperience"),
  serviceRadiusMiles: int("serviceRadiusMiles").default(10).notNull(),
  emergencyAvailable: boolean("emergencyAvailable").default(false).notNull(),
  ecoCertified: boolean("ecoCertified").default(false).notNull(),
  videoIntroUrl: text("videoIntroUrl"),
  responseRatePercent: decimal("responseRatePercent", { precision: 5, scale: 2 }).default("0").notNull(),
  averageResponseTimeMinutes: int("averageResponseTimeMinutes").default(0).notNull(),
  reputationScore: decimal("reputationScore", { precision: 5, scale: 2 }),
  strikes: int("strikes").default(0).notNull(),
  isSuspended: boolean("isSuspended").default(false).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Trade Categories ───────────────────────────────────────────────────────────

export const tradeCategories = mysqlTable("trade_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }),
  isGreenCategory: boolean("isGreenCategory").default(false).notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("medium").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

// ─── Jobs ───────────────────────────────────────────────────────────────────────

export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  homeownerId: int("homeownerId").notNull(),
  tradeCategoryId: int("tradeCategoryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  postcode: varchar("postcode", { length: 10 }).notNull(),
  status: mysqlEnum("status", [
    "draft", "open", "quoting", "accepted", "in_progress", "completed", "cancelled", "disputed"
  ]).default("open").notNull(),
  urgency: mysqlEnum("urgency", ["normal", "urgent", "emergency"]).default("normal").notNull(),
  budgetMin: decimal("budgetMin", { precision: 10, scale: 2 }),
  budgetMax: decimal("budgetMax", { precision: 10, scale: 2 }),
  budgetNotSure: boolean("budgetNotSure").default(false).notNull(),
  preferredStartDate: timestamp("preferredStartDate"),
  isGroupJob: boolean("isGroupJob").default(false).notNull(),
  isEmergency: boolean("isEmergency").default(false).notNull(),
  quoteCount: int("quoteCount").default(0).notNull(),
  acceptedQuoteId: int("acceptedQuoteId"),
  completedAt: timestamp("completedAt"),
  expiresAt: timestamp("expiresAt"),
  isBoosted: boolean("isBoosted").default(false).notNull(),
  aiEstimatedMin: decimal("aiEstimatedMin", { precision: 10, scale: 2 }),
  aiEstimatedMax: decimal("aiEstimatedMax", { precision: 10, scale: 2 }),
  aiEstimationReasoning: text("aiEstimationReasoning"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Job Photos ─────────────────────────────────────────────────────────────────

export const jobPhotos = mysqlTable("job_photos", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  photoUrl: text("photoUrl").notNull(),
  caption: varchar("caption", { length: 255 }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export const jobVideos = mysqlTable("job_videos", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  videoUrl: text("videoUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  caption: varchar("caption", { length: 255 }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

// ─── Quotes ─────────────────────────────────────────────────────────────────────

export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  tradespersonId: int("tradespersonId").notNull(),
  priceGbp: decimal("priceGbp", { precision: 10, scale: 2 }).notNull(),
  timelineDays: int("timelineDays"),
  timelineText: varchar("timelineText", { length: 100 }),
  message: text("message"),
  videoUrl: text("videoUrl"),
  isBoosted: boolean("isBoosted").default(false).notNull(),
  boostPriceGbp: decimal("boostPriceGbp", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "withdrawn", "expired"]).default("pending").notNull(),
  isBestMatch: boolean("isBestMatch").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Conversations & Messages ───────────────────────────────────────────────────

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  homeownerId: int("homeownerId").notNull(),
  tradespersonId: int("tradespersonId").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  homeownerUnread: int("homeownerUnread").default(0).notNull(),
  tradespersonUnread: int("tradespersonUnread").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  body: text("body"),
  photoUrl: text("photoUrl"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Reviews ────────────────────────────────────────────────────────────────────

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  revieweeId: int("revieweeId").notNull(),
  reviewerRole: mysqlEnum("reviewerRole", ["homeowner", "tradesperson"]).notNull(),
  overallRating: decimal("overallRating", { precision: 3, scale: 2 }).notNull(),
  qualityRating: decimal("qualityRating", { precision: 3, scale: 2 }),
  punctualityRating: decimal("punctualityRating", { precision: 3, scale: 2 }),
  communicationRating: decimal("communicationRating", { precision: 3, scale: 2 }),
  valueRating: decimal("valueRating", { precision: 3, scale: 2 }),
  comment: text("comment"),
  tradespersonResponse: text("tradespersonResponse"),
  isVisible: boolean("isVisible").default(false).notNull(),
  visibleAt: timestamp("visibleAt"),
  isFlagged: boolean("isFlagged").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Progress Updates ───────────────────────────────────────────────────────────

export const progressUpdates = mysqlTable("progress_updates", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  tradespersonId: int("tradespersonId").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  photoUrl: text("photoUrl"),
  isMilestone: boolean("isMilestone").default(false).notNull(),
  milestoneTitle: varchar("milestoneTitle", { length: 100 }),
  milestoneStatus: mysqlEnum("milestoneStatus", ["pending", "completed", "verified"]).default("pending"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Notifications ──────────────────────────────────────────────────────────────

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "new_job", "new_quote", "quote_accepted", "quote_rejected",
    "new_message", "job_completed", "review_received", "payment_released",
    "credential_expiring", "emergency_job", "system"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  linkJobId: int("linkJobId"),
  linkQuoteId: int("linkQuoteId"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Credentials ────────────────────────────────────────────────────────────────

export const credentials = mysqlTable("credentials", {
  id: int("id").autoincrement().primaryKey(),
  tradespersonId: int("tradespersonId").notNull(),
  credentialType: varchar("credentialType", { length: 100 }).notNull(),
  issuer: varchar("issuer", { length: 255 }),
  documentUrl: text("documentUrl"),
  registrationNumber: varchar("registrationNumber", { length: 100 }),
  issuedAt: timestamp("issuedAt"),
  expiresAt: timestamp("expiresAt"),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected", "expired"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Job Alerts ────────────────────────────────────────────────────────────────

export const jobAlerts = mysqlTable("job_alerts", {
  id: int("id").autoincrement().primaryKey(),
  tradespersonId: int("tradespersonId").notNull(),
  tradeCategory: varchar("tradeCategory", { length: 100 }).notNull(),
  postcode: varchar("postcode", { length: 10 }).notNull(),
  radiusMiles: int("radiusMiles").default(10).notNull(),
  minBudget: int("minBudget"),
  maxBudget: int("maxBudget"),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Availability Slots ────────────────────────────────────────────

export const availabilitySlots = mysqlTable("availability_slots", {
  id: int("id").autoincrement().primaryKey(),
  tradespersonId: int("tradespersonId").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(),
  endTime: varchar("endTime", { length: 5 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Favourites ───────────────────────────────────────────────────

export const favourites = mysqlTable("favourites", {
  id: int("id").autoincrement().primaryKey(),
  homeownerId: int("homeownerId").notNull(),
  tradespersonId: int("tradespersonId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
