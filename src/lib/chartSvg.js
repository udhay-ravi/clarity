/**
 * Hand-rolled SVG chart generators.
 * Produces SVG strings that can be converted to base64 PNG for TipTap insertion.
 */

const COLORS = ['#D97706', '#F59E0B', '#FBBF24', '#FDE68A', '#92400E', '#B45309', '#D4A017', '#78350F'];

function escapeXml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Bar Chart ──

export function generateBarChartSvg({ title, data, width = 600, height = 380 }) {
  const padding = { top: title ? 50 : 20, right: 20, bottom: 50, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.min(60, (chartW / data.length) * 0.6);
  const gap = chartW / data.length;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="background:#fff;border-radius:8px">`;

  if (title) {
    svg += `<text x="${width / 2}" y="30" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="#1A1A1A">${escapeXml(title)}</text>`;
  }

  // Y-axis grid lines
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (chartH * i) / 4;
    const val = Math.round((maxVal * i) / 4);
    svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#E5E5E3" stroke-width="1"/>`;
    svg += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-family="sans-serif" font-size="11" fill="#6B7280">${val}</text>`;
  }

  // Bars
  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * chartH;
    const x = padding.left + gap * i + (gap - barWidth) / 2;
    const y = padding.top + chartH - barH;
    const color = COLORS[i % COLORS.length];

    svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3" fill="${color}"/>`;
    svg += `<text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#374151">${d.value}</text>`;
    svg += `<text x="${padding.left + gap * i + gap / 2}" y="${padding.top + chartH + 20}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6B7280">${escapeXml(d.label)}</text>`;
  });

  // Axes
  svg += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="#9CA3AF" stroke-width="1"/>`;
  svg += `<line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="#9CA3AF" stroke-width="1"/>`;

  svg += '</svg>';
  return svg;
}

// ── Line Chart ──

export function generateLineChartSvg({ title, data, width = 600, height = 380 }) {
  const padding = { top: title ? 50 : 20, right: 20, bottom: 50, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const step = data.length > 1 ? chartW / (data.length - 1) : chartW;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="background:#fff;border-radius:8px">`;

  if (title) {
    svg += `<text x="${width / 2}" y="30" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="#1A1A1A">${escapeXml(title)}</text>`;
  }

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (chartH * i) / 4;
    const val = Math.round((maxVal * i) / 4);
    svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#E5E5E3" stroke-width="1"/>`;
    svg += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-family="sans-serif" font-size="11" fill="#6B7280">${val}</text>`;
  }

  // Build points
  const points = data.map((d, i) => {
    const x = padding.left + step * i;
    const y = padding.top + chartH - (d.value / maxVal) * chartH;
    return { x, y, ...d };
  });

  // Area fill
  const areaPath = `M${points[0].x},${padding.top + chartH} ${points.map((p) => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},${padding.top + chartH} Z`;
  svg += `<path d="${areaPath}" fill="#D97706" fill-opacity="0.1"/>`;

  // Line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  svg += `<path d="${linePath}" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linejoin="round"/>`;

  // Dots + labels
  points.forEach((p) => {
    svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#D97706" stroke="#fff" stroke-width="2"/>`;
    svg += `<text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#374151">${p.value}</text>`;
    svg += `<text x="${p.x}" y="${padding.top + chartH + 20}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6B7280">${escapeXml(p.label)}</text>`;
  });

  // Axes
  svg += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="#9CA3AF" stroke-width="1"/>`;
  svg += `<line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="#9CA3AF" stroke-width="1"/>`;

  svg += '</svg>';
  return svg;
}

// ── Pie Chart ──

export function generatePieChartSvg({ title, data, width = 600, height = 380 }) {
  const cx = width * 0.35;
  const cy = (height + (title ? 30 : 0)) / 2;
  const r = Math.min(cx - 40, (height - (title ? 70 : 40)) / 2);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="background:#fff;border-radius:8px">`;

  if (title) {
    svg += `<text x="${width / 2}" y="30" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="#1A1A1A">${escapeXml(title)}</text>`;
  }

  let startAngle = -Math.PI / 2;
  data.forEach((d, i) => {
    const sliceAngle = (d.value / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const color = COLORS[i % COLORS.length];

    if (data.length === 1) {
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
    } else {
      svg += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${color}"/>`;
    }

    startAngle = endAngle;
  });

  // Legend
  const legendX = width * 0.65;
  const legendStartY = cy - (data.length * 24) / 2;
  data.forEach((d, i) => {
    const y = legendStartY + i * 24;
    const color = COLORS[i % COLORS.length];
    const pct = Math.round((d.value / total) * 100);
    svg += `<rect x="${legendX}" y="${y}" width="14" height="14" rx="3" fill="${color}"/>`;
    svg += `<text x="${legendX + 22}" y="${y + 11}" font-family="sans-serif" font-size="12" fill="#374151">${escapeXml(d.label)} (${pct}%)</text>`;
  });

  svg += '</svg>';
  return svg;
}

// ── SVG → base64 PNG ──

export function svgToBase64Png(svgString, width = 600, height = 380) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new globalThis.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x for retina
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render SVG'));
    };
    img.src = url;
  });
}
