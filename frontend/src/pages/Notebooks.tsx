import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notebooksAPI, sourcesAPI, conversationsAPI, notesAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime } from '../utils/formatDate';
import SourcesPane from '../components/SourcesPane';
import QAPane from '../components/QAPane';
import NotesPane from '../components/NotesPane';
import { METHODS } from '../constants/noteMethods';
import type { Notebook, Source, Message, Conversation, Note, NotebookMethod } from '../types';
import '../styles/Notebooks.css';

const Notebooks: React.FC = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeNoteContent, setActiveNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [isChangingMethod, setIsChangingMethod] = useState(false);
  const methodPickerRef = useRef<HTMLDivElement>(null);

  // Pane resize state
  const [sourcesWidth, setSourcesWidth] = useState(220);
  const [notesWidth, setNotesWidth] = useState(350);
  const draggingRef = useRef<'sources' | 'notes' | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const panesContainerRef = useRef<HTMLDivElement>(null);

  const handleResizeMouseDown = useCallback((pane: 'sources' | 'notes', e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = pane;
    startXRef.current = e.clientX;
    startWidthRef.current = pane === 'sources' ? sourcesWidth : notesWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sourcesWidth, notesWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientX - startXRef.current;
      const viewportWidth = window.innerWidth;
      const maxPaneWidth = Math.floor(viewportWidth * 0.6);
      if (draggingRef.current === 'sources') {
        const newWidth = Math.max(100, Math.min(maxPaneWidth, startWidthRef.current + delta));
        setSourcesWidth(newWidth);
      } else {
        // Notes pane: dragging right edge leftward increases width
        const newWidth = Math.max(100, Math.min(maxPaneWidth, startWidthRef.current - delta));
        setNotesWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (draggingRef.current) {
        draggingRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Load notebook data on mount or notebookId change
  useEffect(() => {
    if (notebookId) {
      loadNotebook(notebookId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId]);

  const loadNotebook = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load notebook details, sources, conversations, and notes in parallel
      const [notebookData, sourcesData, convsData, notesData] = await Promise.all([
        notebooksAPI.getOne(id),
        sourcesAPI.getAll(id),
        conversationsAPI.getAll(id),
        notesAPI.getAll(id),
      ]);

      setNotebook(notebookData.notebook);
      setSources(sourcesData.sources || []);

      const loadedNotes: Note[] = notesData.notes || [];
      setNotes(loadedNotes);
      if (loadedNotes.length > 0) {
        setActiveNoteId(loadedNotes[0].id);
        setActiveNoteContent(loadedNotes[0].content);
      } else {
        setActiveNoteId(null);
        setActiveNoteContent('');
      }

      const convs = convsData.conversations || [];
      if (convs.length > 0) {
        setActiveConversation(convs[0]);
        loadMessages(convs[0].id);
      } else {
        const newConvData = await conversationsAPI.create(id);
        setActiveConversation(newConvData.conversation);
        setMessages([]);
      }
    } catch (err) {
      console.error('Load notebook error:', err);
      setError('Failed to load notebook');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await conversationsAPI.getMessages(conversationId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleTitleSave = useCallback(async () => {
    if (!notebook || !titleInput.trim()) return;

    try {
      const data = await notebooksAPI.update(notebook.id, { title: titleInput });
      setNotebook(data.notebook);
      setEditingTitle(false);
    } catch (err) {
      console.error('Update title error:', err);
    }
  }, [notebook, titleInput]);

  const handleSaveNote = useCallback(async () => {
    if (!notebook || !activeNoteId) return;

    try {
      setIsSaving(true);
      await notesAPI.update(notebook.id, activeNoteId, { content: activeNoteContent });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Save note error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [notebook, activeNoteId, activeNoteContent]);

  const handleSelectNote = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        setActiveNoteId(noteId);
        setActiveNoteContent(note.content);
      }
    },
    [notes]
  );

  const handleCreateNote = useCallback(async () => {
    if (!notebook) return;
    try {
      const data = await notesAPI.create(notebook.id);
      const newNote: Note = data.note;
      setNotes((prev) => [...prev, newNote]);
      setActiveNoteId(newNote.id);
      setActiveNoteContent(newNote.content);
    } catch (err) {
      console.error('Create note error:', err);
    }
  }, [notebook]);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      if (!notebook) return;
      if (!window.confirm('Delete this note? This cannot be undone.')) return;
      try {
        await notesAPI.delete(notebook.id, noteId);
        setNotes((prev) => {
          const remaining = prev.filter((n) => n.id !== noteId);
          if (activeNoteId === noteId) {
            const sorted = [...remaining].sort((a, b) => a.order - b.order);
            const next = sorted[0] ?? null;
            setActiveNoteId(next?.id ?? null);
            setActiveNoteContent(next?.content ?? '');
          }
          return remaining;
        });
      } catch (err) {
        console.error('Delete note error:', err);
      }
    },
    [notebook, activeNoteId]
  );

  const handleRenameNote = useCallback(
    async (noteId: string, newTitle: string) => {
      if (!notebook) return;
      try {
        await notesAPI.update(notebook.id, noteId, { title: newTitle });
        setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, title: newTitle } : n)));
      } catch (err) {
        console.error('Rename note error:', err);
      }
    },
    [notebook]
  );

  const handleReorderNotes = useCallback(
    async (noteIds: string[]) => {
      if (!notebook) return;
      try {
        const data = await notesAPI.reorder(notebook.id, noteIds);
        setNotes(data.notes);
      } catch (err) {
        console.error('Reorder notes error:', err);
      }
    },
    [notebook]
  );

  const handleNoteContentChange = useCallback((noteId: string, content: string) => {
    setActiveNoteContent(content);
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, content } : n)));
  }, []);

  const handleChangeNoteMethod = useCallback(
    async (noteId: string, method: NotebookMethod, templateContent: string) => {
      if (!notebook) return;
      try {
        const data = await notesAPI.update(notebook.id, noteId, { method, content: templateContent });
        const updated: Note = data.note;
        setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
        if (activeNoteId === noteId) {
          setActiveNoteContent(updated.content);
        }
      } catch (err) {
        console.error('Change note method error:', err);
        setError('Failed to change note method');
      }
    },
    [notebook, activeNoteId]
  );

  const handleSourcesChange = useCallback(() => {
    if (notebookId) {
      sourcesAPI.getAll(notebookId).then((data) => {
        setSources(data.sources || []);
      });
    }
  }, [notebookId]);

  const handleMessagesChange = useCallback(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const handleAddToNotes = useCallback(
    async (content: string) => {
      if (!notebook) return;

      if (activeNoteId) {
        const isEmpty = !activeNoteContent || activeNoteContent === '<p></p>';
        const separator = isEmpty ? '' : '<hr />';
        const newContent = (isEmpty ? '' : activeNoteContent) + separator + `<p>${content}</p>`;
        setActiveNoteContent(newContent);
        setNotes((prev) =>
          prev.map((n) => (n.id === activeNoteId ? { ...n, content: newContent } : n))
        );
      } else {
        // No active note — create one with this content
        try {
          const data = await notesAPI.create(notebook.id, { title: 'From Q&A', content: `<p>${content}</p>` });
          const newNote: Note = data.note;
          setNotes((prev) => [...prev, newNote]);
          setActiveNoteId(newNote.id);
          setActiveNoteContent(newNote.content);
        } catch (err) {
          console.error('Create note from Q&A error:', err);
        }
      }
    },
    [notebook, activeNoteId, activeNoteContent]
  );

  const handleDelete = useCallback(async () => {
    if (!notebook) return;

    if (!window.confirm(`Delete "${notebook.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await notebooksAPI.delete(notebook.id);
      navigate('/notebooks');
    } catch (err) {
      console.error('Delete notebook error:', err);
      setError('Failed to delete notebook');
    }
  }, [notebook, navigate]);

  const handleTitleClick = useCallback(() => {
    if (notebook) {
      setEditingTitle(true);
      setTitleInput(notebook.title);
    }
  }, [notebook]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleTitleSave();
      }
    },
    [handleTitleSave]
  );

  const handleChangeMethod = useCallback(
    async (newMethod: NotebookMethod) => {
      if (!notebook || newMethod === notebook.defaultMethod) {
        setShowMethodPicker(false);
        return;
      }
      setIsChangingMethod(true);
      try {
        const data = await notebooksAPI.update(notebook.id, { defaultMethod: newMethod });
        setNotebook(data.notebook);
      } catch (err) {
        console.error('Change method error:', err);
        setError('Failed to change default method');
      } finally {
        setIsChangingMethod(false);
        setShowMethodPicker(false);
      }
    },
    [notebook]
  );

  // Close method picker on outside click
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

  // Loading state
  if (isLoading) {
    return (
      <div className="notebook-app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notebook...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!notebook) {
    return (
      <div className="notebook-app">
        <div className="error-container">
          <div className="error-icon">📓</div>
          <h2>Notebook not found</h2>
          <p>The notebook you're looking for doesn't exist or you don't have access.</p>
          <button className="btn-back-home" onClick={() => navigate('/notebooks')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-app notebook-editor-view">
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <button
            className="btn-back"
            onClick={() => navigate('/notebooks')}
            title="Back to notebooks"
          >
            ←
          </button>
          <div className="header-branding">
            <span className="branding-icon">📔</span>
            <span className="branding-text">NotebookLM</span>
          </div>
        </div>
        <div className="header-center">
          {editingTitle ? (
            <input
              type="text"
              className="header-title-input"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              autoFocus
            />
          ) : (
            <h1 className="header-title" onClick={handleTitleClick}>
              {notebook.title}
            </h1>
          )}
          {(() => {
            const m = METHODS.find((m) => m.id === notebook.defaultMethod);
            return (
              <div className="header-method-wrapper" ref={methodPickerRef}>
                <button
                  className="header-method-badge"
                  onClick={() => setShowMethodPicker((v) => !v)}
                  title="Change default method"
                  disabled={isChangingMethod}
                >
                  {m?.icon} {m?.name}
                  <span className="method-badge-caret">▾</span>
                </button>
                {showMethodPicker && (
                  <div className="header-method-dropdown">
                    {METHODS.map((opt) => (
                      <button
                        key={opt.id}
                        className={`method-dropdown-item${opt.id === notebook.defaultMethod ? ' active' : ''}`}
                        onClick={() => handleChangeMethod(opt.id)}
                      >
                        {opt.icon} {opt.name}
                      </button>
                    ))}
                    <div className="method-dropdown-hint">
                      Only new notes will use the selected method. Your {notes.length} existing {notes.length === 1 ? 'note' : 'notes'} won't change.
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        <div className="header-right">
          <span className="last-edited">Edited {formatRelativeTime(notebook.updatedAt)}</span>
          <div className="user-avatar-small">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <button className="btn-delete-header" onClick={handleDelete} title="Delete notebook">
            🗑️
          </button>
        </div>
      </div>

      {/* Main Content - Three Pane Layout */}
      <div className="notebook-main three-pane">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)} className="btn-close-error">
              ×
            </button>
          </div>
        )}

        <div className="panes-container" ref={panesContainerRef}>
          <SourcesPane
            notebookId={notebook.id}
            sources={sources}
            onSourcesChange={handleSourcesChange}
            style={{ width: sourcesWidth }}
          />

          <div
            className={`pane-resize-handle${draggingRef.current === 'sources' ? ' dragging' : ''}`}
            onMouseDown={(e) => handleResizeMouseDown('sources', e)}
          />

          <QAPane
            conversationId={activeConversation?.id || null}
            messages={messages}
            onMessagesChange={handleMessagesChange}
            onAddToNotes={handleAddToNotes}
            hasNoSources={sources.length === 0}
          />

          <div
            className={`pane-resize-handle${draggingRef.current === 'notes' ? ' dragging' : ''}`}
            onMouseDown={(e) => handleResizeMouseDown('notes', e)}
          />

          <NotesPane
            notes={notes}
            activeNoteId={activeNoteId}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteNote}
            onRenameNote={handleRenameNote}
            onReorderNotes={handleReorderNotes}
            onContentChange={handleNoteContentChange}
            onChangeNoteMethod={handleChangeNoteMethod}
            onSave={handleSaveNote}
            isSaving={isSaving}
            lastSaved={lastSaved}
            notebookDefaultMethod={notebook.defaultMethod}
            style={{ width: notesWidth }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notebooks;
