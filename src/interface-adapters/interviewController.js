import { createCreateInterviewSession } from "../application/createInterviewSession.js";
import { createEvaluateInterview, DEFAULT_EVAL_MODEL } from "../application/evaluateInterview.js";
import { createListChallenges } from "../application/listChallenges.js";
import { createListComponents } from "../application/listComponents.js";
import { createInMemoryChallengeRepository } from "../infrastructure/inMemoryChallengeRepository.js";
import { createInMemoryComponentRepository } from "../infrastructure/inMemoryComponentRepository.js";
import { createOpenAiClient } from "../infrastructure/openAiClient.js";

export const ACCESS_CODE_ERROR = "アクセスコードが正しくありません";

export function createInterviewController() {
  const challengeRepository = createInMemoryChallengeRepository();
  const componentRepository = createInMemoryComponentRepository();
  const openAiClient = createOpenAiClient({
    apiKey: process.env.OPENAI_API_KEY,
    mock: process.env.MOCK_OPENAI === "1"
  });
  const accessCode = process.env.ACCESS_CODE;

  // OpenAI を呼ぶ（= 課金が発生する）エンドポイントだけを招待コードで守る
  function assertAccessCode(requestBody) {
    if (!accessCode) {
      return;
    }
    if (requestBody?.accessCode !== accessCode) {
      throw new Error(ACCESS_CODE_ERROR);
    }
  }

  const listChallenges = createListChallenges({ challengeRepository });
  const listComponents = createListComponents({ componentRepository });
  const createInterviewSession = createCreateInterviewSession({
    challengeRepository,
    componentRepository,
    openAiClient
  });
  const evaluateInterview = createEvaluateInterview({
    challengeRepository,
    componentRepository,
    openAiClient,
    evalModel: process.env.EVAL_MODEL ?? DEFAULT_EVAL_MODEL
  });

  return {
    initialState() {
      return {
        challenges: listChallenges(),
        components: listComponents()
      };
    },
    async createInterviewSession(requestBody) {
      assertAccessCode(requestBody);
      return createInterviewSession(requestBody ?? {});
    },
    async evaluateInterview(requestBody) {
      assertAccessCode(requestBody);
      return evaluateInterview(requestBody ?? {});
    }
  };
}
