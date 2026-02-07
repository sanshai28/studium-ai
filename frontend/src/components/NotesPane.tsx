import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatLastSaved } from '../utils/formatDate';

interface NotesPaneProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
}

const NotesPane: React.FC<NotesPaneProps> = ({
  content,
  onContentChange,
  onSave,
  isSaving,
  lastSaved,
}) => {
  const [localContent, setLocalContent] = useState(content);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setLocalContent(newContent);
      onContentChange(newContent);

      // Debounce auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        onSave();
      }, 2000);
    },
    [onContentChange, onSave]
  );

  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onSave();
  }, [onSave]);

  return (
    <div className="notes-pane">
      <div className="pane-header">
        <h3>Notes</h3>
        <button className="save-btn" onClick={handleManualSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="notes-editor">
        <textarea
          value={localContent}
          onChange={handleChange}
          placeholder="Take notes here... Content from Q&A can be added using the 📝 button."
        />
      </div>

      <div className="notes-footer">
        <span className="save-status">{formatLastSaved(lastSaved)}</span>
        <span className="char-count">{localContent.length} characters</span>
      </div>
    </div>
  );
};

export default NotesPane;
