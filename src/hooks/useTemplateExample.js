import { useState, useRef, useCallback, useEffect } from 'react';
import { getTemplateExample, isAiEnabled } from '../lib/ai-provider';

export function useTemplateExample() {
  const [example, setExample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const cacheRef = useRef({}); // key: `${sectionTitle}::${prefaceContext}` → example text
  const abortRef = useRef(null);
  const lastArgsRef = useRef(null); // Store last args for retry

  const fetchExample = useCallback(async (sectionTitle, templateStructure, prefaceContext) => {
    if (!sectionTitle || !templateStructure) {
      setExample(null);
      setFailed(false);
      setErrorMsg(null);
      return;
    }

    // Skip if AI is disabled — let the UI show the "no AI" fallback
    if (!isAiEnabled()) {
      setExample(null);
      setFailed(false);
      setErrorMsg(null);
      setLoading(false);
      return;
    }

    const key = `${sectionTitle}::${prefaceContext || '__empty__'}`;

    // Return cached version if available
    if (cacheRef.current[key]) {
      setExample(cacheRef.current[key]);
      setFailed(false);
      setErrorMsg(null);
      return;
    }

    // Store args for retry
    lastArgsRef.current = { sectionTitle, templateStructure, prefaceContext };

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setExample(null);
    setFailed(false);
    setErrorMsg(null);

    try {
      const result = await getTemplateExample({
        sectionTitle,
        templateStructure,
        prefaceContext,
        signal: controller.signal,
      });
      if (result && !controller.signal.aborted) {
        cacheRef.current[key] = result;
        setExample(result);
        setFailed(false);
      } else if (!controller.signal.aborted) {
        // API returned null — model might be unavailable or returned empty
        setFailed(true);
        setErrorMsg('No response from AI model.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Template example failed:', err.message);
        setFailed(true);
        setErrorMsg(err.message || 'AI request failed.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const retry = useCallback(() => {
    if (lastArgsRef.current) {
      const { sectionTitle, templateStructure, prefaceContext } = lastArgsRef.current;
      fetchExample(sectionTitle, templateStructure, prefaceContext);
    }
  }, [fetchExample]);

  const clear = useCallback(() => {
    setExample(null);
    setFailed(false);
    setErrorMsg(null);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { example, loading, failed, errorMsg, fetchExample, retry, clear };
}
