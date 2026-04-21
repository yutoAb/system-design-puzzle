export const componentCatalog = [
  {
    id: "cdn",
    name: "CDN",
    stage: "エッジ",
    description: "動画や静的ファイルを視聴者に近い場所から配信します。",
    concepts: ["CDN", "キャッシュ", "低レイテンシ"],
    effects: {
      availability: 15,
      latency: 30,
      scalability: 20,
      cost: 14
    }
  },
  {
    id: "websocket-gateway",
    name: "WebSocketゲートウェイ",
    stage: "エッジ",
    description: "常時接続のソケットを束ね、リアルタイムな双方向通信を中継します。",
    concepts: ["WebSocket", "リアルタイム", "常時接続"],
    effects: {
      availability: 10,
      latency: 22,
      scalability: 14,
      cost: 10
    }
  },
  {
    id: "load-balancer",
    name: "ロードバランサー",
    stage: "流量制御",
    description: "リクエストを複数のアプリケーションサーバーへ分散します。",
    concepts: ["負荷分散", "水平スケーリング"],
    effects: {
      availability: 15,
      latency: 5,
      scalability: 15,
      cost: 4
    }
  },
  {
    id: "application-service",
    name: "アプリケーションサーバー",
    stage: "サービス",
    description: "APIリクエストを処理し、システム全体の動きを調整します。",
    concepts: ["ステートレス", "水平スケーリング"],
    effects: {
      availability: 8,
      latency: 0,
      scalability: 10,
      cost: 5
    }
  },
  {
    id: "object-storage",
    name: "オブジェクトストレージ",
    stage: "保存",
    description: "動画ファイル、サムネイル、生成済みファイルを保存します。",
    concepts: ["オブジェクトストレージ", "耐久性"],
    effects: {
      availability: 12,
      latency: 5,
      scalability: 10,
      cost: 6
    }
  },
  {
    id: "relational-database",
    name: "リレーショナルDB",
    stage: "保存",
    description: "ユーザー、動画メタデータ、権限、契約情報を保存します。",
    concepts: ["リレーショナルデータ", "メタデータ"],
    effects: {
      availability: 8,
      latency: -2,
      scalability: 2,
      cost: 8
    }
  },
  {
    id: "db-replica",
    name: "DBレプリカ",
    stage: "保存",
    description: "読み取り用の複製DBを追加し、可用性と読み取り性能を高めます。",
    concepts: ["レプリケーション", "読み取りスケーリング"],
    effects: {
      availability: 18,
      latency: 8,
      scalability: 8,
      cost: 12
    }
  },
  {
    id: "cache",
    name: "キャッシュ",
    stage: "サービス",
    description: "繰り返し発生する読み取りを減らし、背後のサービスを守ります。",
    concepts: ["キャッシュ", "低レイテンシ"],
    effects: {
      availability: 10,
      latency: 20,
      scalability: 12,
      cost: 6
    }
  },
  {
    id: "queue",
    name: "メッセージキュー",
    stage: "非同期",
    description: "非同期処理をためて、急なアクセス増加を吸収します。",
    concepts: ["キューイング", "バックプレッシャー"],
    effects: {
      availability: 12,
      latency: -3,
      scalability: 10,
      cost: 5
    }
  },
  {
    id: "pubsub",
    name: "Pub/Subバス",
    stage: "非同期",
    description: "発行したメッセージを複数の購読者へファンアウトします。",
    concepts: ["Pub/Sub", "ファンアウト", "リアルタイム"],
    effects: {
      availability: 10,
      latency: 10,
      scalability: 12,
      cost: 6
    }
  },
  {
    id: "fanout-worker",
    name: "ファンアウトワーカー",
    stage: "非同期",
    description: "投稿をフォロワーのタイムラインへ書き込み、配信を事前計算します。",
    concepts: ["ファンアウト", "非同期処理", "タイムライン生成"],
    effects: {
      availability: 6,
      latency: 14,
      scalability: 14,
      cost: 8
    }
  },
  {
    id: "rate-limiter",
    name: "レートリミッター",
    stage: "流量制御",
    description: "APIを乱用や急な書き込み増加から守ります。",
    concepts: ["レート制限", "流量制御"],
    effects: {
      availability: 8,
      latency: 0,
      scalability: 6,
      cost: 4
    }
  },
  {
    id: "consistent-hash",
    name: "コンシステントハッシュ",
    stage: "データ分散",
    description: "キャッシュやストレージの担当範囲を、少ない再配置で分散します。",
    concepts: ["コンシステントハッシュ", "パーティショニング"],
    effects: {
      availability: 8,
      latency: 8,
      scalability: 18,
      cost: 5
    }
  },
  {
    id: "key-value-store",
    name: "キーバリューストア",
    stage: "保存",
    description: "単純な参照パターンを高速かつ大規模に処理します。",
    concepts: ["キーバリューストア", "水平スケーリング"],
    effects: {
      availability: 8,
      latency: 12,
      scalability: 16,
      cost: 7
    }
  },
  {
    id: "analytics-pipeline",
    name: "分析パイプライン",
    stage: "非同期",
    description: "視聴イベントを集め、指標や推薦に使える形へ流します。",
    concepts: ["分析", "イベントストリーム"],
    effects: {
      availability: 0,
      latency: -2,
      scalability: 5,
      cost: 10
    }
  }
];
