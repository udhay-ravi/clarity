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
  const system = `You are a writing coach for product managers. You help them think, then suggest what to write.

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

  return callClaude({ system, userMessage, maxTokens: 120, signal });
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
