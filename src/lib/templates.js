export const TEMPLATES = {
  prd: {
    name: 'PRD',
    keywords: ['prd', 'product requirement', 'product spec', 'product requirements document'],
    preface: [
      { key: 'productName', label: 'Product / Feature Name', placeholder: 'e.g. Inventory Sync Pro' },
      { key: 'valueProp', label: 'Value Proposition', placeholder: 'One sentence — what does it do and for whom?' },
      { key: 'docPurpose', label: 'Purpose of This Document', placeholder: 'e.g. Get alignment on scope for Q3 build' },
    ],
    sections: [
      { title: 'Executive Summary', placeholder: 'A brief overview of this document — the problem, the proposal, and expected impact.' },
      { title: 'Problem Statement', placeholder: 'What problem are you solving and for whom?' },
      { title: 'Goals & Success Metrics', placeholder: 'How will you know this worked?' },
      { title: 'User Stories', placeholder: 'As a [user], I want to [action] so that [outcome]...' },
      { title: 'Scope (In & Out)', placeholder: 'What are you building — and what are you explicitly not building?' },
      { title: 'Solution Overview', placeholder: 'Describe the approach at a high level.' },
      { title: 'Open Questions', placeholder: 'What do you still need to figure out?' },
    ],
  },
  onePager: {
    name: 'One-Pager',
    keywords: ['one pager', 'one-pager', 'brief', '1-pager'],
    preface: [
      { key: 'productName', label: 'Product / Feature Name', placeholder: 'e.g. Smart Notifications' },
      { key: 'coreIdea', label: 'Core Idea in One Sentence', placeholder: 'What is this about, in plain language?' },
      { key: 'audience', label: 'Who Is This Document For?', placeholder: 'e.g. Leadership team, product council' },
    ],
    sections: [
      { title: 'The Problem', placeholder: 'What\'s broken or missing today?' },
      { title: 'Why Now', placeholder: 'What makes this urgent or timely?' },
      { title: 'Our Bet', placeholder: 'What are you proposing and why do you believe it will work?' },
      { title: 'Execution Plan', placeholder: 'What are the key milestones, owners, and risks?' },
      { title: 'How We\'ll Know It Worked', placeholder: 'What metrics or outcomes define success?' },
    ],
  },
  launchBrief: {
    name: 'Launch Brief',
    keywords: ['launch', 'go to market', 'gtm', 'launch brief', 'launch plan'],
    preface: [
      { key: 'productName', label: 'Product / Feature Name', placeholder: 'e.g. Team Collaboration Hub' },
      { key: 'launchDate', label: 'Target Launch Date', placeholder: 'e.g. March 15, 2026' },
      { key: 'targetAudience', label: 'Primary Audience', placeholder: 'e.g. Mid-market SaaS teams, 50-200 employees' },
    ],
    sections: [
      { title: 'What We\'re Launching', placeholder: 'Describe the feature or product in one paragraph.' },
      { title: 'Who It\'s For', placeholder: 'Who is the target audience?' },
      { title: 'Why It Matters', placeholder: 'Why should users care about this?' },
      { title: 'How We\'re Going to Market', placeholder: 'What channels and tactics will you use?' },
      { title: 'What Could Go Wrong', placeholder: 'What are the risks and how will you mitigate them?' },
    ],
  },
  competitiveAnalysis: {
    name: 'Competitive Analysis',
    keywords: ['competitive', 'competition', 'comp analysis', 'competitive analysis', 'competitor'],
    preface: [
      { key: 'productName', label: 'Your Product Name', placeholder: 'e.g. Acme Analytics' },
      { key: 'marketCategory', label: 'Market Category', placeholder: 'e.g. Product analytics for mobile apps' },
      { key: 'keyQuestion', label: 'Key Question to Answer', placeholder: 'e.g. Where should we invest to win enterprise deals?' },
    ],
    sections: [
      { title: 'Market Context', placeholder: 'What market are you operating in?' },
      { title: 'Competitors Overview', placeholder: 'Who are the key players and what do they offer?' },
      { title: 'Where We Win', placeholder: 'What\'s your advantage?' },
      { title: 'Where We\'re Weak', placeholder: 'Where do competitors outperform you?' },
      { title: 'Strategic Implication', placeholder: 'What does this mean for your product roadmap?' },
    ],
  },
  strategyDoc: {
    name: 'Strategy Doc',
    keywords: ['strategy', 'strategic', 'strategy doc', 'strategic plan'],
    preface: [
      { key: 'productName', label: 'Product / Team Name', placeholder: 'e.g. Growth Platform Team' },
      { key: 'context', label: 'Strategic Context', placeholder: 'e.g. Revenue growth slowing, need to find new levers' },
      { key: 'timeHorizon', label: 'Time Horizon', placeholder: 'e.g. Next 12 months, FY2026' },
    ],
    sections: [
      { title: 'Situation', placeholder: 'What\'s happening in the market and your product today?' },
      { title: 'Insight', placeholder: 'What key insight drives your strategy?' },
      { title: 'Strategic Choice', placeholder: 'What are you choosing to do — and not do?' },
      { title: 'Initiatives', placeholder: 'What concrete initiatives will execute this strategy?' },
      { title: 'Risks & Mitigations', placeholder: 'What could derail this and how will you prepare?' },
    ],
  },
  retrospective: {
    name: 'Retrospective',
    keywords: ['retrospective', 'retro', 'post mortem', 'postmortem', 'post-mortem'],
    preface: [
      { key: 'projectName', label: 'Project / Initiative Name', placeholder: 'e.g. Checkout Redesign v2' },
      { key: 'timePeriod', label: 'Time Period', placeholder: 'e.g. Sprint 14, Q4 2025, Jan-Mar 2026' },
      { key: 'teamInvolved', label: 'Team Involved', placeholder: 'e.g. Payments squad + Design' },
    ],
    sections: [
      { title: 'What We Set Out to Do', placeholder: 'What was the original goal or plan?' },
      { title: 'What Went Well', placeholder: 'What worked and why?' },
      { title: 'What Didn\'t Work', placeholder: 'What fell short and why?' },
      { title: 'Root Causes', placeholder: 'What underlying issues caused the problems?' },
      { title: 'What We\'ll Do Differently', placeholder: 'What specific changes will you make?' },
    ],
  },
};

export function detectTemplate(input) {
  if (!input || input.trim().length === 0) return null;

  const normalized = input.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, template] of Object.entries(TEMPLATES)) {
    for (const keyword of template.keywords) {
      const score = fuzzyScore(normalized, keyword);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { key, ...template };
      }
    }
  }

  if (bestScore > 0.7) {
    return { ...bestMatch, confidence: bestScore };
  }

  return null;
}

function fuzzyScore(input, keyword) {
  // Exact match
  if (input === keyword) return 1.0;

  // Input contains keyword
  if (input.includes(keyword)) return 0.95;

  // Keyword contains input (partial typing)
  if (keyword.includes(input) && input.length >= 3) {
    return 0.75 + (input.length / keyword.length) * 0.2;
  }

  // Word-level matching
  const inputWords = input.split(/\s+/);
  const keywordWords = keyword.split(/\s+/);
  let matchedWords = 0;

  for (const iw of inputWords) {
    for (const kw of keywordWords) {
      if (kw.startsWith(iw) && iw.length >= 3) {
        matchedWords++;
        break;
      }
    }
  }

  if (keywordWords.length > 0 && matchedWords > 0) {
    return (matchedWords / keywordWords.length) * 0.85;
  }

  return 0;
}

export function createBlankDocument() {
  return {
    title: 'Untitled Document',
    type: null,
    sections: [
      { id: crypto.randomUUID(), title: '', body: '', placeholder: 'Start writing...' },
    ],
  };
}

export function createDocumentFromTemplate(template, prefaceValues = {}) {
  // Build preface metadata with labels for display
  const preface = {};
  if (template.preface) {
    for (const field of template.preface) {
      preface[field.key] = {
        label: field.label,
        value: prefaceValues[field.key] || '',
        placeholder: field.placeholder,
      };
    }
  }

  return {
    title: template.name,
    type: template.key,
    preface,
    sections: template.sections.map((s) => ({
      id: crypto.randomUUID(),
      title: s.title,
      body: '',
      placeholder: s.placeholder,
    })),
  };
}
