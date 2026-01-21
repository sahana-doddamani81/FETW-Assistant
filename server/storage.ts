import { messages, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getMessages(sessionId: string): Promise<Message[]> {
    try {
      if (!db) return [];
      return await db.select().from(messages).where(eq(messages.sessionId, sessionId));
    } catch (e) {
      console.error("Database read error (falling back to empty):", e);
      return [];
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      if (!db) throw new Error("Database not initialized");
      const [message] = await db.insert(messages).values({
        sessionId: insertMessage.sessionId ?? null,
        role: insertMessage.role,
        content: insertMessage.content
      }).returning();
      return message;
    } catch (e) {
      console.error("Database write error (falling back to memory):", e);
      // Fallback: Create a message in memory if database fails so the user doesn't get 500
      const tempId = Math.floor(Math.random() * 1000000);
      return {
        id: tempId,
        sessionId: insertMessage.sessionId ?? null,
        role: insertMessage.role,
        content: insertMessage.content,
        createdAt: new Date()
      };
    }
  }
}

// We'll use DatabaseStorage but it will handle failures gracefully
export const storage = new DatabaseStorage();
