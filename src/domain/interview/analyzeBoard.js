// 候補者の図をコードで解析し、面接官が深掘りに使う材料を作る。
// AI は使わない。同じ図とお題からは必ず同じ結果になる。

// 図がこの数に満たないうちは、解析しても「全部足りない」になるだけなので何も返さない
export const MIN_COMPONENTS_FOR_ANALYSIS = 3;
const MAX_MISSING_RISKS = 3;

function nameOf(componentId, componentCatalog) {
  return (
    componentCatalog.find((component) => component.id === componentId)?.name ??
    componentId
  );
}

function degreeMap(componentIds, connections) {
  const degree = new Map(componentIds.map((id) => [id, 0]));
  for (const [from, to] of connections) {
    if (degree.has(from)) degree.set(from, degree.get(from) + 1);
    if (degree.has(to)) degree.set(to, degree.get(to) + 1);
  }
  return degree;
}

export function analyzeBoard(board, challenge, componentCatalog) {
  const componentIds = [...new Set(board?.componentIds ?? [])];
  const connections = board?.connections ?? [];
  const placed = new Set(componentIds);

  if (componentIds.length < MIN_COMPONENTS_FOR_ANALYSIS) {
    return {
      ready: false,
      isolated: [],
      missingRequired: [],
      missingRisks: [],
      failureCandidates: []
    };
  }

  const degree = degreeMap(componentIds, connections);

  const isolated = componentIds.filter((id) => degree.get(id) === 0);

  const missingRequired = (challenge.requiredComponentIds ?? []).filter(
    (id) => !placed.has(id)
  );

  const missingRisks = (challenge.recommendations ?? [])
    .filter((rec) => rec.risk && !placed.has(rec.componentId))
    .slice(0, MAX_MISSING_RISKS)
    .map((rec) => ({ componentId: rec.componentId, risk: rec.risk }));

  // 障害を起こす候補: つながりが多い（= 落ちたときの影響が広い）ピースから順に。
  // クライアントは候補者の設計対象ではないので除く。同数なら置いた順。
  const failureCandidates = componentIds
    .filter((id) => id !== "client" && degree.get(id) > 0)
    .sort((a, b) => degree.get(b) - degree.get(a))
    .slice(0, 3);

  return { ready: true, isolated, missingRequired, missingRisks, failureCandidates };
}

// 面接官に渡す文面。候補者には見せない前提で書く。
export function formatBoardAnalysis(analysis, componentCatalog) {
  if (!analysis.ready) {
    return "";
  }
  const lines = [];
  if (analysis.isolated.length > 0) {
    lines.push(
      `- どこにもつながっていないピース: ${analysis.isolated
        .map((id) => nameOf(id, componentCatalog))
        .join(" / ")}（役割とデータの流れを説明させる）`
    );
  }
  if (analysis.missingRequired.length > 0) {
    lines.push(
      `- このお題でまだ図にない主要なピース: ${analysis.missingRequired
        .map((id) => nameOf(id, componentCatalog))
        .join(" / ")}`
    );
  }
  for (const item of analysis.missingRisks) {
    lines.push(`- 見落としの可能性: ${item.risk}`);
  }
  if (analysis.failureCandidates.length > 0) {
    lines.push(
      `- 障害注入の候補（影響が広い順）: ${analysis.failureCandidates
        .map((id) => `${nameOf(id, componentCatalog)}(${id})`)
        .join(" / ")}`
    );
  }
  if (lines.length === 0) {
    return "";
  }
  return [
    "[面接官用メモ: 図の自動解析]",
    "候補者には見せない。答えを直接言わず、質問の形で気づかせること。",
    ...lines
  ].join("\n");
}
