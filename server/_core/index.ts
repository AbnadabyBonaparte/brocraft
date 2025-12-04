import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { stripeWebhookRouter } from "./stripeWebhook";
import { validateEnv, ENV } from "./env";
import { generalRateLimiter, logRateLimitConfig } from "./rateLimit";
import { initMonitoring, getSentryErrorHandler } from "./monitoring";

// Track server start time for uptime calculation
const SERVER_START_TIME = Date.now();

// Version info (read from package.json or hardcoded)
const APP_VERSION = "1.0.0";
// TODO: [BETA] Populate GIT_COMMIT from CI/CD build process (e.g., process.env.GIT_COMMIT)
const GIT_COMMIT = process.env.GIT_COMMIT || "unknown";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Validate environment variables on startup
  validateEnv();
  
  // Initialize monitoring (Sentry)
  initMonitoring();
  
  // Log rate limit configuration
  logRateLimitConfig();
  
  const app = express();
  const server = createServer(app);
  
  // Apply general rate limiting to all API routes
  app.use("/api", generalRateLimiter);

  // =============================================
  // STRIPE WEBHOOK (must be before body parser!)
  // =============================================
  // Stripe webhook needs raw body for signature verification
  app.use(
    "/api/stripe",
    express.raw({ type: "application/json" }),
    (req, res, next) => {
      // Store raw body for webhook verification
      (req as any).rawBody = req.body;
      next();
    },
    stripeWebhookRouter
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // =============================================
  // HEALTH & VERSION ENDPOINTS (lightweight, no DB/Redis)
  // =============================================
  app.get("/api/health", (req, res) => {
    try {
      const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
      res.json({
        status: "ok",
        uptime: uptimeSeconds,
        env: ENV.isProduction ? "production" : "development",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[BROCRAFT][HEALTH] ❌ Health check failed:", error);
      res.status(500).json({ status: "error", message: "Health check failed" });
    }
  });

  app.get("/api/version", (req, res) => {
    res.json({
      app: "brocraft",
      version: APP_VERSION,
      commit: GIT_COMMIT,
      env: ENV.isProduction ? "production" : "development",
    });
  });

  // TODO: [PROD] Add /api/health/full endpoint with DB/Redis connectivity checks
  // for more comprehensive health monitoring in production

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Sentry error handler (must be before other error handlers)
  app.use(getSentryErrorHandler());

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
