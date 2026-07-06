import { useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { serializeBoard } from "../src/domain/interview/serializeBoard.js";
import { Canvas } from "./Canvas.jsx";
import { Palette } from "./Palette.jsx";
import { PhaseIndicator } from "./PhaseIndicator.jsx";
import { Requirements } from "./Requirements.jsx";
import { TranscriptPanel } from "./TranscriptPanel.jsx";
import { useRealtimeInterview } from "./useRealtimeInterview.js";

const STATUS_LABELS = {
  idle: "未接続",
  connecting: "接続中…",
  connected: "面接中",
  ended: "終了",
  error: "エラー"
};

// コスト暴走防止の上限。超えたら自動で面接を終了して評価へ進む
const MAX_SECONDS = { short: 20 * 60, full: 50 * 60 };
const REMAINING_WARNING_SECONDS = 5 * 60;

function formatElapsed(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export function InterviewScreen({
  challenge,
  components,
  durationMode,
  accessCode,
  accessToken,
  mock,
  nodes,
  edges,
  setNodes,
  setEdges,
  onFinished
}) {
  const {
    status,
    phase,
    transcript,
    micMuted,
    errorMessage,
    audioRef,
    connect,
    pushBoardSnapshot,
    toggleMic,
    endInterview
  } = useRealtimeInterview({ onEnded: onFinished });

  const [elapsed, setElapsed] = useState(0);
  const lastSnapshotRef = useRef("");
  const maxSeconds = MAX_SECONDS[durationMode] ?? MAX_SECONDS.full;
  const remaining = maxSeconds - elapsed;

  useEffect(() => {
    if (status !== "connected") {
      return undefined;
    }
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === "connected" && remaining <= 0) {
      endInterview();
    }
  }, [status, remaining, endInterview]);

  useEffect(() => {
    if (status !== "connected") {
      return undefined;
    }
    const timer = setTimeout(() => {
      const boardText = serializeBoard(
        {
          componentIds: [...new Set(nodes.map((node) => node.data.componentId))],
          connections: edges.map((edge) => [edge.source, edge.target])
        },
        components
      );
      if (boardText !== lastSnapshotRef.current) {
        lastSnapshotRef.current = boardText;
        pushBoardSnapshot(boardText);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, status, components, pushBoardSnapshot]);

  const resetBoard = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="interview-screen">
      <header className="interview-header">
        <div className="interview-title">
          <p className="eyebrow">システム設計 模擬面接{mock ? "（モック）" : ""}</p>
          <h1>{challenge.title}</h1>
        </div>
        <PhaseIndicator phase={phase} />
        <div className="interview-controls">
          <span className={`status-chip status-${status}`}>
            {STATUS_LABELS[status]}
            {status === "connected" &&
              (remaining <= REMAINING_WARNING_SECONDS
                ? ` 残り${formatElapsed(Math.max(remaining, 0))}`
                : ` ${formatElapsed(elapsed)}`)}
          </span>
          {status === "idle" || status === "error" ? (
            <button
              type="button"
              className="primary"
              onClick={() =>
                connect({
                  challengeId: challenge.id,
                  durationMode,
                  accessCode,
                  accessToken,
                  mock
                })
              }
            >
              マイクをオンにして面接開始
            </button>
          ) : (
            <>
              <button
                type="button"
                className="secondary-button"
                onClick={toggleMic}
                disabled={status !== "connected"}
              >
                {micMuted ? "ミュート解除" : "ミュート"}
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={endInterview}
                disabled={status === "ended"}
              >
                面接終了
              </button>
            </>
          )}
        </div>
      </header>

      {errorMessage && <p className="interview-error">{errorMessage}</p>}

      <div className="interview-body">
        <aside className="interview-side">
          <Requirements challenge={challenge} />
          <TranscriptPanel transcript={transcript} />
        </aside>
        <main className="workspace">
          <ReactFlowProvider>
            <Canvas
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              components={components}
              onReset={resetBoard}
            />
            <Palette
              components={components}
              placedComponentIds={
                new Set(nodes.map((node) => node.data.componentId))
              }
            />
          </ReactFlowProvider>
        </main>
      </div>

      <audio ref={audioRef} autoPlay />
    </div>
  );
}
