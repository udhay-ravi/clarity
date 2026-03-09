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
  { content, placeholder, onUpdate, onFocus, onBlur, onKeyDown },
  ref
) {
  const suppressUpdateRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // section titles handle headings
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
        placeholder: placeholder || 'Start writing...',
      }),
    ],
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
      handleKeyDown: (_view, event) => {
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

  // Update placeholder when it changes
  useEffect(() => {
    if (!editor) return;
    editor.extensionManager.extensions.forEach((ext) => {
      if (ext.name === 'placeholder') {
        ext.options.placeholder = placeholder || 'Start writing...';
        // Force editor to re-render placeholder
        editor.view.dispatch(editor.state.tr);
      }
    });
  }, [placeholder, editor]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
});

export default TipTapBody;
