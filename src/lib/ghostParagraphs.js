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
