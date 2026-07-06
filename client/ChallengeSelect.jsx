import { useState } from "react";
import { AccountBar } from "./AccountBar.jsx";

export function ChallengeSelect({
  challenges,
  auth,
  accessCode,
  onAccessCodeChange,
  onStart
}) {
  const [durationMode, setDurationMode] = useState("short");
  const signedIn = Boolean(auth?.user);

  return (
    <div className="select-screen">
      <header className="intro">
        <AccountBar auth={auth} />
        <p className="eyebrow">システム設計 模擬面接</p>
        <h1>お題を選んで面接を始める</h1>
        <p className="prompt">
          AI面接官と音声で会話しながら、ホワイトボードにアーキテクチャを描いて設計面接の練習をします。面接は「要件確認 → 概要設計 → 深掘り → まとめ」の4ステップで進みます。
        </p>
        {!signedIn && (
          <div className="access-code">
            <label htmlFor="accessCode">アクセスコード</label>
            <input
              id="accessCode"
              type="password"
              value={accessCode}
              placeholder="共有されたコードを入力"
              onChange={(event) => onAccessCodeChange(event.target.value)}
              autoComplete="off"
            />
            <small>
              面接の開始にはログインするか、共有されたアクセスコードを入力してください
            </small>
          </div>
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
              onClick={() => onStart(challenge.id, durationMode)}
            >
              この課題で面接を始める
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
