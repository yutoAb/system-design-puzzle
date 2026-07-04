import { INTERVIEW_PHASES } from "../src/domain/interview/phases.js";

export function PhaseIndicator({ phase }) {
  const activeIndex = INTERVIEW_PHASES.findIndex((entry) => entry.id === phase);

  return (
    <ol className="phase-indicator" aria-label="面接の進行状況">
      {INTERVIEW_PHASES.map((entry, index) => {
        const state =
          index < activeIndex ? "done" : index === activeIndex ? "active" : "todo";
        return (
          <li key={entry.id} className={`phase-step ${state}`}>
            <span className="phase-step-number">{entry.step}</span>
            <span className="phase-step-label">{entry.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
