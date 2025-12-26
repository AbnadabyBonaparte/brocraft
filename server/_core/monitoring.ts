/**
 * Monitoring & Error Tracking Module for BROCRAFT
 * 
 * Integração com Sentry para error tracking em produção.
 * Graceful degradation se Sentry não estiver configurado.
 * 
 * ENVs necessárias:
 * - SENTRY_DSN: DSN do projeto Sentry
 * - ENABLE_SENTRY: "true" para habilitar
 */

import * as Sentry from "@sentry/node";
import { Express } from "express";
import { ENV } from "./env";

let sentryInitialized = false;

/**
 * Inicializa o Sentry se configurado
 */
export function initMonitoring(): void {
  const sentryDsn = process.env.SENTRY_DSN;
  const enableSentry = process.env.ENABLE_SENTRY === "true";

  if (!enableSentry || !sentryDsn) {
    console.log("[BROCRAFT][Monitoring] Sentry DISABLED (ENABLE_SENTRY or SENTRY_DSN not set)");
    return;
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: ENV.isProduction ? "production" : "development",
      tracesSampleRate: ENV.isProduction ? 0.1 : 1.0, // 10% em prod, 100% em dev
      profilesSampleRate: ENV.isProduction ? 0.1 : 0,
      integrations: [
        // Integração com Node.js
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
      ],
    });

    sentryInitialized = true;
    console.log("[BROCRAFT][Monitoring] Sentry ENABLED");
  } catch (error) {
    console.error("[BROCRAFT][Monitoring] Failed to initialize Sentry:", error);
  }
}

/**
 * Middleware de error handler do Sentry para Express
 */
export function getSentryErrorHandler() {
  if (!sentryInitialized) {
    // Retorna um handler vazio se Sentry não está ativo
    return (err: Error, req: any, res: any, next: any) => next(err);
  }
  return Sentry.expressErrorHandler();
}

/**
 * Captura um erro manualmente
 */
export function captureError(error: Error, context?: Record<string, any>): void {
  if (!sentryInitialized) {
    console.error("[BROCRAFT][Monitoring] Error (Sentry disabled):", error.message);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Captura uma mensagem
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  if (!sentryInitialized) {
    console.log(`[BROCRAFT][Monitoring] ${level.toUpperCase()}: ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Define contexto do usuário para tracking
 */
export function setUserContext(userId: number, email?: string): void {
  if (!sentryInitialized) return;

  Sentry.setUser({
    id: String(userId),
    email,
  });
}

/**
 * Limpa contexto do usuário
 */
export function clearUserContext(): void {
  if (!sentryInitialized) return;
  Sentry.setUser(null);
}

/**
 * Verifica se o monitoring está ativo
 */
export function isMonitoringEnabled(): boolean {
  return sentryInitialized;
}




