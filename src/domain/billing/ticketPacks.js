// チケットパック定義。Stripe の Price ID は環境変数で差し込む
export const TICKET_PACKS = {
  single: { tickets: 1, priceEnv: "STRIPE_PRICE_TICKET_1" },
  pack5: { tickets: 5, priceEnv: "STRIPE_PRICE_TICKET_5" }
};
