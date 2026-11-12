import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  chatServiceChallenge,
  socialFeedChallenge,
  videoStreamingChallenge,
  challenges
} from "../../src/domain/fixtures/challenges.js";
import { componentCatalog } from "../../src/domain/fixtures/components.js";

const componentIds = new Set(componentCatalog.map((component) => component.id));

describe("challenges fixture", () => {
  it("exposes every challenge with a unique id, starting with the original three", () => {
    const ids = challenges.map((challenge) => challenge.id);
    assert.deepEqual(ids.slice(0, 3), [
      videoStreamingChallenge.id,
      chatServiceChallenge.id,
      socialFeedChallenge.id
    ]);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(ids.length, 5);
  });

  for (const challenge of challenges) {
    describe(`${challenge.id}`, () => {
      it("references only known components", () => {
        for (const componentId of challenge.requiredComponentIds) {
          assert.ok(
            componentIds.has(componentId),
            `unknown required component: ${componentId}`
          );
        }
        for (const componentId of challenge.recommendedComponentIds ?? []) {
          assert.ok(
            componentIds.has(componentId),
            `unknown recommended component: ${componentId}`
          );
        }
        for (const [a, b] of challenge.requiredConnections ?? []) {
          assert.ok(componentIds.has(a), `unknown connection endpoint: ${a}`);
          assert.ok(componentIds.has(b), `unknown connection endpoint: ${b}`);
        }
        for (const recommendation of challenge.recommendations ?? []) {
          assert.ok(
            componentIds.has(recommendation.componentId),
            `unknown recommendation target: ${recommendation.componentId}`
          );
        }
        for (const componentId of Object.keys(challenge.referenceLayout ?? {})) {
          assert.ok(
            componentIds.has(componentId),
            `unknown reference layout component: ${componentId}`
          );
        }
        for (const [a, b] of challenge.referenceConnections ?? []) {
          assert.ok(componentIds.has(a), `unknown reference endpoint: ${a}`);
          assert.ok(componentIds.has(b), `unknown reference endpoint: ${b}`);
        }
      });

      it("has the interviewer-facing fields the interview flow relies on", () => {
        assert.ok(challenge.title.length > 0);
        assert.ok(challenge.prompt.length > 0);
        assert.ok(challenge.functionalRequirements.length > 0);
        assert.ok(challenge.nonFunctionalRequirements.length > 0);
        assert.ok(challenge.targetConcepts.length > 0);
        assert.ok(challenge.recommendations.length > 0);
        assert.ok(challenge.interviewPrompts.length > 0);
        assert.ok(challenge.category.length > 0);
        // 模範解答の図は、必須のピースと接続をすべて含む
        for (const componentId of challenge.requiredComponentIds) {
          assert.ok(
            componentId in challenge.referenceLayout,
            `reference layout lacks required component: ${componentId}`
          );
        }
        for (const [a, b] of challenge.referenceConnections) {
          assert.ok(a in challenge.referenceLayout, `edge from unplaced: ${a}`);
          assert.ok(b in challenge.referenceLayout, `edge to unplaced: ${b}`);
        }
      });
    });
  }
});
