import { INTERVIEW_PHASES } from "./phases.js";
import { formatTranscript } from "./transcript.js";

export const EVALUATION_REPORT_SCHEMA = {
  name: "interview_evaluation_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      overallGrade: {
        type: "string",
        enum: ["S", "A", "B", "C", "D"],
        description: "総合評価。S=即採用レベル、A=優秀、B=合格ライン、C=要改善、D=不合格"
      },
      summary: { type: "string", description: "総評（日本語、3〜5文）" },
      strengths: {
        type: "array",
        items: { type: "string" },
        description: "良かった点"
      },
      improvements: {
        type: "array",
        items: { type: "string" },
        description: "改善点"
      },
      conceptCoverage: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            concept: { type: "string" },
            covered: { type: "boolean" },
            evidence: {
              type: "string",
              description: "カバーした/しなかった根拠。該当発言の要約など"
            }
          },
          required: ["concept", "covered", "evidence"]
        }
      },
      phaseFeedback: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            phase: {
              type: "string",
              enum: INTERVIEW_PHASES.map((phase) => phase.id)
            },
            comment: { type: "string" }
          },
          required: ["phase", "comment"]
        }
      }
    },
    required: [
      "overallGrade",
      "summary",
      "strengths",
      "improvements",
      "conceptCoverage",
      "phaseFeedback"
    ]
  }
};

export function buildEvaluationPrompt(challenge, transcript, boardText) {
  const strengths = challenge.recommendations
    .filter((rec) => rec.strength)
    .map((rec) => `- ${rec.strength}`)
    .join("\n");

  const risks = challenge.recommendations
    .filter((rec) => rec.risk)
    .map((rec) => `- ${rec.risk}`)
    .join("\n");

  const input = `あなたはシステム設計面接の評価者です。以下の模擬面接の書き起こしと最終的なホワイトボードをもとに、候補者を日本語で評価してください。

# お題
${challenge.title}
${challenge.prompt}

機能要件:
${challenge.functionalRequirements.map((req) => `- ${req}`).join("\n")}
非機能要件:
${challenge.nonFunctionalRequirements.map((req) => `- ${req}`).join("\n")}

# 評価ルーブリック
conceptCoverage には次の概念を必ず全て含め、面接中に候補者が実質的に議論できたかを判定すること: ${challenge.targetConcepts.join("、")}
良い設計の要素（言及があれば strengths に反映）:
${strengths}
見落としがちなリスク（見落としていれば improvements に反映）:
${risks}

# 最終的なホワイトボード
${boardText}

# 面接の書き起こし
${formatTranscript(transcript)}

評価は厳しすぎず甘すぎず、実際の面接フィードバックとして役立つ具体性を持たせること。候補者の発言に根拠を求め、ホワイトボードだけで判断しないこと。`;

  return { input, jsonSchema: EVALUATION_REPORT_SCHEMA };
}
