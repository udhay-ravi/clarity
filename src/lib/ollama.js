const OLLAMA_BASE = 'http://localhost:11434';
const MODEL_KEY = 'clarity-ollama-model';
const DEFAULT_MODEL = 'llama3.2:3b';

// ── Electron auto-install shims ──────────────────────────────────

export function isElectronApp() {
  return typeof window !== 'undefined' && window.isElectron === true;
}

export async function ensureOllamaReady(modelName) {
  const bridge = typeof window !== 'undefined' && window.electronOllama;
  if (!bridge) {
    // Web mode — just check if Ollama is already running
    return checkOllama();
  }
  return bridge.setup(modelName || getOllamaModel());
}

export async function autoStartOllama() {
  const bridge = typeof window !== 'undefined' && window.electronOllama;
  if (!bridge) return false;
  return bridge.autoStart();
}

// ── Model preference ──────────────────────────────────────────────
export function getOllamaModel() {
  return localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL;
}

export function setOllamaModel(model) {
  localStorage.setItem(MODEL_KEY, model);
}

// ── Connection check ──────────────────────────────────────────────
export async function checkOllama() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(OLLAMA_BASE, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// ── List installed models ─────────────────────────────────────────
export async function listModels() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn('Clarity: Ollama /api/tags returned', res.status);
      return [];
    }
    const data = await res.json();
    // Handle both response formats: { models: [...] } or direct array
    const models = Array.isArray(data) ? data : (data.models || []);
    return models.map((m) => ({
      name: m.name || m.model || 'unknown',
      size: m.size ? `${(m.size / 1e9).toFixed(1)} GB` : '',
    }));
  } catch (err) {
    console.warn('Clarity: Failed to list Ollama models:', err.message);
    return [];
  }
}

// ── Core inference ────────────────────────────────────────────────
async function callOllama({ system, userMessage, maxTokens = 60, temperature = 0.7, signal }) {
  const model = getOllamaModel();
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMessage },
        ],
        stream: false,
        options: {
          num_predict: maxTokens,
          temperature,
        },
      }),
      signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`Clarity: Ollama error ${res.status} (model: ${model}):`, errText);
      // If model not found, throw a descriptive error so callers can surface it
      if (res.status === 404 || errText.includes('not found')) {
        throw new Error(`Model "${model}" not found. Pull it with: ollama pull ${model}`);
      }
      throw new Error(`Ollama error: ${res.status}`);
    }

    const data = await res.json();
    return data.message?.content?.trim() || null;
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn('Clarity: Ollama request failed:', err.message);
    }
    throw err;
  }
}

// ── Domain functions (mirror anthropic.js signatures + prompts) ───

export async function getGhostText({ sectionTitle, documentType, prefaceContext, userText, coveredDimensions, missingDimensions, signal }) {
  const system = `You are a writing assistant for product managers. You help them think, then suggest what to write.

Return EXACTLY two lines:
Q: A sharp question that makes the PM think about what the next sentence should say. Maximum 15 words.
R: A recommended sentence they could write next. Use specifics from the document context. Maximum 25 words. Write it as a real sentence (not a question, not a bracket template).

Rules:
- The Q should challenge their thinking — don't ask obvious questions.
- The R should be a strong starting point they can edit, not a final answer.
- Use the document context (product name, value prop, etc.) to make both Q and R specific and relevant.
- Focus on the most important missing structural element.
- Acknowledge what they have covered — don't repeat it.
- Tone: smart, direct, collegial.
- Return ONLY the two lines starting with Q: and R: — no preamble, no explanation.`;

  const contextLine = prefaceContext ? `\nDocument context: ${prefaceContext}` : '';
  const structureLine = coveredDimensions && missingDimensions
    ? `\nStructural elements covered: ${coveredDimensions.length > 0 ? coveredDimensions.join(', ') : 'none'}. Still missing: ${missingDimensions.length > 0 ? missingDimensions.join(', ') : 'none (section complete)'}.`
    : '';
  const userMessage = `Section: ${sectionTitle || 'Untitled'}
Document type: ${documentType || 'General'}${contextLine}${structureLine}
What the user has written so far in this section: ${userText || '(empty)'}

Give me the Q and R for the next ghost text focusing on the most important missing element.`;

  return callOllama({ system, userMessage, maxTokens: 120, temperature: 0.7, signal });
}

export async function getTemplateExample({ sectionTitle, templateStructure, prefaceContext, signal }) {
  const system = `You are a PM writing assistant. Given a section template with [bracket placeholders] and product context, generate a realistic filled-in example showing what a strong version of this section looks like.

Rules:
- Fill each [bracket placeholder] with specific, realistic content based on the product context.
- Keep the same structure and line breaks as the template.
- Use concrete numbers, names, and details — not generic filler.
- Do NOT include brackets — replace them entirely with real content.
- Maximum 4-5 lines, concise.
- Return ONLY the example text, no preamble.`;

  const userMessage = `Product context: ${prefaceContext || 'A B2B SaaS product'}
Section: ${sectionTitle}
Template:
${templateStructure}

Generate a filled-in example.`;

  return callOllama({ system, userMessage, maxTokens: 200, temperature: 0.5, signal });
}

export async function getClarityCheck({ sectionTitle, documentType, sectionText, signal }) {
  const system = `You are a writing assistant for product managers. Your job is to give sharp, specific observations about one section of a PM document.

Rules:
- Identify 1 to 3 specific clarity problems in the text. Focus on thinking quality, not style.
- Each observation must be a specific question or pointed observation — not a generic tip.
- Look for: buried lede (core idea is not in sentence 1), nested clauses that obscure meaning, jargon used without definition, passive voice hiding ownership, vague scope or missing specifics, and logical gaps between sentences.
- Do NOT rewrite anything. Do NOT suggest replacement text.
- Do NOT give generic advice like "be more concise" — always tie it to the specific text.
- Format: return only the observations as a numbered list. No preamble. No closing statement. Maximum 3 items.`;

  const userMessage = `Section title: ${sectionTitle}
Document type: ${documentType}

Section content:
${sectionText}

Give me a Clarity Check.`;

  return callOllama({ system, userMessage, maxTokens: 120, temperature: 0.3, signal });
}

export async function getCoachingNudge({ documentContent, signal }) {
  const system = `You are an expert PM writing assistant reviewing a document in progress.
Look at what the user has written and identify ONE specific weakness in their thinking — not their writing style.
Return a single coaching observation as a short, direct question (max 15 words).
Focus on: missing user context, unclear success criteria, solution-before-problem, missing tradeoffs, vague scope.
Return ONLY the question. No preamble.`;

  return callOllama({ system, userMessage: documentContent, maxTokens: 40, temperature: 0.6, signal });
}

export async function getSearchInsight({ query, sectionTitle, documentContext, signal }) {
  const system = `You are a market research assistant for product managers. Given a search query and document context, provide specific, data-driven insights that the PM can use in their writing.

Rules:
- Return EXACTLY 2 sentences of actionable insight.
- Use specific numbers, company names, market data, and trends where possible.
- Write in a factual, professional tone suitable for direct insertion into a PM document.
- Focus on the most relevant and impactful information for the query.
- Do NOT use hedging language like "it appears" or "it seems" — be direct.
- Do NOT include any preamble, citation, or source attribution — just the 2 sentences.`;

  const userMessage = `Search query: ${query}
Section: ${sectionTitle || 'General'}
Document context: ${documentContext || 'A product management document'}

Provide 2 sentences of insight.`;

  return callOllama({ system, userMessage, maxTokens: 150, temperature: 0.5, signal });
}
