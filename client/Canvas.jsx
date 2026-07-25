import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useNodesInitialized,
  useReactFlow
} from "@xyflow/react";
import { nodeTypes, stageKeyMap } from "./ComponentNode.jsx";

export function Canvas({
  nodes,
  edges,
  setNodes,
  setEdges,
  components,
  mock,
  onReset
}) {
  const wrapperRef = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  // 追加直後のノードは寸法が未計測で、その状態では fitView が範囲を出せない
  const nodesInitialized = useNodesInitialized();

  // デモは自動配置なので、増えたピースが画面外に出ないよう都度収める
  useEffect(() => {
    if (!mock || nodes.length === 0) {
      return undefined;
    }
    const timer = setTimeout(
      () => fitView({ padding: 0.12, duration: 400 }),
      120
    );
    return () => clearTimeout(timer);
  }, [mock, nodes.length, nodesInitialized, fitView]);

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

  const onEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      setEdges((current) => current.filter((item) => item.id !== edge.id));
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

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style: { stroke: "#1a5590", strokeWidth: 2 }
      })),
    [edges]
  );

  return (
    <div className="canvas-wrap" ref={wrapperRef}>
      <div className="board-overlay">
        <p className="board-hint">
          {mock
            ? "デモでは会話に合わせてピースが自動で配置されます（自分でドラッグすることもできます）"
            : "接続線はクリックすると削除できます"}
        </p>
        <div className="actions">
          <button type="button" className="secondary-button" onClick={onReset}>
            配置を戻す
          </button>
        </div>
      </div>
      <div className="canvas" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView={false}
          // デモの自動配置は横に広い構成になるため、最初から引いた画角で始める
          defaultViewport={
            mock ? { x: 24, y: 60, zoom: 0.7 } : { x: 0, y: 0, zoom: 1 }
          }
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
