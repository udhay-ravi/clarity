import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import TipTapBody from './TipTapBody';
import EditorToolbar from './EditorToolbar';
import { tipTapDocToText } from '../lib/contentModel';

const NoteEditor = forwardRef(function NoteEditor({ doc, onUpdate, onCursorChange, templateInfo }, ref) {
  const editorRef = useRef(null);
  const ghostTextRef = useRef(null);
  const [editor, setEditor] = useState(null);

  // Expose editor ref to parent (Workspace → AiCoachPane)
  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current,
    insertAtCursor: (text) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.chain().focus().insertContent(text).run();
    },
  }), []);

  const isLocked = !doc || !doc.type;
  const prevDocIdRef = useRef(null);

  // Auto-place cursor after first H2 when doc loads with a template
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed || !doc?.type || !doc?.content) return;

    // Only run once per doc (when doc ID changes or type is first set)
    const docKey = `${doc.id}::${doc.type}`;
    if (prevDocIdRef.current === docKey) return;
    prevDocIdRef.current = docKey;

    // Wait for TipTap to render the content
    requestAnimationFrame(() => {
      const { state } = ed;
      let targetPos = null;

      // Find the first paragraph after the first H2
      state.doc.descendants((node, pos) => {
        if (targetPos !== null) return false; // stop after finding first match
        if (node.type.name === 'heading' && node.attrs.level === 2) {
          // Set target to after the heading (next node position)
          targetPos = pos + node.nodeSize;
          return false;
        }
      });

      if (targetPos !== null && targetPos <= state.doc.content.size) {
        // Place cursor at the start of the paragraph after the first H2
        try {
          ed.commands.focus();
          ed.commands.setTextSelection(targetPos + 1);
        } catch {
          // Ignore position errors
        }
      }
    });
  }, [doc?.id, doc?.type, doc?.content]);

  // Handle content updates from TipTap
  const handleUpdate = useCallback((json, text) => {
    onUpdate?.(json, text);
  }, [onUpdate]);

  // Handle selection updates — detect current heading
  const handleSelectionUpdate = useCallback(({ isInTable }) => {
    const editor = editorRef.current;
    if (!editor) return;

    const { state } = editor;
    const { $from } = state.selection;
    let heading = null;

    // Walk backwards from cursor to find nearest H2
    const pos = $from.pos;
    state.doc.nodesBetween(0, pos, (node, nodePos) => {
      if (node.type.name === 'heading' && node.attrs.level === 2) {
        heading = node.textContent;
      }
    });

    // Fallback: if no H2 heading found, check if any paragraph text before cursor
    // matches a template section title (handles docs where headings are plain text)
    if (!heading && templateInfo?.sections) {
      const sectionTitles = templateInfo.sections
        .filter((s) => s.title)
        .map((s) => s.title.toLowerCase().trim());

      state.doc.nodesBetween(0, pos, (node, nodePos) => {
        if (node.type.name === 'paragraph' && node.textContent) {
          const text = node.textContent.toLowerCase().trim();
          const matchIdx = sectionTitles.findIndex(
            (t) => text === t || (text.startsWith(t) && text.length <= t.length + 3)
          );
          if (matchIdx >= 0) {
            heading = templateInfo.sections.filter((s) => s.title)[matchIdx].title;
          }
        }
      });
    }

    // Get current line text for sentence detection
    const lineStart = $from.start();
    const lineText = state.doc.textBetween(lineStart, $from.pos, '');

    onCursorChange?.({
      heading,
      lineText,
      pos,
      isInTable,
    });
  }, [onCursorChange, templateInfo]);

  // Handle @search and @gen commands
  const handleSearchCommand = useCallback(({ query, from, to }) => {
    // TODO: integrate with search
    console.log('@search:', query);
  }, []);

  const handleGenCommand = useCallback(({ instruction, from, to }) => {
    // TODO: integrate with gen
    console.log('@gen:', instruction);
  }, []);

  if (!doc) {
    return (
      <div className="w-full max-w-3xl px-8 py-16 flex items-center justify-center">
        <p className="text-ghost text-sm opacity-50">Select a note or create a new one</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl px-8 py-8">
      {/* Formatting toolbar — only when editor is active */}
      {!isLocked && <EditorToolbar editor={editor} />}

      {/* Editor area */}
      <div className="relative">
        {isLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg/80 rounded-lg">
            <p className="text-ghost text-sm italic">
              Select a template on the right to start writing &rarr;
            </p>
          </div>
        )}
        <TipTapBody
          ref={editorRef}
          content={doc.content}
          placeholder={
            isLocked
              ? 'Select a template to start writing...'
              : templateInfo?.sections?.[0]
                ? `Start with ${templateInfo.sections[0].title}...`
                : 'Start writing...'
          }
          onUpdate={handleUpdate}
          onSelectionUpdate={handleSelectionUpdate}
          onSearchCommand={handleSearchCommand}
          onGenCommand={handleGenCommand}
          onCreated={setEditor}
          editable={!isLocked}
        />
      </div>
    </div>
  );
});

export default NoteEditor;
