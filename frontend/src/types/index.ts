/**
 * Shared TypeScript types for the frontend application
 */

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
}

// Notebook types
export interface Notebook {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotebookData {
  title: string;
  content: string;
}

export interface UpdateNotebookData {
  title?: string;
  content?: string;
}

// Source types
export interface Source {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

// Conversation types
export interface Conversation {
  id: string;
  notebookId: string;
  createdAt: string;
  updatedAt: string;
}

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface NotebooksResponse {
  notebooks: Notebook[];
}

export interface NotebookResponse {
  notebook: Notebook;
}

export interface SourcesResponse {
  sources: Source[];
}

export interface SourceResponse {
  source: Source;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface ConversationResponse {
  conversation: Conversation;
}

export interface MessagesResponse {
  messages: Message[];
}

export interface MessageResponse {
  message: Message;
  aiResponse: Message;
}

// Auth types
export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}
