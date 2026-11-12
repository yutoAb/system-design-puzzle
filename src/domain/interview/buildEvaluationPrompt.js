import { localizeChallenge, normalizeLanguage } from "./language.js";
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

// 英語モードのレポートにだけ付く、英語表現の講評
const ENGLISH_FEEDBACK_PROPERTY = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description:
        "英語でのコミュニケーション全体の講評（日本語、2〜4文）。設計の説明が英語で伝わったかを中心に書く"
    },
    phrases: {
      type: "array",
      description: "言い換えると伝わりやすくなる表現。3〜6件",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          said: { type: "string", description: "候補者が実際に言った英語（書き起こしから引用）" },
          better: { type: "string", description: "面接でより自然・明確に伝わる英語の言い方" },
          note: { type: "string", description: "なぜその言い方がよいかの説明（日本語、1文）" }
        },
        required: ["said", "better", "note"]
      }
    }
  },
  required: ["summary", "phrases"]
};

export function buildEvaluationSchema(language) {
  if (normalizeLanguage(language) !== "en") {
    return EVALUATION_REPORT_SCHEMA;
  }
  return {
    ...EVALUATION_REPORT_SCHEMA,
    schema: {
      ...EVALUATION_REPORT_SCHEMA.schema,
      properties: {
        ...EVALUATION_REPORT_SCHEMA.schema.properties,
        englishFeedback: ENGLISH_FEEDBACK_PROPERTY
      },
      required: [...EVALUATION_REPORT_SCHEMA.schema.required, "englishFeedback"]
    }
  };
}

export function buildEvaluationPrompt(
  challenge,
  transcript,
  boardText,
  { language = "ja" } = {}
) {
  const english = normalizeLanguage(language) === "en";
  const brief = localizeChallenge(challenge, language);

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
${brief.title}
${brief.prompt}

機能要件:
${brief.functionalRequirements.map((req) => `- ${req}`).join("\n")}
非機能要件:
${brief.nonFunctionalRequirements.map((req) => `- ${req}`).join("\n")}

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

評価は厳しすぎず甘すぎず、実際の面接フィードバックとして役立つ具体性を持たせること。候補者の発言に根拠を求め、ホワイトボードだけで判断しないこと。${
    english
      ? `

# 英語面接について
この面接は英語で行われた。候補者は英語面接の練習をしている日本語話者である。
- overallGrade と設計面の評価は、英語の流暢さではなく設計の中身で判定する。ただし、英語のせいで設計意図が伝わらなかった箇所は improvements に書く。
- レポートの文章はすべて日本語で書く（引用する英語表現を除く）。
- englishFeedback には、書き起こしから候補者の実際の発言を引用し、面接でより明確に伝わる言い方を示す。設計の議論で頻出する表現（トレードオフの述べ方、前提の確認、結論の先出しなど）を優先する。
- 書き起こしは音声認識の結果であり、発音や細かな文法の誤りは反映されていない可能性がある。発音や、書き起こしから確認できない誤りには言及しない。`
      : ""
  }`;

  return { input, jsonSchema: buildEvaluationSchema(language) };
}
