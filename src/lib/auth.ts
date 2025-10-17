import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { NextRequest } from "next/server";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export async function getCurrentUser(request: NextRequest) {
  try {
    // Convert Headers object to plain object for better-auth
    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    const session = await auth.api.getSession({ 
      headers: headersObj 
    });
    
    return session?.user || null;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}