export const INTERVIEW_PHASES = [
  { id: "requirements", label: "要件・スコープ確認", step: 1 },
  { id: "high_level", label: "概要設計", step: 2 },
  { id: "deep_dive", label: "深掘り", step: 3 },
  { id: "wrap_up", label: "まとめ", step: 4 }
];

export const PHASE_IDS = INTERVIEW_PHASES.map((phase) => phase.id);

export function findPhase(phaseId) {
  return INTERVIEW_PHASES.find((phase) => phase.id === phaseId) ?? null;
}
