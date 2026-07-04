import { createCreateInterviewSession } from "../application/createInterviewSession.js";
import { createEvaluateInterview, DEFAULT_EVAL_MODEL } from "../application/evaluateInterview.js";
import { createListChallenges } from "../application/listChallenges.js";
import { createListComponents } from "../application/listComponents.js";
import { createSubmitDesign } from "../application/submitDesign.js";
import { createInMemoryChallengeRepository } from "../infrastructure/inMemoryChallengeRepository.js";
import { createInMemoryComponentRepository } from "../infrastructure/inMemoryComponentRepository.js";
import { createOpenAiClient } from "../infrastructure/openAiClient.js";

export function createInterviewController() {
  const challengeRepository = createInMemoryChallengeRepository();
  const componentRepository = createInMemoryComponentRepository();
  const openAiClient = createOpenAiClient({
    apiKey: process.env.OPENAI_API_KEY,
    mock: process.env.MOCK_OPENAI === "1"
  });

  const listChallenges = createListChallenges({ challengeRepository });
  const listComponents = createListComponents({ componentRepository });
  const submitDesign = createSubmitDesign({ challengeRepository });
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
    submitDesign(requestBody) {
      return submitDesign(requestBody);
    },
    createInterviewSession(requestBody) {
      return createInterviewSession(requestBody ?? {});
    },
    evaluateInterview(requestBody) {
      return evaluateInterview(requestBody ?? {});
    }
  };
}
