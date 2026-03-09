import { useState, useRef, useEffect } from 'react';
import { FileDown, ChevronDown, FileText, FileType, File } from 'lucide-react';

function GoogleDocsIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

export default function ExportMenu({
  onExportMarkdown,
  onExportPdf,
  onExportDocx,
  onExportAll,
  onOpenInGoogleDocs,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  const items = [
    { label: 'Markdown (.md)', icon: FileText, action: onExportMarkdown },
    { label: 'PDF (.pdf)', icon: File, action: onExportPdf },
    { label: 'Word (.docx)', icon: FileType, action: onExportDocx },
    { type: 'separator' },
    { label: 'Open in Google Docs', icon: GoogleDocsIcon, action: onOpenInGoogleDocs, highlight: true },
    { type: 'separator' },
    { label: 'Export All (3 files)', icon: FileDown, action: onExportAll },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-[var(--font-ui)] text-text/70 hover:text-text hover:bg-surface rounded-md transition-colors cursor-pointer"
        title="Export document"
      >
        <FileDown size={16} />
        Export
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-surface rounded-lg border border-border shadow-lg py-1 z-50 animate-nudge-in">
          {items.map((item, i) =>
            item.type === 'separator' ? (
              <hr key={i} className="my-1 border-border" />
            ) : (
              <button
                key={i}
                onClick={() => {
                  item.action?.();
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-[var(--font-ui)] transition-colors cursor-pointer text-left ${
                  item.highlight
                    ? 'text-amber font-medium hover:bg-amber-light/40'
                    : 'text-text/80 hover:bg-sidebar-bg hover:text-text'
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
