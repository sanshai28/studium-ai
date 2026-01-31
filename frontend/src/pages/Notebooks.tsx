import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notesContent, setNotesContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadNotebooks();
  }, []);

  useEffect(() => {
    if (selectedNotebook && selectedNotebook.id !== 'new') {
      loadNotebookData(selectedNotebook.id);
    }
  }, [selectedNotebook?.id]);

  const loadNotebooks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await notebooksAPI.getAll();
      setNotebooks(data.notebooks);
      if (data.notebooks.length > 0 && !selectedNotebook) {
        setSelectedNotebook(data.notebooks[0]);
      }
    } catch (err: unknown) {
      console.error('Load notebooks error:', err);
      setError('Failed to load notebooks');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotebookData = async (notebookId: string) => {
    try {
      // Load sources
      const sourcesData = await sourcesAPI.getAll(notebookId);
      setSources(sourcesData.sources || []);

      // Load conversations
      const convsData = await conversationsAPI.getAll(notebookId);
      const convs = convsData.conversations || [];
      setConversations(convs);

      // Set active conversation or create one
      if (convs.length > 0) {
        setActiveConversation(convs[0]);
        loadMessages(convs[0].id);
      } else {
        // Create a new conversation for this notebook
        const newConvData = await conversationsAPI.create(notebookId);
        setActiveConversation(newConvData.conversation);
        setConversations([newConvData.conversation]);
        setMessages([]);
      }

      // Set notes content
      if (selectedNotebook) {
        setNotesContent(selectedNotebook.content);
      }
    } catch (err) {
      console.error('Error loading notebook data:', err);
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

  const handleSelectNotebook = (notebook: Notebook) => {
    setSelectedNotebook(notebook);
    setNotesContent(notebook.content);
    setMessages([]);
    setSources([]);
    setActiveConversation(null);
  };

  const handleCreateNew = async () => {
    try {
      const data = await notebooksAPI.create({
        title: 'Untitled Notebook',
        content: '',
      });
      const newNotebook = data.notebook;
      setNotebooks([newNotebook, ...notebooks]);
      setSelectedNotebook(newNotebook);
      setNotesContent('');
      setEditingTitle(true);
      setTitleInput('Untitled Notebook');
    } catch (err) {
      console.error('Create notebook error:', err);
      setError('Failed to create notebook');
    }
  };

  const handleTitleSave = async () => {
    if (!selectedNotebook || !titleInput.trim()) return;

    try {
      const data = await notebooksAPI.update(selectedNotebook.id, { title: titleInput });
      const updatedNotebook = data.notebook;
      setNotebooks(notebooks.map((n) => (n.id === updatedNotebook.id ? updatedNotebook : n)));
      setSelectedNotebook(updatedNotebook);
      setEditingTitle(false);
    } catch (err) {
      console.error('Update title error:', err);
    }
  };

  const handleSaveNotes = useCallback(async () => {
    if (!selectedNotebook || selectedNotebook.id === 'new') return;

    try {
      setIsSaving(true);
      await notebooksAPI.update(selectedNotebook.id, { content: notesContent });
      setLastSaved(new Date());

      // Update local state
      setNotebooks((prev) =>
        prev.map((n) =>
          n.id === selectedNotebook.id ? { ...n, content: notesContent } : n
        )
      );
      setSelectedNotebook((prev) => (prev ? { ...prev, content: notesContent } : prev));
    } catch (err) {
      console.error('Save notes error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [selectedNotebook, notesContent]);

  const handleSourcesChange = () => {
    if (selectedNotebook && selectedNotebook.id !== 'new') {
      loadNotebookData(selectedNotebook.id);
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
    if (!selectedNotebook || selectedNotebook.id === 'new') return;

    if (!window.confirm(`Delete "${selectedNotebook.title}"?`)) {
      return;
    }

    try {
      await notebooksAPI.delete(selectedNotebook.id);
      const updatedNotebooks = notebooks.filter((n) => n.id !== selectedNotebook.id);
      setNotebooks(updatedNotebooks);
      setSelectedNotebook(updatedNotebooks[0] || null);
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

  const filteredNotebooks = notebooks.filter(
    (notebook) =>
      notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notebook.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPreview = (content: string) => {
    return content.length > 80 ? content.substring(0, 80) + '...' : content;
  };

  if (isLoading) {
    return (
      <div className="notebook-app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your notebooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notebook-app">
      {/* Sidebar */}
      <div className="notebook-sidebar">
        <div className="sidebar-header">
          <div className="app-branding">
            <div className="app-icon">📔</div>
            <h2>Notebooks</h2>
          </div>
          <button className="btn-icon" onClick={() => navigate('/')} title="Home">
            <span>🏠</span>
          </button>
        </div>

        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="btn-new-notebook-sidebar" onClick={handleCreateNew}>
          <span className="btn-icon-plus">+</span>
          New Notebook
        </button>

        <div className="notebook-list">
          {filteredNotebooks.length === 0 && searchQuery && (
            <div className="empty-search">No notebooks found</div>
          )}
          {filteredNotebooks.length === 0 && !searchQuery && (
            <div className="empty-search">
              <p>No notebooks yet</p>
              <p className="empty-subtitle">Create your first notebook</p>
            </div>
          )}
          {filteredNotebooks.map((notebook) => (
            <div
              key={notebook.id}
              className={`notebook-item ${selectedNotebook?.id === notebook.id ? 'active' : ''}`}
              onClick={() => handleSelectNotebook(notebook)}
            >
              <div className="notebook-item-header">
                <h3>{notebook.title}</h3>
                <span className="notebook-item-date">{formatDate(notebook.updatedAt)}</span>
              </div>
              <p className="notebook-item-preview">{getPreview(notebook.content)}</p>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
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

        {!selectedNotebook && notebooks.length === 0 ? (
          <div className="empty-main full-width">
            <div className="empty-icon">📝</div>
            <h2>Welcome to Notebooks</h2>
            <p>Create your first notebook to start organizing your thoughts and ideas</p>
            <button className="btn-create-first-large" onClick={handleCreateNew}>
              Create Notebook
            </button>
          </div>
        ) : !selectedNotebook ? (
          <div className="empty-main full-width">
            <div className="empty-icon">👈</div>
            <p>Select a notebook from the sidebar</p>
          </div>
        ) : (
          <>
            {/* Notebook Header */}
            <div className="notebook-header">
              {editingTitle ? (
                <input
                  type="text"
                  className="title-input"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  autoFocus
                />
              ) : (
                <h1
                  className="notebook-title"
                  onClick={() => {
                    setEditingTitle(true);
                    setTitleInput(selectedNotebook.title);
                  }}
                >
                  {selectedNotebook.title}
                </h1>
              )}
              <div className="notebook-actions">
                <span className="last-edited">Edited {formatDate(selectedNotebook.updatedAt)}</span>
                <button className="btn-delete" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>

            {/* Three Panes */}
            <div className="panes-container">
              <SourcesPane
                notebookId={selectedNotebook.id}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Notebooks;
