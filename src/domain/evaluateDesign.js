import { componentCatalog } from "./fixtures/components.js";

const BASE_SCORES = {
  availability: 30,
  latency: 35,
  scalability: 20,
  cost: 100
};

const COMPONENTS_BY_ID = new Map(
  componentCatalog.map((component) => [component.id, component])
);

export function evaluateDesign(challenge, selectedComponentIds, connections = []) {
  const uniqueSelectedIds = [...new Set(selectedComponentIds)];
  const selectedComponents = uniqueSelectedIds
    .map((componentId) => COMPONENTS_BY_ID.get(componentId))
    .filter(Boolean);

  const requiredConnections = normalizeRequiredConnections(
    challenge.requiredConnections
  );
  const providedConnections = normalizeProvidedConnections(
    connections,
    uniqueSelectedIds
  );
  const matchedConnections = requiredConnections.filter((required) =>
    providedConnections.some((provided) => sameConnection(required, provided))
  );
  const missingConnections = requiredConnections.filter(
    (required) => !matchedConnections.some((matched) => sameConnection(matched, required))
  );

  const dimensionScores = {
    scalability: clampScore(
      sumEffects(selectedComponents, "scalability") -
        missingRequiredComponents(challenge.requiredComponentIds, uniqueSelectedIds)
          .length *
          6
    ),
    availability: clampScore(
      sumEffects(selectedComponents, "availability") -
        missingRequiredComponents(challenge.requiredComponentIds, uniqueSelectedIds)
          .length *
          8
    ),
    latency: clampScore(
      sumEffects(selectedComponents, "latency") -
        missingRequiredComponents(challenge.requiredComponentIds, uniqueSelectedIds).reduce(
          (penalty, componentId) => penalty + latencyPenaltyForMissing(componentId),
          0
        )
    ),
    cost: clampScore(
      BASE_SCORES.cost -
        selectedComponents.reduce(
          (score, component) => score + component.effects.cost,
          0
        ) -
        budgetOverrunPenalty(challenge.architectureBudget, selectedComponents)
    ),
    requirements: calculateRequirementCoverage(
      challenge.requiredComponentIds,
      uniqueSelectedIds,
      requiredConnections,
      matchedConnections
    )
  };

  const totalScore = calculateWeightedAverage(
    dimensionScores,
    challenge.scoringWeights
  );

  return {
    challengeId: challenge.id,
    totalScore,
    dimensionScores,
    coveredConcepts: coveredConcepts(challenge, selectedComponents),
    architectureCost: architectureCost(selectedComponents),
    budget: challenge.architectureBudget,
    matchedConnections: matchedConnections.map(([a, b]) => [a, b]),
    missingConnections: missingConnections.map(([a, b]) => [a, b]),
    strengths: buildStrengths(
      challenge,
      uniqueSelectedIds,
      requiredConnections,
      matchedConnections
    ),
    risks: buildRisks(
      challenge,
      uniqueSelectedIds,
      missingConnections
    ),
    interviewNotes: buildInterviewNotes(challenge, selectedComponents)
  };
}

function sumEffects(selectedComponents, dimension) {
  return selectedComponents.reduce(
    (score, component) => score + component.effects[dimension],
    BASE_SCORES[dimension]
  );
}

function architectureCost(selectedComponents) {
  return selectedComponents.reduce(
    (total, component) => total + component.effects.cost,
    0
  );
}

function budgetOverrunPenalty(architectureBudget, selectedComponents) {
  if (!architectureBudget) {
    return 0;
  }

  return Math.max(0, architectureCost(selectedComponents) - architectureBudget) * 2;
}

function calculateRequirementCoverage(
  requiredComponentIds,
  selectedComponentIds,
  requiredConnections,
  matchedConnections
) {
  const componentCoverage = ratio(
    matchedRequiredComponents(requiredComponentIds, selectedComponentIds).length,
    requiredComponentIds.length
  );

  if (requiredConnections.length === 0) {
    return Math.round(20 + componentCoverage * 80);
  }

  const connectionCoverage = ratio(
    matchedConnections.length,
    requiredConnections.length
  );

  return Math.round(20 + ((componentCoverage + connectionCoverage) / 2) * 80);
}

function ratio(matched, total) {
  if (total === 0) {
    return 1;
  }
  return matched / total;
}

function matchedRequiredComponents(requiredComponentIds, selectedComponentIds) {
  const selected = new Set(selectedComponentIds);
  return requiredComponentIds.filter((componentId) => selected.has(componentId));
}

function missingRequiredComponents(requiredComponentIds, selectedComponentIds) {
  const selected = new Set(selectedComponentIds);
  return requiredComponentIds.filter((componentId) => !selected.has(componentId));
}

function latencyPenaltyForMissing(componentId) {
  return componentId === "cdn" ? 15 : 4;
}

function calculateWeightedAverage(dimensionScores, scoringWeights) {
  const entries = Object.entries(scoringWeights);
  const weightTotal = entries.reduce((total, [, weight]) => total + weight, 0);
  const weightedTotal = entries.reduce(
    (total, [dimension, weight]) => total + dimensionScores[dimension] * weight,
    0
  );

  return Math.round(weightedTotal / weightTotal);
}

function normalizeRequiredConnections(requiredConnections) {
  if (!Array.isArray(requiredConnections)) {
    return [];
  }

  const seen = new Set();
  const result = [];
  for (const connection of requiredConnections) {
    if (!Array.isArray(connection) || connection.length !== 2) {
      continue;
    }
    const [a, b] = connection;
    if (a === b) {
      continue;
    }
    const key = connectionKey(a, b);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push([a, b]);
  }
  return result;
}

function normalizeProvidedConnections(connections, selectedComponentIds) {
  if (!Array.isArray(connections)) {
    return [];
  }

  const selected = new Set(selectedComponentIds);
  const seen = new Set();
  const result = [];
  for (const connection of connections) {
    if (!Array.isArray(connection) || connection.length !== 2) {
      continue;
    }
    const [a, b] = connection;
    if (a === b) {
      continue;
    }
    if (!selected.has(a) || !selected.has(b)) {
      continue;
    }
    const key = connectionKey(a, b);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push([a, b]);
  }
  return result;
}

function sameConnection(a, b) {
  return connectionKey(a[0], a[1]) === connectionKey(b[0], b[1]);
}

function connectionKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function componentName(componentId) {
  return COMPONENTS_BY_ID.get(componentId)?.name ?? componentId;
}

function buildStrengths(
  challenge,
  selectedComponentIds,
  requiredConnections,
  matchedConnections
) {
  const selected = new Set(selectedComponentIds);
  const strengths = [];

  for (const recommendation of challenge.recommendations ?? []) {
    if (recommendation.strength && selected.has(recommendation.componentId)) {
      strengths.push(recommendation.strength);
    }
  }

  const coveredComponents = challenge.requiredComponentIds.every(
    (componentId) => selected.has(componentId)
  );
  if (coveredComponents) {
    strengths.push("中核の処理経路に必要なピースがそろっています。");
  }

  if (
    requiredConnections.length > 0 &&
    matchedConnections.length === requiredConnections.length
  ) {
    strengths.push("必要な接続がすべて張られており、経路として説明できます。");
  }

  return strengths;
}

function buildRisks(challenge, selectedComponentIds, missingConnections) {
  const selected = new Set(selectedComponentIds);
  const risks = challenge.requiredComponentIds
    .filter((componentId) => !selected.has(componentId))
    .map((componentId) => {
      const component = COMPONENTS_BY_ID.get(componentId);
      return `${component.name} が中核アーキテクチャから抜けています。`;
    });

  for (const [a, b] of missingConnections) {
    if (selected.has(a) && selected.has(b)) {
      risks.push(
        `${componentName(a)} と ${componentName(b)} が接続されていません。経路として説明できるように線を引きましょう。`
      );
    }
  }

  for (const recommendation of challenge.recommendations ?? []) {
    if (recommendation.risk && !selected.has(recommendation.componentId)) {
      risks.push(recommendation.risk);
    }
  }

  return risks;
}

function coveredConcepts(challenge, selectedComponents) {
  if (!challenge.targetConcepts) {
    return [];
  }

  const selectedConcepts = new Set(
    selectedComponents.flatMap((component) => component.concepts)
  );

  return challenge.targetConcepts.filter((concept) => selectedConcepts.has(concept));
}

function buildInterviewNotes(challenge, selectedComponents) {
  if (!challenge.targetConcepts || !challenge.architectureBudget) {
    return [];
  }

  const concepts = coveredConcepts(challenge, selectedComponents);
  const missingConcepts = challenge.targetConcepts.filter(
    (concept) => !concepts.includes(concept)
  );

  return [
    {
      title: "要件確認",
      message:
        "最初に機能要件、非機能要件、トラフィックの前提を言語化しましょう。"
    },
    {
      title: "トレードオフ",
      message: `アーキテクチャ予算 ${architectureCost(selectedComponents)}/${challenge.architectureBudget}。コストが増えても、明確なスケール性や信頼性を買えるなら妥当です。`
    },
    {
      title: "議論カバレッジ",
      message:
        missingConcepts.length === 0
          ? "この設計は、このお題で議論したい主要論点をカバーしています。"
          : `不足している論点: ${missingConcepts.join("、")}。`
    }
  ];
}

function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}
