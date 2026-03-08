import { jsPDF } from 'jspdf';

/**
 * Generate and download a PDF from a Clarity document.
 *
 * A4 portrait, 20 mm margins, Helvetica font.
 * Title → 22 pt bold, preface → 11 pt, section headings → 15 pt bold, body → 11 pt.
 */
export function exportToPdf(doc) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const usableWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(needed) {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  }

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  const titleLines = pdf.splitTextToSize(doc.title || 'Untitled', usableWidth);
  checkPageBreak(titleLines.length * 9);
  pdf.text(titleLines, margin, y);
  y += titleLines.length * 9 + 6;

  // Preface fields
  if (doc.preface) {
    pdf.setFontSize(11);
    for (const field of Object.values(doc.preface)) {
      if (field.value?.trim()) {
        checkPageBreak(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${field.label}: `, margin, y);
        const labelWidth = pdf.getTextWidth(`${field.label}: `);
        pdf.setFont('helvetica', 'normal');
        const valLines = pdf.splitTextToSize(field.value, usableWidth - labelWidth);
        pdf.text(valLines[0], margin + labelWidth, y);
        if (valLines.length > 1) {
          for (let i = 1; i < valLines.length; i++) {
            y += 5;
            checkPageBreak(5);
            pdf.text(valLines[i], margin, y);
          }
        }
        y += 7;
      }
    }
    y += 3;
  }

  // Sections
  for (const section of doc.sections) {
    if (section.title) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      const headLines = pdf.splitTextToSize(section.title, usableWidth);
      checkPageBreak(headLines.length * 7 + 4);
      pdf.text(headLines, margin, y);
      y += headLines.length * 7 + 4;
    }

    if (section.body) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      const paragraphs = section.body.split('\n');
      for (const para of paragraphs) {
        if (!para.trim()) {
          y += 4;
          continue;
        }
        const lines = pdf.splitTextToSize(para, usableWidth);
        for (const line of lines) {
          checkPageBreak(6);
          pdf.text(line, margin, y);
          y += 5;
        }
        y += 2;
      }
    }

    y += 4;
  }

  // Download
  const slug = (doc.title || 'untitled').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  pdf.save(`${slug}-${date}.pdf`);
}
