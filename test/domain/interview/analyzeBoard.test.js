import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  analyzeBoard,
  formatBoardAnalysis
} from "../../../src/domain/interview/analyzeBoard.js";
import { buildRealtimeTools } from "../../../src/domain/interview/realtimeTools.js";
import { videoStreamingChallenge } from "../../../src/domain/fixtures/challenges.js";
import { componentCatalog } from "../../../src/domain/fixtures/components.js";

describe("analyzeBoard", () => {
  it("stays silent until the board has enough pieces to say something useful", () => {
    const analysis = analyzeBoard(
      { componentIds: ["client", "cdn"], connections: [["client", "cdn"]] },
      videoStreamingChallenge,
      componentCatalog
    );
    assert.equal(analysis.ready, false);
    assert.equal(formatBoardAnalysis(analysis, componentCatalog), "");
  });

  it("finds isolated pieces, missing required pieces and overlooked risks", () => {
    const analysis = analyzeBoard(
      {
        componentIds: ["client", "load-balancer", "application-service", "cache"],
        connections: [
          ["client", "load-balancer"],
          ["load-balancer", "application-service"]
        ]
      },
      videoStreamingChallenge,
      componentCatalog
    );
    assert.deepEqual(analysis.isolated, ["cache"]);
    assert.deepEqual(analysis.missingRequired, ["cdn", "object-storage"]);
    assert.ok(analysis.missingRisks.length > 0 && analysis.missingRisks.length <= 3);
    assert.ok(analysis.missingRisks.every((item) => item.componentId !== "cache"));
  });

  it("ranks failure candidates by how many connections they have, never the client", () => {
    const analysis = analyzeBoard(
      {
        componentIds: ["client", "load-balancer", "application-service", "cache", "relational-database"],
        connections: [
          ["client", "load-balancer"],
          ["load-balancer", "application-service"],
          ["application-service", "cache"],
          ["application-service", "relational-database"]
        ]
      },
      videoStreamingChallenge,
      componentCatalog
    );
    assert.equal(analysis.failureCandidates[0], "application-service");
    assert.ok(!analysis.failureCandidates.includes("client"));
    assert.equal(analysis.failureCandidates.length, 3);
  });

  it("is deterministic and formats a memo meant only for the interviewer", () => {
    const board = {
      componentIds: ["client", "load-balancer", "application-service"],
      connections: [["client", "load-balancer"]]
    };
    const first = formatBoardAnalysis(
      analyzeBoard(board, videoStreamingChallenge, componentCatalog),
      componentCatalog
    );
    const second = formatBoardAnalysis(
      analyzeBoard(board, videoStreamingChallenge, componentCatalog),
      componentCatalog
    );
    assert.equal(first, second);
    assert.match(first, /^\[面接官用メモ: 図の自動解析\]/);
    assert.match(first, /候補者には見せない/);
    assert.match(first, /アプリケーションサーバー/);
    assert.match(first, /ロードバランサー\(load-balancer\)/);
  });
});

describe("buildRealtimeTools", () => {
  it("lets the interviewer inject a failure only into known components", () => {
    const tools = buildRealtimeTools(componentCatalog);
    const inject = tools.find((tool) => tool.name === "inject_failure");
    assert.deepEqual(
      inject.parameters.properties.componentId.enum,
      componentCatalog.map((component) => component.id)
    );
    assert.deepEqual(
      tools.map((tool) => tool.name),
      ["advance_phase", "inject_failure", "end_interview"]
    );
  });
});
