import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  AUTH_ERROR,
  NO_TICKET_ERROR,
  createInterviewController
} from "../../src/interface-adapters/interviewController.js";

afterEach(() => {
  delete process.env.MOCK_OPENAI;
  delete process.env.MOCK_AUTH;
  delete process.env.MOCK_TICKET_BALANCE;
});

describe("interviewController auth", () => {
  it("rejects session creation without a bearer token", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_OPENAI = "1";
    const controller = createInterviewController();

    await assert.rejects(
      controller.createInterviewSession({ challengeId: "video-streaming-1m" }),
      new RegExp(AUTH_ERROR)
    );
    await assert.rejects(
      controller.evaluateInterview({
        challengeId: "video-streaming-1m",
        transcript: [{ role: "user", text: "x" }],
        board: { componentIds: [], connections: [] }
      }),
      new RegExp(AUTH_ERROR)
    );
  });

  it("accepts a valid bearer token", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_OPENAI = "1";
    const controller = createInterviewController();

    const session = await controller.createInterviewSession(
      { challengeId: "video-streaming-1m" },
      "mock-token"
    );
    assert.equal(session.clientSecret, "ek_mock");
  });

  it("me returns the authenticated user and ticket balance", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_TICKET_BALANCE = "3";
    const controller = createInterviewController();

    const me = await controller.me("mock-token");
    assert.equal(me.email, "mock@example.com");
    assert.equal(me.balance, 3);

    await assert.rejects(controller.me(undefined), new RegExp(AUTH_ERROR));
  });

  it("skips the gate entirely when Supabase is not configured", async () => {
    process.env.MOCK_OPENAI = "1";
    const controller = createInterviewController();

    const session = await controller.createInterviewSession({
      challengeId: "video-streaming-1m"
    });
    assert.equal(session.clientSecret, "ek_mock");
  });
});

describe("interviewController tickets", () => {
  it("consumes one ticket per interview start and rejects at zero", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_OPENAI = "1";
    process.env.MOCK_TICKET_BALANCE = "1";
    const controller = createInterviewController();

    const session = await controller.createInterviewSession(
      { challengeId: "video-streaming-1m" },
      "mock-token"
    );
    assert.equal(session.clientSecret, "ek_mock");

    const me = await controller.me("mock-token");
    assert.equal(me.balance, 0);

    await assert.rejects(
      controller.createInterviewSession(
        { challengeId: "video-streaming-1m" },
        "mock-token"
      ),
      new RegExp(NO_TICKET_ERROR)
    );
  });

  it("rejects immediately when the balance starts at zero", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_OPENAI = "1";
    process.env.MOCK_TICKET_BALANCE = "0";
    const controller = createInterviewController();

    await assert.rejects(
      controller.createInterviewSession(
        { challengeId: "video-streaming-1m" },
        "mock-token"
      ),
      new RegExp(NO_TICKET_ERROR)
    );
  });

  it("refunds the ticket when session creation fails after consumption", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_OPENAI = "1";
    process.env.MOCK_TICKET_BALANCE = "1";
    const controller = createInterviewController();

    await assert.rejects(
      controller.createInterviewSession(
        { challengeId: "does-not-exist" },
        "mock-token"
      ),
      /unknown challenge/
    );

    const me = await controller.me("mock-token");
    assert.equal(me.balance, 1);
  });

  it("does not consume tickets on evaluation", async () => {
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_OPENAI = "1";
    process.env.MOCK_TICKET_BALANCE = "1";
    const controller = createInterviewController();

    await controller.evaluateInterview(
      {
        challengeId: "video-streaming-1m",
        transcript: [{ role: "user", text: "x" }],
        board: { componentIds: [], connections: [] }
      },
      "mock-token"
    );

    const me = await controller.me("mock-token");
    assert.equal(me.balance, 1);
  });
});
