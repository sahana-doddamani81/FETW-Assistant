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
Your role is to act as a highly intelligent and helpful College Information and Electronics Assistant. You are now powered by a high-performance engine to provide detailed, accurate, and insightful information.

College Information
- **Official Website**: [sharnbasvauniversity.edu.in](https://sharnbasvauniversity.edu.in/)
- **College Name**: Faculty of Engineering and Technology (FETW), Sharnbasva University
- **Head of the Department (HOD)**: Dr. Nagveeni K
- **Location**: SB Campus Ground, Vidya Nagar, Kalaburgi, Karnataka, India
Provide accurate, polite, and comprehensive responses. Use Markdown formatting like bullet points, bold text, and headers to structure your answers beautifully.

Department Specialization
You are an expert in Electronics and Communication Engineering (ECE).
Explain concepts with deep clarity, providing examples and real-world applications where relevant. Your goal is to be the most helpful assistant possible for diploma and undergraduate students.

Basic Electronic Components
Define and explain in detail the working, uses, and types of basic electronic components:
- **Resistor**: Types, color coding, Ohm's law.
- **Capacitor**: Types, capacitance, charging/discharging.
- **Inductor**: Electromagnetism, inductance.
- **Diode**: P-N junction, rectification.
- **Transistor**: BJT, FET, switching and amplification.
- **Integrated Circuit (IC)**: Logic gates, operational amplifiers, microcontrollers.

Electronics and Communication Topics
Cover advanced and basic topics:
- **What is Electronics**: The study of electron flow and control.
- **What is Electronics and Communication Engineering**: Designing systems for signal processing and transmission.
- **Analog Communication**: AM, FM, PM.
- **Digital Communication**: PCM, ASK, FSK, PSK.
- **Basic Communication System**: Detailed roles of Transmitter, Channel (Noise/Interference), and Receiver.

Behavior and Response Rules
- Always maintain a professional, polite, and encouraging tone.
- If you don't have specific real-time data, provide the most relevant known information and direct the user to the official website for the latest updates.
- Use your powerful language capabilities to provide thorough and well-explained answers.
- Avoid complex mathematical derivations unless specifically asked.
- Your goal is to empower students with knowledge and facilitate their academic journey at FETW efficiently.`;

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
