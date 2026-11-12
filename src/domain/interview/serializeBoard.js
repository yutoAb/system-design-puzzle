function componentName(componentId, componentCatalog) {
  const component = componentCatalog.find((entry) => entry.id === componentId);
  return component ? component.name : componentId;
}

// 候補者が書いたメモは面接官と評価にそのまま渡るので、長さに上限を設ける
export const MAX_NOTES_LENGTH = 4000;

export function serializeBoard(board, componentCatalog) {
  const componentIds = board?.componentIds ?? [];
  const connections = board?.connections ?? [];

  const placedLine =
    componentIds.length === 0
      ? "配置済み: なし"
      : `配置済み: ${componentIds
          .map((id) => componentName(id, componentCatalog))
          .join(" / ")}`;

  const lines = ["[ホワイトボード]", placedLine];

  if (connections.length > 0) {
    const connectionText = connections
      .map(
        ([from, to]) =>
          `${componentName(from, componentCatalog)} → ${componentName(to, componentCatalog)}`
      )
      .join("、");
    lines.push(`接続: ${connectionText}`);
  }

  const notes =
    typeof board?.notes === "string"
      ? board.notes.trim().slice(0, MAX_NOTES_LENGTH)
      : "";
  if (notes !== "") {
    lines.push("[候補者のメモ]", notes);
  }

  return lines.join("\n");
}
