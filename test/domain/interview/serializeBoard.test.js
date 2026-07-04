import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { serializeBoard } from "../../../src/domain/interview/serializeBoard.js";
import { componentCatalog } from "../../../src/domain/fixtures/components.js";

describe("serializeBoard", () => {
  it("serializes an empty board", () => {
    assert.equal(
      serializeBoard({ componentIds: [], connections: [] }, componentCatalog),
      "[ホワイトボード]\n配置済み: なし"
    );
  });

  it("serializes placed components and connections with catalog names", () => {
    const board = {
      componentIds: ["cdn", "load-balancer", "application-service"],
      connections: [
        ["cdn", "object-storage"],
        ["load-balancer", "application-service"]
      ]
    };
    assert.equal(
      serializeBoard(board, componentCatalog),
      [
        "[ホワイトボード]",
        "配置済み: CDN / ロードバランサー / アプリケーションサーバー",
        "接続: CDN → オブジェクトストレージ、ロードバランサー → アプリケーションサーバー"
      ].join("\n")
    );
  });

  it("falls back to the raw id for unknown components", () => {
    assert.equal(
      serializeBoard(
        { componentIds: ["mystery"], connections: [] },
        componentCatalog
      ),
      "[ホワイトボード]\n配置済み: mystery"
    );
  });
});
