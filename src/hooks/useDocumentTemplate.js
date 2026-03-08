import { useState, useCallback } from 'react';
import { detectTemplate, createDocumentFromTemplate, createBlankDocument } from '../lib/templates';

export function useDocumentTemplate() {
  const [detection, setDetection] = useState(null);

  const detect = useCallback((input) => {
    const result = detectTemplate(input);
    setDetection(result);
    return result;
  }, []);

  const createDocument = useCallback((template) => {
    if (template) {
      return createDocumentFromTemplate(template);
    }
    return createBlankDocument();
  }, []);

  const clearDetection = useCallback(() => {
    setDetection(null);
  }, []);

  return { detection, detect, createDocument, clearDetection };
}
