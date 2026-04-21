const state = {
  challenges: [],
  components: [],
  activeChallengeId: undefined,
  placedComponentIds: new Set(),
  connections: [],
  draggingComponentId: undefined,
  connectionSource: undefined,
  lastResult: undefined
};

const challengeTitle = document.querySelector("#challengeTitle");
const challengePrompt = document.querySelector("#challengePrompt");
const challengeSelect = document.querySelector("#challengeSelect");
const requirements = document.querySelector("#requirements");
const componentList = document.querySelector("#componentList");
const selectedComponents = document.querySelector("#selectedComponents");
const connectionLayer = document.querySelector("#connectionLayer");
const connectionHint = document.querySelector("#connectionHint");
const designForm = document.querySelector("#designForm");
const scoreResult = document.querySelector("#scoreResult");
const budgetValue = document.querySelector("#budgetValue");
const budgetMeter = document.querySelector("#budgetMeter");
const resetBoard = document.querySelector("#resetBoard");

const dimensionLabels = {
  scalability: "スケール性",
  availability: "可用性",
  latency: "低レイテンシ",
  cost: "コスト効率",
  requirements: "要件充足"
};

const stages = [
  { id: "エッジ", hint: "ユーザーに最も近い層。CDN・ゲートウェイなど。" },
  { id: "流量制御", hint: "トラフィックを捌く層。LB・レートリミッター。" },
  { id: "サービス", hint: "ロジックを処理する層。APIサーバー・キャッシュ。" },
  { id: "保存", hint: "データを持つ層。DB・オブジェクトストレージ。" },
  { id: "非同期", hint: "裏側で走る処理。キュー・Pub/Sub・ワーカー。" },
  { id: "データ分散", hint: "分割や担当割当の戦略。コンシステントハッシュ。" }
];

const response = await fetch("/api/initial-state");
const initialState = await response.json();

state.challenges = initialState.challenges;
state.components = initialState.components;
state.activeChallengeId = state.challenges[0]?.id;

renderChallengeSelect();
renderActiveChallenge();

challengeSelect.addEventListener("change", (event) => {
  state.activeChallengeId = event.target.value;
  resetDesign();
  renderActiveChallenge();
});

designForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const selectedComponentIds = getPlacedComponentIds();
  const response = await fetch("/api/submit-design", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      challengeId: state.activeChallengeId,
      selectedComponentIds,
      connections: state.connections.map(({ from, to }) => [from, to])
    })
  });

  const result = await response.json();
  state.lastResult = result;
  renderGame();
  renderScore(result);
});

resetBoard.addEventListener("click", () => {
  resetDesign();
  renderGame();
});

componentList.addEventListener("dragstart", handleDragStart);
componentList.addEventListener("dragover", (event) => {
  event.preventDefault();
});
componentList.addEventListener("drop", (event) => {
  event.preventDefault();
  const componentId = event.dataTransfer.getData("text/plain");
  removePlacedComponent(componentId);
  state.draggingComponentId = undefined;
  renderGame();
});
componentList.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action='place']");
  if (!action) {
    return;
  }

  placeComponent(action.dataset.componentId);
  renderGame();
});

selectedComponents.addEventListener("dragstart", handleDragStart);
selectedComponents.addEventListener("dragover", handleLaneDragOver);
selectedComponents.addEventListener("drop", handleLaneDrop);
selectedComponents.addEventListener("dragleave", (event) => {
  const lane = event.target.closest("[data-stage]");
  if (lane) {
    lane.classList.remove("drop-ready");
  }
});
selectedComponents.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-action='remove']");
  if (removeButton) {
    removePlacedComponent(removeButton.dataset.componentId);
    renderGame();
    return;
  }

  const piece = event.target.closest(".piece");
  if (piece) {
    togglePieceConnection(piece.dataset.componentId);
    renderGame();
  }
});

document.addEventListener("dragend", () => {
  state.draggingComponentId = undefined;
  clearDropReady();
});

window.addEventListener("resize", renderConnections);

function renderChallengeSelect() {
  challengeSelect.innerHTML = state.challenges
    .map(
      (challenge) =>
        `<option value="${challenge.id}">${challenge.title}</option>`
    )
    .join("");
  challengeSelect.value = state.activeChallengeId;
}

function renderActiveChallenge() {
  const challenge = activeChallenge();
  if (!challenge) {
    return;
  }

  challengeTitle.textContent = challenge.title;
  challengePrompt.textContent = challenge.prompt;
  renderRequirements(challenge);
  renderGame();
  scoreResult.innerHTML = "";
}

function renderGame() {
  renderComponents();
  renderSelectedComponents();
  renderConnectionHint();
  renderConnections();
}

function renderRequirements(challenge) {
  requirements.innerHTML = `
    <div>
      <h2>機能要件</h2>
      <ul>${challenge.functionalRequirements
        .map((requirement) => `<li>${requirement}</li>`)
        .join("")}</ul>
    </div>
    <div>
      <h2>非機能要件</h2>
      <ul>${challenge.nonFunctionalRequirements
        .map((requirement) => `<li>${requirement}</li>`)
        .join("")}</ul>
    </div>
    <div>
      <h2>面接メモ</h2>
      <ul>${challenge.interviewPrompts
        .map((prompt) => `<li>${prompt}</li>`)
        .join("")}</ul>
    </div>
  `;
}

function renderComponents() {
  const challenge = activeChallenge();
  const relevantIds = new Set([
    ...(challenge?.requiredComponentIds ?? []),
    ...(challenge?.recommendedComponentIds ?? [])
  ]);

  const available = state.components
    .filter((component) => !state.placedComponentIds.has(component.id))
    .map((component) => ({
      ...component,
      isRequired: challenge?.requiredComponentIds.includes(component.id) ?? false,
      isRecommended: relevantIds.has(component.id)
    }))
    .sort((left, right) => {
      if (left.isRequired !== right.isRequired) {
        return left.isRequired ? -1 : 1;
      }
      if (left.isRecommended !== right.isRecommended) {
        return left.isRecommended ? -1 : 1;
      }
      return 0;
    });

  componentList.innerHTML =
    available
      .map(
        (component) => `
          <article class="component-option ${component.isRequired ? "required" : ""}" draggable="true" data-component-id="${component.id}">
            <span>
              <strong>${component.name}${component.isRequired ? " ★必須" : ""}</strong>
              <em>${component.stage}</em>
              <small>${component.description}</small>
            </span>
            <button type="button" class="small-button" data-action="place" data-component-id="${component.id}">配置</button>
          </article>
        `
      )
      .join("") || "<p class=\"panel-copy\">すべてのピースを配置済みです。</p>";
}

function renderSelectedComponents() {
  const selectedItems = state.components.filter((component) =>
    state.placedComponentIds.has(component.id)
  );
  const selectedCost = selectedItems.reduce(
    (total, component) => total + component.effects.cost,
    0
  );
  const challenge = activeChallenge();
  const budget = challenge?.architectureBudget ?? 0;

  budgetValue.textContent = `${selectedCost}/${budget}`;
  budgetMeter.max = budget || 100;
  budgetMeter.value = Math.min(selectedCost, budget || 100);

  selectedComponents.innerHTML = renderLanes(selectedItems);
}

function renderLanes(selectedItems) {
  return stages
    .map((stage) => {
      const items = selectedItems.filter((component) => component.stage === stage.id);
      return `
        <section class="lane" data-stage="${stage.id}">
          <header>
            <h3>${stage.id}</h3>
            <small class="lane-hint">${stage.hint}</small>
          </header>
          <div class="lane-body">
            ${
              items.length === 0
                ? "<span class=\"empty-piece\">未配置</span>"
                : items
                    .map((component) => renderPiece(component))
                    .join("")
            }
          </div>
        </section>
      `;
    })
    .join("");
}

function renderPiece(component) {
  const isSource = state.connectionSource === component.id;
  return `
    <article class="piece ${isSource ? "connecting" : ""}" draggable="true" data-component-id="${component.id}">
      <span class="piece-name">${component.name}</span>
      <small>コスト ${component.effects.cost}</small>
      <button type="button" data-action="remove" data-component-id="${component.id}" aria-label="${component.name}を外す">外す</button>
    </article>
  `;
}

function renderConnectionHint() {
  if (!state.connectionSource) {
    if (state.placedComponentIds.size < 2) {
      connectionHint.textContent = "ピースを2つ以上置くと、クリックで接続できます。";
    } else {
      connectionHint.textContent = "ピースをクリックすると接続の始点を指定できます。";
    }
    return;
  }
  const source = componentById(state.connectionSource);
  connectionHint.textContent = `${source?.name ?? state.connectionSource} を始点に選択中。つなぐ相手のピースをクリック、もう一度始点をクリックでキャンセル。`;
}

function renderConnections() {
  if (!connectionLayer) {
    return;
  }

  const boardRect = connectionLayer.getBoundingClientRect();
  connectionLayer.setAttribute("width", boardRect.width);
  connectionLayer.setAttribute("height", boardRect.height);
  connectionLayer.setAttribute(
    "viewBox",
    `0 0 ${boardRect.width} ${boardRect.height}`
  );

  const requiredConnections = activeChallenge()?.requiredConnections ?? [];
  const requiredKeySet = new Set(
    requiredConnections.map(([a, b]) => connectionKey(a, b))
  );

  const lines = state.connections
    .map(({ from, to }) => {
      const fromRect = getPieceRect(from);
      const toRect = getPieceRect(to);
      if (!fromRect || !toRect) {
        return "";
      }
      const key = connectionKey(from, to);
      const isRequired = requiredKeySet.has(key);
      const x1 = fromRect.x - boardRect.x + fromRect.width / 2;
      const y1 = fromRect.y - boardRect.y + fromRect.height / 2;
      const x2 = toRect.x - boardRect.x + toRect.width / 2;
      const y2 = toRect.y - boardRect.y + toRect.height / 2;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="connection ${isRequired ? "required" : "extra"}" />`;
    })
    .join("");

  const missingLines = activeChallenge()
    ? requiredConnections
        .filter(([a, b]) => {
          if (!state.placedComponentIds.has(a) || !state.placedComponentIds.has(b)) {
            return false;
          }
          const key = connectionKey(a, b);
          return !state.connections.some(
            (connection) => connectionKey(connection.from, connection.to) === key
          );
        })
        .map(([a, b]) => {
          const fromRect = getPieceRect(a);
          const toRect = getPieceRect(b);
          if (!fromRect || !toRect) {
            return "";
          }
          const x1 = fromRect.x - boardRect.x + fromRect.width / 2;
          const y1 = fromRect.y - boardRect.y + fromRect.height / 2;
          const x2 = toRect.x - boardRect.x + toRect.width / 2;
          const y2 = toRect.y - boardRect.y + toRect.height / 2;
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="connection missing" />`;
        })
        .join("")
    : "";

  connectionLayer.innerHTML = lines + missingLines;
}

function getPieceRect(componentId) {
  const element = selectedComponents.querySelector(
    `.piece[data-component-id="${componentId}"]`
  );
  return element?.getBoundingClientRect();
}

function renderScore(result) {
  scoreResult.innerHTML = `
    <h2>スコア ${result.totalScore}</h2>
    <p class="score-copy">予算 ${result.architectureCost}/${result.budget}。接続が足りないと、面接で「つながりを説明して」と突っ込まれる部分です。</p>
    <div class="metrics">
      ${Object.entries(result.dimensionScores)
        .map(
          ([label, score]) => `
            <div>
              <strong>${score}</strong>
              <span>${dimensionLabels[label] ?? label}</span>
            </div>
          `
        )
        .join("")}
    </div>
    ${renderConnectionCoverage(result)}
    <div class="feedback">
      <div>
        <h3>強み</h3>
        <ul>${result.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
      <div>
        <h3>リスク</h3>
        <ul>${result.risks.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    </div>
    <div class="interview-notes">
      ${result.interviewNotes
        .map(
          (note) => `
            <article>
              <h3>${note.title}</h3>
              <p>${note.message}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderConnectionCoverage(result) {
  const matched = result.matchedConnections ?? [];
  const missing = result.missingConnections ?? [];
  if (matched.length === 0 && missing.length === 0) {
    return "";
  }

  const formatPair = ([a, b]) => `${componentName(a)} ↔ ${componentName(b)}`;
  const matchedItems = matched.map((pair) => `<li>${formatPair(pair)}</li>`).join("");
  const missingItems = missing.map((pair) => `<li>${formatPair(pair)}</li>`).join("");

  return `
    <div class="connection-coverage">
      <div>
        <h3>つながった経路 ${matched.length}/${matched.length + missing.length}</h3>
        <ul class="connection-list matched">${matchedItems || "<li class=\"empty\">まだ0本</li>"}</ul>
      </div>
      <div>
        <h3>未接続</h3>
        <ul class="connection-list missing">${missingItems || "<li class=\"empty\">なし</li>"}</ul>
      </div>
    </div>
  `;
}

function activeChallenge() {
  return state.challenges.find(
    (challenge) => challenge.id === state.activeChallengeId
  );
}

function componentById(componentId) {
  return state.components.find((component) => component.id === componentId);
}

function componentName(componentId) {
  return componentById(componentId)?.name ?? componentId;
}

function placeComponent(componentId) {
  state.placedComponentIds.add(componentId);
}

function removePlacedComponent(componentId) {
  state.placedComponentIds.delete(componentId);
  state.connections = state.connections.filter(
    (connection) =>
      connection.from !== componentId && connection.to !== componentId
  );
  if (state.connectionSource === componentId) {
    state.connectionSource = undefined;
  }
}

function resetDesign() {
  state.placedComponentIds.clear();
  state.connections = [];
  state.connectionSource = undefined;
  state.lastResult = undefined;
  scoreResult.innerHTML = "";
}

function togglePieceConnection(componentId) {
  if (!state.connectionSource) {
    state.connectionSource = componentId;
    return;
  }
  if (state.connectionSource === componentId) {
    state.connectionSource = undefined;
    return;
  }

  addConnection(state.connectionSource, componentId);
  state.connectionSource = undefined;
}

function addConnection(from, to) {
  const key = connectionKey(from, to);
  const exists = state.connections.some(
    (connection) => connectionKey(connection.from, connection.to) === key
  );
  if (exists) {
    state.connections = state.connections.filter(
      (connection) => connectionKey(connection.from, connection.to) !== key
    );
    return;
  }
  state.connections.push({ from, to });
}

function connectionKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function getPlacedComponentIds() {
  return [...state.placedComponentIds];
}

function handleDragStart(event) {
  const draggable = event.target.closest("[data-component-id]");
  if (!draggable) {
    return;
  }

  event.dataTransfer.setData("text/plain", draggable.dataset.componentId);
  event.dataTransfer.effectAllowed = "move";
  state.draggingComponentId = draggable.dataset.componentId;
}

function handleLaneDragOver(event) {
  const lane = event.target.closest("[data-stage]");
  if (!lane) {
    return;
  }

  const component = componentById(state.draggingComponentId);

  if (component && component.stage === lane.dataset.stage) {
    event.preventDefault();
    lane.classList.add("drop-ready");
  }
}

function handleLaneDrop(event) {
  const lane = event.target.closest("[data-stage]");
  if (!lane) {
    return;
  }

  event.preventDefault();
  const componentId = event.dataTransfer.getData("text/plain");
  const component = componentById(componentId);

  if (component && component.stage === lane.dataset.stage) {
    placeComponent(componentId);
    state.draggingComponentId = undefined;
    renderGame();
  }
}

function clearDropReady() {
  selectedComponents
    .querySelectorAll(".drop-ready")
    .forEach((element) => element.classList.remove("drop-ready"));
}
