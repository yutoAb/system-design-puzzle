import { useMemo } from "react";
import { ComponentIcon } from "./icons.jsx";

export function Palette({ components, placedComponentIds, compact }) {
  const items = useMemo(
    () =>
      components.map((component) => ({
        ...component,
        isPlaced: placedComponentIds.has(component.id)
      })),
    [components, placedComponentIds]
  );

  const handleDragStart = (event, componentId) => {
    event.dataTransfer.setData("application/component-id", componentId);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="palette">
      <h2>設計ピース</h2>
      <p className="panel-copy">
        ピースをドラッグして、ホワイトボードにアーキテクチャを描きながら説明しましょう。
      </p>
      <div className="palette-list">
        {items.map((component) => (
          <article
            key={component.id}
            className={["component-option", component.isPlaced ? "placed" : ""]
              .filter(Boolean)
              .join(" ")}
            draggable={!component.isPlaced}
            onDragStart={(event) => handleDragStart(event, component.id)}
            title={component.isPlaced ? "配置済み" : "ドラッグしてボードに置く"}
          >
            <span className="component-option-icon">
              <ComponentIcon componentId={component.id} size={40} />
            </span>
            <span className="component-option-text">
              <strong>{component.name}</strong>
              <em>{component.stage}</em>
              {/* 本番仕様では、説明文が答えのヒントにならないよう名前だけにする */}
              {!compact && <small>{component.description}</small>}
            </span>
            {component.isPlaced && <span className="placed-badge">配置済み</span>}
          </article>
        ))}
      </div>
    </aside>
  );
}
