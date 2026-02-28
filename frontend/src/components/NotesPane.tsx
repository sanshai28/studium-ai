import React, { useState, useRef, useCallback, useEffect } from 'react';
import { formatLastSaved } from '../utils/formatDate';
import type { Note, NotebookMethod } from '../types';
import { METHODS } from '../constants/noteMethods';
import RichTextEditor from './RichTextEditor';
import CornellEditor from './CornellEditor';

interface NotesPaneProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onRenameNote: (noteId: string, newTitle: string) => void;
  onReorderNotes: (noteIds: string[]) => void;
  onContentChange: (noteId: string, content: string) => void;
  onChangeNoteMethod: (noteId: string, method: NotebookMethod, templateContent: string) => void;
  onSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
  notebookDefaultMethod: NotebookMethod;
  style?: React.CSSProperties;
}

/** Template content matching backend METHOD_TEMPLATES */
const METHOD_TEMPLATES: Record<NotebookMethod, string> = {
  cornell:
    JSON.stringify({ cues: '<p></p>', notes: '<p></p>', summary: '<p></p>' }),
  sentence: '<ol><li></li></ol>',
  outlining:
    '<h2>Topic</h2><ul><li>Subtopic<ul><li></li></ul></li></ul>',
  charting:
    '<h2>Category 1</h2><ul><li></li></ul><h2>Category 2</h2><ul><li></li></ul>',
  blank: '<p></p>',
};

const NotesPane: React.FC<NotesPaneProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onRenameNote,
  onReorderNotes,
  onContentChange,
  onChangeNoteMethod,
  onSave,
  isSaving,
  lastSaved,
  notebookDefaultMethod,
  style,
}) => {
  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  // Title editing state for the inline editor header
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const dragIdRef = useRef<string | null>(null);

  // Method picker state
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const methodPickerRef = useRef<HTMLDivElement>(null);
  // Confirmation dialog state
  const [pendingMethod, setPendingMethod] = useState<NotebookMethod | null>(null);

  const handleEditorChange = useCallback(
    (html: string) => {
      if (activeNoteId) {
        onContentChange(activeNoteId, html);
      }
    },
    [activeNoteId, onContentChange]
  );

  // Sidebar rename (in-list)
  const startRename = useCallback((note: Note) => {
    setRenamingNoteId(note.id);
    setRenameValue(note.title);
  }, []);

  const commitRename = useCallback(() => {
    if (renamingNoteId && renameValue.trim()) {
      onRenameNote(renamingNoteId, renameValue.trim());
    }
    setRenamingNoteId(null);
    setRenameValue('');
  }, [renamingNoteId, renameValue, onRenameNote]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitRename();
      if (e.key === 'Escape') {
        setRenamingNoteId(null);
        setRenameValue('');
      }
    },
    [commitRename]
  );

  // Inline title editing (editor area header)
  const startTitleEdit = useCallback(() => {
    if (!activeNote) return;
    setTitleEditing(true);
    setTitleValue(activeNote.title);
  }, [activeNote]);

  const commitTitleEdit = useCallback(() => {
    if (activeNoteId && titleValue.trim()) {
      onRenameNote(activeNoteId, titleValue.trim());
    }
    setTitleEditing(false);
  }, [activeNoteId, titleValue, onRenameNote]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitTitleEdit();
      if (e.key === 'Escape') setTitleEditing(false);
    },
    [commitTitleEdit]
  );

  // Drag-and-drop handlers
  const handleDragStart = useCallback((noteId: string) => {
    dragIdRef.current = noteId;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, noteId: string) => {
    e.preventDefault();
    setDragOverId(noteId);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDragOverId(null);
      const dragId = dragIdRef.current;
      if (!dragId || dragId === targetId) return;

      const ordered = [...notes].sort((a, b) => a.order - b.order);
      const dragIdx = ordered.findIndex((n) => n.id === dragId);
      const targetIdx = ordered.findIndex((n) => n.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return;

      const reordered = [...ordered];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(targetIdx, 0, moved);
      onReorderNotes(reordered.map((n) => n.id));
    },
    [notes, onReorderNotes]
  );

  const handleDragEnd = useCallback(() => {
    setDragOverId(null);
    dragIdRef.current = null;
  }, []);

  // Method picker: close on outside click
  useEffect(() => {
    if (!showMethodPicker) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (methodPickerRef.current && !methodPickerRef.current.contains(e.target as Node)) {
        setShowMethodPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showMethodPicker]);

  // Method picker: select a method
  const handleMethodSelect = useCallback(
    (method: NotebookMethod) => {
      if (!activeNote || method === activeNote.method) {
        setShowMethodPicker(false);
        return;
      }
      setShowMethodPicker(false);
      setPendingMethod(method);
    },
    [activeNote]
  );

  // Method picker: "Use Notebook Default"
  const handleUseNotebookDefault = useCallback(() => {
    if (!activeNote || notebookDefaultMethod === activeNote.method) {
      setShowMethodPicker(false);
      return;
    }
    setShowMethodPicker(false);
    setPendingMethod(notebookDefaultMethod);
  }, [activeNote, notebookDefaultMethod]);

  // Confirm method switch
  const confirmMethodSwitch = useCallback(() => {
    if (!activeNote || !pendingMethod) return;
    const templateContent = METHOD_TEMPLATES[pendingMethod];
    onChangeNoteMethod(activeNote.id, pendingMethod, templateContent);
    setPendingMethod(null);
  }, [activeNote, pendingMethod, onChangeNoteMethod]);

  const sortedNotes = [...notes].sort((a, b) => a.order - b.order);

  const currentMethodMeta = activeNote
    ? METHODS.find((m) => m.id === activeNote.method)
    : null;

  const pendingMethodMeta = pendingMethod
    ? METHODS.find((m) => m.id === pendingMethod)
    : null;

  const defaultMethodMeta = METHODS.find((m) => m.id === notebookDefaultMethod);

  return (
    <div className="notes-pane" style={style}>
      <div className="pane-header">
        <h3>Notes</h3>
        <div className="notes-header-actions">
          <button className="btn-add-note" onClick={onCreateNote} title="New note">
            + New
          </button>
          <button className="save-btn" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="notes-pane-body">
        {/* Sidebar */}
        <div className="notes-sidebar">
          {sortedNotes.length === 0 && (
            <div className="notes-sidebar-empty">No notes yet</div>
          )}
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`note-item${note.id === activeNoteId ? ' active' : ''}${dragOverId === note.id ? ' drag-over' : ''}`}
              onClick={() => {
                if (renamingNoteId !== note.id) onSelectNote(note.id);
              }}
              draggable
              onDragStart={() => handleDragStart(note.id)}
              onDragOver={(e) => handleDragOver(e, note.id)}
              onDrop={(e) => handleDrop(e, note.id)}
              onDragEnd={handleDragEnd}
            >
              {renamingNoteId === note.id ? (
                <input
                  className="note-rename-input"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleRenameKeyDown}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="note-title">{note.title}</span>
              )}
              <div className="note-item-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-note-action"
                  title="Rename"
                  onClick={() => startRename(note)}
                >
                  ✏️
                </button>
                <button
                  className="btn-note-action"
                  title="Delete"
                  onClick={() => onDeleteNote(note.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Editor area */}
        <div className="notes-editor-area">
          {activeNote ? (
            <>
              {/* Inline editable title + method badge */}
              <div className="note-editor-title-bar">
                <div className="note-title-row">
                  {titleEditing ? (
                    <input
                      className="note-title-input"
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onBlur={commitTitleEdit}
                      onKeyDown={handleTitleKeyDown}
                      autoFocus
                    />
                  ) : (
                    <h2 className="note-editor-title" onClick={startTitleEdit} title="Click to rename">
                      {activeNote.title}
                    </h2>
                  )}

                  {/* Method dropdown */}
                  <div className="note-method-wrapper" ref={methodPickerRef}>
                    <button
                      className="note-method-badge"
                      onClick={() => setShowMethodPicker((v) => !v)}
                      title="Change note method"
                    >
                      {currentMethodMeta?.icon} {currentMethodMeta?.name}
                      <span className="note-method-caret">&#9662;</span>
                    </button>
                    {showMethodPicker && (
                      <div className="note-method-dropdown">
                        {METHODS.map((opt) => (
                          <button
                            key={opt.id}
                            className={`note-method-dropdown-item${opt.id === activeNote.method ? ' active' : ''}`}
                            onClick={() => handleMethodSelect(opt.id)}
                          >
                            <span>{opt.icon} {opt.name}</span>
                            {opt.id === activeNote.method && <span className="note-method-check">&#10003;</span>}
                          </button>
                        ))}
                        <div className="note-method-dropdown-divider" />
                        <button
                          className={`note-method-dropdown-item notebook-default${notebookDefaultMethod === activeNote.method ? ' active' : ''}`}
                          onClick={handleUseNotebookDefault}
                        >
                          <span>{defaultMethodMeta?.icon} Use Notebook Default ({defaultMethodMeta?.name})</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {activeNote.method === 'cornell' ? (
                <CornellEditor
                  key={activeNote.id}
                  content={activeNote.content}
                  onChange={handleEditorChange}
                  onSave={onSave}
                />
              ) : (
                <RichTextEditor
                  key={activeNote.id}
                  content={activeNote.content}
                  onChange={handleEditorChange}
                  onSave={onSave}
                />
              )}

              <div className="notes-footer">
                <span className="save-status">
                  {isSaving ? 'Saving...' : formatLastSaved(lastSaved)}
                </span>
                <span className="save-hint">Ctrl+S to save</span>
              </div>
            </>
          ) : (
            <div className="notes-empty-state">
              <p>Select a note or create a new one</p>
              <button className="btn-add-note-empty" onClick={onCreateNote}>
                + Create Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation dialog overlay */}
      {pendingMethod && pendingMethodMeta && (
        <div className="note-method-confirm-overlay">
          <div className="note-method-confirm-dialog">
            <h3>Switch to {pendingMethodMeta.name} Method?</h3>
            <p>Your content will be replaced with the {pendingMethodMeta.name} template.</p>
            <div className="note-method-confirm-actions">
              <button className="btn-cancel" onClick={() => setPendingMethod(null)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmMethodSwitch}>
                Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPane;
