// お題はすべて本サービスのオリジナルコンテンツ。
// 実在のサービス・書籍の設例に依拠せず、独自のシナリオ・数値で構成する。

export const videoStreamingChallenge = {
  id: "video-streaming-1m",
  category: "Webサービス",
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
  en: {
    title: "Live Lecture Streaming for an Online Prep School",
    prompt:
      "Design an online prep school for students across the country. A live lecture by a popular teacher can attract up to 500,000 concurrent viewers, and each lecture is available as an archive after it ends.",
    functionalRequirements: [
      "Members can watch live lectures in real time.",
      "After a lecture ends, members can watch the same lecture as a recorded archive.",
      "An API returns the lecture list, start times, and viewing permissions by membership tier."
    ],
    nonFunctionalRequirements: [
      "Withstand a peak of 500,000 concurrent viewers for popular lectures.",
      "Traffic spikes in the first few minutes of a lecture (from 0 to 500,000).",
      "Target a playback start time of under 2 seconds from anywhere in the country."
    ]
  },
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
  category: "Webサービス",
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
  en: {
    title: "Friend and Guild Chat for a Mobile Game",
    prompt:
      "Design a chat feature built into an online mobile game. At peak, 200,000 players stay connected. The feature offers one-on-one chat between friends and guild chat for up to 500 members.",
    functionalRequirements: [
      "Players can exchange one-on-one messages with friends.",
      "Players can exchange messages in the channel of their guild (up to 500 members).",
      "Messages received while offline are synced as unread at the next login."
    ],
    nonFunctionalRequirements: [
      "Maintain 200,000 persistent connections at peak.",
      "Keep average delivery latency to online recipients under 500 ms.",
      "Do not drop messages during in-game events, when volume rises to 10 times the normal level."
    ]
  },
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
  category: "Webサービス",
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
  en: {
    title: "Follow Feed for a Recipe Sharing App",
    prompt:
      "Design the home feed of a recipe sharing app. Users follow their favorite cooks, and new recipes from the people they follow appear in chronological order. Popular cooks have more than one million followers.",
    functionalRequirements: [
      "Users can post recipes (photos and text).",
      "The home screen lists new posts from followed users in chronological order.",
      "Users can keep scrolling down the feed to load older posts."
    ],
    nonFunctionalRequirements: [
      "Traffic peaks before meal preparation (morning and evening), with a read-to-write ratio of about 200:1.",
      "A post by a cook with over one million followers must not block other processing.",
      "Target an initial feed load of under 100 ms."
    ]
  },
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

export const voiceInferenceChallenge = {
  id: "voice-inference-platform",
  category: "ML基盤",
  title: "音声AIアシスタントのリアルタイム推論基盤",
  prompt:
    "家電メーカーの音声アシスタント向けに、音声対話モデルをGPUで動かす推論基盤を設計してください。朝と夜の時間帯には最大3万件の対話セッションが同時に走り、モデルは週に数回更新されます。",
  functionalRequirements: [
    "端末は音声をストリーミングで送り、応答の音声をストリーミングで受け取れる。",
    "新しいモデルバージョンへ、サービスを止めずに段階的に切り替えられる。",
    "モデルバージョンごとの遅延・エラー率・GPUの使用状況を確認できる。"
  ],
  nonFunctionalRequirements: [
    "ピーク時は3万セッションが同時に走り、30分ほどで平常時の5倍まで増える。",
    "発話の終了から応答音声の再生開始までを、95パーセンタイルで500ms以内に抑える。",
    "GPUサーバーは、起動してモデルを読み込み終えるまでに約3分かかる。",
    "深夜の利用はピークの1割以下で、その時間帯のGPU費用を抑えたい。"
  ],
  en: {
    title: "Real-Time Inference Platform for a Voice AI Assistant",
    prompt:
      "Design an inference platform that runs a spoken dialogue model on GPUs for a home appliance maker's voice assistant. Up to 30,000 dialogue sessions run concurrently in the morning and evening, and the model is updated several times a week.",
    functionalRequirements: [
      "Devices stream audio to the platform and receive the response audio as a stream.",
      "A new model version can be rolled out gradually without stopping the service.",
      "Operators can see latency, error rate, and GPU usage for each model version."
    ],
    nonFunctionalRequirements: [
      "At peak, 30,000 sessions run concurrently, and load grows to 5 times the normal level within about 30 minutes.",
      "Keep the time from end of speech to start of response audio under 500 ms at the 95th percentile.",
      "A GPU server takes about 3 minutes to boot and finish loading the model.",
      "Late-night usage is below 10 percent of peak, and GPU cost during those hours should be kept low."
    ]
  },
  architectureBudget: 80,
  requiredComponentIds: [
    "load-balancer",
    "websocket-gateway",
    "inference-server",
    "autoscaler",
    "model-registry"
  ],
  recommendedComponentIds: [
    "monitoring",
    "rate-limiter",
    "key-value-store",
    "queue",
    "object-storage"
  ],
  requiredConnections: [
    ["websocket-gateway", "inference-server"],
    ["inference-server", "model-registry"]
  ],
  recommendations: [
    {
      componentId: "inference-server",
      strength:
        "複数セッションの入力をまとめて処理する動的バッチングと、1台あたりの同時セッション数の上限により、GPUの処理量と遅延の釣り合いを制御できます。"
    },
    {
      componentId: "autoscaler",
      strength:
        "GPU使用率ではなく同時セッション数や待ち時間を指標にスケールすることで、遅延が悪化する前に台数を増やせます。起動に3分かかる分は、時間帯による先読みや予備の起動済みサーバーで補えます。",
      risk: "オートスケーラーがないため、朝夕の5倍の増加に人手で対応することになり、深夜も過剰なGPUを抱え続けます。"
    },
    {
      componentId: "model-registry",
      strength:
        "モデルレジストリでバージョンを管理することで、一部のセッションだけに新バージョンを当てる段階的な切替と、不具合時の即時の巻き戻しができます。",
      risk: "モデルレジストリがないため、どのサーバーがどのバージョンを動かしているか追えず、不具合が出ても確実に戻せません。"
    },
    {
      componentId: "monitoring",
      strength:
        "バージョン別の遅延とエラー率を監視することで、段階的な切替を自動で止める判断と、スケールの指標の両方に使えます。",
      risk: "監視がないため、新しいモデルで遅延が悪化しても気づけず、スケールの判断材料もありません。"
    },
    {
      componentId: "rate-limiter",
      strength:
        "容量を超えたときに新規セッションの受付を絞ることで、進行中の対話の遅延を守れます。",
      risk: "流量制御がないため、容量を超えた瞬間に全セッションの遅延が一斉に悪化します。"
    },
    {
      componentId: "key-value-store",
      strength:
        "セッションと担当サーバーの対応、対話の状態を保持することで、再接続やサーバー入れ替えの際に同じ対話を続けられます。"
    },
    {
      componentId: "queue",
      strength:
        "対話ログや評価用データの書き出しをキューで非同期化し、遅延に厳しい推論の経路から切り離せます。"
    },
    {
      componentId: "object-storage",
      strength:
        "モデルの重みをオブジェクトストレージに置き、サーバー側にも保持しておくことで、起動時の読み込み時間を短縮できます。"
    }
  ],
  targetConcepts: [
    "オートスケール",
    "スケール指標の選択",
    "コールドスタート",
    "動的バッチング",
    "段階的リリース",
    "ロールバック",
    "過負荷時の受付制限",
    "ストリーミングセッションの振り分け",
    "GPUコストの最適化",
    "SLOの監視"
  ],
  interviewPrompts: [
    "図を描く前に、同時セッション数・増加の速さ・遅延の目標・GPU1枚で処理できるセッション数を確認する。",
    "起動に3分かかる前提で、30分で5倍になる負荷にどう間に合わせるか（指標・先読み・予備のサーバー）を説明する。",
    "モデルの更新を止めずに行う手順と、不具合が出たときの戻し方を説明する。",
    "容量を超えたときに何を諦めるか（新規の受付、応答の品質）を説明する。"
  ],
  referenceLayout: {
    "client":            { x: -240, y:  80 },
    "rate-limiter":      { x:    0, y:  80 },
    "load-balancer":     { x:  240, y:  80 },
    "websocket-gateway": { x:  500, y:  80 },
    "key-value-store":   { x:  800, y: -80 },
    "inference-server":  { x:  800, y:  80 },
    "autoscaler":        { x:  500, y: 260 },
    "model-registry":    { x: 1060, y:   0 },
    "object-storage":    { x: 1320, y:   0 },
    "monitoring":        { x: 1060, y: 160 },
    "queue":             { x: 1060, y: 320 }
  },
  referenceConnections: [
    ["client", "rate-limiter"],
    ["rate-limiter", "load-balancer"],
    ["load-balancer", "websocket-gateway"],
    ["websocket-gateway", "key-value-store"],
    ["websocket-gateway", "inference-server"],
    ["autoscaler", "inference-server"],
    ["inference-server", "model-registry"],
    ["model-registry", "object-storage"],
    ["inference-server", "monitoring"],
    ["inference-server", "queue"]
  ]
};

export const trainingJobChallenge = {
  id: "training-job-platform",
  category: "ML基盤",
  title: "研究チーム向けGPU学習ジョブ基盤",
  prompt:
    "社内の研究者200人がモデルの学習ジョブを投入する、GPUクラスタの共有基盤を設計してください。GPUは全部で400枚あり、1つのジョブは数分から数日かかります。",
  functionalRequirements: [
    "研究者は、使うGPUの枚数と実行内容を指定して学習ジョブを投入できる。",
    "ジョブの状態（待機・実行中・完了・失敗）とログ、学習の進み具合を確認できる。",
    "学習の途中経過（チェックポイント）と完成したモデルが保存され、後から同じ結果を再現できる。"
  ],
  nonFunctionalRequirements: [
    "待機中と実行中を合わせて、同時に2,000件のジョブを扱う。",
    "特定のチームがGPUを独占せず、締切が近いジョブを優先できる。",
    "GPUサーバーの故障や割り込みが起きても、ジョブは途中から再開できる。",
    "GPUの稼働率を80%以上に保つ。"
  ],
  en: {
    title: "GPU Training Job Platform for a Research Team",
    prompt:
      "Design a shared GPU cluster platform where 200 in-house researchers submit model training jobs. There are 400 GPUs in total, and a single job takes anywhere from a few minutes to several days.",
    functionalRequirements: [
      "Researchers can submit a training job by specifying the number of GPUs and what to run.",
      "Researchers can see job status (queued, running, completed, failed), logs, and training progress.",
      "Checkpoints and finished models are stored so that the same result can be reproduced later."
    ],
    nonFunctionalRequirements: [
      "Handle 2,000 jobs at a time, counting both queued and running jobs.",
      "No single team may monopolize the GPUs, and jobs close to a deadline can be prioritized.",
      "A job can resume from where it stopped after a GPU server failure or an interruption.",
      "Keep GPU utilization at 80 percent or higher."
    ]
  },
  architectureBudget: 80,
  requiredComponentIds: [
    "application-service",
    "relational-database",
    "job-scheduler",
    "gpu-worker",
    "object-storage"
  ],
  recommendedComponentIds: [
    "queue",
    "model-registry",
    "monitoring",
    "load-balancer",
    "autoscaler"
  ],
  requiredConnections: [
    ["job-scheduler", "gpu-worker"],
    ["gpu-worker", "object-storage"]
  ],
  recommendations: [
    {
      componentId: "job-scheduler",
      strength:
        "優先度とチームごとのクォータを見て割り当てるスケジューラーにより、独占を防ぎながら締切が近いジョブを先に流せます。",
      risk: "スケジューラーがないため、早い者勝ちでGPUが埋まり、大きなジョブがいつまでも始まらない状態になります。"
    },
    {
      componentId: "queue",
      strength:
        "投入をキューで受けることで、APIとスケジューラーを切り離し、投入が集中したときやスケジューラーの再起動中でもジョブを失いません。",
      risk: "キューがないため、スケジューラーが止まっている間の投入が失われるか、APIが詰まります。"
    },
    {
      componentId: "gpu-worker",
      strength:
        "定期的にチェックポイントを書き出すワーカーにより、故障や優先ジョブへの明け渡しの後も途中から再開できます。"
    },
    {
      componentId: "object-storage",
      strength:
        "データセットとチェックポイントを共有のストレージに置くことで、別のワーカーに移っても同じ地点から再開できます。"
    },
    {
      componentId: "relational-database",
      strength:
        "ジョブの状態の変化を1か所に記録することで、ワーカーが応答しなくなったときも二重実行を避けて再実行できます。"
    },
    {
      componentId: "model-registry",
      strength:
        "完成したモデルを、コード・データ・設定のバージョンと紐づけて登録することで、後から同じ結果を再現できます。",
      risk: "モデルレジストリがないため、どのデータと設定で作ったモデルかを後から追えません。"
    },
    {
      componentId: "monitoring",
      strength:
        "GPUの稼働率・待ち時間・失敗率をチーム別に見えるようにすることで、クォータの見直しや稼働率の目標の確認ができます。",
      risk: "監視がないため、稼働率80%の目標を満たしているか、どのチームが待たされているかが分かりません。"
    },
    {
      componentId: "autoscaler",
      strength:
        "待ちが長いときだけクラウドのGPUを追加することで、固定の400枚を超える需要を一時的に吸収できます。"
    }
  ],
  targetConcepts: [
    "ジョブスケジューリング",
    "優先度とクォータ",
    "公平性",
    "実行中ジョブの明け渡し",
    "チェックポイントと再開",
    "冪等性",
    "複数GPUジョブの割り当て",
    "空きの断片化と稼働率",
    "再現性",
    "可観測性"
  ],
  interviewPrompts: [
    "図を描く前に、ジョブの長さと必要なGPU枚数の分布、優先度の決め方を確認する。",
    "8枚使うジョブと1枚のジョブが混ざるとき、空きの断片化と、大きなジョブが待たされ続ける問題をどう扱うか説明する。",
    "実行中のジョブを止めて優先ジョブに譲るときの、チェックポイントと再開の流れを説明する。",
    "ワーカーが応答しなくなったとき、二重実行を避けながら再実行する方法を説明する。"
  ],
  referenceLayout: {
    "client":              { x: -240, y:  80 },
    "load-balancer":       { x:    0, y:  80 },
    "application-service": { x:  240, y:  80 },
    "relational-database": { x:  540, y: -80 },
    "queue":               { x:  540, y:  80 },
    "job-scheduler":       { x:  800, y:  80 },
    "autoscaler":          { x:  800, y: 260 },
    "gpu-worker":          { x: 1080, y:  80 },
    "object-storage":      { x: 1340, y: -40 },
    "model-registry":      { x: 1340, y: 120 },
    "monitoring":          { x: 1340, y: 280 }
  },
  referenceConnections: [
    ["client", "load-balancer"],
    ["load-balancer", "application-service"],
    ["application-service", "relational-database"],
    ["application-service", "queue"],
    ["queue", "job-scheduler"],
    ["job-scheduler", "gpu-worker"],
    ["autoscaler", "gpu-worker"],
    ["gpu-worker", "object-storage"],
    ["gpu-worker", "model-registry"],
    ["gpu-worker", "monitoring"]
  ]
};

export const challenges = [
  videoStreamingChallenge,
  chatServiceChallenge,
  socialFeedChallenge,
  voiceInferenceChallenge,
  trainingJobChallenge
];
