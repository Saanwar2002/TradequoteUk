import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db from "./db";
import * as ai from "./ai-service";
import * as matching from "./matching-service";

export const appRouter = router({
  auth: router({
    me: protectedProcedure.query(({ ctx }) => ctx.user),
    profile: protectedProcedure.query(async ({ ctx }) => {
      const appUser = await db.getAppUserByUserId(ctx.user.id);
      if (!appUser) return null;
      const homeowner = await db.getHomeownerProfile(ctx.user.id);
      const tradesperson = await db.getTradespersonProfile(ctx.user.id);
      return {
        ...appUser,
        homeowner,
        tradesperson,
      };
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        postcode: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateAppUser(ctx.user.id, input);
        return { success: true };
      }),
    onboard: protectedProcedure
      .input(z.object({
        appRole: z.enum(["homeowner", "tradesperson"]),
        firstName: z.string(),
        lastName: z.string(),
        postcode: z.string(),
        businessName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { appRole, firstName, lastName, postcode, businessName } = input;
        await db.createAppUser({
          userId: ctx.user.id,
          appRole,
          firstName,
          lastName,
          postcode,
        });
        if (appRole === "homeowner") {
          await db.createHomeownerProfile(ctx.user.id, "house");
        } else {
          await db.createTradespersonProfile(ctx.user.id, { businessName });
        }
        return { success: true };
      }),
  }),

  jobs: router({
    create: protectedProcedure
      .input(z.object({
        tradeCategoryId: z.number(),
        title: z.string().min(5),
        description: z.string().min(10),
        postcode: z.string().min(2),
        urgency: z.enum(["normal", "urgent", "emergency"]).default("normal"),
        budgetMin: z.number().optional(),
        budgetMax: z.number().optional(),
        budgetNotSure: z.boolean().default(false),
        preferredStartDate: z.string().optional(),
        isGroupJob: z.boolean().default(false),
        isEmergency: z.boolean().default(false),
        isBoosted: z.boolean().default(false)
      }))
      .mutation(async ({ ctx, input }) => {
        const expiresAt = input.urgency === "emergency" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const jobId = await db.createJob({
          homeownerId: ctx.user.id,
          tradeCategoryId: input.tradeCategoryId,
          title: input.title,
          description: input.description,
          postcode: input.postcode,
          urgency: input.urgency,
          budgetMin: input.budgetMin?.toString(),
          budgetMax: input.budgetMax?.toString(),
          budgetNotSure: input.budgetNotSure,
          preferredStartDate: input.preferredStartDate ? new Date(input.preferredStartDate) : undefined,
          isGroupJob: input.isGroupJob,
          isEmergency: input.isEmergency,
          isBoosted: input.isBoosted,
          expiresAt,
          status: "open"
        });
        
        // Generate and save AI checklist
        try {
          const categories = await db.getTradeCategories();
          const category = categories.find(c => c.id === input.tradeCategoryId)?.name || "General";
          const checklist = await ai.generateJobChecklist(input.title, input.description, category);
          if (checklist && checklist.length > 0) {
            await db.createJobMilestones(Number(jobId), checklist);
          }
        } catch (err) {
          console.error("[Router] Failed to generate AI checklist:", err);
        }

        return { jobId };
      }),
    myJobs: protectedProcedure.query(async ({ ctx }) => db.getJobsByHomeowner(ctx.user.id)),
    openJobs: protectedProcedure.query(async () => db.getOpenJobs(30)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => db.getJobById(input.id)),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "open", "quoting", "accepted", "in_progress", "completed", "cancelled", "disputed"])
      }))
      .mutation(async ({ input }) => {
        await db.updateJobStatus(input.id, input.status);
        return { success: true };
      }),
    addMedia: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        type: z.enum(["photo", "video"]),
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        caption: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (input.type === "photo") {
          await db.addJobPhoto(input.jobId, input.url, input.caption);
        } else {
          await db.addJobVideo(input.jobId, input.url, input.thumbnailUrl, input.caption);
        }
        return { success: true };
      }),
    getMedia: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const [photos, videos] = await Promise.all([
          db.getJobPhotos(input.jobId),
          db.getJobVideos(input.jobId),
        ]);
        return { photos, videos };
      }),
    estimate: protectedProcedure
      .input(z.object({ title: z.string(), description: z.string(), category: z.string() }))
      .query(async ({ input }) => {
        const estimate = await ai.getJobEstimate(input.title, input.description, input.category);
        return estimate;
      }),
  }),

  quotes: router({
    create: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        priceGbp: z.number(),
        timelineDays: z.number().optional(),
        timelineText: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const quoteId = await db.createQuote({
          jobId: input.jobId,
          tradespersonId: ctx.user.id,
          priceGbp: input.priceGbp.toString(),
          timelineDays: input.timelineDays,
          timelineText: input.timelineText,
          message: input.message,
          status: "pending",
        });
        return { quoteId };
      }),
    byJob: protectedProcedure.input(z.object({ jobId: z.number() })).query(async ({ input }) => db.getQuotesByJob(input.jobId)),
    accept: protectedProcedure
      .input(z.object({ quoteId: z.number(), jobId: z.number() }))
      .mutation(async ({ input }) => {
        await db.acceptQuote(input.quoteId, input.jobId);
        return { success: true };
      }),
  }),

  matching: router({
    getMatches: protectedProcedure
      .input(z.object({ jobId: z.number(), category: z.string(), postcode: z.string() }))
      .query(async ({ input }) => {
        return matching.getSmartMatches(input.jobId, input.category, input.postcode);
      }),
  }),

  progress: router({
    byJob: protectedProcedure.input(z.object({ jobId: z.number() })).query(async ({ input }) => db.getProgressUpdatesByJob(input.id)),
    add: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        photoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updateId = await db.addProgressUpdate({
          jobId: input.jobId,
          tradespersonId: ctx.user.id,
          title: input.title,
          description: input.description,
          photoUrl: input.photoUrl,
        });
        return { updateId };
      }),
  }),

  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getNotificationsByUser(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.markNotificationRead(input.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
