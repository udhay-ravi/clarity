// Context-aware ghost prompts.
// Each section defines the structural dimensions needed for a compelling write-up.
// The system checks which dimensions the user has already covered (via keyword detection)
// and prompts for the most important missing dimension.

const SECTION_DIMENSIONS = {
  // ─── PRD ───
  'Executive Summary': [
    {
      dimension: 'what',
      label: 'what you\'re proposing',
      prompt: 'What are you proposing to build or change?',
      signals: ['propose', 'build', 'create', 'launch', 'introduce', 'add', 'implement', 'design', 'develop', 'ship', 'deliver', 'enable', 'product', 'feature', 'tool', 'platform', 'service', 'solution', 'system', 'capability', 'initiative', 'project'],
    },
    {
      dimension: 'problem',
      label: 'the core problem',
      prompt: 'What problem does this solve — in one sentence?',
      signals: ['problem', 'issue', 'pain', 'challenge', 'gap', 'friction', 'struggle', 'difficult', 'broken', 'missing', 'lack', 'need', 'unable', 'cannot', 'inefficien', 'frustrat', 'costly', 'slow', 'risk', 'burden'],
    },
    {
      dimension: 'approach',
      label: 'the approach',
      prompt: 'What\'s the high-level approach or solution?',
      signals: ['approach', 'solution', 'by', 'through', 'via', 'using', 'leverage', 'integrate', 'automate', 'redesign', 'streamline', 'simplify', 'consolidat', 'replace', 'migrate', 'adopt', 'method', 'strategy', 'architecture', 'framework'],
    },
    {
      dimension: 'impact',
      label: 'expected impact',
      prompt: 'What\'s the expected impact — what metric moves and by how much?',
      signals: ['impact', 'result', 'outcome', 'metric', 'improve', 'increase', 'decrease', 'reduce', 'save', 'revenue', 'cost', 'time', 'retention', 'conversion', 'engagement', '%', 'percent', '$', 'target', 'goal', 'expect', 'estimate', 'projected'],
    },
  ],

  'Problem Statement': [
    {
      dimension: 'who',
      label: 'who is affected',
      prompt: 'Who specifically is affected by this problem?',
      signals: ['user', 'users', 'customer', 'customers', 'team', 'people', 'persona', 'segment', 'audience', 'stakeholder', 'buyer', 'admin', 'manager', 'developer', 'engineer', 'designer', 'they', 'them', 'who', 'student', 'reader', 'employee', 'merchant', 'seller', 'vendor', 'provider', 'client', 'consumer', 'member', 'subscriber', 'visitor', 'shopper', 'owner', 'operator', 'founder', 'startup', 'enterprise', 'small business', 'organization', 'company', 'companies'],
    },
    {
      dimension: 'what',
      label: 'what the problem is',
      prompt: 'What exactly is the problem — in concrete terms?',
      signals: ['problem', 'issue', 'pain', 'struggle', 'difficult', 'unable', 'cannot', 'broken', 'fails', 'missing', 'lack', 'gap', 'friction', 'blocker', 'challenge', 'experience', 'suffer', 'face', 'deal with', 'cope', 'endure', 'overwhelm', 'burden', 'inefficien', 'confus', 'error', 'mistake', 'wrong', 'bad', 'poor', 'inadequate', 'outdated', 'clunky', 'tedious', 'cumbersome', 'unreliable', 'inconsisten', 'inaccurate', 'pay ', 'paying', 'spend', 'overpay', 'overcharge', 'waste', 'losing', 'disrupt'],
    },
    {
      dimension: 'frequency',
      label: 'how often it happens',
      prompt: 'How often does this happen — daily, weekly, every semester?',
      signals: ['daily', 'weekly', 'monthly', 'every time', 'frequently', 'often', 'always', 'whenever', 'each time', 'recurring', 'constantly', 'regular', 'annually', 'yearly', 'semester', 'quarter', 'per year', 'per month', 'per week', 'each year', 'per day', 'every year', 'every month', 'every week', 'every day', 'once a', 'twice a', 'times a', 'per transaction', 'each order', 'every purchase', 'every sprint', 'each cycle', 'per project', 'each release', 'routine', 'habitual', 'periodic', 'ongoing', 'continuous', 'repeated'],
    },
    {
      dimension: 'impact',
      label: 'the measurable impact',
      prompt: 'What\'s the measurable cost or impact of this problem?',
      signals: ['cost', 'revenue', 'time', 'hours', 'minutes', 'money', 'churn', 'retention', 'loss', 'waste', 'delay', 'slow', 'expensive', 'impact', '%', 'percent', 'million', 'thousand', '$', 'billion', 'annual', 'save', 'spend', 'budget', 'overhead', 'inefficien', 'productiv', 'downtime', 'outage', 'inventory', 'stockout', 'backlog'],
    },
    {
      dimension: 'workaround',
      label: 'current workarounds',
      prompt: 'What do they do today to work around this?',
      signals: ['today', 'currently', 'workaround', 'instead', 'manual', 'spreadsheet', 'hack', 'alternative', 'existing', 'right now', 'at the moment', 'cobble', 'buying from', 'use ', 'using', 'rely on', 'turn to', 'resort to', 'fall back', 'make do', 'cope by', 'handle it by', 'get around', 'band-aid', 'duct tape', 'patchwork'],
    },
  ],

  'Goals & Success Metrics': [
    {
      dimension: 'outcome',
      label: 'the desired outcome',
      prompt: 'What outcome defines success — in one sentence?',
      signals: ['goal', 'objective', 'outcome', 'success', 'aim', 'achieve', 'accomplish', 'result', 'target', 'vision', 'north star', 'mission', 'purpose', 'intent', 'aspir', 'want to', 'need to', 'enable', 'empower', 'deliver', 'provide', 'ensure'],
    },
    {
      dimension: 'metric',
      label: 'the key metric',
      prompt: 'What specific metric will you track?',
      signals: ['metric', 'kpi', 'measure', 'track', 'conversion', 'retention', 'engagement', 'nps', 'dau', 'mau', 'revenue', 'arpu', 'ltv', 'csat', 'adoption', 'activation', 'usage', 'signup', 'funnel', 'rate', 'ratio', 'score', 'index', 'throughput', 'velocity', 'volume'],
    },
    {
      dimension: 'baseline',
      label: 'the current baseline',
      prompt: 'What\'s the current baseline for that metric?',
      signals: ['today', 'current', 'baseline', 'currently', 'now', 'existing', 'starting', 'before', 'as of', 'right now', 'at present', 'stands at', 'sitting at', 'hovering', 'average', 'typical', 'benchmark', 'last quarter', 'last month', 'last year', 'historical'],
    },
    {
      dimension: 'target',
      label: 'the target number',
      prompt: 'What\'s the specific target number you\'re aiming for?',
      signals: ['target', 'goal', 'reach', 'increase', 'decrease', 'improve', 'reduce', 'grow', 'from', 'to', '%', 'percent', 'double', 'triple', '2x', '3x', '10x', 'raise', 'lower', 'boost', 'lift', 'cut', 'eliminate', 'achieve', 'hit', 'surpass', 'exceed', 'minimum', 'at least', 'north of'],
    },
    {
      dimension: 'timeline',
      label: 'the timeline',
      prompt: 'By when do you need to hit this target?',
      signals: ['week', 'month', 'quarter', 'q1', 'q2', 'q3', 'q4', 'year', 'deadline', 'by', 'within', 'sprint', 'launch', 'timeline', 'date', 'day', 'end of', 'beginning of', 'mid-', 'eoy', 'eoq', 'h1', 'h2', 'fiscal', 'calendar', 'before', 'after', 'during', 'next'],
    },
  ],

  'User Stories': [
    {
      dimension: 'persona',
      label: 'the user persona',
      prompt: 'Who is the primary user persona for these stories?',
      signals: ['as a', 'user', 'admin', 'manager', 'customer', 'buyer', 'developer', 'persona', 'role', 'student', 'teacher', 'analyst', 'operator', 'member', 'subscriber', 'visitor', 'shopper', 'seller', 'creator', 'reader', 'editor', 'reviewer', 'approver', 'owner', 'agent', 'representative'],
    },
    {
      dimension: 'action',
      label: 'the key action',
      prompt: 'What key action does the user need to perform?',
      signals: ['want to', 'need to', 'able to', 'can', 'should', 'action', 'do', 'create', 'view', 'edit', 'delete', 'search', 'filter', 'submit', 'upload', 'download', 'share', 'send', 'invite', 'approve', 'reject', 'assign', 'schedule', 'configure', 'import', 'export', 'connect', 'integrate', 'manage', 'track', 'monitor', 'review', 'sort', 'organize', 'navigate', 'browse'],
    },
    {
      dimension: 'outcome',
      label: 'the user outcome',
      prompt: 'What outcome does the user get from this action?',
      signals: ['so that', 'in order to', 'because', 'outcome', 'benefit', 'value', 'save', 'faster', 'easier', 'better', 'without', 'reduce', 'avoid', 'prevent', 'ensure', 'gain', 'achieve', 'improve', 'streamline', 'simplify', 'automate', 'eliminate', 'focus on', 'spend less', 'spend more'],
    },
    {
      dimension: 'acceptance',
      label: 'acceptance criteria',
      prompt: 'What are the acceptance criteria — how do you know it works?',
      signals: ['accept', 'criteria', 'given', 'when', 'then', 'verify', 'validate', 'test', 'condition', 'requirement', 'must', 'should be', 'expect', 'assert', 'confirm', 'check', 'ensure', 'edge case', 'scenario', 'boundary', 'error handling', 'success case', 'failure case', 'happy path'],
    },
    {
      dimension: 'priority',
      label: 'the priority ranking',
      prompt: 'Which story is the highest priority and why?',
      signals: ['priority', 'p0', 'p1', 'p2', 'critical', 'must have', 'essential', 'important', 'first', 'mvp', 'core', 'nice to have', 'should have', 'could have', 'blocking', 'required', 'optional', 'tier 1', 'tier 2', 'high', 'medium', 'low', 'rank', 'order', 'urgent'],
    },
  ],

  'Scope (In & Out)': [
    {
      dimension: 'in-scope',
      label: 'what\'s in scope',
      prompt: 'What\'s explicitly included in this version?',
      signals: ['include', 'build', 'in scope', 'will', 'deliver', 'ship', 'support', 'implement', 'create', 'add', 'enable', 'cover', 'address', 'handle', 'provide', 'offer', 'feature', 'capability', 'functionality', 'module', 'page', 'endpoint', 'component', 'integration'],
    },
    {
      dimension: 'out-of-scope',
      label: 'what\'s out of scope',
      prompt: 'What are you explicitly NOT building?',
      signals: ['not', 'won\'t', 'exclude', 'out of scope', 'defer', 'skip', 'later', 'v2', 'future', 'phase 2', 'backlog', 'outside', 'no', 'omit', 'postpone', 'push back', 'next release', 'follow-up', 'table for now', 'not included', 'not part of', 'beyond', 'separate effort'],
    },
    {
      dimension: 'mvp',
      label: 'the MVP definition',
      prompt: 'What\'s the smallest version that still solves the core problem?',
      signals: ['mvp', 'minimum', 'smallest', 'simplest', 'lean', 'core', 'essential', 'bare', 'basic', 'first version', 'v1', 'initial', 'launch version', 'stripped down', 'good enough', 'table stakes', 'must have', 'non-negotiable', 'minimum lovable', 'minimum viable'],
    },
    {
      dimension: 'dependencies',
      label: 'dependencies',
      prompt: 'Are there dependencies or constraints that affect scope?',
      signals: ['depend', 'dependency', 'blocked', 'requires', 'needs', 'constraint', 'limit', 'api', 'integration', 'team', 'platform', 'service', 'library', 'third party', 'external', 'vendor', 'partner', 'prerequisite', 'before we can', 'waiting on', 'need from', 'relies on', 'coupled', 'downstream', 'upstream'],
    },
  ],

  'Solution Overview': [
    {
      dimension: 'approach',
      label: 'the approach',
      prompt: 'Describe the high-level approach in one sentence.',
      signals: ['approach', 'solution', 'design', 'architecture', 'build', 'implement', 'create', 'use', 'leverage', 'integrate', 'system', 'flow', 'model', 'framework', 'pattern', 'method', 'technique', 'strategy', 'plan', 'propose', 'introduce', 'adopt', 'deploy', 'migrate', 'refactor', 'restructure'],
    },
    {
      dimension: 'alternatives',
      label: 'alternatives considered',
      prompt: 'What alternatives did you consider and why did you reject them?',
      signals: ['alternative', 'option', 'consider', 'evaluated', 'compared', 'versus', 'vs', 'instead', 'other', 'rejected', 'chose', 'decided', 'ruled out', 'explored', 'looked at', 'weighed', 'assessed', 'between', 'or', 'also thought about', 'initially', 'could have', 'another way'],
    },
    {
      dimension: 'tradeoffs',
      label: 'key tradeoffs',
      prompt: 'What are the key tradeoffs in this approach?',
      signals: ['tradeoff', 'trade-off', 'compromise', 'downside', 'cost', 'risk', 'sacrifice', 'accept', 'limitation', 'but', 'however', 'although', 'despite', 'at the expense', 'gives us', 'costs us', 'gain', 'lose', 'tension', 'balance', 'pragmatic', 'ideal', 'realistic', 'perfect'],
    },
    {
      dimension: 'technical',
      label: 'technical constraints',
      prompt: 'What technical constraints or choices shaped this design?',
      signals: ['technical', 'tech', 'stack', 'api', 'database', 'infrastructure', 'performance', 'scale', 'security', 'latency', 'architecture', 'service', 'framework', 'library', 'language', 'protocol', 'schema', 'migration', 'backwards compat', 'legacy', 'microservice', 'monolith', 'cloud', 'server', 'client', 'mobile', 'web', 'cache', 'queue'],
    },
  ],

  'Open Questions': [
    {
      dimension: 'unknowns',
      label: 'key unknowns',
      prompt: 'What\'s the biggest unknown that could change the plan?',
      signals: ['unknown', 'unclear', 'unsure', 'don\'t know', 'uncertain', 'question', 'investigate', 'research', 'explore', 'tbd', 'open', 'pending', 'unresolved', 'ambiguous', 'depends', 'might', 'could', 'need to figure out', 'still deciding', 'not yet', 'waiting for', 'to be determined'],
    },
    {
      dimension: 'stakeholders',
      label: 'stakeholder input needed',
      prompt: 'Who needs to weigh in or approve before you proceed?',
      signals: ['stakeholder', 'approve', 'review', 'sign off', 'decision', 'legal', 'compliance', 'leadership', 'exec', 'manager', 'team lead', 'sponsor', 'vp', 'director', 'cto', 'ceo', 'board', 'committee', 'council', 'input from', 'feedback from', 'alignment with', 'buy-in', 'sign-off', 'green light'],
    },
    {
      dimension: 'assumptions',
      label: 'risky assumptions',
      prompt: 'What assumption, if wrong, would change everything?',
      signals: ['assume', 'assumption', 'hypothesis', 'believe', 'expect', 'if', 'risk', 'bet', 'depend on', 'premise', 'presume', 'take for granted', 'given that', 'suppose', 'based on', 'contingent', 'predicated', 'hinge on', 'crucial that', 'must be true'],
    },
    {
      dimension: 'deadline',
      label: 'decision deadlines',
      prompt: 'What decisions have deadlines attached?',
      signals: ['deadline', 'date', 'by when', 'timeline', 'urgent', 'blocker', 'before', 'asap', 'soon', 'time-sensitive', 'critical path', 'blocking', 'gates', 'milestone', 'cutoff', 'drop-dead', 'no later than', 'end of week', 'end of sprint', 'need by'],
    },
  ],

  // ─── One-Pager ───
  'The Problem': [
    {
      dimension: 'who',
      label: 'who is affected',
      prompt: 'Who is most affected by this problem?',
      signals: ['user', 'customer', 'team', 'people', 'persona', 'segment', 'who', 'they', 'them', 'audience', 'student', 'reader', 'employee', 'merchant', 'seller', 'buyer', 'client', 'consumer', 'member', 'subscriber', 'visitor', 'shopper', 'owner', 'operator', 'founder', 'enterprise', 'company', 'companies', 'organization'],
    },
    {
      dimension: 'pain',
      label: 'the pain point',
      prompt: 'How severe is this — annoyance or true blocker?',
      signals: ['pain', 'frustrat', 'blocker', 'critical', 'severe', 'annoying', 'broken', 'impossible', 'fail', 'struggle', 'difficult', 'experience', 'suffer', 'endure', 'overwhelm', 'burden', 'tedious', 'cumbersome', 'unreliable', 'inaccurate', 'confus', 'error', 'waste', 'pay ', 'paying', 'spend', 'overpay', 'expensive', 'inefficien', 'clunky', 'outdated', 'disrupt'],
    },
    {
      dimension: 'evidence',
      label: 'evidence it\'s real',
      prompt: 'What evidence do you have that this problem is real and widespread?',
      signals: ['data', 'research', 'survey', 'interview', 'feedback', 'ticket', 'complaint', 'evidence', 'number', '%', 'percent', 'report', 'study', '$', 'million', 'billion', 'thousand', 'annually', 'per year', 'estimate', 'stat', 'metric', 'according', 'found that', 'showed', 'revealed', 'discovered', 'nationwide', 'industry-wide', 'market'],
    },
    {
      dimension: 'cost-of-inaction',
      label: 'cost of inaction',
      prompt: 'What happens if you ignore this for 6 more months?',
      signals: ['if we don\'t', 'without', 'cost', 'lose', 'churn', 'risk', 'worse', 'grow', 'compound', 'escalate', 'ignore', 'competitor', 'fall behind', 'miss', 'opportunity', 'capture', 'erode', 'decline', 'attrition', 'market share'],
    },
  ],

  'Why Now': [
    {
      dimension: 'trigger',
      label: 'the trigger',
      prompt: 'What changed recently that makes this urgent?',
      signals: ['change', 'new', 'recent', 'shift', 'update', 'launch', 'announce', 'trend', 'emerge', 'grow', 'just', 'now', 'this year', 'this quarter', 'started', 'began', 'introduced', 'released', 'rolled out', 'since', 'after'],
    },
    {
      dimension: 'competition',
      label: 'competitive pressure',
      prompt: 'Is there a competitive or market trigger driving urgency?',
      signals: ['competitor', 'competition', 'market', 'industry', 'rival', 'threat', 'gap', 'opportunity', 'window', 'race', 'first mover', 'catching up', 'overtake', 'disrupt', 'entering', 'launch', 'their'],
    },
    {
      dimension: 'cost-of-delay',
      label: 'cost of delay',
      prompt: 'What do you lose by waiting another quarter?',
      signals: ['delay', 'wait', 'cost', 'miss', 'lose', 'behind', 'late', 'opportunity cost', 'window', 'every month', 'every quarter', 'each day', 'longer we', 'revenue', 'customers', 'market share', 'erode', 'compound', 'accumulate'],
    },
    {
      dimension: 'momentum',
      label: 'internal momentum',
      prompt: 'Is there internal momentum or sponsorship behind this?',
      signals: ['sponsor', 'executive', 'leadership', 'momentum', 'priority', 'roadmap', 'initiative', 'support', 'champion', 'aligned', 'buy-in', 'approved', 'funded', 'green light', 'mandate', 'directive', 'backing', 'enthusiasm', 'team ready', 'bandwidth'],
    },
  ],

  'Our Bet': [
    {
      dimension: 'proposal',
      label: 'the proposal',
      prompt: 'What specifically are you proposing to build or change?',
      signals: ['build', 'create', 'launch', 'implement', 'introduce', 'add', 'redesign', 'propose', 'bet', 'invest', 'allow', 'enable', 'platform', 'app', 'tool', 'feature', 'product', 'service', 'solution'],
    },
    {
      dimension: 'thesis',
      label: 'why it will work',
      prompt: 'Why do you believe this approach will work?',
      signals: ['because', 'believe', 'hypothesis', 'evidence', 'data', 'research', 'proven', 'similar', 'validate', 'confident', 'works because', 'showed that', 'demonstrated', 'tested', 'successful', 'model', 'precedent', 'analog', 'already', 'elsewhere'],
    },
    {
      dimension: 'risk',
      label: 'the riskiest assumption',
      prompt: 'What\'s the riskiest assumption in this bet?',
      signals: ['risk', 'assume', 'if', 'might not', 'could fail', 'uncertain', 'unknown', 'gamble', 'downside', 'wrong', 'depends on', 'biggest risk', 'concern', 'worry', 'threat', 'vulnerability', 'fragile', 'untested'],
    },
    {
      dimension: 'mvp',
      label: 'the simplest test',
      prompt: 'What\'s the simplest version you could ship to test this?',
      signals: ['mvp', 'simple', 'minimum', 'first', 'test', 'experiment', 'pilot', 'prototype', 'lean', 'smallest', 'v1', 'alpha', 'beta', 'proof of concept', 'poc', 'spike', 'trial', 'validate', 'cheapest', 'quickest'],
    },
  ],

  'Execution Plan': [
    {
      dimension: 'first-30-days',
      label: 'first 30 days',
      prompt: 'What happens in the first 30 days specifically?',
      signals: ['30 days', 'first month', 'week 1', 'week one', 'initially', 'start by', 'day 1', 'kickoff', 'begin with', 'first step', 'first week', 'sprint 1', 'phase 1', 'first phase', 'onboarding', 'setup', 'foundation', 'groundwork', 'get started'],
    },
    {
      dimension: 'ownership',
      label: 'ownership',
      prompt: 'Who owns this, and what are they unblocking first?',
      signals: ['own', 'owner', 'lead', 'responsible', 'team', 'engineer', 'designer', 'pm', 'unblock', 'assign', 'drive', 'accountable', 'dri', 'point person', 'project lead', 'staff', 'hire', 'resource', 'allocat'],
    },
    {
      dimension: 'risk',
      label: 'execution risk',
      prompt: 'What\'s the one thing that could derail this plan?',
      signals: ['risk', 'derail', 'fail', 'blocker', 'delay', 'slip', 'threat', 'concern', 'if', 'might not', 'could go wrong', 'bottleneck', 'obstacle', 'challenge', 'constraint', 'shortage', 'dependency', 'critical path', 'single point of failure'],
    },
    {
      dimension: 'prerequisites',
      label: 'prerequisites',
      prompt: 'What needs to be true before this can start?',
      signals: ['before', 'prerequisite', 'depend', 'require', 'need', 'ready', 'in place', 'assumption', 'given that', 'once', 'first need', 'must have', 'setup', 'approval', 'access', 'infrastructure', 'tooling', 'environment', 'agreement'],
    },
  ],

  'How We\'ll Know It Worked': [
    {
      dimension: 'metric',
      label: 'the key metric',
      prompt: 'What\'s the single most important metric for this?',
      signals: ['metric', 'kpi', 'measure', 'track', 'conversion', 'retention', 'engagement', 'nps', 'revenue', 'growth', 'adoption', 'activation', 'usage', 'satisfaction', 'rate', 'score', 'index', 'number', 'signal'],
    },
    {
      dimension: 'baseline',
      label: 'the baseline',
      prompt: 'What does that metric look like today?',
      signals: ['today', 'current', 'baseline', 'now', 'before', 'starting point', 'existing', 'as of', 'stands at', 'currently at', 'averaging', 'hovering', 'last quarter', 'last month', 'benchmark'],
    },
    {
      dimension: 'target',
      label: 'the target',
      prompt: 'What would "good" look like in 90 days?',
      signals: ['target', 'goal', 'aim', 'reach', 'improve', 'increase', 'decrease', '%', 'percent', 'number', 'double', 'by', 'from', 'to', 'achieve', 'hit', 'north of', 'at least', 'minimum', 'good looks like', 'success looks like'],
    },
    {
      dimension: 'leading-indicator',
      label: 'leading indicators',
      prompt: 'What leading indicators will you watch weekly before the target is hit?',
      signals: ['leading', 'indicator', 'signal', 'early', 'weekly', 'monitor', 'watch', 'proxy', 'predict', 'correlate', 'dashboard', 'alert', 'check-in', 'review', 'canary', 'upstream', 'daily check', 'trending'],
    },
  ],

  // ─── Launch Brief ───
  'What We\'re Launching': [
    {
      dimension: 'what',
      label: 'what you\'re launching',
      prompt: 'Explain what you\'re launching in plain, non-technical language.',
      signals: ['feature', 'product', 'tool', 'capability', 'update', 'release', 'function', 'experience', 'launch', 'introducing', 'rolling out', 'shipping', 'adding', 'enabling', 'building', 'platform', 'app', 'service', 'module', 'integration', 'redesign', 'version', 'upgrade'],
    },
    {
      dimension: 'user-impact',
      label: 'the user impact',
      prompt: 'What changes for the user\'s day-to-day experience?',
      signals: ['user', 'experience', 'workflow', 'easier', 'faster', 'better', 'able to', 'now can', 'before', 'after', 'change', 'difference', 'means that', 'instead of', 'no longer', 'save', 'reduce', 'eliminate', 'streamline', 'simplify', 'automate', 'day-to-day', 'daily', 'routine', 'task'],
    },
    {
      dimension: 'new-vs-improvement',
      label: 'new or improvement',
      prompt: 'Is this brand new or an improvement to something existing?',
      signals: ['new', 'improvement', 'redesign', 'upgrade', 'replace', 'enhance', 'addition', 'existing', 'current', 'brand new', 'net new', 'ground up', 'from scratch', 'iteration', 'evolution', 'v2', 'overhaul', 'refresh', 'rebuild', 'revamp', 'extending', 'expanding'],
    },
    {
      dimension: 'headline',
      label: 'the announcement headline',
      prompt: 'What\'s the one-sentence pitch for the announcement?',
      signals: ['announce', 'headline', 'pitch', 'tagline', 'message', 'story', 'narrative', 'blog', 'press', 'email', 'subject line', 'tweet', 'title', 'summary', 'one-liner', 'elevator', 'sentence', 'positioning', 'hook', 'lead'],
    },
  ],

  'Who It\'s For': [
    {
      dimension: 'persona',
      label: 'the target persona',
      prompt: 'Describe your ideal early adopter in detail.',
      signals: ['persona', 'user', 'customer', 'segment', 'type', 'role', 'profile', 'demographic', 'who', 'adopter', 'buyer', 'audience', 'target', 'ideal', 'typical', 'power user', 'champion', 'early', 'first users', 'primary', 'they are', 'these are'],
    },
    {
      dimension: 'segment',
      label: 'the first target segment',
      prompt: 'Which specific segment will you target first?',
      signals: ['segment', 'cohort', 'group', 'tier', 'market', 'niche', 'vertical', 'industry', 'size', 'first', 'initial', 'beachhead', 'focus', 'start with', 'begin with', 'pilot', 'beta', 'early access', 'launch to', 'rollout', 'geo', 'region', 'enterprise', 'smb', 'mid-market'],
    },
    {
      dimension: 'size',
      label: 'the audience size',
      prompt: 'How large is this target audience?',
      signals: ['size', 'how many', 'million', 'thousand', 'number', 'count', 'tam', 'sam', 'som', '%', 'addressable', 'opportunity', 'market size', 'users', 'accounts', 'companies', 'organizations', 'seats', 'potential', 'estimated', 'approximately', 'roughly', 'about'],
    },
    {
      dimension: 'unmet-need',
      label: 'the unmet need',
      prompt: 'What unmet need do they have that competitors miss?',
      signals: ['need', 'want', 'gap', 'miss', 'underserve', 'competitor', 'alternative', 'unmet', 'pain', 'desire', 'lack', 'wish', 'if only', 'frustrated', 'no one', 'nobody', 'nothing', 'can\'t find', 'don\'t have', 'looking for', 'searching for', 'asking for', 'requesting'],
    },
  ],

  'Why It Matters': [
    {
      dimension: 'job-to-be-done',
      label: 'the job to be done',
      prompt: 'What job does this help users get done?',
      signals: ['job', 'task', 'accomplish', 'achieve', 'do', 'complete', 'solve', 'goal', 'outcome', 'help', 'enable', 'allow', 'get done', 'finish', 'fulfill', 'satisfy', 'need to', 'want to', 'trying to', 'when they', 'so they can', 'in order to'],
    },
    {
      dimension: 'emotion',
      label: 'the emotional need',
      prompt: 'What emotional need does this address — relief, confidence, delight?',
      signals: ['feel', 'emotion', 'trust', 'confident', 'relief', 'delight', 'frustrat', 'happy', 'anxious', 'stress', 'love', 'joy', 'peace of mind', 'comfort', 'empowered', 'in control', 'proud', 'excited', 'worried', 'afraid', 'overwhelmed', 'calm', 'satisfied', 'reassured'],
    },
    {
      dimension: 'switching',
      label: 'the switching reason',
      prompt: 'Why would someone switch from their current solution to this?',
      signals: ['switch', 'replace', 'migrate', 'leave', 'abandon', 'instead', 'better than', 'versus', 'compared', 'over', 'prefer', 'choose', 'move from', 'upgrade from', 'ditch', 'drop', 'stop using', 'current solution', 'existing tool', 'competitor', 'alternative', 'outgrow'],
    },
    {
      dimension: 'magnitude',
      label: 'the magnitude of improvement',
      prompt: 'Is this a 10% improvement or a 10x improvement — and why?',
      signals: ['10x', '10%', 'magnitude', 'order of', 'dramatically', 'significantly', 'massive', 'incremental', 'game chang', 'transform', 'revolution', 'step change', 'leap', 'quantum', 'night and day', 'world of difference', 'fundamentally', 'radically', 'completely', 'entirely', 'exponential', 'marginal', 'modest', 'substantial'],
    },
  ],

  'How We\'re Going to Market': [
    {
      dimension: 'channels',
      label: 'distribution channels',
      prompt: 'What distribution channels will reach your target users?',
      signals: ['channel', 'email', 'social', 'blog', 'ads', 'seo', 'content', 'partner', 'referral', 'organic', 'paid', 'pr', 'press', 'media', 'newsletter', 'community', 'forum', 'slack', 'discord', 'twitter', 'linkedin', 'youtube', 'podcast', 'event', 'conference', 'webinar', 'outbound', 'inbound', 'sales', 'product-led', 'word of mouth', 'viral'],
    },
    {
      dimension: 'launch-plan',
      label: 'the launch sequence',
      prompt: 'What\'s the launch day sequence — what happens first?',
      signals: ['launch', 'day', 'announce', 'release', 'rollout', 'phase', 'sequence', 'first', 'then', 'plan', 'week 1', 'month 1', 'day 1', 'schedule', 'timeline', 'before', 'after', 'during', 'morning', 'afternoon', 'post', 'publish', 'send', 'notify', 'activate', 'go live', 'flip the switch'],
    },
    {
      dimension: 'partners',
      label: 'key partners',
      prompt: 'Who are your internal champions or external partners?',
      signals: ['partner', 'champion', 'sales', 'support', 'marketing', 'team', 'collaborate', 'internal', 'external', 'stakeholder', 'advocate', 'ambassador', 'ally', 'sponsor', 'evangelist', 'influencer', 'advisor', 'agency', 'vendor', 'reseller', 'affiliate', 'integration partner'],
    },
    {
      dimension: 'cta',
      label: 'the call to action',
      prompt: 'What\'s the specific call-to-action for users?',
      signals: ['cta', 'call to action', 'sign up', 'try', 'start', 'click', 'download', 'activate', 'onboard', 'action', 'register', 'subscribe', 'upgrade', 'get started', 'learn more', 'request', 'demo', 'free trial', 'waitlist', 'join', 'buy', 'purchase', 'book', 'schedule'],
    },
  ],

  'What Could Go Wrong': [
    {
      dimension: 'failure-mode',
      label: 'the likely failure mode',
      prompt: 'What\'s the most likely way this could fail?',
      signals: ['fail', 'risk', 'issue', 'problem', 'wrong', 'break', 'bug', 'miss', 'flop', 'underperform', 'backfire', 'bomb', 'fall flat', 'not work', 'doesn\'t land', 'rejected', 'ignored', 'poor reception', 'negative', 'backlash', 'confusion', 'overwhelm'],
    },
    {
      dimension: 'adoption-risk',
      label: 'adoption risk',
      prompt: 'What if adoption is slower than expected?',
      signals: ['adoption', 'usage', 'slow', 'low', 'engagement', 'traction', 'uptake', 'retention', 'churn', 'activation', 'onboarding', 'sign up', 'try', 'comeback', 'stickiness', 'daily active', 'weekly active', 'drop off', 'abandon', 'bounce', 'not using', 'awareness'],
    },
    {
      dimension: 'technical-risk',
      label: 'technical risk',
      prompt: 'Are there technical risks that could delay or compromise the launch?',
      signals: ['technical', 'scale', 'performance', 'security', 'infrastructure', 'downtime', 'outage', 'bug', 'latency', 'load', 'crash', 'data loss', 'migration', 'integration', 'api', 'dependency', 'breaking change', 'backwards compat', 'reliability', 'availability', 'capacity', 'bottleneck'],
    },
    {
      dimension: 'mitigation',
      label: 'the mitigation plan',
      prompt: 'What\'s your mitigation or rollback plan?',
      signals: ['mitigat', 'rollback', 'plan b', 'fallback', 'contingency', 'if', 'then we', 'backup', 'revert', 'monitor', 'alert', 'flag', 'feature flag', 'kill switch', 'circuit breaker', 'gradual rollout', 'canary', 'staged', 'percentage', 'undo', 'recover', 'restore', 'incident', 'response'],
    },
  ],

  // ─── Competitive Analysis ───
  'Market Context': [
    {
      dimension: 'category',
      label: 'the market category',
      prompt: 'What market category does this fall into?',
      signals: ['market', 'category', 'space', 'industry', 'sector', 'vertical', 'segment', 'domain', 'landscape', 'ecosystem', 'arena', 'field', 'world of', 'broader', 'within', 'belongs to', 'classified', 'positioned', 'operates in'],
    },
    {
      dimension: 'size',
      label: 'the market size',
      prompt: 'How large is this market — and is it growing or shrinking?',
      signals: ['size', 'billion', 'million', 'revenue', 'tam', 'sam', 'growing', 'shrinking', 'cagr', 'growth', 'mature', 'worth', 'valued at', 'estimated', 'projected', 'forecast', 'expected to', 'annual', 'spend', 'investment', 'opportunity', 'market cap', 'declining', 'stagnant', 'booming', 'expanding'],
    },
    {
      dimension: 'trends',
      label: 'macro trends',
      prompt: 'What macro trends are reshaping this space?',
      signals: ['trend', 'shift', 'change', 'ai', 'cloud', 'mobile', 'regulation', 'consolidat', 'emerging', 'disruption', 'digital transform', 'remote', 'hybrid', 'sustainability', 'privacy', 'automation', 'self-serve', 'platform', 'unbundl', 'bundl', 'vertical', 'horizontal', 'commoditiz', 'personali', 'real-time'],
    },
    {
      dimension: 'buyer-criteria',
      label: 'buyer criteria',
      prompt: 'What matters most to buyers when they choose a solution?',
      signals: ['buyer', 'criteria', 'choose', 'decision', 'price', 'feature', 'brand', 'trust', 'integration', 'support', 'ease', 'evaluate', 'compare', 'priority', 'must have', 'deal breaker', 'table stakes', 'non-negotiable', 'prefer', 'value', 'care about', 'look for', 'important', 'factor', 'requirement'],
    },
  ],

  'Competitors Overview': [
    {
      dimension: 'leader',
      label: 'the market leader',
      prompt: 'Who is the market leader — and what makes them dominant?',
      signals: ['leader', 'dominant', 'biggest', 'market share', '#1', 'number one', 'top', 'leading', 'incumbent', 'established', 'enterprise', 'giant', 'gorilla', 'powerhouse', 'well-known', 'household name', 'default', 'go-to', 'standard', 'monopoly', 'duopoly'],
    },
    {
      dimension: 'direct',
      label: 'direct competitors',
      prompt: 'Name your direct competitors — what do they do well?',
      signals: ['direct', 'competitor', 'rival', 'similar', 'same', 'head to head', 'versus', 'compete', 'comparable', 'overlap', 'alternative', 'option', 'substitute', 'also offers', 'strengths', 'good at', 'known for', 'excels', 'advantage'],
    },
    {
      dimension: 'indirect',
      label: 'indirect competitors',
      prompt: 'Are there indirect competitors or substitutes solving this differently?',
      signals: ['indirect', 'substitute', 'alternative', 'different approach', 'spreadsheet', 'manual', 'in-house', 'custom', 'homegrown', 'diy', 'workaround', 'adjacent', 'not obvious', 'also competes', 'different way', 'non-traditional', 'email', 'excel', 'pen and paper', 'doing nothing', 'status quo'],
    },
    {
      dimension: 'pricing',
      label: 'the pricing landscape',
      prompt: 'How do competitors price — and where do you sit?',
      signals: ['price', 'pricing', 'cost', 'free', 'freemium', 'subscription', 'per seat', 'tier', 'plan', 'cheap', 'expensive', 'premium', 'enterprise', 'value', 'affordable', 'per user', 'flat rate', 'usage-based', 'consumption', 'credit', 'annual', 'monthly', 'discount', 'bundle', 'package'],
    },
  ],

  'Where We Win': [
    {
      dimension: 'advantage',
      label: 'the core advantage',
      prompt: 'What\'s your core competitive advantage?',
      signals: ['advantage', 'strength', 'better', 'superior', 'unique', 'differentiat', 'stand out', 'edge', 'moat', 'special', 'distinct', 'unlike', 'only', 'first', 'best at', 'excels', 'shine', 'outperform', 'leader in', 'known for', 'reputation', 'trusted'],
    },
    {
      dimension: 'customer-voice',
      label: 'what customers say',
      prompt: 'What do customers specifically say they love about you?',
      signals: ['customer', 'say', 'love', 'feedback', 'review', 'testimonial', 'nps', 'recommend', 'praise', 'value', 'appreciate', 'rave', 'favorite', 'best thing', 'why they chose', 'switched because', 'quote', 'verbatim', 'told us', 'mentioned', 'highlighted', 'survey'],
    },
    {
      dimension: 'defensibility',
      label: 'defensibility',
      prompt: 'What\'s hard for competitors to copy about your advantage?',
      signals: ['copy', 'replicate', 'defensi', 'moat', 'patent', 'network effect', 'data', 'proprietary', 'switching cost', 'lock-in', 'barrier', 'hard to', 'impossible to', 'years to', 'unique data', 'flywheel', 'scale advantage', 'ecosystem', 'community', 'brand', 'expertise', 'institutional knowledge'],
    },
  ],

  'Where We\'re Weak': [
    {
      dimension: 'losses',
      label: 'where we lose deals',
      prompt: 'Where do you lose deals — and to whom?',
      signals: ['lose', 'lost', 'deal', 'competitor', 'chose', 'switch', 'leave', 'churn', 'objection', 'went with', 'picked', 'preferred', 'over us', 'instead of us', 'dropped us', 'canceled', 'didn\'t renew', 'evaluated', 'shortlisted', 'eliminated'],
    },
    {
      dimension: 'feature-gaps',
      label: 'feature gaps',
      prompt: 'What key features do competitors have that you lack?',
      signals: ['feature', 'gap', 'missing', 'lack', 'don\'t have', 'need', 'request', 'behind', 'catch up', 'roadmap', 'backlog', 'asked for', 'demanded', 'expected', 'table stakes', 'parity', 'doesn\'t support', 'can\'t do', 'limitation', 'workaround', 'manual', 'they have'],
    },
    {
      dimension: 'perception',
      label: 'perception risk',
      prompt: 'What would a competitor say about your weaknesses?',
      signals: ['perceive', 'reputation', 'brand', 'position', 'claim', 'argue', 'attack', 'weakness', 'criticism', 'knock', 'narrative', 'fud', 'fear', 'doubt', 'uncertainty', 'spin', 'portray', 'paint', 'stereotype', 'stigma', 'label', 'too small', 'too new', 'unproven'],
    },
  ],

  'Strategic Implication': [
    {
      dimension: 'double-down',
      label: 'what to double down on',
      prompt: 'Based on this analysis, what should you double down on?',
      signals: ['double down', 'invest', 'strength', 'lean into', 'focus', 'prioritize', 'advantage', 'bet', 'amplify', 'accelerate', 'extend', 'deepen', 'own', 'dominate', 'reinforce', 'capitalize', 'leverage', 'build on', 'expand', 'scale'],
    },
    {
      dimension: 'close-gap',
      label: 'the gap to close first',
      prompt: 'What competitive gap should you close first — and why?',
      signals: ['gap', 'close', 'catch up', 'parity', 'table stakes', 'must have', 'fix', 'address', 'bridge', 'eliminate', 'resolve', 'plug', 'shore up', 'strengthen', 'improve', 'upgrade', 'first priority', 'most urgent', 'blocking'],
    },
    {
      dimension: 'roadmap-impact',
      label: 'roadmap impact',
      prompt: 'How does this change your roadmap priorities?',
      signals: ['roadmap', 'priority', 'plan', 'quarter', 'next', 'shift', 'reprioritize', 'adjust', 'change', 'implication', 'therefore', 'means we should', 'action item', 'follow-up', 'takeaway', 'recommend', 'suggest', 'propose', 'initiative', 'project', 'workstream'],
    },
  ],

  // ─── Strategy Doc ───
  'Situation': [
    {
      dimension: 'product-state',
      label: 'current product state',
      prompt: 'What\'s the current state of your product and its performance?',
      signals: ['product', 'performance', 'growth', 'usage', 'revenue', 'metric', 'adoption', 'current', 'state', 'today', 'trajectory', 'momentum', 'plateau', 'decline', 'growing', 'stable', 'healthy', 'struggling', 'thriving', 'at risk', 'numbers', 'data', 'dashboard', 'last quarter'],
    },
    {
      dimension: 'external',
      label: 'external forces',
      prompt: 'What external forces — market, competitors, regulation — are changing?',
      signals: ['market', 'competitor', 'regulation', 'external', 'industry', 'trend', 'macro', 'economy', 'customer behavior', 'technology', 'ai', 'disruption', 'shifting', 'emerging', 'new entrant', 'consolidation', 'legislation', 'compliance', 'geopolitical', 'recession', 'inflation', 'supply chain'],
    },
    {
      dimension: 'internal',
      label: 'internal constraints',
      prompt: 'What internal constraints shape your options — team, tech, budget?',
      signals: ['team', 'resource', 'budget', 'capacity', 'skill', 'tech debt', 'internal', 'constraint', 'bandwidth', 'headcount', 'hiring', 'attrition', 'culture', 'org structure', 'process', 'legacy', 'infrastructure', 'talent', 'morale', 'burnout', 'turnover', 'limited', 'shortage', 'tight'],
    },
    {
      dimension: 'trigger',
      label: 'the trigger for review',
      prompt: 'What data or signal triggered this strategic review?',
      signals: ['data', 'signal', 'trigger', 'noticed', 'report', 'insight', 'board', 'review', 'decline', 'spike', 'feedback', 'prompted', 'catalyzed', 'sparked', 'alarming', 'surprising', 'unexpected', 'anomaly', 'pattern', 'wake-up call', 'inflection', 'tipping point', 'milestone', 'quarterly review'],
    },
  ],

  'Insight': [
    {
      dimension: 'observation',
      label: 'the key observation',
      prompt: 'What do you see that others in the org might be missing?',
      signals: ['see', 'notice', 'observe', 'realize', 'discover', 'pattern', 'signal', 'hidden', 'overlooked', 'missed', 'subtle', 'underlying', 'beneath', 'interesting', 'striking', 'telling', 'reveals', 'suggests', 'indicates', 'points to', 'counter-intuitive', 'surprising'],
    },
    {
      dimension: 'behavior',
      label: 'supporting evidence',
      prompt: 'What customer or market behavior supports this insight?',
      signals: ['customer', 'behavior', 'data', 'evidence', 'research', 'usage', 'trend', 'shift', 'pattern', 'feedback', 'survey', 'interview', 'analytics', 'cohort', 'segment', 'found that', 'showed that', 'demonstrated', 'confirmed', 'validated', 'corroborated', 'consistent with'],
    },
    {
      dimension: 'connection',
      label: 'the connecting pattern',
      prompt: 'What pattern connects multiple signals into one insight?',
      signals: ['connect', 'pattern', 'because', 'therefore', 'means that', 'implies', 'underlying', 'root', 'theme', 'thread', 'common', 'across', 'link', 'relationship', 'correlation', 'cause', 'driven by', 'results from', 'leads to', 'creates', 'reinforces', 'compounds'],
    },
    {
      dimension: 'actionability',
      label: 'why it\'s actionable now',
      prompt: 'Why is this insight actionable right now?',
      signals: ['now', 'action', 'window', 'opportunity', 'timing', 'ready', 'position', 'can', 'should', 'moment', 'ripe', 'conditions', 'aligned', 'confluence', 'unique', 'won\'t last', 'limited', 'before', 'while', 'leverage', 'capitalize', 'seize'],
    },
  ],

  'Strategic Choice': [
    {
      dimension: 'focus',
      label: 'the strategic focus',
      prompt: 'What are you choosing to focus on?',
      signals: ['focus', 'choose', 'prioritize', 'invest', 'bet', 'commit', 'pursue', 'strategy', 'direction', 'path', 'approach', 'play', 'move', 'going to', 'will', 'decided', 'determined', 'doubled down', 'all-in', 'concentrated', 'dedicated', 'allocat'],
    },
    {
      dimension: 'say-no',
      label: 'what you\'re saying no to',
      prompt: 'What are you deliberately choosing NOT to do?',
      signals: ['not', 'won\'t', 'stop', 'deprioritize', 'avoid', 'sacrifice', 'cut', 'drop', 'decline', 'say no', 'defer', 'delay', 'shelve', 'park', 'sunset', 'kill', 'retire', 'exit', 'walk away', 'leave behind', 'let go', 'deliberately', 'intentionally', 'consciously'],
    },
    {
      dimension: 'tradeoff',
      label: 'the hard tradeoff',
      prompt: 'What makes this choice hard — what are you giving up?',
      signals: ['tradeoff', 'trade-off', 'give up', 'sacrifice', 'cost', 'risk', 'tension', 'hard', 'difficult', 'dilemma', 'painful', 'uncomfortable', 'losing', 'forgo', 'at the expense', 'means we can\'t', 'but', 'however', 'downside', 'consequence', 'price to pay'],
    },
    {
      dimension: 'alignment',
      label: 'company alignment',
      prompt: 'How does this align with company-level strategy?',
      signals: ['align', 'company', 'mission', 'vision', 'org', 'corporate', 'broader', 'fits', 'supports', 'contributes', 'reinforces', 'consistent', 'complements', 'ladder', 'ties to', 'maps to', 'in service of', 'pillar', 'objective', 'okr', 'north star', 'executive', 'board'],
    },
  ],

  'Initiatives': [
    {
      dimension: 'bets',
      label: 'the key initiatives',
      prompt: 'What are the 2-3 key initiatives that execute this strategy?',
      signals: ['initiative', 'project', 'workstream', 'bet', 'investment', 'program', 'effort', 'build', 'launch', 'initiative 1', 'initiative 2', 'first', 'second', 'third', 'pillar', 'track', 'stream', 'focus area', 'priority', 'key effort', 'big bet'],
    },
    {
      dimension: 'impact-ranking',
      label: 'the impact ranking',
      prompt: 'Which initiative has the highest expected impact?',
      signals: ['impact', 'highest', 'most', 'priority', 'biggest', 'important', 'critical', 'first', 'primary', 'key', 'greatest', 'largest', 'top', 'rank', 'order', 'leverage', 'roi', 'return', 'payoff', 'unlock', 'outsized', 'disproportionate', 'highest-impact'],
    },
    {
      dimension: 'timeline',
      label: 'the 90-day milestones',
      prompt: 'What does the first 90 days look like for each initiative?',
      signals: ['90 day', 'quarter', 'timeline', 'milestone', 'phase', 'week', 'month', 'first', 'start', 'kickoff', 'plan', 'schedule', 'deliverable', 'checkpoint', 'gate', 'sprint', 'by end of', 'in the first', 'within', 'target date', 'due', 'deadline'],
    },
    {
      dimension: 'ownership',
      label: 'who owns each initiative',
      prompt: 'Who owns each initiative?',
      signals: ['own', 'lead', 'responsible', 'accountable', 'team', 'manager', 'driver', 'dri', 'raci', 'person', 'name', 'assigned', 'headed by', 'run by', 'managed by', 'reporting to', 'staffed', 'resourced'],
    },
  ],

  'Risks & Mitigations': [
    {
      dimension: 'top-risk',
      label: 'the biggest risk',
      prompt: 'What\'s the single biggest risk to this strategy?',
      signals: ['risk', 'threat', 'danger', 'concern', 'worry', 'fear', 'biggest', 'main', 'top', 'primary', 'greatest', 'most likely', 'highest impact', 'existential', 'critical', 'severe', 'catastrophic', 'if', 'could', 'might', 'chance'],
    },
    {
      dimension: 'assumptions',
      label: 'the critical assumption',
      prompt: 'What core assumption, if wrong, breaks the entire plan?',
      signals: ['assumption', 'assume', 'if', 'hypothesis', 'believe', 'depend', 'contingent', 'bet on', 'premise', 'given that', 'predicated', 'hinges on', 'requires that', 'must be true', 'foundational', 'underlying', 'key belief'],
    },
    {
      dimension: 'early-warning',
      label: 'early warning signals',
      prompt: 'How will you detect early if things are going off track?',
      signals: ['detect', 'early', 'warning', 'signal', 'indicator', 'monitor', 'watch', 'review', 'check-in', 'dashboard', 'alert', 'flag', 'canary', 'leading', 'weekly', 'bi-weekly', 'standup', 'report', 'metric', 'threshold', 'trigger', 'red flag', 'yellow flag'],
    },
    {
      dimension: 'plan-b',
      label: 'plan B',
      prompt: 'What\'s your plan B if the primary approach fails?',
      signals: ['plan b', 'backup', 'fallback', 'alternative', 'pivot', 'contingency', 'if not', 'instead', 'otherwise', 'worst case', 'if it fails', 'abort', 'exit', 'change course', 'adapt', 'adjust', 'regroup', 'reassess', 'kill', 'sunset', 'option b'],
    },
  ],

  // ─── Retrospective ───
  'What We Set Out to Do': [
    {
      dimension: 'goal',
      label: 'the original goal',
      prompt: 'What was the original goal — in one clear sentence?',
      signals: ['goal', 'objective', 'aim', 'purpose', 'set out', 'intended', 'planned', 'wanted', 'target', 'mission', 'mandate', 'charter', 'brief', 'asked to', 'tasked with', 'committed to', 'promised', 'agreed to', 'scope', 'vision'],
    },
    {
      dimension: 'deliverables',
      label: 'key deliverables',
      prompt: 'What were the key milestones or deliverables?',
      signals: ['milestone', 'deliverable', 'ship', 'release', 'feature', 'output', 'result', 'build', 'launch', 'implement', 'deploy', 'deliver', 'complete', 'finish', 'produce', 'artifact', 'document', 'prototype', 'mvp', 'demo', 'presentation', 'report'],
    },
    {
      dimension: 'timeline',
      label: 'the timeline',
      prompt: 'What timeline or deadline were you working against?',
      signals: ['timeline', 'deadline', 'date', 'sprint', 'week', 'month', 'quarter', 'by', 'due', 'schedule', 'plan', 'expected', 'committed', 'target date', 'end of', 'beginning of', 'two weeks', 'three weeks', 'cycle', 'iteration', 'release date'],
    },
    {
      dimension: 'success-criteria',
      label: 'success criteria',
      prompt: 'What did "done" or "success" look like when you started?',
      signals: ['success', 'done', 'complete', 'criteria', 'definition', 'measure', 'metric', 'looked like', 'expected', 'definition of done', 'dod', 'acceptance', 'bar', 'standard', 'threshold', 'good enough', 'shipped when', 'considered done', 'met', 'achieved'],
    },
  ],

  'What Went Well': [
    {
      dimension: 'outcomes',
      label: 'the best outcomes',
      prompt: 'What specific results are you most proud of?',
      signals: ['result', 'outcome', 'achieve', 'accomplish', 'deliver', 'ship', 'launch', 'metric', 'number', 'hit', 'proud', 'success', 'win', 'highlight', 'standout', 'best', 'exceeded', 'surpassed', 'milestone', 'breakthrough', 'impressive', 'significant'],
    },
    {
      dimension: 'process',
      label: 'process wins',
      prompt: 'What process or practice worked better than expected?',
      signals: ['process', 'practice', 'workflow', 'meeting', 'communication', 'collaboration', 'tool', 'method', 'approach', 'ceremony', 'standup', 'retro', 'review', 'planning', 'pairing', 'async', 'documentation', 'automation', 'testing', 'ci/cd', 'deployment', 'smooth', 'efficient'],
    },
    {
      dimension: 'contributors',
      label: 'key contributors',
      prompt: 'Who or what was a key contributor to the wins?',
      signals: ['team', 'person', 'contributor', 'helped', 'thanks', 'credit', 'support', 'partner', 'tool', 'decision', 'individual', 'name', 'shoutout', 'kudos', 'recognition', 'above and beyond', 'stepped up', 'owned', 'drove', 'championed', 'unblocked', 'enabled'],
    },
    {
      dimension: 'keep-doing',
      label: 'what to keep doing',
      prompt: 'What should you keep doing exactly as-is going forward?',
      signals: ['keep', 'continue', 'repeat', 'maintain', 'sustain', 'preserve', 'going forward', 'next time', 'again', 'don\'t change', 'works well', 'working', 'stick with', 'double down', 'more of', 'do again', 'replicate', 'template', 'playbook', 'standard'],
    },
  ],

  'What Didn\'t Work': [
    {
      dimension: 'shortfalls',
      label: 'where you fell short',
      prompt: 'Where did you fall short of what you expected?',
      signals: ['short', 'miss', 'fail', 'didn\'t', 'below', 'under', 'gap', 'incomplete', 'late', 'fell', 'behind', 'slower', 'less than', 'not enough', 'insufficient', 'underperform', 'disappoint', 'off track', 'over budget', 'scope creep', 'cut', 'dropped', 'compromise'],
    },
    {
      dimension: 'friction',
      label: 'friction points',
      prompt: 'What felt harder than it should have been?',
      signals: ['hard', 'difficult', 'struggle', 'slow', 'painful', 'friction', 'confus', 'complex', 'overhead', 'burden', 'tedious', 'cumbersome', 'frustrat', 'annoying', 'manual', 'repetitive', 'time-consuming', 'unnecessary', 'blocker', 'bottleneck', 'dependency', 'waiting'],
    },
    {
      dimension: 'communication',
      label: 'communication gaps',
      prompt: 'Where did communication or coordination break down?',
      signals: ['communication', 'alignment', 'misunderst', 'unclear', 'siloed', 'disconnect', 'feedback', 'late', 'missed', 'surprise', 'didn\'t know', 'should have told', 'lost in translation', 'hand-off', 'handoff', 'dropped ball', 'assumed', 'different page', 'confused about', 'conflicting', 'no one told'],
    },
    {
      dimension: 'warning',
      label: 'hindsight warnings',
      prompt: 'What would you warn your past self about going in?',
      signals: ['warn', 'know', 'wish', 'earlier', 'should have', 'could have', 'hindsight', 'avoid', 'watch out', 'careful', 'in retrospect', 'looking back', 'if I could', 'next time', 'lesson', 'learned', 'hard way', 'mistake', 'regret', 'underestimate', 'overestimate'],
    },
  ],

  'Root Causes': [
    {
      dimension: 'why',
      label: 'the root cause',
      prompt: 'WHY did the problems happen — not just what happened?',
      signals: ['because', 'reason', 'cause', 'root', 'why', 'due to', 'result of', 'led to', 'stemmed', 'originated', 'triggered by', 'caused by', 'driven by', 'consequence of', 'outcome of', 'fundamentally', 'at its core', 'underlying', 'real issue', 'actual problem'],
    },
    {
      dimension: 'category',
      label: 'the issue category',
      prompt: 'Was this primarily a people, process, or tooling issue?',
      signals: ['people', 'process', 'tool', 'system', 'skill', 'knowledge', 'resource', 'structure', 'culture', 'org', 'technical', 'human', 'organizational', 'procedural', 'infrastructure', 'training', 'experience', 'capability', 'capacity', 'maturity', 'governance'],
    },
    {
      dimension: 'warnings',
      label: 'missed warning signs',
      prompt: 'Were there warning signs that were seen but not acted on?',
      signals: ['warning', 'sign', 'signal', 'flag', 'early', 'noticed', 'ignored', 'dismissed', 'saw', 'knew', 'suspected', 'felt', 'sensed', 'raised', 'escalated', 'flagged', 'mentioned', 'brought up', 'called out', 'in hindsight', 'looking back', 'should have', 'red flag', 'yellow flag'],
    },
    {
      dimension: 'systemic',
      label: 'systemic patterns',
      prompt: 'Is there a systemic pattern connecting multiple issues?',
      signals: ['pattern', 'systemic', 'recurring', 'repeat', 'theme', 'common', 'across', 'multiple', 'deeper', 'underlying', 'structural', 'cultural', 'organizational', 'chronic', 'persistent', 'keeps happening', 'every time', 'again and again', 'not the first', 'familiar', 'echo', 'symptom of'],
    },
  ],

  'What We\'ll Do Differently': [
    {
      dimension: 'change',
      label: 'the specific change',
      prompt: 'What specific, concrete change will you make next time?',
      signals: ['change', 'do', 'start', 'implement', 'introduce', 'adopt', 'switch', 'try', 'action', 'step', 'going to', 'will', 'commit to', 'plan to', 'next time', 'from now on', 'moving forward', 'new approach', 'differently', 'adjust', 'modify', 'improve', 'update'],
    },
    {
      dimension: 'owner',
      label: 'who owns the change',
      prompt: 'Who is responsible for making this change happen?',
      signals: ['owner', 'responsible', 'accountable', 'lead', 'drive', 'person', 'team', 'who', 'assign', 'name', 'point person', 'champion', 'dri', 'ensure', 'make sure', 'follow up', 'track', 'hold accountable', 'report on'],
    },
    {
      dimension: 'measure',
      label: 'how you\'ll measure it',
      prompt: 'How will you know if the change is actually working?',
      signals: ['measure', 'know', 'track', 'metric', 'indicator', 'success', 'check', 'review', 'verify', 'confirm', 'working', 'effective', 'improved', 'better', 'evidence', 'proof', 'data', 'number', 'dashboard', 'report', 'compare', 'before and after', 'benchmark'],
    },
    {
      dimension: 'stop-doing',
      label: 'what to stop doing',
      prompt: 'What will you explicitly stop doing?',
      signals: ['stop', 'eliminate', 'drop', 'remove', 'quit', 'end', 'abandon', 'cut', 'no longer', 'retire', 'phase out', 'sunset', 'kill', 'discontinue', 'avoid', 'refrain', 'resist', 'let go', 'walk away', 'not anymore', 'done with', 'enough of'],
    },
  ],

  // ─── PRFAQ ───
  'Headline': [
    {
      dimension: 'product',
      label: 'the product name',
      prompt: 'Name the product or feature you\'re announcing.',
      signals: ['launch', 'announce', 'introduce', 'unveil', 'release', 'new', 'product', 'feature', 'platform', 'tool', 'service', 'app', 'solution'],
    },
    {
      dimension: 'customer',
      label: 'the target customer',
      prompt: 'Who is this for — which customer or persona?',
      signals: ['customer', 'user', 'team', 'business', 'enterprise', 'company', 'developer', 'manager', 'leader', 'professional', 'creator', 'merchant', 'seller', 'buyer', 'operator'],
    },
    {
      dimension: 'benefit',
      label: 'the key benefit',
      prompt: 'What\'s the headline benefit — what outcome does the customer get?',
      signals: ['help', 'enable', 'empower', 'save', 'reduce', 'increase', 'improve', 'cut', 'grow', 'accelerate', 'simplify', 'automate', 'eliminate', 'boost', 'deliver', 'achieve', 'transform', 'unlock', '%', 'faster', 'easier', 'better'],
    },
  ],

  'Subheadline': [
    {
      dimension: 'what',
      label: 'what the product does',
      prompt: 'What does the product actually do — in plain language?',
      signals: ['provide', 'deliver', 'give', 'offer', 'enable', 'allow', 'let', 'power', 'automate', 'streamline', 'connect', 'integrate', 'analyze', 'monitor', 'track', 'manage', 'create', 'build', 'generate'],
    },
    {
      dimension: 'who',
      label: 'who it\'s for',
      prompt: 'Who specifically benefits from this?',
      signals: ['team', 'user', 'customer', 'manager', 'leader', 'developer', 'analyst', 'operator', 'admin', 'professional', 'business', 'organization', 'department', 'role'],
    },
    {
      dimension: 'value',
      label: 'the primary value',
      prompt: 'What\'s the primary value — visibility, speed, cost savings, accuracy?',
      signals: ['visibility', 'insight', 'speed', 'fast', 'real-time', 'accurate', 'reliable', 'cost', 'save', 'efficient', 'productive', 'confident', 'control', 'scale', 'growth'],
    },
  ],

  'Customer Problem': [
    {
      dimension: 'who',
      label: 'who has this problem',
      prompt: 'Who specifically experiences this pain?',
      signals: ['customer', 'user', 'team', 'manager', 'leader', 'people', 'they', 'we', 'our', 'persona', 'segment', 'buyer', 'business', 'company', 'organization', 'department', 'role', 'professional'],
    },
    {
      dimension: 'pain',
      label: 'the specific pain',
      prompt: 'What exactly is painful, broken, or frustrating?',
      signals: ['problem', 'pain', 'struggle', 'frustrat', 'broken', 'difficult', 'challenge', 'issue', 'gap', 'miss', 'fail', 'error', 'waste', 'slow', 'manual', 'tedious', 'confus', 'unreliable', 'expensive', 'risk', 'lose', 'losing'],
    },
    {
      dimension: 'workaround',
      label: 'current workaround',
      prompt: 'How do they handle this today — and why is that inadequate?',
      signals: ['today', 'currently', 'workaround', 'manual', 'spreadsheet', 'email', 'existing', 'alternative', 'cobble', 'hack', 'instead', 'rely on', 'use', 'tool', 'vendor', 'process'],
    },
    {
      dimension: 'cost',
      label: 'the quantified cost',
      prompt: 'What does this problem cost in time, money, or missed opportunities?',
      signals: ['cost', 'hour', 'minute', 'time', 'money', 'dollar', '$', 'revenue', 'loss', 'waste', 'miss', 'opportunity', 'churn', 'delay', 'overhead', '%', 'million', 'thousand', 'per year', 'per month', 'annually', 'productivity'],
    },
  ],

  'Solution': [
    {
      dimension: 'capability',
      label: 'what the user can do',
      prompt: 'What can the user now do that they couldn\'t before?',
      signals: ['can', 'able', 'now', 'enable', 'allow', 'let', 'empower', 'give', 'provide', 'deliver', 'create', 'build', 'manage', 'track', 'automate', 'see', 'view', 'access', 'control'],
    },
    {
      dimension: 'experience',
      label: 'the user experience',
      prompt: 'What does the user see and do — describe the experience, not the architecture.',
      signals: ['experience', 'see', 'click', 'view', 'dashboard', 'screen', 'page', 'interface', 'notification', 'alert', 'report', 'workflow', 'step', 'simple', 'easy', 'intuitive', 'visual', 'real-time', 'instant'],
    },
    {
      dimension: 'outcome',
      label: 'the concrete outcome',
      prompt: 'What concrete result does the user get — time saved, errors eliminated, revenue gained?',
      signals: ['result', 'outcome', 'save', 'reduce', 'eliminate', 'increase', 'improve', 'faster', 'better', 'fewer', 'more', 'accurate', 'reliable', '%', 'hour', 'minute', 'day', 'dollar', 'revenue', 'error', 'mistake'],
    },
    {
      dimension: 'differentiation',
      label: 'what makes it different',
      prompt: 'What makes this uniquely effective compared to alternatives?',
      signals: ['different', 'unique', 'unlike', 'better', 'only', 'first', 'advantage', 'proprietary', 'patent', 'exclusive', 'novel', 'innovative', 'breakthrough', 'new approach', 'instead of', 'compared to', 'versus', 'competitor'],
    },
  ],

  'Customer Quote': [
    {
      dimension: 'before',
      label: 'the before state',
      prompt: 'What was the customer\'s situation before — what was painful?',
      signals: ['before', 'used to', 'previously', 'was', 'were', 'had to', 'couldn\'t', 'struggled', 'spent', 'wasted', 'guessing', 'manual', 'old', 'legacy'],
    },
    {
      dimension: 'after',
      label: 'the after state',
      prompt: 'What changed — with specific numbers or outcomes?',
      signals: ['now', 'after', 'since', 'today', 'reduced', 'increased', 'improved', 'dropped', 'grew', 'saved', 'eliminated', 'cut', 'from', 'to', '%', 'percent', 'hour', 'minute', 'day', 'dollar', 'x'],
    },
    {
      dimension: 'attribution',
      label: 'who said it',
      prompt: 'Attribute the quote — Name, Title, Company.',
      signals: ['vp', 'director', 'head', 'manager', 'ceo', 'cto', 'coo', 'founder', 'president', 'lead', 'chief', 'senior', 'principal', 'inc', 'corp', 'llc', 'ltd', 'co', 'company', 'team'],
    },
  ],

  'How It Works': [
    {
      dimension: 'steps',
      label: 'the step-by-step flow',
      prompt: 'Walk through the steps — what does the user do first, second, third?',
      signals: ['step', 'first', 'then', 'next', 'finally', '1.', '2.', '3.', 'start', 'begin', 'connect', 'set up', 'configure', 'click', 'select', 'enter', 'upload', 'import', 'install'],
    },
    {
      dimension: 'feedback',
      label: 'what the user gets back',
      prompt: 'At each step, what does the user see or get back?',
      signals: ['see', 'get', 'receive', 'shows', 'displays', 'returns', 'generates', 'report', 'dashboard', 'notification', 'alert', 'recommendation', 'insight', 'result', 'output', 'response', 'confirmation'],
    },
    {
      dimension: 'time-to-value',
      label: 'time to value',
      prompt: 'How long from sign-up to first meaningful result?',
      signals: ['minute', 'hour', 'day', 'instant', 'immediately', 'quick', 'fast', 'setup', 'onboard', 'within', 'less than', 'under', 'time to', 'ready in', 'takes'],
    },
  ],

  'Executive Quote': [
    {
      dimension: 'strategic-connection',
      label: 'strategic connection',
      prompt: 'Connect this product to the company\'s mission or strategic direction.',
      signals: ['mission', 'strategy', 'vision', 'direction', 'priority', 'invest', 'commit', 'believe', 'position', 'future', 'opportunity', 'market', 'customer', 'focus', 'pillar', 'north star'],
    },
    {
      dimension: 'insight',
      label: 'the driving insight',
      prompt: 'What customer or market insight drove this decision?',
      signals: ['customer', 'told us', 'data', 'research', 'insight', 'learned', 'discovered', 'feedback', 'survey', 'interview', 'asked for', 'need', 'demand', 'trend', 'signal', 'pain point'],
    },
    {
      dimension: 'attribution',
      label: 'speaker attribution',
      prompt: 'Who is speaking — Name, Title (VP/SVP/GM level)?',
      signals: ['vp', 'svp', 'evp', 'gm', 'director', 'president', 'chief', 'head of', 'senior', 'founder', 'ceo', 'cto', 'cpo', 'coo'],
    },
  ],

  'Call to Action': [
    {
      dimension: 'availability',
      label: 'when it\'s available',
      prompt: 'When is this available — today, beta, or future date?',
      signals: ['available', 'today', 'now', 'starting', 'beginning', 'launch', 'beta', 'early access', 'generally available', 'ga', 'open', 'live', 'rolling out', 'date', 'quarter'],
    },
    {
      dimension: 'first-step',
      label: 'the first step',
      prompt: 'What\'s the specific first step for a customer to get started?',
      signals: ['visit', 'go to', 'sign up', 'enable', 'activate', 'contact', 'request', 'click', 'open', 'navigate', 'url', 'link', '.com', 'portal', 'dashboard', 'settings', 'start', 'try'],
    },
    {
      dimension: 'effort',
      label: 'setup effort',
      prompt: 'How long does setup take — minutes, hours, or days?',
      signals: ['minute', 'hour', 'day', 'setup', 'install', 'configure', 'quick', 'easy', 'simple', 'no code', 'one-click', 'self-serve', 'guided', 'wizard', 'takes', 'under', 'less than'],
    },
  ],

  'Internal FAQ': [
    {
      dimension: 'why-now',
      label: 'why now',
      prompt: 'Why is this the right time — what changed in the market or our data?',
      signals: ['why now', 'timing', 'urgency', 'changed', 'shift', 'trigger', 'signal', 'data', 'trend', 'competitor', 'market', 'window', 'opportunity', 'before', 'while'],
    },
    {
      dimension: 'opportunity-size',
      label: 'the opportunity size',
      prompt: 'How big is the opportunity — TAM, revenue projection, or user impact?',
      signals: ['tam', 'sam', 'market', 'revenue', 'opportunity', 'size', 'addressable', 'billion', 'million', 'thousand', '$', 'arpu', 'arr', 'mrr', 'ltv', 'user', 'customer', 'potential'],
    },
    {
      dimension: 'risks',
      label: 'key risks',
      prompt: 'What are the top 2-3 execution or technical risks?',
      signals: ['risk', 'concern', 'challenge', 'unknown', 'assumption', 'dependency', 'technical', 'execution', 'timeline', 'resource', 'complexity', 'mitigation', 'if', 'could', 'might', 'fail'],
    },
    {
      dimension: 'cost',
      label: 'build cost',
      prompt: 'What does this cost to build — team, time, infrastructure?',
      signals: ['cost', 'budget', 'team', 'engineer', 'headcount', 'resource', 'infrastructure', 'month', 'quarter', 'invest', 'spend', 'allocat', 'staff', 'hire', 'contractor', 'vendor'],
    },
    {
      dimension: 'tradeoffs',
      label: 'what you\'re NOT doing',
      prompt: 'What are you choosing NOT to do in order to do this?',
      signals: ['not', 'instead', 'deprioritize', 'defer', 'trade-off', 'tradeoff', 'sacrifice', 'delay', 'cut', 'drop', 'park', 'shelve', 'opportunity cost', 'alternative', 'choose'],
    },
  ],

  'External FAQ': [
    {
      dimension: 'differentiation',
      label: 'how it\'s different',
      prompt: 'How is this different from what you already offer?',
      signals: ['different', 'new', 'unlike', 'compared', 'versus', 'existing', 'current', 'upgrade', 'addition', 'complement', 'replace', 'extend', 'enhance', 'beyond', 'more than'],
    },
    {
      dimension: 'requirements',
      label: 'setup requirements',
      prompt: 'Does this require changes to the customer\'s current setup?',
      signals: ['require', 'need', 'setup', 'install', 'configure', 'change', 'update', 'migrate', 'integration', 'compatible', 'work with', 'support', 'prerequisite', 'dependency'],
    },
    {
      dimension: 'data',
      label: 'data needs',
      prompt: 'What data access does this need from the customer?',
      signals: ['data', 'access', 'permission', 'connect', 'api', 'feed', 'import', 'sync', 'integrate', 'read', 'write', 'privacy', 'security', 'encrypt', 'store', 'collect'],
    },
    {
      dimension: 'pricing',
      label: 'pricing info',
      prompt: 'What does it cost — included, add-on, or new plan?',
      signals: ['cost', 'price', 'pricing', 'free', 'included', 'add-on', 'upgrade', 'plan', 'tier', 'pay', 'charge', 'fee', 'subscription', 'per', 'month', 'annual', 'trial'],
    },
  ],

  // ─── Pricing Proposal ───
  'Current State & Problem': [
    {
      dimension: 'current-model',
      label: 'current pricing model',
      prompt: 'What\'s the current pricing structure — flat rate, per seat, tiers?',
      signals: ['current', 'today', 'existing', 'model', 'price', 'pricing', 'tier', 'plan', 'flat', 'seat', 'per user', 'charge', 'bill', 'subscription', 'free', 'premium', 'enterprise'],
    },
    {
      dimension: 'revenue-data',
      label: 'revenue distribution',
      prompt: 'How does revenue split across customer segments?',
      signals: ['revenue', 'distribution', 'segment', 'split', 'arpu', 'arr', 'mrr', 'average', 'median', 'top', 'bottom', 'cohort', 'tier', 'plan', 'customer', 'account', 'contract'],
    },
    {
      dimension: 'problem',
      label: 'the pricing problem',
      prompt: 'What\'s wrong — underpricing, losing deals, value misalignment?',
      signals: ['problem', 'issue', 'gap', 'mismatch', 'underpric', 'overpric', 'losing', 'churn', 'downgrade', 'discount', 'pressure', 'complaint', 'feedback', 'confusion', 'friction', 'barrier', 'block', 'leave money'],
    },
    {
      dimension: 'evidence',
      label: 'supporting evidence',
      prompt: 'What data backs this up — win-loss, usage analysis, customer feedback?',
      signals: ['data', 'evidence', 'analysis', 'win', 'loss', 'deal', 'usage', 'feature', 'feedback', 'survey', 'interview', 'research', 'benchmark', 'found', 'showed', 'indicate', 'reveal', 'NPS', 'CSAT'],
    },
  ],

  'Market & Competitive Pricing': [
    {
      dimension: 'competitors',
      label: 'competitor pricing',
      prompt: 'How do direct competitors price — models, tiers, and amounts?',
      signals: ['competitor', 'competition', 'rival', 'alternative', 'charge', 'price', 'cost', 'tier', 'plan', 'model', 'per seat', 'per user', 'freemium', 'free', 'enterprise', 'vs', 'compared'],
    },
    {
      dimension: 'trends',
      label: 'market pricing trends',
      prompt: 'Where is pricing headed — usage-based, outcome-based, hybrid?',
      signals: ['trend', 'market', 'direction', 'shift', 'moving toward', 'usage-based', 'outcome', 'value-based', 'consumption', 'hybrid', 'future', 'emerging', 'industry', 'standard', 'norm'],
    },
    {
      dimension: 'positioning',
      label: 'our positioning',
      prompt: 'Where do we sit relative to competitors — premium, mid-market, budget?',
      signals: ['position', 'premium', 'mid-market', 'budget', 'cheap', 'expensive', 'value', 'perception', 'brand', 'quality', 'above', 'below', 'aligned', 'misaligned', 'gap', 'opportunity'],
    },
  ],

  'Proposed Pricing Model': [
    {
      dimension: 'tiers',
      label: 'tier structure',
      prompt: 'What are the tier names, prices, and what\'s included in each?',
      signals: ['tier', 'plan', 'level', 'free', 'starter', 'pro', 'business', 'enterprise', 'team', 'growth', 'scale', 'basic', 'standard', 'premium', 'plus', 'name', 'include'],
    },
    {
      dimension: 'pricing-metric',
      label: 'the pricing metric',
      prompt: 'What\'s the pricing unit — per seat, per usage, per feature?',
      signals: ['per seat', 'per user', 'per unit', 'usage', 'consumption', 'feature', 'flat rate', 'metered', 'per month', 'per year', 'annual', 'monthly', 'metric', 'unit', 'base price', 'overage', 'add-on'],
    },
    {
      dimension: 'prices',
      label: 'specific prices',
      prompt: 'What are the specific price points for each tier?',
      signals: ['$', 'price', 'cost', 'charge', 'fee', 'amount', 'per month', '/mo', '/yr', 'annual', 'monthly', 'free', 'custom', 'contact', 'quote', 'starting at', 'from'],
    },
    {
      dimension: 'upgrade-triggers',
      label: 'upgrade triggers',
      prompt: 'What features or limits drive customers from one tier to the next?',
      signals: ['upgrade', 'limit', 'cap', 'threshold', 'trigger', 'unlock', 'access', 'gate', 'restrict', 'premium', 'advanced', 'additional', 'more', 'beyond', 'exceed', 'outgrow'],
    },
  ],

  'Revenue Impact Analysis': [
    {
      dimension: 'base-case',
      label: 'base case projection',
      prompt: 'What\'s the expected revenue change — show your math?',
      signals: ['expect', 'project', 'estimate', 'forecast', 'base case', 'likely', 'model', 'assume', 'scenario', 'revenue', 'arr', 'mrr', 'increase', 'decrease', 'net', 'impact', 'change', 'math', 'calculation'],
    },
    {
      dimension: 'scenarios',
      label: 'scenario analysis',
      prompt: 'What do best case and worst case look like?',
      signals: ['best case', 'worst case', 'optimistic', 'pessimistic', 'conservative', 'aggressive', 'upside', 'downside', 'range', 'scenario', 'if', 'assuming', 'sensitivity'],
    },
    {
      dimension: 'breakeven',
      label: 'break-even timeline',
      prompt: 'When does the new model break even versus the old?',
      signals: ['break even', 'breakeven', 'payback', 'recover', 'recoup', 'timeline', 'months', 'quarters', 'when', 'crossover', 'surpass', 'exceed', 'offset', 'net positive'],
    },
    {
      dimension: 'assumptions',
      label: 'key assumptions',
      prompt: 'What are the key assumptions — which one matters most?',
      signals: ['assumption', 'assume', 'depend', 'sensitive', 'variable', 'driver', 'lever', 'if', 'contingent', 'critical', 'key factor', 'based on', 'given that'],
    },
  ],

  'Customer Impact & Migration': [
    {
      dimension: 'impact-distribution',
      label: 'who is affected',
      prompt: 'What % of customers see a price increase, decrease, or stay neutral?',
      signals: ['percent', '%', 'customer', 'increase', 'decrease', 'neutral', 'impact', 'affected', 'segment', 'cohort', 'majority', 'minority', 'most', 'some', 'all', 'none', 'distribution'],
    },
    {
      dimension: 'grandfathering',
      label: 'grandfathering policy',
      prompt: 'Who gets legacy pricing and for how long?',
      signals: ['grandfather', 'legacy', 'existing', 'keep', 'maintain', 'honor', 'lock', 'protected', 'transition', 'exempt', 'grace period', 'sunset', 'expire', 'renewal', 'duration', 'months', 'year'],
    },
    {
      dimension: 'communication',
      label: 'communication plan',
      prompt: 'How and when do you notify customers — what\'s the rollout sequence?',
      signals: ['communicate', 'notify', 'announce', 'email', 'in-app', 'message', 'blog', 'changelog', 'timeline', 'sequence', 'phase', 'first', 'then', 'before', 'after', 'week', 'month', 'advance notice'],
    },
    {
      dimension: 'support',
      label: 'support readiness',
      prompt: 'How will support handle the influx of pricing questions?',
      signals: ['support', 'cs', 'customer success', 'help', 'question', 'faq', 'playbook', 'script', 'training', 'prepared', 'ready', 'volume', 'ticket', 'inquiry', 'call', 'chat', 'escalation'],
    },
  ],

  'Recommendation & Next Steps': [
    {
      dimension: 'recommendation',
      label: 'the clear recommendation',
      prompt: 'Which option do you recommend — state it clearly in one sentence?',
      signals: ['recommend', 'propose', 'suggest', 'advocate', 'endorse', 'option', 'choice', 'prefer', 'best', 'should', 'believe', 'advise', 'go with', 'proceed with', 'select'],
    },
    {
      dimension: 'decision',
      label: 'what needs deciding',
      prompt: 'What specific decision do you need from leadership?',
      signals: ['decision', 'approve', 'sign off', 'green light', 'authorize', 'agree', 'confirm', 'leadership', 'executive', 'board', 'sponsor', 'stakeholder', 'need from', 'ask', 'request'],
    },
    {
      dimension: 'timeline',
      label: 'proposed timeline',
      prompt: 'What\'s the timeline — from decision to full rollout?',
      signals: ['timeline', 'schedule', 'date', 'phase', 'rollout', 'launch', 'pilot', 'beta', 'soft launch', 'general availability', 'week', 'month', 'quarter', 'q1', 'q2', 'q3', 'q4', 'by', 'before', 'after'],
    },
    {
      dimension: 'success-criteria',
      label: 'success metrics',
      prompt: 'How will you evaluate success at 30/60/90 days?',
      signals: ['success', 'metric', 'measure', 'evaluate', 'track', 'monitor', 'report', 'kpi', '30 day', '60 day', '90 day', 'review', 'check-in', 'dashboard', 'target', 'goal', 'criteria'],
    },
  ],

  // ─── Product One-Pager ───
  'The Opportunity': [
    {
      dimension: 'market-size',
      label: 'market sizing',
      prompt: 'How big is this opportunity — TAM/SAM, user count, or revenue potential?',
      signals: ['market', 'tam', 'sam', 'size', 'opportunity', 'billion', 'million', 'thousand', '$', 'revenue', 'user', 'customer', 'account', 'growing', 'growth', 'yoy', 'addressable', 'potential'],
    },
    {
      dimension: 'evidence',
      label: 'evidence of demand',
      prompt: 'What evidence shows customers want this — NPS, support tickets, research?',
      signals: ['evidence', 'data', 'feedback', 'nps', 'survey', 'interview', 'research', 'request', 'ticket', 'support', 'asked', 'demand', 'signal', 'verbatim', 'quote', 'customer', 'churn reason', 'win-loss'],
    },
    {
      dimension: 'positioning',
      label: 'why you\'re positioned to win',
      prompt: 'What positions your team or company to capture this opportunity?',
      signals: ['position', 'advantage', 'strength', 'asset', 'capability', 'expertise', 'distribution', 'brand', 'data', 'technology', 'relationship', 'trust', 'existing', 'platform', 'ecosystem', 'uniquely'],
    },
  ],

  'Proposed Solution': [
    {
      dimension: 'what-we-build',
      label: 'what you\'re building',
      prompt: 'What will you build — describe it in plain language?',
      signals: ['build', 'create', 'develop', 'launch', 'ship', 'product', 'feature', 'tool', 'platform', 'service', 'capability', 'module', 'integration', 'redesign', 'new', 'add'],
    },
    {
      dimension: 'capabilities',
      label: 'key capabilities',
      prompt: 'What are the 2-3 core things it does?',
      signals: ['can', 'allow', 'enable', 'let', 'provide', 'offer', 'capability', 'function', 'feature', 'action', 'workflow', 'automate', 'analyze', 'track', 'manage', 'visualize', 'connect', 'integrate'],
    },
    {
      dimension: 'experience',
      label: 'user experience',
      prompt: 'What does the user see and do — keep it concrete?',
      signals: ['user', 'experience', 'see', 'click', 'view', 'screen', 'dashboard', 'interface', 'workflow', 'step', 'simple', 'easy', 'intuitive', 'drag', 'drop', 'select', 'enter', 'upload'],
    },
    {
      dimension: 'differentiation',
      label: 'differentiation',
      prompt: 'What makes this better than existing alternatives?',
      signals: ['different', 'better', 'unique', 'unlike', 'advantage', 'only', 'first', 'faster', 'easier', 'cheaper', 'more accurate', 'more reliable', 'compared', 'versus', 'competitor', 'alternative', 'instead'],
    },
  ],

  'Success Metrics': [
    {
      dimension: 'primary-metric',
      label: 'the primary metric',
      prompt: 'What single metric defines whether this worked?',
      signals: ['primary', 'main', 'key', 'north star', 'metric', 'kpi', 'measure', 'track', 'success', 'number', 'conversion', 'retention', 'engagement', 'adoption', 'revenue', 'nps', 'csat', 'activation'],
    },
    {
      dimension: 'baseline',
      label: 'current baseline',
      prompt: 'Where does that metric stand today?',
      signals: ['today', 'current', 'baseline', 'now', 'existing', 'before', 'starting', 'stands at', 'average', 'benchmark', 'last', 'historical', 'recent'],
    },
    {
      dimension: 'target',
      label: 'specific target',
      prompt: 'What\'s the specific target with a timeframe?',
      signals: ['target', 'goal', 'aim', 'achieve', 'reach', 'hit', 'increase', 'decrease', 'improve', 'reduce', 'from', 'to', '%', 'by', 'within', 'days', 'weeks', 'months', '90 day', 'quarter'],
    },
    {
      dimension: 'guardrail',
      label: 'guardrail metric',
      prompt: 'What should NOT get worse as a result of this work?',
      signals: ['guardrail', 'not worse', 'maintain', 'protect', 'preserve', 'must not', 'should not', 'watch', 'monitor', 'side effect', 'unintended', 'negative', 'degradation', 'regression', 'below', 'threshold'],
    },
  ],

  'Scope & Timeline': [
    {
      dimension: 'mvp',
      label: 'MVP scope',
      prompt: 'What\'s the MVP — the smallest version that still delivers value?',
      signals: ['mvp', 'minimum', 'phase 1', 'first', 'core', 'essential', 'must have', 'v1', 'initial', 'launch', 'start with', 'begin', 'smallest', 'simplest', 'basic'],
    },
    {
      dimension: 'out-of-scope',
      label: 'what\'s out of scope',
      prompt: 'What are you explicitly NOT building?',
      signals: ['out of scope', 'not', 'exclude', 'defer', 'later', 'future', 'phase 2', 'v2', 'won\'t', 'skip', 'not building', 'not included', 'deprioritize', 'backlog', 'follow-up'],
    },
    {
      dimension: 'timeline',
      label: 'target dates',
      prompt: 'When does each phase ship?',
      signals: ['date', 'timeline', 'deadline', 'quarter', 'month', 'week', 'sprint', 'by', 'target', 'ship', 'launch', 'deliver', 'complete', 'q1', 'q2', 'q3', 'q4', 'phase', 'milestone'],
    },
    {
      dimension: 'dependencies',
      label: 'key dependencies',
      prompt: 'What external dependencies or risks could affect the timeline?',
      signals: ['dependency', 'depend', 'require', 'need', 'block', 'risk', 'external', 'team', 'api', 'platform', 'partner', 'vendor', 'approval', 'legal', 'compliance', 'infrastructure', 'if', 'delay'],
    },
  ],

  'Resource Ask': [
    {
      dimension: 'team',
      label: 'team needs',
      prompt: 'What team do you need — roles, headcount, and duration?',
      signals: ['team', 'engineer', 'designer', 'pm', 'analyst', 'headcount', 'hire', 'staff', 'resource', 'person', 'role', 'full-time', 'contractor', 'duration', 'month', 'quarter', 'sprint'],
    },
    {
      dimension: 'budget',
      label: 'budget needs',
      prompt: 'What budget is needed — development, infrastructure, services?',
      signals: ['budget', 'cost', 'spend', 'invest', '$', 'dollar', 'thousand', 'million', 'infrastructure', 'cloud', 'service', 'vendor', 'license', 'tool', 'software', 'hardware'],
    },
    {
      dimension: 'cross-functional',
      label: 'cross-functional needs',
      prompt: 'What cross-functional support do you need — design, legal, marketing?',
      signals: ['cross-functional', 'design', 'legal', 'marketing', 'sales', 'ops', 'data', 'security', 'compliance', 'support', 'cs', 'partner', 'collaboration', 'involvement', 'review', 'approval'],
    },
    {
      dimension: 'tradeoffs',
      label: 'what gets deprioritized',
      prompt: 'What gets deprioritized if you do this?',
      signals: ['tradeoff', 'trade-off', 'deprioritize', 'defer', 'delay', 'instead of', 'at the expense', 'sacrifice', 'cut', 'drop', 'park', 'opportunity cost', 'what else', 'alternative'],
    },
  ],

  // ─── Product Pitch ───
  'The Big Idea': [
    {
      dimension: 'pain',
      label: 'the customer pain',
      prompt: 'What pain or waste does the target user experience?',
      signals: ['waste', 'spend', 'struggle', 'pain', 'frustrat', 'slow', 'expensive', 'broken', 'gap', 'miss', 'lose', 'losing', 'hour', 'minute', 'time', 'money', 'cost', 'risk', 'burden'],
    },
    {
      dimension: 'solution',
      label: 'what you\'re proposing',
      prompt: 'What does your product do — in one sentence?',
      signals: ['build', 'create', 'product', 'platform', 'tool', 'app', 'service', 'enable', 'help', 'provide', 'deliver', 'offer', 'solve', 'surface', 'automate', 'connect'],
    },
    {
      dimension: 'positioning',
      label: 'the positioning',
      prompt: 'Why will this win — what makes it different?',
      signals: ['win', 'different', 'unique', 'better', 'only', 'first', 'advantage', 'because', 'unlike', 'compared', 'positioning', 'the X for Y', 'search bar', 'new way', 'never been'],
    },
  ],

  'Market Opportunity': [
    {
      dimension: 'tam',
      label: 'total addressable market',
      prompt: 'What\'s the TAM — with a credible source?',
      signals: ['tam', 'total', 'addressable', 'market size', 'billion', 'million', '$', 'gartner', 'forrester', 'idc', 'report', 'valued at', 'worth', 'industry', 'sector', 'space'],
    },
    {
      dimension: 'sam',
      label: 'serviceable market',
      prompt: 'What\'s your realistic serviceable market (SAM)?',
      signals: ['sam', 'serviceable', 'realistic', 'target', 'segment', 'focus', 'initial', 'niche', 'beachhead', 'our share', 'capture', 'addressable', 'subset', 'specific'],
    },
    {
      dimension: 'growth',
      label: 'growth drivers',
      prompt: 'How fast is the market growing and what\'s driving it?',
      signals: ['grow', 'growth', 'yoy', 'cagr', '%', 'percent', 'increase', 'expand', 'driver', 'trend', 'tailwind', 'demand', 'adoption', 'shift', 'digital', 'ai', 'automation', 'remote'],
    },
    {
      dimension: 'why-now',
      label: 'why now',
      prompt: 'Why is this the right moment — what changed?',
      signals: ['why now', 'changed', 'shift', 'new', 'recent', 'emerging', 'tipping point', 'inflection', 'regulation', 'technology', 'behavior', 'pandemic', 'ai', 'cost', 'expectation', 'demand', 'ready', 'mature'],
    },
  ],

  'Customer Pain': [
    {
      dimension: 'persona',
      label: 'the user persona',
      prompt: 'Who is the primary user — describe their role and daily work?',
      signals: ['user', 'persona', 'customer', 'role', 'manager', 'director', 'analyst', 'engineer', 'designer', 'operator', 'leader', 'daily', 'day-to-day', 'workflow', 'job', 'responsible for'],
    },
    {
      dimension: 'broken-task',
      label: 'the broken workflow',
      prompt: 'What specific task or workflow is broken for them?',
      signals: ['task', 'workflow', 'process', 'step', 'manual', 'tedious', 'broken', 'slow', 'error', 'mistake', 'repeat', 'inefficient', 'clunky', 'outdated', 'fragmented', 'disconnected', 'silos'],
    },
    {
      dimension: 'quantified-cost',
      label: 'quantified cost',
      prompt: 'How much does this problem cost — in time, money, or opportunities?',
      signals: ['hour', 'minute', 'time', 'money', '$', 'cost', 'waste', 'lose', 'revenue', 'opportunity', 'productivity', 'overhead', 'per week', 'per month', 'annually', 'estimate', 'calculate', 'survey'],
    },
    {
      dimension: 'voice',
      label: 'customer voice',
      prompt: 'Include a real or representative customer quote.',
      signals: ['quote', 'said', 'told', 'feedback', 'verbatim', 'customer', 'user', 'interview', '"', 'words', 'voice', 'frustrating', 'wish', 'if only', 'need', 'want'],
    },
  ],

  'Our Solution': [
    {
      dimension: 'first-use',
      label: 'first use experience',
      prompt: 'What does the user see when they first open the product?',
      signals: ['first', 'open', 'see', 'screen', 'dashboard', 'landing', 'onboard', 'welcome', 'setup', 'wizard', 'start', 'begin', 'initial', 'home', 'interface', 'view'],
    },
    {
      dimension: 'core-flow',
      label: 'core workflow',
      prompt: 'Walk through the core workflow in 3-5 steps.',
      signals: ['step', 'workflow', 'flow', 'process', 'first', 'then', 'next', '1.', '2.', '3.', 'click', 'select', 'enter', 'upload', 'configure', 'connect', 'action', 'result'],
    },
    {
      dimension: 'aha-moment',
      label: 'the aha moment',
      prompt: 'When does the user feel the value for the first time?',
      signals: ['aha', 'moment', 'value', 'feel', 'realize', 'see the', 'first time', 'wow', 'magic', 'instant', 'immediately', 'within', 'delight', 'surprise', 'powerful', 'clear'],
    },
    {
      dimension: 'differentiator',
      label: 'key differentiators',
      prompt: 'What makes this better or different than alternatives?',
      signals: ['different', 'unique', 'better', 'unlike', 'only', 'first', 'advantage', 'proprietary', 'novel', 'innovative', 'faster', 'easier', 'cheaper', 'more accurate', 'more reliable', 'competitive', 'edge'],
    },
  ],

  'Why Us': [
    {
      dimension: 'assets',
      label: 'existing assets',
      prompt: 'What existing assets give you an advantage — data, distribution, brand?',
      signals: ['asset', 'data', 'distribution', 'brand', 'technology', 'platform', 'ecosystem', 'customer base', 'relationship', 'partnership', 'infrastructure', 'existing', 'already', 'built', 'have'],
    },
    {
      dimension: 'team',
      label: 'team expertise',
      prompt: 'What relevant expertise does your team bring?',
      signals: ['team', 'expertise', 'experience', 'track record', 'built', 'shipped', 'background', 'talent', 'skill', 'domain', 'industry', 'year', 'previously', 'proven', 'hired', 'founded'],
    },
    {
      dimension: 'moat',
      label: 'the moat',
      prompt: 'What makes this defensible over time — network effects, data, switching costs?',
      signals: ['moat', 'defensible', 'barrier', 'network effect', 'switching cost', 'lock-in', 'data advantage', 'proprietary', 'patent', 'scale', 'flywheel', 'compound', 'accumulate', 'hard to copy', 'first mover'],
    },
  ],

  'Business Model': [
    {
      dimension: 'revenue-model',
      label: 'revenue model',
      prompt: 'How does this make money — subscription, usage, transaction?',
      signals: ['revenue', 'model', 'subscription', 'saas', 'usage', 'transaction', 'commission', 'license', 'recurring', 'one-time', 'hybrid', 'marketplace', 'freemium', 'pay', 'charge', 'monetize'],
    },
    {
      dimension: 'pricing',
      label: 'price point',
      prompt: 'What\'s the proposed price point — and what comparable products charge?',
      signals: ['price', 'pricing', 'cost', '$', 'per', 'month', 'year', 'seat', 'user', 'tier', 'plan', 'comparable', 'competitor', 'benchmark', 'charge', 'willing to pay', 'value'],
    },
    {
      dimension: 'unit-economics',
      label: 'unit economics',
      prompt: 'What are the target unit economics — CAC, LTV, margins?',
      signals: ['cac', 'ltv', 'lifetime value', 'margin', 'gross margin', 'unit economics', 'acquisition cost', 'payback', 'ratio', 'roi', 'blended', 'contribution', 'profitable', 'break even'],
    },
    {
      dimension: 'projections',
      label: 'revenue projections',
      prompt: 'What are your 12-month and 36-month revenue projections?',
      signals: ['project', 'forecast', 'estimate', 'revenue', 'arr', 'mrr', '12 month', '36 month', 'year 1', 'year 2', 'year 3', 'growth', 'scale', 'ramp', 'path to', 'trajectory'],
    },
  ],

  'Go-to-Market': [
    {
      dimension: 'first-customers',
      label: 'first customers',
      prompt: 'Who are your first 10/100/1000 customers and how do you reach them?',
      signals: ['first', 'initial', 'early', 'adopter', 'launch', 'beta', 'pilot', '10', '100', '1000', 'customer', 'segment', 'reach', 'target', 'outreach', 'existing', 'warm', 'network'],
    },
    {
      dimension: 'distribution',
      label: 'distribution channels',
      prompt: 'What\'s the primary distribution channel — sales, product-led, partnerships?',
      signals: ['distribution', 'channel', 'sales', 'product-led', 'plg', 'self-serve', 'partnership', 'marketplace', 'direct', 'indirect', 'outbound', 'inbound', 'referral', 'word of mouth', 'viral', 'content'],
    },
    {
      dimension: 'validation',
      label: 'early validation',
      prompt: 'What early traction or validation do you have — waitlist, LOIs, pilots?',
      signals: ['validation', 'traction', 'waitlist', 'loi', 'letter of intent', 'pilot', 'beta', 'design partner', 'proof', 'signal', 'interest', 'signed', 'committed', 'testing', 'feedback', 'promising'],
    },
  ],

  'Roadmap & Milestones': [
    {
      dimension: 'phase-1',
      label: 'Phase 1 (MVP)',
      prompt: 'What ships in the first 0-3 months?',
      signals: ['phase 1', 'mvp', '0-3', 'first', 'initial', 'launch', 'v1', 'core', 'basic', 'minimum', 'foundation', 'start', 'build', 'month 1', 'month 2', 'month 3', 'q1'],
    },
    {
      dimension: 'expansion',
      label: 'expansion phases',
      prompt: 'What comes in Phase 2 and 3?',
      signals: ['phase 2', 'phase 3', 'expand', 'iterate', 'enhance', 'scale', 'optimize', '3-6', '6-12', 'v2', 'v3', 'next', 'then', 'after', 'follow-up', 'advanced', 'additional'],
    },
    {
      dimension: 'milestones',
      label: 'key milestones',
      prompt: 'What are the key milestones and decision points?',
      signals: ['milestone', 'decision', 'gate', 'checkpoint', 'review', 'go/no-go', 'criteria', 'deliverable', 'launch', 'ship', 'demo', 'pilot', 'target', 'deadline', 'by', 'complete'],
    },
    {
      dimension: 'kill-criteria',
      label: 'kill criteria',
      prompt: 'What would make you stop — what are the go/no-go gates?',
      signals: ['kill', 'stop', 'abort', 'exit', 'no-go', 'criteria', 'threshold', 'if not', 'fail', 'below', 'worse than', 'evidence', 'signal', 'pivot', 'abandon', 'walk away', 'cut losses'],
    },
  ],

  'The Ask': [
    {
      dimension: 'team',
      label: 'team ask',
      prompt: 'What roles and headcount do you need?',
      signals: ['team', 'engineer', 'designer', 'pm', 'analyst', 'headcount', 'hire', 'staff', 'role', 'person', 'people', 'full-time', 'contractor', 'dedicated', 'allocate'],
    },
    {
      dimension: 'budget',
      label: 'budget ask',
      prompt: 'What\'s the total budget — with breakdown?',
      signals: ['budget', 'cost', '$', 'dollar', 'thousand', 'million', 'invest', 'spend', 'fund', 'allocat', 'infrastructure', 'marketing', 'development', 'total', 'breakdown'],
    },
    {
      dimension: 'timeline',
      label: 'decision timeline',
      prompt: 'When do you need the decision and why?',
      signals: ['decision', 'when', 'deadline', 'date', 'urgency', 'timing', 'before', 'by', 'window', 'need', 'soon', 'this week', 'this month', 'this quarter', 'asap', 'critical'],
    },
    {
      dimension: 'deliverables',
      label: 'what you\'ll deliver',
      prompt: 'What concrete deliverables will you ship by when?',
      signals: ['deliver', 'ship', 'build', 'launch', 'complete', 'milestone', 'output', 'result', 'by', 'within', 'month', 'quarter', 'demo', 'prototype', 'mvp', 'beta', 'ga', 'live'],
    },
  ],

  // ─── Packaging Recommendation ───
  'Current Packaging Assessment': [
    {
      dimension: 'current-tiers',
      label: 'current tiers and pricing',
      prompt: 'What are the current tiers, their prices, and what\'s included?',
      signals: ['tier', 'plan', 'price', 'pricing', 'current', 'today', 'existing', 'free', 'pro', 'enterprise', 'basic', 'premium', 'include', 'feature', 'seat', 'limit'],
    },
    {
      dimension: 'usage-data',
      label: 'feature usage data',
      prompt: 'Which features drive upgrades and which are underused?',
      signals: ['usage', 'data', 'feature', 'adoption', 'active', 'used', 'unused', 'underused', 'popular', 'drive', 'upgrade', 'trigger', 'analytics', 'telemetry', 'engagement', 'stickiest'],
    },
    {
      dimension: 'revenue',
      label: 'revenue distribution',
      prompt: 'How does revenue split across tiers?',
      signals: ['revenue', 'distribution', 'split', 'share', '%', 'percent', 'arr', 'mrr', 'arpu', 'per tier', 'per plan', 'contribution', 'concentration', 'weighted', 'average'],
    },
    {
      dimension: 'friction',
      label: 'packaging friction',
      prompt: 'Where do customers get confused or drop off in the upgrade funnel?',
      signals: ['friction', 'confus', 'drop', 'churn', 'downgrade', 'complaint', 'feedback', 'barrier', 'blocker', 'unclear', 'complicated', 'too many', 'overlap', 'gap', 'funnel', 'conversion'],
    },
  ],

  'Competitive Packaging Landscape': [
    {
      dimension: 'competitor-tiers',
      label: 'competitor packaging',
      prompt: 'How do competitors structure their tiers?',
      signals: ['competitor', 'competition', 'rival', 'tier', 'plan', 'structure', 'package', 'model', 'offer', 'include', 'gate', 'free', 'paid', 'enterprise', 'pricing page'],
    },
    {
      dimension: 'feature-parity',
      label: 'feature parity analysis',
      prompt: 'Where are you over or under-indexing on features per tier?',
      signals: ['parity', 'comparison', 'over', 'under', 'gap', 'feature', 'include', 'miss', 'have', 'lack', 'behind', 'ahead', 'more', 'less', 'equivalent', 'match'],
    },
    {
      dimension: 'trends',
      label: 'packaging trends',
      prompt: 'What packaging patterns are emerging in your category?',
      signals: ['trend', 'emerging', 'pattern', 'shift', 'moving toward', 'industry', 'category', 'standard', 'norm', 'best practice', 'adoption', 'usage-based', 'outcome', 'modular', 'bundle'],
    },
    {
      dimension: 'gaps',
      label: 'exploitable gaps',
      prompt: 'What do competitors gate high that you could offer lower?',
      signals: ['gap', 'opportunity', 'exploit', 'advantage', 'offer', 'include', 'free', 'lower', 'accessible', 'competitive', 'differentiate', 'win', 'undercut', 'generous', 'value'],
    },
  ],

  'Proposed Packaging': [
    {
      dimension: 'tiers',
      label: 'tier structure',
      prompt: 'What are the new tier names and who is each for?',
      signals: ['tier', 'plan', 'name', 'free', 'starter', 'pro', 'business', 'enterprise', 'team', 'growth', 'persona', 'target', 'audience', 'segment', 'individual', 'small', 'mid', 'large'],
    },
    {
      dimension: 'pricing',
      label: 'price points',
      prompt: 'What\'s the price point for each tier?',
      signals: ['$', 'price', 'cost', 'charge', 'per month', '/mo', '/yr', 'annual', 'monthly', 'free', 'custom', 'contact', 'starting at', 'from', 'amount', 'discount'],
    },
    {
      dimension: 'features-per-tier',
      label: 'features per tier',
      prompt: 'What features are included in each tier?',
      signals: ['include', 'feature', 'capability', 'access', 'unlock', 'gate', 'limit', 'restriction', 'add', 'core', 'basic', 'advanced', 'premium', 'all', 'everything', 'plus'],
    },
    {
      dimension: 'upgrade-trigger',
      label: 'upgrade triggers',
      prompt: 'What specific feature or limit motivates customers to upgrade?',
      signals: ['upgrade', 'trigger', 'limit', 'cap', 'threshold', 'outgrow', 'need more', 'unlock', 'gate', 'motivate', 'drive', 'reason', 'why', 'compelling', 'must have', 'block'],
    },
  ],

  'Feature Allocation Rationale': [
    {
      dimension: 'data-backing',
      label: 'data supporting allocation',
      prompt: 'What data supports putting each feature in its tier?',
      signals: ['data', 'usage', 'analytics', 'pattern', 'evidence', 'research', 'survey', 'willingness', 'pay', 'adoption', 'correlation', 'found', 'showed', 'indicate', 'segment'],
    },
    {
      dimension: 'table-stakes',
      label: 'table stakes vs. premium',
      prompt: 'Which features are table stakes and which justify premium pricing?',
      signals: ['table stakes', 'basic', 'expect', 'standard', 'must have', 'premium', 'advanced', 'power', 'sophisticated', 'enterprise', 'value', 'willingness', 'justify', 'differentiate'],
    },
    {
      dimension: 'triggers',
      label: 'tier boundary triggers',
      prompt: 'What are the upgrade triggers at each tier boundary?',
      signals: ['trigger', 'boundary', 'upgrade', 'transition', 'move up', 'outgrow', 'need', 'want', 'require', 'limit', 'cap', 'exceed', 'gate', 'unlock', 'access', 'block'],
    },
    {
      dimension: 'competitive',
      label: 'competitive positioning',
      prompt: 'Which features stay low-tier to remain competitive?',
      signals: ['competitive', 'competitor', 'market', 'position', 'retain', 'attract', 'win', 'deal', 'sales', 'comparison', 'match', 'parity', 'table stakes', 'expectation', 'standard'],
    },
  ],

  'Revenue & Adoption Impact': [
    {
      dimension: 'revenue-change',
      label: 'expected revenue change',
      prompt: 'What\'s the expected revenue impact by tier?',
      signals: ['revenue', 'impact', 'change', 'increase', 'decrease', 'net', 'arr', 'mrr', 'arpu', 'expected', 'project', 'estimate', 'model', 'forecast', 'per tier', 'total', 'delta'],
    },
    {
      dimension: 'migration',
      label: 'customer migration',
      prompt: 'What % of customers upgrade, downgrade, or stay?',
      signals: ['migrate', 'migration', 'upgrade', 'downgrade', 'stay', 'remain', 'move', 'shift', 'percent', '%', 'distribution', 'expect', 'scenario', 'assume', 'model'],
    },
    {
      dimension: 'scenarios',
      label: 'scenario analysis',
      prompt: 'What are the optimistic, base, and conservative scenarios?',
      signals: ['scenario', 'optimistic', 'base', 'conservative', 'best', 'worst', 'likely', 'range', 'sensitivity', 'upside', 'downside', 'variable', 'assumption', 'if'],
    },
    {
      dimension: 'breakeven',
      label: 'break-even timeline',
      prompt: 'When does any short-term revenue loss get recovered?',
      signals: ['break even', 'breakeven', 'recover', 'recoup', 'payback', 'timeline', 'when', 'months', 'quarters', 'offset', 'net positive', 'crossover', 'roi', 'return'],
    },
  ],

  'Migration Plan': [
    {
      dimension: 'grandfathering',
      label: 'grandfathering policy',
      prompt: 'Who keeps current pricing and for how long?',
      signals: ['grandfather', 'legacy', 'existing', 'current', 'keep', 'maintain', 'honor', 'lock', 'protect', 'exempt', 'grace', 'period', 'duration', 'until', 'expir', 'renew'],
    },
    {
      dimension: 'communication',
      label: 'communication timeline',
      prompt: 'What\'s the rollout sequence — internal, beta, all customers?',
      signals: ['communication', 'announce', 'notify', 'rollout', 'phase', 'sequence', 'internal', 'beta', 'pilot', 'all', 'general', 'email', 'in-app', 'blog', 'timeline', 'week', 'month', 'advance'],
    },
    {
      dimension: 'tools',
      label: 'migration tools',
      prompt: 'Will migration be self-serve or CS-assisted?',
      signals: ['self-serve', 'automated', 'tool', 'portal', 'dashboard', 'cs', 'customer success', 'assisted', 'manual', 'guided', 'wizard', 'flow', 'upgrade path', 'downgrade path'],
    },
    {
      dimension: 'rollback',
      label: 'rollback plan',
      prompt: 'What triggers a rollback and how does it work?',
      signals: ['rollback', 'revert', 'undo', 'if', 'fail', 'worse', 'threshold', 'trigger', 'plan b', 'backup', 'contingency', 'fallback', 'abort', 'exit', 'criteria', 'signal'],
    },
  ],

  'Recommendation & Decision Points': [
    {
      dimension: 'recommendation',
      label: 'the recommendation',
      prompt: 'Which packaging option do you recommend and why?',
      signals: ['recommend', 'propose', 'suggest', 'endorse', 'option', 'choice', 'prefer', 'best', 'should', 'believe', 'advocate', 'go with', 'because', 'rationale', 'reason'],
    },
    {
      dimension: 'decision',
      label: 'what needs deciding',
      prompt: 'What decision do you need from leadership?',
      signals: ['decision', 'approve', 'sign off', 'green light', 'leadership', 'executive', 'stakeholder', 'need from', 'ask', 'request', 'authority', 'permission', 'alignment'],
    },
    {
      dimension: 'open-questions',
      label: 'open questions',
      prompt: 'What questions still need resolution?',
      signals: ['question', 'open', 'unresolved', 'tbd', 'unclear', 'need input', 'discuss', 'debate', 'explore', 'investigate', 'research', 'pending', 'determine', 'figure out'],
    },
    {
      dimension: 'success-criteria',
      label: 'success criteria',
      prompt: 'How will you measure success at 30/60/90 days?',
      signals: ['success', 'criteria', 'metric', 'measure', '30 day', '60 day', '90 day', 'evaluate', 'track', 'monitor', 'report', 'review', 'kpi', 'target', 'goal', 'benchmark'],
    },
  ],
};

/**
 * Check if a dimension has been addressed in the user's text.
 * Requires at least one signal keyword to be present.
 */
function isDimensionCovered(text, dimension) {
  if (!text || text.trim().length === 0) return false;
  const lower = text.toLowerCase();
  return dimension.signals.some((signal) => lower.includes(signal));
}

/**
 * Get the most important missing ghost prompt for a section.
 * Analyzes what the user has written and finds the first structural
 * dimension that hasn't been addressed yet.
 * When some dimensions are covered, the prompt acknowledges progress
 * and specifically asks for the missing piece — not a generic question.
 * Returns null if all dimensions are covered (section is complete).
 */
export function getGhostPrompt(sectionTitle, userText, prefaceContext) {
  const dimensions = SECTION_DIMENSIONS[sectionTitle];
  if (!dimensions) return null;

  // Extract a short product/project name from preface for personalization
  const productName = extractProductName(prefaceContext);

  // If empty, return the first dimension's prompt
  if (!userText || userText.trim().length === 0) {
    return personalizePrompt(dimensions[0].prompt, productName);
  }

  // Partition into covered and missing
  const covered = [];
  const missing = [];
  for (const dim of dimensions) {
    if (isDimensionCovered(userText, dim)) {
      covered.push(dim);
    } else {
      missing.push(dim);
    }
  }

  // All dimensions covered — section is structurally complete
  if (missing.length === 0) return null;

  const nextDim = missing[0];
  const nextPrompt = personalizePrompt(nextDim.prompt, productName);

  // If the writer has covered some dimensions, acknowledge what's done
  // and specifically ask for the missing piece
  if (covered.length > 0) {
    const coveredLabels = covered.map((d) => d.label || d.dimension.replace(/-/g, ' ')).join(', ');
    return `You've covered ${coveredLabels}. Now add: ${lowercaseFirst(nextPrompt)}`;
  }

  return nextPrompt;
}

function lowercaseFirst(str) {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Extract the product/project name from preface context string.
 */
export function extractProductName(prefaceContext) {
  if (!prefaceContext) return null;
  // Preface context format: "Product / Feature Name: X. Value Proposition: Y."
  const match = prefaceContext.match(/(?:Product|Feature|Project|Team)\s*(?:\/\s*\w+)?\s*Name:\s*([^.]+)/i);
  return match?.[1]?.trim() || null;
}

/**
 * Make a generic prompt more specific by mentioning the product name.
 */
function personalizePrompt(prompt, productName) {
  if (!productName) return prompt;
  // Replace generic references with the product name
  return prompt
    .replace(/\bthis\b(?=\s+(?:problem|feature|product|project|approach|bet|strategy|launch))/i, `${productName}'s`)
    .replace(/^What\'s the /, `For ${productName}, what's the `);
}

/**
 * Get section completeness as a ratio (0 to 1).
 */
export function getSectionCompleteness(sectionTitle, userText) {
  const dimensions = SECTION_DIMENSIONS[sectionTitle];
  if (!dimensions || !userText || userText.trim().length === 0) return 0;

  const covered = dimensions.filter((dim) => isDimensionCovered(userText, dim)).length;
  return covered / dimensions.length;
}

/**
 * Get detailed coverage info — which dimensions are covered and which are missing.
 * Returns { covered: ['who', 'what'], missing: ['impact', 'frequency'] }
 */
export function getDimensionCoverage(sectionTitle, userText) {
  const dimensions = SECTION_DIMENSIONS[sectionTitle];
  if (!dimensions) return { covered: [], missing: [] };
  if (!userText || userText.trim().length === 0) {
    return { covered: [], missing: dimensions.map((d) => d.dimension) };
  }

  const covered = [];
  const missing = [];
  for (const dim of dimensions) {
    if (isDimensionCovered(userText, dim)) {
      covered.push(dim.dimension);
    } else {
      missing.push(dim.dimension);
    }
  }
  return { covered, missing };
}

/**
 * Get the total number of dimensions for a section.
 */
export function getSectionDimensionCount(sectionTitle) {
  return SECTION_DIMENSIONS[sectionTitle]?.length || 0;
}
