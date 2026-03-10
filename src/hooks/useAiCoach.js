import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { TEMPLATES } from '../lib/templates';
import {
  getGhostPrompt,
  getDimensionCoverage,
  getSectionCompleteness,
  getSectionDimensionCount,
} from '../lib/ghostPrompts';
import { getGhostText, isAiEnabled } from '../lib/ai-provider';

/**
 * AI Coach hook — detects headings, tracks dimensions, provides sentence-level coaching.
 *
 * Returns:
 * - sectionOutline: array of { title, filled } for the current template
 * - currentSection: matched section info { title, index }
 * - dimensions: { covered: [], missing: [], total: number }
 * - coaching: { question, recommendation } or null
 * - ghostRec: string — recommendation text for Tab-to-accept
 * - loading: boolean
 * - acceptGhost: () => string — returns the ghost text and clears it
 * - dismissGhost: () => void
 */
export function useAiCoach({ doc, templateInfo, currentHeading, cursorInfo, debounceMs = 800 }) {
  const [coaching, setCoaching] = useState(null);
  const [ghostRec, setGhostRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const abortRef = useRef(null);

  // ── Section outline — derive from template sections ──
  const sectionOutline = useMemo(() => {
    if (!templateInfo?.sections) return [];
    const bodyLower = (doc?.body || '').toLowerCase();
    return templateInfo.sections
      .filter((s) => s.title) // skip FAQ-only sections without meaningful title
      .map((s) => ({
        title: s.title,
        filled: bodyLower.includes(s.title.toLowerCase()),
      }));
  }, [templateInfo, doc?.body]);

  // ── Match current heading to a template section ──
  const currentSection = useMemo(() => {
    if (!currentHeading || !templateInfo?.sections) return null;
    const headingLower = currentHeading.toLowerCase().trim();
    const idx = templateInfo.sections.findIndex(
      (s) => s.title && s.title.toLowerCase().trim() === headingLower
    );
    if (idx >= 0) return { title: templateInfo.sections[idx].title, index: idx };
    // Fuzzy: check if heading contains section title
    const fuzzyIdx = templateInfo.sections.findIndex(
      (s) => s.title && headingLower.includes(s.title.toLowerCase().trim())
    );
    if (fuzzyIdx >= 0) return { title: templateInfo.sections[fuzzyIdx].title, index: fuzzyIdx };
    return null;
  }, [currentHeading, templateInfo]);

  // ── Dimension coverage for current section ──
  const dimensions = useMemo(() => {
    if (!currentSection || !doc?.body) return { covered: [], missing: [], total: 0 };
    // Extract text under the current heading
    const sectionText = extractSectionText(doc.body, currentSection.title);
    const coverage = getDimensionCoverage(currentSection.title, sectionText);
    const total = getSectionDimensionCount(currentSection.title);
    return { ...coverage, total };
  }, [currentSection, doc?.body]);

  // ── Sentence-end detection → trigger coaching ──
  useEffect(() => {
    if (!cursorInfo?.lineText || !currentSection) {
      return;
    }

    const lineText = cursorInfo.lineText;
    // Check for sentence-ending punctuation
    const hasSentenceEnd = /[.!?]\s*$/.test(lineText) && lineText.trim().length > 10;

    if (!hasSentenceEnd) {
      // Clear coaching when typing mid-sentence
      return;
    }

    // Debounce the coaching trigger
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      triggerCoaching();
    }, debounceMs);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [cursorInfo?.lineText, currentSection]);

  const triggerCoaching = useCallback(async () => {
    if (!currentSection || !doc?.body) return;

    const sectionText = extractSectionText(doc.body, currentSection.title);
    const coverage = getDimensionCoverage(currentSection.title, sectionText);

    // If AI is enabled, call the real API
    if (isAiEnabled()) {
      // Abort any pending AI request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const aiResult = await getGhostText({
          sectionTitle: currentSection.title,
          documentType: doc.type || 'General',
          prefaceContext: doc.title || '',
          userText: sectionText,
          coveredDimensions: coverage.covered || [],
          missingDimensions: coverage.missing || [],
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (aiResult) {
          // Parse Q: and R: lines from AI response
          const lines = aiResult.split('\n').filter((l) => l.trim());
          let question = '';
          let recommendation = '';
          for (const line of lines) {
            if (line.startsWith('Q:')) question = line.slice(2).trim();
            if (line.startsWith('R:')) recommendation = line.slice(2).trim();
          }
          if (question || recommendation) {
            setCoaching({ question, recommendation });
            setGhostRec(recommendation);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('AI coaching failed, falling back to rule-based:', err.message);
      }
      setLoading(false);
    }

    // Fallback: rule-based coaching
    const prompt = getGhostPrompt(currentSection.title, sectionText, '');
    if (prompt) {
      setCoaching({ question: prompt.question, recommendation: prompt.recommendation });
      setGhostRec(prompt.recommendation);
    } else {
      setCoaching(null);
      setGhostRec(null);
    }
  }, [currentSection, doc?.body, doc?.type, doc?.title]);

  // ── Clear coaching when section changes ──
  useEffect(() => {
    setCoaching(null);
    setGhostRec(null);
    setLoading(false);
    if (abortRef.current) abortRef.current.abort();
  }, [currentSection?.title]);

  // ── Accept ghost recommendation ──
  const acceptGhost = useCallback(() => {
    const text = ghostRec;
    setGhostRec(null);
    setCoaching(null);
    return text;
  }, [ghostRec]);

  const dismissGhost = useCallback(() => {
    setGhostRec(null);
    setCoaching(null);
  }, []);

  return {
    sectionOutline,
    currentSection,
    dimensions,
    coaching,
    ghostRec,
    loading,
    acceptGhost,
    dismissGhost,
  };
}

// ── Helpers ──

function extractSectionText(fullBody, sectionTitle) {
  if (!fullBody || !sectionTitle) return '';
  const lines = fullBody.split('\n');
  let capturing = false;
  const result = [];

  for (const line of lines) {
    // Check if this line is a heading (approximation — match the section title)
    const trimmed = line.trim();
    if (trimmed.toLowerCase() === sectionTitle.toLowerCase()) {
      capturing = true;
      continue;
    }
    // Stop at next heading-like line (short, no punctuation, title-case)
    if (capturing && trimmed.length > 0 && trimmed.length < 60 && !trimmed.includes('.') && /^[A-Z]/.test(trimmed)) {
      // Heuristic: likely a new heading
      break;
    }
    if (capturing) {
      result.push(line);
    }
  }

  return result.join('\n').trim();
}

