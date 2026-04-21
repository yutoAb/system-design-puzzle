import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluateDesign } from "../../src/domain/evaluateDesign.js";
import { videoStreamingChallenge } from "../../src/domain/fixtures/challenges.js";

describe("evaluateDesign", () => {
  it("scores a well balanced video streaming design highly", () => {
    const result = evaluateDesign(
      videoStreamingChallenge,
      [
        "cdn",
        "load-balancer",
        "application-service",
        "object-storage",
        "cache",
        "queue",
        "relational-database"
      ],
      [
        ["cdn", "object-storage"],
        ["load-balancer", "application-service"]
      ]
    );

    assert.equal(result.totalScore, 88);
    assert.equal(result.dimensionScores.requirements, 100);
    assert.equal(result.dimensionScores.scalability, 99);
    assert.equal(result.dimensionScores.latency, 90);
    assert.equal(result.architectureCost, 48);
    assert.ok(result.coveredConcepts.includes("CDN"));
    assert.ok(result.coveredConcepts.includes("キューイング"));
    assert.match(result.strengths.join("\n"), /CDN/);
    assert.ok(result.interviewNotes.some((note) => note.title === "トレードオフ"));
  });

  it("penalizes designs that miss core streaming components", () => {
    const result = evaluateDesign(videoStreamingChallenge, [
      "application-service",
      "relational-database"
    ]);

    assert.equal(result.totalScore, 33);
    assert.equal(result.dimensionScores.requirements, 30);
    assert.equal(result.dimensionScores.latency, 10);
    assert.ok(result.risks.some((risk) => risk.includes("CDN")));
    assert.ok(result.risks.some((risk) => risk.includes("オブジェクトストレージ")));
  });

  it("penalizes designs that exceed the architecture budget", () => {
    const result = evaluateDesign(videoStreamingChallenge, [
      "cdn",
      "load-balancer",
      "application-service",
      "object-storage",
      "cache",
      "queue",
      "relational-database",
      "db-replica",
      "rate-limiter",
      "consistent-hash",
      "key-value-store",
      "analytics-pipeline"
    ]);

    assert.equal(result.architectureCost, 86);
    assert.equal(result.dimensionScores.cost, 0);
    assert.ok(result.interviewNotes.some((note) => note.message.includes("86/70")));
  });

  it("deduplicates selected components before scoring", () => {
    const withDuplicates = evaluateDesign(videoStreamingChallenge, [
      "cdn",
      "cdn",
      "object-storage",
      "load-balancer",
      "application-service"
    ]);
    const withoutDuplicates = evaluateDesign(videoStreamingChallenge, [
      "cdn",
      "object-storage",
      "load-balancer",
      "application-service"
    ]);

    assert.deepEqual(withDuplicates, withoutDuplicates);
  });
});
