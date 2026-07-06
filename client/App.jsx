import { useCallback, useEffect, useMemo, useState } from "react";
import { ChallengeSelect } from "./ChallengeSelect.jsx";
import { InterviewScreen } from "./InterviewScreen.jsx";
import { ReportScreen } from "./ReportScreen.jsx";
import { useAuth } from "./useAuth.js";

const isMockMode = new URLSearchParams(window.location.search).has("mock");

export function App() {
  const [screen, setScreen] = useState("select"); // select | interview | report
  const [challenges, setChallenges] = useState([]);
  const [components, setComponents] = useState([]);
  const [activeChallengeId, setActiveChallengeId] = useState(undefined);
  const [durationMode, setDurationMode] = useState("short");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [accessCode, setAccessCode] = useState(
    () => window.localStorage.getItem("interview-access-code") ?? ""
  );
  const auth = useAuth();

  const handleAccessCodeChange = useCallback((value) => {
    setAccessCode(value);
    window.localStorage.setItem("interview-access-code", value);
  }, []);

  useEffect(() => {
    fetch("/api/initial-state")
      .then((response) => response.json())
      .then((data) => {
        setChallenges(data.challenges);
        setComponents(data.components);
      });
  }, []);

  const activeChallenge = useMemo(
    () => challenges.find((challenge) => challenge.id === activeChallengeId),
    [challenges, activeChallengeId]
  );

  const handleStart = useCallback((challengeId, mode) => {
    setActiveChallengeId(challengeId);
    setDurationMode(mode);
    setNodes([]);
    setEdges([]);
    setReport(null);
    setReportError(null);
    setScreen("interview");
  }, []);

  const handleFinished = useCallback(
    async (transcript) => {
      setScreen("report");
      const spokenEntries = transcript.filter(
        (entry) => entry.text.trim() !== ""
      );
      if (spokenEntries.length === 0) {
        setReportError("評価できる会話がありませんでした");
        return;
      }
      try {
        const headers = { "Content-Type": "application/json" };
        if (auth.accessToken) {
          headers.Authorization = `Bearer ${auth.accessToken}`;
        }
        const response = await fetch("/api/evaluate-interview", {
          method: "POST",
          headers,
          body: JSON.stringify({
            challengeId: activeChallengeId,
            accessCode,
            durationMode,
            transcript: spokenEntries.map(({ role, text, phase }) => ({
              role,
              text,
              phase
            })),
            board: {
              componentIds: [
                ...new Set(nodes.map((node) => node.data.componentId))
              ],
              connections: edges.map((edge) => [edge.source, edge.target])
            }
          })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error ?? `評価に失敗しました (${response.status})`);
        }
        setReport(data);
      } catch (error) {
        setReportError(error.message);
      }
    },
    [activeChallengeId, durationMode, nodes, edges, accessCode, auth.accessToken]
  );

  const handleRestart = useCallback(() => {
    setScreen("select");
    setNodes([]);
    setEdges([]);
    setReport(null);
    setReportError(null);
  }, []);

  if (challenges.length === 0) {
    return <p style={{ padding: 32 }}>読み込み中…</p>;
  }

  if (screen === "interview" && activeChallenge) {
    return (
      <InterviewScreen
        challenge={activeChallenge}
        components={components}
        durationMode={durationMode}
        accessCode={accessCode}
        accessToken={auth.accessToken}
        mock={isMockMode}
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        onFinished={handleFinished}
      />
    );
  }

  if (screen === "report" && activeChallenge) {
    return (
      <ReportScreen
        report={report}
        error={reportError}
        challenge={activeChallenge}
        components={components}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <ChallengeSelect
      challenges={challenges}
      auth={auth}
      accessCode={accessCode}
      onAccessCodeChange={handleAccessCodeChange}
      onStart={handleStart}
    />
  );
}
