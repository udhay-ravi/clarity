import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, Loader2, X, Sparkles, Search } from 'lucide-react';
import { useGhostText } from '../hooks/useGhostText';
import { getGhostPrompt, getDimensionCoverage, getSectionDimensionCount } from '../lib/ghostPrompts';
import { getClarityCheck, getSearchInsight, getProvider, isAiEnabled } from '../lib/ai-provider';
import TipTapBody from './TipTapBody';
import InsertToolbar from './InsertToolbar';
import ChartModal from './ChartModal';
import TableToolbar from './TableToolbar';

export default function SectionBlock({
  section,
  documentType,
  preface,
  onUpdate,
  onDelete,
  onAddBelow,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onFocus,
  onBlur,
  index,
  animationDelay,
  clarityCheckOpen,
  onClarityCheckOpen,
}) {
  const [hovered, setHovered] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [clarityResults, setClarityResults] = useState(null);
  const [clarityLoading, setClarityLoading] = useState(false);
  const [clarityError, setClarityError] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [isInTable, setIsInTable] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchAbortRef = useRef(null);
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const clarityAbortRef = useRef(null);
  const hasContent = section.body && section.body.trim().length > 0;

  // Build preface summary for ghost text context
  const prefaceSummary = useMemo(() => {
    if (!preface) return '';
    return Object.values(preface)
      .filter((f) => f.value?.trim())
      .map((f) => `${f.label}: ${f.value}`)
      .join('. ');
  }, [preface]);

  const { ghostText: apiGhostText, trigger, accept: acceptApi, dismiss } = useGhostText({
    sectionTitle: section.title,
    documentType,
    prefaceContext: prefaceSummary,
  });

  // Template-based ghost prompt — advances after each completed sentence
  const templatePrompt = useMemo(
    () => getGhostPrompt(section.title, section.body, prefaceSummary),
    [section.title, section.body, prefaceSummary]
  );

  // Dimension progress tracking
  const totalDimensions = useMemo(
    () => getSectionDimensionCount(section.title),
    [section.title]
  );
  const { covered: coveredDimensions } = useMemo(
    () => getDimensionCoverage(section.title, section.body),
    [section.title, section.body]
  );
  const coveredCount = coveredDimensions.length;

  const hasBody = section.body && section.body.trim().length > 0;
  const wordCount = useMemo(() => {
    if (!section.body) return 0;
    return section.body.split(/\s+/).filter(Boolean).length;
  }, [section.body]);
  const canRunClarityCheck = wordCount >= 30;

  // Section is structurally complete when all dimensions are covered
  const sectionComplete = totalDimensions > 0 && coveredCount === totalDimensions;

  // Parse API ghost text into { question, recommendation } format
  const parsedApiGhost = useMemo(() => {
    if (!apiGhostText) return null;
    const qMatch = apiGhostText.match(/^Q:\s*(.+)/m);
    const rMatch = apiGhostText.match(/^R:\s*(.+)/m);
    if (qMatch && rMatch) {
      return { question: qMatch[1].trim(), recommendation: rMatch[1].trim() };
    }
    // Fallback: if AI didn't return Q/R format, treat as question only
    return { question: apiGhostText, recommendation: null };
  }, [apiGhostText]);

  // Active ghost object: { question, recommendation } — from API or template
  // Stop prompting once the section meets its structural baseline
  const activeGhost = useMemo(() => {
    if (!isFocused || !hasBody || sectionComplete) return null;
    if (parsedApiGhost) return parsedApiGhost;
    if (templatePrompt) return templatePrompt; // already { question, recommendation }
    return null;
  }, [isFocused, hasBody, sectionComplete, parsedApiGhost, templatePrompt]);

  // Close clarity results when another section's clarity check opens
  useEffect(() => {
    if (!clarityCheckOpen) {
      setClarityResults(null);
      setClarityError(false);
    }
  }, [clarityCheckOpen]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (clarityAbortRef.current) clarityAbortRef.current.abort();
    };
  }, []);

  // TipTap body update handler
  const handleBodyUpdate = useCallback(
    (contentJson, textContent) => {
      onUpdate({ ...section, body: textContent, content: contentJson });
      dismiss();
      if (!sectionComplete) {
        trigger(textContent);
      }
    },
    [section, onUpdate, trigger, dismiss, sectionComplete]
  );

  const acceptGhostText = useCallback(() => {
    if (!activeGhost) return null;
    // Accept only the recommendation (R) part
    const rec = activeGhost.recommendation;
    if (apiGhostText) acceptApi(); // clear API state
    return rec || null;
  }, [activeGhost, apiGhostText, acceptApi]);

  const handleBodyKeyDown = useCallback(
    (e) => {
      if (e.key === 'Tab' && activeGhost?.recommendation) {
        e.preventDefault();
        const accepted = acceptGhostText();
        if (accepted && editorRef.current) {
          const editor = editorRef.current;
          // Insert at end of document
          const endPos = editor.state.doc.content.size;
          const currentText = editor.getText();
          const space = currentText.endsWith(' ') || !currentText ? '' : ' ';
          editor.chain().focus('end').insertContent(space + accepted).run();
          const newText = editor.getText();
          onUpdate({ ...section, body: newText, content: editor.getJSON() });
          trigger(newText);
        }
      } else if (e.key === 'Escape') {
        dismiss();
      } else if (apiGhostText && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Meta' && e.key !== 'Alt') {
        dismiss();
      }
    },
    [activeGhost, acceptGhostText, apiGhostText, dismiss, section, onUpdate, trigger]
  );

  const handleTitleChange = useCallback(() => {
    const text = titleRef.current?.innerText || '';
    onUpdate({ ...section, title: text });
  }, [section, onUpdate]);

  const handleSelectionUpdate = useCallback(({ isInTable: inTable }) => {
    setIsInTable(inTable);
  }, []);

  const handleBodyFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.(section.id);
  }, [onFocus, section.id]);

  const handleBodyBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // Chart insert handler
  const handleChartInsert = useCallback(
    (pngDataUrl) => {
      if (!editorRef.current) return;
      editorRef.current.chain().focus().setImage({ src: pngDataUrl }).run();
    },
    []
  );

  // @search command handler
  const handleSearchCommand = useCallback(
    async ({ query, from, to }) => {
      const editor = editorRef.current;
      if (!editor) return;

      if (!isAiEnabled()) {
        // Replace @search with a hint when AI is not configured
        editor.chain().focus().setTextSelection({ from, to }).deleteSelection()
          .insertContent('[Enable an AI provider in Settings to use @search]').run();
        return;
      }

      if (searchLoading) return;

      // Cancel any in-flight search
      if (searchAbortRef.current) searchAbortRef.current.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;

      // Replace @search line with loading indicator text
      editor.chain().focus().setTextSelection({ from, to }).deleteSelection().insertContent('Searching...').run();
      setSearchLoading(true);

      try {
        const result = await getSearchInsight({
          query,
          sectionTitle: section.title,
          documentContext: prefaceSummary || section.body,
          signal: controller.signal,
        });

        if (result && !controller.signal.aborted) {
          // Find "Searching..." text and replace with result
          const doc = editor.state.doc;
          let searchingFrom = null;
          let searchingTo = null;
          doc.descendants((node, pos) => {
            if (searchingFrom !== null) return false;
            if (node.isText && node.text.includes('Searching...')) {
              const idx = node.text.indexOf('Searching...');
              searchingFrom = pos + idx;
              searchingTo = pos + idx + 'Searching...'.length;
              return false;
            }
          });
          if (searchingFrom !== null) {
            editor.chain().focus().setTextSelection({ from: searchingFrom, to: searchingTo }).deleteSelection().insertContent(result).run();
          }
          // Update section
          const newText = editor.getText();
          onUpdate({ ...section, body: newText, content: editor.getJSON() });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Replace "Searching..." with error message
          const doc = editor.state.doc;
          let searchingFrom = null;
          let searchingTo = null;
          doc.descendants((node, pos) => {
            if (searchingFrom !== null) return false;
            if (node.isText && node.text.includes('Searching...')) {
              const idx = node.text.indexOf('Searching...');
              searchingFrom = pos + idx;
              searchingTo = pos + idx + 'Searching...'.length;
              return false;
            }
          });
          if (searchingFrom !== null) {
            editor.chain().focus().setTextSelection({ from: searchingFrom, to: searchingTo }).deleteSelection().insertContent(`[Search failed: ${query}]`).run();
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    },
    [searchLoading, section, prefaceSummary, onUpdate]
  );

  // Cleanup search abort on unmount
  useEffect(() => {
    return () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
    };
  }, []);

  // Clarity Check handlers
  const handleClarityCheck = useCallback(async () => {
    if (!canRunClarityCheck || clarityLoading) return;

    // Tell parent to close any other open clarity panel
    onClarityCheckOpen?.(section.id);

    // Cancel any in-flight request
    if (clarityAbortRef.current) clarityAbortRef.current.abort();

    const controller = new AbortController();
    clarityAbortRef.current = controller;
    setClarityLoading(true);
    setClarityResults(null);
    setClarityError(false);

    try {
      const result = await getClarityCheck({
        sectionTitle: section.title,
        documentType: documentType || 'General',
        sectionText: section.body,
        signal: controller.signal,
      });
      if (result && !controller.signal.aborted) {
        // Parse numbered list into individual observations
        const observations = result
          .split(/\n/)
          .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
          .filter((line) => line.length > 0);
        setClarityResults(observations);
      } else if (!controller.signal.aborted) {
        setClarityError(true);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setClarityError(true);
      }
    } finally {
      if (!controller.signal.aborted) {
        setClarityLoading(false);
      }
    }
  }, [canRunClarityCheck, clarityLoading, section.id, section.title, section.body, documentType, onClarityCheckOpen]);

  const handleCloseClarityCheck = useCallback(() => {
    setClarityResults(null);
    setClarityError(false);
    onClarityCheckOpen?.(null);
  }, [onClarityCheckOpen]);

  return (
    <div
      className="group relative"
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative pl-6 pr-4 py-5 transition-all duration-200 border ${
          isFocused
            ? 'border-amber/50 bg-amber/[0.02]'
            : hasContent
              ? 'border-border'
              : 'border-border/40'
        }`}
      >
        {/* Reorder + delete controls */}
        <div
          className={`absolute left-[-28px] top-4 flex flex-col gap-0.5 transition-opacity duration-150 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {!isFirst && (
            <button
              onClick={() => onMoveUp(index)}
              className="p-0.5 text-ghost hover:text-amber transition-colors cursor-pointer"
              title="Move section up"
            >
              <ChevronUp size={16} />
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => onMoveDown(index)}
              className="p-0.5 text-ghost hover:text-amber transition-colors cursor-pointer"
              title="Move section down"
            >
              <ChevronDown size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(section.id)}
            className="p-0.5 text-ghost hover:text-red-500 transition-colors cursor-pointer"
            title="Delete section"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Section title */}
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleTitleChange}
          onFocus={() => setTitleFocused(true)}
          onBlur={() => setTitleFocused(false)}
          data-placeholder="Section title"
          className="text-lg font-semibold font-[var(--font-ui)] text-text outline-none"
        >
          {section.title}
        </div>

        {/* Dimension progress dots */}
        {totalDimensions > 0 && hasBody && (
          <div className="flex items-center gap-1 mt-1 mb-3">
            {Array.from({ length: totalDimensions }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i < coveredCount ? 'bg-amber' : 'bg-border'
                }`}
              />
            ))}
            {coveredCount === totalDimensions && (
              <span className="ml-1.5 text-[10px] font-[var(--font-ui)] text-amber/70">
                Complete
              </span>
            )}
          </div>
        )}
        {totalDimensions > 0 && !hasBody && (
          <div className="mb-3" />
        )}

        {/* Insert toolbar (Image / Table / Chart) */}
        <InsertToolbar editor={editorRef.current} onOpenChart={() => setShowChartModal(true)} />

        {/* Table editing toolbar — shown when cursor is inside a table */}
        {isInTable && <TableToolbar editor={editorRef.current} />}

        {/* Section body with ghost text */}
        <div className="relative">
          <TipTapBody
            ref={editorRef}
            content={section.content}
            placeholder={section.placeholder || 'Start writing...'}
            onUpdate={handleBodyUpdate}
            onFocus={handleBodyFocus}
            onBlur={handleBodyBlur}
            onKeyDown={handleBodyKeyDown}
            onSelectionUpdate={handleSelectionUpdate}
            onSearchCommand={handleSearchCommand}
          />

          {/* @search loading indicator */}
          {searchLoading && (
            <div className="flex items-center gap-2 mt-2 animate-ghost-in">
              <Search size={14} className="text-amber animate-pulse" />
              <span className="text-sm font-[var(--font-ui)] text-ghost/70">
                Searching for insights...
              </span>
            </div>
          )}

          {/* Ghost coaching — Q (thinking prompt) and R (recommended sentence) */}
          {activeGhost && (
            <div className="pointer-events-none animate-ghost-in mt-2 space-y-1">
              {activeGhost.question && (
                <div className="text-sm leading-relaxed text-ghost/70 font-[var(--font-ui)]">
                  <span className="text-amber/70 font-semibold mr-1">Q:</span>
                  {activeGhost.question}
                </div>
              )}
              {activeGhost.recommendation && (
                <div className="text-base leading-relaxed text-ghost italic font-[var(--font-body)]">
                  <span className="not-italic text-amber/70 font-semibold font-[var(--font-ui)] text-sm mr-1">R:</span>
                  {activeGhost.recommendation}
                  <span className="ml-2 text-xs font-[var(--font-ui)] not-italic text-ghost/60 bg-bg px-1.5 py-0.5 rounded">
                    Tab to accept
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clarity Check button — bottom-right, visible on hover (only when AI is enabled) */}
        {hasBody && getProvider() !== 'none' && (
          <div
            className={`flex justify-end mt-2 transition-opacity duration-150 ${
              hovered || clarityCheckOpen ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {canRunClarityCheck ? (
              <button
                onClick={handleClarityCheck}
                disabled={clarityLoading}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium font-[var(--font-ui)] text-amber border border-amber/40 rounded-md hover:bg-amber-light/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clarityLoading ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Clarity Check
                  </>
                )}
              </button>
            ) : (
              <span
                className="px-3 py-1 text-xs font-[var(--font-ui)] text-ghost/50 cursor-default"
                title="Write more before running a Clarity Check."
              >
                Clarity Check
              </span>
            )}
          </div>
        )}

        {/* Clarity Check results panel */}
        {clarityCheckOpen && clarityResults && (
          <div className="mt-3 border-l-2 border-l-amber bg-amber-light/30 rounded-r-lg px-4 py-3 animate-ghost-in">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[10px] font-semibold font-[var(--font-ui)] text-amber uppercase tracking-wider">
                Clarity Check
              </span>
              <button
                onClick={handleCloseClarityCheck}
                className="p-0.5 text-ghost hover:text-text transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1.5">
              {clarityResults.map((observation, i) => (
                <p key={i} className="text-sm font-[var(--font-body)] text-text/80 leading-snug">
                  <span className="text-amber mr-1.5">→</span>
                  {observation}
                </p>
              ))}
            </div>
            <p className="mt-3 text-xs font-[var(--font-ui)] text-ghost/60 italic">
              Rewrite this section yourself based on the above.
            </p>
          </div>
        )}

        {/* Clarity Check error */}
        {clarityCheckOpen && clarityError && (
          <div className="mt-3 border-l-2 border-l-border bg-sidebar-bg rounded-r-lg px-4 py-3 animate-ghost-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-[var(--font-ui)] text-ghost">
                Clarity Check unavailable right now.
              </span>
              <button
                onClick={handleCloseClarityCheck}
                className="p-0.5 text-ghost hover:text-text transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add section button (between sections) */}
      <div
        className={`flex justify-center py-1 transition-opacity duration-150 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={() => onAddBelow(index)}
          className="flex items-center gap-1 px-3 py-1 text-xs font-[var(--font-ui)] text-ghost hover:text-amber hover:bg-amber-light rounded-full transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Add section
        </button>
      </div>

      {/* Chart modal */}
      {showChartModal && (
        <ChartModal
          onInsert={handleChartInsert}
          onClose={() => setShowChartModal(false)}
        />
      )}
    </div>
  );
}
