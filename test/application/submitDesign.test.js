import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSubmitDesign } from "../../src/application/submitDesign.js";

describe("createSubmitDesign", () => {
  it("submits a design for a known challenge", () => {
    const submitDesign = createSubmitDesign({
      challengeRepository: {
        findById: () => ({
          id: "video-streaming-1m",
          title: "Video Streaming at 1M Concurrent Viewers",
          requiredComponentIds: ["cdn"],
          scoringWeights: {
            availability: 1,
            latency: 1,
            scalability: 1,
            cost: 1,
            requirements: 1
          }
        })
      }
    });

    const result = submitDesign({
      challengeId: "video-streaming-1m",
      selectedComponentIds: ["cdn"]
    });

    assert.equal(result.challengeId, "video-streaming-1m");
    assert.equal(result.totalScore, 67);
  });

  it("passes connections through to the evaluator", () => {
    const submitDesign = createSubmitDesign({
      challengeRepository: {
        findById: () => ({
          id: "connected",
          title: "Connection Demo",
          requiredComponentIds: ["cdn", "object-storage"],
          requiredConnections: [["cdn", "object-storage"]],
          scoringWeights: {
            availability: 1,
            latency: 1,
            scalability: 1,
            cost: 1,
            requirements: 1
          }
        })
      }
    });

    const wired = submitDesign({
      challengeId: "connected",
      selectedComponentIds: ["cdn", "object-storage"],
      connections: [["cdn", "object-storage"]]
    });
    const unwired = submitDesign({
      challengeId: "connected",
      selectedComponentIds: ["cdn", "object-storage"]
    });

    assert.equal(wired.missingConnections.length, 0);
    assert.equal(unwired.missingConnections.length, 1);
    assert.ok(wired.totalScore > unwired.totalScore);
  });

  it("rejects an unknown challenge", () => {
    const submitDesign = createSubmitDesign({
      challengeRepository: {
        findById: () => undefined
      }
    });

    assert.throws(
      () =>
        submitDesign({
          challengeId: "missing",
          selectedComponentIds: []
        }),
      /Challenge not found/
    );
  });
});
