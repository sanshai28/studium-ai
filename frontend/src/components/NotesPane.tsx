import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatLastSaved } from '../utils/formatDate';
import type { Note } from '../types';

interface NotesPaneProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onRenameNote: (noteId: string, newTitle: string) => void;
  onReorderNotes: (noteIds: string[]) => void;
  onContentChange: (noteId: string, content: string) => void;
  onSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
}

const NotesPane: React.FC<NotesPaneProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onRenameNote,
  onReorderNotes,
  onContentChange,
  onSave,
  isSaving,
  lastSaved,
}) => {
  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;
  const [localContent, setLocalContent] = useState(activeNote?.content ?? '');
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local content when active note changes
  useEffect(() => {
    setLocalContent(activeNote?.content ?? '');
  }, [activeNoteId, activeNote?.content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setLocalContent(newContent);
      if (activeNoteId) {
        onContentChange(activeNoteId, newContent);
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        onSave();
      }, 2000);
    },
    [activeNoteId, onContentChange, onSave]
  );

  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onSave();
  }, [onSave]);

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

  const sortedNotes = [...notes].sort((a, b) => a.order - b.order);

  return (
    <div className="notes-pane">
      <div className="pane-header">
        <h3>Notes</h3>
        <div className="notes-header-actions">
          <button className="btn-add-note" onClick={onCreateNote} title="New note">
            + New
          </button>
          <button className="save-btn" onClick={handleManualSave} disabled={isSaving}>
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
              <textarea
                className="notes-textarea"
                value={localContent}
                onChange={handleChange}
                placeholder="Take notes here... Content from Q&A can be added using the 📝 button."
              />
              <div className="notes-footer">
                <span className="save-status">{formatLastSaved(lastSaved)}</span>
                <span className="char-count">{localContent.length} characters</span>
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
    </div>
  );
};

export default NotesPane;
