// Ghost paragraph templates — structural blueprints shown before the user starts typing.
// Each section gets a multi-line skeleton with [bracket placeholders] showing
// what a well-structured section looks like.
//
// These are NOT prose. They're wireframes for the user's thinking.

import { extractProductName } from './ghostPrompts';

const GHOST_PARAGRAPHS = {
  // ─── PRD ───
  'Executive Summary':
    'This document proposes [what you\'re building] for [target users].\n' +
    'The core problem: [one-sentence description of the pain point].\n' +
    'Our approach: [high-level solution in one sentence].\n' +
    'Expected impact: [key metric] moving from [baseline] to [target] by [timeline].',

  'Problem Statement':
    '[Who is affected] experience [specific pain point] when [trigger / context].\n' +
    'This happens [frequency — daily, weekly, every semester, per transaction].\n' +
    'The cost: [measurable impact — time, revenue, retention, dollars].\n' +
    'Today, they work around it by [current workaround], which [why that\'s insufficient].',

  'Goals & Success Metrics':
    'The primary goal is to [desired outcome] for [target user segment].\n' +
    'We will measure success by [key metric], moving from [current baseline] to [target number].\n' +
    'We expect to hit this by [timeline], with [leading indicator] as an early signal.',

  'User Stories':
    'As a [persona / role], I want to [key action] so that [outcome / value].\n' +
    'Acceptance criteria: Given [context], when [action], then [expected result].\n' +
    'Priority: [P0 / P1 / P2] because [rationale for priority ranking].',

  'Scope (In & Out)':
    'In scope: [what you will build in this version].\n' +
    'Out of scope: [what you are explicitly deferring to a future version].\n' +
    'MVP definition: [the smallest version that still solves the core problem].\n' +
    'Dependencies: [external systems, teams, or APIs this depends on].',

  'Solution Overview':
    'The approach is to [high-level description of the solution].\n' +
    'We chose this over [alternative considered] because [reasoning].\n' +
    'Key tradeoffs: [what you gain] at the cost of [what you accept].\n' +
    'Technical constraints: [relevant technical choices or limitations].',

  'Open Questions':
    '[Biggest unknown]: [why it matters and what could change].\n' +
    'Needs input from: [stakeholder / team] by [deadline].\n' +
    'Key assumption: [assumption that, if wrong, changes the plan].\n' +
    'Decision deadline: [what needs to be decided by when].',

  // ─── One-Pager ───
  'The Problem':
    '[Target users] struggle with [specific pain point] every [frequency].\n' +
    'Evidence: [data point, research finding, or customer quote].\n' +
    'If we ignore this for 6 more months, [consequence of inaction].',

  'Why Now':
    '[Recent change or trigger] has made this problem urgent.\n' +
    'Competitively, [market pressure or competitor move driving urgency].\n' +
    'Waiting another quarter costs us [specific cost of delay].\n' +
    'We have [internal momentum or sponsorship] behind this.',

  'Our Bet':
    'We propose to [what you will build or change].\n' +
    'We believe this will work because [evidence or thesis].\n' +
    'Riskiest assumption: [the thing that could make this fail].\n' +
    'Simplest test: [MVP or experiment to validate the bet].',

  'Execution Plan':
    'In the first 30 days, we will [milestone 1].\n' +
    'By [date], the team will have completed [milestone 2].\n' +
    'Key dependencies are [team or resource], and the single biggest execution risk is [risk].',

  "How We'll Know It Worked":
    'Primary metric: [the single most important number].\n' +
    'Current baseline: [what that metric looks like today].\n' +
    '90-day target: [what "good" looks like in 3 months].\n' +
    'Leading indicator: [what we will watch weekly before the target is hit].',

  // ─── Launch Brief ───
  "What We're Launching":
    'We are launching [feature / product name], which [plain-language description].\n' +
    'For users, this means [what changes in their day-to-day experience].\n' +
    'This is [new capability / improvement to existing feature].\n' +
    'One-sentence pitch: [the announcement headline].',

  "Who It's For":
    'Primary persona: [description of ideal early adopter].\n' +
    'First target segment: [specific cohort, size, and why them first].\n' +
    'Audience size: [addressable market or user count].\n' +
    'Unmet need: [what they need that competitors miss].',

  'Why It Matters':
    'This helps users [job to be done / task to accomplish].\n' +
    'Emotionally, it addresses [relief, confidence, delight, or frustration].\n' +
    'Compared to alternatives, this is [magnitude of improvement] better because [reason].\n' +
    'Switching reason: [why someone would leave their current solution for this].',

  "How We're Going to Market":
    'Channels: [distribution channels that reach target users].\n' +
    'Launch sequence: [what happens on day 1, week 1, month 1].\n' +
    'Partners: [internal champions or external collaborators].\n' +
    'Call to action: [what we want users to do].',

  'What Could Go Wrong':
    'Most likely failure mode: [how this could flop].\n' +
    'Adoption risk: [what happens if uptake is slower than expected].\n' +
    'Technical risk: [what could delay or compromise the launch].\n' +
    'Mitigation plan: [rollback strategy or contingency].',

  // ─── Competitive Analysis ───
  'Market Context':
    'This falls in the [market category] space, valued at [market size].\n' +
    'The market is [growing / mature / shrinking] driven by [macro trends].\n' +
    'Buyers prioritize [top buying criteria] when choosing a solution.',

  'Competitors Overview':
    'Market leader: [name] dominates because [reason for dominance].\n' +
    'Direct competitors: [names] — they do [strengths] well.\n' +
    'Indirect competitors: [alternatives solving this differently].\n' +
    'Pricing landscape: [how competitors price and where you sit].',

  'Where We Win':
    'Core advantage: [what makes us better or different].\n' +
    'Customer voice: [what customers specifically say they love].\n' +
    'Defensibility: [what is hard for competitors to copy].',

  "Where We're Weak":
    'We lose deals to [competitor] when [scenario].\n' +
    'Feature gaps: [key capabilities competitors have that we lack].\n' +
    'Perception risk: [what a competitor would say about our weaknesses].',

  'Strategic Implication':
    'Double down on: [strength to invest in further].\n' +
    'Close this gap first: [competitive gap] because [reasoning].\n' +
    'Roadmap impact: [how this analysis changes priorities].',

  // ─── Strategy Doc ───
  'Situation':
    'Product state: [current performance and trajectory].\n' +
    'External forces: [market, competitor, or regulatory changes].\n' +
    'Internal constraints: [team, tech, or budget realities].\n' +
    'Trigger: [data or signal that prompted this strategic review].',

  'Insight':
    'Observation: [what you see that others might be missing].\n' +
    'Supporting evidence: [customer behavior or data backing this up].\n' +
    'Pattern: [the connection between multiple signals].\n' +
    'Why now: [why this insight is actionable right now].',

  'Strategic Choice':
    'We choose to focus on [strategic direction].\n' +
    'We are deliberately NOT doing [what you are saying no to].\n' +
    'This is hard because [tradeoff or sacrifice involved].\n' +
    'Company alignment: [how this connects to broader strategy].',

  'Initiatives':
    'Initiative 1: [name and description] — owned by [person / team].\n' +
    'Initiative 2: [name and description] — owned by [person / team].\n' +
    'Highest impact: [which initiative and why].\n' +
    'First 90 days: [milestones for each initiative].',

  'Risks & Mitigations':
    'Biggest risk: [the single largest threat to this strategy].\n' +
    'Critical assumption: [if wrong, breaks the entire plan].\n' +
    'Early warning system: [how you will detect things going off track].\n' +
    'Plan B: [fallback if the primary approach fails].',

  // ─── Retrospective ───
  'What We Set Out to Do':
    'Original goal: [what you intended to achieve, in one sentence].\n' +
    'Key deliverables: [milestones or outputs you were targeting].\n' +
    'Timeline: [the deadline or sprint you were working against].\n' +
    'Success criteria: [what "done" looked like when you started].',

  'What Went Well':
    'Best outcome: [specific result you are most proud of].\n' +
    'Process win: [practice or workflow that worked better than expected].\n' +
    'Key contributor: [who or what made the biggest difference].\n' +
    'Keep doing: [what should be repeated exactly as-is next time].',

  "What Didn't Work":
    'Fell short on: [where results missed expectations].\n' +
    'Friction point: [what felt harder than it should have been].\n' +
    'Communication gap: [where coordination broke down].\n' +
    'Warning to past self: [what you wish you had known going in].',

  'Root Causes':
    'Why it happened: [root cause, not just symptoms].\n' +
    'Category: [people, process, or tooling issue].\n' +
    'Missed warning signs: [signals that were seen but not acted on].\n' +
    'Systemic pattern: [recurring theme connecting multiple issues].',

  "What We'll Do Differently":
    'Change: [specific, concrete action for next time].\n' +
    'Owner: [who is responsible for making this change happen].\n' +
    'Success measure: [how you will know the change is working].\n' +
    'Stop doing: [what you will explicitly eliminate].',

  // ─── PRFAQ ───
  'Headline':
    '[Product name] [helps / enables / empowers] [target customer] to [key benefit].\n' +
    'Lead with the customer outcome, not the feature.\n' +
    'Make it specific enough to be testable — could a customer say "yes, that\'s what I need"?',

  'Subheadline':
    '[New / redesigned] [product type] [gives / provides / delivers] [target users]\n' +
    '[specific capability] [so they can / enabling them to] [measurable outcome].',

  'Customer Problem':
    '[Target customer persona] currently [pain point they experience].\n' +
    'This happens when [trigger scenario that causes the pain].\n' +
    'Today, they deal with this by [current workaround], which [why it\'s inadequate].\n' +
    'The cost: [quantified impact — time, money, missed opportunities, frustration].',

  'Solution':
    'With [product name], [target user] can now [key action / capability].\n' +
    'The experience: [what the user sees and does, step by step].\n' +
    'The result: [concrete outcome — time saved, errors eliminated, revenue gained].\n' +
    'This is different because [what makes this approach uniquely effective].',

  'Customer Quote':
    '"Before [product name], we [specific pain — what was broken or slow].\n' +
    'Now, [specific improvement with numbers — "we reduced X from Y to Z"].\n' +
    '[Emotional payoff — "my team can finally focus on..." or "I no longer worry about..."]"\n' +
    '— [Name], [Title], [Company]',

  'How It Works':
    'Step 1: [First action the customer takes] → [what they get back].\n' +
    'Step 2: [Next action] → [result or feedback they see].\n' +
    'Step 3: [Final action] → [the "aha" moment or key outcome].\n' +
    'Time to value: [how long from sign-up to first meaningful result].',

  'Executive Quote':
    '"[Statement connecting product to company mission or market opportunity].\n' +
    '[What customer insight or data drove this decision].\n' +
    '[How this positions us for the future — market leadership, new segment, platform play]"\n' +
    '— [Name], [Title (VP/SVP/GM)]',

  'Call to Action':
    '[Product name] is available [today / starting date] for [which customers / plans].\n' +
    'To get started: [specific first step — URL, contact, or action].\n' +
    'Setup time: [how long until they see value].\n' +
    '[Special offer or incentive for early adopters, if applicable].',

  'Internal FAQ':
    'Q: Why now — what changed?\nA: [Market signal, customer data, or competitive move that triggered this].\n\n' +
    'Q: What\'s the total addressable opportunity?\nA: [TAM/SAM with source, or revenue/engagement projection].\n\n' +
    'Q: What are the key risks?\nA: [Top 2-3 execution or technical risks with mitigations].\n\n' +
    'Q: What does this cost to build?\nA: [Team size, timeline, infrastructure costs].\n\n' +
    'Q: What are we NOT doing in order to do this?\nA: [Explicit trade-offs and deprioritized work].',

  'External FAQ':
    'Q: How is this different from what you already offer?\nA: [Clear differentiation from existing features].\n\n' +
    'Q: Does this require changes to my setup?\nA: [Migration or integration requirements].\n\n' +
    'Q: What data do you need?\nA: [Data requirements and privacy considerations].\n\n' +
    'Q: What does it cost?\nA: [Pricing — included, add-on, or new tier].\n\n' +
    'Q: Can I try it first?\nA: [Trial, pilot, or sandbox availability].',

  // ─── Pricing Proposal ───
  'Current State & Problem':
    'Current model: [pricing structure — flat rate, per seat, tiers, etc.].\n' +
    'Revenue distribution: [how revenue splits across customer segments].\n' +
    'The problem: [underpricing power users / losing deals on price / value misalignment].\n' +
    'Evidence: [win-loss data, customer feedback, usage vs. pricing analysis].',

  'Market & Competitive Pricing':
    'Direct competitors: [name] charges [model + price] for [comparable value].\n' +
    'Market trend: the category is moving toward [usage-based / outcome-based / hybrid].\n' +
    'Our positioning: we\'re currently [cheaper / pricier / misaligned] relative to [our value].\n' +
    'Opportunity: [specific pricing gap we can exploit].',

  'Proposed Pricing Model':
    'Tier 1 — [name]: $[price]/mo. Includes [core features]. Target: [persona].\n' +
    'Tier 2 — [name]: $[price]/mo. Adds [differentiating features]. Target: [persona].\n' +
    'Tier 3 — [name]: $[price]/mo or custom. Adds [enterprise features]. Target: [persona].\n' +
    'Pricing metric: [per seat / per usage unit / per feature gate].\n' +
    'Annual discount: [X]% for annual commitment.',

  'Revenue Impact Analysis':
    'Base case: [expected revenue change] — [show assumptions and math].\n' +
    'Best case: [high-adoption scenario with revenue projection].\n' +
    'Worst case: [churn/downgrade scenario with revenue projection].\n' +
    'Break-even: [when new model surpasses old model revenue].\n' +
    'Key sensitivity: [which assumption matters most to the outcome].',

  'Customer Impact & Migration':
    'Price increase: [X]% of customers see an increase averaging [amount].\n' +
    'Price decrease or neutral: [X]% of customers — [which segments and why].\n' +
    'Grandfathering: [who gets legacy pricing, for how long, and conditions].\n' +
    'Communication plan: [timeline — internal → beta → general availability].\n' +
    'Support readiness: [estimated question volume and playbook].',

  'Recommendation & Next Steps':
    'Recommendation: [which option, stated clearly with 1-sentence rationale].\n' +
    'Decision needed: [what leadership must approve and by when].\n' +
    'Timeline: [decision date → prep → soft launch → full rollout].\n' +
    'Success metrics: [what you\'ll measure at 30/60/90 days].\n' +
    'Reporting: [how and when you\'ll share results with leadership].',

  // ─── Product One-Pager ───
  'The Opportunity':
    'Market size: [TAM/SAM with source — $ or user count].\n' +
    'Growth: [market growth rate and key drivers].\n' +
    'Customer signal: [evidence of demand — NPS verbatims, support tickets, win-loss data].\n' +
    'Why us: [what positions us to capture this opportunity].',

  'Proposed Solution':
    'We will build [product/feature] that lets [target user] [key action].\n' +
    'Core capabilities: [2-3 key things it does].\n' +
    'User experience: [what the user sees and does — keep it concrete].\n' +
    'Differentiation: [what makes this better than existing alternatives].',

  'Success Metrics':
    'Primary metric: [the single number that defines success].\n' +
    'Current baseline: [where that metric stands today].\n' +
    'Target: [specific goal with timeframe — e.g. "+15% within 90 days"].\n' +
    'Guardrail: [what should NOT get worse as a result of this work].',

  'Scope & Timeline':
    'Phase 1 (MVP): [core capabilities] — target: [date].\n' +
    'Phase 2: [enhancements based on Phase 1 learnings] — target: [date].\n' +
    'Out of scope: [what you are explicitly NOT building].\n' +
    'Key dependency: [external team, API, or decision this depends on].',

  'Resource Ask':
    'Team: [X engineers + Y designers + Z other] for [duration].\n' +
    'Budget: [development cost + infrastructure + third-party services].\n' +
    'Cross-functional: [design, data science, legal, marketing needs].\n' +
    'Trade-off: [what gets deprioritized if we staff this].',

  // ─── Product Pitch ───
  'The Big Idea':
    '[Target users] [pain point — quantified if possible].\n' +
    '[Product name] [solves this by / enables them to] [key capability].\n' +
    'It\'s [the X for Y — positioning analogy] — [why this will win].',

  'Market Opportunity':
    'TAM: $[total addressable market] ([source]).\n' +
    'SAM: $[serviceable addressable market] — our realistic target.\n' +
    'Growth: [X]% YoY driven by [key market drivers].\n' +
    'Why now: [what has changed — technology shift, regulation, behavior change].\n' +
    'Tailwinds: [adjacent trends that support this bet].',

  'Customer Pain':
    'Primary user: [persona] — they spend [X hours/week or $X/year] on [painful task].\n' +
    'Current alternatives: [what they use today and why it falls short].\n' +
    'Quantified cost: [time lost, revenue missed, or money wasted].\n' +
    'Customer voice: "[quote from research or sales conversation]" — [Name, Title].',

  'Our Solution':
    'First use: [what the user sees when they open the product].\n' +
    'Core workflow: [3-5 steps from start to value].\n' +
    '"Aha" moment: [when the user first feels the value].\n' +
    'Key differentiator: [what competitors can\'t easily copy].',

  'Why Us':
    'Existing assets: [data, distribution, brand, or technology advantages].\n' +
    'Team: [relevant expertise and track record].\n' +
    'Moat: [what makes this defensible — network effects, data, switching costs].\n' +
    'Unfair advantage: [what we have that competitors don\'t].',

  'Business Model':
    'Revenue model: [subscription / usage / transaction / hybrid].\n' +
    'Price point: $[price] per [unit] — rationale: [comparable benchmarks].\n' +
    'Unit economics: CAC $[X], LTV $[Y], gross margin [Z]%.\n' +
    'Revenue projection: $[12-month] → $[36-month].\n' +
    'Path to profitability: [when and how].',

  'Go-to-Market':
    'First customers: [who are the first 10/100/1000 and how do you reach them].\n' +
    'Distribution: [direct sales / product-led / partnerships / marketplace].\n' +
    'Marketing: [content, events, outbound, community — primary channels].\n' +
    'Partnerships: [key integrations or co-marketing needed].\n' +
    'Validation: [early traction — waitlist, LOIs, pilot results].',

  'Roadmap & Milestones':
    'Phase 1 (0-3 months): [MVP scope and key deliverables].\n' +
    'Phase 2 (3-6 months): [expansion — features, segments, channels].\n' +
    'Phase 3 (6-12 months): [scale and optimization].\n' +
    'Key decision points: [go/no-go gates with criteria].\n' +
    'Kill criteria: [what would make us stop].',

  'The Ask':
    'Team: [specific roles and headcount needed].\n' +
    'Budget: $[total] — [development + infrastructure + marketing breakdown].\n' +
    'Timeline: [when you need the decision and why].\n' +
    'Deliverables: [what you\'ll deliver by when — concrete milestones].\n' +
    'Success at 6 months: [what "good" looks like].',

  // ─── Packaging Recommendation ───
  'Current Packaging Assessment':
    'Current tiers: [tier names, prices, and what\'s in each].\n' +
    'Revenue split: [% of revenue from each tier].\n' +
    'Usage data: [which features drive upgrades vs. are underused].\n' +
    'Conversion: [where prospects drop off in the upgrade funnel].\n' +
    'Customer feedback: [what customers say about current packaging].',

  'Competitive Packaging Landscape':
    'Competitor A: [tiers, pricing, and key differentiating features per tier].\n' +
    'Competitor B: [tiers, pricing, and key differentiating features per tier].\n' +
    'Trend: the category is moving toward [packaging pattern].\n' +
    'Gap to exploit: [what competitors gate high that we could offer lower].',

  'Proposed Packaging':
    'Tier 1 — [name] ($[price]/mo): Target [persona]. Includes [features].\n' +
    'Tier 2 — [name] ($[price]/mo): Target [persona]. Adds [upgrade triggers].\n' +
    'Tier 3 — [name] ($[price]/mo): Target [persona]. Adds [premium features].\n' +
    'Usage limits: [seats, storage, API calls per tier].\n' +
    'Upgrade trigger: [the specific feature that motivates tier movement].',

  'Feature Allocation Rationale':
    'Table stakes (all tiers): [features every customer expects].\n' +
    'Upgrade triggers: [features that justify the next tier — backed by data].\n' +
    'Premium-only: [features reserved for top tier — and why].\n' +
    'Data backing: [usage patterns and willingness-to-pay evidence].\n' +
    'Competitive consideration: [features we keep low to win against competitors].',

  'Revenue & Adoption Impact':
    'Expected revenue change: [net impact by tier — show migration math].\n' +
    'Customer migration: [X]% upgrade, [Y]% stay, [Z]% downgrade.\n' +
    'New acquisition: [impact on new customer conversion by tier].\n' +
    'Scenarios: optimistic $[X] / base $[Y] / conservative $[Z].\n' +
    'Break-even: [when short-term revenue loss is recovered, if applicable].',

  'Migration Plan':
    'Grandfathering: [who keeps current pricing and for how long].\n' +
    'Forced migrations: [which customers must change and why].\n' +
    'Communication: [internal (week 1) → beta (week 2-4) → all customers (week 6)].\n' +
    'Tools: [self-serve upgrade/downgrade flow vs. CS-assisted].\n' +
    'Rollback: [what triggers a rollback and how it works].',

  'Recommendation & Decision Points':
    'Recommendation: [which packaging option and why — in one sentence].\n' +
    'Decision needed: [what leadership must approve].\n' +
    'Open questions: [unresolved items that need input].\n' +
    'Launch timeline: [decision → prep → soft launch → full rollout].\n' +
    'Success criteria: [what you\'ll measure at 30/60/90 days].',
};

/**
 * Get the ghost paragraph blueprint for a section.
 * Returns a multi-line string with [bracket placeholders], or null if no template exists.
 * Personalizes with the product name from preface context when available.
 */
export function getGhostParagraph(sectionTitle, prefaceContext) {
  const template = GHOST_PARAGRAPHS[sectionTitle];
  if (!template) return null;

  const productName = extractProductName(prefaceContext);
  if (!productName) return template;

  // Replace generic product/feature placeholders with actual name
  return template
    .replace(/\[feature \/ product name\]/gi, productName)
    .replace(/\[product \/ feature name\]/gi, productName);
}
