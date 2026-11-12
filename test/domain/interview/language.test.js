import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEvaluationPrompt } from "../../../src/domain/interview/buildEvaluationPrompt.js";
import { buildInterviewerInstructions } from "../../../src/domain/interview/buildInterviewerInstructions.js";
import {
  localizeChallenge,
  localizeComponents,
  normalizeLanguage
} from "../../../src/domain/interview/language.js";
import { challenges } from "../../../src/domain/fixtures/challenges.js";
import { componentCatalog } from "../../../src/domain/fixtures/components.js";

const transcript = [{ role: "user", text: "I would add a cache.", phase: "high_level" }];

describe("interview language", () => {
  it("falls back to Japanese for unknown values", () => {
    assert.equal(normalizeLanguage("en"), "en");
    assert.equal(normalizeLanguage("fr"), "ja");
    assert.equal(normalizeLanguage(undefined), "ja");
  });

  it("every challenge has an English brief with the same number of requirements", () => {
    for (const challenge of challenges) {
      const brief = localizeChallenge(challenge, "en");
      assert.notEqual(brief.title, challenge.title, challenge.id);
      assert.match(brief.prompt, /^[\x20-\x7E]+$/, challenge.id);
      assert.equal(
        brief.functionalRequirements.length,
        challenge.functionalRequirements.length
      );
      assert.equal(
        brief.nonFunctionalRequirements.length,
        challenge.nonFunctionalRequirements.length
      );
    }
  });

  it("every component has an English name", () => {
    for (const component of localizeComponents(componentCatalog, "en")) {
      assert.match(component.name, /^[\x20-\x7E]+$/, component.id);
    }
    assert.equal(localizeComponents(componentCatalog, "ja"), componentCatalog);
  });

  it("tells the interviewer to speak English and gives the English brief", () => {
    const [challenge] = challenges;
    const instructions = buildInterviewerInstructions(challenge, componentCatalog, {
      language: "en"
    });
    assert.match(instructions, /常に英語で話す/);
    assert.doesNotMatch(instructions, /常に日本語で話す/);
    assert.ok(instructions.includes(challenge.en.prompt));
    assert.match(instructions, /Load Balancer/);
  });

  it("keeps the Japanese interview unchanged by default", () => {
    const [challenge] = challenges;
    const instructions = buildInterviewerInstructions(challenge, componentCatalog);
    assert.match(instructions, /常に日本語で話す/);
    assert.ok(instructions.includes(challenge.prompt));
  });

  it("adds English feedback to the evaluation only in English mode", () => {
    const [challenge] = challenges;
    const ja = buildEvaluationPrompt(challenge, transcript, "board");
    assert.equal(ja.jsonSchema.schema.properties.englishFeedback, undefined);

    const en = buildEvaluationPrompt(challenge, transcript, "board", {
      language: "en"
    });
    assert.ok(en.jsonSchema.schema.properties.englishFeedback);
    assert.ok(en.jsonSchema.schema.required.includes("englishFeedback"));
    assert.match(en.input, /この面接は英語で行われた/);
    assert.match(en.input, /レポートの文章はすべて日本語で書く/);
  });
});
