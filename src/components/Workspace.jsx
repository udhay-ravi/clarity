import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import NotesSidebar from './NotesSidebar';
import NoteEditor from './NoteEditor';
import AiCoachPane from './AiCoachPane';
import WorkspaceToolbar from './WorkspaceToolbar';
import SettingsModal, { applyEditorPrefs, getEditorPrefs } from './SettingsModal';
import { useReadability } from '../hooks/useReadability';
import {
  loadIndex,
  saveDocument,
  loadDocument,
  deleteDocument,
  createNewDocument,
  setActiveDocId,
  loadProjects,
  createProject,
  renameProject as renameProjectStorage,
  deleteProject as deleteProjectStorage,
  assignDocToProject as assignDocToProjectStorage,
  createBlankNote,
} from '../lib/storage';
import { tipTapDocToText } from '../lib/contentModel';
import { getProvider } from '../lib/ai-provider';
import { autoStartOllama } from '../lib/ollama';
import { exportToPdf } from '../lib/exportPdf';
import { exportToDocx } from '../lib/exportDocx';
import { walkTipTapContent } from '../lib/tipTapWalker';
import { TEMPLATES } from '../lib/templates';

const AUTOSAVE_INTERVAL = 10000;

// ── Markdown export (adapted for single-body format) ──
function exportToMarkdown(doc) {
  let md = `# ${doc.title}\n\n`;
  if (doc.content && doc.content.content) {
    md += contentToMarkdown(doc.content);
  } else if (doc.body) {
    md += doc.body;
  }
  return md.trim();
}

function contentToMarkdown(content) {
  let md = '';
  walkTipTapContent(content, {
    heading(text, level) {
      md += `${'#'.repeat(level)} ${text}\n\n`;
    },
    paragraph(runs) {
      const line = runs
        .map((r) => {
          let t = r.text;
          if (r.bold) t = `**${t}**`;
          if (r.italic) t = `*${t}*`;
          return t;
        })
        .join('');
      md += `${line}\n\n`;
    },
    image(src, alt) {
      md += `![${alt || 'image'}](${src})\n\n`;
    },
    tableStart() {},
    tableRow(cells, isHeader) {
      md += `| ${cells.join(' | ')} |\n`;
      if (isHeader) {
        md += `| ${cells.map(() => '---').join(' | ')} |\n`;
      }
    },
    tableEnd() {
      md += '\n';
    },
  });
  return md;
}

function downloadMarkdown(doc) {
  const md = exportToMarkdown(doc);
  const date = new Date().toISOString().split('T')[0];
  const filename = `${(doc.title || 'untitled').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${date}.md`;
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Workspace({ user, authEnabled, onSignOut, onGoToLanding }) {
  // ── State ──
  const [docsIndex, setDocsIndex] = useState(() => loadIndex());
  const [projects, setProjects] = useState(() => loadProjects());
  const [activeDoc, setActiveDoc] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [coachPaneVisible, setCoachPaneVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentHeading, setCurrentHeading] = useState(null);
  const [cursorInfo, setCursorInfo] = useState(null);

  const { grade: readabilityGrade, feedback: readabilityFeedback, compute: computeReadability } = useReadability();
  const autoSaveTimer = useRef(null);
  const saveStatusTimer = useRef(null);
  const editorRef = useRef(null);

  // ── One-time init ──
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    applyEditorPrefs();
    if (getProvider() === 'ollama' && typeof window !== 'undefined' && window.isElectron) {
      autoStartOllama().catch((err) => console.warn('Ollama auto-start failed:', err.message));
    }
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      const p = getEditorPrefs();
      if (p.theme === 'system') applyEditorPrefs(p);
    };
    mql.addEventListener('change', handleThemeChange);
  }, []);

  // ── Word count ──
  const wordCount = useMemo(() => {
    if (!activeDoc?.body) return 0;
    return activeDoc.body.split(/\s+/).filter(Boolean).length;
  }, [activeDoc?.body]);

  // ── Save ──
  const handleSave = useCallback(() => {
    if (!activeDoc) return;
    saveDocument(activeDoc);
    setDocsIndex(loadIndex());
    setSaveStatus('saved');
    if (saveStatusTimer.current) clearTimeout(saveStatusTimer.current);
    saveStatusTimer.current = setTimeout(() => setSaveStatus(null), 2500);
  }, [activeDoc]);

  // ── Auto-save ──
  useEffect(() => {
    if (!activeDoc) return;
    autoSaveTimer.current = setInterval(() => handleSave(), AUTOSAVE_INTERVAL);
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current); };
  }, [activeDoc, handleSave]);

  // ── Readability ──
  useEffect(() => {
    if (activeDoc?.body) computeReadability(activeDoc.body);
  }, [activeDoc?.body, computeReadability]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'e' && activeDoc) {
        e.preventDefault();
        downloadMarkdown(activeDoc);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarCollapsed((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDoc, handleSave]);

  // ── Note CRUD ──
  const handleNewNote = useCallback(() => {
    if (activeDoc) saveDocument(activeDoc);
    const doc = createBlankNote();
    const saved = createNewDocument(doc);
    setActiveDoc(saved);
    setDocsIndex(loadIndex());
  }, [activeDoc]);

  const handleSelectNote = useCallback((id) => {
    if (activeDoc) saveDocument(activeDoc);
    const doc = loadDocument(id);
    if (doc) {
      setActiveDocId(id);
      setActiveDoc(doc);
    }
  }, [activeDoc]);

  const handleDeleteNote = useCallback((id) => {
    const updatedIndex = deleteDocument(id);
    setDocsIndex(updatedIndex);
    if (activeDoc?.id === id) setActiveDoc(null);
  }, [activeDoc]);

  // ── Document updates from editor ──
  const handleDocUpdate = useCallback((content, body) => {
    setActiveDoc((prev) => {
      if (!prev) return prev;
      return { ...prev, content, body };
    });
  }, []);

  const handleTitleChange = useCallback((title) => {
    setActiveDoc((prev) => {
      if (!prev) return prev;
      return { ...prev, title };
    });
  }, []);

  const handleTypeChange = useCallback((type) => {
    setActiveDoc((prev) => {
      if (!prev) return prev;
      return { ...prev, type };
    });
  }, []);

  // ── Cursor/heading tracking from editor ──
  const handleCursorChange = useCallback((info) => {
    setCurrentHeading(info?.heading || null);
    setCursorInfo(info);
  }, []);

  // ── Project CRUD ──
  const handleCreateProject = useCallback((name, color) => {
    createProject(name, color);
    setProjects(loadProjects());
  }, []);

  const handleRenameProject = useCallback((id, newName) => {
    renameProjectStorage(id, newName);
    setProjects(loadProjects());
  }, []);

  const handleDeleteProject = useCallback((id) => {
    const { projects: updated, index } = deleteProjectStorage(id);
    setProjects(updated);
    setDocsIndex(index);
  }, []);

  const handleAssignDocToProject = useCallback((docId, projectId) => {
    const updatedIndex = assignDocToProjectStorage(docId, projectId);
    setDocsIndex(updatedIndex);
  }, []);

  // ── Export handlers ──
  const handleExportMarkdown = useCallback(() => { if (activeDoc) downloadMarkdown(activeDoc); }, [activeDoc]);
  const handleExportPdf = useCallback(() => { if (activeDoc) exportToPdf(activeDoc); }, [activeDoc]);
  const handleExportDocx = useCallback(() => { if (activeDoc) exportToDocx(activeDoc); }, [activeDoc]);
  const handleExportAll = useCallback(() => {
    if (!activeDoc) return;
    downloadMarkdown(activeDoc);
    setTimeout(() => exportToPdf(activeDoc), 200);
    setTimeout(() => exportToDocx(activeDoc), 400);
  }, [activeDoc]);

  // ── Template info for current doc ──
  const templateInfo = useMemo(() => {
    if (!activeDoc?.type) return null;
    return TEMPLATES[activeDoc.type] || null;
  }, [activeDoc?.type]);

  return (
    <div className="flex flex-col h-screen bg-bg text-text font-[var(--font-ui)]">
      {/* Toolbar */}
      <WorkspaceToolbar
        title={activeDoc?.title || ''}
        type={activeDoc?.type}
        wordCount={wordCount}
        saveStatus={saveStatus}
        readabilityGrade={readabilityGrade}
        onTitleChange={handleTitleChange}
        onToggleSidebar={() => setSidebarCollapsed((p) => !p)}
        onToggleCoachPane={() => setCoachPaneVisible((p) => !p)}
        onExportMarkdown={handleExportMarkdown}
        onExportPdf={handleExportPdf}
        onExportDocx={handleExportDocx}
        onExportAll={handleExportAll}
        onOpenSettings={() => setShowSettings(true)}
        onSignOut={authEnabled ? onSignOut : null}
        user={user}
      />

      {/* 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Notes Sidebar */}
        {!sidebarCollapsed && (
          <NotesSidebar
            docs={docsIndex?.docs || []}
            projects={projects}
            activeDocId={activeDoc?.id}
            onSelectNote={handleSelectNote}
            onNewNote={handleNewNote}
            onDeleteNote={handleDeleteNote}
            onCreateProject={handleCreateProject}
            onRenameProject={handleRenameProject}
            onDeleteProject={handleDeleteProject}
            onAssignDocToProject={handleAssignDocToProject}
          />
        )}

        {/* Center: Editor */}
        <div className="flex-1 flex justify-center overflow-y-auto bg-bg">
          <NoteEditor
            ref={editorRef}
            doc={activeDoc}
            onUpdate={handleDocUpdate}
            onCursorChange={handleCursorChange}
            templateInfo={templateInfo}
          />
        </div>

        {/* Right: AI Coach Pane */}
        {coachPaneVisible && (
          <AiCoachPane
            doc={activeDoc}
            templateInfo={templateInfo}
            currentHeading={currentHeading}
            cursorInfo={cursorInfo}
            onSelectType={handleTypeChange}
            editorRef={editorRef}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-center gap-3 h-7 border-t border-border bg-sidebar-bg text-xs text-ghost font-[var(--font-ui)]">
        <span>w: {wordCount}</span>
        <span>&middot;</span>
        {saveStatus === 'saved' ? (
          <span className="text-amber">Saved &#10003;</span>
        ) : (
          <span className="opacity-50">Editing</span>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
