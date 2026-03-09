import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  ImageRun, Table, TableRow as DocxTableRow, TableCell as DocxTableCell,
  WidthType, BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { walkTipTapContent } from './tipTapWalker';

/**
 * Generate and download a .docx from a Clarity document.
 * Supports rich content: images, tables, and plain text.
 */
export async function exportToDocx(doc) {
  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: doc.title || 'Untitled',
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  // Preface fields
  if (doc.preface) {
    for (const field of Object.values(doc.preface)) {
      if (field.value?.trim()) {
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: `${field.label}: `, bold: true, size: 22 }),
              new TextRun({ text: field.value, size: 22 }),
            ],
          })
        );
      }
    }
    // Spacer after preface
    children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }

  // Sections
  for (const section of doc.sections) {
    if (section.title) {
      children.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    }

    // Rich content path
    if (section.content && section.content.content) {
      const richChildren = await renderRichContent(section.content);
      children.push(...richChildren);
    } else if (section.body) {
      // Legacy plain text path
      const paragraphs = section.body.split('\n');
      for (const para of paragraphs) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: para, size: 22 })],
            spacing: { after: 100 },
          })
        );
      }
    }
  }

  const docx = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(docx);
  const slug = (doc.title || 'untitled').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  saveAs(blob, `${slug}-${date}.docx`);
}

// --- Rich content renderer ---

async function renderRichContent(content) {
  const result = [];
  let tableRows = [];
  let inTable = false;

  walkTipTapContent(content, {
    paragraph(runs) {
      const textRuns = runs.map((r) => {
        return new TextRun({
          text: r.text,
          bold: r.bold,
          italics: r.italic,
          size: 22,
        });
      });
      result.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 100 },
        })
      );
    },
    image(src) {
      if (!src) return;
      try {
        // Decode base64
        const base64 = src.split(',')[1];
        if (!base64) return;
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        result.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: bytes,
                transformation: { width: 500, height: 300 },
                type: src.includes('image/png') ? 'png' : 'jpg',
              }),
            ],
            spacing: { before: 100, after: 100 },
          })
        );
      } catch (err) {
        console.warn('DOCX image render failed:', err.message);
      }
    },
    tableStart() {
      inTable = true;
      tableRows = [];
    },
    tableRow(cells, isHeader) {
      const docxCells = cells.map((cellText) =>
        new DocxTableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  bold: isHeader,
                  size: 20,
                }),
              ],
            }),
          ],
          width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
        })
      );
      tableRows.push(new DocxTableRow({ children: docxCells }));
    },
    tableEnd() {
      if (tableRows.length > 0) {
        result.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
        result.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }
      inTable = false;
      tableRows = [];
    },
  });

  return result;
}
