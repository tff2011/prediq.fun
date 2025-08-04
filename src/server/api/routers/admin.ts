import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EventStatus } from "@prisma/client";
import { Decimal } from "decimal.js";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "your-secret-key-change-in-production";

const adminEventCreateSchema = z.object({
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

const adminEventUpdateSchema = adminEventCreateSchema.partial().extend({
  id: z.string().cuid(),
  status: z.nativeEnum(EventStatus).optional(),
});

// Admin procedure that checks for valid JWT token
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.headers?.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No authentication token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    const admin = await ctx.db.admin.findUnique({
      where: { id: decoded.adminId, active: true },
    });

    if (!admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid authentication token",
      });
    }

    // Update last login
    await ctx.db.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return next({
      ctx: {
        ...ctx,
        admin,
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid authentication token",
    });
  }
});

export const adminRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const admin = await ctx.db.admin.findUnique({
        where: { username: input.username, active: true },
      });

      if (!admin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const validPassword = await bcrypt.compare(input.password, admin.passwordHash);
      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      return {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      };
    }),

  me: adminProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.admin.id,
      username: ctx.admin.username,
      name: ctx.admin.name,
      email: ctx.admin.email,
      role: ctx.admin.role,
    };
  }),

  // Event management
  createEvent: adminProcedure
    .input(adminEventCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          ...input,
          createdById: ctx.admin.id,
        },
      });
    }),

  updateEvent: adminProcedure
    .input(adminEventUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      return ctx.db.event.update({
        where: { id },
        data,
      });
    }),

  // Market management
  getAllMarkets: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        eventId: z.string().cuid().optional(),
        status: z.enum(["ACTIVE", "PAUSED", "RESOLVED", "CANCELLED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where: any = {};

      if (input.search) {
        where.OR = [
          { question: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.eventId) where.eventId = input.eventId;
      if (input.status) where.status = input.status;

      const [markets, total] = await Promise.all([
        ctx.db.market.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
            outcomes: true,
            _count: {
              select: { bets: true },
            },
          },
        }),
        ctx.db.market.count({ where }),
      ]);

      return {
        markets,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  createMarket: adminProcedure
    .input(
      z.object({
        eventId: z.string().cuid(),
        question: z.string().min(1),
        description: z.string().optional(),
        closesAt: z.date(),
        resolvesAt: z.date().optional(),
        initialYesPrice: z.number().min(0.01).max(0.99).default(0.5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create market with initial outcomes
      const market = await ctx.db.market.create({
        data: {
          title: input.question,
          description: input.description,
          category: "Outros",
          closesAt: input.closesAt,
          slug: input.question.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').substring(0, 50),
          status: "ACTIVE",
          volume: new Decimal(0),
          liquidity: new Decimal(1000), // Initial liquidity
          createdById: ctx.admin.id,
          outcomes: {
            create: [
              {
                name: "YES",
                probability: new Decimal(input.initialYesPrice),
              },
              {
                name: "NO",
                probability: new Decimal(1 - input.initialYesPrice),
              },
            ],
          },
        },
        include: {
          outcomes: true,
        },
      });

      return market;
    }),

  updateMarket: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        question: z.string().min(1).optional(),
        description: z.string().optional(),
        closesAt: z.date().optional(),
        resolvesAt: z.date().optional(),
        status: z.enum(["ACTIVE", "PAUSED", "RESOLVED", "CANCELLED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.market.update({
        where: { id },
        data,
      });
    }),

  deleteMarket: adminProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      // Delete all related data first
      await ctx.db.bet.deleteMany({
        where: { marketId: input },
      });
      await ctx.db.position.deleteMany({
        where: { marketId: input },
      });
      await ctx.db.outcome.deleteMany({
        where: { marketId: input },
      });
      
      return ctx.db.market.delete({
        where: { id: input },
      });
    }),

  resolveMarket: adminProcedure
    .input(
      z.object({
        marketId: z.string().cuid(),
        winningOutcome: z.enum(["YES", "NO"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get market with outcomes and positions
      const market = await ctx.db.market.findUnique({
        where: { id: input.marketId },
        include: {
          outcomes: true,
          positions: {
            include: {
              user: true,
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

      if (market.status === "RESOLVED") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Market already resolved",
        });
      }

      // Update market status
      await ctx.db.market.update({
        where: { id: input.marketId },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
          winningOutcome: input.winningOutcome,
        },
      });

      // Calculate payouts for winners
      const winningOutcome = market.outcomes.find(o => o.name === input.winningOutcome);
      if (!winningOutcome) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Winning outcome not found",
        });
      }

      // Process payouts for all positions
      for (const position of market.positions) {
        if (position.outcome === input.winningOutcome && position.shares.greaterThan(0)) {
          // Winner gets 1 token per share
          const payout = position.shares;
          
          await ctx.db.user.update({
            where: { id: position.userId },
            data: {
              balance: {
                increment: payout,
              },
            },
          });

          // Create transaction record
          await ctx.db.transaction.create({
            data: {
              userId: position.userId,
              type: "MARKET_PAYOUT",
              amount: payout,
              description: `Payout for market: ${market.question}`,
              marketId: market.id,
            },
          });
        }
      }

      return { success: true };
    }),

  deleteEvent: adminProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      // Check if event has active markets
      const marketsCount = await ctx.db.market.count({
        where: { eventId: input },
      });

      if (marketsCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete event with active markets",
        });
      }

      return ctx.db.event.delete({
        where: { id: input },
      });
    }),

  getAllEvents: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        category: z.string().optional(),
        status: z.nativeEnum(EventStatus).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where: any = {};

      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { subtitle: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.category) where.category = input.category;
      if (input.status) where.status = input.status;

      const [events, total] = await Promise.all([
        ctx.db.event.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { markets: true },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        ctx.db.event.count({ where }),
      ]);

      return {
        events,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // User management
  getAllUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z.enum(["active", "suspended"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where: any = {};

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.status === "suspended") {
        where.suspended = true;
      } else if (input.status === "active") {
        where.suspended = false;
      }

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { 
                bets: true,
                positions: true,
              },
            },
          },
        }),
        ctx.db.user.count({ where }),
      ]);

      // Calculate stats
      const stats = await ctx.db.user.aggregate({
        _sum: {
          balance: true,
        },
        _count: {
          _all: true,
        },
        where: {},
      });

      const suspendedCount = await ctx.db.user.count({
        where: { suspended: true },
      });

      return {
        users,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
        stats: {
          totalUsers: stats._count._all,
          activeUsers: stats._count._all - suspendedCount,
          suspendedUsers: suspendedCount,
          totalBalance: stats._sum.balance || new Decimal(0),
        },
      };
    }),

  suspendUser: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input },
        data: { suspended: true },
      });
    }),

  activateUser: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input },
        data: { suspended: false },
      });
    }),

  updateUserBalance: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(),
        operation: z.enum(["add", "subtract", "set"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      let newBalance: Decimal;
      switch (input.operation) {
        case "add":
          newBalance = new Decimal(user.balance).plus(input.amount);
          break;
        case "subtract":
          newBalance = new Decimal(user.balance).minus(input.amount);
          break;
        case "set":
          newBalance = new Decimal(input.amount);
          break;
      }

      if (newBalance.lessThan(0)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Balance cannot be negative",
        });
      }

      // Update user balance
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { balance: newBalance },
      });

      // Create transaction record
      await ctx.db.transaction.create({
        data: {
          userId: input.userId,
          type: "ADMIN_ADJUSTMENT",
          amount: new Decimal(input.amount),
          description: `Admin ${input.operation} balance adjustment`,
        },
      });

      return updatedUser;
    }),

  // Dashboard stats
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalEvents,
      liveEvents,
      totalMarkets,
      activeMarkets,
      totalUsers,
      totalVolume,
    ] = await Promise.all([
      ctx.db.event.count(),
      ctx.db.event.count({ where: { status: "LIVE" } }),
      ctx.db.market.count(),
      ctx.db.market.count({ where: { status: "ACTIVE" } }),
      ctx.db.user.count(),
      ctx.db.market.aggregate({
        _sum: { volume: true },
      }),
    ]);

    return {
      totalEvents,
      liveEvents,
      totalMarkets,
      activeMarkets,
      totalUsers,
      totalVolume: totalVolume._sum.volume || 0,
    };
  }),

  // Create initial admin (only works if no admins exist)
  createInitialAdmin: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        name: z.string(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const adminCount = await ctx.db.admin.count();
      
      if (adminCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Admin already exists",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      return ctx.db.admin.create({
        data: {
          username: input.username,
          passwordHash,
          name: input.name,
          email: input.email,
          role: "SUPER_ADMIN",
        },
      });
    }),

  // Settings management
  getSettings: adminProcedure.query(async ({ ctx }) => {
    // In a real app, these would come from a database
    // For now, return default values
    return {
      general: {
        siteName: "PredIQ.fun",
        siteDescription: "Prediction Markets Platform",
        maintenanceMode: false,
      },
      trading: {
        minBetAmount: 1,
        maxBetAmount: 10000,
        tradingFee: 2,
        initialUserBalance: 1000,
      },
      security: {
        requireEmailVerification: true,
        allowNewRegistrations: true,
        sessionTimeout: 30,
      },
    };
  }),

  updateSettings: adminProcedure
    .input(
      z.object({
        category: z.enum(["general", "trading", "security"]),
        settings: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In a real app, save to database
      // For now, just return success
      return { success: true };
    }),

  changeAdminPassword: adminProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current admin from context
      const adminId = ctx.adminId;
      const admin = await ctx.db.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Admin not found",
        });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(input.currentPassword, admin.passwordHash);
      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      // Update password
      await ctx.db.admin.update({
        where: { id: adminId },
        data: { passwordHash: hashedPassword },
      });

      return { success: true };
    }),
});