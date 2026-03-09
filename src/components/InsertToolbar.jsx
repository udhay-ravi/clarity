import { useRef } from 'react';
import { ImagePlus, Table2, BarChart3 } from 'lucide-react';
import { compressImageToDataUrl } from '../lib/imageUtils';

export default function InsertToolbar({ editor, onOpenChart }) {
  const fileInputRef = useRef(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      editor.chain().focus().setImage({ src: dataUrl }).run();
    } catch (err) {
      console.warn('Image insert failed:', err.message);
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleInsertTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const btnClass =
    'p-1.5 text-ghost hover:text-amber hover:bg-amber-light/30 rounded transition-colors cursor-pointer';

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity mb-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={btnClass}
        title="Insert image"
      >
        <ImagePlus size={15} />
      </button>
      <button
        type="button"
        onClick={handleInsertTable}
        className={btnClass}
        title="Insert table"
      >
        <Table2 size={15} />
      </button>
      <button
        type="button"
        onClick={onOpenChart}
        className={btnClass}
        title="Insert chart"
      >
        <BarChart3 size={15} />
      </button>
    </div>
  );
}
