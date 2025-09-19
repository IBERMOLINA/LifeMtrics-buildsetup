import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

const middlewareImpl = hasClerk
  ? authMiddleware({
      publicRoutes: ["/", "/api/webhooks/stripe", "/sign-in(.*)", "/sign-up(.*)"],
    })
  : (() => NextResponse.next());

export default middlewareImpl;

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
