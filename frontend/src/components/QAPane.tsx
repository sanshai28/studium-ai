import React, { useState, useRef, useEffect, useCallback } from 'react';
import { conversationsAPI } from '../utils/api';
import type { Message } from '../types';

interface QAPaneProps {
  conversationId: string | null;
  messages: Message[];
  onMessagesChange: () => void;
  onAddToNotes: (content: string) => void;
  hasNoSources: boolean;
}

const QAPane: React.FC<QAPaneProps> = ({
  conversationId,
  messages,
  onMessagesChange,
  onAddToNotes,
  hasNoSources,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !conversationId || isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        await conversationsAPI.sendMessage(conversationId, input.trim());
        setInput('');
        onMessagesChange();
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [input, conversationId, isLoading, onMessagesChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const copyToClipboard = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  return (
    <div className="qa-pane">
      <div className="pane-header">
        <h3>Ask Questions</h3>
      </div>

      <div className="messages-container">
        {hasNoSources ? (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <p>Upload sources first</p>
            <p className="hint">Add documents to start asking questions</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <p>Start a conversation</p>
            <p className="hint">Ask questions about your uploaded sources</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="message-content">{message.content}</div>
                {message.role === 'assistant' && (
                  <div className="message-actions">
                    <button
                      className="action-btn"
                      onClick={() => copyToClipboard(message.content)}
                      title="Copy"
                    >
                      📋
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => onAddToNotes(message.content)}
                      title="Add to Notes"
                    >
                      📝
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message assistant loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="input-container" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasNoSources ? 'Upload sources first...' : 'Ask a question...'}
          disabled={isLoading || !conversationId || hasNoSources}
          rows={1}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || !conversationId || hasNoSources}
        >
          →
        </button>
      </form>
    </div>
  );
};

export default QAPane;
