import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluateDesign } from "../../src/domain/evaluateDesign.js";

const connectionChallenge = {
  id: "connection-demo",
  title: "接続デモ",
  prompt: "接続評価の挙動を確認するための最小チャレンジ。",
  functionalRequirements: [],
  nonFunctionalRequirements: [],
  architectureBudget: 50,
  requiredComponentIds: ["cdn", "load-balancer", "application-service", "object-storage"],
  recommendedComponentIds: [],
  requiredConnections: [
    ["cdn", "object-storage"],
    ["load-balancer", "application-service"]
  ],
  targetConcepts: [],
  interviewPrompts: [],
  scoringWeights: {
    availability: 1,
    latency: 1,
    scalability: 1,
    cost: 1,
    requirements: 1
  }
};

describe("evaluateDesign connections", () => {
  it("awards full requirements score when all components and connections are wired", () => {
    const result = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"],
      [
        ["cdn", "object-storage"],
        ["load-balancer", "application-service"]
      ]
    );

    assert.equal(result.dimensionScores.requirements, 100);
    assert.equal(result.missingConnections.length, 0);
    assert.equal(result.matchedConnections.length, 2);
  });

  it("penalizes requirements when components are placed but never wired", () => {
    const wired = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"],
      [
        ["cdn", "object-storage"],
        ["load-balancer", "application-service"]
      ]
    );
    const unwired = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"],
      []
    );

    assert.ok(
      unwired.dimensionScores.requirements < wired.dimensionScores.requirements,
      "unwired design should score lower than wired"
    );
    assert.equal(unwired.missingConnections.length, 2);
  });

  it("treats connections as undirected", () => {
    const forward = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"],
      [
        ["cdn", "object-storage"],
        ["load-balancer", "application-service"]
      ]
    );
    const reversed = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"],
      [
        ["object-storage", "cdn"],
        ["application-service", "load-balancer"]
      ]
    );

    assert.equal(forward.dimensionScores.requirements, reversed.dimensionScores.requirements);
    assert.equal(forward.matchedConnections.length, reversed.matchedConnections.length);
  });

  it("ignores connections that are not required", () => {
    const withExtra = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"],
      [
        ["cdn", "object-storage"],
        ["load-balancer", "application-service"],
        ["cdn", "application-service"]
      ]
    );
    const withoutExtra = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"],
      [
        ["cdn", "object-storage"],
        ["load-balancer", "application-service"]
      ]
    );

    assert.equal(withExtra.dimensionScores.requirements, withoutExtra.dimensionScores.requirements);
  });

  it("deduplicates connections before scoring", () => {
    const duplicated = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"],
      [
        ["cdn", "object-storage"],
        ["cdn", "object-storage"],
        ["object-storage", "cdn"],
        ["load-balancer", "application-service"]
      ]
    );

    assert.equal(duplicated.matchedConnections.length, 2);
  });

  it("ignores connections whose endpoints are not placed", () => {
    const result = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service"],
      [
        ["cdn", "object-storage"],
        ["load-balancer", "application-service"]
      ]
    );

    assert.ok(
      result.matchedConnections.every(([a, b]) =>
        ["cdn", "load-balancer", "application-service"].includes(a) &&
        ["cdn", "load-balancer", "application-service"].includes(b)
      ),
      "matched connections should only include placed endpoints"
    );
    assert.ok(result.missingConnections.length >= 1);
  });

  it("reports missing required connections as risks when both endpoints are placed", () => {
    const result = evaluateDesign(
      connectionChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"],
      [["load-balancer", "application-service"]]
    );

    assert.ok(
      result.risks.some((risk) => risk.includes("CDN") && risk.includes("オブジェクトストレージ")),
      `expected a risk about the missing CDN↔Object Storage wire, got: ${result.risks.join(" | ")}`
    );
  });

  it("treats challenges without requiredConnections as connection-agnostic", () => {
    const legacyChallenge = {
      ...connectionChallenge,
      requiredConnections: undefined
    };
    const result = evaluateDesign(
      legacyChallenge,
      ["cdn", "load-balancer", "application-service", "object-storage"]
    );

    assert.equal(result.dimensionScores.requirements, 100);
  });
});
