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
      console.error("Database read error:", e);
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
      console.error("Database write error:", e);
      // Fallback or rethrow? For now, we'll rethrow to allow the route to handle it
      throw e;
    }
  }
}

// Default to DatabaseStorage but handle initialization gracefully
export const storage = new DatabaseStorage();
