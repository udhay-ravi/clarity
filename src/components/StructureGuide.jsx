import { useEffect, useMemo } from 'react';
import { LayoutTemplate, Sparkles, Loader2 } from 'lucide-react';
import { getGhostParagraph } from '../lib/ghostParagraphs';
import { useTemplateExample } from '../hooks/useTemplateExample';

export default function StructureGuide({ focusedSection, preface, documentType }) {
  const { example, loading, fetchExample, clear } = useTemplateExample();

  // Build preface summary for template personalization
  const prefaceSummary = useMemo(() => {
    if (!preface) return '';
    return Object.values(preface)
      .filter((f) => f.value?.trim())
      .map((f) => `${f.label}: ${f.value}`)
      .join('. ');
  }, [preface]);

  // Derive stable values for deps
  const sectionTitle = focusedSection?.title || null;

  // Get the bracket-placeholder template for the focused section
  const template = useMemo(() => {
    if (!sectionTitle) return null;
    return getGhostParagraph(sectionTitle, prefaceSummary);
  }, [sectionTitle, prefaceSummary]);

  // Fetch AI example when focused section or template changes
  useEffect(() => {
    if (template && sectionTitle) {
      fetchExample(sectionTitle, template, prefaceSummary);
    } else {
      clear();
    }
  }, [template, sectionTitle, prefaceSummary, fetchExample, clear]);

  // Don't render if no focused section or no template for this section
  if (!focusedSection || !template) return null;

  return (
    <div className="animate-nudge-in mb-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <LayoutTemplate size={14} className="text-amber" />
        <h3 className="text-xs font-semibold font-[var(--font-ui)] uppercase tracking-wider text-ghost">
          Structure Guide
        </h3>
      </div>

      {/* Section title context */}
      <div className="text-sm font-medium font-[var(--font-ui)] text-text mb-2">
        {focusedSection.title}
      </div>

      {/* Template structure card */}
      <div className="p-3 bg-white rounded-lg border border-border mb-3">
        <div className="text-[10px] font-semibold font-[var(--font-ui)] text-ghost uppercase tracking-wider mb-2">
          Template
        </div>
        <div className="text-[13px] leading-relaxed text-ghost font-[var(--font-body)] whitespace-pre-line">
          {template}
        </div>
      </div>

      {/* AI-generated example card */}
      <div className="p-3 bg-amber-light/40 rounded-lg border border-amber/20">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={12} className="text-amber" />
          <span className="text-[10px] font-semibold font-[var(--font-ui)] text-amber uppercase tracking-wider">
            Example
          </span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-ghost font-[var(--font-ui)] py-2">
            <Loader2 size={12} className="animate-spin" />
            Generating example...
          </div>
        ) : example ? (
          <div className="text-[13px] leading-relaxed text-text/70 font-[var(--font-body)] whitespace-pre-line">
            {example}
          </div>
        ) : (
          <div className="text-xs text-ghost italic font-[var(--font-ui)]">
            Add an API key and product context to see a personalized example.
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="mt-3 text-[10px] font-[var(--font-ui)] text-ghost/60 leading-snug">
        Use this structure as a reference while you write.
      </p>
    </div>
  );
}
