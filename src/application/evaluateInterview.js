import { buildEvaluationPrompt } from "../domain/interview/buildEvaluationPrompt.js";
import { serializeBoard } from "../domain/interview/serializeBoard.js";

export const DEFAULT_EVAL_MODEL = "gpt-5-mini";

export function createEvaluateInterview({
  challengeRepository,
  componentRepository,
  openAiClient,
  evalModel = DEFAULT_EVAL_MODEL
}) {
  return async function evaluateInterview({ challengeId, transcript, board }) {
    const challenge = challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new Error(`unknown challenge: ${challengeId}`);
    }
    if (!Array.isArray(transcript) || transcript.length === 0) {
      throw new Error("transcript is required");
    }

    const boardText = serializeBoard(board, componentRepository.findAll());
    const { input, jsonSchema } = buildEvaluationPrompt(
      challenge,
      transcript,
      boardText
    );

    return openAiClient.createStructuredResponse({
      model: evalModel,
      input,
      jsonSchema
    });
  };
}
