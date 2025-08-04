import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { EventStatus } from "@prisma/client";

const eventCreateSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  category: z.string(),
  sport: z.string().optional(),
  startsAt: z.date(),
  endsAt: z.date().optional(),
  imageUrl: z.string().url().optional(),
  venue: z.string().optional(),
  featured: z.boolean().default(false),
});

const eventUpdateSchema = eventCreateSchema.partial().extend({
  id: z.string().cuid(),
  status: z.nativeEnum(EventStatus).optional(),
});

export const eventRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        status: z.nativeEnum(EventStatus).optional(),
        featured: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.category) where.category = input.category;
      if (input.status) where.status = input.status;
      if (input.featured !== undefined) where.featured = input.featured;

      const events = await ctx.db.event.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: [
          { featured: "desc" },
          { startsAt: "asc" },
        ],
        include: {
          markets: {
            include: {
              outcomes: true,
            },
          },
          _count: {
            select: { markets: true },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (events.length > input.limit) {
        const nextItem = events.pop();
        nextCursor = nextItem!.id;
      }

      return {
        events,
        nextCursor,
      };
    }),

  getById: publicProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input },
        include: {
          markets: {
            include: {
              outcomes: true,
              _count: {
                select: { bets: true },
              },
            },
            orderBy: { volume: "desc" },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      return event;
    }),

  getUpcoming: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.event.findMany({
        where: {
          status: "UPCOMING",
          startsAt: {
            gte: new Date(),
          },
        },
        orderBy: { startsAt: "asc" },
        take: input.limit,
        include: {
          _count: {
            select: { markets: true },
          },
        },
      });
    }),

  getLive: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany({
      where: {
        status: "LIVE",
      },
      orderBy: { startsAt: "asc" },
      include: {
        markets: {
          include: {
            outcomes: true,
          },
        },
        _count: {
          select: { markets: true },
        },
      },
    });
  }),

  updateStatus: publicProcedure.mutation(async ({ ctx }) => {
    const now = new Date();
    
    // Update UPCOMING events to LIVE
    await ctx.db.event.updateMany({
      where: {
        status: "UPCOMING",
        startsAt: {
          lte: now,
        },
      },
      data: {
        status: "LIVE",
      },
    });
    
    // Update LIVE events to ENDED
    await ctx.db.event.updateMany({
      where: {
        status: "LIVE",
        endsAt: {
          lte: now,
        },
      },
      data: {
        status: "ENDED",
      },
    });
    
    return { success: true };
  }),
});