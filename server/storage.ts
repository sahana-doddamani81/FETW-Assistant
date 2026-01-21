import { messages, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  getMessages(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private messages: Message[] = [];
  private currentId = 1;

  async getMessages(sessionId: string): Promise<Message[]> {
    return this.messages.filter(m => m.sessionId === sessionId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.currentId++,
      sessionId: insertMessage.sessionId ?? null,
      role: insertMessage.role,
      content: insertMessage.content,
      createdAt: new Date(),
    };
    this.messages.push(message);
    return message;
  }
}

// Reverting to MemStorage due to persistent Supabase connectivity issues (ENOTFOUND)
// This ensures the app stays running while the database connection is debugged.
export const storage = new MemStorage();
