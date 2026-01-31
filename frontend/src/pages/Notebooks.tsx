import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notebooksAPI } from '../utils/api';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await notebooksAPI.getAll();
      setNotebooks(data.notebooks);
    } catch (err: unknown) {
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

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await notebooksAPI.delete(id);
      setNotebooks(notebooks.filter((n) => n.id !== id));
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPreview = (content: string) => {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  if (isLoading) {
    return (
      <div className="notebooks-container">
        <div className="notebooks-loading">Loading notebooks...</div>
      </div>
    );
  }

  return (
    <div className="notebooks-container">
      <div className="notebooks-header">
        <h1>My Notebooks</h1>
        <button
          className="btn-new-notebook"
          onClick={() => navigate('/notebooks/new')}
        >
          + New Notebook
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {notebooks.length === 0 ? (
        <div className="empty-state">
          <p>No notebooks yet</p>
          <p className="empty-state-subtitle">
            Create your first notebook to get started
          </p>
          <button
            className="btn-create-first"
            onClick={() => navigate('/notebooks/new')}
          >
            Create Notebook
          </button>
        </div>
      ) : (
        <div className="notebooks-grid">
          {notebooks.map((notebook) => (
            <div key={notebook.id} className="notebook-card">
              <div
                className="notebook-card-content"
                onClick={() => navigate(`/notebooks/${notebook.id}`)}
              >
                <h3 className="notebook-title">{notebook.title}</h3>
                <p className="notebook-preview">{getPreview(notebook.content)}</p>
                <div className="notebook-meta">
                  <span className="notebook-date">
                    Updated {formatDate(notebook.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="notebook-actions">
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notebook.id, notebook.title);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notebooks;
