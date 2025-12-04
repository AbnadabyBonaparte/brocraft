/**
 * BROCRAFT Analytics Module
 * 
 * Módulo centralizado para tracking de eventos de produto.
 * Atualmente loga em console, preparado para integração futura
 * com serviços como PostHog, Amplitude, Mixpanel, etc.
 * 
 * Eventos rastreados:
 * - rank_up: Usuário subiu de rank
 * - recipe_completed: Usuário completou uma receita
 * - post_created: Usuário criou post na comunidade
 * - tier_upgrade: Usuário fez upgrade de plano
 * - limit_reached: Usuário FREE atingiu limite diário
 * - badge_earned: Usuário desbloqueou um badge
 * - onboarding_step: Usuário completou etapa de onboarding
 */

// TODO: [PROD] Integrar com serviço de analytics real (PostHog, Amplitude, etc.)
// Para integrar:
// 1. Instalar SDK do serviço escolhido
// 2. Inicializar no initAnalytics()
// 3. Substituir console.log por chamada ao SDK em trackEvent()

interface EventPayload {
  userId?: number;
  [key: string]: any;
}

let analyticsEnabled = true;

/**
 * Inicializa o sistema de analytics
 */
export function initAnalytics(): void {
  // TODO: Inicializar SDK de analytics aqui
  console.log("[BROCRAFT][Analytics] Analytics initialized (console mode)");
}

/**
 * Função genérica de tracking de eventos
 */
export function trackEvent(eventName: string, payload: EventPayload): void {
  if (!analyticsEnabled) return;

  // Formato padronizado para logs de eventos
  const logParts = Object.entries(payload)
    .map(([key, value]) => {
      if (typeof value === "string") return `${key}="${value}"`;
      return `${key}=${value}`;
    })
    .join(" ");

  console.log(`[BROCRAFT][EVENT] type="${eventName}" ${logParts}`);

  // TODO: Enviar para serviço de analytics real
  // exemplo: posthog.capture(eventName, payload);
}

// ============================================
// HELPERS TIPADOS PARA EVENTOS ESPECÍFICOS
// ============================================

export function trackRankUp(
  userId: number,
  oldRank: string,
  newRank: string,
  totalXP: number
): void {
  trackEvent("rank_up", { userId, oldRank, newRank, totalXP });
}

export function trackRecipeCompleted(
  userId: number,
  recipeId: number,
  category: string,
  difficulty: string,
  xpAwarded: number
): void {
  trackEvent("recipe_completed", { userId, recipeId, category, difficulty, xpAwarded });
}

export function trackPostCreated(
  userId: number,
  postId: number,
  category: string
): void {
  trackEvent("post_created", { userId, postId, category });
}

export function trackTierUpgrade(
  userId: number,
  newTier: string,
  stripeSessionId?: string
): void {
  trackEvent("tier_upgrade", { userId, newTier, stripeSessionId: stripeSessionId || "N/A" });
}

export function trackLimitReached(
  userId: number,
  tier: string,
  dailyLimit: number,
  messagesUsed: number
): void {
  trackEvent("limit_reached", { userId, tier, dailyLimit, messagesUsed });
}

export function trackBadgeEarned(
  userId: number,
  badgeType: string,
  badgeName: string
): void {
  trackEvent("badge_earned", { userId, badgeType, badgeName });
}

export function trackOnboardingStep(
  userId: number,
  step: string,
  completed: boolean
): void {
  trackEvent("onboarding_step", { userId, step, completed });
}

export function trackChatMessage(
  userId: number,
  tier: string,
  messagesRemaining: number | null
): void {
  trackEvent("chat_message", { userId, tier, messagesRemaining: messagesRemaining ?? "unlimited" });
}

/**
 * Desabilita analytics (para testes, por exemplo)
 */
export function disableAnalytics(): void {
  analyticsEnabled = false;
}

/**
 * Habilita analytics
 */
export function enableAnalytics(): void {
  analyticsEnabled = true;
}


