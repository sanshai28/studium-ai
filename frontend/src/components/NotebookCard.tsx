import React from 'react';

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getPreview = (text: string) => {
    if (!text) return 'No notes yet';
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  };

  const getColorFromTitle = (title: string) => {
    const colors = [
      '#4285f4', // blue
      '#ea4335', // red
      '#fbbc04', // yellow
      '#34a853', // green
      '#ff6d01', // orange
      '#46bdc6', // teal
      '#7baaf7', // light blue
      '#f07b72', // light red
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="notebook-card" onClick={onClick}>
      <div
        className="notebook-card-header"
        style={{ backgroundColor: getColorFromTitle(title) }}
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
        <p className="notebook-card-preview">{getPreview(content)}</p>
      </div>
      <div className="notebook-card-footer">
        <span className="notebook-card-date">{formatDate(updatedAt)}</span>
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
