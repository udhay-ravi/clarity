import { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const TYPE_LABELS = {
  prd: 'PRD',
  prfaq: 'PRFAQ',
  onePager: 'One-Pager',
  launchBrief: 'Launch',
  competitiveAnalysis: 'Competitive',
  strategyDoc: 'Strategy',
  retrospective: 'Retro',
  pricingProposal: 'Pricing',
  productOnePager: 'Product 1P',
  productPitch: 'Pitch',
  packagingRecommendation: 'Packaging',
};

export default function WorkspaceToolbar({
  title,
  type,
  wordCount,
  saveStatus,
  readabilityGrade,
  onTitleChange,
  onToggleSidebar,
  onToggleCoachPane,
  onExportMarkdown,
  onExportPdf,
  onExportDocx,
  onExportAll,
  onOpenSettings,
  onSignOut,
  onGoToLanding,
  user,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    if (!exportOpen) return;
    const handle = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [exportOpen]);

  return (
    <div className="flex items-center h-11 px-3 border-b border-border bg-surface font-[var(--font-ui)] shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-amber/10 text-ghost"
          title="Toggle sidebar (⌘\\)"
        >
          &#9776;
        </button>
        <button
          onClick={onGoToLanding}
          className="text-sm font-semibold text-amber tracking-tight hover:text-amber/80 transition-colors cursor-pointer"
          title="Go to home"
        >
          Clarity
        </button>
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="bg-transparent text-center text-sm font-medium text-text outline-none w-48 truncate"
        />
        {type && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/15 text-amber">
            {TYPE_LABELS[type] || type}
          </span>
        )}
        <span className="text-xs text-ghost">w: {wordCount}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Export menu */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setExportOpen((p) => !p)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-amber/10 text-ghost text-sm"
            title="Export"
          >
            &#128228;
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-8 w-44 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
              <button onClick={() => { onExportMarkdown(); setExportOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber/10 text-text">
                Markdown (.md)
              </button>
              <button onClick={() => { onExportPdf(); setExportOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber/10 text-text">
                PDF
              </button>
              <button onClick={() => { onExportDocx(); setExportOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber/10 text-text">
                Word (.docx)
              </button>
              <div className="border-t border-border my-1" />
              <button onClick={() => { onExportAll(); setExportOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber/10 text-text">
                Export All Formats
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCoachPane}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-amber/10 text-ghost text-sm"
          title="Toggle AI Coach"
        >
          &#129302;
        </button>

        <ThemeToggle />

        <button
          onClick={onOpenSettings}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-amber/10 text-ghost text-sm"
          title="Settings"
        >
          &#9881;
        </button>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-amber/10 text-ghost text-sm"
            title="Sign out"
          >
            &#9211;
          </button>
        )}
      </div>
    </div>
  );
}
