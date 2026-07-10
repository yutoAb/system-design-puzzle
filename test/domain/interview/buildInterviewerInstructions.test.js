import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildInterviewerInstructions } from "../../../src/domain/interview/buildInterviewerInstructions.js";
import { videoStreamingChallenge } from "../../../src/domain/fixtures/challenges.js";
import { componentCatalog } from "../../../src/domain/fixtures/components.js";

describe("buildInterviewerInstructions", () => {
  const instructions = buildInterviewerInstructions(
    videoStreamingChallenge,
    componentCatalog
  );

  it("embeds the challenge prompt and requirements", () => {
    assert.match(instructions, /オンライン予備校のライブ授業配信/);
    for (const req of videoStreamingChallenge.functionalRequirements) {
      assert.ok(instructions.includes(req), `missing requirement: ${req}`);
    }
    for (const req of videoStreamingChallenge.nonFunctionalRequirements) {
      assert.ok(instructions.includes(req), `missing requirement: ${req}`);
    }
  });

  it("describes all four phases with tool guidance", () => {
    assert.match(instructions, /要件・スコープ確認/);
    assert.match(instructions, /概要設計/);
    assert.match(instructions, /深掘り/);
    assert.match(instructions, /まとめ/);
    assert.match(instructions, /advance_phase/);
    assert.match(instructions, /end_interview/);
  });

  it("embeds the component catalog names and target concepts", () => {
    assert.match(instructions, /ロードバランサー/);
    assert.match(instructions, /コンシステントハッシュ/);
    for (const concept of videoStreamingChallenge.targetConcepts) {
      assert.ok(instructions.includes(concept), `missing concept: ${concept}`);
    }
  });

  it("pins Japanese and interview etiquette", () => {
    assert.match(instructions, /常に日本語で話す/);
    assert.match(instructions, /一度に1つの質問/);
  });

  it("adjusts total duration by mode", () => {
    assert.match(instructions, /約40分/);
    const short = buildInterviewerInstructions(
      videoStreamingChallenge,
      componentCatalog,
      { durationMode: "short" }
    );
    assert.match(short, /約15分/);
    assert.doesNotMatch(short, /約40分/);
  });
});
