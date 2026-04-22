import { useState } from "react";
import { ReferenceView } from "./ReferenceView.jsx";

const dimensionLabels = {
  scalability: "スケール性",
  availability: "可用性",
  latency: "低レイテンシ",
  cost: "コスト効率",
  requirements: "要件充足"
};

export function Scoreboard({ result, componentById, challenge, components }) {
  const [showReference, setShowReference] = useState(false);
  const matched = result.matchedConnections ?? [];
  const missing = result.missingConnections ?? [];
  const formatPair = ([a, b]) =>
    `${componentById(a)?.name ?? a} ↔ ${componentById(b)?.name ?? b}`;

  return (
    <div className="scoreboard">
      <h2>スコア {result.totalScore}</h2>
      <p className="score-copy">
        予算 {result.architectureCost}/{result.budget}。接続が足りないと「つながりを説明して」と突っ込まれる部分です。
      </p>
      <div className="metrics">
        {Object.entries(result.dimensionScores).map(([label, score]) => (
          <div key={label}>
            <strong>{score}</strong>
            <span>{dimensionLabels[label] ?? label}</span>
          </div>
        ))}
      </div>

      {(matched.length > 0 || missing.length > 0) && (
        <div className="connection-coverage">
          <div>
            <h3>つながった経路 {matched.length}/{matched.length + missing.length}</h3>
            <ul className="connection-list matched">
              {matched.length === 0 ? (
                <li className="empty">まだ0本</li>
              ) : (
                matched.map((pair, index) => <li key={index}>{formatPair(pair)}</li>)
              )}
            </ul>
          </div>
          <div>
            <h3>未接続</h3>
            <ul className="connection-list missing">
              {missing.length === 0 ? (
                <li className="empty">なし</li>
              ) : (
                missing.map((pair, index) => <li key={index}>{formatPair(pair)}</li>)
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="feedback">
        <div>
          <h3>強み</h3>
          <ul>
            {result.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>リスク</h3>
          <ul>
            {result.risks.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="interview-notes">
        {result.interviewNotes.map((note, index) => (
          <article key={index}>
            <h3>{note.title}</h3>
            <p>{note.message}</p>
          </article>
        ))}
      </div>

      <div className="reference-toggle">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setShowReference((value) => !value)}
        >
          {showReference ? "模範解答を閉じる" : "模範解答を見る"}
        </button>
        {showReference && (
          <>
            <p className="panel-copy">
              このゲームで想定している一例。書籍の図と完全一致ではなく、
              同じ題材で組める現実的な構成のひとつです。
            </p>
            <ReferenceView challenge={challenge} components={components} />
          </>
        )}
      </div>
    </div>
  );
}
