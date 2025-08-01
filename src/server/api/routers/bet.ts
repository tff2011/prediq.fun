import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Decimal } from "@prisma/client/runtime/library";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const betRouter = createTRPCRouter({
  // Place a bet on a market
  placeBet: protectedProcedure
    .input(
      z.object({
        marketId: z.string().uuid(),
        outcomeId: z.string().uuid(),
        amount: z.number().positive(),
        type: z.enum(["BUY", "SELL"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Start a transaction
      return await ctx.db.$transaction(async (tx) => {
        // Get user balance
        const user = await tx.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { balance: true },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Check if user has sufficient balance for BUY
        if (input.type === "BUY" && user.balance.toNumber() < input.amount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient balance",
          });
        }

        // Get market and outcome
        const market = await tx.market.findUnique({
          where: { id: input.marketId },
          include: {
            outcomes: {
              where: { id: input.outcomeId },
            },
          },
        });

        if (!market || market.outcomes.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Market or outcome not found",
          });
        }

        if (market.status !== "ACTIVE") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Market is not active",
          });
        }

        const outcome = market.outcomes[0]!;
        const currentPrice = outcome.probability;

        // Calculate shares based on AMM formula
        // Simple constant product AMM: shares = amount / price
        const shares = new Decimal(input.amount).div(currentPrice);

        // Create bet record
        const bet = await tx.bet.create({
          data: {
            userId: ctx.session.user.id,
            marketId: input.marketId,
            outcomeId: input.outcomeId,
            type: input.type,
            amount: input.amount,
            shares: shares.toNumber(),
            price: currentPrice.toNumber(),
          },
        });

        // Update or create position
        const existingPosition = await tx.position.findUnique({
          where: {
            userId_marketId_outcomeId: {
              userId: ctx.session.user.id,
              marketId: input.marketId,
              outcomeId: input.outcomeId,
            },
          },
        });

        if (input.type === "BUY") {
          if (existingPosition) {
            // Update existing position
            const newShares = new Decimal(existingPosition.shares).plus(shares);
            const newInvested = new Decimal(existingPosition.invested).plus(input.amount);
            const newAvgPrice = newInvested.div(newShares);

            await tx.position.update({
              where: { id: existingPosition.id },
              data: {
                shares: newShares.toNumber(),
                invested: newInvested.toNumber(),
                avgPrice: newAvgPrice.toNumber(),
              },
            });
          } else {
            // Create new position
            await tx.position.create({
              data: {
                userId: ctx.session.user.id,
                marketId: input.marketId,
                outcomeId: input.outcomeId,
                shares: shares.toNumber(),
                invested: input.amount,
                avgPrice: currentPrice.toNumber(),
              },
            });
          }

          // Deduct from user balance
          await tx.user.update({
            where: { id: ctx.session.user.id },
            data: {
              balance: { decrement: input.amount },
              totalInvested: { increment: input.amount },
            },
          });

        } else {
          // SELL logic
          if (!existingPosition || existingPosition.shares.toNumber() < shares.toNumber()) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Insufficient shares to sell",
            });
          }

          // Update position
          const newShares = new Decimal(existingPosition.shares).minus(shares);
          const shareRatio = shares.div(existingPosition.shares);
          const soldInvested = new Decimal(existingPosition.invested).mul(shareRatio);
          const newInvested = new Decimal(existingPosition.invested).minus(soldInvested);

          if (newShares.toNumber() === 0) {
            // Delete position if no shares left
            await tx.position.delete({
              where: { id: existingPosition.id },
            });
          } else {
            // Update position
            await tx.position.update({
              where: { id: existingPosition.id },
              data: {
                shares: newShares.toNumber(),
                invested: newInvested.toNumber(),
              },
            });
          }

          // Add to user balance
          await tx.user.update({
            where: { id: ctx.session.user.id },
            data: {
              balance: { increment: input.amount },
            },
          });
        }

        // Update market volume
        await tx.market.update({
          where: { id: input.marketId },
          data: {
            volume: { increment: input.amount },
          },
        });

        // TODO: Update outcome probabilities based on AMM

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId: ctx.session.user.id,
            type: input.type === "BUY" ? "BET_PLACED" : "BET_SOLD",
            amount: input.amount,
            status: "COMPLETED",
          },
        });

        return bet;
      });
    }),

  // Get user's bet history
  getMyBets: protectedProcedure
    .input(
      z.object({
        marketId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const bets = await ctx.db.bet.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.marketId && { marketId: input.marketId }),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          market: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          outcome: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (bets.length > input.limit) {
        const nextItem = bets.pop();
        nextCursor = nextItem!.id;
      }

      return {
        bets,
        nextCursor,
      };
    }),

  // Get user's positions
  getMyPositions: protectedProcedure
    .input(
      z.object({
        marketId: z.string().uuid().optional(),
        active: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const positions = await ctx.db.position.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input.marketId && { marketId: input.marketId }),
          ...(input.active !== undefined && {
            market: {
              status: input.active ? "ACTIVE" : { not: "ACTIVE" },
            },
          }),
        },
        orderBy: { invested: "desc" },
        include: {
          market: {
            select: {
              id: true,
              title: true,
              status: true,
              resolution: true,
            },
          },
          outcome: {
            select: {
              id: true,
              name: true,
              probability: true,
            },
          },
        },
      });

      // Calculate current value and P&L
      const positionsWithPnL = positions.map((position) => {
        const currentValue = new Decimal(position.shares).mul(position.outcome.probability);
        const pnl = currentValue.minus(position.invested);
        const pnlPercent = position.invested.toNumber() > 0 
          ? pnl.div(position.invested).mul(100) 
          : new Decimal(0);

        return {
          ...position,
          currentValue: currentValue.toNumber(),
          pnl: pnl.toNumber(),
          pnlPercent: pnlPercent.toNumber(),
        };
      });

      return positionsWithPnL;
    }),

  // Get market order book (recent bets)
  getMarketOrderBook: protectedProcedure
    .input(
      z.object({
        marketId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const bets = await ctx.db.bet.findMany({
        where: { marketId: input.marketId },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          outcome: {
            select: {
              name: true,
            },
          },
        },
      });

      return bets;
    }),
});