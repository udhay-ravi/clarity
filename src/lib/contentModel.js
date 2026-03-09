/**
 * Bridge between TipTap JSON content and plain text.
 * Keeps section.body as a computed plain-text string for backward compat.
 */

/**
 * Convert a plain text string to a TipTap JSON document.
 */
export function textToTipTapDoc(plainText) {
  if (!plainText || !plainText.trim()) {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  const lines = plainText.split('\n');
  const content = lines.map((line) => {
    if (!line) return { type: 'paragraph' };
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    };
  });

  return { type: 'doc', content };
}

/**
 * Extract plain text from a TipTap JSON document.
 * Skips image and table nodes — only collects text from paragraphs/headings.
 */
export function tipTapDocToText(doc) {
  if (!doc || !doc.content) return '';
  const lines = [];

  for (const node of doc.content) {
    if (node.type === 'paragraph' || node.type === 'heading') {
      const text = extractTextFromNode(node);
      lines.push(text);
    } else if (node.type === 'table') {
      // Flatten table cells to text
      const rows = [];
      for (const row of node.content || []) {
        const cells = [];
        for (const cell of row.content || []) {
          cells.push(extractTextFromNode(cell));
        }
        rows.push(cells.join('\t'));
      }
      lines.push(rows.join('\n'));
    }
    // Skip images — they don't contribute to text content
  }

  return lines.join('\n');
}

function extractTextFromNode(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (!node.content) return '';
  return node.content.map(extractTextFromNode).join('');
}

/**
 * Migrate a section: if content is missing, create it from body.
 */
export function migrateSection(section) {
  if (section.content) return section;
  return {
    ...section,
    content: textToTipTapDoc(section.body || ''),
  };
}

/**
 * Migrate all sections in a document.
 */
export function migrateSections(sections) {
  if (!sections) return sections;
  return sections.map(migrateSection);
}
