import { useCallback, useEffect, useRef, useState } from "react";
import { applyRealtimeEvent } from "../src/domain/interview/transcript.js";
import { createMockRealtimeDriver } from "./mockRealtimeDriver.js";

const OPENAI_CALLS_URL = "https://api.openai.com/v1/realtime/calls";
// end_interview 後の終了タイミング制御:
// response.done は音声の「生成完了」時に届き、実際の再生はそこからさらに続くため、
// 再生終了イベント (output_audio_buffer.stopped) を一次シグナルとして待つ。
const END_MAX_WAIT_MS = 90000; // 締めの音声がどれだけ長くても最終的に終了する保険
const END_NO_AUDIO_MS = 5000; // 音声が再生されないまま終わるケースの待ち時間
const END_TAIL_MS = 1000; // stopped 後、クライアント側の再生残りを待つ

async function connectWebRtc({ clientSecret, model, onEvent, audioElement }) {
  const media = await navigator.mediaDevices.getUserMedia({ audio: true });
  const peer = new RTCPeerConnection();
  media.getTracks().forEach((track) => peer.addTrack(track, media));
  peer.ontrack = (event) => {
    if (audioElement) {
      audioElement.srcObject = event.streams[0];
    }
  };

  const channel = peer.createDataChannel("oai-events");
  const sendQueue = [];
  channel.onopen = () => {
    while (sendQueue.length > 0) {
      channel.send(sendQueue.shift());
    }
  };
  channel.onmessage = (event) => {
    try {
      onEvent(JSON.parse(event.data));
    } catch {
      // 非JSONメッセージは無視
    }
  };

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  const sdpResponse = await fetch(
    `${OPENAI_CALLS_URL}?model=${encodeURIComponent(model)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientSecret}`,
        "Content-Type": "application/sdp"
      },
      body: offer.sdp
    }
  );
  if (!sdpResponse.ok) {
    media.getTracks().forEach((track) => track.stop());
    peer.close();
    throw new Error(`Realtime 接続に失敗しました (${sdpResponse.status})`);
  }
  await peer.setRemoteDescription({
    type: "answer",
    sdp: await sdpResponse.text()
  });

  return {
    send(event) {
      const payload = JSON.stringify(event);
      if (channel.readyState === "open") {
        channel.send(payload);
      } else {
        sendQueue.push(payload);
      }
    },
    setMicEnabled(enabled) {
      media.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    },
    disconnect() {
      media.getTracks().forEach((track) => track.stop());
      channel.close();
      peer.close();
      if (audioElement) {
        audioElement.srcObject = null;
      }
    }
  };
}

export function useRealtimeInterview({ onEnded }) {
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | ended | error
  const [phase, setPhase] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [micMuted, setMicMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const driverRef = useRef(null);
  const phaseRef = useRef(null);
  const transcriptRef = useRef([]);
  const audioRef = useRef(null);
  const endedRef = useRef(false);
  const pendingEndRef = useRef(false);
  const audioPlayingRef = useRef(false);
  const maxWaitTimerRef = useRef(null);
  const noAudioTimerRef = useRef(null);
  const tailTimerRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const clearEndTimers = useCallback(() => {
    clearTimeout(maxWaitTimerRef.current);
    clearTimeout(noAudioTimerRef.current);
    clearTimeout(tailTimerRef.current);
    maxWaitTimerRef.current = null;
    noAudioTimerRef.current = null;
    tailTimerRef.current = null;
  }, []);

  const finish = useCallback(() => {
    if (endedRef.current) {
      return;
    }
    endedRef.current = true;
    clearEndTimers();
    driverRef.current?.disconnect();
    driverRef.current = null;
    setStatus("ended");
    onEndedRef.current?.(transcriptRef.current);
  }, [clearEndTimers]);

  const scheduleFinish = useCallback(() => {
    // 締めの音声を言い終えるまで待つ。output_audio_buffer.stopped が来たら終了。
    if (pendingEndRef.current) {
      return;
    }
    pendingEndRef.current = true;
    maxWaitTimerRef.current = setTimeout(finish, END_MAX_WAIT_MS);
    if (!audioPlayingRef.current) {
      // すでに言い終えている（音声が再生中でない）場合の保険
      noAudioTimerRef.current = setTimeout(finish, END_NO_AUDIO_MS);
    }
  }, [finish]);

  const handleServerEvent = useCallback(
    (event) => {
      if (event.type === "error") {
        console.error("[realtime] error event", event);
        return;
      }
      if (event.type === "output_audio_buffer.started") {
        audioPlayingRef.current = true;
        // 締めの音声が始まったので「音声なし」の保険は不要になる
        clearTimeout(noAudioTimerRef.current);
        noAudioTimerRef.current = null;
        return;
      }
      if (event.type === "output_audio_buffer.stopped") {
        audioPlayingRef.current = false;
        if (pendingEndRef.current && !tailTimerRef.current) {
          tailTimerRef.current = setTimeout(finish, END_TAIL_MS);
        }
        return;
      }
      if (event.type === "response.done") {
        const calls = (event.response?.output ?? []).filter(
          (item) => item.type === "function_call"
        );
        for (const call of calls) {
          if (call.name === "advance_phase") {
            let args = {};
            try {
              args = JSON.parse(call.arguments ?? "{}");
            } catch {
              // 引数が壊れていたらフェーズ据え置き
            }
            if (args.phase) {
              phaseRef.current = args.phase;
              setPhase(args.phase);
            }
            driverRef.current?.send({
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: call.call_id,
                output: JSON.stringify({ ok: true })
              }
            });
            driverRef.current?.send({ type: "response.create" });
          }
          if (call.name === "end_interview") {
            scheduleFinish();
          }
        }
        return;
      }
      setTranscript((current) => {
        const next = applyRealtimeEvent(current, event, phaseRef.current);
        transcriptRef.current = next;
        return next;
      });
    },
    [finish, scheduleFinish]
  );

  const connect = useCallback(
    async ({ challengeId, durationMode, accessCode, accessToken, mock = false }) => {
      if (driverRef.current) {
        return;
      }
      setStatus("connecting");
      setErrorMessage(null);
      endedRef.current = false;
      pendingEndRef.current = false;
      audioPlayingRef.current = false;
      clearEndTimers();
      try {
        if (mock) {
          const driver = createMockRealtimeDriver();
          await driver.connect({ onEvent: handleServerEvent });
          driverRef.current = driver;
        } else {
          const headers = { "Content-Type": "application/json" };
          if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
          }
          const sessionResponse = await fetch("/api/realtime-session", {
            method: "POST",
            headers,
            body: JSON.stringify({ challengeId, durationMode, accessCode })
          });
          if (!sessionResponse.ok) {
            const data = await sessionResponse.json().catch(() => ({}));
            throw new Error(
              data.error ?? `セッション発行に失敗しました (${sessionResponse.status})`
            );
          }
          const { clientSecret, model } = await sessionResponse.json();
          driverRef.current = await connectWebRtc({
            clientSecret,
            model,
            onEvent: handleServerEvent,
            audioElement: audioRef.current
          });
        }
        setStatus("connected");
      } catch (error) {
        setStatus("error");
        setErrorMessage(error.message);
      }
    },
    [clearEndTimers, handleServerEvent]
  );

  const pushBoardSnapshot = useCallback((boardText) => {
    driverRef.current?.send({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "system",
        content: [{ type: "input_text", text: `[ホワイトボード更新]\n${boardText}` }]
      }
    });
  }, []);

  const toggleMic = useCallback(() => {
    setMicMuted((muted) => {
      driverRef.current?.setMicEnabled(muted);
      return !muted;
    });
  }, []);

  const endInterview = useCallback(() => {
    finish();
  }, [finish]);

  useEffect(() => {
    return () => {
      clearEndTimers();
      driverRef.current?.disconnect();
      driverRef.current = null;
    };
  }, [clearEndTimers]);

  return {
    status,
    phase,
    transcript,
    micMuted,
    errorMessage,
    audioRef,
    connect,
    pushBoardSnapshot,
    toggleMic,
    endInterview
  };
}
