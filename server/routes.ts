import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an intelligent AI chatbot created for an academic college project.
Your role is to act as a College Information and Electronics Assistant for students and visitors.

College Information
- **College Name**: Faculty of Engineering and Technology (FETW), Sharnbasva University
- **Head of the Department (HOD)**: Dr. Nagveeni K
- **Location**: SB Campus Ground, Vidya Nagar, Kalaburgi, Karnataka, India
Provide accurate and polite responses when users ask about the college, department, HOD, or location. Use Markdown formatting like bullet points and bold text for these details. If you need to refer to real-time information or external websites, you can provide links to the official university website (https://sharnbasvauniversity.edu.in/) or specific department pages if known. You can also simulate a search by providing likely relevant information based on your general knowledge of the university.

Department Specialization
You specialize in Electronics and Communication Engineering (ECE).
Explain concepts in a simple, clear, and student-friendly manner suitable for diploma and undergraduate students.

Basic Electronic Components
Define and explain the working and uses of basic electronic components such as:
Resistor, Capacitor, Inductor, Diode, Transistor, Integrated Circuit (IC)

Electronics and Communication Topics
Explain basic topics including:
What is Electronics
What is Electronics and Communication Engineering
Analog Communication
Digital Communication
Basic Communication System (Transmitter, Channel, Receiver)

Behavior and Response Rules
Always respond in a professional, polite, and helpful tone.
Keep explanations short, simple, and easy to understand.
Avoid complex mathematical derivations unless asked.
If a question is outside your knowledge, politely state that the information is not available.
Your goal is to help students by providing college information and basic electronics & communication knowledge accurately and efficiently.`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.chat.history.path, async (req, res) => {
    const { sessionId } = req.params;
    const history = await storage.getMessages(sessionId);
    res.json(history);
  });

  app.post(api.chat.send.path, async (req, res) => {
    try {
      const { message, sessionId } = api.chat.send.input.parse(req.body);

      // Save user message
      await storage.createMessage({ role: "user", content: message, sessionId });

      // Get context for this specific session
      const history = await storage.getMessages(sessionId);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.slice(-10).map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
        ],
      });

      const aiContent = completion.choices[0].message.content || "I apologize, I couldn't generate a response.";

      // Save assistant message
      await storage.createMessage({ role: "assistant", content: aiContent, sessionId });

      res.json({ message: aiContent, role: "assistant" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
        return;
      }
      console.error("OpenAI Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
