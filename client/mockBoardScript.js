// デモ（?mock=1）でホワイトボードが自動で組み上がっていく台本。
// at は connect からの経過ミリ秒で、mockRealtimeDriver.js の SCRIPT と対応させている:
//   8000  面接官「ホワイトボードに描きながら説明してください」
//   10000 候補者「まずロードバランサーを置いて、その後ろにアプリケーションサーバーを並べます」
//   15500 候補者「キャッシュとDBレプリカで読み取りをスケールさせます」
// 台本を変えるときは両方あわせて更新すること。
//
// 座標の制約:
// - ノードのハンドルは左=入力/右=出力に固定なので、接続先は接続元の右端より
//   さらに右に置く（崩すと線が後ろ向きに回り込んで読みにくい）。
// - ノード幅はラベル依存で 180〜280px 程度になるため、列の間隔は 280px 取る。
// - DBレプリカだけは横幅を抑えるためDBの真下に置いており、線が回り込む。
//   3列に収めておかないと、狭い画面で右端のピースが画面外に出てしまう。
export const MOCK_BOARD_SCRIPT = [
  { at: 10300, componentId: "load-balancer", position: { x: 0, y: 0 } },
  {
    at: 11400,
    componentId: "application-service",
    position: { x: 280, y: 0 },
    edge: ["load-balancer", "application-service"]
  },
  {
    at: 12400,
    componentId: "relational-database",
    position: { x: 580, y: 160 },
    edge: ["application-service", "relational-database"]
  },
  {
    at: 15900,
    componentId: "cache",
    position: { x: 580, y: 0 },
    edge: ["application-service", "cache"]
  },
  {
    at: 16900,
    componentId: "db-replica",
    position: { x: 580, y: 320 },
    edge: ["relational-database", "db-replica"]
  }
];
