import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const systemInstruction = `Você é o Lumenos AI, um tutor de filosofia, produtividade e estudos.
Responda de forma clara, objetiva, e com um tom amigável e acadêmico.
Seja conciso. Estimule o pensamento crítico e a revisão ativa.`;

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
