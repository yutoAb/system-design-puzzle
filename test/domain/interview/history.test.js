import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_HISTORY_ENTRIES,
  appendHistory,
  summarizeWeakConcepts
} from "../../../src/domain/interview/history.js";

function entry(coverage) {
  return {
    report: {
      conceptCoverage: Object.entries(coverage).map(([concept, covered]) => ({
        concept,
        covered,
        evidence: ""
      }))
    }
  };
}

describe("interview history", () => {
  it("keeps the newest entries first and drops the oldest beyond the limit", () => {
    let entries = [];
    for (let index = 0; index < MAX_HISTORY_ENTRIES + 5; index += 1) {
      entries = appendHistory(entries, { id: index });
    }
    assert.equal(entries.length, MAX_HISTORY_ENTRIES);
    assert.equal(entries[0].id, MAX_HISTORY_ENTRIES + 4);
    assert.equal(entries.at(-1).id, 5);
  });

  it("ranks concepts by how often they were missed", () => {
    const weak = summarizeWeakConcepts([
      entry({ キャッシュ: true, 容量見積もり: false, レート制限: false }),
      entry({ キャッシュ: true, 容量見積もり: false, レート制限: true }),
      entry({ キャッシュ: false, 容量見積もり: false })
    ]);
    assert.deepEqual(weak, [
      { concept: "容量見積もり", asked: 3, missed: 3 },
      { concept: "レート制限", asked: 2, missed: 1 },
      { concept: "キャッシュ", asked: 3, missed: 1 }
    ]);
  });

  it("omits concepts that were never missed and tolerates broken entries", () => {
    const weak = summarizeWeakConcepts([
      entry({ キャッシュ: true }),
      {},
      { report: {} },
      { report: { conceptCoverage: [{ covered: false }] } }
    ]);
    assert.deepEqual(weak, []);
  });

  it("respects the limit", () => {
    const weak = summarizeWeakConcepts(
      [entry({ a: false, b: false, c: false })],
      { limit: 2 }
    );
    assert.equal(weak.length, 2);
  });
});
