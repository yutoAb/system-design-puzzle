import { useState } from "react";
import { AccountBar } from "./AccountBar.jsx";

export function ChallengeSelect({
  challenges,
  auth,
  balance,
  mock,
  notice,
  purchaseError,
  onBuy,
  onStart
}) {
  const [durationMode, setDurationMode] = useState("short");
  const signedIn = Boolean(auth?.user);

  // モックはゲートなし。ログイン済みなら残高の有無で判定
  const startBlockedReason = mock
    ? null
    : signedIn && balance === 0
      ? "チケットがありません。面接1回につきチケット1枚が必要です"
      : auth?.enabled && !auth.loading && !signedIn
        ? "面接を始めるにはログインしてください"
        : null;

  return (
    <div className="select-screen">
      <header className="intro">
        <AccountBar auth={auth} balance={balance} onBuy={onBuy} />
        {notice && <p className="checkout-notice">{notice}</p>}
        {purchaseError && <p className="start-blocked">{purchaseError}</p>}
        <p className="eyebrow">システム設計 模擬面接</p>
        <h1>お題を選んで面接を始める</h1>
        <p className="prompt">
          AI面接官と音声で会話しながら、ホワイトボードにアーキテクチャを描いて設計面接の練習をします。面接は「要件確認 → 概要設計 → 深掘り → まとめ」の4ステップで進みます。
        </p>
        {startBlockedReason && (
          <p className="start-blocked">{startBlockedReason}</p>
        )}
        <div className="duration-toggle" role="radiogroup" aria-label="面接時間">
          <label className={durationMode === "short" ? "active" : ""}>
            <input
              type="radio"
              name="durationMode"
              value="short"
              checked={durationMode === "short"}
              onChange={() => setDurationMode("short")}
            />
            短縮版（約15分）
          </label>
          <label className={durationMode === "full" ? "active" : ""}>
            <input
              type="radio"
              name="durationMode"
              value="full"
              checked={durationMode === "full"}
              onChange={() => setDurationMode("full")}
            />
            フル（約40分）
          </label>
        </div>
      </header>
      <div className="challenge-cards">
        {challenges.map((challenge) => (
          <article key={challenge.id} className="challenge-card">
            <h2>{challenge.title}</h2>
            <p>{challenge.prompt}</p>
            <button
              type="button"
              className="primary"
              disabled={Boolean(startBlockedReason)}
              onClick={() => onStart(challenge.id, durationMode)}
            >
              この課題で面接を始める
            </button>
          </article>
        ))}
      </div>
      <footer className="site-footer">
        <nav>
          <a href="/legal/tokushoho.html" target="_blank" rel="noreferrer">
            特定商取引法に基づく表記
          </a>
          <a href="/legal/terms.html" target="_blank" rel="noreferrer">
            利用規約
          </a>
          <a href="/legal/privacy.html" target="_blank" rel="noreferrer">
            プライバシーポリシー
          </a>
        </nav>
        <p>
          運営: yutoAb ／ お問い合わせ:{" "}
          <a href="mailto:yuto27abe@gmail.com">yuto27abe@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}
