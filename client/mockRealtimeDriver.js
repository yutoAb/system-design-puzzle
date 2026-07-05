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
  [800, assistantSpeech("m1", "こんにちは、本日面接を担当します。まずはお題を説明しますね。（モック応答）")],
  [1600, functionCall("advance_phase", { phase: "requirements" })],
  [3000, userSpeech("m2", "同時接続ユーザー数はどのくらいを想定していますか？（モック候補者）")],
  [4500, assistantSpeech("m3", "良い質問です。ピーク時は100万人を想定してください。他に確認したい点はありますか？")],
  [6500, functionCall("advance_phase", { phase: "high_level" })],
  [8000, assistantSpeech("m4", "では全体のアーキテクチャをホワイトボードに描きながら説明してください。")],
  [10000, userSpeech("m5", "まずロードバランサーを置いて、その後ろにアプリケーションサーバーを並べます。")],
  [12000, functionCall("advance_phase", { phase: "deep_dive" })],
  [13500, assistantSpeech("m6", "読み取り経路がボトルネックになった場合、どう対処しますか？")],
  [15500, userSpeech("m7", "キャッシュとDBレプリカで読み取りをスケールさせます。")],
  [17000, functionCall("advance_phase", { phase: "wrap_up" })],
  [18500, assistantSpeech("m8", "本日はありがとうございました。全体像の説明が明快でした。以上で面接を終了します。")],
  [18600, { type: "output_audio_buffer.started" }],
  [20500, functionCall("end_interview", {})],
  [23000, { type: "output_audio_buffer.stopped" }]
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
