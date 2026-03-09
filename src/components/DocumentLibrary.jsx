import { useState } from 'react';
import { PenLine, FilePlus, Trash2, FileText, Clock, Type, Settings } from 'lucide-react';

function formatRelativeDate(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function typeBadge(type) {
  const map = {
    onePager: { label: 'One-Pager', color: 'bg-blue-50 text-blue-600' },
    prd: { label: 'PRD', color: 'bg-purple-50 text-purple-600' },
    launchBrief: { label: 'Launch Brief', color: 'bg-orange-50 text-orange-600' },
    competitiveAnalysis: { label: 'Comp Analysis', color: 'bg-teal-50 text-teal-600' },
    strategyDoc: { label: 'Strategy', color: 'bg-green-50 text-green-600' },
    retrospective: { label: 'Retro', color: 'bg-rose-50 text-rose-600' },
    blank: { label: 'Blank', color: 'bg-gray-50 text-gray-500' },
  };
  const info = map[type] || map.blank;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-[var(--font-ui)] uppercase tracking-wider ${info.color}`}
    >
      {info.label}
    </span>
  );
}

export default function DocumentLibrary({ docs, onOpenDoc, onNewDoc, onDeleteDoc, onOpenSettings, onGoToLanding }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const sorted = [...docs].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12">
      {/* Logo */}
      <div className="w-full max-w-2xl mb-6">
        <button
          onClick={onGoToLanding}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
          title="Back to Home"
        >
          <PenLine className="w-5 h-5 text-amber" />
          <span className="text-sm font-bold font-[var(--font-ui)] text-text tracking-tight">Clarity</span>
        </button>
      </div>

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-ui)] text-text">My Documents</h1>
          <p className="text-sm font-[var(--font-ui)] text-ghost mt-1">
            {docs.length} {docs.length === 1 ? 'document' : 'documents'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2.5 text-ghost hover:text-text hover:bg-sidebar-bg rounded-lg transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={onNewDoc}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber text-white font-[var(--font-ui)] font-medium text-sm rounded-lg hover:bg-amber/90 transition-colors cursor-pointer"
          >
            <FilePlus size={16} />
            New Document
          </button>
        </div>
      </div>

      {/* Doc list */}
      <div className="w-full max-w-2xl space-y-2">
        {sorted.length === 0 && (
          <div className="text-center py-16">
            <FileText size={40} className="mx-auto text-ghost/30 mb-4" />
            <p className="text-sm font-[var(--font-ui)] text-ghost">
              No documents yet. Create your first one!
            </p>
          </div>
        )}

        {sorted.map((doc) => (
          <div
            key={doc.id}
            className="group flex items-center gap-4 p-4 bg-surface rounded-lg border border-border hover:border-amber/40 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => onOpenDoc(doc.id)}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-amber-light/40 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-amber" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold font-[var(--font-ui)] text-text truncate">
                  {doc.title || 'Untitled'}
                </span>
                {typeBadge(doc.type)}
              </div>
              <div className="flex items-center gap-3 text-[11px] font-[var(--font-ui)] text-ghost">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatRelativeDate(doc.updatedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Type size={11} />
                  {doc.wordCount || 0} words
                </span>
              </div>
            </div>

            {/* Delete */}
            <div
              className="shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {confirmDeleteId === doc.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onDeleteDoc(doc.id);
                      setConfirmDeleteId(null);
                    }}
                    className="px-2.5 py-1 text-[11px] font-[var(--font-ui)] font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-2.5 py-1 text-[11px] font-[var(--font-ui)] font-medium text-ghost bg-sidebar-bg rounded hover:bg-border transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(doc.id)}
                  className="p-1.5 text-ghost/40 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete document"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
