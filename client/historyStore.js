import { appendHistory } from "../src/domain/interview/history.js";

// 面接結果はこのブラウザの localStorage に置く（アカウントごとに別のキー）。
// プライベートウィンドウなどでは読み書きが失敗するので、失敗しても画面は動くようにする。
function storageKey(userId) {
  return `interview-history:${userId ?? "local"}`;
}

export function loadHistory(userId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(userId, entry) {
  const next = appendHistory(loadHistory(userId), entry);
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(next));
  } catch {
    // 保存できなくても、いま表示しているレポートには影響させない
  }
  return next;
}

export function clearHistory(userId) {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    // 同上
  }
  return [];
}
