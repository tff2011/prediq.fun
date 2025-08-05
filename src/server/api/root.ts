import { postRouter } from "~/server/api/routers/post";
import { marketRouter } from "~/server/api/routers/market";
import { betRouter } from "~/server/api/routers/bet";
import { userRouter } from "~/server/api/routers/user";
import { eventRouter } from "~/server/api/routers/event";
import { adminRouter } from "~/server/api/routers/admin";
import { commentRouter } from "~/server/api/routers/comment";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  market: marketRouter,
  bet: betRouter,
  user: userRouter,
  event: eventRouter,
  admin: adminRouter,
  comment: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
