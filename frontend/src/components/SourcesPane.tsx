import React, { useState, useCallback } from 'react';
import { sourcesAPI } from '../utils/api';
import { formatSourceDate } from '../utils/formatDate';
import { formatFileSize, getFileIcon } from '../utils/format';
import type { Source } from '../types';

interface SourcesPaneProps {
  notebookId: string;
  sources: Source[];
  onSourcesChange: () => void;
}

const SourcesPane: React.FC<SourcesPaneProps> = ({ notebookId, sources, onSourcesChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setIsUploading(true);
      setError(null);
      try {
        for (const file of files) {
          await sourcesAPI.upload(notebookId, file);
        }
        onSourcesChange();
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload file');
      } finally {
        setIsUploading(false);
      }
    },
    [notebookId, onSourcesChange]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      await uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
    e.target.value = ''; // Reset input for re-upload
  };

  const handleDelete = async (sourceId: string) => {
    try {
      await sourcesAPI.delete(sourceId);
      onSourcesChange();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete source');
    }
  };

  return (
    <div className="sources-pane">
      <div className="pane-header">
        <h3>Sources</h3>
      </div>

      <div
        className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
          disabled={isUploading}
        />
        <label htmlFor="file-input">
          {isUploading ? (
            <span>Uploading...</span>
          ) : (
            <>
              <span className="upload-icon">⬆️</span>
              <span>Drop files or click to upload</span>
              <span className="upload-hint">PDF, DOC, TXT, MD, Images</span>
            </>
          )}
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="sources-list">
        {sources.length === 0 ? (
          <div className="empty-state">
            <p>No sources uploaded yet</p>
            <p className="hint">Upload documents to ask questions about them</p>
          </div>
        ) : (
          sources.map((source) => (
            <div key={source.id} className="source-item">
              <span className="source-icon">{getFileIcon(source.fileType)}</span>
              <div className="source-info">
                <span className="source-name" title={source.fileName}>
                  {source.fileName}
                </span>
                <span className="source-meta">
                  {formatFileSize(source.fileSize)} • {formatSourceDate(source.uploadedAt)}
                </span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(source.id)}
                title="Delete source"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SourcesPane;
