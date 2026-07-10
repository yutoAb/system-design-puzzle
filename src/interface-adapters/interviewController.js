import { createCreateInterviewSession } from "../application/createInterviewSession.js";
import { createEvaluateInterview, DEFAULT_EVAL_MODEL } from "../application/evaluateInterview.js";
import { createListChallenges } from "../application/listChallenges.js";
import { createListComponents } from "../application/listComponents.js";
import { createInMemoryChallengeRepository } from "../infrastructure/inMemoryChallengeRepository.js";
import { createInMemoryComponentRepository } from "../infrastructure/inMemoryComponentRepository.js";
import { createOpenAiClient } from "../infrastructure/openAiClient.js";
import {
  AUTH_ERROR,
  createSupabaseAuthGateway
} from "../infrastructure/supabaseAuthGateway.js";
import {
  NO_TICKET_ERROR,
  createSupabaseTicketGateway
} from "../infrastructure/supabaseTicketGateway.js";
import {
  WEBHOOK_SIGNATURE_ERROR,
  createStripeClient
} from "../infrastructure/stripeClient.js";
import { TICKET_PACKS } from "../domain/billing/ticketPacks.js";

export const CHECKOUT_UNAVAILABLE_ERROR = "決済が有効になっていません";
export const UNKNOWN_PACK_ERROR = "不明なチケットパックです";
export { AUTH_ERROR, NO_TICKET_ERROR, WEBHOOK_SIGNATURE_ERROR };

export function createInterviewController() {
  const challengeRepository = createInMemoryChallengeRepository();
  const componentRepository = createInMemoryComponentRepository();
  const openAiClient = createOpenAiClient({
    apiKey: process.env.OPENAI_API_KEY,
    mock: process.env.MOCK_OPENAI === "1"
  });
  const authGateway = createSupabaseAuthGateway({
    url: process.env.SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    mock: process.env.MOCK_AUTH === "1"
  });
  const ticketGateway = createSupabaseTicketGateway({
    url: process.env.SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    mock: process.env.MOCK_AUTH === "1"
  });
  const stripeClient = createStripeClient({
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    mock: process.env.MOCK_STRIPE === "1"
  });
  const appBaseUrl = process.env.APP_BASE_URL ?? "http://localhost:5173";

  // OpenAI を呼ぶ（= 課金が発生する）エンドポイントを守る。
  // Supabase 未設定（ローカル開発）ならゲートなしで通す。
  async function authorize(authToken) {
    if (authGateway) {
      return authGateway.verifyToken(authToken);
    }
    return null;
  }

  const listChallenges = createListChallenges({ challengeRepository });
  const listComponents = createListComponents({ componentRepository });
  const createInterviewSession = createCreateInterviewSession({
    challengeRepository,
    componentRepository,
    openAiClient
  });
  const evaluateInterview = createEvaluateInterview({
    challengeRepository,
    componentRepository,
    openAiClient,
    evalModel: process.env.EVAL_MODEL ?? DEFAULT_EVAL_MODEL
  });

  return {
    initialState() {
      return {
        challenges: listChallenges(),
        components: listComponents()
      };
    },
    async me(authToken) {
      if (!authGateway) {
        throw new Error(AUTH_ERROR);
      }
      const user = await authGateway.verifyToken(authToken);
      const balance = ticketGateway
        ? await ticketGateway.getBalance(user.userId)
        : null;
      return { userId: user.userId, email: user.email, balance };
    },
    async createInterviewSession(requestBody, authToken) {
      const user = await authorize(authToken);
      if (user && ticketGateway) {
        await ticketGateway.consumeTicket(user.userId);
        try {
          return await createInterviewSession(requestBody ?? {});
        } catch (error) {
          // OpenAI 側の失敗でチケットだけ減るのを防ぐ（ベストエフォート返金）
          await ticketGateway
            .grantTickets({ userId: user.userId, amount: 1, reason: "admin_grant" })
            .catch(() => {});
          throw error;
        }
      }
      return createInterviewSession(requestBody ?? {});
    },
    async evaluateInterview(requestBody, authToken) {
      await authorize(authToken);
      return evaluateInterview(requestBody ?? {});
    },
    async createCheckout(requestBody, authToken) {
      if (!authGateway || !stripeClient) {
        throw new Error(CHECKOUT_UNAVAILABLE_ERROR);
      }
      const user = await authGateway.verifyToken(authToken);
      const pack = TICKET_PACKS[requestBody?.packId];
      if (!pack) {
        throw new Error(UNKNOWN_PACK_ERROR);
      }
      const session = await stripeClient.createCheckoutSession({
        priceId: process.env[pack.priceEnv],
        userId: user.userId,
        tickets: pack.tickets,
        successUrl: `${appBaseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${appBaseUrl}/?checkout=cancel`
      });
      return { url: session.url };
    },
    async handleStripeWebhook({ rawBody, signature }) {
      if (!stripeClient || !ticketGateway) {
        throw new Error(CHECKOUT_UNAVAILABLE_ERROR);
      }
      const event = stripeClient.constructWebhookEvent(rawBody, signature);
      if (event?.type === "checkout.session.completed") {
        const session = event.data?.object ?? {};
        const userId = session.metadata?.user_id ?? session.client_reference_id;
        const tickets = Number(session.metadata?.tickets ?? "0");
        if (session.payment_status === "paid" && userId && tickets > 0) {
          await ticketGateway.grantTickets({
            userId,
            amount: tickets,
            reason: "purchase",
            stripeEventId: event.id
          });
        }
      }
      return { received: true };
    }
  };
}
