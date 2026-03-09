import { useState, useRef, useEffect } from 'react';
import { PenLine, FilePlus, Check, Library, Settings, LogOut } from 'lucide-react';
import ExportMenu from './ExportMenu';
import ThemeToggle from './ThemeToggle';

export default function Toolbar({
  document,
  onTitleChange,
  onExportMarkdown,
  onExportPdf,
  onExportDocx,
  onExportAll,
  onOpenInGoogleDocs,
  onNewDoc,
  onGoToLibrary,
  onGoToLanding,
  onOpenSettings,
  onSignOut,
  user,
  saveStatus,
  readabilityGrade,
  readabilityFeedback,
}) {
  const titleRef = useRef(null);

  const wordCount = document.sections.reduce((count, s) => {
    const words = s.body.split(/\s+/).filter(Boolean).length;
    return count + words;
  }, 0);

  const handleTitleInput = () => {
    const text = titleRef.current?.innerText || '';
    onTitleChange(text);
  };

  return (
    <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-1.5 shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
            title="Back to Home"
          >
            <PenLine className="w-5 h-5 text-amber" />
            <span className="text-sm font-bold font-[var(--font-ui)] text-text tracking-tight">Clarity</span>
          </button>
          <div className="w-px h-5 bg-border shrink-0" />
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleTitleInput}
            data-placeholder="Untitled Document"
            className="text-lg font-semibold font-[var(--font-ui)] text-text outline-none min-w-[120px]"
          >
            {document.title}
          </div>

          <div className="flex items-center gap-2 text-xs font-[var(--font-ui)] text-ghost">
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            {readabilityGrade !== null && readabilityGrade !== undefined && readabilityFeedback && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${readabilityFeedback.color} ${readabilityFeedback.bgColor}`}
                title={`Flesch-Kincaid Grade Level: ${readabilityGrade}. Target: 14 (college sophomore).`}
              >
                Grade {readabilityGrade} — {readabilityFeedback.label}
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-green-600 animate-fade-save">
                <Check size={12} /> Saved
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportMenu
            onExportMarkdown={onExportMarkdown}
            onExportPdf={onExportPdf}
            onExportDocx={onExportDocx}
            onExportAll={onExportAll}
            onOpenInGoogleDocs={onOpenInGoogleDocs}
          />
          <button
            onClick={onNewDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-[var(--font-ui)] text-text/70 hover:text-text hover:bg-surface rounded-md transition-colors cursor-pointer"
            title="New Document"
          >
            <FilePlus size={16} />
            New
          </button>
          <button
            onClick={onGoToLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-[var(--font-ui)] text-text/70 hover:text-text hover:bg-surface rounded-md transition-colors cursor-pointer"
            title="My Documents"
          >
            <Library size={16} />
            My Docs
          </button>
          <ThemeToggle />
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-[var(--font-ui)] text-text/70 hover:text-text hover:bg-surface rounded-md transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          {onSignOut && user && (
            <>
              <div className="w-px h-5 bg-border shrink-0" />
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-6 h-6 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber/20 flex items-center justify-center text-[10px] font-bold font-[var(--font-ui)] text-amber">
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={onSignOut}
                className="p-1.5 text-ghost hover:text-text transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSave {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-save {
          animation: fadeSave 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
