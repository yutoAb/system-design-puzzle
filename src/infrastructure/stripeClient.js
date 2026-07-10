import Stripe from "stripe";

export const WEBHOOK_SIGNATURE_ERROR = "Webhook の署名検証に失敗しました";

export function createStripeClient({ secretKey, webhookSecret, mock = false }) {
  if (mock) {
    return {
      async createCheckoutSession({ successUrl }) {
        return {
          id: "cs_mock",
          url: successUrl.replace("{CHECKOUT_SESSION_ID}", "cs_mock")
        };
      },
      constructWebhookEvent(rawBody) {
        try {
          return JSON.parse(rawBody);
        } catch {
          throw new Error(WEBHOOK_SIGNATURE_ERROR);
        }
      }
    };
  }

  if (!secretKey) {
    return null;
  }

  const stripe = new Stripe(secretKey);

  return {
    async createCheckoutSession({
      priceId,
      userId,
      tickets,
      successUrl,
      cancelUrl
    }) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: userId,
        metadata: { user_id: userId, tickets: String(tickets) },
        success_url: successUrl,
        cancel_url: cancelUrl
      });
      return { id: session.id, url: session.url };
    },
    constructWebhookEvent(rawBody, signature) {
      try {
        return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch {
        throw new Error(WEBHOOK_SIGNATURE_ERROR);
      }
    }
  };
}
