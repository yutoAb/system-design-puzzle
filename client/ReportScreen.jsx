import { useState } from "react";
import { INTERVIEW_PHASES } from "../src/domain/interview/phases.js";
import { ReferenceView } from "./ReferenceView.jsx";

function phaseLabel(phaseId) {
  return (
    INTERVIEW_PHASES.find((phase) => phase.id === phaseId)?.label ?? phaseId
  );
}

export function ReportScreen({
  report,
  error,
  challenge,
  components,
  onRestart
}) {
  const [showReference, setShowReference] = useState(false);

  return (
    <div className="report-screen">
      <header className="intro">
        <p className="eyebrow">面接結果</p>
        <h1>{challenge.title}</h1>
      </header>

      {!report && !error && (
        <p className="report-loading">評価レポートを生成しています…</p>
      )}

      {error && (
        <div className="report-error">
          <p>評価レポートを生成できませんでした: {error}</p>
        </div>
      )}

      {report && (
        <div className="report-body">
          <div className="report-grade">
            <span className={`grade grade-${report.overallGrade}`}>
              {report.overallGrade}
            </span>
            <p className="report-summary">{report.summary}</p>
          </div>

          <div className="report-columns">
            <section className="report-section">
              <h2>良かった点</h2>
              <ul>
                {report.strengths.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="report-section">
              <h2>改善点</h2>
              <ul>
                {report.improvements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="report-section">
            <h2>概念カバレッジ</h2>
            <ul className="concept-coverage">
              {report.conceptCoverage.map((item, index) => (
                <li key={index} className={item.covered ? "covered" : "missed"}>
                  <strong>
                    {item.covered ? "✓" : "✗"} {item.concept}
                  </strong>
                  <small>{item.evidence}</small>
                </li>
              ))}
            </ul>
          </section>

          <section className="report-section">
            <h2>フェーズ別フィードバック</h2>
            <ul className="phase-feedback">
              {report.phaseFeedback.map((item, index) => (
                <li key={index}>
                  <strong>{phaseLabel(item.phase)}</strong>
                  <p>{item.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <div className="report-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setShowReference((value) => !value)}
        >
          {showReference ? "模範解答を隠す" : "模範解答を見る"}
        </button>
        <button type="button" className="primary" onClick={onRestart}>
          お題選択に戻る
        </button>
      </div>

      {showReference && (
        <section className="report-reference">
          <h2>模範解答の構成例</h2>
          <ReferenceView challenge={challenge} components={components} />
        </section>
      )}
    </div>
  );
}
