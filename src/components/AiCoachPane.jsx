import { useCallback, useMemo } from 'react';
import { TEMPLATES } from '../lib/templates';
import { useAiCoach } from '../hooks/useAiCoach';
import { hasCustomTemplatesForType } from '../lib/customTemplates';

const TYPE_LABELS = {
  prd: 'PRD', prfaq: 'PRFAQ', onePager: 'One-Pager', launchBrief: 'Launch Brief',
  competitiveAnalysis: 'Competitive Analysis', strategyDoc: 'Strategy Doc',
  retrospective: 'Retrospective', pricingProposal: 'Pricing Proposal',
  productOnePager: 'Product One-Pager', productPitch: 'Product Pitch',
  packagingRecommendation: 'Packaging Rec',
};

const TEMPLATE_ICONS = {
  prd: '\uD83D\uDCCB', prfaq: '\uD83D\uDCF0', onePager: '\uD83D\uDCC4',
  launchBrief: '\uD83D\uDE80', competitiveAnalysis: '\u2694\uFE0F',
  strategyDoc: '\uD83C\uDFAF', retrospective: '\uD83D\uDD0D',
  pricingProposal: '\uD83D\uDCB0', productOnePager: '\uD83D\uDCC4',
  productPitch: '\uD83C\uDFA4', packagingRecommendation: '\uD83D\uDCE6',
};

export default function AiCoachPane({ doc, templateInfo, currentHeading, cursorInfo, onSelectType, onDocUpdate, editorRef }) {
  const {
    sectionOutline,
    currentSection,
    dimensions,
    coaching,
    ghostRec,
    templateExample,
    exampleLoading,
    loading,
    acceptGhost,
    dismissGhost,
  } = useAiCoach({ doc, templateInfo, currentHeading, cursorInfo });

  // Check if custom templates exist for this doc type
  const hasCustomTemplates = useMemo(
    () => doc?.type ? hasCustomTemplatesForType(doc.type) : false,
    [doc?.type]
  );

  const guidanceMode = doc?.guidanceMode || 'both';
  const handleGuidanceChange = useCallback((mode) => {
    if (onDocUpdate) onDocUpdate({ ...doc, guidanceMode: mode });
  }, [doc, onDocUpdate]);

  // Handle Tab to accept recommendation
  const handleAcceptGhost = useCallback(() => {
    const text = acceptGhost();
    if (text && editorRef?.current) {
      editorRef.current.insertAtCursor(text);
    }
  }, [acceptGhost, editorRef]);

  // ── State 1: No doc selected ──
  if (!doc) {
    return (
      <div className="w-72 shrink-0 border-l border-border bg-sidebar-bg px-4 py-6 font-[var(--font-ui)]">
        <p className="text-sm text-ghost opacity-50">Select or create a note</p>
      </div>
    );
  }

  // ── State 2: No template selected → show template cards ──
  if (!doc.type) {
    return (
      <div className="w-72 shrink-0 border-l border-border bg-sidebar-bg px-4 py-6 overflow-y-auto font-[var(--font-ui)]">
        <h3 className="text-sm font-semibold text-text mb-1">Select a template</h3>
        <p className="text-xs text-ghost mb-4">Choose a document type for better AI thinking assistance.</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => onSelectType(key)}
              className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg border border-border bg-surface hover:border-amber/50 hover:bg-amber/5 transition-colors text-center"
            >
              <span className="text-xl">{TEMPLATE_ICONS[key] || '\uD83D\uDCC4'}</span>
              <span className="text-xs font-medium text-text">{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── State 3+4: Template selected → show coaching ──
  return (
    <div className="w-72 shrink-0 border-l border-border bg-sidebar-bg px-4 py-6 overflow-y-auto font-[var(--font-ui)] sticky top-11 max-h-[calc(100vh-2.75rem-1.75rem)]">
      {/* Type badge + change link */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber/15 text-amber">
          {TYPE_LABELS[doc.type] || doc.type}
        </span>
        <button
          onClick={() => onSelectType(null)}
          className="text-xs text-ghost hover:text-amber"
        >
          &#9998; change
        </button>
      </div>

      {/* Guidance mode selector — only when custom templates exist */}
      {hasCustomTemplates && (
        <div className="mb-4 p-2.5 bg-surface rounded-lg border border-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ghost mb-2">AI uses your templates for</p>
          <div className="flex gap-1">
            {[
              { id: 'structure', label: 'Structure' },
              { id: 'content', label: 'Content' },
              { id: 'both', label: 'Both' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleGuidanceChange(m.id)}
                className={`flex-1 text-[10px] font-medium py-1 px-1.5 rounded transition-colors cursor-pointer ${
                  guidanceMode === m.id
                    ? 'bg-amber/15 text-amber border border-amber/30'
                    : 'text-ghost hover:text-text border border-transparent'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section outline */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ghost mb-2">Sections</p>
        {sectionOutline.map((s, i) => {
          const isActive = currentSection?.title === s.title;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 py-1 px-2 rounded text-xs ${
                isActive ? 'bg-amber/10 text-text font-medium' : 'text-ghost'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.filled ? 'bg-amber' : 'border border-ghost/40'}`} />
              <span className="truncate">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Current section coaching */}
      {currentSection ? (
        <div className="space-y-3">
          {/* R: / Q: coaching — top priority */}
          {loading && !coaching && (
            <div className="flex items-center gap-2 py-2">
              <span className="w-3 h-3 border-2 border-amber border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-ghost">AI thinking...</span>
            </div>
          )}
          {coaching && (
            <div className="bg-amber/5 rounded-lg p-3 border border-amber/20 animate-nudge-in">
              <div className="mb-2">
                <p className="text-[10px] font-bold text-amber uppercase tracking-wider">R: Recommendation</p>
                <p className="text-xs text-text mt-1">{coaching.recommendation}</p>
              </div>
              <div className="mb-2">
                <p className="text-[10px] font-bold text-ghost uppercase tracking-wider">Q: Question</p>
                <p className="text-xs text-ghost mt-1">{coaching.question}</p>
              </div>
              <button
                onClick={handleAcceptGhost}
                className="text-[10px] font-medium text-amber hover:text-amber/80 mt-1"
              >
                Tab &#8677; to accept
              </button>
            </div>
          )}

          {/* Template example / narrative guide */}
          {exampleLoading && !templateExample && (
            <div className="flex items-center gap-2 py-2">
              <span className="w-3 h-3 border-2 border-amber/50 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-ghost">Generating example...</span>
            </div>
          )}
          {templateExample && (
            <div className="bg-surface rounded-lg p-3 border border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ghost mb-2">
                &#128214; Example
              </p>
              <p className="text-xs text-text/70 leading-relaxed whitespace-pre-line">{templateExample}</p>
            </div>
          )}

          {/* Dimension coverage — bottom */}
          {dimensions.total > 0 && (
            <div className="bg-surface rounded-lg p-3 border border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ghost mb-2">
                &#128221; {currentSection.title}
              </p>
              {templateInfo?.sections?.[currentSection.index] && (
                <div className="space-y-1">
                  {getDimensionLabels(currentSection.title, dimensions).map((dim, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      {dim.covered ? (
                        <span className="text-green-500">&#10003;</span>
                      ) : (
                        <span className="text-ghost">&#9675;</span>
                      )}
                      <span className={dim.covered ? 'text-ghost line-through' : 'text-amber'}>
                        {dim.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-0.5 mt-2">
                {Array.from({ length: dimensions.total }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < dimensions.covered.length ? 'bg-amber' : 'bg-border'
                    }`}
                  />
                ))}
                <span className="text-[10px] text-ghost ml-1">
                  {dimensions.covered.length} of {dimensions.total}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Guidance when no heading matched */
        <div className="bg-surface rounded-lg p-3 border border-border">
          <p className="text-xs text-text">
            <span className="mr-1">&#128161;</span>
            Start your {TYPE_LABELS[doc.type] || 'document'} with an{' '}
            <span className="font-semibold text-amber">
              {templateInfo?.sections?.[0]?.title || 'introduction'}
            </span>
            {templateInfo?.sections?.[0]?.placeholder && (
              <span className="text-ghost"> &mdash; {truncate(templateInfo.sections[0].placeholder, 80)}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

function truncate(str, max) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max) + '...';
}

/**
 * Get dimension labels with covered/missing status for display.
 */
function getDimensionLabels(sectionTitle, dimensions) {
  // Import dimension definitions dynamically
  try {
    const { getDimensionCoverage } = require('../lib/ghostPrompts');
    // We need the actual dimension objects, not just IDs
    // Use a simpler approach: map covered/missing IDs to labels
    const DIMENSION_LABELS = {
      what: "What you're proposing",
      problem: 'The problem it solves',
      approach: 'Your approach',
      impact: 'Expected impact',
      who: 'Who is affected',
      frequency: 'How often it happens',
      workaround: 'Current workarounds',
      outcome: 'Desired outcome',
      metric: 'Key metric',
      baseline: 'Current baseline',
      target: 'Target number',
      timeline: 'Timeline',
      scope: 'Scope',
      risk: 'Risks',
      cost: 'Cost',
      revenue: 'Revenue impact',
      evidence: 'Supporting evidence',
      context: 'Market context',
      alternative: 'Alternatives considered',
      recommendation: 'Recommendation',
      rationale: 'Rationale',
      'next-steps': 'Next steps',
      investment: 'Investment needed',
      tradeoff: 'Trade-offs',
      dependencies: 'Dependencies',
      customer: 'Customer',
      benefit: 'Benefit',
      product: 'Product',
    };

    const allDims = [...dimensions.covered, ...dimensions.missing];
    return allDims.map((id) => ({
      id,
      label: DIMENSION_LABELS[id] || id,
      covered: dimensions.covered.includes(id),
    }));
  } catch {
    return [];
  }
}
