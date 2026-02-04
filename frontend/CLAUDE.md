# Frontend CLAUDE.md

This file provides guidance for Claude Code when working with the frontend codebase.

## Project Overview

React 18 TypeScript application with Vite build system. NotebookLM-inspired UI for document Q&A and note-taking.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Plain CSS (no framework)
- **Build**: Vite

## Directory Structure

```
frontend/src/
├── components/      # Reusable UI components
├── contexts/        # React Context providers
├── pages/           # Route-level page components
├── styles/          # CSS stylesheets
├── utils/           # API client, helpers
└── config/          # Environment configuration
```

## Commands

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production (runs tsc first)
npm run preview      # Preview production build
npm run lint         # Run ESLint with zero warnings tolerance
```

---

## Coding Standards

### Component Structure

Follow this order within components:

```typescript
// 1. Imports (external, then internal)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiModule } from '../utils/api';
import '../styles/Component.css';

// 2. Interfaces/Types
interface ComponentProps {
  id: string;
  onAction: (value: string) => void;
}

// 3. Component definition
const Component: React.FC<ComponentProps> = ({ id, onAction }) => {
  // 4. Hooks (state, refs, context, navigation)
  const [data, setData] = useState<DataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 5. Effects
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 6. Callbacks and handlers
  const loadData = async () => {
    // ...
  };

  const handleClick = useCallback(() => {
    // ...
  }, [dependencies]);

  // 7. Helper functions (non-state dependent)
  const formatDate = (dateString: string) => {
    // ...
  };

  // 8. Early returns (loading, error, empty states)
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // 9. Main render
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### TypeScript Conventions

```typescript
// Use explicit interface for component props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;  // Optional props have ?
}

// Use explicit types for state
const [items, setItems] = useState<Item[]>([]);
const [selected, setSelected] = useState<Item | null>(null);

// Use ReturnType for timers (not NodeJS.Timeout)
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// Type event handlers explicitly when needed
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // ...
};
```

### React Hooks Best Practices

```typescript
// Use useCallback for functions passed as props
const handleDelete = useCallback(async (id: string) => {
  await api.delete(id);
  onRefresh();
}, [onRefresh]);

// Use useCallback for functions in dependency arrays
const fetchData = useCallback(async () => {
  const data = await api.getAll();
  setItems(data);
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);

// When intentionally omitting dependencies, add eslint comment
useEffect(() => {
  if (notebookId) {
    loadNotebook(notebookId);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [notebookId]);
```

### State Management Patterns

```typescript
// Loading states - always track them
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// Error states - use string or null
const [error, setError] = useState<string | null>(null);

// Async operation pattern
const handleSave = async () => {
  try {
    setIsSaving(true);
    setError(null);
    await api.save(data);
    // Success handling
  } catch (err) {
    console.error('Save error:', err);
    setError('Failed to save');
  } finally {
    setIsSaving(false);
  }
};
```

### API Integration

```typescript
// API calls in utils/api.ts follow this pattern:
export const resourceAPI = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/resource');
    return response.data;
  },

  getOne: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/resource/${id}`);
    return response.data;
  },

  create: async (data: CreateData): Promise<ApiResponse> => {
    const response = await api.post('/resource', data);
    return response.data;
  },

  update: async (id: string, data: UpdateData): Promise<ApiResponse> => {
    const response = await api.put(`/resource/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/resource/${id}`);
    return response.data;
  },
};
```

### Context Providers

```typescript
// Always include error boundary pattern for context hooks
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Use eslint-disable for exported hooks
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => { ... };
```

---

## CSS Conventions

### File Organization

- One CSS file per component/page: `ComponentName.css`
- Import CSS in the component file: `import '../styles/ComponentName.css';`
- Use BEM-like naming: `.component-name`, `.component-name__element`, `.component-name--modifier`

### Naming Conventions

```css
/* Component container */
.notebook-card { }

/* Child elements use double underscore or single dash */
.notebook-card-header { }
.notebook-card-body { }
.notebook-card-footer { }

/* State modifiers */
.notebook-card.is-selected { }
.notebook-card.is-loading { }

/* Interactive states */
.notebook-card:hover { }
.notebook-card:focus { }
```

### Layout Patterns

```css
/* Use CSS Grid for page layouts */
.three-pane {
  display: grid;
  grid-template-columns: 300px 1fr 400px;
  gap: 1rem;
}

/* Use Flexbox for component layouts */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Responsive design with media queries */
@media (max-width: 1024px) {
  .three-pane {
    grid-template-columns: 1fr;
  }
}
```

### CSS Variables

Define theme variables at root level:

```css
:root {
  --color-primary: #4285f4;
  --color-success: #34a853;
  --color-error: #ea4335;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #202124;
  --color-text-secondary: #5f6368;
  --border-radius: 8px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

---

## Component Patterns

### Loading States

```tsx
if (isLoading) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
}
```

### Error States

```tsx
if (error) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2>Something went wrong</h2>
      <p>{error}</p>
      <button onClick={retry}>Try again</button>
    </div>
  );
}
```

### Empty States

```tsx
if (items.length === 0) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <p>No items found</p>
      <button onClick={onCreate}>Create your first item</button>
    </div>
  );
}
```

### Confirmation Dialogs

```typescript
// Use window.confirm for simple confirmations
const handleDelete = async () => {
  if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
    return;
  }
  await api.delete(item.id);
};
```

### Form Handling

```tsx
const [formData, setFormData] = useState({ title: '', content: '' });
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.title.trim()) return;

  try {
    setIsSubmitting(true);
    await api.create(formData);
    setFormData({ title: '', content: '' });
  } catch (err) {
    setError('Failed to create');
  } finally {
    setIsSubmitting(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input
      value={formData.title}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      disabled={isSubmitting}
    />
    <button type="submit" disabled={isSubmitting || !formData.title.trim()}>
      {isSubmitting ? 'Creating...' : 'Create'}
    </button>
  </form>
);
```

---

## File Upload Pattern

```tsx
// Drag and drop with file input fallback
const [isDragging, setIsDragging] = useState(false);
const [isUploading, setIsUploading] = useState(false);

const handleDragOver = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
}, []);

const handleDragLeave = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
}, []);

const handleDrop = useCallback(async (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  const files = Array.from(e.dataTransfer.files);
  await uploadFiles(files);
}, [uploadFiles]);

const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  await uploadFiles(files);
  e.target.value = '';  // Reset input for re-upload
};
```

---

## Routing Patterns

### Protected Routes

```tsx
// Redirect unauthenticated users
const { user, isLoading } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (!isLoading && !user) {
    navigate('/signin');
  }
}, [user, isLoading, navigate]);
```

### URL Parameters

```tsx
import { useParams, useNavigate } from 'react-router-dom';

const { notebookId } = useParams<{ notebookId: string }>();
const navigate = useNavigate();

// Navigate programmatically
const handleOpen = (id: string) => {
  navigate(`/notebooks/${id}`);
};

// Navigate back
<button onClick={() => navigate('/notebooks')}>Back</button>
```

---

## Date Formatting Utility

```typescript
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
```

---

## ESLint Rules

The project enforces zero warnings. Common lint issues:

```typescript
// Missing dependency - add it or disable with comment
useEffect(() => {
  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

// Unused variables - remove or prefix with underscore
const [_unused, setUsed] = useState(null);

// React refresh export - add disable comment
// eslint-disable-next-line react-refresh/only-export-components
export const useCustomHook = () => { ... };
```

---

## Performance Guidelines

1. **Memoize callbacks** passed to child components with `useCallback`
2. **Avoid inline object/array creation** in JSX props
3. **Use loading states** to prevent multiple submissions
4. **Debounce** frequently fired events (typing, scrolling)
5. **Reset form inputs** after file uploads to allow re-upload

---

## Security Considerations

1. **Sanitize user input** before displaying
2. **Never store sensitive data** in localStorage (except JWT tokens)
3. **Validate file types** on upload (check both extension and MIME type)
4. **Use HTTPS** for all API calls in production
5. **Clear auth state** on signout (token + user data)
