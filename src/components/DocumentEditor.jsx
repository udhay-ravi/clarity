import { useState, useCallback, useMemo } from 'react';
import SectionBlock from './SectionBlock';
import PrefaceEditor from './PrefaceEditor';
import CoachingNudge from './CoachingNudge';
import StructureGuide from './StructureGuide';
import Toolbar from './Toolbar';

export default function DocumentEditor({
  document,
  onDocumentChange,
  nudges,
  onDismissNudge,
  onSectionFocus,
  onExportMarkdown,
  onExportPdf,
  onExportDocx,
  onExportAll,
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
  const [focusedSectionId, setFocusedSectionId] = useState(null);
  const [clarityCheckOpenSectionId, setClarityCheckOpenSectionId] = useState(null);

  // Only one clarity panel open at a time
  const handleClarityCheckOpen = useCallback((sectionId) => {
    setClarityCheckOpenSectionId(sectionId);
  }, []);

  const handleTitleChange = useCallback(
    (title) => {
      onDocumentChange({ ...document, title });
    },
    [document, onDocumentChange]
  );

  const handleSectionUpdate = useCallback(
    (updatedSection) => {
      const sections = document.sections.map((s) =>
        s.id === updatedSection.id ? updatedSection : s
      );
      onDocumentChange({ ...document, sections });
    },
    [document, onDocumentChange]
  );

  const handleDeleteSection = useCallback(
    (sectionId) => {
      if (document.sections.length <= 1) return;
      const sections = document.sections.filter((s) => s.id !== sectionId);
      onDocumentChange({ ...document, sections });
    },
    [document, onDocumentChange]
  );

  const handleAddBelow = useCallback(
    (index) => {
      const newSection = {
        id: crypto.randomUUID(),
        title: '',
        body: '',
        placeholder: 'Start writing...',
      };
      const sections = [...document.sections];
      sections.splice(index + 1, 0, newSection);
      onDocumentChange({ ...document, sections });
    },
    [document, onDocumentChange]
  );

  const handleMoveUp = useCallback(
    (index) => {
      if (index <= 0) return;
      const sections = [...document.sections];
      [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
      onDocumentChange({ ...document, sections });
    },
    [document, onDocumentChange]
  );

  const handleMoveDown = useCallback(
    (index) => {
      if (index >= document.sections.length - 1) return;
      const sections = [...document.sections];
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      onDocumentChange({ ...document, sections });
    },
    [document, onDocumentChange]
  );

  const handlePrefaceChange = useCallback(
    (key, value) => {
      const preface = { ...document.preface };
      preface[key] = { ...preface[key], value };
      onDocumentChange({ ...document, preface });
    },
    [document, onDocumentChange]
  );

  // Track which section is focused for the sidebar Structure Guide
  const handleSectionFocusInternal = useCallback(
    (sectionId) => {
      setFocusedSectionId(sectionId);
      onSectionFocus?.(sectionId);
    },
    [onSectionFocus]
  );

  const handleSectionBlur = useCallback(() => {
    setFocusedSectionId(null);
  }, []);

  // Derive the focused section object for the sidebar
  const focusedSection = useMemo(() => {
    if (!focusedSectionId) return null;
    return document.sections.find((s) => s.id === focusedSectionId) || null;
  }, [focusedSectionId, document.sections]);

  // Check if the structure guide should show (any focused section with a template)
  const showStructureGuide = !!focusedSection;

  return (
    <div className="min-h-screen flex flex-col">
      <Toolbar
        document={document}
        onTitleChange={handleTitleChange}
        onExportMarkdown={onExportMarkdown}
        onExportPdf={onExportPdf}
        onExportDocx={onExportDocx}
        onExportAll={onExportAll}
        onNewDoc={onNewDoc}
        onGoToLibrary={onGoToLibrary}
        onGoToLanding={onGoToLanding}
        onOpenSettings={onOpenSettings}
        onSignOut={onSignOut}
        user={user}
        saveStatus={saveStatus}
        readabilityGrade={readabilityGrade}
        readabilityFeedback={readabilityFeedback}
      />

      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Main editor area */}
        <div className="flex-1 max-w-3xl px-8 py-8">
          {document.preface && Object.keys(document.preface).length > 0 && (
            <PrefaceEditor
              preface={document.preface}
              onChange={handlePrefaceChange}
            />
          )}
          <div className="space-y-2">
            {document.sections.map((section, index) => (
              <div
                key={section.id}
                className="animate-section-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <SectionBlock
                  section={section}
                  documentType={document.type}
                  preface={document.preface}
                  index={index}
                  onUpdate={handleSectionUpdate}
                  onDelete={handleDeleteSection}
                  onAddBelow={handleAddBelow}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={index === 0}
                  isLast={index === document.sections.length - 1}
                  onFocus={handleSectionFocusInternal}
                  onBlur={handleSectionBlur}
                  animationDelay={index * 80}
                  clarityCheckOpen={clarityCheckOpenSectionId === section.id}
                  onClarityCheckOpen={handleClarityCheckOpen}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Coaching sidebar */}
        <div className="w-72 shrink-0 border-l border-border bg-sidebar-bg px-4 py-8 hidden lg:block overflow-y-auto sticky top-14 max-h-[calc(100vh-3.5rem)] self-start">
          {/* Structure Guide — shows when focused on an empty section */}
          <StructureGuide
            focusedSection={focusedSection}
            preface={document.preface}
            documentType={document.type}
          />

          {/* Divider when both structure guide and coaching nudges show */}
          {showStructureGuide && nudges.length > 0 && (
            <hr className="my-4 border-border" />
          )}

          {/* Coaching nudges */}
          <CoachingNudge nudges={nudges} onDismiss={onDismissNudge} />

          {/* Empty state — no guide and no nudges */}
          {!showStructureGuide && nudges.length === 0 && (
            <div className="text-xs font-[var(--font-ui)] text-ghost/60 italic">
              Click a section to see its structure guide. Coaching tips will appear as you write.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sectionIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-section-in {
          animation: sectionIn 0.4s ease-out both;
        }
      `}</style>
    </div>
  );
}
