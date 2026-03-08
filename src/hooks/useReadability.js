import { useState, useCallback, useRef, useEffect } from 'react';
import { computeFleschKincaidGrade, getReadabilityFeedback } from '../lib/readability';

/**
 * Debounced readability scoring hook.
 * Computes Flesch-Kincaid Grade Level from section text.
 */
export function useReadability(debounceMs = 500) {
  const [grade, setGrade] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);

  const compute = useCallback(
    (allSectionsText) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const g = computeFleschKincaidGrade(allSectionsText);
        setGrade(g);
        setFeedback(getReadabilityFeedback(g));
      }, debounceMs);
    },
    [debounceMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { grade, feedback, compute };
}
