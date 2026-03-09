import { useState, useCallback, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import WelcomeScreen from './components/WelcomeScreen';
import DocumentEditor from './components/DocumentEditor';
import DocumentLibrary from './components/DocumentLibrary';
import SettingsModal, { applyEditorPrefs, getEditorPrefs } from './components/SettingsModal';
import { useCoaching } from './hooks/useCoaching';
import { useReadability } from './hooks/useReadability';
import { createDocumentFromTemplate, createBlankDocument } from './lib/templates';
import {
  migrateIfNeeded,
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
} from './lib/storage';
import { getProvider } from './lib/ai-provider';
import { autoStartOllama } from './lib/ollama';
import { exportToPdf } from './lib/exportPdf';
import { exportToDocx } from './lib/exportDocx';
import { migrateSections } from './lib/contentModel';
import { walkTipTapContent } from './lib/tipTapWalker';

const AUTOSAVE_INTERVAL = 10000;

function exportToMarkdown(doc) {
  let md = `# ${doc.title}\n\n`;
  // Include preface context
  if (doc.preface) {
    for (const field of Object.values(doc.preface)) {
      if (field.value?.trim()) {
        md += `**${field.label}:** ${field.value}\n\n`;
      }
    }
  }
  for (const section of doc.sections) {
    if (section.title) {
      md += `## ${section.title}\n\n`;
    }
    // Rich content path
    if (section.content && section.content.content) {
      md += sectionContentToMarkdown(section.content);
    } else if (section.body) {
      md += `${section.body}\n\n`;
    }
  }
  return md.trim();
}

function sectionContentToMarkdown(content) {
  let md = '';
  walkTipTapContent(content, {
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

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [document, setDocument] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [docsIndex, setDocsIndex] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const handleOpenSettings = useCallback(() => setShowSettings(true), []);
  const handleCloseSettings = useCallback(() => setShowSettings(false), []);

  const { nudges, evaluate, dismissNudge, trackSectionVisit, clearSectionTimer } = useCoaching();
  const { grade: readabilityGrade, feedback: readabilityFeedback, compute: computeReadability } = useReadability();
  const autoSaveTimer = useRef(null);
  const saveStatusTimer = useRef(null);

  // ---------------------------------------------------------------------------
  // Init: migrate legacy draft, load index, decide first screen
  // ---------------------------------------------------------------------------
  useEffect(() => {
    migrateIfNeeded();
    applyEditorPrefs(); // Load saved font/size/spacing preferences
    const index = loadIndex();
    setDocsIndex(index);
    setProjects(loadProjects());

    if (index.docs.length > 0) {
      setScreen('library');
    } else {
      setScreen('landing');
    }

    // Auto-start Ollama server in Electron if provider is 'ollama'
    if (getProvider() === 'ollama' && typeof window !== 'undefined' && window.isElectron) {
      autoStartOllama().catch((err) => console.warn('Ollama auto-start failed:', err.message));
    }

    // Listen for system theme changes when in 'system' mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      const p = getEditorPrefs();
      if (p.theme === 'system') applyEditorPrefs(p);
    };
    mql.addEventListener('change', handleThemeChange);
    return () => mql.removeEventListener('change', handleThemeChange);
  }, []);

  // ---------------------------------------------------------------------------
  // Manual save helper (reused by auto-save + Cmd+S)
  // ---------------------------------------------------------------------------
  const handleSave = useCallback(() => {
    if (!document) return;
    saveDocument(document);
    setDocsIndex(loadIndex());
    setSaveStatus('saved');
    if (saveStatusTimer.current) clearTimeout(saveStatusTimer.current);
    saveStatusTimer.current = setTimeout(() => setSaveStatus(null), 2500);
  }, [document]);

  // ---------------------------------------------------------------------------
  // Auto-save every 10 seconds
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (screen !== 'editor' || !document) return;

    autoSaveTimer.current = setInterval(() => {
      handleSave();
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [screen, document, handleSave]);

  // ---------------------------------------------------------------------------
  // Evaluate coaching nudges + readability when document changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (document?.sections) {
      evaluate(document.sections, readabilityGrade);
      const allText = document.sections.map((s) => s.body).join(' ');
      computeReadability(allText);
    }
  }, [document, evaluate, readabilityGrade, computeReadability]);

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+Enter → add new section
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && screen === 'editor') {
        e.preventDefault();
        setDocument((prev) => ({
          ...prev,
          sections: [
            ...prev.sections,
            {
              id: crypto.randomUUID(),
              title: '',
              body: '',
              placeholder: 'Start writing...',
            },
          ],
        }));
      }

      // Cmd+S → manual save
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && screen === 'editor') {
        e.preventDefault();
        handleSave();
      }

      // Cmd+Shift+E → export markdown
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'e' && screen === 'editor' && document) {
        e.preventDefault();
        downloadMarkdown(document);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, document, handleSave]);

  // ---------------------------------------------------------------------------
  // Template → Editor flow (unified — no separate preface screen)
  // ---------------------------------------------------------------------------
  const handleStart = useCallback((template, input, prefaceValues = {}) => {
    let doc;
    if (template) {
      doc = createDocumentFromTemplate(template, prefaceValues);
    } else {
      doc = createBlankDocument();
      if (input?.trim()) {
        doc.title = input.trim();
      }
    }
    const saved = createNewDocument(doc);
    setDocument(saved);
    setDocsIndex(loadIndex());
    setScreen('editor');
  }, []);

  // ---------------------------------------------------------------------------
  // Project interactions
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Library interactions
  // ---------------------------------------------------------------------------
  const handleOpenDoc = useCallback((id) => {
    const doc = loadDocument(id);
    if (doc) {
      // Migrate sections to include TipTap content field if missing
      doc.sections = migrateSections(doc.sections);
      setActiveDocId(id);
      setDocument(doc);
      setScreen('editor');
    }
  }, []);

  const handleDeleteDoc = useCallback((id) => {
    const updatedIndex = deleteDocument(id);
    setDocsIndex(updatedIndex);
    // If we deleted the currently open doc, clear it
    if (document?.id === id) {
      setDocument(null);
    }
  }, [document]);

  const handleGoToLanding = useCallback(() => {
    if (document) {
      saveDocument(document);
    }
    setDocsIndex(loadIndex());
    setDocument(null);
    setScreen('landing');
  }, [document]);

  const handleGoToLibrary = useCallback(() => {
    // Save current doc before leaving
    if (document) {
      saveDocument(document);
    }
    setDocsIndex(loadIndex());
    setDocument(null);
    setScreen('library');
  }, [document]);

  const handleNewDocFromLibrary = useCallback(() => {
    setScreen('welcome');
  }, []);

  // ---------------------------------------------------------------------------
  // Editor interactions
  // ---------------------------------------------------------------------------
  const handleDocumentChange = useCallback((updatedDoc) => {
    setDocument(updatedDoc);
  }, []);

  const handleNewDoc = useCallback(() => {
    if (document) {
      saveDocument(document);
    }
    setDocsIndex(loadIndex());
    setDocument(null);
    setScreen('welcome');
  }, [document]);

  // ---------------------------------------------------------------------------
  // Export handlers
  // ---------------------------------------------------------------------------
  const handleExportMarkdown = useCallback(() => {
    if (document) downloadMarkdown(document);
  }, [document]);

  const handleExportPdf = useCallback(() => {
    if (document) exportToPdf(document);
  }, [document]);

  const handleExportDocx = useCallback(() => {
    if (document) exportToDocx(document);
  }, [document]);

  const handleExportAll = useCallback(() => {
    if (!document) return;
    downloadMarkdown(document);
    setTimeout(() => exportToPdf(document), 200);
    setTimeout(() => exportToDocx(document), 400);
  }, [document]);

  const handleOpenInGoogleDocs = useCallback(() => {
    if (!document) return;
    // Build HTML content for clipboard
    let html = `<h1>${document.title || 'Untitled'}</h1>`;
    if (document.preface) {
      for (const field of Object.values(document.preface)) {
        if (field.value?.trim()) {
          html += `<p><strong>${field.label}:</strong> ${field.value}</p>`;
        }
      }
    }
    for (const section of document.sections) {
      if (section.title) html += `<h2>${section.title}</h2>`;
      if (section.body) {
        const paragraphs = section.body.split('\n').filter(Boolean);
        for (const p of paragraphs) {
          html += `<p>${p}</p>`;
        }
      }
    }
    // Copy as rich text to clipboard
    const blob = new Blob([html], { type: 'text/html' });
    const plainText = exportToMarkdown(document);
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      }),
    ]).then(() => {
      window.open('https://docs.google.com/document/create', '_blank');
    });
  }, [document]);

  const handleSectionFocus = useCallback(
    (sectionId) => {
      trackSectionVisit(sectionId);
      const section = document?.sections.find((s) => s.id === sectionId);
      if (section && section.body.trim().length > 0) {
        clearSectionTimer(sectionId);
      }
    },
    [document, trackSectionVisit, clearSectionTimer]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (screen === 'loading') return null;

  if (screen === 'landing') {
    return <LandingPage onGetStarted={() => {
      const index = loadIndex();
      setScreen(index.docs.length > 0 ? 'library' : 'welcome');
    }} />;
  }

  const settingsOverlay = showSettings ? <SettingsModal onClose={handleCloseSettings} /> : null;

  if (screen === 'library') {
    return (
      <>
        <DocumentLibrary
          docs={docsIndex?.docs || []}
          projects={projects}
          onOpenDoc={handleOpenDoc}
          onNewDoc={handleNewDocFromLibrary}
          onDeleteDoc={handleDeleteDoc}
          onOpenSettings={handleOpenSettings}
          onGoToLanding={handleGoToLanding}
          onCreateProject={handleCreateProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onAssignDocToProject={handleAssignDocToProject}
        />
        {settingsOverlay}
      </>
    );
  }

  if (screen === 'welcome') {
    return (
      <>
        <WelcomeScreen onStart={handleStart} onOpenSettings={handleOpenSettings} onGoToLanding={handleGoToLanding} />
        {settingsOverlay}
      </>
    );
  }

  if (screen === 'editor' && document) {
    return (
      <>
        <DocumentEditor
          document={document}
          onDocumentChange={handleDocumentChange}
          nudges={nudges}
          onDismissNudge={dismissNudge}
          onSectionFocus={handleSectionFocus}
          onExportMarkdown={handleExportMarkdown}
          onExportPdf={handleExportPdf}
          onExportDocx={handleExportDocx}
          onExportAll={handleExportAll}
          onOpenInGoogleDocs={handleOpenInGoogleDocs}
          onNewDoc={handleNewDoc}
          onGoToLibrary={handleGoToLibrary}
          onGoToLanding={handleGoToLanding}
          onOpenSettings={handleOpenSettings}
          onSignOut={null}
          user={null}
          saveStatus={saveStatus}
          readabilityGrade={readabilityGrade}
          readabilityFeedback={readabilityFeedback}
        />
        {settingsOverlay}
      </>
    );
  }

  return null;
}
