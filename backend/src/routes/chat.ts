import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "../prisma.js";

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    // Fetch user context from the database
    const subjects = await prisma.subject.findMany({ select: { title: true } });
    const goals = await prisma.goal.findMany({ select: { title: true, progress: true } });
    const reflections = await prisma.reflection.findMany({ select: { title: true } });

    const subjectsList = subjects.map(s => s.title).join(", ") || "Nenhuma matéria cadastrada";
    const goalsList = goals.map(g => `${g.title} (${g.progress}%)`).join(", ") || "Nenhuma meta";
    const reflectionsList = reflections.map(r => r.title).join(", ") || "Nenhuma reflexão";

    const systemInstruction = `Você é o Lumenos AI, um tutor de filosofia, produtividade e estudos.
Responda de forma clara, objetiva, e com um tom amigável e acadêmico. Seja conciso.

CONTEXTO DO ALUNO (Use essas informações para responder perguntas sobre o que ele tem salvo no sistema):
- Matérias cadastradas: ${subjectsList}
- Metas atuais: ${goalsList}
- Últimas reflexões filosóficas: ${reflectionsList}`;

    // Convert OpenAI-like message history to Gemini format if needed, or just send a combined prompt.
    // For simplicity, we can pass the entire conversation history formatted as a single string
    // or use the chat session. Here we'll pass the conversation history.
    
    let conversationHistory = messages.map(m => `${m.role === 'user' ? 'Aluno' : 'Tutor'}: ${m.content}`).join("\n");
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nHistórico:\n${conversationHistory}\n\nResponda a última mensagem do aluno de forma natural:` }] }
      ],
      config: {
        temperature: 0.7,
      }
    });

    res.json({ message: response.text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message || "Error generating AI response" });
  }
});

export { router as chatRouter };
