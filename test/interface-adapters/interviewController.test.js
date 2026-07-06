import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  ACCESS_CODE_ERROR,
  AUTH_ERROR,
  createInterviewController
} from "../../src/interface-adapters/interviewController.js";

afterEach(() => {
  delete process.env.ACCESS_CODE;
  delete process.env.MOCK_OPENAI;
  delete process.env.MOCK_AUTH;
});

describe("interviewController access code", () => {
  it("rejects session creation without the correct access code", async () => {
    process.env.ACCESS_CODE = "himitsu";
    process.env.MOCK_OPENAI = "1";
    const controller = createInterviewController();

    await assert.rejects(
      controller.createInterviewSession({ challengeId: "video-streaming-1m" }),
      new RegExp(ACCESS_CODE_ERROR)
    );
    await assert.rejects(
      controller.createInterviewSession({
        challengeId: "video-streaming-1m",
        accessCode: "wrong"
      }),
      new RegExp(ACCESS_CODE_ERROR)
    );
    await assert.rejects(
      controller.evaluateInterview({
        challengeId: "video-streaming-1m",
        accessCode: "wrong",
        transcript: [{ role: "user", text: "x" }],
        board: { componentIds: [], connections: [] }
      }),
      new RegExp(ACCESS_CODE_ERROR)
    );
  });

  it("accepts the correct access code", async () => {
    process.env.ACCESS_CODE = "himitsu";
    process.env.MOCK_OPENAI = "1";
    const controller = createInterviewController();

    const session = await controller.createInterviewSession({
      challengeId: "video-streaming-1m",
      accessCode: "himitsu"
    });
    assert.equal(session.clientSecret, "ek_mock");
  });

  it("skips the check when ACCESS_CODE is not configured", async () => {
    process.env.MOCK_OPENAI = "1";
    const controller = createInterviewController();

    const session = await controller.createInterviewSession({
      challengeId: "video-streaming-1m"
    });
    assert.equal(session.clientSecret, "ek_mock");
  });
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

  it("me returns the authenticated user without a balance yet", async () => {
    process.env.MOCK_AUTH = "1";
    const controller = createInterviewController();

    const me = await controller.me("mock-token");
    assert.equal(me.email, "mock@example.com");
    assert.equal(me.balance, null);

    await assert.rejects(controller.me(undefined), new RegExp(AUTH_ERROR));
  });

  it("still honors the access code bypass while auth is enabled", async () => {
    process.env.ACCESS_CODE = "himitsu";
    process.env.MOCK_AUTH = "1";
    process.env.MOCK_OPENAI = "1";
    const controller = createInterviewController();

    const session = await controller.createInterviewSession({
      challengeId: "video-streaming-1m",
      accessCode: "himitsu"
    });
    assert.equal(session.clientSecret, "ek_mock");
  });
});
