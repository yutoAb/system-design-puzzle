import { challenges } from "../domain/fixtures/challenges.js";

export function createInMemoryChallengeRepository() {
  return {
    findAll() {
      return challenges;
    },
    findById(challengeId) {
      return challenges.find((challenge) => challenge.id === challengeId);
    }
  };
}
