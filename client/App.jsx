import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChallengeSelect } from "./ChallengeSelect.jsx";
import { InterviewScreen } from "./InterviewScreen.jsx";
import { ReportScreen } from "./ReportScreen.jsx";
import { useAuth } from "./useAuth.js";
import { useTickets } from "./useTickets.js";
import { MOCK_REPORT } from "./mockReport.js";

const isMockMode = new URLSearchParams(window.location.search).has("mock");

export function App() {
  const [screen, setScreen] = useState("select"); // select | interview | report
  const [challenges, setChallenges] = useState([]);
  const [components, setComponents] = useState([]);
  const [activeChallengeId, setActiveChallengeId] = useState(undefined);
  const [durationMode, setDurationMode] = useState("short");
  const [language, setLanguage] = useState("ja");
  const [strictMode, setStrictMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState(null);
  const auth = useAuth();
  const tickets = useTickets(auth.accessToken);
  const [checkoutNotice, setCheckoutNotice] = useState(null);
  const [checkoutReturned, setCheckoutReturned] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [canRetryEvaluation, setCanRetryEvaluation] = useState(false);
  // 評価に失敗しても面接をやり直さずに済むよう、送信内容を保持しておく
  const evaluationPayloadRef = useRef(null);

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
      setPurchasing(true);
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
        // 成功時は Stripe へ遷移するので、戻すのは失敗時だけ
        setPurchasing(false);
      }
    },
    [auth.accessToken]
  );

  const loadInitialState = useCallback(() => {
    setLoadError(false);
    fetch("/api/initial-state")
      .then((response) => {
        if (!response.ok) {
          throw new Error(String(response.status));
        }
        return response.json();
      })
      .then((data) => {
        setChallenges(data.challenges);
        setComponents(data.components);
      })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    loadInitialState();
  }, [loadInitialState]);

  const activeChallenge = useMemo(
    () => challenges.find((challenge) => challenge.id === activeChallengeId),
    [challenges, activeChallengeId]
  );

  const handleStart = useCallback((challengeId, mode, interviewLanguage, strict) => {
    setActiveChallengeId(challengeId);
    setDurationMode(mode);
    // デモの台本は日本語のみ
    setLanguage(isMockMode ? "ja" : (interviewLanguage ?? "ja"));
    setStrictMode(!isMockMode && Boolean(strict));
    setNotes("");
    setNodes([]);
    setEdges([]);
    setReport(null);
    setReportError(null);
    setCanRetryEvaluation(false);
    evaluationPayloadRef.current = null;
    setScreen("interview");
  }, []);

  const runEvaluation = useCallback(async () => {
    const payload = evaluationPayloadRef.current;
    if (!payload) {
      return;
    }
    setReport(null);
    setReportError(null);
    try {
      const headers = { "Content-Type": "application/json" };
      if (auth.accessToken) {
        headers.Authorization = `Bearer ${auth.accessToken}`;
      }
      const response = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? `評価に失敗しました (${response.status})`);
      }
      setReport(data);
    } catch (error) {
      setReportError(error.message);
      setCanRetryEvaluation(true);
    }
  }, [auth.accessToken]);

  const handleFinished = useCallback(
    async (transcript) => {
      setScreen("report");
      // デモは未ログインでも完走させたいので、評価 API を呼ばずサンプルを返す
      if (isMockMode) {
        setTimeout(() => setReport(MOCK_REPORT), 1200);
        return;
      }
      const spokenEntries = transcript.filter(
        (entry) => entry.text.trim() !== ""
      );
      if (spokenEntries.length === 0) {
        setReportError("評価できる会話がありませんでした");
        return;
      }
      evaluationPayloadRef.current = {
        challengeId: activeChallengeId,
        durationMode,
        language,
        transcript: spokenEntries.map(({ role, text, phase }) => ({
          role,
          text,
          phase
        })),
        board: {
          componentIds: [...new Set(nodes.map((node) => node.data.componentId))],
          connections: edges.map((edge) => [edge.source, edge.target]),
          notes
        }
      };
      await runEvaluation();
    },
    [activeChallengeId, durationMode, language, nodes, edges, notes, runEvaluation]
  );

  const handleRestart = useCallback(() => {
    setScreen("select");
    setNodes([]);
    setEdges([]);
    setReport(null);
    setReportError(null);
    tickets.refresh();
  }, [tickets.refresh]);

  if (loadError) {
    return (
      <div className="app-status">
        <p>お題を読み込めませんでした。通信状況を確認して、もう一度お試しください。</p>
        <button type="button" className="primary" onClick={loadInitialState}>
          再読み込み
        </button>
      </div>
    );
  }

  if (challenges.length === 0) {
    return <p className="app-status">読み込み中…</p>;
  }

  if (screen === "interview" && activeChallenge) {
    return (
      <InterviewScreen
        challenge={activeChallenge}
        components={components}
        durationMode={durationMode}
        language={language}
        strictMode={strictMode}
        notes={notes}
        setNotes={setNotes}
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
        mock={isMockMode}
        onRetry={canRetryEvaluation ? runEvaluation : undefined}
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
      notice={checkoutNotice}
      purchaseError={purchaseError}
      purchasing={purchasing}
      onBuy={handleBuy}
      onStart={handleStart}
    />
  );
}
