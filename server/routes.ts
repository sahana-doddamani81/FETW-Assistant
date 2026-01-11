import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const COLLEGE_INFO = {
  name: "Faculty of Engineering and Technology (FETW), Sharnbasva University",
  hod: "Dr. Nagveeni K",
  location: "SB Campus Ground, Vidya Nagar, Kalaburgi, Karnataka, India",
  website: "https://sharnbasvauniversity.edu.in/",
};

const ECE_TOPICS: Record<string, string> = {
  "electronics": "Electronics is the branch of science and technology which deals with the flow and control of electrons in various media like vacuum, gas, and semiconductors.",
  "resistor": "A Resistor is a passive electronic component that opposes the flow of electric current. It is measured in Ohms (Ω).",
  "capacitor": "A Capacitor is a device that stores electrical energy in an electric field. It is measured in Farads (F).",
  "inductor": "An Inductor is a passive component that stores energy in a magnetic field when electric current flows through it.",
  "diode": "A Diode is a semiconductor device that allows current to flow in one direction only. It is commonly used for rectification.",
  "transistor": "A Transistor is a semiconductor device used to amplify or switch electrical signals and power.",
  "communication": "Communication Engineering involves the designing of systems for signal processing and transmission over long distances.",
  "analog": "Analog communication uses continuous signals to transmit information, like AM and FM radio.",
  "digital": "Digital communication uses discrete signals (0s and 1s) to transmit data, which is more reliable than analog.",
};

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

      const lowerMsg = message.toLowerCase();
      let response = "";

      // Rule-based logic
      if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
        response = `Hello! I am your FETW Assistant. How can I help you today? You can ask me about the college or basic electronics topics like resistors, capacitors, etc.`;
      } else if (lowerMsg.includes("college") || lowerMsg.includes("university")) {
        response = `You are asking about **${COLLEGE_INFO.name}**. It is located at ${COLLEGE_INFO.location}. You can visit our official website at ${COLLEGE_INFO.website} for more details.`;
      } else if (lowerMsg.includes("hod")) {
        response = `The Head of the Department (HOD) for ECE at FETW is **${COLLEGE_INFO.hod}**.`;
      } else if (lowerMsg.includes("location") || lowerMsg.includes("where")) {
        response = `Our campus is located at: **${COLLEGE_INFO.location}**.`;
      } else {
        // Check for ECE topics
        const foundTopic = Object.keys(ECE_TOPICS).find(topic => lowerMsg.includes(topic));
        if (foundTopic) {
          response = ECE_TOPICS[foundTopic];
        } else {
          response = "I'm a simple assistant designed for this project. I can help with information about FETW college, the ECE department, or basic concepts like resistors and capacitors. Please try asking about those!";
        }
      }

      // Save assistant message
      await storage.createMessage({ role: "assistant", content: response, sessionId });

      res.json({ message: response, role: "assistant" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
        return;
      }
      console.error("Chat Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
