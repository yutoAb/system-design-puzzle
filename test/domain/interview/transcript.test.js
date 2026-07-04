import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyRealtimeEvent,
  formatTranscript
} from "../../../src/domain/interview/transcript.js";

describe("applyRealtimeEvent", () => {
  it("appends a finished user transcription", () => {
    const next = applyRealtimeEvent(
      [],
      {
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "item_1",
        transcript: "CDNを置きます"
      },
      "high_level"
    );
    assert.deepEqual(next, [
      {
        id: "item_1",
        role: "user",
        text: "CDNを置きます",
        phase: "high_level",
        final: true
      }
    ]);
  });

  it("ignores empty user transcriptions", () => {
    const next = applyRealtimeEvent(
      [],
      {
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "item_1",
        transcript: "  "
      },
      "requirements"
    );
    assert.deepEqual(next, []);
  });

  it("accumulates assistant deltas then finalizes on done", () => {
    let transcript = [];
    transcript = applyRealtimeEvent(
      transcript,
      {
        type: "response.output_audio_transcript.delta",
        item_id: "item_2",
        delta: "なぜ"
      },
      "deep_dive"
    );
    transcript = applyRealtimeEvent(
      transcript,
      {
        type: "response.output_audio_transcript.delta",
        item_id: "item_2",
        delta: "キャッシュを？"
      },
      "deep_dive"
    );
    assert.equal(transcript[0].text, "なぜキャッシュを？");
    assert.equal(transcript[0].final, false);

    transcript = applyRealtimeEvent(
      transcript,
      {
        type: "response.output_audio_transcript.done",
        item_id: "item_2",
        transcript: "なぜキャッシュをそこに置いたのですか？"
      },
      "deep_dive"
    );
    assert.deepEqual(transcript, [
      {
        id: "item_2",
        role: "assistant",
        text: "なぜキャッシュをそこに置いたのですか？",
        phase: "deep_dive",
        final: true
      }
    ]);
  });

  it("keeps conversation order when user transcription completes late", () => {
    let transcript = [];
    // ユーザーが話し終える → アイテムが先に生成される
    transcript = applyRealtimeEvent(
      transcript,
      {
        type: "conversation.item.added",
        item: { id: "user_1", type: "message", role: "user" }
      },
      "requirements"
    );
    // 面接官の応答が先に流れ始める
    transcript = applyRealtimeEvent(
      transcript,
      {
        type: "response.output_audio_transcript.done",
        item_id: "asst_1",
        transcript: "なるほど、承知しました。"
      },
      "requirements"
    );
    // ユーザー発話の文字起こしは遅れて完了する
    transcript = applyRealtimeEvent(
      transcript,
      {
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "user_1",
        transcript: "同時接続は10万を想定します"
      },
      "requirements"
    );
    assert.deepEqual(
      transcript.map((entry) => [entry.role, entry.text]),
      [
        ["user", "同時接続は10万を想定します"],
        ["assistant", "なるほど、承知しました。"]
      ]
    );
  });

  it("drops the placeholder when transcription comes back empty", () => {
    let transcript = applyRealtimeEvent(
      [],
      {
        type: "conversation.item.added",
        item: { id: "user_1", type: "message", role: "user" }
      },
      null
    );
    transcript = applyRealtimeEvent(
      transcript,
      {
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "user_1",
        transcript: " "
      },
      null
    );
    assert.deepEqual(transcript, []);
  });

  it("ignores non-user item added events", () => {
    const transcript = applyRealtimeEvent(
      [],
      {
        type: "conversation.item.added",
        item: { id: "sys_1", type: "message", role: "system" }
      },
      null
    );
    assert.deepEqual(transcript, []);
  });

  it("returns the transcript unchanged for unrelated events", () => {
    const transcript = [{ id: "a", role: "user", text: "x", phase: null, final: true }];
    assert.equal(
      applyRealtimeEvent(transcript, { type: "response.done" }, null),
      transcript
    );
  });
});

describe("formatTranscript", () => {
  it("labels speakers in Japanese and skips empty entries", () => {
    const text = formatTranscript([
      { id: "1", role: "assistant", text: "自己紹介をお願いします", final: true },
      { id: "2", role: "user", text: "", final: true },
      { id: "3", role: "user", text: "はい、阿部です", final: true }
    ]);
    assert.equal(text, "面接官: 自己紹介をお願いします\n候補者: はい、阿部です");
  });
});
