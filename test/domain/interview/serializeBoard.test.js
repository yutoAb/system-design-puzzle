import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_NOTES_LENGTH,
  serializeBoard
} from "../../../src/domain/interview/serializeBoard.js";
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

  it("appends the candidate's notes and caps their length", () => {
    const text = serializeBoard(
      { componentIds: [], connections: [], notes: "  QPS: 500k / 60 = 8.3k  " },
      componentCatalog
    );
    assert.equal(
      text,
      "[ホワイトボード]\n配置済み: なし\n[候補者のメモ]\nQPS: 500k / 60 = 8.3k"
    );

    const long = serializeBoard(
      { componentIds: [], connections: [], notes: "a".repeat(MAX_NOTES_LENGTH + 500) },
      componentCatalog
    );
    assert.equal(long.split("\n").at(-1).length, MAX_NOTES_LENGTH);
  });

  it("ignores empty or non-string notes", () => {
    for (const notes of ["", "   ", undefined, 42]) {
      assert.equal(
        serializeBoard({ componentIds: [], connections: [], notes }, componentCatalog),
        "[ホワイトボード]\n配置済み: なし"
      );
    }
  });
});
