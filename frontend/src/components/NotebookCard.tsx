import React from 'react';
import { formatCardDate } from '../utils/formatDate';
import { getPreviewText, getColorFromString } from '../utils/format';

interface NotebookCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  sourcesCount?: number;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const NotebookCard: React.FC<NotebookCardProps> = ({
  title,
  content,
  updatedAt,
  sourcesCount = 0,
  onClick,
  onDelete,
}) => {
  return (
    <div className="notebook-card" onClick={onClick}>
      <div
        className="notebook-card-header"
        style={{ backgroundColor: getColorFromString(title) }}
      >
        <div className="notebook-card-icon">📓</div>
        <button
          className="notebook-card-menu"
          onClick={onDelete}
          title="Delete notebook"
        >
          ×
        </button>
      </div>
      <div className="notebook-card-body">
        <h3 className="notebook-card-title">{title}</h3>
        <p className="notebook-card-preview">{getPreviewText(content)}</p>
      </div>
      <div className="notebook-card-footer">
        <span className="notebook-card-date">{formatCardDate(updatedAt)}</span>
        {sourcesCount > 0 && (
          <span className="notebook-card-sources">
            {sourcesCount} source{sourcesCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default NotebookCard;
