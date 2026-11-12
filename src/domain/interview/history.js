// 面接結果の履歴から、論点ごとの達成状況を集計する。
// AI は使わない単純な集計なので、同じ履歴からは同じ結果になる。

export const MAX_HISTORY_ENTRIES = 30;

// 新しい結果を先頭に足し、上限を超えた古い分を落とす
export function appendHistory(entries, entry) {
  return [entry, ...entries].slice(0, MAX_HISTORY_ENTRIES);
}

// 論点ごとに「何回問われ、何回落としたか」を数え、落とした割合が高い順に返す。
// 1 回も落としていない論点は含めない。
export function summarizeWeakConcepts(entries, { limit = 5 } = {}) {
  const stats = new Map();
  for (const entry of entries) {
    for (const item of entry?.report?.conceptCoverage ?? []) {
      if (typeof item?.concept !== "string") {
        continue;
      }
      const current = stats.get(item.concept) ?? { asked: 0, missed: 0 };
      current.asked += 1;
      if (!item.covered) {
        current.missed += 1;
      }
      stats.set(item.concept, current);
    }
  }
  return [...stats.entries()]
    .filter(([, value]) => value.missed > 0)
    .map(([concept, value]) => ({ concept, ...value }))
    .sort(
      (a, b) =>
        b.missed / b.asked - a.missed / a.asked ||
        b.missed - a.missed ||
        a.concept.localeCompare(b.concept, "ja")
    )
    .slice(0, limit);
}
