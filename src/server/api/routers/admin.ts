import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EventStatus } from "@prisma/client";

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
  const authHeader = ctx.headers?.get?.("authorization") || ctx.headers?.["authorization"];
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
});