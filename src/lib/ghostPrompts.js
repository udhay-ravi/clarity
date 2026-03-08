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
