import { createListChallenges } from "../application/listChallenges.js";
import { createListComponents } from "../application/listComponents.js";
import { createSubmitDesign } from "../application/submitDesign.js";
import { createInMemoryChallengeRepository } from "../infrastructure/inMemoryChallengeRepository.js";
import { createInMemoryComponentRepository } from "../infrastructure/inMemoryComponentRepository.js";

export function createGameController() {
  const challengeRepository = createInMemoryChallengeRepository();
  const componentRepository = createInMemoryComponentRepository();

  const listChallenges = createListChallenges({ challengeRepository });
  const listComponents = createListComponents({ componentRepository });
  const submitDesign = createSubmitDesign({ challengeRepository });

  return {
    initialState() {
      return {
        challenges: listChallenges(),
        components: listComponents()
      };
    },
    submitDesign(requestBody) {
      return submitDesign(requestBody);
    }
  };
}
