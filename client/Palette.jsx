import { useMemo } from "react";
import { ComponentIcon } from "./icons.jsx";

export function Palette({ components, challenge, placedComponentIds }) {
  const sorted = useMemo(() => {
    const requiredIds = new Set(challenge?.requiredComponentIds ?? []);
    const recommendedIds = new Set([
      ...(challenge?.requiredComponentIds ?? []),
      ...(challenge?.recommendedComponentIds ?? [])
    ]);
    return [...components]
      .map((component) => ({
        ...component,
        isRequired: requiredIds.has(component.id),
        isRecommended: recommendedIds.has(component.id),
        isPlaced: placedComponentIds.has(component.id)
      }))
      .sort((left, right) => {
        if (left.isRequired !== right.isRequired) {
          return left.isRequired ? -1 : 1;
        }
        if (left.isRecommended !== right.isRecommended) {
          return left.isRecommended ? -1 : 1;
        }
        return 0;
      });
  }, [components, challenge, placedComponentIds]);

  const handleDragStart = (event, componentId) => {
    event.dataTransfer.setData("application/component-id", componentId);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="palette">
      <h2>設計ピース</h2>
      <p className="panel-copy">
        ピースをドラッグして、左のキャンバスへ置きます。配置済みのピースだけが採点対象です。
      </p>
      <div className="palette-list">
        {sorted.map((component) => (
          <article
            key={component.id}
            className={[
              "component-option",
              component.isRequired ? "required" : "",
              component.isPlaced ? "placed" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            draggable={!component.isPlaced}
            onDragStart={(event) => handleDragStart(event, component.id)}
            title={component.isPlaced ? "配置済み" : "ドラッグしてキャンバスに置く"}
          >
            <span className="component-option-icon">
              <ComponentIcon componentId={component.id} size={40} />
            </span>
            <span className="component-option-text">
              <strong>
                {component.name}
                {component.isRequired ? " ★必須" : ""}
              </strong>
              <em>{component.stage}</em>
              <small>{component.description}</small>
            </span>
            {component.isPlaced && <span className="placed-badge">配置済み</span>}
          </article>
        ))}
      </div>
    </aside>
  );
}
