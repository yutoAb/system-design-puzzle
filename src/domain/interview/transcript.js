export function applyRealtimeEvent(transcript, event, phase) {
  switch (event?.type) {
    // ユーザー発話の文字起こしは応答より遅れて完了するため、
    // アイテム生成イベントの時点で空のプレースホルダーを確保して会話順を保つ
    case "conversation.item.added":
    case "conversation.item.created": {
      const item = event.item;
      if (item?.type !== "message" || item.role !== "user") {
        return transcript;
      }
      if (transcript.some((entry) => entry.id === item.id)) {
        return transcript;
      }
      return [
        ...transcript,
        { id: item.id, role: "user", text: "", phase, final: false }
      ];
    }
    case "conversation.item.input_audio_transcription.completed": {
      const text = (event.transcript ?? "").trim();
      const existing = transcript.find((entry) => entry.id === event.item_id);
      if (existing) {
        if (text === "") {
          return transcript.filter((entry) => entry.id !== event.item_id);
        }
        return transcript.map((entry) =>
          entry.id === event.item_id ? { ...entry, text, final: true } : entry
        );
      }
      if (text === "") return transcript;
      return [
        ...transcript,
        { id: event.item_id, role: "user", text, phase, final: true }
      ];
    }
    case "response.output_audio_transcript.delta": {
      const existing = transcript.find((entry) => entry.id === event.item_id);
      if (existing) {
        return transcript.map((entry) =>
          entry.id === event.item_id
            ? { ...entry, text: entry.text + (event.delta ?? "") }
            : entry
        );
      }
      return [
        ...transcript,
        {
          id: event.item_id,
          role: "assistant",
          text: event.delta ?? "",
          phase,
          final: false
        }
      ];
    }
    case "response.output_audio_transcript.done": {
      const text = event.transcript ?? "";
      const existing = transcript.find((entry) => entry.id === event.item_id);
      if (existing) {
        return transcript.map((entry) =>
          entry.id === event.item_id ? { ...entry, text, final: true } : entry
        );
      }
      if (text.trim() === "") return transcript;
      return [
        ...transcript,
        { id: event.item_id, role: "assistant", text, phase, final: true }
      ];
    }
    default:
      return transcript;
  }
}

export function formatTranscript(transcript) {
  return transcript
    .filter((entry) => entry.text.trim() !== "")
    .map((entry) => {
      const speaker = entry.role === "assistant" ? "面接官" : "候補者";
      return `${speaker}: ${entry.text}`;
    })
    .join("\n");
}
