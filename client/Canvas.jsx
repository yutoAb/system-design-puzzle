import { useCallback, useMemo, useRef } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow
} from "@xyflow/react";
import { ComponentIcon } from "./icons.jsx";

function ComponentNode({ data }) {
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

const nodeTypes = { component: ComponentNode };

const stageKeyMap = {
  エッジ: "edge",
  流量制御: "control",
  サービス: "service",
  保存: "storage",
  非同期: "async",
  データ分散: "partition"
};

export function Canvas({
  nodes,
  edges,
  setNodes,
  setEdges,
  components,
  challenge,
  placedCost,
  onSubmit,
  onReset
}) {
  const wrapperRef = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes) => setNodes((current) => applyNodeChanges(changes, current)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((current) => applyEdgeChanges(changes, current)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => {
      if (connection.source === connection.target) {
        return;
      }
      setEdges((current) => {
        const duplicate = current.some(
          (edge) =>
            (edge.source === connection.source && edge.target === connection.target) ||
            (edge.source === connection.target && edge.target === connection.source)
        );
        if (duplicate) {
          return current;
        }
        return addEdge({ ...connection, type: "default" }, current);
      });
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData("application/component-id");
      if (!componentId) {
        return;
      }
      const component = components.find((item) => item.id === componentId);
      if (!component) {
        return;
      }
      if (nodes.some((node) => node.data.componentId === componentId)) {
        return;
      }
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
      const newNode = {
        id: componentId,
        type: "component",
        position,
        data: {
          componentId,
          name: component.name,
          stage: component.stage,
          stageKey: stageKeyMap[component.stage] ?? "service"
        }
      };
      setNodes((current) => [...current, newNode]);
    },
    [components, nodes, screenToFlowPosition, setNodes]
  );

  const requiredEdgeKeys = useMemo(() => {
    if (!challenge?.requiredConnections) {
      return new Set();
    }
    return new Set(
      challenge.requiredConnections.map(([a, b]) => (a < b ? `${a}|${b}` : `${b}|${a}`))
    );
  }, [challenge]);

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => {
        const key =
          edge.source < edge.target
            ? `${edge.source}|${edge.target}`
            : `${edge.target}|${edge.source}`;
        const isRequired = requiredEdgeKeys.has(key);
        return {
          ...edge,
          animated: isRequired,
          style: {
            stroke: isRequired ? "#1e7a4d" : "#1a5590",
            strokeWidth: 2
          }
        };
      }),
    [edges, requiredEdgeKeys]
  );

  const budget = challenge?.architectureBudget ?? 0;

  return (
    <div className="canvas-wrap" ref={wrapperRef}>
      <div className="board-overlay">
        <div className="budget">
          <span>アーキテクチャ予算</span>
          <strong>{placedCost}/{budget}</strong>
          <meter min={0} max={budget || 100} value={Math.min(placedCost, budget || 100)} />
        </div>
        <div className="actions">
          <button type="button" className="primary" onClick={onSubmit}>採点する</button>
          <button type="button" className="secondary-button" onClick={onReset}>配置を戻す</button>
        </div>
      </div>
      <div className="canvas" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} color="#d7ece4" />
          <Controls position="bottom-left" />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </div>
  );
}
