import { useState, useCallback, useRef, useEffect } from 'react';

const RULE_BASED_NUDGES = [
  {
    id: 'no-user-mention',
    check: (sections) => {
      const problemSection = sections.find(
        (s) => s.title.toLowerCase().includes('problem')
      );
      if (!problemSection) return false;
      const words = problemSection.body.split(/\s+/).filter(Boolean);
      if (words.length < 15) return false;
      const userKeywords = ['user', 'customer', 'people', 'team', 'person', 'they', 'who'];
      const hasUserMention = userKeywords.some((kw) =>
        problemSection.body.toLowerCase().includes(kw)
      );
      return !hasUserMention;
    },
    text: 'Who is affected by this? Name a specific user type.',
  },
  {
    id: 'solution-before-problem',
    check: (sections) => {
      const problemIdx = sections.findIndex((s) =>
        s.title.toLowerCase().includes('problem')
      );
      const solutionIdx = sections.findIndex(
        (s) =>
          s.title.toLowerCase().includes('solution') ||
          s.title.toLowerCase().includes('bet') ||
          s.title.toLowerCase().includes('approach')
      );
      if (problemIdx === -1 || solutionIdx === -1) return false;
      const problemWords = sections[problemIdx].body.split(/\s+/).filter(Boolean).length;
      const solutionWords = sections[solutionIdx].body.split(/\s+/).filter(Boolean).length;
      return solutionWords > 20 && problemWords < 10;
    },
    text: "You're designing a solution — have you fully defined the problem yet?",
  },
  {
    id: 'metrics-no-baseline',
    check: (sections) => {
      const metricsSection = sections.find(
        (s) =>
          s.title.toLowerCase().includes('metric') ||
          s.title.toLowerCase().includes('success') ||
          s.title.toLowerCase().includes('know it worked')
      );
      if (!metricsSection) return false;
      const words = metricsSection.body.split(/\s+/).filter(Boolean);
      if (words.length < 10) return false;
      const baselineKeywords = ['baseline', 'today', 'currently', 'current', 'existing', 'from', 'now'];
      return !baselineKeywords.some((kw) =>
        metricsSection.body.toLowerCase().includes(kw)
      );
    },
    text: 'Metrics need a baseline. What does this look like today?',
  },
  {
    id: 'section-too-long',
    check: (sections) => {
      return sections.some((s) => {
        const words = s.body.split(/\s+/).filter(Boolean).length;
        return words > 200;
      });
    },
    text: 'This section is getting long. Can the core idea be said in one paragraph?',
  },
  {
    id: 'thin-sections',
    check: (sections) => {
      const thinSections = sections.filter((s) => {
        const words = s.body.split(/\s+/).filter(Boolean).length;
        return words > 0 && words < 20;
      });
      return thinSections.length >= 3;
    },
    text: 'Several sections feel thin. Which one is most important to develop?',
  },
  {
    id: 'readability-too-simple',
    check: (_sections, readabilityGrade) => {
      return readabilityGrade !== null && readabilityGrade < 8;
    },
    text: 'Your writing reads too simply for a PM audience. Add specificity and structured reasoning.',
  },
  {
    id: 'readability-too-dense',
    check: (_sections, readabilityGrade) => {
      return readabilityGrade !== null && readabilityGrade > 16;
    },
    text: 'Sentences are very dense. Break them down and replace jargon with direct language.',
  },
];

export function useCoaching() {
  const [nudges, setNudges] = useState([]);
  const dismissedRef = useRef(new Set());
  const blankTimersRef = useRef({});

  const evaluate = useCallback((sections, readabilityGrade = null) => {
    const active = [];

    for (const rule of RULE_BASED_NUDGES) {
      if (dismissedRef.current.has(rule.id)) continue;
      if (rule.check(sections, readabilityGrade)) {
        active.push({ id: rule.id, text: rule.text });
      }
    }

    // Check for blank sections visited for >60 seconds
    for (const section of sections) {
      const nudgeId = `blank-${section.id}`;
      if (dismissedRef.current.has(nudgeId)) continue;

      const isEmpty = !section.body || section.body.trim().length === 0;
      if (isEmpty && blankTimersRef.current[section.id]) {
        const elapsed = Date.now() - blankTimersRef.current[section.id];
        if (elapsed > 60000) {
          active.push({
            id: nudgeId,
            text: "What's making this section hard to write?",
          });
        }
      }
    }

    // Only show max 2
    setNudges(active.slice(0, 2));
  }, []);

  const trackSectionVisit = useCallback((sectionId) => {
    if (!blankTimersRef.current[sectionId]) {
      blankTimersRef.current[sectionId] = Date.now();
    }
  }, []);

  const clearSectionTimer = useCallback((sectionId) => {
    delete blankTimersRef.current[sectionId];
  }, []);

  const dismissNudge = useCallback((nudgeId) => {
    dismissedRef.current.add(nudgeId);
    setNudges((prev) => prev.filter((n) => n.id !== nudgeId));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      blankTimersRef.current = {};
    };
  }, []);

  return { nudges, evaluate, dismissNudge, trackSectionVisit, clearSectionTimer };
}
