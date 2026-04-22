import { useCallback, useEffect, useMemo, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "./Canvas.jsx";
import { Palette } from "./Palette.jsx";
import { Requirements } from "./Requirements.jsx";
import { Scoreboard } from "./Scoreboard.jsx";

export function App() {
  const [challenges, setChallenges] = useState([]);
  const [components, setComponents] = useState([]);
  const [activeChallengeId, setActiveChallengeId] = useState(undefined);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [result, setResult] = useState(undefined);

  useEffect(() => {
    fetch("/api/initial-state")
      .then((response) => response.json())
      .then((data) => {
        setChallenges(data.challenges);
        setComponents(data.components);
        setActiveChallengeId(data.challenges[0]?.id);
      });
  }, []);

  const activeChallenge = useMemo(
    () => challenges.find((challenge) => challenge.id === activeChallengeId),
    [challenges, activeChallengeId]
  );

  const componentById = useCallback(
    (componentId) => components.find((component) => component.id === componentId),
    [components]
  );

  const resetBoard = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setResult(undefined);
  }, []);

  const handleChangeChallenge = useCallback((event) => {
    setActiveChallengeId(event.target.value);
    setNodes([]);
    setEdges([]);
    setResult(undefined);
  }, []);

  const handleSubmit = useCallback(async () => {
    const selectedComponentIds = [...new Set(nodes.map((node) => node.data.componentId))];
    const connections = edges.map((edge) => [edge.source, edge.target]);
    const response = await fetch("/api/submit-design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: activeChallengeId,
        selectedComponentIds,
        connections
      })
    });
    const data = await response.json();
    setResult(data);
  }, [activeChallengeId, edges, nodes]);

  const placedCost = useMemo(
    () =>
      nodes.reduce((total, node) => {
        const component = componentById(node.data.componentId);
        return total + (component?.effects.cost ?? 0);
      }, 0),
    [nodes, componentById]
  );

  if (!activeChallenge) {
    return <p style={{ padding: 32 }}>読み込み中…</p>;
  }

  return (
    <div className="layout">
      <header className="intro">
        <p className="eyebrow">システム設計パズル</p>
        <h1>{activeChallenge.title}</h1>
        <p className="prompt">{activeChallenge.prompt}</p>

        <div className="challenge-switch">
          <label htmlFor="challengeSelect">お題</label>
          <select
            id="challengeSelect"
            value={activeChallengeId}
            onChange={handleChangeChallenge}
          >
            {challenges.map((challenge) => (
              <option key={challenge.id} value={challenge.id}>
                {challenge.title}
              </option>
            ))}
          </select>
        </div>

        <ol className="howto">
          <li>
            <strong>1. ピースを置く</strong>：右のパレットから白キャンバスへドラッグ。
          </li>
          <li>
            <strong>2. 接続する</strong>：ピースの端のハンドルをドラッグして、別のピースへ線を引く。
          </li>
          <li>
            <strong>3. 採点する</strong>：必要な接続が揃うとスコアが上がる。
          </li>
        </ol>

        <Requirements challenge={activeChallenge} />
      </header>

      <main className="workspace">
        <ReactFlowProvider>
          <Canvas
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            components={components}
            challenge={activeChallenge}
            placedCost={placedCost}
            onSubmit={handleSubmit}
            onReset={resetBoard}
          />
          <Palette
            components={components}
            challenge={activeChallenge}
            placedComponentIds={new Set(nodes.map((node) => node.data.componentId))}
          />
        </ReactFlowProvider>
      </main>

      {result && (
        <section className="result" aria-live="polite">
          <Scoreboard
            result={result}
            componentById={componentById}
            challenge={activeChallenge}
            components={components}
          />
        </section>
      )}
    </div>
  );
}
