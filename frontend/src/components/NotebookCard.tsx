import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatCardDate } from '../utils/formatDate';
import { getPreviewText, getColorFromString } from '../utils/format';
import { METHODS } from '../constants/noteMethods';
import type { NotebookMethod } from '../types';

interface NotebookCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  defaultMethod: NotebookMethod;
  sourcesCount?: number;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

const NotebookCard: React.FC<NotebookCardProps> = ({
  title,
  content,
  updatedAt,
  defaultMethod,
  sourcesCount = 0,
  onClick,
  onDelete,
  onRename,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync rename value if title prop changes externally
  useEffect(() => {
    setRenameValue(title);
  }, [title]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    setIsRenaming(false);
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    } else {
      setRenameValue(title);
    }
  }, [renameValue, title, onRename]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsRenaming(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
  };

  return (
    <div className="notebook-card" onClick={onClick}>
      <div
        className="notebook-card-header"
        style={{ backgroundColor: getColorFromString(title) }}
      >
        <div className="notebook-card-icon">📓</div>
        <div className="notebook-card-menu-wrapper" ref={menuRef}>
          <button
            className="notebook-card-menu-btn"
            onClick={handleMenuClick}
            title="More options"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="card-dropdown">
              <button className="card-dropdown-item" onClick={handleRenameClick}>
                ✏️ Rename
              </button>
              <button className="card-dropdown-item delete" onClick={handleDeleteClick}>
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="notebook-card-body">
        {isRenaming ? (
          <input
            className="notebook-card-title-input"
            value={renameValue}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setRenameValue(title);
                setIsRenaming(false);
              }
            }}
          />
        ) : (
          <h3 className="notebook-card-title">{title}</h3>
        )}
        <p className="notebook-card-preview">{getPreviewText(content)}</p>
      </div>
      <div className="notebook-card-footer">
        {(() => {
          const method = METHODS.find((m) => m.id === defaultMethod);
          return method ? (
            <span className="notebook-method-badge">
              {method.icon} {method.name}
            </span>
          ) : null;
        })()}
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
