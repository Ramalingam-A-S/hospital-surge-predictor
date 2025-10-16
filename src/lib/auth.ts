import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { db } from "@/db";
 
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {    
		enabled: true
	},
	plugins: [bearer()]
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  // Convert NextRequest headers to a plain object
  const headersList: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersList[key] = value;
  });

  const session = await auth.api.getSession({ headers: headersList });
  return session?.user || null;
}