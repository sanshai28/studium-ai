import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { notebooksAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import NotebookCard from '../components/NotebookCard';
import { AnimatedBackground } from '../components/backgrounds';
import type { Notebook } from '../types';
import '../styles/NotebookDashboard.css';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const NotebookDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signout } = useAuth();

  // State
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load notebooks on mount
  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await notebooksAPI.getAll();
      setNotebooks(data.notebooks || []);
    } catch (err) {
      console.error('Load notebooks error:', err);
      setError('Failed to load notebooks');
    } finally {
      setIsLoading(false);
    }
  };

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const handleCreateNotebook = useCallback(async () => {
    if (!newNotebookTitle.trim()) return;

    try {
      setIsCreating(true);
      const data = await notebooksAPI.create({
        title: newNotebookTitle.trim(),
        content: '',
      });
      setShowCreateModal(false);
      setNewNotebookTitle('');
      navigate(`/notebooks/${data.notebook.id}`);
    } catch (err) {
      console.error('Create notebook error:', err);
      setError('Failed to create notebook');
    } finally {
      setIsCreating(false);
    }
  }, [newNotebookTitle, navigate]);

  const handleQuickCreate = useCallback(async () => {
    try {
      setIsCreating(true);
      const data = await notebooksAPI.create({
        title: 'Untitled notebook',
        content: '',
      });
      navigate(`/notebooks/${data.notebook.id}`);
    } catch (err) {
      console.error('Create notebook error:', err);
      setError('Failed to create notebook');
    } finally {
      setIsCreating(false);
    }
  }, [navigate]);

  const handleDeleteNotebook = useCallback((notebookId: string, title: string) => {
    setDeleteTarget({ id: notebookId, title });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await notebooksAPI.delete(deleteTarget.id);
      setNotebooks((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      addToast(`"${deleteTarget.title}" deleted`, 'success');
    } catch (err) {
      console.error('Delete notebook error:', err);
      addToast('Failed to delete notebook', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, addToast]);

  const handleRenameNotebook = useCallback(
    async (notebookId: string, newTitle: string) => {
      const previous = notebooks.find((n) => n.id === notebookId);
      // Optimistic update
      setNotebooks((prev) =>
        prev.map((n) => (n.id === notebookId ? { ...n, title: newTitle } : n))
      );
      try {
        await notebooksAPI.update(notebookId, { title: newTitle });
        addToast('Notebook renamed', 'success');
      } catch (err) {
        console.error('Rename notebook error:', err);
        // Revert on failure
        if (previous) {
          setNotebooks((prev) => prev.map((n) => (n.id === notebookId ? previous : n)));
        }
        addToast('Failed to rename notebook', 'error');
      }
    },
    [notebooks, addToast]
  );

  const handleOpenNotebook = useCallback(
    (notebookId: string) => {
      navigate(`/notebooks/${notebookId}`);
    },
    [navigate]
  );

  const handleCreateKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleCreateNotebook();
      }
    },
    [handleCreateNotebook]
  );

  // Derived state
  const filteredNotebooks = useMemo(
    () =>
      notebooks.filter(
        (notebook) =>
          notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notebook.content.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [notebooks, searchQuery]
  );

  const recentNotebooks = useMemo(
    () =>
      [...notebooks]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4),
    [notebooks]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your notebooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <AnimatedBackground variant="dashboard" />
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">📔</span>
            <span className="logo-text">NotebookLM</span>
          </div>
        </div>
        <div className="header-center">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search notebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                ×
              </button>
            )}
          </div>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <div className="user-avatar">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <button className="btn-signout" onClick={signout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Hero Section - shown when no notebooks */}
        {notebooks.length === 0 && !searchQuery && (
          <section className="hero-section">
            <div className="hero-content">
              <h1>Welcome to NotebookLM</h1>
              <p>
                Upload your documents, ask questions, and take notes with AI-powered assistance.
                Create your first notebook to get started.
              </p>
              <button className="btn-create-hero" onClick={() => setShowCreateModal(true)}>
                <span>+</span> Create your first notebook
              </button>
            </div>
            <div className="hero-illustration">
              <div className="illustration-card">📄</div>
              <div className="illustration-card">💬</div>
              <div className="illustration-card">📝</div>
            </div>
          </section>
        )}

        {/* Recent Notebooks */}
        {notebooks.length > 0 && !searchQuery && (
          <section className="notebooks-section">
            <div className="section-header">
              <h2>Recent notebooks</h2>
            </div>
            <div className="notebooks-grid">
              {/* Create New Card */}
              <div className="notebook-card create-card" onClick={() => setShowCreateModal(true)}>
                <div className="create-card-content">
                  <div className="create-icon">+</div>
                  <span>New notebook</span>
                </div>
              </div>

              {recentNotebooks.map((notebook) => (
                <NotebookCard
                  key={notebook.id}
                  id={notebook.id}
                  title={notebook.title}
                  content={notebook.content}
                  updatedAt={notebook.updatedAt}
                  onClick={() => handleOpenNotebook(notebook.id)}
                  onDelete={() => handleDeleteNotebook(notebook.id, notebook.title)}
                  onRename={(newTitle) => handleRenameNotebook(notebook.id, newTitle)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Notebooks (shown when there are more than 4 or when searching) */}
        {(notebooks.length > 4 || searchQuery) && (
          <section className="notebooks-section">
            <div className="section-header">
              <h2>{searchQuery ? 'Search results' : 'All notebooks'}</h2>
              <span className="notebook-count">
                {filteredNotebooks.length} notebook{filteredNotebooks.length !== 1 ? 's' : ''}
              </span>
            </div>
            {filteredNotebooks.length === 0 ? (
              <div className="empty-search">
                <div className="empty-icon">🔍</div>
                <p>No notebooks found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="notebooks-grid">
                {!searchQuery && (
                  <div
                    className="notebook-card create-card"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <div className="create-card-content">
                      <div className="create-icon">+</div>
                      <span>New notebook</span>
                    </div>
                  </div>
                )}
                {filteredNotebooks.map((notebook) => (
                  <NotebookCard
                    key={notebook.id}
                    id={notebook.id}
                    title={notebook.title}
                    content={notebook.content}
                    updatedAt={notebook.updatedAt}
                    onClick={() => handleOpenNotebook(notebook.id)}
                    onDelete={() => handleDeleteNotebook(notebook.id, notebook.title)}
                    onRename={(newTitle) => handleRenameNotebook(notebook.id, newTitle)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create new notebook</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="notebook-title">Notebook name</label>
              <input
                id="notebook-title"
                type="text"
                placeholder="Enter notebook name..."
                value={newNotebookTitle}
                onChange={(e) => setNewNotebookTitle(e.target.value)}
                onKeyDown={handleCreateKeyDown}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                className="btn-create"
                onClick={handleCreateNotebook}
                disabled={!newNotebookTitle.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!isDeleting) setDeleteTarget(null);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete notebook</h2>
              <button
                className="modal-close"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Delete <strong>"{deleteTarget.title}"</strong>? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button className="btn-delete" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for quick create */}
      {notebooks.length > 0 && (
        <button
          className="fab"
          onClick={handleQuickCreate}
          disabled={isCreating}
          title="Create new notebook"
        >
          +
        </button>
      )}

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotebookDashboard;
