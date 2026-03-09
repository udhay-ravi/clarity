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
  prfaq: {
    name: 'PRFAQ',
    keywords: ['prfaq', 'pr faq', 'pr/faq', 'press release faq', 'press release', 'amazon style', 'working backwards'],
    preface: [
      { key: 'productName', label: 'Product / Feature Name', placeholder: 'e.g. Acme Smart Insights' },
      { key: 'targetCustomer', label: 'Target Customer', placeholder: 'e.g. Mid-market e-commerce teams managing 10K+ SKUs' },
      { key: 'launchTimeframe', label: 'Expected Launch', placeholder: 'e.g. Q3 2026' },
    ],
    sections: [
      { title: 'Headline', placeholder: 'Write the press release headline as if announcing the finished product. Make it customer-centric — lead with the benefit, not the feature. e.g. "Acme Smart Insights Helps E-Commerce Teams Cut Stockouts by 40%"' },
      { title: 'Subheadline', placeholder: 'One sentence expanding the headline. Clarify who it\'s for and the primary value. e.g. "New AI-powered demand forecasting gives merchandising teams real-time visibility into inventory risk."' },
      { title: 'Customer Problem', placeholder: 'Describe the customer pain in their language. What is broken, expensive, or frustrating today? Use a specific scenario. Avoid jargon — write as if explaining to the customer, not your team.' },
      { title: 'Solution', placeholder: 'How does the product solve the problem? Describe the experience, not the architecture. What does the customer see, do, and get? Keep it concrete — "the dashboard shows X" not "we leverage ML to optimize Y."' },
      { title: 'Customer Quote', placeholder: 'Write a fictional quote from a delighted customer. Make it specific and outcome-oriented. e.g. "Before Acme Insights, we were guessing on reorders. Now we see risk 3 weeks out and our stockout rate dropped from 12% to under 5%." — Jordan Lee, VP Merchandising, ModernRetail' },
      { title: 'How It Works', placeholder: 'Walk through the customer experience step by step. Keep it to 3-4 steps. Each step should be an action the customer takes and what they get back. e.g. "1. Connect your inventory feed. 2. Set alert thresholds. 3. Get daily risk reports with recommended actions."' },
      { title: 'Executive Quote', placeholder: 'Write a quote from an internal leader (VP/SVP/GM) explaining why this matters strategically. Connect the product to company mission or market opportunity. e.g. "Our customers told us forecasting was their #1 pain point. Smart Insights is how we turn that pain into a reason to choose Acme." — Sarah Chen, SVP Product' },
      { title: 'Call to Action', placeholder: 'How do customers get started? What\'s the first step? e.g. "Smart Insights is available today for all Acme Pro customers. Visit acme.com/insights to enable it — setup takes under 5 minutes."' },
      { title: 'Internal FAQ', type: 'faq', placeholder: 'Answer the hard questions leadership will ask.', questions: [
        'Why now? What changed in the market or our data?',
        'What\'s the total addressable opportunity?',
        'What are the key technical and execution risks?',
        'What does this cost to build and maintain?',
        'How does this fit our 3-year product strategy?',
        'What are we choosing NOT to do in order to do this?',
      ] },
      { title: 'External FAQ', type: 'faq', placeholder: 'Answer the questions customers will ask.', questions: [
        'How is this different from what you already offer?',
        'Does this require any changes to my current setup?',
        'What data do you need access to?',
        'How accurate are the forecasts?',
        'What does it cost / is it included in my plan?',
        'Can I try it before committing?',
      ] },
    ],
  },
  pricingProposal: {
    name: 'Pricing Proposal',
    keywords: ['pricing', 'pricing proposal', 'pricing strategy', 'price change', 'pricing model', 'monetization'],
    preface: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g. Acme Platform' },
      { key: 'currentPricing', label: 'Current Pricing Model', placeholder: 'e.g. Flat $49/mo per seat, no tiers' },
      { key: 'objective', label: 'Primary Objective', placeholder: 'e.g. Increase ARPU 20% while reducing churn in SMB segment' },
    ],
    sections: [
      { title: 'Executive Summary', placeholder: 'State the pricing change you\'re recommending, why, and the expected impact in 2-3 sentences. Lead with the business outcome. e.g. "We propose moving from flat-rate to tiered pricing to capture 20% more revenue from power users while keeping the entry price competitive. Projected impact: +$2.4M ARR with <3% incremental churn."' },
      { title: 'Current State & Problem', placeholder: 'What\'s wrong with the current pricing? Use data:\n• Revenue per customer distribution (are you undercharging power users?)\n• Win/loss data by price sensitivity\n• Competitive pricing gaps\n• Feature usage by segment\n• Customer feedback on value perception' },
      { title: 'Market & Competitive Pricing', placeholder: 'How do competitors price? Map the competitive landscape:\n• Direct competitors: their pricing models, tiers, and positioning\n• Adjacent players: how they monetize similar value\n• Market trends: usage-based vs. seat-based vs. outcome-based\n• Where is the market headed in 12-24 months?' },
      { title: 'Proposed Pricing Model', placeholder: 'Detail the new pricing structure clearly:\n• Tier names, prices, and what\'s included in each\n• Pricing metric (per seat, per usage, per feature)\n• Any add-ons or overage pricing\n• Free tier / trial structure\n• Annual vs. monthly pricing and discount logic\n\nUse a simple table or list that leadership can scan in 30 seconds.' },
      { title: 'Revenue Impact Analysis', placeholder: 'Model the financial impact with scenarios:\n• Base case: expected revenue change (show your math)\n• Best case: high adoption / upsell scenario\n• Worst case: churn / downgrade scenario\n• Payback period: when does the new model break even vs. old?\n• Include sensitivity analysis on key assumptions' },
      { title: 'Customer Impact & Migration', placeholder: 'How does this affect existing customers?\n• What % of customers see a price increase vs. decrease vs. neutral?\n• Grandfathering policy: who gets legacy pricing and for how long?\n• Communication plan: how and when do we notify customers?\n• Support readiness: anticipated volume of pricing questions\n• Migration timeline with key milestones' },
      { title: 'Risks & Mitigations', placeholder: 'What could go wrong?\n• Churn risk: which segments are most price-sensitive?\n• Competitive response: will competitors undercut us?\n• Internal complexity: does this complicate billing/sales?\n• Brand perception: will customers feel nickel-and-dimed?\n\nFor each risk, state the mitigation and the trigger to escalate.' },
      { title: 'Recommendation & Next Steps', placeholder: 'State your clear recommendation:\n• Which option do you recommend and why?\n• What decision do you need from leadership?\n• Proposed timeline: decision date → internal prep → soft launch → full rollout\n• Success metrics: how will we evaluate the change at 30/60/90 days?' },
    ],
  },
  productOnePager: {
    name: 'Product One-Pager',
    keywords: ['product one pager', 'product one-pager', 'product 1-pager', 'product 1 pager', 'product brief'],
    preface: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g. Acme Collaborate' },
      { key: 'owner', label: 'Product Owner / PM', placeholder: 'e.g. Jamie Rodriguez, Senior PM' },
      { key: 'stakeholders', label: 'Key Stakeholders', placeholder: 'e.g. VP Product, VP Engineering, Head of Design' },
    ],
    sections: [
      { title: 'The Opportunity', placeholder: 'What market or customer opportunity are you going after? Size it. e.g. "$4.2B market growing 18% YoY. Our customers cite collaboration as #1 unmet need in NPS verbatims (34% of detractor comments)."' },
      { title: 'Customer Problem', placeholder: 'Describe the problem from the customer\'s perspective. Be specific:\n• Who exactly has this problem? (persona, segment)\n• How do they solve it today? (workarounds, competitor tools)\n• What does it cost them? (time, money, frustration)\n• One customer quote that captures the pain' },
      { title: 'Proposed Solution', placeholder: 'Describe what you\'re building in plain language:\n• What does the user experience look like?\n• What are the 2-3 key capabilities?\n• What makes this different from alternatives?\n\nKeep it concrete — describe what the user sees and does, not the technical implementation.' },
      { title: 'Success Metrics', placeholder: 'How will you measure success?\n• Primary metric: the one number that defines whether this worked\n• Secondary metrics: 2-3 supporting indicators\n• Guardrail metrics: what should NOT get worse\n• Targets: specific numbers with timeframes (e.g. "+15% activation within 90 days of launch")' },
      { title: 'Scope & Timeline', placeholder: 'What are you building and when?\n• Phase 1 (MVP): core capabilities, target date\n• Phase 2: enhancements based on learnings\n• Explicitly out of scope: what you\'re NOT doing\n• Key dependencies and risks to timeline' },
      { title: 'Resource Ask', placeholder: 'What do you need to execute?\n• Team: headcount, roles, duration\n• Budget: development cost, infrastructure, third-party services\n• Cross-functional needs: design, data science, legal, marketing\n• Trade-offs: what gets deprioritized if we do this?' },
    ],
  },
  productPitch: {
    name: 'Product Pitch',
    keywords: ['product pitch', 'pitch', 'pitch deck', 'product proposal', 'investment case', 'business case'],
    preface: [
      { key: 'productName', label: 'Product / Initiative Name', placeholder: 'e.g. Acme AI Assistant' },
      { key: 'targetMarket', label: 'Target Market', placeholder: 'e.g. Enterprise knowledge workers in regulated industries' },
      { key: 'theAsk', label: 'What You\'re Asking For', placeholder: 'e.g. 8 engineers + $500K budget for 6-month build' },
    ],
    sections: [
      { title: 'The Big Idea', placeholder: 'State your pitch in 2-3 sentences. What are you proposing, for whom, and why will it win? This is your elevator pitch — make it memorable. e.g. "Enterprise teams waste 11 hours/week searching for information trapped in siloed tools. Acme AI Assistant surfaces the right answer from any connected system in under 5 seconds. It\'s the search bar enterprises have been asking for."' },
      { title: 'Market Opportunity', placeholder: 'Size the opportunity and show why it\'s worth pursuing:\n• Total addressable market (TAM) with source\n• Serviceable addressable market (SAM) — your realistic target\n• Market growth rate and key drivers\n• Why now: what has changed to make this opportunity timely?\n• Which adjacent trends or tailwinds support this bet?' },
      { title: 'Customer Pain', placeholder: 'Make the problem visceral:\n• Who is the primary user? Describe their day.\n• What specific task or workflow is broken?\n• How much time/money does the problem cost them?\n• What do they do today? (current alternatives and their gaps)\n• Include a real or representative customer quote' },
      { title: 'Our Solution', placeholder: 'Describe the product experience:\n• What does the user see on first use?\n• Walk through the core workflow (3-5 steps)\n• What\'s the "aha moment" — when does the user feel the value?\n• Key differentiators vs. alternatives\n• Include a simple mockup description or screenshot reference if available' },
      { title: 'Why Us', placeholder: 'Why is your team/company uniquely positioned to win?\n• Existing assets: data, distribution, brand, technology\n• Team expertise: relevant experience and track record\n• Moat: what makes this defensible over time?\n• Unfair advantage: what do you have that competitors don\'t?' },
      { title: 'Business Model', placeholder: 'How does this make money?\n• Revenue model: subscription, usage, transaction, or hybrid\n• Pricing: proposed price point and rationale\n• Unit economics: CAC, LTV, gross margin targets\n• Revenue projection: 12-month and 36-month estimates\n• Path to profitability or contribution margin' },
      { title: 'Go-to-Market', placeholder: 'How will you acquire customers?\n• Launch strategy: who are the first 10/100/1000 customers?\n• Distribution channels: direct sales, product-led, partnerships?\n• Marketing approach: content, events, outbound, community?\n• Key partnerships or integrations needed\n• Early traction or validation (waitlist, LOIs, pilot results)' },
      { title: 'Roadmap & Milestones', placeholder: 'What does the execution plan look like?\n• Phase 1 (0-3 months): MVP scope and key deliverables\n• Phase 2 (3-6 months): expansion and iteration\n• Phase 3 (6-12 months): scale and optimization\n• Key milestones and decision points\n• Go/no-go criteria: what would make us stop?' },
      { title: 'The Ask', placeholder: 'State clearly what you need:\n• Team: specific roles and headcount\n• Budget: development, infrastructure, marketing\n• Timeline: when you need the decision and why\n• What you\'ll deliver: concrete outcomes by specific dates\n• What success looks like at 6 and 12 months' },
    ],
  },
  packagingRecommendation: {
    name: 'Packaging Recommendation',
    keywords: ['packaging', 'packaging recommendation', 'feature packaging', 'bundling', 'tier', 'tiers', 'plan structure', 'product packaging'],
    preface: [
      { key: 'productName', label: 'Product Name', placeholder: 'e.g. Acme Platform' },
      { key: 'currentPackaging', label: 'Current Packaging', placeholder: 'e.g. Free + Pro ($29/mo) + Enterprise (custom)' },
      { key: 'objective', label: 'Primary Objective', placeholder: 'e.g. Drive Pro→Enterprise upgrades by repackaging analytics features' },
    ],
    sections: [
      { title: 'Executive Summary', placeholder: 'In 3-4 sentences: what packaging change are you recommending, why, and what\'s the expected business impact? e.g. "We recommend restructuring from 2 paid tiers to 3, moving advanced analytics and SSO into a new Business tier at $79/mo. This captures $1.8M in unrealized revenue from mid-market customers currently on Pro who use enterprise-grade features."' },
      { title: 'Current Packaging Assessment', placeholder: 'Analyze what\'s working and what\'s not:\n• Current tiers, pricing, and feature allocation\n• Usage data: which features drive upgrades? Which are underused?\n• Conversion funnel: where do prospects drop off?\n• Customer feedback: what do customers say about current packaging?\n• Revenue distribution across tiers\n• Key friction points: features that should gate upgrades but don\'t' },
      { title: 'Competitive Packaging Landscape', placeholder: 'How do competitors package?\n• Map competitor tiers side-by-side with yours\n• Feature parity analysis: where are you over/under-indexing per tier?\n• Pricing comparison at each tier\n• Emerging packaging trends in your category\n• Gaps you can exploit: features competitors gate that you could offer lower' },
      { title: 'Proposed Packaging', placeholder: 'Detail the recommended structure:\n\nFor each tier:\n• Tier name and target persona\n• Price point (monthly/annual)\n• Core features included\n• Key differentiators from tier below\n• Usage limits (seats, storage, API calls, etc.)\n\nClearly show what moves between tiers vs. what stays. Highlight the "upgrade triggers" — the features that motivate customers to move up.' },
      { title: 'Feature Allocation Rationale', placeholder: 'Explain WHY each feature lands in its tier:\n• What data supports this allocation? (usage patterns, willingness-to-pay)\n• Which features are "table stakes" vs. "premium value"?\n• What are the upgrade triggers at each tier boundary?\n• Which features remain in lower tiers to maintain competitive positioning?\n• Any features being removed, consolidated, or unbundled?' },
      { title: 'Revenue & Adoption Impact', placeholder: 'Model the business impact:\n• Expected revenue change by tier (show migration assumptions)\n• Customer migration: what % upgrade, downgrade, or stay?\n• Impact on new customer acquisition by tier\n• Add-on / expansion revenue potential\n• Scenario analysis: optimistic, base, conservative\n• Break-even timeline for any short-term revenue loss' },
      { title: 'Migration Plan', placeholder: 'How do you transition existing customers?\n• Grandfathering policy: who keeps current pricing? For how long?\n• Forced migrations: any customers who must change tiers?\n• Communication timeline: internal → beta customers → all customers\n• Self-serve vs. assisted migration tools\n• Support playbook: how CS handles pricing questions\n• Rollback plan: what if results are worse than expected?' },
      { title: 'Recommendation & Decision Points', placeholder: 'State your recommendation clearly:\n• Which packaging option do you endorse and why?\n• What decision do you need from leadership?\n• Key open questions that need resolution\n• Proposed launch timeline with milestones\n• Success criteria at 30/60/90 days post-launch\n• When and how you\'ll report back on results' },
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
      ...(s.type === 'faq' && s.questions ? {
        type: 'faq',
        questions: s.questions.map((q) => ({
          id: crypto.randomUUID(),
          question: q,
          answer: '',
          content: null,
        })),
      } : {}),
    })),
  };
}
