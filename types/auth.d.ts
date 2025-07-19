import { UserRole } from "@prisma/client";
import type { DefaultSession } from "better-auth";

declare module "better-auth" {
  /**
   * Returned by `auth.api.getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}
