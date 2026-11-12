function assistantSpeech(itemId, text) {
  return {
    type: "response.output_audio_transcript.done",
    item_id: itemId,
    transcript: text
  };
}

function userSpeech(itemId, text) {
  return {
    type: "conversation.item.input_audio_transcription.completed",
    item_id: itemId,
    transcript: text
  };
}

function functionCall(name, args) {
  return {
    type: "response.done",
    response: {
      output: [
        {
          type: "function_call",
          name,
          call_id: `mock_${name}_${Math.random().toString(36).slice(2, 8)}`,
          arguments: JSON.stringify(args ?? {})
        }
      ]
    }
  };
}

const SCRIPT = [
  [800, assistantSpeech("m1", "こんにちは、本日面接を担当します。まずはお題を説明しますね。")],
  [1600, functionCall("advance_phase", { phase: "requirements" })],
  [3000, userSpeech("m2", "同時接続ユーザー数はどのくらいを想定していますか？")],
  [4500, assistantSpeech("m3", "良い質問です。ピーク時は50万人の同時視聴を想定してください。他に確認したい点はありますか？")],
  [6500, functionCall("advance_phase", { phase: "high_level" })],
  [8000, assistantSpeech("m4", "では全体のアーキテクチャをホワイトボードに描きながら説明してください。")],
  [10000, userSpeech("m5", "まずロードバランサーを置いて、その後ろにアプリケーションサーバーを並べます。")],
  [12000, functionCall("advance_phase", { phase: "deep_dive" })],
  [13500, assistantSpeech("m6", "読み取り経路がボトルネックになった場合、どう対処しますか？")],
  [15500, userSpeech("m7", "キャッシュとDBレプリカで読み取りをスケールさせます。")],
  // 障害注入: 置いたばかりのキャッシュを落として受け答えを見る（この機能の見せ場）
  [18000, functionCall("inject_failure", { componentId: "cache" })],
  [18400, assistantSpeech("m8", "ここで障害を起こします。いまキャッシュが停止しました。利用者には何が起きますか？")],
  [21000, userSpeech("m9", "読み取りがDBレプリカに集中するので、レート制限で守りつつキャッシュを復旧させます。")],
  [23000, functionCall("advance_phase", { phase: "wrap_up" })],
  [24500, assistantSpeech("m10", "本日はありがとうございました。障害時の考え方まで説明できていました。以上で面接を終了します。")],
  [24600, { type: "output_audio_buffer.started" }],
  [26500, functionCall("end_interview", {})],
  [29000, { type: "output_audio_buffer.stopped" }]
];

export function createMockRealtimeDriver() {
  let timers = [];
  return {
    async connect({ onEvent }) {
      timers = SCRIPT.map(([delay, event]) =>
        setTimeout(() => onEvent(event), delay)
      );
    },
    send() {},
    setMicEnabled() {},
    disconnect() {
      timers.forEach((timer) => clearTimeout(timer));
      timers = [];
    }
  };
}
