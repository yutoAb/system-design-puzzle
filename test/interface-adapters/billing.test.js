import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  CHECKOUT_UNAVAILABLE_ERROR,
  UNKNOWN_PACK_ERROR,
  WEBHOOK_SIGNATURE_ERROR,
  createInterviewController
} from "../../src/interface-adapters/interviewController.js";

afterEach(() => {
  delete process.env.MOCK_AUTH;
  delete process.env.MOCK_STRIPE;
  delete process.env.MOCK_TICKET_BALANCE;
  delete process.env.APP_BASE_URL;
});

function checkoutCompletedEvent({
  eventId = "evt_1",
  userId = "00000000-0000-0000-0000-000000000001",
  tickets = 5,
  paymentStatus = "paid"
} = {}) {
  return JSON.stringify({
    id: eventId,
    type: "checkout.session.completed",
    data: {
      object: {
        payment_status: paymentStatus,
        client_reference_id: userId,
        metadata: { user_id: userId, tickets: String(tickets) }
      }
    }
  });
}

describe("interviewController billing", () => {
  it("creates a checkout session that returns to the app", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_STRIPE = "1";
    process.env.APP_BASE_URL = "https://example.test";
    const controller = createInterviewController();

    const checkout = await controller.createCheckout(
      { packId: "single" },
      "mock-token"
    );
    assert.match(checkout.url, /^https:\/\/example\.test\/\?checkout=success/);
    assert.match(checkout.url, /session_id=cs_mock/);
  });

  it("rejects an unknown pack id", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_STRIPE = "1";
    const controller = createInterviewController();

    await assert.rejects(
      controller.createCheckout({ packId: "mega" }, "mock-token"),
      new RegExp(UNKNOWN_PACK_ERROR)
    );
  });

  it("fails clearly when Stripe is not configured", async () => {
    process.env.MOCK_AUTH = "1";
    const controller = createInterviewController();

    await assert.rejects(
      controller.createCheckout({ packId: "single" }, "mock-token"),
      new RegExp(CHECKOUT_UNAVAILABLE_ERROR)
    );
  });

  it("grants tickets once per completed checkout event", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_STRIPE = "1";
    process.env.MOCK_TICKET_BALANCE = "0";
    const controller = createInterviewController();

    await controller.handleStripeWebhook({
      rawBody: checkoutCompletedEvent({ tickets: 5 }),
      signature: "sig"
    });
    let me = await controller.me("mock-token");
    assert.equal(me.balance, 5);

    // 同じ event.id の再送は加算しない（冪等）
    await controller.handleStripeWebhook({
      rawBody: checkoutCompletedEvent({ tickets: 5 }),
      signature: "sig"
    });
    me = await controller.me("mock-token");
    assert.equal(me.balance, 5);
  });

  it("ignores unpaid sessions and unrelated events", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_STRIPE = "1";
    process.env.MOCK_TICKET_BALANCE = "0";
    const controller = createInterviewController();

    await controller.handleStripeWebhook({
      rawBody: checkoutCompletedEvent({
        eventId: "evt_unpaid",
        paymentStatus: "unpaid"
      }),
      signature: "sig"
    });
    await controller.handleStripeWebhook({
      rawBody: JSON.stringify({ id: "evt_other", type: "charge.refunded" }),
      signature: "sig"
    });

    const me = await controller.me("mock-token");
    assert.equal(me.balance, 0);
  });

  it("rejects a webhook body that fails verification", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_STRIPE = "1";
    const controller = createInterviewController();

    await assert.rejects(
      controller.handleStripeWebhook({ rawBody: "not-json", signature: "sig" }),
      new RegExp(WEBHOOK_SIGNATURE_ERROR)
    );
  });
});
