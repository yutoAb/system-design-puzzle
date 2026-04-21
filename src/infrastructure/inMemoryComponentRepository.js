import { componentCatalog } from "../domain/fixtures/components.js";

export function createInMemoryComponentRepository() {
  return {
    findAll() {
      return componentCatalog;
    }
  };
}
