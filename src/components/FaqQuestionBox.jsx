import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { useGhostText } from '../hooks/useGhostText';
import { getSearchInsight, getGenText, isAiEnabled } from '../lib/ai-provider';
import TipTapBody from './TipTapBody';

export default function FaqQuestionBox({
  questionItem,
  sectionTitle,
  documentType,
  prefaceContext,
  onUpdate,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const editorRef = useRef(null);
  const searchAbortRef = useRef(null);
  const genAbortRef = useRef(null);

  const { question, answer, content } = questionItem;

  // Ghost text for this specific question — uses question text as the section context
  const ghostContext = `${sectionTitle} — ${question}`;
  const { ghostText: apiGhostText, trigger, accept: acceptApi, dismiss } = useGhostText({
    sectionTitle: ghostContext,
    documentType,
    prefaceContext,
  });

  // Parse ghost text — only show R: (recommendation), suppress Q:
  const activeGhost = useMemo(() => {
    if (!isFocused || !answer || answer.trim().length === 0) return null;
    if (!apiGhostText) return null;
    const rMatch = apiGhostText.match(/^R:\s*(.+)/m);
    if (rMatch) {
      return { recommendation: rMatch[1].trim() };
    }
    // If AI returned plain text without Q:/R: format, treat it as recommendation
    const plain = apiGhostText.trim();
    if (plain) return { recommendation: plain };
    return null;
  }, [isFocused, answer, apiGhostText]);

  const handleUpdate = useCallback(
    (contentJson, textContent) => {
      onUpdate(questionItem.id, { answer: textContent, content: contentJson });
      dismiss();
      trigger(textContent);
    },
    [questionItem.id, onUpdate, trigger, dismiss]
  );

  const acceptGhostText = useCallback(() => {
    if (!activeGhost?.recommendation) return null;
    if (apiGhostText) acceptApi();
    return activeGhost.recommendation;
  }, [activeGhost, apiGhostText, acceptApi]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Tab' && activeGhost?.recommendation) {
        e.preventDefault();
        const accepted = acceptGhostText();
        if (accepted && editorRef.current) {
          const editor = editorRef.current;
          const currentText = editor.getText();
          const space = currentText.endsWith(' ') || !currentText ? '' : ' ';
          editor.chain().focus('end').insertContent(space + accepted).run();
          const newText = editor.getText();
          onUpdate(questionItem.id, { answer: newText, content: editor.getJSON() });
          trigger(newText);
        }
      } else if (e.key === 'Escape') {
        dismiss();
      } else if (apiGhostText && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Meta' && e.key !== 'Alt') {
        dismiss();
      }
    },
    [activeGhost, acceptGhostText, apiGhostText, dismiss, questionItem.id, onUpdate, trigger]
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  // @search command handler
  const handleSearchCommand = useCallback(
    async ({ query, from, to }) => {
      const editor = editorRef.current;
      if (!editor) return;
      if (!isAiEnabled()) {
        editor.chain().focus().setTextSelection({ from, to }).deleteSelection()
          .insertContent('[Enable an AI provider in Settings to use @search]').run();
        return;
      }
      if (searchLoading) return;
      if (searchAbortRef.current) searchAbortRef.current.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      editor.chain().focus().setTextSelection({ from, to }).deleteSelection().insertContent('Searching...').run();
      setSearchLoading(true);
      try {
        const result = await getSearchInsight({
          query,
          sectionTitle: `${sectionTitle} — ${question}`,
          documentContext: prefaceContext || answer,
          signal: controller.signal,
        });
        if (result && !controller.signal.aborted) {
          const doc = editor.state.doc;
          let sFrom = null, sTo = null;
          doc.descendants((node, pos) => {
            if (sFrom !== null) return false;
            if (node.isText && node.text.includes('Searching...')) {
              const idx = node.text.indexOf('Searching...');
              sFrom = pos + idx;
              sTo = pos + idx + 'Searching...'.length;
              return false;
            }
          });
          if (sFrom !== null) {
            editor.chain().focus().setTextSelection({ from: sFrom, to: sTo }).deleteSelection().insertContent(result).run();
          }
          const newText = editor.getText();
          onUpdate(questionItem.id, { answer: newText, content: editor.getJSON() });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          const doc = editor.state.doc;
          let sFrom = null, sTo = null;
          doc.descendants((node, pos) => {
            if (sFrom !== null) return false;
            if (node.isText && node.text.includes('Searching...')) {
              const idx = node.text.indexOf('Searching...');
              sFrom = pos + idx;
              sTo = pos + idx + 'Searching...'.length;
              return false;
            }
          });
          if (sFrom !== null) {
            editor.chain().focus().setTextSelection({ from: sFrom, to: sTo }).deleteSelection().insertContent(`[Search failed: ${query}]`).run();
          }
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    },
    [searchLoading, sectionTitle, question, prefaceContext, answer, questionItem.id, onUpdate]
  );

  // @gen command handler
  const handleGenCommand = useCallback(
    async ({ instruction, from, to }) => {
      const editor = editorRef.current;
      if (!editor) return;
      if (!isAiEnabled()) {
        editor.chain().focus().setTextSelection({ from, to }).deleteSelection()
          .insertContent('[Enable an AI provider in Settings to use @gen]').run();
        return;
      }
      if (genLoading) return;
      if (genAbortRef.current) genAbortRef.current.abort();
      const controller = new AbortController();
      genAbortRef.current = controller;
      editor.chain().focus().setTextSelection({ from, to }).deleteSelection().insertContent('Generating...').run();
      setGenLoading(true);
      try {
        const result = await getGenText({
          instruction,
          sectionTitle: `${sectionTitle} — ${question}`,
          documentContext: prefaceContext || answer,
          signal: controller.signal,
        });
        if (result && !controller.signal.aborted) {
          const doc = editor.state.doc;
          let gFrom = null, gTo = null;
          doc.descendants((node, pos) => {
            if (gFrom !== null) return false;
            if (node.isText && node.text.includes('Generating...')) {
              const idx = node.text.indexOf('Generating...');
              gFrom = pos + idx;
              gTo = pos + idx + 'Generating...'.length;
              return false;
            }
          });
          if (gFrom !== null) {
            editor.chain().focus().setTextSelection({ from: gFrom, to: gTo }).deleteSelection().insertContent(result).run();
          }
          const newText = editor.getText();
          onUpdate(questionItem.id, { answer: newText, content: editor.getJSON() });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          const doc = editor.state.doc;
          let gFrom = null, gTo = null;
          doc.descendants((node, pos) => {
            if (gFrom !== null) return false;
            if (node.isText && node.text.includes('Generating...')) {
              const idx = node.text.indexOf('Generating...');
              gFrom = pos + idx;
              gTo = pos + idx + 'Generating...'.length;
              return false;
            }
          });
          if (gFrom !== null) {
            editor.chain().focus().setTextSelection({ from: gFrom, to: gTo }).deleteSelection().insertContent(`[Generation failed: ${instruction}]`).run();
          }
        }
      } finally {
        if (!controller.signal.aborted) setGenLoading(false);
      }
    },
    [genLoading, sectionTitle, question, prefaceContext, answer, questionItem.id, onUpdate]
  );

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      if (genAbortRef.current) genAbortRef.current.abort();
    };
  }, []);

  return (
    <div className="border border-border/40 rounded-lg px-4 py-3 transition-all duration-200 hover:border-border/70">
      {/* Question label — always visible */}
      <div className="text-sm font-medium font-[var(--font-ui)] text-text/80 mb-2 select-none">
        {question}
      </div>

      {/* Answer editor */}
      <div className="relative">
        <TipTapBody
          ref={editorRef}
          content={content}
          placeholder="Type your answer..."
          onUpdate={handleUpdate}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onSearchCommand={handleSearchCommand}
          onGenCommand={handleGenCommand}
        />

        {/* @search loading */}
        {searchLoading && (
          <div className="flex items-center gap-2 mt-1 animate-ghost-in">
            <Search size={12} className="text-amber animate-pulse" />
            <span className="text-xs font-[var(--font-ui)] text-ghost/70">Searching...</span>
          </div>
        )}

        {/* @gen loading */}
        {genLoading && (
          <div className="flex items-center gap-2 mt-1 animate-ghost-in">
            <Sparkles size={12} className="text-amber animate-pulse" />
            <span className="text-xs font-[var(--font-ui)] text-ghost/70">Generating...</span>
          </div>
        )}

        {/* Ghost coaching — R: only (no Q: since the question is already visible) */}
        {activeGhost?.recommendation && (
          <div className="pointer-events-none animate-ghost-in mt-1">
            <div className="text-sm leading-relaxed text-ghost italic font-[var(--font-body)]">
              <span className="not-italic text-amber/70 font-semibold font-[var(--font-ui)] text-xs mr-1">R:</span>
              {activeGhost.recommendation}
              <span className="ml-2 text-[10px] font-[var(--font-ui)] not-italic text-ghost/60 bg-bg px-1 py-0.5 rounded">
                Tab
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
