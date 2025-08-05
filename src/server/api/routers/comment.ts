import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const commentRouter = createTRPCRouter({
  /**
   * Get comments for a market with pagination
   */
  getByMarket: publicProcedure
    .input(z.object({
      marketId: z.string(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().nullish(),
      sortBy: z.enum(['recent', 'popular']).default('recent'),
    }))
    .query(async ({ ctx, input }) => {
      const { marketId, limit, cursor, sortBy } = input;

      // Build where clause
      const where = {
        marketId,
        parentId: null, // Only top-level comments for now
      };

      // Build orderBy based on sortBy
      const orderBy = sortBy === 'popular' 
        ? [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }];

      const comments = await ctx.db.comment.findMany({
        where,
        orderBy: orderBy as any,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          content: true,
          position: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          likes: {
            select: {
              userId: true,
            }
          },
          replies: {
            select: {
              id: true,
            }
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            }
          }
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (comments.length > limit) {
        const nextItem = comments.pop()!;
        nextCursor = nextItem.id;
      }

      // Transform data to match component interface
      const transformedComments = comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        position: comment.position as 'yes' | 'no' | null,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          name: comment.author.name ?? 'Usuário Anônimo',
          image: comment.author.image,
          verified: false, // TODO: Add verified field to User model
        },
        likesCount: comment._count.likes,
        repliesCount: comment._count.replies,
        isLiked: ctx.session?.user ? 
          comment.likes.some(like => like.userId === ctx.session!.user.id) : 
          false,
      }));

      return {
        comments: transformedComments,
        nextCursor,
      };
    }),

  /**
   * Create a new comment
   */
  create: publicProcedure
    .input(z.object({
      marketId: z.string(),
      content: z.string().min(1).max(2000),
      position: z.enum(['yes', 'no']).optional(),
      parentId: z.string().optional(),
      authorName: z.string().min(1).max(100).default('Usuário Anônimo'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { marketId, content, position, parentId, authorName } = input;

      // Verify market exists
      const market = await ctx.db.market.findUnique({
        where: { id: marketId },
        select: { id: true, status: true }
      });

      if (!market) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Market not found',
        });
      }

      if (market.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot comment on inactive market',
        });
      }

      // If replying to a comment, verify parent exists
      if (parentId) {
        const parentComment = await ctx.db.comment.findUnique({
          where: { id: parentId },
          select: { id: true, marketId: true }
        });

        if (!parentComment || parentComment.marketId !== marketId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent comment not found',
          });
        }
      }

      // Get or create anonymous user for development
      let userId: string;
      
      if (ctx.session?.user?.id) {
        userId = ctx.session.user.id;
      } else {
        // For development: get or create an anonymous user
        const anonymousEmail = `anonymous_${Date.now()}@prediq.fun`;
        let anonymousUser = await ctx.db.user.findFirst({
          where: { email: { startsWith: 'anonymous_' } },
          orderBy: { createdAt: 'desc' }
        });
        
        if (!anonymousUser) {
          anonymousUser = await ctx.db.user.create({
            data: {
              email: anonymousEmail,
              name: authorName || 'Usuário Anônimo',
            }
          });
        }
        
        userId = anonymousUser.id;
      }

      const comment = await ctx.db.comment.create({
        data: {
          content,
          position,
          marketId,
          authorId: userId,
          parentId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            }
          }
        },
      });

      return {
        id: comment.id,
        content: comment.content,
        position: comment.position as 'yes' | 'no' | null,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          name: comment.author.name ?? 'Usuário Anônimo',
          image: comment.author.image,
          verified: false,
        },
        likesCount: comment._count.likes,
        repliesCount: comment._count.replies,
        isLiked: false,
      };
    }),

  /**
   * Toggle like on a comment
   */
  toggleLike: publicProcedure
    .input(z.object({
      commentId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      
      // For development: get or create anonymous user
      let userId: string;
      
      if (ctx.session?.user?.id) {
        userId = ctx.session.user.id;
      } else {
        // Create a temporary session-based user ID
        const tempUser = await ctx.db.user.findFirst({
          where: { email: { startsWith: 'anonymous_' } },
          orderBy: { createdAt: 'desc' }
        });
        
        if (!tempUser) {
          const newUser = await ctx.db.user.create({
            data: {
              email: `anonymous_${Date.now()}@prediq.fun`,
              name: 'Usuário Anônimo',
            }
          });
          userId = newUser.id;
        } else {
          userId = tempUser.id;
        }
      }

      // Check if comment exists
      const comment = await ctx.db.comment.findUnique({
        where: { id: commentId },
        select: { id: true }
      });

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        });
      }

      // Check if user already liked this comment
      const existingLike = await ctx.db.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId,
          }
        }
      });

      let isLiked: boolean;
      let likesCount: number;

      if (existingLike) {
        // Remove like
        await ctx.db.commentLike.delete({
          where: { id: existingLike.id }
        });
        isLiked = false;
      } else {
        // Add like
        await ctx.db.commentLike.create({
          data: {
            commentId,
            userId,
          }
        });
        isLiked = true;
      }

      // Get updated likes count
      likesCount = await ctx.db.commentLike.count({
        where: { commentId }
      });

      return {
        isLiked,
        likesCount,
      };
    }),

  /**
   * Delete a comment (author only)
   */
  delete: protectedProcedure
    .input(z.object({
      commentId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const userId = ctx.session.user.id;

      const comment = await ctx.db.comment.findUnique({
        where: { id: commentId },
        select: { id: true, authorId: true }
      });

      if (!comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Comment not found',
        });
      }

      if (comment.authorId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own comments',
        });
      }

      await ctx.db.comment.delete({
        where: { id: commentId }
      });

      return { success: true };
    }),

  /**
   * Get replies for a comment
   */
  getReplies: publicProcedure
    .input(z.object({
      parentId: z.string(),
      limit: z.number().min(1).max(20).default(10),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { parentId, limit, cursor } = input;

      const replies = await ctx.db.comment.findMany({
        where: {
          parentId,
        },
        orderBy: { createdAt: 'asc' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          content: true,
          position: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          likes: {
            select: {
              userId: true,
            }
          },
          _count: {
            select: {
              likes: true,
            }
          }
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (replies.length > limit) {
        const nextItem = replies.pop()!;
        nextCursor = nextItem.id;
      }

      const transformedReplies = replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        position: reply.position as 'yes' | 'no' | null,
        createdAt: reply.createdAt,
        author: {
          id: reply.author.id,
          name: reply.author.name ?? 'Usuário Anônimo',
          image: reply.author.image,
          verified: false,
        },
        likesCount: reply._count.likes,
        repliesCount: 0, // Replies don't have nested replies
        isLiked: ctx.session?.user ? 
          reply.likes.some(like => like.userId === ctx.session!.user.id) : 
          false,
      }));

      return {
        replies: transformedReplies,
        nextCursor,
      };
    }),
});