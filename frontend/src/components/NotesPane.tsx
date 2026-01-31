import React, { useState, useEffect, useRef } from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 5) return 'Just saved';
    if (diff < 60) return `Saved ${diff}s ago`;
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onSave();
  };

  return (
    <div className="notes-pane">
      <div className="pane-header">
        <h3>Notes</h3>
        <button
          className="save-btn"
          onClick={handleManualSave}
          disabled={isSaving}
        >
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
        <span className="save-status">{formatLastSaved()}</span>
        <span className="char-count">{localContent.length} characters</span>
      </div>
    </div>
  );
};

export default NotesPane;
