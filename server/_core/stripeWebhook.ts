/**
 * Stripe Webhook Handler for BROCRAFT
 * 
 * Handles Stripe events like checkout.session.completed
 * to update user tiers after successful payment.
 */

import { Router, Request, Response } from "express";
import { constructWebhookEvent } from "./stripe";
import * as db from "../db";
import type { TierType } from "./stripe";
import Stripe from "stripe";

export const stripeWebhookRouter = Router();

// IMPORTANT: This route must receive raw body, not parsed JSON
// The rawBodyMiddleware must be applied before this router
stripeWebhookRouter.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    console.error("[BROCRAFT][Stripe] ❌ Missing stripe-signature header");
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  // O body deve ser raw (Buffer)
  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    console.error("[BROCRAFT][Stripe] ❌ Missing raw body - ensure rawBodyMiddleware is applied");
    return res.status(400).json({ error: "Missing raw body" });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err: any) {
    console.error("[BROCRAFT][Stripe] ❌ Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  console.log(`[BROCRAFT][Stripe] 📩 Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }

      case "invoice.payment_failed": {
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      }

      default:
        console.log(`[BROCRAFT][Stripe] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[BROCRAFT][Stripe] ❌ Error processing event:", error);
    // Retornar 200 mesmo com erro para Stripe não reenviar
    // (o erro é interno, não do Stripe)
    res.status(200).json({ received: true, error: "Internal processing error" });
  }
});

/**
 * Handler para checkout.session.completed
 * Ativação do tier após pagamento bem-sucedido
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("[BROCRAFT][Stripe] 🛒 Processing checkout.session.completed");

  // Extrair dados da sessão
  const userId = session.client_reference_id || session.metadata?.userId;
  const tier = session.metadata?.tier as TierType | undefined;
  const subscriptionId = session.subscription as string | undefined;
  const customerId = session.customer as string | undefined;

  // Validar tier antes de aplicar
  const validTiers = ["MESTRE", "CLUBE_BRO"];
  if (!userId || !tier || !validTiers.includes(tier)) {
    console.error("[BROCRAFT][Stripe] ❌ Missing or invalid userId/tier in session metadata", {
      userId,
      tier,
      sessionId: session.id,
    });
    return;
  }

  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    console.error("[BROCRAFT][Stripe] ❌ Invalid userId:", userId);
    return;
  }

  // 1. Atualizar status da compra para COMPLETED
  await db.updatePurchaseStatus(
    session.id,
    "COMPLETED",
    subscriptionId,
    customerId
  );

  // 2. Atualizar tier do usuário
  await db.updateUserTier(userIdNum, tier);

  // [BROCRAFT][EVENT] Telemetria de upgrade de tier
  console.log(`[BROCRAFT][EVENT] type="tier_upgrade" userId=${userIdNum} newTier="${tier}" stripeSessionId="${session.id}"`);
  console.log(`[BROCRAFT][Stripe] ✅ User ${userIdNum} upgraded to ${tier}`);
}

/**
 * Handler para subscription.deleted
 * Downgrade para FREE quando assinatura é cancelada
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[BROCRAFT][Stripe] 🚫 Processing customer.subscription.deleted");

  const customerId = subscription.customer as string;
  
  // Buscar purchase pelo stripeCustomerId e fazer downgrade
  console.warn(`[BROCRAFT][Stripe] ⚠️ Subscription ${subscription.id} for customer ${customerId} was deleted`);
  
  // TODO: [BETA] Implementar downgrade automático quando assinatura é cancelada
  // Prioridade: MÉDIA - Precisa definir regra de negócio (downgrade imediato vs fim do período)
  // await db.downgradeUserByCustomerId(customerId);
}

/**
 * Handler para invoice.payment_failed
 * Log de falha de pagamento
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.warn("[BROCRAFT][Stripe] ❌ Processing invoice.payment_failed");
  
  const customerId = invoice.customer as string;
  console.warn(`[BROCRAFT][Stripe] ⚠️ Payment failed for customer ${customerId}, invoice ${invoice.id}`);
  
  // TODO: [BETA] Implementar notificação ao usuário sobre falha de pagamento
  // Prioridade: ALTA - Usuário precisa saber que o pagamento falhou
  // Opções: email, toast no app, ou flag no banco
}

