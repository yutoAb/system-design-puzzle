// Stripe の署名検証には JSON パース前の raw body が必要なため、
// このファイルだけ Vercel の Web ハンドラ形式（request.text() が使える）で書く。
import { createInterviewController } from "../src/interface-adapters/interviewController.js";

const interviewController = createInterviewController();

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  try {
    const result = await interviewController.handleStripeWebhook({
      rawBody,
      signature
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
