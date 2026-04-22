import { Handle, Position } from "@xyflow/react";
import { ComponentIcon } from "./icons.jsx";

export const stageKeyMap = {
  エッジ: "edge",
  流量制御: "control",
  サービス: "service",
  保存: "storage",
  非同期: "async",
  データ分散: "partition"
};

export function ComponentNode({ data }) {
  return (
    <div className={`canvas-node stage-${data.stageKey}`}>
      <Handle type="target" position={Position.Left} />
      <div className="canvas-node-icon">
        <ComponentIcon componentId={data.componentId} size={48} />
      </div>
      <div className="canvas-node-label">
        <strong>{data.name}</strong>
        <small>{data.stage}</small>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export const nodeTypes = { component: ComponentNode };
