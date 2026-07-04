# システム設計 模擬面接

AI面接官と音声で会話しながらシステム設計面接の練習ができるWebアプリ。OpenAI Realtime API（gpt-realtime）による日本語音声対話と、React Flow のホワイトボードを組み合わせています。

## コンセプト

- お題が与えられる（例:「100万人が同時視聴する動画配信サービスを設計せよ」）
- AI面接官と音声で会話しながら、ホワイトボードにコンポーネント（CDN、ロードバランサー、DB、キャッシュなど）を配置して設計を説明する
- 面接は「①要件・スコープ確認 → ②概要設計 → ③深掘り → ④まとめ」の4ステップで進行（アレックス・シュウ著『システム設計の面接試験』のフレームワークに準拠）
- 終了後、会話の書き起こしと最終的なボードをもとにAIが評価レポート（総合評価・良かった点・改善点・概念カバレッジ）を生成

## 題材

- 100万人同時視聴の動画配信
- 10万同時接続のリアルタイムチャット
- SNSフィードのファンアウト配信

## 開発

```bash
npm install
cp .env.example .env   # OPENAI_API_KEY を設定
npm test               # ドメイン層のテスト (Node 標準 test runner)
npm run dev            # API + Vite 開発サーバを並行起動 → http://localhost:5173
```

APIキーなしで画面フローを確認するには:

```bash
MOCK_OPENAI=1 npm run dev
# → http://localhost:5173/?mock=1 を開く（OpenAI を呼ばずに疑似面接が流れる）
```

環境変数:

| 変数 | 説明 |
|---|---|
| `OPENAI_API_KEY` | Realtime セッション発行と評価レポート生成に使用 |
| `EVAL_MODEL` | 評価レポートのモデル（省略時 `gpt-5-mini`） |
| `MOCK_OPENAI` | `1` で OpenAI を呼ばないスタブモード |

## 遊び方

1. お題と面接時間（短縮版 約15分 / フル 約40分）を選ぶ
2. 「マイクをオンにして面接開始」を押し、AI面接官と日本語で会話する
3. 話しながら右のパレットからピースをドラッグしてホワイトボードに図を描く（ボードの内容は面接官にリアルタイム共有される）
4. 面接官が4ステップを進行し、まとめの後に自動で面接が終了する（手動終了も可能）
5. 評価レポートと模範解答を確認する

## アーキテクチャ

クリーンアーキテクチャを採用し、依存方向を内側に向けます。

- `src/domain`: チャレンジ・コンポーネント定義、面接官プロンプト生成、ボード直列化、書き起こし処理、評価プロンプト生成
- `src/application`: ユースケース（セッション発行、面接評価）
- `src/infrastructure`: インメモリリポジトリ、OpenAI APIクライアント
- `src/interface-adapters`: コントローラ
- `client`: React + Vite + React Flow のブラウザ UI（WebRTC で OpenAI Realtime に直接接続）
- `api`: Vercel Functions エントリポイント

音声は「ブラウザ ↔ OpenAI Realtime API」を WebRTC で直結し、サーバは ephemeral key の発行（`/api/realtime-session`）と評価レポート生成（`/api/evaluate-interview`）のみを担当します。

仕様は `docs/specification.md` に記載します。
参考にした公開ページは `docs/references.md` に記載します。

## デプロイ (Vercel)

- プロジェクトの環境変数に `OPENAI_API_KEY`（必要なら `EVAL_MODEL`）を設定
- `api/evaluate-interview.js` は `vercel.json` で `maxDuration: 60` を指定済み

## コントリビュート

機能追加や修正は PR 経由でお願いします。`main` への直 push は避け、ブランチを切って PR を出してください。

- PR を作成すると、CodeRabbit が日本語で自動レビューします
- レビュー方針は `.coderabbit.yaml` を参照
- ローカルで `npm test` が通ることを確認してから push してください
