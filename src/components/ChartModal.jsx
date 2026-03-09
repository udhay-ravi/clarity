import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  generateBarChartSvg,
  generateLineChartSvg,
  generatePieChartSvg,
  svgToBase64Png,
} from '../lib/chartSvg';

const CHART_TYPES = [
  { id: 'bar', label: 'Bar' },
  { id: 'line', label: 'Line' },
  { id: 'pie', label: 'Pie' },
];

const DEFAULT_DATA = [
  { label: 'Q1', value: 40 },
  { label: 'Q2', value: 65 },
  { label: 'Q3', value: 50 },
  { label: 'Q4', value: 80 },
];

export default function ChartModal({ onInsert, onClose }) {
  const [chartType, setChartType] = useState('bar');
  const [title, setTitle] = useState('');
  const [data, setData] = useState(DEFAULT_DATA);
  const [previewSvg, setPreviewSvg] = useState('');
  const [inserting, setInserting] = useState(false);
  const previewRef = useRef(null);

  // Generate preview SVG
  useEffect(() => {
    const validData = data.filter((d) => d.label.trim() && d.value > 0);
    if (validData.length === 0) {
      setPreviewSvg('');
      return;
    }

    const generators = {
      bar: generateBarChartSvg,
      line: generateLineChartSvg,
      pie: generatePieChartSvg,
    };

    const svg = generators[chartType]({ title: title.trim(), data: validData });
    setPreviewSvg(svg);
  }, [chartType, title, data]);

  const updateRow = useCallback((index, field, value) => {
    setData((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: field === 'value' ? Number(value) || 0 : value } : row
      )
    );
  }, []);

  const addRow = useCallback(() => {
    setData((prev) => [...prev, { label: '', value: 0 }]);
  }, []);

  const removeRow = useCallback(
    (index) => {
      if (data.length <= 1) return;
      setData((prev) => prev.filter((_, i) => i !== index));
    },
    [data.length]
  );

  const handleInsert = async () => {
    const validData = data.filter((d) => d.label.trim() && d.value > 0);
    if (validData.length === 0) return;

    setInserting(true);
    try {
      const generators = {
        bar: generateBarChartSvg,
        line: generateLineChartSvg,
        pie: generatePieChartSvg,
      };
      const svg = generators[chartType]({ title: title.trim(), data: validData });
      const pngDataUrl = await svgToBase64Png(svg);
      onInsert(pngDataUrl);
      onClose();
    } catch (err) {
      console.warn('Chart insert failed:', err.message);
      setInserting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold font-[var(--font-ui)] text-text">Insert Chart</h3>
          <button onClick={onClose} className="p-1 text-ghost hover:text-text transition-colors cursor-pointer rounded-md hover:bg-sidebar-bg">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Chart type */}
          <div className="flex items-center gap-2">
            {CHART_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setChartType(t.id)}
                className={`px-3 py-1.5 text-xs font-medium font-[var(--font-ui)] rounded-md transition-colors cursor-pointer ${
                  chartType === t.id
                    ? 'bg-amber text-white'
                    : 'bg-sidebar-bg text-ghost hover:text-text'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chart title (optional)"
            className="w-full px-3 py-2 text-sm font-[var(--font-ui)] text-text bg-bg border border-border rounded-lg outline-none focus:border-amber transition-colors placeholder:text-ghost/50"
          />

          {/* Data rows */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-semibold font-[var(--font-ui)] uppercase tracking-wider text-ghost">
              <span className="flex-1">Label</span>
              <span className="w-24">Value</span>
              <span className="w-8" />
            </div>
            {data.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateRow(i, 'label', e.target.value)}
                  placeholder={`Item ${i + 1}`}
                  className="flex-1 px-2.5 py-1.5 text-sm font-[var(--font-ui)] text-text bg-bg border border-border rounded-md outline-none focus:border-amber transition-colors placeholder:text-ghost/50"
                />
                <input
                  type="number"
                  value={row.value || ''}
                  onChange={(e) => updateRow(i, 'value', e.target.value)}
                  placeholder="0"
                  className="w-24 px-2.5 py-1.5 text-sm font-[var(--font-ui)] text-text bg-bg border border-border rounded-md outline-none focus:border-amber transition-colors placeholder:text-ghost/50"
                />
                <button
                  onClick={() => removeRow(i)}
                  disabled={data.length <= 1}
                  className="p-1 text-ghost hover:text-red-500 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={addRow}
              className="flex items-center gap-1 text-xs font-[var(--font-ui)] text-ghost hover:text-amber transition-colors cursor-pointer"
            >
              <Plus size={12} /> Add row
            </button>
          </div>

          {/* Preview */}
          {previewSvg && (
            <div className="border border-border rounded-lg p-3 bg-bg">
              <p className="text-[10px] font-[var(--font-ui)] text-ghost uppercase tracking-wider mb-2">Preview</p>
              <div
                ref={previewRef}
                className="flex justify-center"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-[var(--font-ui)] font-medium text-ghost hover:text-text transition-colors cursor-pointer rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={inserting || data.filter((d) => d.label.trim() && d.value > 0).length === 0}
            className="px-4 py-2 text-sm font-[var(--font-ui)] font-semibold bg-amber text-white rounded-lg hover:bg-amber/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inserting ? 'Inserting...' : 'Insert Chart'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
