import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  orgId: string | null; // Organization ID from authenticated user
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let orgId: string | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
    if (user) {
      orgId = user.orgId;
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
    orgId = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    orgId,
  };
}
