import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { compressImageToDataUrl } from '../lib/imageUtils';
import './TipTapBody.css';

const TipTapBody = forwardRef(function TipTapBody(
  { content, placeholder, onUpdate, onFocus, onBlur, onKeyDown, onSelectionUpdate, onSearchCommand, onGenCommand, editable = true },
  ref
) {
  const suppressUpdateRef = useRef(false);
  const searchCbRef = useRef(onSearchCommand);
  searchCbRef.current = onSearchCommand;
  const genCbRef = useRef(onGenCommand);
  genCbRef.current = onGenCommand;
  const placeholderRef = useRef(placeholder);
  placeholderRef.current = placeholder;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'tiptap-image' },
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: { class: 'tiptap-table' },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: () => placeholderRef.current || 'Start writing...',
      }),
    ],
    editable,
    content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor: ed }) => {
      if (suppressUpdateRef.current) return;
      const json = ed.getJSON();
      const text = ed.getText();
      onUpdate?.(json, text);
    },
    onFocus: () => onFocus?.(),
    onBlur: () => onBlur?.(),
    editorProps: {
      attributes: {
        class: 'tiptap-body-editor',
        style: [
          'font-family: var(--editor-font, var(--font-body))',
          'font-size: var(--editor-size, 16px)',
          'line-height: var(--editor-line-height, 1.75)',
        ].join(';'),
      },
      handleKeyDown: (view, event) => {
        // Detect @search command on Enter
        if (event.key === 'Enter' && !event.shiftKey) {
          const { state } = view;
          const { $from } = state.selection;
          // Get current line text
          const lineStart = $from.start();
          const lineText = state.doc.textBetween(lineStart, $from.pos, '');
          const searchMatch = lineText.match(/^@search\s+(.+)/i);
          if (searchMatch) {
            event.preventDefault();
            const query = searchMatch[1].trim();
            searchCbRef.current?.({ query, from: lineStart, to: $from.pos });
            return true;
          }
          const genMatch = lineText.match(/^@gen\s+(.+)/i);
          if (genMatch) {
            event.preventDefault();
            const instruction = genMatch[1].trim();
            genCbRef.current?.({ instruction, from: lineStart, to: $from.pos });
            return true;
          }
        }
        // Let parent handle Tab/Escape for ghost text
        if (event.key === 'Tab' || event.key === 'Escape') {
          onKeyDown?.(event);
          if (event.defaultPrevented) return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const files = event.clipboardData?.files;
        if (files && files.length > 0) {
          const imageFile = Array.from(files).find((f) => f.type.startsWith('image/'));
          if (imageFile) {
            event.preventDefault();
            compressImageToDataUrl(imageFile).then((dataUrl) => {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: dataUrl })
                )
              );
            });
            return true;
          }
        }
        return false;
      },
    },
  });

  // Expose editor instance to parent
  useImperativeHandle(ref, () => editor, [editor]);

  // Selection update listener — uses ref to avoid stale closures
  const selectionCbRef = useRef(onSelectionUpdate);
  selectionCbRef.current = onSelectionUpdate;
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      selectionCbRef.current?.({ isInTable: editor.isActive('table') });
    };
    editor.on('selectionUpdate', handler);
    return () => editor.off('selectionUpdate', handler);
  }, [editor]);

  // Sync content when section changes (e.g., switching sections)
  const prevContentRef = useRef(content);
  useEffect(() => {
    if (!editor) return;
    if (content === prevContentRef.current) return;
    prevContentRef.current = content;

    // Only reset if the content is structurally different from what editor has
    const currentJSON = JSON.stringify(editor.getJSON());
    const newJSON = JSON.stringify(content);
    if (currentJSON !== newJSON) {
      suppressUpdateRef.current = true;
      editor.commands.setContent(content || { type: 'doc', content: [{ type: 'paragraph' }] });
      suppressUpdateRef.current = false;
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

  // Force placeholder re-render when it changes
  useEffect(() => {
    if (!editor) return;
    // The placeholder function reads from placeholderRef, so we just need to
    // force ProseMirror to re-evaluate decorations
    editor.view.dispatch(editor.state.tr);
  }, [placeholder, editor]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
});

export default TipTapBody;
