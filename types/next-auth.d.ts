import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extends the built-in session.user object
   */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  /**
   * Extends the built-in user object found in callbacks
   */
  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}