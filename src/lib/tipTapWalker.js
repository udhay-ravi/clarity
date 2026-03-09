/**
 * Generic TipTap JSON tree walker for export pipelines.
 *
 * Visitors: { paragraph(texts), image(src), tableStart(), tableRow(cells), tableEnd(), hardBreak() }
 * Each cell in tableRow is an array of text strings.
 */

export function walkTipTapContent(content, visitors) {
  if (!content || !content.content) return;

  for (const node of content.content) {
    switch (node.type) {
      case 'paragraph':
      case 'heading': {
        const texts = extractRuns(node);
        visitors.paragraph?.(texts, node.type === 'heading' ? node.attrs?.level : 0);
        break;
      }
      case 'image': {
        visitors.image?.(node.attrs?.src, node.attrs?.alt);
        break;
      }
      case 'table': {
        visitors.tableStart?.();
        for (const row of node.content || []) {
          if (row.type === 'tableRow') {
            const cells = [];
            let isHeader = false;
            for (const cell of row.content || []) {
              if (cell.type === 'tableHeader') isHeader = true;
              // Each cell can contain paragraphs
              const cellText = (cell.content || [])
                .map((p) => extractRuns(p).map((r) => r.text).join(''))
                .join('\n');
              cells.push(cellText);
            }
            visitors.tableRow?.(cells, isHeader);
          }
        }
        visitors.tableEnd?.();
        break;
      }
      default:
        break;
    }
  }
}

/**
 * Extract text runs from a paragraph/heading node.
 * Returns array of { text, bold, italic }.
 */
function extractRuns(node) {
  if (!node || !node.content) return [{ text: '', bold: false, italic: false }];
  return node.content.map((child) => {
    if (child.type === 'text') {
      const marks = child.marks || [];
      return {
        text: child.text || '',
        bold: marks.some((m) => m.type === 'bold'),
        italic: marks.some((m) => m.type === 'italic'),
      };
    }
    if (child.type === 'hardBreak') return { text: '\n', bold: false, italic: false };
    return { text: '', bold: false, italic: false };
  });
}
