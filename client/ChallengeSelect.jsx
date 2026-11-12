import { useState } from "react";
import { AccountBar } from "./AccountBar.jsx";

const STEPS = [
  {
    step: "1",
    label: "要件・スコープ確認",
    text: "面接官に質問して、規模や前提を自分で引き出します"
  },
  {
    step: "2",
    label: "概要設計",
    text: "ホワイトボードにコンポーネントを置き、全体像を説明します"
  },
  {
    step: "3",
    label: "深掘り",
    text: "ボトルネックや障害時の挙動を面接官に突っ込まれます"
  },
  {
    step: "4",
    label: "まとめ",
    text: "終了後、その場で評価レポートと模範解答が出ます"
  }
];

export function ChallengeSelect({
  challenges,
  auth,
  balance,
  mock,
  notice,
  purchaseError,
  purchasing,
  onBuy,
  onStart
}) {
  const [durationMode, setDurationMode] = useState("short");
  const [language, setLanguage] = useState("ja");
  const signedIn = Boolean(auth?.user);

  // モックはゲートなし。ログイン済みなら残高の有無で判定
  const startBlockedReason = mock
    ? null
    : signedIn && balance === 0
      ? "チケットがありません。面接1回につきチケット1枚が必要です"
      : auth?.enabled && !auth.loading && !signedIn
        ? "面接を始めるにはログインしてください"
        : null;

  // 未ログインの訪問者には、ログインを求める前に何が体験できるかを説明する
  const showPitch = !mock && Boolean(auth?.enabled) && !auth.loading && !signedIn;

  return (
    <div className="select-screen">
      <header className="intro">
        <AccountBar
          auth={auth}
          balance={balance}
          purchasing={purchasing}
          onBuy={onBuy}
        />
        {notice && <p className="checkout-notice">{notice}</p>}
        {purchaseError && <p className="start-blocked">{purchaseError}</p>}
        {mock && (
          <p className="demo-banner">
            デモモードです。面接官の応答はあらかじめ用意した台本で、マイクは使いません（約20秒で終わります）。
            <a href="/">通常モードに戻る</a>
          </p>
        )}
        <p className="eyebrow">システム設計 模擬面接</p>
        {showPitch ? (
          <>
            <div className="pitch-hero">
              <div>
                <h1>AI面接官と音声で、システム設計面接の練習を。</h1>
                <p className="prompt">
                  お題を選ぶと、AI面接官との音声面接が始まります。ホワイトボードにアーキテクチャを描きながら会話し、終了後にその場で評価レポートが出ます。読むだけの対策と違って、実際に説明する練習ができます。
                </p>
                <div className="pitch-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={auth.signInWithGoogle}
                  >
                    Googleでログインして始める
                  </button>
                  <a className="demo-link" href="?mock=1">
                    ログインなしでデモを見る
                  </a>
                </div>
              </div>
              <a className="pitch-preview" href="?mock=1">
                <img
                  src="/preview.jpg"
                  width="1250"
                  height="834"
                  alt="面接画面。左に要件と会話ログ、中央にアーキテクチャを描くホワイトボード、右に設計ピースが並ぶ"
                />
              </a>
            </div>
            <ol className="pitch-steps">
              {STEPS.map((item) => (
                <li key={item.step}>
                  <span className="pitch-step-number">{item.step}</span>
                  <strong>{item.label}</strong>
                  <small>{item.text}</small>
                </li>
              ))}
            </ol>
            <p className="pitch-note">
              登録時にチケットを1枚お渡しするので、初回は無料で面接できます。以降は面接1回につきチケット1枚（1枚
              ¥1,500 ／ 5枚パック ¥6,000）。マイクが使える PC 版の Chrome / Edge /
              Safari を推奨します。
            </p>
          </>
        ) : (
          <>
            <h1>お題を選んで面接を始める</h1>
            <p className="prompt">
              AI面接官と音声で会話しながら、ホワイトボードにアーキテクチャを描いて設計面接の練習をします。面接は「要件確認
              → 概要設計 → 深掘り → まとめ」の4ステップで進みます。
            </p>
          </>
        )}
        {/* 未ログイン時はランディングの案内で足りるので、警告と時間切替は出さない */}
        {startBlockedReason && !showPitch && (
          <p className="start-blocked">{startBlockedReason}</p>
        )}
        <div
          className="duration-toggle"
          role="radiogroup"
          aria-label="面接時間"
          hidden={showPitch}
        >
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
        {/* デモの台本は日本語だけなので、言語の切替は本番の面接でのみ出す */}
        {!mock && !showPitch && (
          <>
            <div
              className="duration-toggle"
              role="radiogroup"
              aria-label="面接の言語"
            >
              <label className={language === "ja" ? "active" : ""}>
                <input
                  type="radio"
                  name="language"
                  value="ja"
                  checked={language === "ja"}
                  onChange={() => setLanguage("ja")}
                />
                日本語で面接
              </label>
              <label className={language === "en" ? "active" : ""}>
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={language === "en"}
                  onChange={() => setLanguage("en")}
                />
                English で面接（講評は日本語）
              </label>
            </div>
            {language === "en" && (
              <p className="language-note">
                面接官は英語で話し、お題と要件も英語で表示されます。終了後のレポートは日本語で、設計の評価に加えて英語表現の言い換え例が付きます。
              </p>
            )}
          </>
        )}
      </header>
      <div className="challenge-cards">
        {challenges.map((challenge) => (
          <article key={challenge.id} className="challenge-card">
            <h2>{challenge.title}</h2>
            <p>{challenge.prompt}</p>
            {showPitch ? (
              <button
                type="button"
                className="primary"
                onClick={auth.signInWithGoogle}
              >
                ログインしてこの課題に挑戦する
              </button>
            ) : (
              <button
                type="button"
                className="primary"
                disabled={Boolean(startBlockedReason)}
                onClick={() => onStart(challenge.id, durationMode, language)}
              >
                {mock ? "この課題のデモを見る" : "この課題で面接を始める"}
              </button>
            )}
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
