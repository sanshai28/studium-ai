# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with this repository.

## Project Overview

Studium AI is a notebook application with a three-pane interface inspired by NotebookLM:
- **Sources Pane**: Upload documents (PDF, DOC, DOCX, TXT, MD, images)
- **Q&A Pane**: Ask questions about uploaded sources using Google Gemini AI
- **Notes Pane**: Save and edit notes with auto-save functionality

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Gemini API (@google/generative-ai)
- **File Upload**: Multer
- **Document Parsing**: pdf-parse, mammoth

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: CSS (no framework)
- **Build**: Vite

## Common Commands

### Backend (from /backend directory)
```bash
npm run dev          # Start development server (port 5000)
npm run build        # Compile TypeScript
npm run start        # Run compiled code
npm run test         # Run Jest tests
npm run test:coverage # Run tests with coverage report
npm run lint         # Run ESLint
npx prisma migrate dev   # Run database migrations
npx prisma generate      # Generate Prisma client
```

### Frontend (from /frontend directory)
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Root Level
```bash
npm run dev          # Start both frontend and backend concurrently
```

## Project Structure

```
studium-ai/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma    # Database models
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic (aiService)
│   │   ├── middleware/      # Auth middleware
│   │   ├── utils/           # Prisma client, helpers
│   │   └── __tests__/       # Jest tests
│   └── uploads/             # Uploaded source files
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # Auth context
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS files
│   │   └── utils/           # API client
│   └── public/
└── CLAUDE.md
```

## Database Models

- **User**: Authentication and user data
- **Notebook**: User notebooks with title and content
- **Source**: Uploaded files linked to notebooks
- **Conversation**: Q&A sessions within notebooks
- **Message**: Individual messages in conversations

## Coding Conventions

### TypeScript
- Use `as string` for Express route params to avoid type errors
- Use `ReturnType<typeof setTimeout>` instead of `NodeJS.Timeout` in frontend code
- Prefer explicit type annotations for function parameters

### React
- Use functional components with hooks
- Use `useCallback` for functions passed as props or used in dependencies
- Add `// eslint-disable-next-line react-hooks/exhaustive-deps` when intentionally omitting dependencies

### API Responses
- Success: `{ data: ... }` or `{ notebooks: [], sources: [], etc. }`
- Error: `{ error: 'Error message' }`

### Testing
- Backend tests use Jest with ts-jest
- Coverage threshold: 75% (branches, functions, lines, statements)
- New controllers/services may be excluded from coverage in jest.config.js

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/studium
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Git Workflow

- Main branch: `main`
- Feature branches: `feature/description`
- Short, descriptive commit messages preferred
