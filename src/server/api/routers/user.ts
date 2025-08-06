import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  // Create or update user from Web3Auth login
  createOrUpdateWeb3User: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        image: z.string().url().optional(),
        walletAddress: z.string(),
        walletChain: z.enum(['polygon', 'solana']),
        web3Provider: z.string().default('web3auth'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists by wallet address
      let user = await ctx.db.user.findUnique({
        where: { walletAddress: input.walletAddress },
      });

      if (user) {
        // Update existing user
        user = await ctx.db.user.update({
          where: { walletAddress: input.walletAddress },
          data: {
            name: input.name || user.name,
            email: input.email,
            image: input.image || user.image,
            walletChain: input.walletChain,
            web3Provider: input.web3Provider,
            updatedAt: new Date(),
          },
        });
      } else {
        // Check if user exists by email
        const existingUserByEmail = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingUserByEmail) {
          // Update existing user with wallet info
          user = await ctx.db.user.update({
            where: { email: input.email },
            data: {
              walletAddress: input.walletAddress,
              walletChain: input.walletChain,
              web3Provider: input.web3Provider,
              name: input.name || existingUserByEmail.name,
              image: input.image || existingUserByEmail.image,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new user
          user = await ctx.db.user.create({
            data: {
              email: input.email,
              name: input.name,
              image: input.image,
              walletAddress: input.walletAddress,
              walletChain: input.walletChain,
              web3Provider: input.web3Provider,
              balance: 0, // Start with $0 balance
            },
          });
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        walletAddress: user.walletAddress,
        walletChain: user.walletChain,
        balance: user.balance.toNumber(),
        totalInvested: user.totalInvested.toNumber(),
        totalWinnings: user.totalWinnings.toNumber(),
        createdAt: user.createdAt,
      };
    }),

  // Get user by wallet address
  getByWallet: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { walletAddress: input.walletAddress },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          walletAddress: true,
          walletChain: true,
          balance: true,
          totalInvested: true,
          totalWinnings: true,
          totalWagered: true,
          createdAt: true,
        },
      });

      if (!user) return null;

      return {
        ...user,
        balance: user.balance.toNumber(),
        totalInvested: user.totalInvested.toNumber(),
        totalWinnings: user.totalWinnings.toNumber(),
        totalWagered: user.totalWagered.toNumber(),
      };
    }),

  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        balance: true,
        totalInvested: true,
        totalWinnings: true,
        _count: {
          select: {
            markets: true,
            bets: true,
            positions: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          image: input.image,
        },
      });

      return updated;
    }),

  // Get user stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get aggregated stats
    const [
      totalMarkets,
      totalBets,
      activePositions,
      wonPositions,
      totalVolume,
    ] = await Promise.all([
      ctx.db.market.count({ where: { createdById: userId } }),
      ctx.db.bet.count({ where: { userId } }),
      ctx.db.position.count({
        where: {
          userId,
          market: { status: "ACTIVE" },
        },
      }),
      ctx.db.position.count({
        where: {
          userId,
          market: {
            status: "RESOLVED",
            resolution: {
              in: ["YES", "NO"],
            },
          },
        },
      }),
      ctx.db.bet.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
    ]);

    // Calculate profit/loss from resolved markets
    const resolvedPositions = await ctx.db.position.findMany({
      where: {
        userId,
        market: {
          status: "RESOLVED",
          resolution: {
            in: ["YES", "NO"],
          },
        },
      },
      include: {
        market: {
          select: { resolution: true },
        },
        outcome: {
          select: { name: true },
        },
      },
    });

    let totalProfit = 0;
    resolvedPositions.forEach((position) => {
      const won = position.market.resolution === position.outcome.name;
      if (won) {
        totalProfit += position.shares.toNumber() - position.invested.toNumber();
      } else {
        totalProfit -= position.invested.toNumber();
      }
    });

    return {
      totalMarkets,
      totalBets,
      activePositions,
      wonPositions,
      totalVolume: totalVolume._sum.amount?.toNumber() ?? 0,
      totalProfit,
      winRate: totalBets > 0 ? (wonPositions / totalBets) * 100 : 0,
    };
  }),

  // Get user transaction history
  getTransactions: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "DEPOSIT",
          "WITHDRAWAL",
          "BET_PLACED",
          "BET_SOLD",
          "WINNINGS",
          "REFUND",
        ]).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.type && { type: input.type }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (transactions.length > input.limit) {
        const nextItem = transactions.pop();
        nextCursor = nextItem!.id;
      }

      return {
        transactions,
        nextCursor,
      };
    }),

  // Add funds to user balance
  deposit: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().default("USD"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, this would integrate with payment processor
      // For now, we'll simulate a successful deposit

      const transaction = await ctx.db.$transaction(async (tx) => {
        // Create transaction record
        const txRecord = await tx.transaction.create({
          data: {
            userId: ctx.session.user.id,
            type: "DEPOSIT",
            amount: input.amount,
            currency: input.currency,
            status: "COMPLETED",
          },
        });

        // Update user balance
        await tx.user.update({
          where: { id: ctx.session.user.id },
          data: {
            balance: { increment: input.amount },
          },
        });

        return txRecord;
      });

      return transaction;
    }),

  // Request withdrawal
  withdraw: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().default("USD"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { balance: true },
      });

      if (!user || user.balance.toNumber() < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      const transaction = await ctx.db.$transaction(async (tx) => {
        // Create transaction record
        const txRecord = await tx.transaction.create({
          data: {
            userId: ctx.session.user.id,
            type: "WITHDRAWAL",
            amount: input.amount,
            currency: input.currency,
            status: "PENDING", // Would be processed by payment system
          },
        });

        // Deduct from user balance
        await tx.user.update({
          where: { id: ctx.session.user.id },
          data: {
            balance: { decrement: input.amount },
          },
        });

        return txRecord;
      });

      return transaction;
    }),

  // Get user's portfolio value over time
  getPortfolioHistory: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      // This is a simplified version
      // In production, you'd track historical values
      const positions = await ctx.db.position.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          outcome: true,
          market: true,
        },
      });

      const currentValue = positions.reduce((sum, position) => {
        const value = position.shares.toNumber() * position.outcome.probability.toNumber();
        return sum + value;
      }, 0);

      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { balance: true, totalInvested: true },
      });

      const totalValue = currentValue + (user?.balance.toNumber() ?? 0);

      // Mock historical data for now
      const history = Array.from({ length: input.days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (input.days - i - 1));
        
        // Simple random walk
        const variance = (Math.random() - 0.5) * 0.1;
        const value = totalValue * (1 + variance * ((input.days - i) / input.days));
        
        return {
          date: date.toISOString(),
          value: Math.max(0, value),
        };
      });

      return {
        currentValue: totalValue,
        history,
      };
    }),
});