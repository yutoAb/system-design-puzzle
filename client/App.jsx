import { useCallback, useEffect, useMemo, useState } from "react";
import { ChallengeSelect } from "./ChallengeSelect.jsx";
import { InterviewScreen } from "./InterviewScreen.jsx";
import { ReportScreen } from "./ReportScreen.jsx";
import { useAuth } from "./useAuth.js";
import { useTickets } from "./useTickets.js";

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
  const tickets = useTickets(auth.accessToken);
  const [checkoutNotice, setCheckoutNotice] = useState(null);
  const [checkoutReturned, setCheckoutReturned] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  // Stripe Checkout からの戻り: クエリを消してから残高反映を待つ
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) {
      return;
    }
    params.delete("checkout");
    params.delete("session_id");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    );
    if (checkout === "success") {
      setCheckoutNotice(
        "決済が完了しました。チケット残数への反映まで数秒かかることがあります"
      );
      setCheckoutReturned(true);
    }
  }, []);

  useEffect(() => {
    if (!checkoutReturned || !auth.accessToken) {
      return undefined;
    }
    // webhook 経由の付与が遅れることがあるので数回リトライして残高を取り直す
    const timers = [0, 2000, 4000, 8000].map((delay) =>
      setTimeout(() => tickets.refresh(), delay)
    );
    const clearNotice = setTimeout(() => setCheckoutNotice(null), 12000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(clearNotice);
    };
  }, [checkoutReturned, auth.accessToken, tickets.refresh]);

  const handleBuy = useCallback(
    async (packId) => {
      setPurchaseError(null);
      try {
        const response = await fetch("/api/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`
          },
          body: JSON.stringify({ packId })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            data.error ?? `購入手続きの開始に失敗しました (${response.status})`
          );
        }
        window.location.href = data.url;
      } catch (error) {
        setPurchaseError(error.message);
      }
    },
    [auth.accessToken]
  );

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
    tickets.refresh();
  }, [tickets.refresh]);

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
      balance={tickets.balance}
      mock={isMockMode}
      accessCode={accessCode}
      notice={checkoutNotice}
      purchaseError={purchaseError}
      onBuy={handleBuy}
      onAccessCodeChange={handleAccessCodeChange}
      onStart={handleStart}
    />
  );
}
