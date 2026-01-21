import { messages, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getMessages(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(sessionId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.sessionId, sessionId));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
}

// Using DatabaseStorage for Supabase persistence
export const storage = new DatabaseStorage();
