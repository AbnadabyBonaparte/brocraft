/**
 * Stripe Integration for BROCRAFT
 * 
 * Handles checkout sessions for tier upgrades (MESTRE, CLUBE_BRO)
 * and webhook verification.
 */

import Stripe from "stripe";

// Tipos
export type TierType = "MESTRE" | "CLUBE_BRO";

// Configuração dos planos
export const STRIPE_PLANS: Record<TierType, { priceId: string; name: string; price: number }> = {
  MESTRE: {
    priceId: process.env.STRIPE_PRICE_MESTRE || "",
    name: "Plano MESTRE",
    price: 990, // R$ 9,90 em centavos
  },
  CLUBE_BRO: {
    priceId: process.env.STRIPE_PRICE_CLUBE_BRO || "",
    name: "Plano CLUBE BRO",
    price: 1990, // R$ 19,90 em centavos
  },
};

// Instância do Stripe (lazy initialization)
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-05-28.basil",
    });
  }
  return stripeInstance;
}

/**
 * Verifica se Stripe está configurado
 */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PRICE_MESTRE &&
    process.env.STRIPE_PRICE_CLUBE_BRO
  );
}

/**
 * Cria uma sessão de checkout para upgrade de tier
 */
export async function createCheckoutSessionForTier(
  userId: number,
  userEmail: string | null,
  tier: TierType
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const plan = STRIPE_PLANS[tier];

  if (!plan.priceId) {
    throw new Error(`Price ID não configurado para tier ${tier}`);
  }

  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    // Metadata para identificar o usuário e tier no webhook
    client_reference_id: userId.toString(),
    metadata: {
      userId: userId.toString(),
      tier: tier,
    },
    // Email do usuário (se disponível)
    customer_email: userEmail || undefined,
    // URLs de retorno
    success_url: `${frontendBaseUrl}/upgrade/sucesso?tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendBaseUrl}/upgrade/cancelado`,
    // Configurações adicionais
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  if (!session.url) {
    throw new Error("Stripe não retornou URL de checkout");
  }

  console.log(`[Stripe] Checkout session criada para user ${userId}, tier ${tier}`);

  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Verifica assinatura do webhook Stripe
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET não configurada");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Recupera detalhes de uma sessão de checkout
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Cancela uma subscription do Stripe
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.cancel(subscriptionId);
  console.log(`[Stripe] Subscription ${subscriptionId} cancelada`);
}

