/**
 * Centralized Environment Configuration for BROCRAFT
 * 
 * All environment variables should be accessed through this module.
 * Critical variables are validated on startup.
 */

export const ENV = {
  // Core App
  appId: process.env.VITE_APP_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  
  // Auth / Security
  cookieSecret: process.env.JWT_SECRET ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",
  
  // LLM / Forge API
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // Stripe (optional - graceful degradation if not set)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceMestre: process.env.STRIPE_PRICE_MESTRE ?? "",
  stripePriceClubeBro: process.env.STRIPE_PRICE_CLUBE_BRO ?? "",
  
  // Redis/Upstash (optional - graceful degradation if not set)
  upstashRedisUrl: process.env.UPSTASH_REDIS_URL ?? "",
  upstashRedisToken: process.env.UPSTASH_REDIS_TOKEN ?? "",
  
  // Monitoring (optional)
  sentryDsn: process.env.SENTRY_DSN ?? "",
  enableSentry: process.env.ENABLE_SENTRY === "true",
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
  rateLimitMaxChat: parseInt(process.env.RATE_LIMIT_MAX_CHAT || "30"),
  rateLimitMaxBilling: parseInt(process.env.RATE_LIMIT_MAX_BILLING || "10"),
  rateLimitMaxCommunity: parseInt(process.env.RATE_LIMIT_MAX_COMMUNITY || "60"),
  
  // URLs
  frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? "http://localhost:5173",
};

/**
 * Validates critical environment variables on startup.
 * Logs warnings for optional variables that are not set.
 */
export function validateEnv(): void {
  const critical: Array<{ key: string; value: string; name: string }> = [
    { key: "DATABASE_URL", value: ENV.databaseUrl, name: "Database" },
    { key: "JWT_SECRET", value: ENV.cookieSecret, name: "JWT Secret" },
  ];

  const optional: Array<{ key: string; value: string; name: string }> = [
    { key: "STRIPE_SECRET_KEY", value: ENV.stripeSecretKey, name: "Stripe" },
    { key: "UPSTASH_REDIS_URL", value: ENV.upstashRedisUrl, name: "Redis Cache" },
    { key: "BUILT_IN_FORGE_API_KEY", value: ENV.forgeApiKey, name: "LLM/Forge API" },
  ];

  // Check critical variables
  const missingCritical = critical.filter(v => !v.value);
  if (missingCritical.length > 0) {
    console.error("[BROCRAFT][ENV] ❌ Missing CRITICAL environment variables:");
    missingCritical.forEach(v => console.error(`  - ${v.key} (${v.name})`));
    // Don't throw in development to allow partial runs
    if (ENV.isProduction) {
      throw new Error("Missing critical environment variables");
    }
  }

  // Log warnings for optional variables
  const missingOptional = optional.filter(v => !v.value);
  if (missingOptional.length > 0) {
    console.warn("[BROCRAFT][ENV] ⚠️ Optional features disabled (missing env vars):");
    missingOptional.forEach(v => console.warn(`  - ${v.name} (${v.key})`));
  }

  console.log("[BROCRAFT][ENV] ✅ Environment validated");
}
