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

// ---------------------------------------------------------------------------
// V2 migration: multi-section doc → single TipTap document
// ---------------------------------------------------------------------------

/**
 * Convert old sectioned document into a single TipTap JSON document.
 * - Preface fields → bold label + value paragraphs at top
 * - Section titles → H2 headings
 * - Section body/content → paragraphs under headings
 * - FAQ sections → bold Q + answer paragraphs
 */
export function sectionsToSingleDoc(sections, preface) {
  const nodes = [];

  // Preface fields at the top
  if (preface) {
    for (const field of Object.values(preface)) {
      if (field.value?.trim()) {
        nodes.push({
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: `${field.label}: ` },
            { type: 'text', text: field.value },
          ],
        });
      }
    }
    // Add blank line after preface if we had any
    if (nodes.length > 0) {
      nodes.push({ type: 'paragraph' });
    }
  }

  for (const section of sections || []) {
    // Section title → H2 heading
    if (section.title) {
      nodes.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: section.title }],
      });
    }

    // FAQ sections: render questions and answers
    if (section.type === 'faq' && section.questions) {
      for (const q of section.questions) {
        // Bold question
        nodes.push({
          type: 'paragraph',
          content: [{ type: 'text', marks: [{ type: 'bold' }], text: `Q: ${q.question}` }],
        });
        // Answer (from content or answer text)
        const answerText = q.content ? tipTapDocToText(q.content) : (q.answer || '');
        if (answerText.trim()) {
          for (const line of answerText.split('\n')) {
            nodes.push(
              line.trim()
                ? { type: 'paragraph', content: [{ type: 'text', text: line }] }
                : { type: 'paragraph' }
            );
          }
        } else {
          nodes.push({ type: 'paragraph' });
        }
      }
      continue;
    }

    // Rich content: extract nodes from TipTap JSON
    if (section.content && section.content.content) {
      for (const node of section.content.content) {
        nodes.push(node);
      }
    } else if (section.body?.trim()) {
      // Plain text fallback
      for (const line of section.body.split('\n')) {
        nodes.push(
          line.trim()
            ? { type: 'paragraph', content: [{ type: 'text', text: line }] }
            : { type: 'paragraph' }
        );
      }
    } else {
      // Empty section — add blank paragraph
      nodes.push({ type: 'paragraph' });
    }
  }

  // Ensure at least one node
  if (nodes.length === 0) {
    nodes.push({ type: 'paragraph' });
  }

  return { type: 'doc', content: nodes };
}
