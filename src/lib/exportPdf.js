import { jsPDF } from 'jspdf';
import { walkTipTapContent } from './tipTapWalker';

/**
 * Generate and download a PDF from a Clarity document.
 *
 * A4 portrait, 20 mm margins, Helvetica font.
 * Title → 22 pt bold, preface → 11 pt, section headings → 15 pt bold, body → 11 pt.
 * Supports rich content: images, tables, and plain text.
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

    // Rich content path: use TipTap JSON if available
    if (section.content && section.content.content) {
      renderRichContent(pdf, section.content, margin, usableWidth, pageHeight, checkPageBreak);
    } else if (section.body) {
      // Legacy plain text path
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

  // --- helpers ---

  function renderRichContent(pdf, content, margin, usableWidth, pageHeight, checkPageBreak) {
    walkTipTapContent(content, {
      paragraph(runs) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        const text = runs.map((r) => r.text).join('');
        if (!text.trim()) {
          y += 4;
          return;
        }
        const lines = pdf.splitTextToSize(text, usableWidth);
        for (const line of lines) {
          checkPageBreak(6);
          pdf.text(line, margin, y);
          y += 5;
        }
        y += 2;
      },
      image(src) {
        if (!src) return;
        try {
          // Determine format from data URL
          const isJpeg = src.includes('image/jpeg') || src.includes('image/jpg');
          const format = isJpeg ? 'JPEG' : 'PNG';

          // Fit image within usable width, max 80mm tall
          const imgW = Math.min(usableWidth, 140);
          const imgH = imgW * 0.6; // approximate aspect ratio
          checkPageBreak(imgH + 4);
          pdf.addImage(src, format, margin, y, imgW, imgH);
          y += imgH + 4;
        } catch (err) {
          // Skip images that can't be rendered
          console.warn('PDF image render failed:', err.message);
        }
      },
      tableStart() {
        y += 2;
      },
      tableRow(cells, isHeader) {
        const colW = usableWidth / (cells.length || 1);
        const rowH = 7;
        checkPageBreak(rowH + 2);

        cells.forEach((cell, i) => {
          const x = margin + colW * i;
          // Cell border
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(x, y - 4, colW, rowH);
          // Cell text
          pdf.setFont('helvetica', isHeader ? 'bold' : 'normal');
          pdf.setFontSize(isHeader ? 10 : 10);
          const truncated = pdf.splitTextToSize(cell, colW - 4)[0] || '';
          pdf.text(truncated, x + 2, y);
        });

        y += rowH;
      },
      tableEnd() {
        y += 4;
      },
    });
  }
}
