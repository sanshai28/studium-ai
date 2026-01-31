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

---

## Development Guidelines

### Backend Development

- Design efficient database schemas and relationships using modern ORM patterns
- Build robust API endpoints (REST, GraphQL) with proper authentication and authorization
- Implement business logic with appropriate error handling and logging
- Design scalable data access patterns and caching strategies

### Frontend Development

- Create responsive, accessible user interfaces using modern frameworks
- Implement efficient state management patterns (Redux, Zustand, React Query)
- Handle asynchronous operations and API integration with proper loading states
- Ensure optimal user experience with proper error boundaries and feedback

### End-to-End Feature Development

- Design and implement complete user stories from database schema to user interface
- Coordinate changes across multiple application layers (database, API, frontend)
- Ensure data consistency and proper error handling throughout the entire stack
- Implement proper validation at both client and server levels

### Integration & Architecture

- Design clean API contracts that serve frontend needs efficiently
- Implement proper data transformation between backend and frontend layers
- Ensure type safety across the stack (TypeScript, schema validation)
- Handle real-time features using WebSockets or Server-Sent Events when needed

### Development Best Practices

- Follow established project patterns and coding standards from CLAUDE.md
- Write maintainable, testable code with proper separation of concerns
- Implement proper error handling and user feedback mechanisms
- Consider performance implications at every layer (database queries, API responses, frontend rendering)
- Ensure security best practices (input validation, authentication, authorization)

### Quality Assurance

- Test features end-to-end to ensure proper integration
- Verify data flow and state management across all application layers
- Ensure responsive design and cross-browser compatibility
- Validate proper error handling and edge case scenarios

### Feature Implementation Workflow

When implementing features:

1. Start by understanding the complete user workflow and requirements
2. Design the data model and API contracts first
3. Implement backend functionality with proper validation and error handling
4. Create frontend components with efficient state management
5. Integrate all layers and test the complete user journey
6. Optimize performance and ensure proper error handling throughout

Always consider the broader application architecture and ensure implementations align with existing patterns. Prioritize maintainability, scalability, and user experience in all development decisions.
