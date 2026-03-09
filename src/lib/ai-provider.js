import { getApiKey, setApiKey, hasApiKey, getGhostText as claudeGhostText, getTemplateExample as claudeTemplateExample, getClarityCheck as claudeClarityCheck, getCoachingNudge as claudeCoachingNudge, getSearchInsight as claudeSearchInsight, getGenText as claudeGenText } from './anthropic';
import { getOpenAIKey, setOpenAIKey, hasOpenAIKey, getGhostText as openaiGhostText, getTemplateExample as openaiTemplateExample, getClarityCheck as openaiClarityCheck, getCoachingNudge as openaiCoachingNudge, getSearchInsight as openaiSearchInsight, getGenText as openaiGenText } from './openai';
import { checkOllama, listModels, getOllamaModel, setOllamaModel, isElectronApp, ensureOllamaReady, autoStartOllama, getGhostText as ollamaGhostText, getTemplateExample as ollamaTemplateExample, getClarityCheck as ollamaClarityCheck, getCoachingNudge as ollamaCoachingNudge, getSearchInsight as ollamaSearchInsight, getGenText as ollamaGenText } from './ollama';

const PROVIDER_KEY = 'clarity-ai-provider';

// ── Provider preference ───────────────────────────────────────────

export function getProvider() {
  const stored = localStorage.getItem(PROVIDER_KEY);
  if (stored === 'ollama' || stored === 'claude' || stored === 'openai' || stored === 'none') return stored;
  // Backward compat: if a Claude key exists but no provider set, default to claude
  if (hasApiKey()) return 'claude';
  if (hasOpenAIKey()) return 'openai';
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
export { getOpenAIKey, setOpenAIKey, hasOpenAIKey } from './openai';
export { checkOllama, listModels, getOllamaModel, setOllamaModel, isElectronApp, ensureOllamaReady, autoStartOllama } from './ollama';

// ── Routed AI functions ───────────────────────────────────────────

export async function getGhostText(params) {
  const p = getProvider();
  if (p === 'claude') return claudeGhostText(params);
  if (p === 'openai') return openaiGhostText(params);
  if (p === 'ollama') return ollamaGhostText(params);
  return null;
}

export async function getTemplateExample(params) {
  const p = getProvider();
  if (p === 'claude') return claudeTemplateExample(params);
  if (p === 'openai') return openaiTemplateExample(params);
  if (p === 'ollama') return ollamaTemplateExample(params);
  return null;
}

export async function getClarityCheck(params) {
  const p = getProvider();
  if (p === 'claude') return claudeClarityCheck(params);
  if (p === 'openai') return openaiClarityCheck(params);
  if (p === 'ollama') return ollamaClarityCheck(params);
  return null;
}

export async function getCoachingNudge(params) {
  const p = getProvider();
  if (p === 'claude') return claudeCoachingNudge(params);
  if (p === 'openai') return openaiCoachingNudge(params);
  if (p === 'ollama') return ollamaCoachingNudge(params);
  return null;
}

export async function getSearchInsight(params) {
  const p = getProvider();
  if (p === 'claude') return claudeSearchInsight(params);
  if (p === 'openai') return openaiSearchInsight(params);
  if (p === 'ollama') return ollamaSearchInsight(params);
  return null;
}

export async function getGenText(params) {
  const p = getProvider();
  if (p === 'claude') return claudeGenText(params);
  if (p === 'openai') return openaiGenText(params);
  if (p === 'ollama') return ollamaGenText(params);
  return null;
}
