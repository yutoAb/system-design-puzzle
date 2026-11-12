import { PHASE_IDS } from "./phases.js";

export const ADVANCE_PHASE_TOOL = "advance_phase";
export const END_INTERVIEW_TOOL = "end_interview";
export const INJECT_FAILURE_TOOL = "inject_failure";

export function buildRealtimeTools(componentCatalog) {
  return [
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
      name: INJECT_FAILURE_TOOL,
      description:
        "深掘りフェーズで、候補者の図にあるコンポーネントを1つ故障させる。候補者の画面でそのピースが赤く表示される。呼んだ直後に、何が起きるか・どう対処するかを候補者に質問する。面接中に1回だけ使う。",
      parameters: {
        type: "object",
        properties: {
          componentId: {
            type: "string",
            enum: componentCatalog.map((component) => component.id),
            description: "故障させるコンポーネントの id。候補者の図に置かれているものを選ぶ"
          }
        },
        required: ["componentId"]
      }
    },
    {
      type: "function",
      name: END_INTERVIEW_TOOL,
      description: "まとめのフィードバックを話し終えたら面接を終了する。",
      parameters: { type: "object", properties: {} }
    }
  ];
}
