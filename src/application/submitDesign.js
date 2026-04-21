import { evaluateDesign } from "../domain/evaluateDesign.js";

export function createSubmitDesign({ challengeRepository }) {
  return function submitDesign({ challengeId, selectedComponentIds, connections }) {
    const challenge = challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new Error(`Challenge not found: ${challengeId}`);
    }

    return evaluateDesign(challenge, selectedComponentIds, connections);
  };
}
