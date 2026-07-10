import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildEvaluationPrompt,
  EVALUATION_REPORT_SCHEMA
} from "../../../src/domain/interview/buildEvaluationPrompt.js";
import { chatServiceChallenge } from "../../../src/domain/fixtures/challenges.js";

const transcript = [
  { id: "1", role: "assistant", text: "要件を確認しましょう", phase: "requirements", final: true },
  { id: "2", role: "user", text: "同時接続は10万を想定します", phase: "requirements", final: true }
];

describe("buildEvaluationPrompt", () => {
  const { input, jsonSchema } = buildEvaluationPrompt(
    chatServiceChallenge,
    transcript,
    "[ホワイトボード]\n配置済み: ロードバランサー"
  );

  it("embeds the challenge, rubric concepts, board, and transcript", () => {
    assert.match(input, /スマホゲームのフレンド＆ギルドチャット/);
    for (const concept of chatServiceChallenge.targetConcepts) {
      assert.ok(input.includes(concept), `missing concept: ${concept}`);
    }
    assert.match(input, /配置済み: ロードバランサー/);
    assert.match(input, /面接官: 要件を確認しましょう/);
    assert.match(input, /候補者: 同時接続は10万を想定します/);
  });

  it("returns a strict json schema with the report shape", () => {
    assert.equal(jsonSchema, EVALUATION_REPORT_SCHEMA);
    assert.equal(jsonSchema.strict, true);
    assert.deepEqual(jsonSchema.schema.required, [
      "overallGrade",
      "summary",
      "strengths",
      "improvements",
      "conceptCoverage",
      "phaseFeedback"
    ]);
    assert.deepEqual(jsonSchema.schema.properties.overallGrade.enum, [
      "S",
      "A",
      "B",
      "C",
      "D"
    ]);
  });
});
