import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "../prisma.js";
import { getAuthFilter } from "../middleware/auth.js";

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Fetch the subject
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, ...getAuthFilter(req.user) }
    });

    if (!subject) {
      return res.status(404).json({ error: "Matéria não encontrada" });
    }

    if (!subject.content && subject.imageUrls.length === 0) {
      return res.status(400).json({ error: "Nenhum conteúdo ou imagem para resumir." });
    }

    // Process images
    const imageParts: Array<{ inlineData: { mimeType: string, data: string } }> = [];
    
    for (const url of subject.imageUrls) {
      try {
        const imageRes = await fetch(url);
        if (!imageRes.ok) continue;
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
        
        imageParts.push({
          inlineData: {
            mimeType,
            data: base64
          }
        });
      } catch (err) {
        console.error(`Failed to download image ${url}:`, err);
      }
    }

    const systemInstruction = `Você é o Lumenos AI, um tutor hiper-inteligente especializado em transformar anotações bagunçadas, textos longos e fotos de cadernos/lousas em resumos extremamente didáticos e organizados.
Use formatação em Markdown:
- Títulos curtos
- Bullet points
- Termos chave em **negrito**
Seja conciso, mas não perca a essência do conteúdo.`;

    let userPrompt = `Por favor, resuma e explique o seguinte conteúdo da matéria "${subject.title}".\n\nAnotações do aluno:\n${subject.content}`;
    
    if (imageParts.length > 0) {
      userPrompt += `\n\n[As imagens anexadas contêm fotos do caderno/lousa ou páginas de PDF.]`;
    }

    const contents = [
      {
        role: "user",
        parts: [
          { text: `${systemInstruction}\n\n${userPrompt}` },
          ...imageParts
        ]
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        temperature: 0.3,
      }
    });

    const aiSummary = response.text;

    if (!aiSummary) {
      throw new Error("Empty response from AI");
    }

    // Save summary
    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: { aiSummary }
    });

    res.json(updatedSubject);
  } catch (error: any) {
    console.error("Summarize Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary" });
  }
});

export { router as summarizeRouter };
