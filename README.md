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

## アカウントとチケット

- Google アカウントでログインすると（Supabase Auth）、サインアップボーナスとしてチケット1枚が付与されます
- 面接1回につきチケット1枚を消費します（面接開始時。評価レポートは消費なし）
- チケットは Stripe Checkout で購入できます（現在テストモード）

## 開発

```bash
npm install
cp .env.example .env   # OPENAI_API_KEY を設定
npm test               # ドメイン層のテスト (Node 標準 test runner)
npm run dev            # API + Vite 開発サーバを並行起動 → http://localhost:5173
```

APIキー・外部サービスなしで画面フローを確認するには:

```bash
MOCK_OPENAI=1 MOCK_AUTH=1 MOCK_STRIPE=1 npm run dev
# → http://localhost:5173/?mock=1 を開く（外部サービスを呼ばずに疑似面接が流れる）
```

環境変数:

| 変数 | 説明 |
|---|---|
| `OPENAI_API_KEY` | Realtime セッション発行と評価レポート生成に使用 |
| `EVAL_MODEL` | 評価レポートのモデル（省略時 `gpt-5-mini`） |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` | クライアント用 Supabase 設定（ビルド時に埋め込み） |
| `SUPABASE_URL` / `SUPABASE_SECRET_KEY` | サーバー用 Supabase 設定（トークン検証・チケット操作） |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe（`sk_test_` / webhook 署名検証） |
| `STRIPE_PRICE_TICKET_1` / `STRIPE_PRICE_TICKET_5` | チケット1枚 / 5枚パックの Price ID |
| `APP_BASE_URL` | Checkout の戻り先 URL（本番は https://…） |
| `MOCK_OPENAI` / `MOCK_AUTH` / `MOCK_STRIPE` | `1` で各外部サービスを呼ばないスタブモード |
| `MOCK_TICKET_BALANCE` | `MOCK_AUTH=1` 時の初期チケット残高（省略時 1） |

Supabase / Stripe が未設定の場合、ログイン・購入 UI は非表示になり、課金 API はゲートなしで動きます（ローカル開発用。公開デプロイでは必ず設定してください）。

## 外部サービスのセットアップ

### Supabase（認証 + チケット台帳）

1. [supabase.com](https://supabase.com) でプロジェクトを作成し、Settings → API Keys から URL / `sb_publishable_...` / `sb_secret_...` を取得
2. Google Cloud Console で OAuth クライアント（Web）を作成。承認済みリダイレクト URI に `https://<project-ref>.supabase.co/auth/v1/callback` を登録し、クライアント ID / シークレットを Supabase の Authentication → Providers → Google に設定
3. Authentication → URL Configuration で Site URL に本番 URL、Redirect URLs に `http://localhost:5173` と本番 URL を登録
4. SQL エディタで `supabase/migrations/0001_tickets.sql` を実行
5. 手動でチケットを付与する場合: `select public.grant_tickets('<user_id>', 100, 'admin_grant');`

### Stripe（チケット購入・テストモード）

1. テストモードで商品/価格を2つ作成（チケット1枚 / 5枚パック）し、`price_...` を控える
2. Developers → Webhooks でエンドポイント `https://<本番URL>/api/stripe-webhook` を登録（イベント: `checkout.session.completed`）し、`whsec_...` を控える
3. ローカルで webhook を受けるには: `stripe listen --forward-to localhost:4173/api/stripe-webhook`
4. テストカード: `4242 4242 4242 4242`

## 遊び方

0. Google でログインする（チケットが必要。初回登録時に1枚付与）
1. お題と面接時間（短縮版 約15分 / フル 約40分）を選ぶ
2. 「マイクをオンにして面接開始」を押し、AI面接官と日本語で会話する
3. 話しながら右のパレットからピースをドラッグしてホワイトボードに図を描く（ボードの内容は面接官にリアルタイム共有される）
4. 面接官が4ステップを進行し、まとめの後に自動で面接が終了する（手動終了も可能）
5. 評価レポートと模範解答を確認する

## アーキテクチャ

クリーンアーキテクチャを採用し、依存方向を内側に向けます。

- `src/domain`: チャレンジ・コンポーネント定義、面接官プロンプト生成、ボード直列化、書き起こし処理、評価プロンプト生成、チケットパック定義
- `src/application`: ユースケース（セッション発行、面接評価）
- `src/infrastructure`: インメモリリポジトリ、OpenAI APIクライアント、Supabase 認証/チケットゲートウェイ、Stripe クライアント
- `src/interface-adapters`: コントローラ
- `supabase/migrations`: チケット台帳のスキーマ（ダッシュボードの SQL エディタで適用）
- `client`: React + Vite + React Flow のブラウザ UI（WebRTC で OpenAI Realtime に直接接続）
- `api`: Vercel Functions エントリポイント

音声は「ブラウザ ↔ OpenAI Realtime API」を WebRTC で直結し、サーバは ephemeral key の発行（`/api/realtime-session`）と評価レポート生成（`/api/evaluate-interview`）のみを担当します。

仕様は `docs/specification.md` に記載します。
参考にした公開ページは `docs/references.md` に記載します。

## デプロイ (Vercel)

- プロジェクトの環境変数に `OPENAI_API_KEY`・Supabase 4変数・Stripe 4変数・`APP_BASE_URL`（必要なら `EVAL_MODEL`）を設定
- `api/evaluate-interview.js` は `vercel.json` で `maxDuration: 60` を指定済み
- `api/stripe-webhook.js` のみ Web ハンドラ形式（署名検証に raw body が必要なため）

## コントリビュート

機能追加や修正は PR 経由でお願いします。`main` への直 push は避け、ブランチを切って PR を出してください。

- PR を作成すると、CodeRabbit が日本語で自動レビューします
- レビュー方針は `.coderabbit.yaml` を参照
- ローカルで `npm test` が通ることを確認してから push してください
