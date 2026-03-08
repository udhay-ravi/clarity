import { useState, useCallback, useEffect, useRef } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import PrefaceScreen from './components/PrefaceScreen';
import DocumentEditor from './components/DocumentEditor';
import DocumentLibrary from './components/DocumentLibrary';
import SettingsModal from './components/SettingsModal';
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
} from './lib/storage';
import { getProvider } from './lib/ai-provider';
import { autoStartOllama } from './lib/ollama';
import { exportToPdf } from './lib/exportPdf';
import { exportToDocx } from './lib/exportDocx';

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
    if (section.body) {
      md += `${section.body}\n\n`;
    }
  }
  return md.trim();
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
  const [pendingTemplate, setPendingTemplate] = useState(null);
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
    const index = loadIndex();
    setDocsIndex(index);

    if (index.docs.length > 0) {
      setScreen('library');
    } else {
      setScreen('welcome');
    }

    // Auto-start Ollama server in Electron if provider is 'ollama'
    if (getProvider() === 'ollama' && typeof window !== 'undefined' && window.isElectron) {
      autoStartOllama().catch((err) => console.warn('Ollama auto-start failed:', err.message));
    }
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
  // Template → Editor flow
  // ---------------------------------------------------------------------------
  const handleStart = useCallback((template, input) => {
    if (template && template.preface && template.preface.length > 0) {
      setPendingTemplate({ ...template, rawInput: input });
      setScreen('preface');
    } else {
      let doc;
      if (template) {
        doc = createDocumentFromTemplate(template);
      } else {
        doc = createBlankDocument();
        if (input?.trim()) {
          doc.title = input.trim();
        }
      }
      // Persist new doc to storage immediately
      const saved = createNewDocument(doc);
      setDocument(saved);
      setDocsIndex(loadIndex());
      setScreen('editor');
    }
  }, []);

  const handlePrefaceComplete = useCallback((prefaceValues) => {
    const doc = createDocumentFromTemplate(pendingTemplate, prefaceValues);
    const saved = createNewDocument(doc);
    setDocument(saved);
    setDocsIndex(loadIndex());
    setPendingTemplate(null);
    setScreen('editor');
  }, [pendingTemplate]);

  const handlePrefaceBack = useCallback(() => {
    setPendingTemplate(null);
    // Go back to library if docs exist, else welcome
    const index = loadIndex();
    setScreen(index.docs.length > 0 ? 'library' : 'welcome');
  }, []);

  // ---------------------------------------------------------------------------
  // Library interactions
  // ---------------------------------------------------------------------------
  const handleOpenDoc = useCallback((id) => {
    const doc = loadDocument(id);
    if (doc) {
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

  const settingsOverlay = showSettings ? <SettingsModal onClose={handleCloseSettings} /> : null;

  if (screen === 'library') {
    return (
      <>
        <DocumentLibrary
          docs={docsIndex?.docs || []}
          onOpenDoc={handleOpenDoc}
          onNewDoc={handleNewDocFromLibrary}
          onDeleteDoc={handleDeleteDoc}
          onOpenSettings={handleOpenSettings}
        />
        {settingsOverlay}
      </>
    );
  }

  if (screen === 'welcome') {
    return (
      <>
        <WelcomeScreen onStart={handleStart} onOpenSettings={handleOpenSettings} />
        {settingsOverlay}
      </>
    );
  }

  if (screen === 'preface' && pendingTemplate) {
    return (
      <PrefaceScreen
        template={pendingTemplate}
        onComplete={handlePrefaceComplete}
        onBack={handlePrefaceBack}
      />
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
          onNewDoc={handleNewDoc}
          onGoToLibrary={handleGoToLibrary}
          onOpenSettings={handleOpenSettings}
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
