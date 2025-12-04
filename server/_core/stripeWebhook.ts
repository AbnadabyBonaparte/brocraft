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
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  // O body deve ser raw (Buffer)
  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    console.error("[Stripe Webhook] Missing raw body - ensure rawBodyMiddleware is applied");
    return res.status(400).json({ error: "Missing raw body" });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

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
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
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
  console.log("[Stripe Webhook] Processing checkout.session.completed");

  // Extrair dados da sessão
  const userId = session.client_reference_id || session.metadata?.userId;
  const tier = session.metadata?.tier as TierType | undefined;
  const subscriptionId = session.subscription as string | undefined;
  const customerId = session.customer as string | undefined;

  if (!userId || !tier) {
    console.error("[Stripe Webhook] Missing userId or tier in session metadata", {
      userId,
      tier,
      sessionId: session.id,
    });
    return;
  }

  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    console.error("[Stripe Webhook] Invalid userId:", userId);
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

  console.log(`[Stripe Webhook] ✅ User ${userIdNum} upgraded to ${tier}`);
}

/**
 * Handler para subscription.deleted
 * Downgrade para FREE quando assinatura é cancelada
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[Stripe Webhook] Processing customer.subscription.deleted");

  const customerId = subscription.customer as string;
  
  // Buscar purchase pelo stripeCustomerId e fazer downgrade
  // Por simplicidade, logamos o evento (implementar busca se necessário)
  console.log(`[Stripe Webhook] Subscription ${subscription.id} for customer ${customerId} was deleted`);
  
  // TODO: Implementar busca de usuário por stripeCustomerId e downgrade
  // await db.downgradeUserByCustomerId(customerId);
}

/**
 * Handler para invoice.payment_failed
 * Log de falha de pagamento
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("[Stripe Webhook] Processing invoice.payment_failed");
  
  const customerId = invoice.customer as string;
  console.warn(`[Stripe Webhook] Payment failed for customer ${customerId}, invoice ${invoice.id}`);
  
  // TODO: Implementar notificação ao usuário ou retry
}

