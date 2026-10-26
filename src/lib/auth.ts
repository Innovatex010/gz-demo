import { razorpayPlugin } from "@amank-root/better-auth-razorpay";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import Razorpay from "razorpay";
import { account, session, user, verification } from "@/db/schema";
import { db } from "./db/drizzle";

export const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: false,
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24 * 7, // 7 days
    freshAge: 60 * 60 * 24, // 1 day
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`[Email Verification] To: ${user.email}, Token: ${url}`);
    },
  },
  plugins: [
    razorpayPlugin({
      razorpayClient,
      keySecret: process.env.RAZORPAY_KEY_SECRET as string,
      razorpayWebhookSecret:
        process.env.RAZORPAY_WEBHOOK_SECRET || "dev_webhook_secret_placeholder",
      defaultCurrency: "INR",
      createCustomerOnSignUp: true,
      subscription: {
        enabled: false,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
