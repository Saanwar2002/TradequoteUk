import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  seed: publicProcedure.mutation(async () => {
    await db.seedTradeCategories();
    return { success: true };
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getAppUserByUserId(ctx.user.id);
    }),
    setup: protectedProcedure
      .input(z.object({
        appRole: z.enum(["homeowner", "tradesperson"]),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phone: z.string().optional(),
        postcode: z.string().min(2).max(10),
        propertyType: z.enum(["house", "flat", "bungalow", "commercial", "other"]).optional(),
        businessName: z.string().optional(),
        bio: z.string().optional(),
        yearsExperience: z.number().optional(),
        serviceRadiusMiles: z.number().default(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getAppUserByUserId(ctx.user.id);
        if (existing) {
          await db.updateAppUser(ctx.user.id, { firstName: input.firstName, lastName: input.lastName, phone: input.phone, postcode: input.postcode });
        } else {
          await db.createAppUser({ userId: ctx.user.id, appRole: input.appRole, firstName: input.firstName, lastName: input.lastName, phone: input.phone, postcode: input.postcode });
        }
        if (input.appRole === "homeowner" && input.propertyType) {
          const hp = await db.getHomeownerProfile(ctx.user.id);
          if (!hp) await db.createHomeownerProfile(ctx.user.id, input.propertyType);
        }
        if (input.appRole === "tradesperson") {
          const tp = await db.getTradespersonProfile(ctx.user.id);
          if (!tp) await db.createTradespersonProfile(ctx.user.id, { businessName: input.businessName, bio: input.bio, yearsExperience: input.yearsExperience, serviceRadiusMiles: input.serviceRadiusMiles });
        }
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({ firstName: z.string().optional(), lastName: z.string().optional(), phone: z.string().optional(), postcode: z.string().optional(), profilePhotoUrl: z.string().optional() }))
      .mutation(async ({ ctx, input }) => { await db.updateAppUser(ctx.user.id, input); return { success: true }; }),
    getTradesperson: protectedProcedure.query(async ({ ctx }) => db.getTradespersonProfile(ctx.user.id)),
    updateTradesperson: protectedProcedure
      .input(z.object({ businessName: z.string().optional(), bio: z.string().optional(), yearsExperience: z.number().optional(), serviceRadiusMiles: z.number().optional(), emergencyAvailable: z.boolean().optional(), ecoCertified: z.boolean().optional() }))
      .mutation(async ({ ctx, input }) => { await db.updateTradespersonProfile(ctx.user.id, input); return { success: true }; }),
  }),

  categories: router({
    list: publicProcedure.query(async () => db.getTradeCategories()),
  }),

  jobs: router({
    create: protectedProcedure
      .input(z.object({ tradeCategoryId: z.number(), title: z.string().min(5), description: z.string().min(10), postcode: z.string().min(2), urgency: z.enum(["normal", "urgent", "emergency"]).default("normal"), budgetMin: z.number().optional(), budgetMax: z.number().optional(), budgetNotSure: z.boolean().default(false), preferredStartDate: z.string().optional(), isGroupJob: z.boolean().default(false), isEmergency: z.boolean().default(false) }))
      .mutation(async ({ ctx, input }) => {
        const jobId = await db.createJob({ homeownerId: ctx.user.id, tradeCategoryId: input.tradeCategoryId, title: input.title, description: input.description, postcode: input.postcode, urgency: input.urgency, budgetMin: input.budgetMin?.toString(), budgetMax: input.budgetMax?.toString(), budgetNotSure: input.budgetNotSure, preferredStartDate: input.preferredStartDate ? new Date(input.preferredStartDate) : undefined, isGroupJob: input.isGroupJob, isEmergency: input.isEmergency, status: "open" });
        return { jobId };
      }),
    myJobs: protectedProcedure.query(async ({ ctx }) => db.getJobsByHomeowner(ctx.user.id)),
    openJobs: protectedProcedure.query(async () => db.getOpenJobs(30)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => db.getJobById(input.id)),
    updateStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["draft", "open", "quoting", "accepted", "in_progress", "completed", "cancelled", "disputed"]) })).mutation(async ({ input }) => { await db.updateJobStatus(input.id, input.status); return { success: true }; }),
    addPhoto: protectedProcedure.input(z.object({ jobId: z.number(), photoUrl: z.string(), caption: z.string().optional() })).mutation(async ({ input }) => { await db.addJobPhoto(input.jobId, input.photoUrl, input.caption); return { success: true }; }),
    photos: protectedProcedure.input(z.object({ jobId: z.number() })).query(async ({ input }) => db.getJobPhotos(input.jobId)),
  }),

  quotes: router({
    submit: protectedProcedure
      .input(z.object({ jobId: z.number(), priceGbp: z.number().positive(), timelineDays: z.number().optional(), timelineText: z.string().optional(), message: z.string().optional(), isBoosted: z.boolean().default(false) }))
      .mutation(async ({ ctx, input }) => {
        const quoteId = await db.createQuote({ jobId: input.jobId, tradespersonId: ctx.user.id, priceGbp: input.priceGbp.toString(), timelineDays: input.timelineDays, timelineText: input.timelineText, message: input.message, isBoosted: input.isBoosted, boostPriceGbp: input.isBoosted ? "3.00" : undefined, status: "pending" });
        return { quoteId };
      }),
    byJob: protectedProcedure.input(z.object({ jobId: z.number() })).query(async ({ input }) => db.getQuotesByJob(input.jobId)),
    myQuotes: protectedProcedure.query(async ({ ctx }) => db.getQuotesByTradesperson(ctx.user.id)),
    accept: protectedProcedure.input(z.object({ quoteId: z.number(), jobId: z.number() })).mutation(async ({ input }) => { await db.acceptQuote(input.quoteId, input.jobId); return { success: true }; }),
    reject: protectedProcedure.input(z.object({ quoteId: z.number() })).mutation(async ({ input }) => { await db.updateQuoteStatus(input.quoteId, "rejected"); return { success: true }; }),
  }),

  messages: router({
    conversations: protectedProcedure.query(async ({ ctx }) => db.getConversationsByUser(ctx.user.id)),
    thread: protectedProcedure.input(z.object({ conversationId: z.number() })).query(async ({ input }) => db.getMessagesByConversation(input.conversationId)),
    send: protectedProcedure
      .input(z.object({ conversationId: z.number(), body: z.string().optional(), photoUrl: z.string().optional() }))
      .mutation(async ({ ctx, input }) => { const msgId = await db.sendMessage({ conversationId: input.conversationId, senderId: ctx.user.id, body: input.body, photoUrl: input.photoUrl }); return { msgId }; }),
    startConversation: protectedProcedure
      .input(z.object({ jobId: z.number(), homeownerId: z.number(), tradespersonId: z.number() }))
      .mutation(async ({ input }) => { const convId = await db.getOrCreateConversation(input.jobId, input.homeownerId, input.tradespersonId); return { conversationId: convId }; }),
  }),

  reviews: router({
    create: protectedProcedure
      .input(z.object({ jobId: z.number(), revieweeId: z.number(), reviewerRole: z.enum(["homeowner", "tradesperson"]), overallRating: z.number().min(1).max(5), qualityRating: z.number().min(1).max(5).optional(), punctualityRating: z.number().min(1).max(5).optional(), communicationRating: z.number().min(1).max(5).optional(), valueRating: z.number().min(1).max(5).optional(), comment: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const reviewId = await db.createReview({ jobId: input.jobId, reviewerId: ctx.user.id, revieweeId: input.revieweeId, reviewerRole: input.reviewerRole, overallRating: input.overallRating.toString(), qualityRating: input.qualityRating?.toString(), punctualityRating: input.punctualityRating?.toString(), communicationRating: input.communicationRating?.toString(), valueRating: input.valueRating?.toString(), comment: input.comment });
        return { reviewId };
      }),
    byUser: protectedProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => db.getReviewsByUser(input.userId)),
  }),

  progress: router({
    add: protectedProcedure
      .input(z.object({ jobId: z.number(), title: z.string().optional(), description: z.string().optional(), photoUrl: z.string().optional(), isMilestone: z.boolean().default(false), milestoneTitle: z.string().optional() }))
      .mutation(async ({ ctx, input }) => { const id = await db.addProgressUpdate({ jobId: input.jobId, tradespersonId: ctx.user.id, title: input.title, description: input.description, photoUrl: input.photoUrl, isMilestone: input.isMilestone, milestoneTitle: input.milestoneTitle }); return { id }; }),
    byJob: protectedProcedure.input(z.object({ jobId: z.number() })).query(async ({ input }) => db.getProgressUpdatesByJob(input.jobId)),
  }),

  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getNotificationsByUser(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.markNotificationRead(input.id); return { success: true }; }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => { await db.markAllNotificationsRead(ctx.user.id); return { success: true }; }),
  }),

  credentials: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getCredentialsByTradesperson(ctx.user.id)),
    add: protectedProcedure
      .input(z.object({ credentialType: z.string(), issuer: z.string().optional(), documentUrl: z.string().optional(), registrationNumber: z.string().optional(), expiresAt: z.string().optional() }))
      .mutation(async ({ ctx, input }) => { const id = await db.addCredential({ tradespersonId: ctx.user.id, ...input, expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined }); return { id }; }),
  }),

  favourites: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getFavouritesByHomeowner(ctx.user.id)),
    add: protectedProcedure.input(z.object({ tradespersonId: z.number() })).mutation(async ({ ctx, input }) => { await db.addFavourite(ctx.user.id, input.tradespersonId); return { success: true }; }),
    remove: protectedProcedure.input(z.object({ tradespersonId: z.number() })).mutation(async ({ ctx, input }) => { await db.removeFavourite(ctx.user.id, input.tradespersonId); return { success: true }; }),
  }),
});

export type AppRouter = typeof appRouter;
