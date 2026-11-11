import { useEffect, useRef } from "react";

export function TranscriptPanel({ transcript }) {
  const listRef = useRef(null);

  // scrollIntoView だとページ全体まで動いてしまうので、リスト内だけを送る
  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    }
  }, [transcript]);

  return (
    <div className="transcript-panel">
      <h2>会話ログ</h2>
      <div className="transcript-list" ref={listRef}>
        {transcript.length === 0 && (
          <p className="panel-copy">面接官の発話がここに表示されます。</p>
        )}
        {transcript.map((entry) => (
          <div key={entry.id} className={`transcript-entry ${entry.role}`}>
            <span className="transcript-speaker">
              {entry.role === "assistant" ? "面接官" : "あなた"}
            </span>
            <p>
              {entry.text !== "" ? (
                entry.text
              ) : (
                <em className="transcribing">（聞き取り中…）</em>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
