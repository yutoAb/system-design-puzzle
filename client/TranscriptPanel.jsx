import { useEffect, useRef } from "react";

export function TranscriptPanel({ transcript }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript]);

  return (
    <div className="transcript-panel">
      <h2>会話ログ</h2>
      <div className="transcript-list">
        {transcript.length === 0 && (
          <p className="panel-copy">面接官の発話がここに表示されます。</p>
        )}
        {transcript.map((entry) => (
          <div key={entry.id} className={`transcript-entry ${entry.role}`}>
            <span className="transcript-speaker">
              {entry.role === "assistant" ? "面接官" : "あなた"}
            </span>
            <p>{entry.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
