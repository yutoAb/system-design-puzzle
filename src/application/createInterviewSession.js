import { buildInterviewerInstructions } from "../domain/interview/buildInterviewerInstructions.js";
import { realtimeTools } from "../domain/interview/realtimeTools.js";

export const REALTIME_MODEL = "gpt-realtime";

export function createCreateInterviewSession({
  challengeRepository,
  componentRepository,
  openAiClient
}) {
  return async function createInterviewSession({
    challengeId,
    durationMode = "full"
  }) {
    const challenge = challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new Error(`unknown challenge: ${challengeId}`);
    }

    const instructions = buildInterviewerInstructions(
      challenge,
      componentRepository.findAll(),
      { durationMode }
    );

    const secret = await openAiClient.createClientSecret({
      expires_after: { anchor: "created_at", seconds: 3600 },
      session: {
        type: "realtime",
        model: REALTIME_MODEL,
        instructions,
        audio: {
          input: {
            transcription: { model: "gpt-4o-transcribe", language: "ja" },
            turn_detection: { type: "semantic_vad" }
          },
          output: { voice: "marin" }
        },
        tools: realtimeTools,
        tool_choice: "auto"
      }
    });

    return {
      clientSecret: secret.value,
      expiresAt: secret.expires_at,
      model: REALTIME_MODEL
    };
  };
}
