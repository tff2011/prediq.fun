import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { MarketStatus } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const marketRouter = createTRPCRouter({
  // Create a new market
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        description: z.string().optional(),
        category: z.string(),
        closesAt: z.date(),
        initialLiquidity: z.number().min(0).default(1000),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate closing date is in the future
      if (input.closesAt <= new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Market closing date must be in the future",
        });
      }

      const market = await ctx.db.market.create({
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          closesAt: input.closesAt,
          liquidity: input.initialLiquidity,
          imageUrl: input.imageUrl,
          createdById: ctx.session.user.id,
          slug: input.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 50),
          outcomes: {
            create: [
              { name: "YES", probability: 0.5 },
              { name: "NO", probability: 0.5 },
            ],
          },
        },
        include: {
          outcomes: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return market;
    }),

  // Get all active markets
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        status: z.nativeEnum(MarketStatus).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        sortBy: z.enum(["volume", "traders", "createdAt", "closesAt"]).default("volume"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Build orderBy based on sortBy parameter
      let orderBy: any = [];
      
      switch (input.sortBy) {
        case "traders":
          // We'll need to count unique traders (users who made bets)
          orderBy = [
            { bets: { _count: "desc" } },
            { createdAt: "desc" }
          ];
          break;
        case "createdAt":
          orderBy = [
            { createdAt: input.sortOrder },
          ];
          break;
        case "closesAt":
          orderBy = [
            { closesAt: input.sortOrder },
            { createdAt: "desc" }
          ];
          break;
        case "volume":
        default:
          orderBy = [
            { volume: input.sortOrder },
            { createdAt: "desc" },
          ];
          break;
      }

      const markets = await ctx.db.market.findMany({
        where: {
          ...(input.category && { category: input.category }),
          ...(input.status && { status: input.status }),
          ...(input.status === undefined && { status: "ACTIVE" }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy,
        include: {
          outcomes: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              bets: true,
              positions: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (markets.length > input.limit) {
        const nextItem = markets.pop();
        nextCursor = nextItem!.id;
      }

      return {
        markets,
        nextCursor,
      };
    }),

  // Get trending markets (ordered by number of traders/bets)
  getTrending: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const markets = await ctx.db.market.findMany({
        where: {
          status: "ACTIVE",
          ...(input.category && { category: input.category }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: [
          { bets: { _count: "desc" } },
          { volume: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          outcomes: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              bets: true,
              positions: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (markets.length > input.limit) {
        const nextItem = markets.pop();
        nextCursor = nextItem!.id;
      }

      return {
        markets,
        nextCursor,
      };
    }),

  // Get newest markets (ordered by creation date)
  getNewest: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const markets = await ctx.db.market.findMany({
        where: {
          status: "ACTIVE",
          ...(input.category && { category: input.category }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: [
          { createdAt: "desc" },
        ],
        include: {
          outcomes: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              bets: true,
              positions: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (markets.length > input.limit) {
        const nextItem = markets.pop();
        nextCursor = nextItem!.id;
      }

      return {
        markets,
        nextCursor,
      };
    }),

  // Get market by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const market = await ctx.db.market.findUnique({
        where: { id: input.id },
        include: {
          outcomes: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          bets: {
            orderBy: { createdAt: "desc" },
            take: 20,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              bets: true,
              positions: true,
            },
          },
        },
      });

      if (!market) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Market not found",
        });
      }

      return market;
    }),

  // Get user's created markets
  getMyMarkets: protectedProcedure.query(async ({ ctx }) => {
    const markets = await ctx.db.market.findMany({
      where: { createdById: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        outcomes: true,
        _count: {
          select: {
            bets: true,
            positions: true,
          },
        },
      },
    });

    return markets;
  }),

  // Update market (only creator can update)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(5).max(200).optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const market = await ctx.db.market.findUnique({
        where: { id: input.id },
        select: { createdById: true, status: true },
      });

      if (!market) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Market not found",
        });
      }

      if (market.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the creator can update this market",
        });
      }

      if (market.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only update active markets",
        });
      }

      const updated = await ctx.db.market.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
        },
      });

      return updated;
    }),

  // Resolve market (only creator can resolve)
  resolve: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        resolution: z.enum(["YES", "NO", "INVALID"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const market = await ctx.db.market.findUnique({
        where: { id: input.id },
        select: { 
          createdById: true, 
          status: true,
          closesAt: true,
        },
      });

      if (!market) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Market not found",
        });
      }

      if (market.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the creator can resolve this market",
        });
      }

      if (market.status !== "CLOSED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Market must be closed before resolution",
        });
      }

      const resolved = await ctx.db.market.update({
        where: { id: input.id },
        data: {
          status: "RESOLVED",
          resolution: input.resolution,
          resolvedAt: new Date(),
        },
      });

      // TODO: Trigger payout calculation for winning positions

      return resolved;
    }),

  // Get market categories
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.market.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        _count: {
          category: "desc",
        },
      },
    });

    return categories.map((cat) => ({
      name: cat.category,
      count: cat._count.category,
    }));
  }),

  // Search markets
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        category: z.string().optional(),
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const markets = await ctx.db.market.findMany({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: input.query, mode: "insensitive" } },
                { description: { contains: input.query, mode: "insensitive" } },
              ],
            },
            input.category ? { category: input.category } : {},
            { status: "ACTIVE" },
          ],
        },
        take: input.limit,
        orderBy: [
          { volume: "desc" },
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          closesAt: true,
          outcomes: {
            select: {
              id: true,
              name: true,
              probability: true,
            },
          },
          _count: {
            select: {
              bets: true,
            },
          },
        },
      });

      return markets.map(market => ({
        id: market.id,
        slug: market.slug,
        title: market.title,
        category: market.category,
        closesAt: market.closesAt,
        outcomes: market.outcomes,
        betCount: market._count.bets,
      }));
    }),
});