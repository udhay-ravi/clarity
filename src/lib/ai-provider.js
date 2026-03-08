import { getApiKey, setApiKey, hasApiKey, getGhostText as claudeGhostText, getTemplateExample as claudeTemplateExample, getClarityCheck as claudeClarityCheck, getCoachingNudge as claudeCoachingNudge } from './anthropic';
import { checkOllama, listModels, getOllamaModel, setOllamaModel, isElectronApp, ensureOllamaReady, autoStartOllama, getGhostText as ollamaGhostText, getTemplateExample as ollamaTemplateExample, getClarityCheck as ollamaClarityCheck, getCoachingNudge as ollamaCoachingNudge } from './ollama';

const PROVIDER_KEY = 'clarity-ai-provider';

// ── Provider preference ───────────────────────────────────────────

export function getProvider() {
  const stored = localStorage.getItem(PROVIDER_KEY);
  if (stored === 'ollama' || stored === 'claude' || stored === 'none') return stored;
  // Backward compat: if a Claude key exists but no provider set, default to claude
  if (hasApiKey()) return 'claude';
  return 'none';
}

export function setProvider(name) {
  localStorage.setItem(PROVIDER_KEY, name);
}

export function isAiEnabled() {
  return getProvider() !== 'none';
}

// ── Re-exports ────────────────────────────────────────────────────
export { getApiKey, setApiKey, hasApiKey } from './anthropic';
export { checkOllama, listModels, getOllamaModel, setOllamaModel, isElectronApp, ensureOllamaReady, autoStartOllama } from './ollama';

// ── Routed AI functions ───────────────────────────────────────────

export async function getGhostText(params) {
  const p = getProvider();
  if (p === 'claude') return claudeGhostText(params);
  if (p === 'ollama') return ollamaGhostText(params);
  return null;
}

export async function getTemplateExample(params) {
  const p = getProvider();
  if (p === 'claude') return claudeTemplateExample(params);
  if (p === 'ollama') return ollamaTemplateExample(params);
  return null;
}

export async function getClarityCheck(params) {
  const p = getProvider();
  if (p === 'claude') return claudeClarityCheck(params);
  if (p === 'ollama') return ollamaClarityCheck(params);
  return null;
}

export async function getCoachingNudge(params) {
  const p = getProvider();
  if (p === 'claude') return claudeCoachingNudge(params);
  if (p === 'ollama') return ollamaCoachingNudge(params);
  return null;
}
