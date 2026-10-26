import { razorpayClientPlugin } from "@amank-root/better-auth-razorpay/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    razorpayClientPlugin({
      subscription: false,
    }),
  ],
});

export const { signIn, signOut, useSession } = authClient;
