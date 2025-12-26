/**
 * Rate Limiting Module for BROCRAFT
 * 
 * Protege rotas críticas contra abuso.
 * Usa express-rate-limit com fallback em memória.
 * 
 * Rotas protegidas:
 * - Chat (mais restritivo)
 * - Billing/Stripe
 * - Community (posts, votos)
 */

import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { ENV } from "./env";

// Configuração via ENV ou defaults seguros
const RATE_LIMIT_CONFIG = {
  chat: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"), // 1 minuto
    max: parseInt(process.env.RATE_LIMIT_MAX_CHAT || "30"), // 30 reqs/min
  },
  billing: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
    max: parseInt(process.env.RATE_LIMIT_MAX_BILLING || "10"), // 10 reqs/min
  },
  community: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
    max: parseInt(process.env.RATE_LIMIT_MAX_COMMUNITY || "60"), // 60 reqs/min
  },
  general: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
    max: parseInt(process.env.RATE_LIMIT_MAX_GENERAL || "100"), // 100 reqs/min
  },
};

// Key generator: prefere userId, fallback para IP
function keyGenerator(req: Request): string {
  const userId = (req as any).userId || (req as any).user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  return `ip:${ip}`;
}

// Handler quando limite é atingido
function createLimitHandler(routeType: string) {
  return (req: Request, res: Response) => {
    const key = keyGenerator(req);
    console.log(`[BROCRAFT][RateLimit] type="${routeType}" key="${key}" exceeded`);
    
    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Muitas requisições. Por favor, aguarde um momento.",
        type: routeType,
      },
    });
  };
}

// Skip rate limiting em desenvolvimento (opcional)
function skipInDev(req: Request): boolean {
  return !ENV.isProduction && process.env.RATE_LIMIT_DEV !== "true";
}

// Rate limiters pré-configurados
export const chatRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.chat.windowMs,
  max: RATE_LIMIT_CONFIG.chat.max,
  keyGenerator,
  handler: createLimitHandler("chat"),
  skip: skipInDev,
  standardHeaders: true,
  legacyHeaders: false,
});

export const billingRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.billing.windowMs,
  max: RATE_LIMIT_CONFIG.billing.max,
  keyGenerator,
  handler: createLimitHandler("billing"),
  skip: skipInDev,
  standardHeaders: true,
  legacyHeaders: false,
});

export const communityRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.community.windowMs,
  max: RATE_LIMIT_CONFIG.community.max,
  keyGenerator,
  handler: createLimitHandler("community"),
  skip: skipInDev,
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.general.windowMs,
  max: RATE_LIMIT_CONFIG.general.max,
  keyGenerator,
  handler: createLimitHandler("general"),
  skip: skipInDev,
  standardHeaders: true,
  legacyHeaders: false,
});

// Log de configuração no startup
export function logRateLimitConfig(): void {
  if (ENV.isProduction) {
    console.log("[BROCRAFT][RateLimit] Rate limiting ENABLED");
    console.log(`  - Chat: ${RATE_LIMIT_CONFIG.chat.max} reqs/${RATE_LIMIT_CONFIG.chat.windowMs}ms`);
    console.log(`  - Billing: ${RATE_LIMIT_CONFIG.billing.max} reqs/${RATE_LIMIT_CONFIG.billing.windowMs}ms`);
    console.log(`  - Community: ${RATE_LIMIT_CONFIG.community.max} reqs/${RATE_LIMIT_CONFIG.community.windowMs}ms`);
  } else {
    console.log("[BROCRAFT][RateLimit] Rate limiting DISABLED in development");
    console.log("  Set RATE_LIMIT_DEV=true to enable in dev");
  }
}




