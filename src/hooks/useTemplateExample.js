import { useState, useRef, useCallback, useEffect } from 'react';
import { getTemplateExample } from '../lib/anthropic';

export function useTemplateExample() {
  const [example, setExample] = useState(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef({}); // key: `${sectionTitle}::${prefaceContext}` → example text
  const abortRef = useRef(null);

  const fetchExample = useCallback(async (sectionTitle, templateStructure, prefaceContext) => {
    if (!sectionTitle || !templateStructure) {
      setExample(null);
      return;
    }

    const key = `${sectionTitle}::${prefaceContext || '__empty__'}`;

    // Return cached version if available
    if (cacheRef.current[key]) {
      setExample(cacheRef.current[key]);
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setExample(null);

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
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Template example failed:', err.message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const clear = useCallback(() => {
    setExample(null);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { example, loading, fetchExample, clear };
}
