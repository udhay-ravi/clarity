import { useState, useRef, useCallback, useEffect } from 'react';
import { getGhostText } from '../lib/ai-provider';
import { getDimensionCoverage } from '../lib/ghostPrompts';

export function useGhostText({ sectionTitle, documentType, prefaceContext = '', debounceMs = 800 }) {
  const [ghostText, setGhostText] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setGhostText('');
    setLoading(false);
  }, []);

  const trigger = useCallback((userText) => {
    // Cancel any pending request
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    setGhostText('');

    // Don't trigger for very short text
    if (!userText || userText.trim().length < 5) return;

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        const { covered, missing } = getDimensionCoverage(sectionTitle, userText);
        const result = await getGhostText({
          sectionTitle,
          documentType,
          prefaceContext,
          userText,
          coveredDimensions: covered,
          missingDimensions: missing,
          signal: controller.signal,
        });
        if (result && !controller.signal.aborted) {
          setGhostText(result);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Ghost text failed silently:', err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, debounceMs);
  }, [sectionTitle, documentType, prefaceContext, debounceMs]);

  const accept = useCallback(() => {
    const text = ghostText;
    setGhostText('');
    return text;
  }, [ghostText]);

  const dismiss = useCallback(() => {
    setGhostText('');
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { ghostText, loading, trigger, accept, dismiss, cancel };
}
