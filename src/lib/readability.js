// Flesch-Kincaid readability scoring — pure JavaScript, no dependencies.
// Target grade level: 14 (college sophomore). Acceptable range: 12–16.

/**
 * Count syllables in a word using a vowel-group heuristic.
 * Not perfect for every English word, but accurate enough for coaching.
 */
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 2) return 1;

  // Remove trailing silent 'e'
  word = word.replace(/e$/, '');

  // Count vowel groups (consecutive vowels = one syllable)
  const matches = word.match(/[aeiouy]+/g);
  const count = matches ? matches.length : 1;

  return Math.max(1, count);
}

/**
 * Compute Flesch-Kincaid Grade Level for a given text.
 * Formula: 0.39 × (words / sentences) + 11.8 × (syllables / words) − 15.59
 *
 * Returns null if text is too short to meaningfully score (< 10 words).
 */
export function computeFleschKincaidGrade(text) {
  if (!text || text.trim().length === 0) return null;

  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return null;

  // Split into words
  const words = text.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z]/g, '').length > 0);
  if (words.length < 10) return null;

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = totalSyllables / words.length;

  const grade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  return Math.round(grade * 10) / 10;
}

/**
 * Get coaching feedback based on a Flesch-Kincaid grade level.
 * Target: 14 (college sophomore). Acceptable sweet spot: 12–16.
 */
export function getReadabilityFeedback(grade) {
  if (grade === null) return null;

  if (grade < 8) {
    return {
      label: 'Too Simple',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      nudge: 'Your writing reads below high school level. Add more specificity and technical depth.',
    };
  }
  if (grade < 12) {
    return {
      label: 'Accessible',
      color: 'text-amber',
      bgColor: 'bg-amber-light',
      nudge: 'Good clarity, but add more precise language and structured reasoning for a PM audience.',
    };
  }
  if (grade <= 16) {
    return {
      label: 'On Target',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      nudge: null, // Sweet spot — no nudge needed
    };
  }
  return {
    label: 'Dense',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    nudge: 'Sentences are very dense. Break them down and replace jargon with direct language.',
  };
}
