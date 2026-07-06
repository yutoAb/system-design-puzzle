import { createCreateInterviewSession } from "../application/createInterviewSession.js";
import { createEvaluateInterview, DEFAULT_EVAL_MODEL } from "../application/evaluateInterview.js";
import { createListChallenges } from "../application/listChallenges.js";
import { createListComponents } from "../application/listComponents.js";
import { createInMemoryChallengeRepository } from "../infrastructure/inMemoryChallengeRepository.js";
import { createInMemoryComponentRepository } from "../infrastructure/inMemoryComponentRepository.js";
import { createOpenAiClient } from "../infrastructure/openAiClient.js";
import {
  AUTH_ERROR,
  createSupabaseAuthGateway
} from "../infrastructure/supabaseAuthGateway.js";

export const ACCESS_CODE_ERROR = "アクセスコードが正しくありません";
export { AUTH_ERROR };

export function createInterviewController() {
  const challengeRepository = createInMemoryChallengeRepository();
  const componentRepository = createInMemoryComponentRepository();
  const openAiClient = createOpenAiClient({
    apiKey: process.env.OPENAI_API_KEY,
    mock: process.env.MOCK_OPENAI === "1"
  });
  const accessCode = process.env.ACCESS_CODE;
  const authGateway = createSupabaseAuthGateway({
    url: process.env.SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    mock: process.env.MOCK_AUTH === "1"
  });

  // OpenAI を呼ぶ（= 課金が発生する）エンドポイントを守る。
  // 移行期間: 招待コード一致は従来どおり通し、それ以外は Supabase ログインを検証する。
  // Supabase 未設定なら従来の招待コードのみの動作に落ちる。
  async function authorize(requestBody, authToken) {
    if (accessCode && requestBody?.accessCode === accessCode) {
      return null;
    }
    if (authGateway) {
      return authGateway.verifyToken(authToken);
    }
    if (accessCode) {
      throw new Error(ACCESS_CODE_ERROR);
    }
    return null;
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
    async me(authToken) {
      if (!authGateway) {
        throw new Error(AUTH_ERROR);
      }
      const user = await authGateway.verifyToken(authToken);
      // balance は M2（チケット台帳）で実残高になる
      return { userId: user.userId, email: user.email, balance: null };
    },
    async createInterviewSession(requestBody, authToken) {
      await authorize(requestBody, authToken);
      return createInterviewSession(requestBody ?? {});
    },
    async evaluateInterview(requestBody, authToken) {
      await authorize(requestBody, authToken);
      return evaluateInterview(requestBody ?? {});
    }
  };
}
