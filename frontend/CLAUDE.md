# Frontend CLAUDE.md

This file provides guidance for Claude Code when working with the frontend codebase.

## Project Overview

React 18 TypeScript application with Vite build system. A hybrid of **Google NotebookLM** (AI-powered document Q&A) and **Microsoft OneNote** (note-taking and organization).

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
│   └── backgrounds/ # Animated background components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Route-level page components
├── styles/          # CSS stylesheets
├── types/           # TypeScript interfaces
└── utils/           # API client, formatters, helpers
```

## Commands

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production (runs tsc first)
npm run preview      # Preview production build
npm run lint         # Run ESLint with zero warnings tolerance
```

---

# UI/UX Design System

## Design Philosophy

Create a **world-class, premium experience** inspired by:
- **Google NotebookLM**: Clean, focused, AI-first interface
- **Microsoft OneNote**: Organized, productive, notebook metaphor
- **Apple Human Interface**: Attention to detail, smooth animations
- **Linear/Vercel**: Modern, minimal, developer-focused aesthetics

### Core Principles

1. **Clarity over cleverness** - Every element serves a purpose
2. **Smooth and responsive** - 60fps animations, instant feedback
3. **Accessible by default** - WCAG 2.1 AA compliance
4. **Mobile-first** - Works beautifully on all screen sizes
5. **Delightful details** - Micro-interactions that spark joy

---

## Color System

### Brand Colors

```css
:root {
  /* Primary Palette */
  --color-primary: #667eea;          /* Indigo - main brand */
  --color-primary-dark: #5a67d8;     /* Hover state */
  --color-primary-light: #818cf8;    /* Light variant */
  --color-secondary: #764ba2;        /* Purple - accent */

  /* Semantic Colors */
  --color-success: #34a853;          /* Green - success, saved */
  --color-warning: #fbbc04;          /* Yellow - warnings */
  --color-error: #ea4335;            /* Red - errors, delete */
  --color-info: #4285f4;             /* Blue - information */

  /* Neutral Palette */
  --color-text-primary: #202124;     /* Headings, important text */
  --color-text-secondary: #5f6368;   /* Body text, labels */
  --color-text-tertiary: #9aa0a6;    /* Placeholder, disabled */
  --color-background: #f8f9fa;       /* Page background */
  --color-surface: #ffffff;          /* Cards, modals */
  --color-border: #dadce0;           /* Borders, dividers */
  --color-border-light: #e8eaed;     /* Subtle borders */

  /* Card Header Colors (for NotebookCard) */
  --card-blue: #4285f4;
  --card-red: #ea4335;
  --card-yellow: #fbbc04;
  --card-green: #34a853;
  --card-orange: #ff6d01;
  --card-teal: #46bdc6;
  --card-purple: #a855f7;
  --card-indigo: #667eea;
}
```

### Color Usage Guidelines

| Use Case | Color Variable | Example |
|----------|---------------|---------|
| Primary actions | `--color-primary` | Submit buttons, links |
| Secondary actions | `--color-text-secondary` | Cancel buttons |
| Destructive actions | `--color-error` | Delete buttons |
| Success feedback | `--color-success` | Save confirmation |
| Page background | `--color-background` | Body, main area |
| Cards & modals | `--color-surface` | White containers |
| Borders | `--color-border` | Input borders, dividers |

---

## Typography

### Font Stack

```css
:root {
  --font-primary: 'Google Sans', -apple-system, BlinkMacSystemFont,
                  'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | 2.5rem (40px) | 600 | 1.2 | Hero headlines |
| H1 | 2rem (32px) | 600 | 1.3 | Page titles |
| H2 | 1.5rem (24px) | 500 | 1.4 | Section headers |
| H3 | 1.25rem (20px) | 500 | 1.4 | Card titles |
| Body | 1rem (16px) | 400 | 1.5 | Main content |
| Small | 0.875rem (14px) | 400 | 1.5 | Labels, captions |
| Tiny | 0.75rem (12px) | 400 | 1.4 | Timestamps, badges |

### Typography Guidelines

```css
/* Heading styles */
h1, h2, h3 {
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;  /* Tighter for headings */
}

/* Body text */
p, span {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Links */
a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  text-decoration: underline;
}

/* Text truncation */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## Spacing System

Use consistent spacing based on 4px grid:

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### Spacing Guidelines

| Context | Spacing |
|---------|---------|
| Inline elements | `--space-2` (8px) |
| Form field gap | `--space-4` (16px) |
| Section padding | `--space-6` (24px) |
| Card padding | `--space-4` to `--space-6` |
| Page margin | `--space-8` (32px) |
| Between sections | `--space-8` to `--space-12` |

---

## Border Radius

```css
:root {
  --radius-sm: 4px;     /* Buttons, inputs */
  --radius-md: 8px;     /* Cards, panels */
  --radius-lg: 12px;    /* Large cards */
  --radius-xl: 16px;    /* Modals */
  --radius-2xl: 24px;   /* Pills, tags */
  --radius-full: 9999px; /* Circular elements */
}
```

---

## Shadows & Elevation

```css
:root {
  /* Elevation levels */
  --shadow-sm: 0 1px 2px rgba(60, 64, 67, 0.1);
  --shadow-md: 0 1px 3px rgba(60, 64, 67, 0.15),
               0 4px 8px rgba(60, 64, 67, 0.1);
  --shadow-lg: 0 2px 6px rgba(60, 64, 67, 0.15),
               0 8px 24px rgba(60, 64, 67, 0.15);
  --shadow-xl: 0 8px 28px rgba(60, 64, 67, 0.28);

  /* Focus ring for accessibility */
  --shadow-focus: 0 0 0 3px rgba(102, 126, 234, 0.3);
}
```

### Shadow Usage

| Element | Shadow | Notes |
|---------|--------|-------|
| Cards (resting) | `--shadow-sm` | Subtle elevation |
| Cards (hover) | `--shadow-md` | Lift effect |
| Dropdowns | `--shadow-lg` | Clear separation |
| Modals | `--shadow-xl` | Maximum elevation |
| Focus states | `--shadow-focus` | Accessibility ring |

---

## Animation & Motion

### Timing Functions

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);    /* Standard */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);           /* Accelerate */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);          /* Decelerate */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);     /* Standard */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
}
```

### Duration Scale

```css
:root {
  --duration-fast: 100ms;     /* Micro-interactions */
  --duration-normal: 200ms;   /* Standard transitions */
  --duration-slow: 300ms;     /* Modals, overlays */
  --duration-slower: 500ms;   /* Page transitions */
}
```

### Animation Guidelines

```css
/* Hover states - fast, subtle */
.button {
  transition: all var(--duration-normal) var(--ease-default);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Card hover - lift effect */
.card {
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Modal entrance */
.modal {
  animation: slideUp var(--duration-slow) var(--ease-out);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}
```

### Reduced Motion Support

```css
/* ALWAYS respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### useReducedMotion Hook

```typescript
// Use this hook for JS-based animations
import { useReducedMotion } from '../hooks/useReducedMotion';

const Component = () => {
  const prefersReducedMotion = useReducedMotion();

  // Skip animation if user prefers reduced motion
  if (prefersReducedMotion) {
    return <StaticVersion />;
  }

  return <AnimatedVersion />;
};
```

---

## Component Patterns

### Buttons

```css
/* Primary button */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Secondary button */
.btn-secondary {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-background);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Danger button */
.btn-danger {
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-error);
  color: white;
}

/* Icon button */
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background var(--duration-fast);
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.05);
}
```

### Input Fields

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: all var(--duration-normal) var(--ease-out);
  background: var(--color-surface);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.input:disabled {
  background: var(--color-background);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

/* Input with error */
.input.is-error {
  border-color: var(--color-error);
}

.input.is-error:focus {
  box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.2);
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--space-4);
  background: var(--color-primary);
}

.card-body {
  padding: var(--space-4) var(--space-5);
}

.card-footer {
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--color-border-light);
}
```

### Modals

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  animation: fadeIn var(--duration-normal) var(--ease-out);
  z-index: 1000;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp var(--duration-slow) var(--ease-out);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-body {
  padding: var(--space-6);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border-light);
}
```

---

## Loading States

### Spinner

```css
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

/* Small spinner for buttons */
.loading-spinner-sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}
```

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-border-light) 25%,
    var(--color-background) 50%,
    var(--color-border-light) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-text {
  height: 1rem;
  margin-bottom: var(--space-2);
}

.skeleton-title {
  height: 1.5rem;
  width: 60%;
  margin-bottom: var(--space-3);
}

.skeleton-image {
  height: 200px;
}
```

### Loading Container

```tsx
const LoadingState = () => (
  <div className="loading-container">
    <div className="loading-spinner" />
    <p className="loading-text">Loading...</p>
  </div>
);
```

---

## Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-8);
  text-align: center;
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.empty-state-description {
  color: var(--color-text-secondary);
  max-width: 400px;
  margin-bottom: var(--space-6);
}
```

```tsx
const EmptyState = ({ icon, title, description, action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-description">{description}</p>
    {action && (
      <button className="btn-primary">{action}</button>
    )}
  </div>
);
```

---

## Error States

```css
.error-message {
  background: #fce8e6;
  color: var(--color-error);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-error);
  margin-bottom: var(--space-4);
}

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fce8e6;
  color: var(--color-error);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}
```

---

## Animated Backgrounds

### Available Variants

```tsx
import { AnimatedBackground } from '../components/backgrounds';

// Aurora Mesh - for auth pages
<AnimatedBackground variant="auth" />

// Constellation - for dashboard
<AnimatedBackground variant="dashboard" />
```

### Auth Background (Aurora Mesh)

- Animated gradient mesh (purple → blue → pink)
- 5 floating orbs with blur effects
- Subtle center glow pulse
- CSS-only, GPU-accelerated

### Dashboard Background (Constellation)

- Canvas-based particle system
- ~40 particles (20 on mobile)
- Faint connection lines
- 30fps animation loop

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
:root {
  --breakpoint-sm: 480px;   /* Large phones */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Large screens */
}

/* Media query usage */
@media (min-width: 768px) {
  .container {
    padding: var(--space-8);
  }
}

@media (max-width: 768px) {
  .three-pane {
    flex-direction: column;
  }
}
```

### Responsive Grid

```css
.notebooks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-5);
}

/* Adjust minimum card width on smaller screens */
@media (max-width: 480px) {
  .notebooks-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Accessibility (a11y)

### Focus Styles

```css
/* Never hide focus for keyboard users */
:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* Only hide focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Utilities

```css
/* Visually hidden but accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip link for keyboard navigation */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: var(--space-2) var(--space-4);
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Guidelines

```tsx
// Always use semantic HTML
<button>Click me</button>  // Good
<div onClick={...}>Click me</div>  // Bad

// Provide labels for icons
<button aria-label="Delete notebook">
  <TrashIcon />
</button>

// Loading states
<button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// Announce dynamic content
<div role="status" aria-live="polite">
  {message}
</div>
```

---

## Micro-interactions

### Button Click Feedback

```css
.btn-primary:active {
  transform: scale(0.98);
}
```

### Input Focus Animation

```css
.input-wrapper {
  position: relative;
}

.input-label {
  position: absolute;
  top: 50%;
  left: var(--space-4);
  transform: translateY(-50%);
  transition: all var(--duration-normal) var(--ease-out);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.input:focus + .input-label,
.input:not(:placeholder-shown) + .input-label {
  top: 0;
  font-size: 0.75rem;
  background: var(--color-surface);
  padding: 0 var(--space-1);
  color: var(--color-primary);
}
```

### Card Reveal Animation

```css
.card {
  opacity: 0;
  transform: translateY(20px);
  animation: cardReveal 0.5s var(--ease-out) forwards;
}

.card:nth-child(1) { animation-delay: 0ms; }
.card:nth-child(2) { animation-delay: 50ms; }
.card:nth-child(3) { animation-delay: 100ms; }
.card:nth-child(4) { animation-delay: 150ms; }

@keyframes cardReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Toast Notifications

```css
.toast {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  padding: var(--space-4) var(--space-6);
  background: var(--color-text-primary);
  color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  animation: toastSlide 0.3s var(--ease-out);
  z-index: 1001;
}

@keyframes toastSlide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast.is-exiting {
  animation: toastExit 0.2s var(--ease-in) forwards;
}

@keyframes toastExit {
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
```

---

## Scrollbar Styling

```css
/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}
```

---

## Dark Mode (Future)

```css
/* Prepare for dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    --color-surface: #2d2d2d;
    --color-text-primary: #e8eaed;
    --color-text-secondary: #9aa0a6;
    --color-border: #5f6368;
  }
}
```

---

## Performance Best Practices

1. **Use `transform` and `opacity`** for animations (GPU-accelerated)
2. **Avoid animating** `width`, `height`, `top`, `left`, `margin`, `padding`
3. **Use `will-change`** sparingly for heavy animations
4. **Debounce** scroll and resize handlers
5. **Lazy load** images and heavy components
6. **Reduce motion** when user prefers it
7. **Use `requestAnimationFrame`** for JS animations
8. **Pause animations** when tab is hidden

---

## Component Checklist

When creating a new component:

- [ ] Follows design system colors and spacing
- [ ] Uses proper typography scale
- [ ] Has hover/focus states with transitions
- [ ] Has loading state
- [ ] Has empty state
- [ ] Has error state
- [ ] Works on mobile
- [ ] Respects reduced motion
- [ ] Has proper ARIA labels
- [ ] Uses semantic HTML

---

# Coding Standards

## Component Structure

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

## TypeScript Conventions

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

## React Hooks Best Practices

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

## State Management Patterns

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

## Security Considerations

1. **Sanitize user input** before displaying
2. **Never store sensitive data** in localStorage (except JWT tokens)
3. **Validate file types** on upload (check both extension and MIME type)
4. **Use HTTPS** for all API calls in production
5. **Clear auth state** on signout (token + user data)
