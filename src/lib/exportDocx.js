import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Generate and download a .docx from a Clarity document.
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

    if (section.body) {
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
