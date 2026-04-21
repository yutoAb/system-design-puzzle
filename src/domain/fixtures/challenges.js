export const videoStreamingChallenge = {
  id: "video-streaming-1m",
  title: "100万人同時視聴の動画配信",
  prompt:
    "100万人が同時視聴しても、再生開始が遅くなりにくい動画配信サービスを設計してください。",
  functionalRequirements: [
    "ユーザーはアップロード済み動画を視聴できる。",
    "動画メタデータと権限情報をAPIから取得できる。",
    "異なる地域の視聴者でも再生開始を速くする。"
  ],
  nonFunctionalRequirements: [
    "100万人の同時視聴に耐える。",
    "読み取り経路の低レイテンシを優先する。",
    "限られたアーキテクチャ予算の中で中核設計をまとめる。"
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
      strength: "CDNにより、動画を視聴者に近い場所から配信できます。"
    },
    {
      componentId: "cache",
      strength: "キャッシュにより、繰り返し発生する読み取りと応答時間を減らせます。"
    },
    {
      componentId: "queue",
      strength: "メッセージキューにより、非同期処理の急増を吸収できます。",
      risk: "メッセージキューがないため、急増するバックグラウンド処理でサービスが詰まる可能性があります。"
    },
    {
      componentId: "db-replica",
      strength: "DBレプリカにより、読み取り経路をスケールしやすくなります。",
      risk: "DBレプリカがないため、メタデータ読み取りがボトルネックになる可能性があります。"
    },
    {
      componentId: "rate-limiter",
      strength: "レートリミッターにより、乱用や急な書き込み増加への対策を説明できます。",
      risk: "レートリミッターがないため、乱用や急な書き込み増加を制御しにくくなります。"
    },
    {
      componentId: "consistent-hash",
      strength: "コンシステントハッシュにより、分割と担当範囲の説明がしやすくなります。"
    },
    {
      componentId: "analytics-pipeline",
      risk: "分析パイプラインがないため、視聴データを使った改善サイクルが弱くなります。"
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
    "図を描く前に、読み取り/書き込みの流量と非機能要件を確認する。",
    "ホットな読み取り経路を見積もり、ボトルネックを取り除く。",
    "各ピースを足す、または省くときに受け入れたトレードオフを説明する。"
  ],
  scoringWeights: {
    availability: 1,
    latency: 1,
    scalability: 1,
    cost: 1,
    requirements: 1
  }
};

export const chatServiceChallenge = {
  id: "chat-service-100k",
  title: "10万同時接続のリアルタイムチャット",
  prompt:
    "10万ユーザーが同時接続しても、メッセージが数百ミリ秒で届くチャットサービスを設計してください。",
  functionalRequirements: [
    "ユーザーは1対1およびグループでメッセージを送受信できる。",
    "オフラインだったユーザーにも過去メッセージを届ける。",
    "入室中のユーザーにはリアルタイムに配信する。"
  ],
  nonFunctionalRequirements: [
    "10万ユーザーの同時接続を維持する。",
    "配信の平均遅延を500ms以下に抑える。",
    "突発的なメッセージ増加でもサービスを落とさない。"
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
      strength: "WebSocketゲートウェイにより、常時接続でのリアルタイム配信を成立させられます。"
    },
    {
      componentId: "pubsub",
      strength: "Pub/Subで複数サーバー間の配信をファンアウトできます。"
    },
    {
      componentId: "key-value-store",
      strength: "キーバリューストアでセッション・プレゼンス情報を素早く参照できます。",
      risk: "セッションやプレゼンスの保管先がないため、どのサーバーがどのユーザーを持つかを解決できません。"
    },
    {
      componentId: "cache",
      strength: "直近メッセージのキャッシュで、チャット履歴の読み込みを軽くできます。"
    },
    {
      componentId: "rate-limiter",
      risk: "レートリミッターがないため、スパムやメッセージ連打でサービスが詰まる懸念があります。"
    },
    {
      componentId: "queue",
      strength: "オフラインユーザー向けのメッセージ配信を非同期ワーカーへ逃がせます。"
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
    "同時接続数・メッセージ流量を最初に見積もる。",
    "1対1と大人数チャットで配信方式がどう変わるかを説明する。",
    "接続が特定サーバーに偏ったときの対処を言語化する。"
  ],
  scoringWeights: {
    availability: 1,
    latency: 1,
    scalability: 1,
    cost: 1,
    requirements: 1
  }
};

export const socialFeedChallenge = {
  id: "social-feed-fanout",
  title: "SNSフィードのファンアウト配信",
  prompt:
    "フォロー関係のあるSNSで、投稿がフォロワーのタイムラインに数秒以内で並ぶフィードを設計してください。",
  functionalRequirements: [
    "ユーザーは投稿を作成できる。",
    "フォローしているユーザーの投稿が時系列で並ぶ。",
    "過去投稿のスクロール読み込みに耐える。"
  ],
  nonFunctionalRequirements: [
    "書き込み:読み込みが1:100の非対称トラフィックを捌く。",
    "フォロワー数が極端に多いアカウントにも対応する。",
    "タイムラインの取得は100ms以内を目標にする。"
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
      strength: "ファンアウトワーカーでタイムラインを事前計算し、読み込みを高速化できます。"
    },
    {
      componentId: "cache",
      strength: "キャッシュで人気タイムラインを即応答できます。"
    },
    {
      componentId: "queue",
      strength: "投稿→ファンアウトを非同期化し、急増する書き込みを吸収できます。",
      risk: "非同期キューがないため、フォロワーが多いユーザーの書き込みが同期的にサービスを詰まらせる恐れがあります。"
    },
    {
      componentId: "db-replica",
      strength: "DBレプリカで読み込みをスケールし、タイムライン生成の遅延を抑えられます。",
      risk: "DBレプリカがないため、読み込み優位のワークロードでRDBが先にボトルネック化します。"
    },
    {
      componentId: "key-value-store",
      strength: "キーバリューストアでタイムラインそのものを低レイテンシで保存できます。"
    },
    {
      componentId: "rate-limiter",
      risk: "レートリミッターがないため、投稿スパムや取得連打でサービスが不安定になります。"
    },
    {
      componentId: "analytics-pipeline",
      strength: "分析パイプラインで投稿の反応やフィード品質を継続的に改善できます。"
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
    "プッシュ型ファンアウトとプル型生成の使い分けを説明する。",
    "ホットユーザー（フォロワー数が極端に多い）への対処を設計する。",
    "書き込み/読み込み比を前提に、どこをスケールさせるか選ぶ。"
  ],
  scoringWeights: {
    availability: 1,
    latency: 1,
    scalability: 1,
    cost: 1,
    requirements: 1
  }
};

export const challenges = [
  videoStreamingChallenge,
  chatServiceChallenge,
  socialFeedChallenge
];
