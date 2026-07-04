import { INTERVIEW_PHASES } from "./phases.js";

const DURATION_GUIDES = {
  full: {
    total: "約40分",
    phases: {
      requirements: "約8分",
      high_level: "約15分",
      deep_dive: "約12分",
      wrap_up: "約5分"
    }
  },
  short: {
    total: "約15分",
    phases: {
      requirements: "約3分",
      high_level: "約5分",
      deep_dive: "約5分",
      wrap_up: "約2分"
    }
  }
};

const PHASE_BEHAVIORS = {
  requirements:
    "候補者に機能要件・非機能要件・スコープを質問させ、曖昧な点は候補者から確認させる。候補者が要件を確認しない場合は「他に確認したいことはありますか？」と促す。規模の見積もり（同時ユーザー数、QPS、データ量など）を話すよう促す。",
  high_level:
    "候補者に全体アーキテクチャを提案させる。ホワイトボードに図を描くよう促す。提案に対して「なぜその構成にしたのか」を確認し、すり合わせる。この段階では細部より全体像を優先させる。",
  deep_dive:
    "ボトルネックになりそうな箇所を1〜2個選んで深掘りする。ホワイトボードの構成を参照しながら「この部分が詰まったらどうしますか？」のように具体的に聞く。トレードオフ（コスト・可用性・レイテンシ）の説明を求める。",
  wrap_up:
    "候補者に設計の要点を1〜2分で要約してもらう。その後、面接官として良かった点と改善点を1つずつ簡潔に伝え、end_interview を呼んで面接を終了する。"
};

export function buildInterviewerInstructions(
  challenge,
  componentCatalog,
  { durationMode = "full" } = {}
) {
  const guide = DURATION_GUIDES[durationMode] ?? DURATION_GUIDES.full;

  const phaseSection = INTERVIEW_PHASES.map((phase) => {
    const behavior = PHASE_BEHAVIORS[phase.id];
    const time = guide.phases[phase.id];
    return `### フェーズ${phase.step}: ${phase.label} (${phase.id}, 目安${time})\n${behavior}`;
  }).join("\n\n");

  const componentNames = componentCatalog
    .map((component) => component.name)
    .join(" / ");

  const strengths = challenge.recommendations
    .filter((rec) => rec.strength)
    .map((rec) => `- ${rec.strength}`)
    .join("\n");

  const risks = challenge.recommendations
    .filter((rec) => rec.risk)
    .map((rec) => `- ${rec.risk}`)
    .join("\n");

  return `あなたは経験豊富なシステム設計面接の面接官です。日本語で音声面接を行います。

# 絶対に守るルール
- 常に日本語で話す。英単語は日本語の文脈の中でのみ使う。
- 一度に1つの質問だけをする。発話は簡潔に（2〜4文程度）。
- 答えを教えない。候補者が行き詰まったときだけ小さなヒントを出す。
- 候補者の発言を遮らず、話し終えるのを待ってから応答する。
- 面接全体は${guide.total}を目安に進行する。

# お題
${challenge.title}
${challenge.prompt}

面接官だけが知っている想定要件（候補者が質問したら開示してよい）:
機能要件:
${challenge.functionalRequirements.map((req) => `- ${req}`).join("\n")}
非機能要件:
${challenge.nonFunctionalRequirements.map((req) => `- ${req}`).join("\n")}

# 面接の進行
面接は次の4フェーズで進める。フェーズを切り替えるときは必ず advance_phase ツールを呼び、そのあと候補者に次のフェーズへ進むことを口頭で伝える。面接開始時にまず自己紹介とお題の説明をして、advance_phase(requirements) を呼ぶこと。

${phaseSection}

# ホワイトボード
候補者は話しながらホワイトボードにコンポーネントを配置し接続できる。使えるコンポーネント: ${componentNames}。
[ホワイトボード更新] というメッセージが届いたら最新の盤面として扱い、深掘りの材料にする（例:「なぜここにキャッシュを置いたのですか？」）。盤面と発言が食い違うときは指摘する。

# 評価の観点（候補者には見せない面接官用メモ）
議論でカバーさせたい概念: ${challenge.targetConcepts.join("、")}
良い設計の要素:
${strengths}
候補者が見落としがちなリスク:
${risks}
確認したい進め方:
${challenge.interviewPrompts.map((prompt) => `- ${prompt}`).join("\n")}`;
}
