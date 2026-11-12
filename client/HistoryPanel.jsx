import { useMemo, useState } from "react";
import { summarizeWeakConcepts } from "../src/domain/interview/history.js";

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export function HistoryPanel({ entries, challenges, onOpen, onClear }) {
  // 消すと戻せないので、1 回のクリックでは消さない
  const [confirmingClear, setConfirmingClear] = useState(false);
  const weakConcepts = useMemo(() => summarizeWeakConcepts(entries), [entries]);
  // お題が後から削除されていても落ちないよう、残っているものだけを出す
  const visible = entries.filter((entry) =>
    challenges.some((challenge) => challenge.id === entry.challengeId)
  );

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="history-panel">
      <div className="history-heading">
        <h2>これまでの結果</h2>
        {confirmingClear ? (
          <span className="history-confirm">
            すべて消します。元に戻せません。
            <button type="button" className="link-button" onClick={onClear}>
              消す
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => setConfirmingClear(false)}
            >
              やめる
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="link-button"
            onClick={() => setConfirmingClear(true)}
          >
            履歴を消す
          </button>
        )}
      </div>
      <p className="panel-copy">
        このブラウザに保存されています（最新30件）。他の端末には引き継がれません。
      </p>

      {weakConcepts.length > 0 && (
        <div className="weak-concepts">
          <h3>よく落としている論点</h3>
          <ul>
            {weakConcepts.map((item) => (
              <li key={item.concept}>
                <strong>{item.concept}</strong>
                <span>
                  {item.asked}回中{item.missed}回
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="history-list">
        {visible.map((entry) => {
          const challenge = challenges.find(
            (item) => item.id === entry.challengeId
          );
          return (
            <li key={entry.id}>
              <button type="button" onClick={() => onOpen(entry)}>
                <span className={`grade grade-${entry.report.overallGrade}`}>
                  {entry.report.overallGrade}
                </span>
                <span className="history-title">
                  <strong>{challenge.title}</strong>
                  <small>
                    {formatDate(entry.date)}
                    {entry.language === "en" ? "・English" : ""}
                    {entry.strictMode ? "・本番仕様" : ""}
                  </small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
