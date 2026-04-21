export function createListChallenges({ challengeRepository }) {
  return function listChallenges() {
    return challengeRepository.findAll();
  };
}
