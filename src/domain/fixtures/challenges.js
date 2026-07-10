// お題はすべて本サービスのオリジナルコンテンツ。
// 実在のサービス・書籍の設例に依拠せず、独自のシナリオ・数値で構成する。

export const videoStreamingChallenge = {
  id: "video-streaming-1m",
  title: "オンライン予備校のライブ授業配信",
  prompt:
    "全国の受験生向けオンライン予備校を設計してください。人気講師のライブ授業には最大50万人が同時アクセスし、授業終了後はアーカイブとして視聴できます。",
  functionalRequirements: [
    "会員はライブ授業をリアルタイムで視聴できる。",
    "授業終了後、同じ授業を録画アーカイブとして視聴できる。",
    "授業の一覧・開始時刻・視聴権限（会員種別）をAPIで取得できる。"
  ],
  nonFunctionalRequirements: [
    "人気授業ではピーク50万人の同時視聴に耐える。",
    "授業開始直後の数分間にアクセスが集中する（0→50万への急増）。",
    "再生開始までの待ち時間を全国どの地域でも2秒以内に抑えることを目標とする。"
  ],
  architectureBudget: 70,
  requiredComponentIds: [
    "cdn",
    "load-balancer",
    "application-service",
    "object-storage"
  ],
  recommendedComponentIds: [
    "cache",
    "queue",
    "db-replica",
    "rate-limiter",
    "consistent-hash",
    "key-value-store"
  ],
  requiredConnections: [
    ["cdn", "object-storage"],
    ["load-balancer", "application-service"]
  ],
  recommendations: [
    {
      componentId: "cdn",
      strength:
        "CDNにより、映像セグメントを視聴者に近いエッジから配信でき、授業開始直後の集中アクセスをオリジンから引き離せます。"
    },
    {
      componentId: "cache",
      strength:
        "授業メタデータや視聴権限の判定結果をキャッシュすることで、開始直後に集中する同一内容の読み取りを吸収できます。"
    },
    {
      componentId: "queue",
      strength:
        "アーカイブ変換や視聴ログ集計などの重い処理をキューで非同期化し、授業中の負荷から切り離せます。",
      risk: "キューがないため、授業終了直後に発生するアーカイブ変換や集計処理が視聴系のリソースを奪う恐れがあります。"
    },
    {
      componentId: "db-replica",
      strength:
        "授業一覧・権限情報の読み取りをレプリカへ逃がすことで、読み取り優位のトラフィックをスケールできます。",
      risk: "DBレプリカがないため、授業開始前後に集中するメタデータ読み取りが単一DBに集中しボトルネックになります。"
    },
    {
      componentId: "rate-limiter",
      strength:
        "レートリミッターにより、リロード連打やボットによる権限確認APIへの集中を抑えられます。",
      risk: "レートリミッターがないため、授業開始時のリロード連打がそのままバックエンドを直撃します。"
    },
    {
      componentId: "consistent-hash",
      strength:
        "コンシステントハッシュにより、視聴セッションやセグメントの担当ノードを増減時の再配置を最小限にして分散できます。"
    },
    {
      componentId: "analytics-pipeline",
      risk: "分析パイプラインがないため、離脱ポイントや視聴品質のデータに基づく授業改善ができません。"
    }
  ],
  targetConcepts: [
    "CDN",
    "負荷分散",
    "水平スケーリング",
    "キャッシュ",
    "キューイング",
    "レプリケーション",
    "レート制限",
    "コンシステントハッシュ",
    "キーバリューストア",
    "ステートレス"
  ],
  interviewPrompts: [
    "図を描く前に、同時視聴者数・ライブとアーカイブの比率・許容できる遅延を確認する。",
    "授業開始直後のスパイク（0→50万）をどの層で受け止めるかを説明する。",
    "ライブ配信経路とアーカイブ配信経路の違い、共有できる部分を整理する。"
  ],
  referenceLayout: {
    "client":              { x: -220, y: 200 },
    "rate-limiter":        { x:   0, y:  80 },
    "load-balancer":       { x: 220, y:  80 },
    "application-service": { x: 440, y:  80 },
    "cache":               { x: 660, y:   0 },
    "consistent-hash":     { x: 660, y: 160 },
    "key-value-store":     { x: 880, y:  80 },
    "db-replica":          { x: 880, y: 240 },
    "object-storage":      { x: 660, y: 320 },
    "cdn":                 { x: 440, y: 320 },
    "queue":               { x: 440, y: 480 },
    "analytics-pipeline":  { x: 660, y: 480 }
  },
  referenceConnections: [
    ["client", "rate-limiter"],
    ["client", "cdn"],
    ["rate-limiter", "load-balancer"],
    ["load-balancer", "application-service"],
    ["application-service", "cache"],
    ["application-service", "consistent-hash"],
    ["cache", "key-value-store"],
    ["consistent-hash", "key-value-store"],
    ["application-service", "db-replica"],
    ["application-service", "object-storage"],
    ["cdn", "object-storage"],
    ["application-service", "queue"],
    ["queue", "analytics-pipeline"]
  ]
};

export const chatServiceChallenge = {
  id: "chat-service-100k",
  title: "スマホゲームのフレンド＆ギルドチャット",
  prompt:
    "スマートフォン向けオンラインゲームに組み込むチャット機能を設計してください。ピーク時は20万人が常時接続し、フレンドとの1対1チャットと最大500人のギルドチャットを提供します。",
  functionalRequirements: [
    "プレイヤーはフレンドと1対1でメッセージを送受信できる。",
    "所属ギルド（最大500人）のチャンネルでメッセージを送受信できる。",
    "オフライン中に受け取ったメッセージは、次回ログイン時に未読として同期される。"
  ],
  nonFunctionalRequirements: [
    "ピーク20万人の常時接続を維持する。",
    "オンライン相手への配信遅延は平均500ms以下に抑える。",
    "ゲーム内イベント開催時のメッセージ急増（平常時の10倍）でも落とさない。"
  ],
  architectureBudget: 60,
  requiredComponentIds: [
    "websocket-gateway",
    "load-balancer",
    "application-service",
    "pubsub",
    "relational-database"
  ],
  recommendedComponentIds: [
    "cache",
    "key-value-store",
    "rate-limiter",
    "queue"
  ],
  requiredConnections: [
    ["load-balancer", "websocket-gateway"],
    ["websocket-gateway", "application-service"],
    ["application-service", "pubsub"],
    ["application-service", "relational-database"]
  ],
  recommendations: [
    {
      componentId: "websocket-gateway",
      strength:
        "WebSocketゲートウェイにより、ゲームクライアントとの常時接続を維持し、プッシュ型の即時配信を成立させられます。"
    },
    {
      componentId: "pubsub",
      strength:
        "Pub/Subにより、ギルドメンバーが複数の接続サーバーに散らばっていても、チャンネル単位で配信をファンアウトできます。"
    },
    {
      componentId: "key-value-store",
      strength:
        "キーバリューストアで「どのプレイヤーがどのゲートウェイに接続中か」というプレゼンス情報を低レイテンシで解決できます。",
      risk: "プレゼンス情報の保管先がないため、宛先プレイヤーがどのサーバーにいるかを解決できず、配信経路が成立しません。"
    },
    {
      componentId: "cache",
      strength:
        "ギルドチャンネルの直近メッセージをキャッシュしておくことで、ログイン直後の履歴表示を軽くできます。"
    },
    {
      componentId: "rate-limiter",
      risk: "レートリミッターがないため、マクロによる連投やイベント時のスパムがそのまま配信系を圧迫します。"
    },
    {
      componentId: "queue",
      strength:
        "オフラインプレイヤーへの未読書き込みやプッシュ通知をキュー経由の非同期ワーカーに逃がし、オンライン配信の低遅延を守れます。"
    }
  ],
  targetConcepts: [
    "WebSocket",
    "Pub/Sub",
    "ファンアウト",
    "リアルタイム",
    "負荷分散",
    "水平スケーリング",
    "レート制限",
    "キャッシュ"
  ],
  interviewPrompts: [
    "同時接続数・1人あたりの送信頻度から、秒間メッセージ数を最初に見積もる。",
    "1対1とギルド500人で配信方式（誰に・どう届けるか）がどう変わるかを説明する。",
    "接続が特定のゲートウェイに偏った場合や、ゲートウェイ障害時の再接続をどう扱うか言語化する。"
  ],
  referenceLayout: {
    "client":              { x: -220, y: 160 },
    "rate-limiter":        { x:   0, y: 160 },
    "load-balancer":       { x: 220, y: 160 },
    "websocket-gateway":   { x: 440, y: 160 },
    "application-service": { x: 660, y: 160 },
    "pubsub":              { x: 880, y:   0 },
    "cache":               { x: 880, y: 120 },
    "key-value-store":     { x: 880, y: 240 },
    "relational-database": { x: 880, y: 360 },
    "queue":               { x: 880, y: 480 }
  },
  referenceConnections: [
    ["client", "rate-limiter"],
    ["rate-limiter", "load-balancer"],
    ["load-balancer", "websocket-gateway"],
    ["websocket-gateway", "application-service"],
    ["application-service", "pubsub"],
    ["application-service", "cache"],
    ["application-service", "key-value-store"],
    ["application-service", "relational-database"],
    ["application-service", "queue"]
  ]
};

export const socialFeedChallenge = {
  id: "social-feed-fanout",
  title: "レシピ投稿アプリのフォローフィード",
  prompt:
    "料理レシピ投稿アプリのホームフィードを設計してください。ユーザーは好きな料理家をフォローし、フォロー中の新着レシピが時系列で並びます。人気料理家のフォロワーは100万人を超えます。",
  functionalRequirements: [
    "ユーザーはレシピ（写真＋本文）を投稿できる。",
    "ホーム画面に、フォロー中ユーザーの新着投稿が時系列で並ぶ。",
    "フィードは下方向へのスクロールで過去の投稿を読み込み続けられる。"
  ],
  nonFunctionalRequirements: [
    "食事の支度前（朝・夕）にアクセスが集中し、読み込み:書き込みは約200:1になる。",
    "フォロワー100万人超の人気料理家が投稿しても、他の処理を止めない。",
    "フィードの初回表示は100ms以内を目標にする。"
  ],
  architectureBudget: 75,
  requiredComponentIds: [
    "load-balancer",
    "application-service",
    "relational-database",
    "fanout-worker",
    "cache"
  ],
  recommendedComponentIds: [
    "queue",
    "db-replica",
    "key-value-store",
    "rate-limiter",
    "analytics-pipeline"
  ],
  requiredConnections: [
    ["load-balancer", "application-service"],
    ["application-service", "relational-database"],
    ["application-service", "fanout-worker"],
    ["fanout-worker", "cache"]
  ],
  recommendations: [
    {
      componentId: "fanout-worker",
      strength:
        "ファンアウトワーカーで各フォロワーのフィードを投稿時に事前生成しておくことで、読み込み時は並べ替え不要の即応答にできます。"
    },
    {
      componentId: "cache",
      strength:
        "生成済みフィードをキャッシュに置くことで、朝夕のアクセス集中をDBに触れずに返せます。"
    },
    {
      componentId: "queue",
      strength:
        "投稿からファンアウトまでをキューで非同期化し、フォロワー100万人分の書き込みを時間をかけて安全に処理できます。",
      risk: "キューがないため、人気料理家の投稿1件がフォロワー数分の同期書き込みとなり、投稿処理全体を塞ぎます。"
    },
    {
      componentId: "db-replica",
      strength:
        "レシピ本文やプロフィールの読み取りをレプリカへ分散し、読み込み優位（200:1）のワークロードに合わせてスケールできます。",
      risk: "DBレプリカがないため、読み込み優位のワークロードで単一DBが最初のボトルネックになります。"
    },
    {
      componentId: "key-value-store",
      strength:
        "ユーザーIDをキーに生成済みフィードを保持するのにキーバリューストアが適しており、低レイテンシの取得を実現できます。"
    },
    {
      componentId: "rate-limiter",
      risk: "レートリミッターがないため、スクレイピングや投稿スパムがフィード生成の負荷を増幅させます。"
    },
    {
      componentId: "analytics-pipeline",
      strength:
        "閲覧・保存・調理済みマークなどの行動ログを分析パイプラインに流すことで、フィードの並び順を継続的に改善できます。"
    }
  ],
  targetConcepts: [
    "ファンアウト",
    "タイムライン生成",
    "キャッシュ",
    "負荷分散",
    "レプリケーション",
    "水平スケーリング",
    "非同期処理",
    "レート制限"
  ],
  interviewPrompts: [
    "投稿時に事前生成する方式と、閲覧時にその場で組み立てる方式の使い分けを説明する。",
    "フォロワー100万人超の料理家（ホットユーザー）の投稿をどう特別扱いするか設計する。",
    "読み込み:書き込み = 200:1 という前提から、どの層への投資が効くかを選ぶ。"
  ],
  referenceLayout: {
    "client":              { x: -220, y: 200 },
    "rate-limiter":        { x:   0, y: 200 },
    "load-balancer":       { x: 220, y: 200 },
    "application-service": { x: 440, y: 200 },
    "relational-database": { x: 660, y:  60 },
    "db-replica":          { x: 880, y:  60 },
    "cache":               { x: 660, y: 200 },
    "key-value-store":     { x: 880, y: 320 },
    "queue":               { x: 660, y: 340 },
    "fanout-worker":       { x: 660, y: 480 },
    "analytics-pipeline":  { x: 440, y: 480 }
  },
  referenceConnections: [
    ["client", "rate-limiter"],
    ["rate-limiter", "load-balancer"],
    ["load-balancer", "application-service"],
    ["application-service", "relational-database"],
    ["application-service", "db-replica"],
    ["application-service", "cache"],
    ["application-service", "queue"],
    ["queue", "fanout-worker"],
    ["fanout-worker", "cache"],
    ["fanout-worker", "key-value-store"],
    ["application-service", "analytics-pipeline"]
  ]
};

export const challenges = [
  videoStreamingChallenge,
  chatServiceChallenge,
  socialFeedChallenge
];
