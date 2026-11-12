import { buildEvaluationPrompt } from "../domain/interview/buildEvaluationPrompt.js";
import { localizeComponents, normalizeLanguage } from "../domain/interview/language.js";
import { serializeBoard } from "../domain/interview/serializeBoard.js";

export const DEFAULT_EVAL_MODEL = "gpt-5-mini";

export function createEvaluateInterview({
  challengeRepository,
  componentRepository,
  openAiClient,
  evalModel = DEFAULT_EVAL_MODEL
}) {
  return async function evaluateInterview({
    challengeId,
    transcript,
    board,
    language,
    injectedFailures
  }) {
    const interviewLanguage = normalizeLanguage(language);
    const challenge = challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new Error(`unknown challenge: ${challengeId}`);
    }
    if (!Array.isArray(transcript) || transcript.length === 0) {
      throw new Error("transcript is required");
    }

    const componentCatalog = localizeComponents(
      componentRepository.findAll(),
      interviewLanguage
    );
    const boardText = serializeBoard(board, componentCatalog);
    // クライアントから来る値なので、既知のコンポーネントだけを名前に直して使う
    const failureNames = (Array.isArray(injectedFailures) ? injectedFailures : [])
      .map((id) => componentCatalog.find((component) => component.id === id)?.name)
      .filter(Boolean)
      .slice(0, 5);
    const { input, jsonSchema } = buildEvaluationPrompt(
      challenge,
      transcript,
      boardText,
      { language: interviewLanguage, injectedFailures: failureNames }
    );

    return openAiClient.createStructuredResponse({
      model: evalModel,
      input,
      jsonSchema
    });
  };
}
