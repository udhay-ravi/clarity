import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { TEMPLATES } from '../lib/templates';
import {
  getGhostPrompt,
  getDimensionCoverage,
  getSectionCompleteness,
  getSectionDimensionCount,
} from '../lib/ghostPrompts';
import { getGhostText, getTemplateExample, isAiEnabled } from '../lib/ai-provider';

/**
 * AI Coach hook — detects headings, tracks dimensions, provides sentence-level coaching.
 *
 * Returns:
 * - sectionOutline: array of { title, filled } for the current template
 * - currentSection: matched section info { title, index }
 * - dimensions: { covered: [], missing: [], total: number }
 * - coaching: { question, recommendation } or null
 * - ghostRec: string — recommendation text for Tab-to-accept
 * - templateExample: string | null — AI-generated example narrative for current section
 * - exampleLoading: boolean
 * - loading: boolean
 * - acceptGhost: () => string — returns the ghost text and clears it
 * - dismissGhost: () => void
 */
export function useAiCoach({ doc, templateInfo, currentHeading, cursorInfo, debounceMs = 800 }) {
  const [coaching, setCoaching] = useState(null);
  const [ghostRec, setGhostRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templateExample, setTemplateExample] = useState(null);
  const [exampleLoading, setExampleLoading] = useState(false);
  const debounceTimer = useRef(null);
  const abortRef = useRef(null);
  const exampleAbortRef = useRef(null);
  const exampleCacheRef = useRef({}); // cache by sectionTitle

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
    if (!currentSection) return;

    const sectionText = doc?.body ? extractSectionText(doc.body, currentSection.title) : '';
    const coverage = getDimensionCoverage(currentSection.title, sectionText);

    // If AI is enabled, try the real API first
    if (isAiEnabled()) {
      // Abort any pending AI request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const aiResult = await getGhostText({
          sectionTitle: currentSection.title,
          documentType: doc?.type || 'General',
          prefaceContext: doc?.title || '',
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
        // AI returned null or unparseable — fall through to rule-based
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('AI coaching failed, falling back to rule-based:', err.message);
      }
      setLoading(false);
    }

    // Always fall back to rule-based coaching
    const prompt = getGhostPrompt(currentSection.title, sectionText, doc?.title || '');
    if (prompt) {
      setCoaching({ question: prompt.question, recommendation: prompt.recommendation });
      setGhostRec(prompt.recommendation);
    } else {
      setCoaching(null);
      setGhostRec(null);
    }
  }, [currentSection, doc?.body, doc?.type, doc?.title]);

  // ── Clear coaching when section changes — then proactively trigger ──
  const triggerRef = useRef(triggerCoaching);
  triggerRef.current = triggerCoaching;

  useEffect(() => {
    setCoaching(null);
    setGhostRec(null);
    setLoading(false);
    if (abortRef.current) abortRef.current.abort();

    // Proactively trigger coaching when entering a new section
    if (currentSection) {
      // Fire quickly so coaching appears right away
      const timer = setTimeout(() => triggerRef.current(), 200);
      return () => clearTimeout(timer);
    }
  }, [currentSection?.title]);

  // ── Fetch template example when section changes ──
  useEffect(() => {
    if (!currentSection || !templateInfo?.sections) {
      setTemplateExample(null);
      return;
    }

    const section = templateInfo.sections[currentSection.index];
    if (!section) {
      setTemplateExample(null);
      return;
    }

    const placeholder = section.placeholder || `Write your ${currentSection.title} here.`;

    // Check cache first
    const cacheKey = `${doc?.type}::${currentSection.title}`;
    if (exampleCacheRef.current[cacheKey]) {
      setTemplateExample(exampleCacheRef.current[cacheKey]);
      return;
    }

    // Always set placeholder immediately so something is visible right away
    setTemplateExample(placeholder);

    // If AI is not enabled, we're done — placeholder is already set
    if (!isAiEnabled()) {
      return;
    }

    // Fetch AI-generated example to replace the placeholder
    if (exampleAbortRef.current) exampleAbortRef.current.abort();
    const controller = new AbortController();
    exampleAbortRef.current = controller;
    setExampleLoading(true);

    getTemplateExample({
      sectionTitle: currentSection.title,
      templateStructure: section.placeholder || currentSection.title,
      prefaceContext: doc?.title || 'A B2B SaaS product',
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result) {
          exampleCacheRef.current[cacheKey] = result;
          setTemplateExample(result);
        }
        // If AI returned nothing, placeholder is already showing
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.warn('Template example failed:', err.message);
        // Placeholder is already showing — no action needed
      })
      .finally(() => {
        if (!controller.signal.aborted) setExampleLoading(false);
      });

    return () => controller.abort();
  }, [currentSection?.title, currentSection?.index, templateInfo, doc?.type, doc?.title]);

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
    templateExample,
    exampleLoading,
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
  const titleLower = sectionTitle.toLowerCase().trim();

  for (const line of lines) {
    const trimmed = line.trim();
    const trimmedLower = trimmed.toLowerCase();
    // Match heading: exact, or heading starts with title (handles "Executive Summary:" matching "Executive Summary")
    if (trimmedLower === titleLower || (trimmedLower.startsWith(titleLower) && trimmedLower.length <= titleLower.length + 3)) {
      capturing = true;
      continue;
    }
    // Stop at next heading-like line (short, no punctuation, title-case)
    if (capturing && trimmed.length > 0 && trimmed.length < 60 && !trimmed.includes('.') && /^[A-Z]/.test(trimmed)) {
      break;
    }
    if (capturing) {
      result.push(line);
    }
  }

  return result.join('\n').trim();
}

