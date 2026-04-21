import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluateDesign } from "../../src/domain/evaluateDesign.js";
import {
  chatServiceChallenge,
  socialFeedChallenge,
  videoStreamingChallenge,
  challenges
} from "../../src/domain/fixtures/challenges.js";
import { componentCatalog } from "../../src/domain/fixtures/components.js";

const componentIds = new Set(componentCatalog.map((component) => component.id));

describe("challenges fixture", () => {
  it("exposes all three challenges", () => {
    const ids = challenges.map((challenge) => challenge.id);
    assert.deepEqual(ids, [
      videoStreamingChallenge.id,
      chatServiceChallenge.id,
      socialFeedChallenge.id
    ]);
  });

  for (const challenge of [
    videoStreamingChallenge,
    chatServiceChallenge,
    socialFeedChallenge
  ]) {
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
      });

      it("keeps each required connection between required components", () => {
        const required = new Set(challenge.requiredComponentIds);
        for (const [a, b] of challenge.requiredConnections ?? []) {
          assert.ok(
            required.has(a),
            `${challenge.id}: connection source ${a} should be a required component`
          );
          assert.ok(
            required.has(b),
            `${challenge.id}: connection target ${b} should be a required component`
          );
        }
      });

      it("scores perfectly when the full required design and wiring is submitted", () => {
        const result = evaluateDesign(
          challenge,
          challenge.requiredComponentIds,
          challenge.requiredConnections ?? []
        );
        assert.equal(result.dimensionScores.requirements, 100);
        assert.equal(result.missingConnections.length, 0);
      });

      it("penalizes an empty submission", () => {
        const full = evaluateDesign(
          challenge,
          challenge.requiredComponentIds,
          challenge.requiredConnections ?? []
        );
        const empty = evaluateDesign(challenge, [], []);
        assert.ok(empty.totalScore < full.totalScore);
        assert.ok(empty.risks.length > 0);
      });
    });
  }

  it("chat challenge rewards realtime-specific reasoning", () => {
    const result = evaluateDesign(
      chatServiceChallenge,
      [...chatServiceChallenge.requiredComponentIds, "key-value-store", "cache"],
      chatServiceChallenge.requiredConnections
    );
    assert.ok(result.coveredConcepts.includes("WebSocket"));
    assert.ok(result.coveredConcepts.includes("Pub/Sub"));
    assert.match(result.strengths.join("\n"), /WebSocket/);
  });

  it("social feed challenge rewards fanout reasoning", () => {
    const result = evaluateDesign(
      socialFeedChallenge,
      [...socialFeedChallenge.requiredComponentIds, "queue", "db-replica"],
      socialFeedChallenge.requiredConnections
    );
    assert.ok(result.coveredConcepts.includes("ファンアウト"));
    assert.ok(result.coveredConcepts.includes("タイムライン生成"));
    assert.match(result.strengths.join("\n"), /ファンアウト/);
  });
});
