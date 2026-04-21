export function createListComponents({ componentRepository }) {
  return function listComponents() {
    return componentRepository.findAll();
  };
}
