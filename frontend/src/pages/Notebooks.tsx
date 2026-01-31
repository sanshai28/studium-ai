import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notebooksAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Notebooks.css';

interface Notebook {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const Notebooks: React.FC = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (!user) {
      navigate('/signin');
      return;
    }
    loadNotebooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      // Check if it's an authentication error
      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response as any;
        if (response?.status === 401) {
          navigate('/signin');
          return;
        }
      }
      const errorMessage = err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data
        ? String(err.response.data.error)
        : 'Failed to load notebooks';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectNotebook = (notebook: Notebook) => {
    if (isEditing) {
      handleCancelEdit();
    }
    setSelectedNotebook(notebook);
  };

  const handleCreateNew = () => {
    const newNotebook: Notebook = {
      id: 'new',
      title: 'Untitled Notebook',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedNotebook(newNotebook);
    setEditTitle('Untitled Notebook');
    setEditContent('');
    setIsEditing(true);
  };

  const handleEdit = () => {
    if (selectedNotebook) {
      setEditTitle(selectedNotebook.title);
      setEditContent(selectedNotebook.content);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
    if (selectedNotebook?.id === 'new') {
      setSelectedNotebook(notebooks[0] || null);
    }
  };

  const handleSave = async () => {
    console.log('handleSave called', { editTitle, editContent, selectedNotebook });

    if (!editTitle.trim()) {
      setError('Title is required');
      setSuccessMessage('');
      return;
    }

    if (!editContent.trim()) {
      setError('Content cannot be empty');
      setSuccessMessage('');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');

      if (selectedNotebook?.id === 'new') {
        console.log('Creating new notebook...');
        const data = await notebooksAPI.create({ title: editTitle.trim(), content: editContent.trim() });
        console.log('Notebook created:', data);
        const newNotebook = data.notebook;
        setNotebooks([newNotebook, ...notebooks]);
        setSelectedNotebook(newNotebook);
        setSuccessMessage('Notebook created successfully!');
      } else if (selectedNotebook) {
        console.log('Updating notebook:', selectedNotebook.id);
        const data = await notebooksAPI.update(selectedNotebook.id, {
          title: editTitle.trim(),
          content: editContent.trim(),
        });
        console.log('Notebook updated:', data);
        const updatedNotebook = data.notebook;
        setNotebooks(notebooks.map((n) => (n.id === updatedNotebook.id ? updatedNotebook : n)));
        setSelectedNotebook(updatedNotebook);
        setSuccessMessage('Notebook saved successfully!');
      }

      setIsEditing(false);
      setEditTitle('');
      setEditContent('');

      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      console.error('Save error:', err);
      // Check if it's an authentication error
      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response as any;
        if (response?.status === 401) {
          navigate('/signin');
          return;
        }
      }
      const errorMessage = err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data
        ? String(err.response.data.error)
        : 'Failed to save notebook. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
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
      setIsEditing(false);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data
        ? String(err.response.data.error)
        : 'Failed to delete notebook';
      setError(errorMessage);
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

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
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
            <div className="user-avatar">{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="notebook-main">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError('')} className="btn-close-error">×</button>
          </div>
        )}

        {successMessage && (
          <div className="success-banner">
            {successMessage}
            <button onClick={() => setSuccessMessage('')} className="btn-close-success">×</button>
          </div>
        )}

        {!selectedNotebook && notebooks.length === 0 ? (
          <div className="empty-main">
            <div className="empty-icon">📝</div>
            <h2>Welcome to Notebooks</h2>
            <p>Create your first notebook to start organizing your thoughts and ideas</p>
            <button className="btn-create-first-large" onClick={handleCreateNew}>
              Create Notebook
            </button>
          </div>
        ) : !selectedNotebook ? (
          <div className="empty-main">
            <div className="empty-icon">👈</div>
            <p>Select a notebook from the sidebar</p>
          </div>
        ) : isEditing ? (
          <div className="notebook-editor">
            <div className="editor-toolbar">
              <button className="btn-toolbar" onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </button>
              <button className="btn-toolbar btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            <input
              type="text"
              className="editor-title-input"
              placeholder="Untitled Notebook"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={isSaving}
            />

            <textarea
              className="editor-content-input"
              placeholder="Start writing..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={isSaving}
            />
          </div>
        ) : (
          <div className="notebook-viewer">
            <div className="viewer-toolbar">
              <div className="viewer-info">
                <span className="viewer-date">Last edited {formatDate(selectedNotebook.updatedAt)}</span>
              </div>
              <div className="viewer-actions">
                <button className="btn-toolbar" onClick={handleEdit}>
                  Edit
                </button>
                <button className="btn-toolbar btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>

            <h1 className="viewer-title">{selectedNotebook.title}</h1>
            <div className="viewer-content">{selectedNotebook.content}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notebooks;
