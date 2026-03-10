import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import TipTapBody from './TipTapBody';
import { tipTapDocToText } from '../lib/contentModel';

const NoteEditor = forwardRef(function NoteEditor({ doc, onUpdate, onCursorChange, templateInfo }, ref) {
  const editorRef = useRef(null);
  const ghostTextRef = useRef(null);

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

    // Get current line text for sentence detection
    const lineStart = $from.start();
    const lineText = state.doc.textBetween(lineStart, $from.pos, '');

    onCursorChange?.({
      heading,
      lineText,
      pos,
      isInTable,
    });
  }, [onCursorChange]);

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
          editable={!isLocked}
        />
      </div>
    </div>
  );
});

export default NoteEditor;
