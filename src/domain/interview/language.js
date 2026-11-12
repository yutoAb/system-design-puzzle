// 面接の言語。英語モードは「面接は英語、講評は日本語」で、UI の枠は日本語のまま。
export const LANGUAGES = ["ja", "en"];

export function normalizeLanguage(value) {
  return value === "en" ? "en" : "ja";
}

// 候補者に見せる／面接官に渡すお題の文面を、面接の言語に合わせて取り出す
export function localizeChallenge(challenge, language) {
  const source =
    normalizeLanguage(language) === "en" && challenge.en ? challenge.en : challenge;
  return {
    title: source.title,
    prompt: source.prompt,
    functionalRequirements: source.functionalRequirements,
    nonFunctionalRequirements: source.nonFunctionalRequirements
  };
}

export function localizeComponents(componentCatalog, language) {
  if (normalizeLanguage(language) !== "en") {
    return componentCatalog;
  }
  return componentCatalog.map((component) => ({
    ...component,
    name: component.nameEn ?? component.name
  }));
}
