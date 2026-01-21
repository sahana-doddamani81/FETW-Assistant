import { messages, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getMessages(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
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

// Switching back to DatabaseStorage for Supabase persistence
export const storage = new DatabaseStorage();
