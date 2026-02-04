import { z } from 'zod';

// Auth validation schemas
export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const passwordResetRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

export const passwordResetSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

// Notebook validation schemas
export const createNotebookSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    content: z.string().default(''),
  }),
});

export const updateNotebookSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid notebook ID'),
  }),
});

export const notebookIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notebook ID'),
  }),
});

// Source validation schemas
export const sourceParamsSchema = z.object({
  params: z.object({
    notebookId: z.string().uuid('Invalid notebook ID'),
  }),
});

export const sourceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid source ID'),
  }),
});

// Conversation validation schemas
export const conversationParamsSchema = z.object({
  params: z.object({
    notebookId: z.string().uuid('Invalid notebook ID'),
  }),
});

export const conversationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid conversation ID'),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid conversation ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Message content is required').max(10000, 'Message too long'),
  }),
});

// Type exports for use in controllers
export type SignupInput = z.infer<typeof signupSchema>['body'];
export type SigninInput = z.infer<typeof signinSchema>['body'];
export type CreateNotebookInput = z.infer<typeof createNotebookSchema>['body'];
export type UpdateNotebookInput = z.infer<typeof updateNotebookSchema>['body'];
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
