import { useState, useEffect, useCallback } from 'react';
import { compressImageToDataUrl } from '../lib/imageUtils';

/**
 * Formatting toolbar for the TipTap editor.
 * Inspired by Apple Notes — grouped icon buttons with active state highlighting.
 */
export default function EditorToolbar({ editor }) {
  const [, rerender] = useState(0);

  // Re-render on selection/transaction changes to update active states
  useEffect(() => {
    if (!editor) return;
    const update = () => rerender((n) => n + 1);
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  const handleInsertImage = useCallback(() => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const dataUrl = await compressImageToDataUrl(file);
      editor.chain().focus().setImage({ src: dataUrl }).run();
    };
    input.click();
  }, [editor]);

  const handleInsertTable = useCallback(() => {
    if (!editor) return;
    if (editor.isActive('table')) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-1 py-1 border-b border-border bg-surface/60 backdrop-blur-sm font-[var(--font-ui)]">
      {/* Text formatting */}
      <ToolBtn
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (&#8984;B)"
      >
        <span className="font-bold text-[13px]">B</span>
      </ToolBtn>
      <ToolBtn
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (&#8984;I)"
      >
        <span className="italic text-[13px] font-serif">I</span>
      </ToolBtn>
      <ToolBtn
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough (&#8984;&#8679;X)"
      >
        <span className="line-through text-[13px]">S</span>
      </ToolBtn>

      <Sep />

      {/* Headings */}
      <ToolBtn
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <span className="font-semibold text-[11px] tracking-tight">H2</span>
      </ToolBtn>
      <ToolBtn
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <span className="font-semibold text-[11px] tracking-tight">H3</span>
      </ToolBtn>

      <Sep />

      {/* Lists & quote */}
      <ToolBtn
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <BulletListIcon />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <OrderedListIcon />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Block Quote"
      >
        <BlockquoteIcon />
      </ToolBtn>

      <Sep />

      {/* Code & rule */}
      <ToolBtn
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
      >
        <CodeInlineIcon />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        <CodeBlockIcon />
      </ToolBtn>
      <ToolBtn
        active={false}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <HrIcon />
      </ToolBtn>

      <Sep />

      {/* Insert */}
      <ToolBtn active={false} onClick={handleInsertImage} title="Insert Image">
        <ImageIcon />
      </ToolBtn>
      <ToolBtn
        active={editor.isActive('table')}
        onClick={handleInsertTable}
        title="Insert Table"
      >
        <TableIcon />
      </ToolBtn>
    </div>
  );
}

// ── Reusable button ──

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // prevent editor blur
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
        active
          ? 'bg-amber/15 text-amber'
          : 'text-ghost hover:bg-amber/10 hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-border mx-0.5 shrink-0" />;
}

// ── SVG Icons (16x16) ──

function BulletListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="3" cy="4" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3" cy="8" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <line x1="6.5" y1="4" x2="14" y2="4" />
      <line x1="6.5" y1="8" x2="14" y2="8" />
      <line x1="6.5" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <text x="1" y="5.5" fontSize="5.5" fontFamily="system-ui, sans-serif" fontWeight="700" stroke="none">1</text>
      <text x="1" y="9.5" fontSize="5.5" fontFamily="system-ui, sans-serif" fontWeight="700" stroke="none">2</text>
      <text x="1" y="13.5" fontSize="5.5" fontFamily="system-ui, sans-serif" fontWeight="700" stroke="none">3</text>
      <line x1="6.5" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6.5" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6.5" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BlockquoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeLinecap="round">
      <line x1="3" y1="3" x2="3" y2="13" strokeWidth="2.5" opacity="0.7" />
      <line x1="6.5" y1="5" x2="14" y2="5" strokeWidth="1.5" />
      <line x1="6.5" y1="8" x2="12" y2="8" strokeWidth="1.5" />
      <line x1="6.5" y1="11" x2="10" y2="11" strokeWidth="1.5" />
    </svg>
  );
}

function CodeInlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5,4 1.5,8 5,12" />
      <polyline points="11,4 14.5,8 11,12" />
    </svg>
  );
}

function CodeBlockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1.5" width="14" height="13" rx="2" />
      <polyline points="5.5,5.5 3.5,8 5.5,10.5" />
      <polyline points="10.5,5.5 12.5,8 10.5,10.5" />
    </svg>
  );
}

function HrIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="1" y1="8" x2="5" y2="8" />
      <line x1="7" y1="8" x2="9" y2="8" />
      <line x1="11" y1="8" x2="15" y2="8" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="13" height="11" rx="2" />
      <circle cx="5.5" cy="6" r="1.5" />
      <path d="M14.5 11l-3.5-4-3 3.5-1.5-1.5L1.5 13" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2" width="13" height="12" rx="2" />
      <line x1="1.5" y1="6" x2="14.5" y2="6" />
      <line x1="1.5" y1="10" x2="14.5" y2="10" />
      <line x1="6" y1="2" x2="6" y2="14" />
      <line x1="10.5" y1="2" x2="10.5" y2="14" />
    </svg>
  );
}
