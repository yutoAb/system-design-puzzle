import { PHASE_IDS } from "./phases.js";

export const ADVANCE_PHASE_TOOL = "advance_phase";
export const END_INTERVIEW_TOOL = "end_interview";

export const realtimeTools = [
  {
    type: "function",
    name: ADVANCE_PHASE_TOOL,
    description:
      "面接を次のフェーズへ進める。requirements(要件確認)→high_level(概要設計)→deep_dive(深掘り)→wrap_up(まとめ)の順に呼ぶ。",
    parameters: {
      type: "object",
      properties: {
        phase: {
          type: "string",
          enum: PHASE_IDS,
          description: "これから開始するフェーズ"
        }
      },
      required: ["phase"]
    }
  },
  {
    type: "function",
    name: END_INTERVIEW_TOOL,
    description: "まとめのフィードバックを話し終えたら面接を終了する。",
    parameters: { type: "object", properties: {} }
  }
];
