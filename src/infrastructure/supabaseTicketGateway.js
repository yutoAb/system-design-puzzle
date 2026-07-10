import { createClient } from "@supabase/supabase-js";

export const NO_TICKET_ERROR = "チケットが不足しています";

export function createSupabaseTicketGateway({ url, secretKey, mock = false }) {
  if (mock) {
    return createMockTicketGateway();
  }

  if (!url || !secretKey) {
    return null;
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return {
    async getBalance(userId) {
      const { data, error } = await supabase
        .from("ticket_balances")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        throw new Error(`残高の取得に失敗しました: ${error.message}`);
      }
      return data?.balance ?? 0;
    },
    async consumeTicket(userId) {
      const { data, error } = await supabase.rpc("consume_ticket", {
        p_user_id: userId
      });
      if (error) {
        throw new Error(`チケットの消費に失敗しました: ${error.message}`);
      }
      if (data === -1) {
        throw new Error(NO_TICKET_ERROR);
      }
      return data;
    },
    async grantTickets({ userId, amount, reason, stripeEventId = null }) {
      const { data, error } = await supabase.rpc("grant_tickets", {
        p_user_id: userId,
        p_amount: amount,
        p_reason: reason,
        p_stripe_event_id: stripeEventId
      });
      if (error) {
        throw new Error(`チケットの付与に失敗しました: ${error.message}`);
      }
      return data;
    }
  };
}

// MOCK_AUTH=1 用の in-memory 実装。DB の RPC と同じ意味論（不足時 throw、
// stripe_event_id の冪等化）をテストできるようにする。
function createMockTicketGateway() {
  const balances = new Map();
  const seenStripeEvents = new Set();
  const initialBalance = Number(process.env.MOCK_TICKET_BALANCE ?? "1");

  function currentBalance(userId) {
    if (!balances.has(userId)) {
      balances.set(userId, initialBalance);
    }
    return balances.get(userId);
  }

  return {
    async getBalance(userId) {
      return currentBalance(userId);
    },
    async consumeTicket(userId) {
      const balance = currentBalance(userId);
      if (balance < 1) {
        throw new Error(NO_TICKET_ERROR);
      }
      balances.set(userId, balance - 1);
      return balance - 1;
    },
    async grantTickets({ userId, amount, stripeEventId = null }) {
      if (stripeEventId !== null) {
        if (seenStripeEvents.has(stripeEventId)) {
          return currentBalance(userId);
        }
        seenStripeEvents.add(stripeEventId);
      }
      const balance = currentBalance(userId) + amount;
      balances.set(userId, balance);
      return balance;
    }
  };
}
