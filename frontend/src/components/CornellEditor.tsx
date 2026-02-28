import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';

interface CornellContent {
  cues: string;
  notes: string;
  summary: string;
}

interface CornellEditorProps {
  content: string;
  onChange: (json: string) => void;
  onSave: () => void;
}

function parseCornellContent(raw: string): CornellContent {
  try {
    const parsed = JSON.parse(raw);
    return {
      cues: parsed.cues || '<p></p>',
      notes: parsed.notes || '<p></p>',
      summary: parsed.summary || '<p></p>',
    };
  } catch {
    // Fallback: if content is plain HTML (legacy), put it all in notes
    return { cues: '<p></p>', notes: raw || '<p></p>', summary: '<p></p>' };
  }
}

interface SectionEditorProps {
  content: string;
  placeholder: string;
  onUpdate: (html: string) => void;
  onSave: () => void;
  onFocus: () => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ content, placeholder, onUpdate, onSave, onFocus }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    onFocus: () => {
      onFocus();
    },
    editorProps: {
      attributes: { class: 'prosemirror-editor cornell-prosemirror' },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  if (!editor) return null;
  return <EditorContent editor={editor} className="cornell-section-editor" />;
};

const CornellEditor: React.FC<CornellEditorProps> = ({ content, onChange, onSave }) => {
  const parsed = parseCornellContent(content);
  const cuesRef = useRef(parsed.cues);
  const notesRef = useRef(parsed.notes);
  const summaryRef = useRef(parsed.summary);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focusedSection, setFocusedSection] = useState<'cues' | 'notes' | 'summary' | null>(null);

  // Sync refs when content prop changes (note switch)
  useEffect(() => {
    const p = parseCornellContent(content);
    cuesRef.current = p.cues;
    notesRef.current = p.notes;
    summaryRef.current = p.summary;
  }, [content]);

  const emitChange = useCallback(() => {
    const json = JSON.stringify({
      cues: cuesRef.current,
      notes: notesRef.current,
      summary: summaryRef.current,
    });
    onChange(json);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onSave();
    }, 2000);
  }, [onChange, onSave]);

  const handleCuesUpdate = useCallback((html: string) => {
    cuesRef.current = html;
    emitChange();
  }, [emitChange]);

  const handleNotesUpdate = useCallback((html: string) => {
    notesRef.current = html;
    emitChange();
  }, [emitChange]);

  const handleSummaryUpdate = useCallback((html: string) => {
    summaryRef.current = html;
    emitChange();
  }, [emitChange]);

  return (
    <div className="cornell-editor">
      <div className="cornell-top">
        <div className={`cornell-section cornell-cues${focusedSection === 'cues' ? ' focused' : ''}`}>
          <div className="cornell-section-label">CUES</div>
          <SectionEditor
            content={parsed.cues}
            placeholder="Questions, keywords, cues..."
            onUpdate={handleCuesUpdate}
            onSave={onSave}
            onFocus={() => setFocusedSection('cues')}
          />
        </div>
        <div className={`cornell-section cornell-notes${focusedSection === 'notes' ? ' focused' : ''}`}>
          <div className="cornell-section-label">NOTES</div>
          <SectionEditor
            content={parsed.notes}
            placeholder="Main notes, details, examples..."
            onUpdate={handleNotesUpdate}
            onSave={onSave}
            onFocus={() => setFocusedSection('notes')}
          />
        </div>
      </div>
      <div className={`cornell-section cornell-summary${focusedSection === 'summary' ? ' focused' : ''}`}>
        <div className="cornell-section-label">SUMMARY</div>
        <SectionEditor
          content={parsed.summary}
          placeholder="Summarize key points..."
          onUpdate={handleSummaryUpdate}
          onSave={onSave}
          onFocus={() => setFocusedSection('summary')}
        />
      </div>
    </div>
  );
};

export default CornellEditor;
