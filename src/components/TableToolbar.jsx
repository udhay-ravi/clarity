import { Plus, Minus, Trash2 } from 'lucide-react';

export default function TableToolbar({ editor }) {
  if (!editor) return null;

  const btnClass =
    'flex items-center gap-1 px-2 py-1 text-[11px] font-[var(--font-ui)] text-ghost hover:text-amber hover:bg-amber-light/30 rounded transition-colors cursor-pointer';

  return (
    <div className="flex items-center gap-0.5 flex-wrap py-1.5">
      <button
        type="button"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className={btnClass}
        title="Add row below"
      >
        <Plus size={12} /> Row
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className={btnClass}
        title="Add column right"
      >
        <Plus size={12} /> Column
      </button>
      <span className="w-px h-4 bg-border mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteRow().run()}
        className={btnClass}
        title="Delete row"
      >
        <Minus size={12} /> Row
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className={btnClass}
        title="Delete column"
      >
        <Minus size={12} /> Column
      </button>
      <span className="w-px h-4 bg-border mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="flex items-center gap-1 px-2 py-1 text-[11px] font-[var(--font-ui)] text-ghost hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
        title="Delete table"
      >
        <Trash2 size={12} /> Table
      </button>
    </div>
  );
}
