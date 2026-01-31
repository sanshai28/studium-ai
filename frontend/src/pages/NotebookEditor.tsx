import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notebooksAPI } from '../utils/api';
import '../styles/Notebooks.css';

const NotebookEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (id) {
      loadNotebook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadNotebook = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError('');
      const data = await notebooksAPI.getOne(id);
      setTitle(data.notebook.title);
      setContent(data.notebook.content);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data
        ? String(err.response.data.error)
        : 'Failed to load notebook';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      if (isEditMode && id) {
        await notebooksAPI.update(id, { title, content });
      } else {
        await notebooksAPI.create({ title, content });
      }

      navigate('/notebooks');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data
        ? String(err.response.data.error)
        : 'Failed to save notebook';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/notebooks');
  };

  if (isLoading) {
    return (
      <div className="editor-container">
        <div className="editor-loading">Loading notebook...</div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h1>{isEditMode ? 'Edit Notebook' : 'New Notebook'}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSave} className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notebook title"
            required
            disabled={isSaving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your notes..."
            required
            disabled={isSaving}
            rows={20}
          />
        </div>

        <div className="editor-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotebookEditor;
