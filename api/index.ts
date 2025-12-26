/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a Vercel serverless function.
 * All API routes are handled here.
 */

import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { stripeWebhookRouter } from "../server/_core/stripeWebhook";
import { validateEnv, ENV } from "../server/_core/env";
import { generalRateLimiter } from "../server/_core/rateLimit";
import { initMonitoring, getSentryErrorHandler } from "../server/_core/monitoring";

// Track server start time for uptime calculation
const SERVER_START_TIME = Date.now();

// Version info
const APP_VERSION = "1.0.0";
const GIT_COMMIT = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || "unknown";

// Validate environment variables once on cold start
validateEnv();

// Initialize monitoring (Sentry) once on cold start
initMonitoring();

const app = express();

// Apply general rate limiting to all API routes
app.use(generalRateLimiter);

// =============================================
// STRIPE WEBHOOK (must be before body parser!)
// =============================================
app.use(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  (req: Request, _res: Response, next: NextFunction) => {
    (req as any).rawBody = req.body;
    next();
  },
  stripeWebhookRouter
);

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// =============================================
// HEALTH & VERSION ENDPOINTS
// =============================================
app.get("/api/health", (_req: Request, res: Response) => {
  try {
    const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
    res.json({
      status: "ok",
      uptime: uptimeSeconds,
      env: ENV.isProduction ? "production" : "development",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[BROCRAFT][HEALTH] Health check failed:", error);
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});

app.get("/api/version", (_req: Request, res: Response) => {
  res.json({
    app: "brocraft",
    version: APP_VERSION,
    commit: GIT_COMMIT,
    env: ENV.isProduction ? "production" : "development",
  });
});

// OAuth routes
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Sentry error handler
app.use(getSentryErrorHandler());

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[BROCRAFT][API] Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Export for Vercel
export default app;




