import { z } from 'zod';
import { insertMessageSchema, messages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  chat: {
    send: {
      method: 'POST' as const,
      path: '/api/chat',
      input: z.object({
        message: z.string().min(1),
        sessionId: z.string(), // Client sends sessionId
      }),
      responses: {
        200: z.object({
          message: z.string(),
          role: z.literal("assistant"),
        }),
        500: errorSchemas.internal,
      },
    },
    // History is now session-specific
    history: {
      method: 'GET' as const,
      path: '/api/chat/history/:sessionId',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ChatResponse = z.infer<typeof api.chat.send.responses[200]>;
