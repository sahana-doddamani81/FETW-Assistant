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
      ...insertMessage,
      id: this.currentId++,
      createdAt: new Date(),
    };
    this.messages.push(message);
    return message;
  }
}

// Using MemStorage for ephemeral sessions as requested
export const storage = new MemStorage();
