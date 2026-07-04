const MOCK_EVALUATION_REPORT = {
  overallGrade: "B",
  summary:
    "モックモードの評価レポートです。要件確認から概要設計まで一通りの流れを踏めており、基本的な構成要素も押さえられています。一方で深掘りフェーズでのトレードオフの言語化には改善の余地があります。実際の評価を得るには MOCK_OPENAI を外して実行してください。",
  strengths: [
    "要件とスコープを最初に確認できた（モック）",
    "主要コンポーネントをホワイトボードに配置できた（モック）"
  ],
  improvements: [
    "ボトルネックの定量的な見積もりを加える（モック）",
    "コストと可用性のトレードオフを明示的に説明する（モック）"
  ],
  conceptCoverage: [
    { concept: "負荷分散", covered: true, evidence: "モックデータ" },
    { concept: "キャッシュ", covered: false, evidence: "モックデータ" }
  ],
  phaseFeedback: [
    { phase: "requirements", comment: "要件確認は丁寧でした（モック）" },
    { phase: "high_level", comment: "全体像の説明は明快でした（モック）" },
    { phase: "deep_dive", comment: "深掘りの具体性を高めましょう（モック）" },
    { phase: "wrap_up", comment: "要約は簡潔でした（モック）" }
  ]
};

export function createOpenAiClient({
  apiKey,
  mock = false,
  baseUrl = "https://api.openai.com/v1"
} = {}) {
  if (mock) {
    return {
      async createClientSecret() {
        return { value: "ek_mock", expires_at: 0 };
      },
      async createStructuredResponse() {
        return MOCK_EVALUATION_REPORT;
      }
    };
  }

  async function postJson(path, body) {
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY が設定されていません。.env を用意するか MOCK_OPENAI=1 で起動してください。"
      );
    }
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenAI ${path} failed: ${response.status} ${detail}`);
    }
    return response.json();
  }

  return {
    async createClientSecret(sessionConfig) {
      return postJson("/realtime/client_secrets", sessionConfig);
    },

    async createStructuredResponse({ model, input, jsonSchema }) {
      const result = await postJson("/responses", {
        model,
        input,
        text: {
          format: {
            type: "json_schema",
            name: jsonSchema.name,
            strict: jsonSchema.strict,
            schema: jsonSchema.schema
          }
        }
      });
      const text = (result.output ?? [])
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content ?? [])
        .filter((content) => content.type === "output_text")
        .map((content) => content.text)
        .join("");
      if (!text) {
        throw new Error("OpenAI /responses returned no output text");
      }
      return JSON.parse(text);
    }
  };
}
