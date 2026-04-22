import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  applyNodeChanges
} from "@xyflow/react";
import { nodeTypes, stageKeyMap } from "./ComponentNode.jsx";

export function ReferenceView({ challenge, components }) {
  const layout = challenge.referenceLayout ?? {};
  const connections = challenge.referenceConnections ?? [];

  const initialNodes = useMemo(() => {
    return Object.entries(layout)
      .map(([componentId, position]) => {
        const component = components.find((item) => item.id === componentId);
        if (!component) {
          return null;
        }
        return {
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
      })
      .filter(Boolean);
  }, [layout, components]);

  const [nodes, setNodes] = useState(initialNodes);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const onNodesChange = useCallback(
    (changes) => setNodes((current) => applyNodeChanges(changes, current)),
    []
  );

  const edges = useMemo(
    () =>
      connections.map(([source, target], index) => ({
        id: `ref-${index}`,
        source,
        target,
        animated: true,
        style: { stroke: "#1e7a4d", strokeWidth: 2 }
      })),
    [connections]
  );

  if (nodes.length === 0) {
    return (
      <p className="panel-copy">このお題にはまだ模範解答が用意されていません。</p>
    );
  }

  return (
    <div className="reference-canvas">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          nodesConnectable={false}
          edgesFocusable={false}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} color="#d7ece4" />
          <Controls showInteractive={false} position="bottom-left" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
