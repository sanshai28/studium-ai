import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notebooksAPI, sourcesAPI, conversationsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import SourcesPane from '../components/SourcesPane';
import QAPane from '../components/QAPane';
import NotesPane from '../components/NotesPane';
import '../styles/Notebooks.css';

interface Notebook {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Source {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  notebookId: string;
  createdAt: string;
  updatedAt: string;
}

const Notebooks: React.FC = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notesContent, setNotesContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (notebookId) {
      loadNotebook(notebookId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId]);

  const loadNotebook = async (id: string) => {
    try {
      setIsLoading(true);
      setError('');

      // Load notebook details
      const notebookData = await notebooksAPI.getOne(id);
      setNotebook(notebookData.notebook);
      setNotesContent(notebookData.notebook.content);

      // Load sources
      const sourcesData = await sourcesAPI.getAll(id);
      setSources(sourcesData.sources || []);

      // Load or create conversation
      const convsData = await conversationsAPI.getAll(id);
      const convs = convsData.conversations || [];

      if (convs.length > 0) {
        setActiveConversation(convs[0]);
        loadMessages(convs[0].id);
      } else {
        const newConvData = await conversationsAPI.create(id);
        setActiveConversation(newConvData.conversation);
        setMessages([]);
      }
    } catch (err: unknown) {
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

  const handleTitleSave = async () => {
    if (!notebook || !titleInput.trim()) return;

    try {
      const data = await notebooksAPI.update(notebook.id, { title: titleInput });
      setNotebook(data.notebook);
      setEditingTitle(false);
    } catch (err) {
      console.error('Update title error:', err);
    }
  };

  const handleSaveNotes = useCallback(async () => {
    if (!notebook) return;

    try {
      setIsSaving(true);
      await notebooksAPI.update(notebook.id, { content: notesContent });
      setLastSaved(new Date());
      setNotebook((prev) => (prev ? { ...prev, content: notesContent } : prev));
    } catch (err) {
      console.error('Save notes error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [notebook, notesContent]);

  const handleSourcesChange = () => {
    if (notebookId) {
      sourcesAPI.getAll(notebookId).then((data) => {
        setSources(data.sources || []);
      });
    }
  };

  const handleMessagesChange = () => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  };

  const handleAddToNotes = (content: string) => {
    const separator = notesContent ? '\n\n---\n\n' : '';
    setNotesContent(notesContent + separator + content);
  };

  const handleDelete = async () => {
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
          <button className="btn-back" onClick={() => navigate('/notebooks')} title="Back to notebooks">
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
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              autoFocus
            />
          ) : (
            <h1
              className="header-title"
              onClick={() => {
                setEditingTitle(true);
                setTitleInput(notebook.title);
              }}
            >
              {notebook.title}
            </h1>
          )}
        </div>
        <div className="header-right">
          <span className="last-edited">Edited {formatDate(notebook.updatedAt)}</span>
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
            <button onClick={() => setError('')} className="btn-close-error">
              ×
            </button>
          </div>
        )}

        <div className="panes-container">
          <SourcesPane
            notebookId={notebook.id}
            sources={sources}
            onSourcesChange={handleSourcesChange}
          />

          <QAPane
            conversationId={activeConversation?.id || null}
            messages={messages}
            onMessagesChange={handleMessagesChange}
            onAddToNotes={handleAddToNotes}
            hasNoSources={sources.length === 0}
          />

          <NotesPane
            content={notesContent}
            onContentChange={setNotesContent}
            onSave={handleSaveNotes}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
        </div>
      </div>
    </div>
  );
};

export default Notebooks;
