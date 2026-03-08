const API_URL = 'https://api.anthropic.com/v1/messages';
const STORAGE_KEY = 'clarity-api-key';

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

export function hasApiKey() {
  const key = getApiKey();
  return key.length > 0 && key !== 'your_key_here';
}

export async function callClaude({ system, userMessage, maxTokens = 60, signal }) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'your_key_here') {
    console.warn('Clarity: No API key set. Ghost text and coaching disabled.');
    return null;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text?.trim() || null;
}

export async function getGhostText({ sectionTitle, documentType, prefaceContext, userText, coveredDimensions, missingDimensions, signal }) {
  const system = `You are a writing coach for product managers. Your job is NOT to write for them — your job is to give them the single best next sentence or question that helps them think about what they should say next.

Rules:
- Return ONLY a single sentence or question. Maximum 20 words.
- Make it a PROMPT for their thinking, not a finished statement.
- Use the document context (product name, value prop, etc.) to make your prompt specific and relevant.
- You are told which structural elements the user has already covered and which are still missing. Focus on the most important missing element.
- Acknowledge what they have covered — don't repeat it. Ask about what's next.
- Never complete their thought for them. Always make them decide.
- Tone: smart, direct, collegial. Not formal, not sycophantic.
- Target readability: grade level 14 (college sophomore). Coach accordingly.
- Return ONLY the sentence, no preamble, no explanation.`;

  const contextLine = prefaceContext ? `\nDocument context: ${prefaceContext}` : '';
  const structureLine = coveredDimensions && missingDimensions
    ? `\nStructural elements covered: ${coveredDimensions.length > 0 ? coveredDimensions.join(', ') : 'none'}. Still missing: ${missingDimensions.length > 0 ? missingDimensions.join(', ') : 'none (section complete)'}.`
    : '';
  const userMessage = `Section: ${sectionTitle || 'Untitled'}
Document type: ${documentType || 'General'}${contextLine}${structureLine}
What the user has written so far in this section: ${userText || '(empty)'}

Give me the next ghost text prompt focusing on the most important missing element.`;

  return callClaude({ system, userMessage, maxTokens: 60, signal });
}

export async function getTemplateExample({ sectionTitle, templateStructure, prefaceContext, signal }) {
  const system = `You are a PM writing coach. Given a section template with [bracket placeholders] and product context, generate a realistic filled-in example showing what a strong version of this section looks like.

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

  return callClaude({ system, userMessage, maxTokens: 200, signal });
}

export async function getClarityCheck({ sectionTitle, documentType, sectionText, signal }) {
  const system = `You are a writing coach for product managers. Your job is to give sharp, specific observations about one section of a PM document.

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

  return callClaude({ system, userMessage, maxTokens: 120, signal });
}

export async function getCoachingNudge({ documentContent, signal }) {
  const system = `You are an expert PM writing coach reviewing a document in progress.
Look at what the user has written and identify ONE specific weakness in their thinking — not their writing style.
Return a single coaching observation as a short, direct question (max 15 words).
Focus on: missing user context, unclear success criteria, solution-before-problem, missing tradeoffs, vague scope.
Return ONLY the question. No preamble.`;

  return callClaude({ system, userMessage: documentContent, maxTokens: 40, signal });
}
