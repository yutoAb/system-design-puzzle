# システム設計 模擬面接 仕様

## 目的

AI面接官と日本語の音声で会話しながら、システム設計面接を再現するブラウザアプリです。候補者はお題について要件を確認し、ホワイトボードに図を描きながら設計を説明し、面接官の深掘りに答え、終了後に評価レポートを受け取ります。

## 面接の流れ

アレックス・シュウ著『システム設計の面接試験』の4ステップフレームワークに沿って、面接官AIが進行します。

1. **要件・スコープ確認 (requirements)**: 機能要件・非機能要件・規模の見積もりを候補者から確認させる。
2. **概要設計 (high_level)**: 全体アーキテクチャを提案させ、ホワイトボードに図を描くよう促し、すり合わせる。
3. **深掘り (deep_dive)**: ボトルネックを1〜2個選び、トレードオフの説明を求める。
4. **まとめ (wrap_up)**: 候補者に要約させ、面接官が簡潔なフィードバックを伝えて終了する。

時間は短縮版（約15分）とフル（約40分）の2モード。フェーズ進行と面接終了は、面接官AIが `advance_phase` / `end_interview` ツールを呼ぶことで制御されます（手動終了ボタンあり）。

## 技術構成

```
Browser ──WebRTC(音声 + oai-events データチャネル)──► OpenAI /v1/realtime/calls
   ├─ POST /api/realtime-session   … challenge から instructions/tools を組み立て
   │                                  /v1/realtime/client_secrets で ephemeral key を発行
   └─ POST /api/evaluate-interview … transcript + 最終ボード → Responses API → 評価レポート
GET /api/initial-state … お題とコンポーネント一覧
```

- 音声はブラウザと OpenAI Realtime API（`gpt-realtime`）の直接 WebRTC 接続。サーバーは API キーを秘匿し、ephemeral key の発行と評価のみを担当する。
- ホワイトボード（React Flow）の配置・接続は変更のたびに約2秒デバウンスされ、日本語テキストとしてデータチャネル経由で面接官AIに共有される。
- `MOCK_OPENAI=1`（サーバー）と `?mock=1`（クライアント）で、OpenAI を呼ばずに全画面フローを確認できる。

## 評価レポート

面接終了時に、会話の書き起こしと最終ボードを `/api/evaluate-interview` へ送信し、構造化出力（JSON Schema）で以下を得ます。

- `overallGrade`: S / A / B / C / D
- `summary`: 総評
- `strengths` / `improvements`: 良かった点・改善点
- `conceptCoverage`: お題の `targetConcepts` 各項目を議論できたか（根拠つき）
- `phaseFeedback`: フェーズ別フィードバック

評価ルーブリックには、チャレンジ定義の `recommendations`（強み・リスク）と `targetConcepts` を使用します。

## クリーンアーキテクチャ

依存方向は内側へ向けます。

- `domain`: チャレンジ・コンポーネント定義、面接フェーズ、面接官 instructions 生成、ボード直列化、書き起こし reducer、評価プロンプト生成。純粋関数のみ。
- `application`: ユースケース（`createInterviewSession`, `evaluateInterview`）。
- `infrastructure`: インメモリリポジトリ、OpenAI API クライアント（モック分岐を含む）。
- `interface-adapters`: コントローラ。
- `client`: React + Vite + React Flow の UI と WebRTC 接続。
- `api`: Vercel Functions エントリポイント。

ドメイン層はUI、サーバー、外部APIに依存しません。OpenAI API の形状に依存するコードは `src/infrastructure/openAiClient.js` と `client/useRealtimeInterview.js` に隔離します。

## 受け入れ条件

- プレイヤーはお題一覧と設計ピース一覧を取得できる。
- お題と時間モードを選ぶと、音声面接セッションが開始できる。
- ホワイトボードの配置が面接官AIの発話に反映される。
- 面接官AIが4フェーズを進行し、UIのフェーズ表示が追従する。
- 面接終了後、評価レポートが表示される。
- ドメイン層の中核挙動は自動テストで確認されている。
