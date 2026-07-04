function componentName(componentId, componentCatalog) {
  const component = componentCatalog.find((entry) => entry.id === componentId);
  return component ? component.name : componentId;
}

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

  return lines.join("\n");
}
