import type { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";
import { toolDefinitions, executeTool } from "../../lib/tools";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Du bist der Voice-Assistent eines Hotels (RoomGrid-Demo).
Antworte immer kurz, freundlich und auf Deutsch - wie ein Concierge, nicht wie ein Chatbot.
WICHTIG: Antworte in MAXIMAL 1-2 kurzen Sätzen. Keine langen Erklärungen oder Aufzählungen.
Nutze IMMER die verfügbaren Tools, wenn es um konkrete Zimmerdaten, Check-out-Zeiten
oder Bestellungen geht. Erfinde niemals Daten, die du nicht über ein Tool bekommen hast.
Wenn eine Zimmernummer fehlt, frage kurz danach.
Nenne NIEMALS interne Status-Codes oder Feldnamen wörtlich (z.B. "in_progress", "clean", "dirty") -
übersetze sie immer in natürliche Sprache (z.B. "wird gerade gereinigt", "ist bereits sauber").
Verwende keine Markdown-Formatierung wie Sternchen oder Bulletpunkte, nur reinen Fließtext.`;

type ChatResponse = { reply: string } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatResponse>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Nur POST erlaubt" });

  const { message } = req.body as { message?: string };
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Feld 'message' fehlt oder ist ungültig" });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY fehlt. Bitte .env.local anlegen." });
  }

  try {
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ];

    const firstResponse = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      tools: toolDefinitions,
      temperature: 0.3,
      max_tokens: 300,
    });

    const firstMessage = firstResponse.choices[0].message;
    const toolCalls = firstMessage.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      return res.status(200).json({ reply: firstMessage.content ?? "" });
    }

    messages.push(firstMessage);

    for (const toolCall of toolCalls) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await executeTool(toolCall.function.name, args);
      messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) });
    }

    const secondResponse = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      temperature: 0.3,
      max_tokens: 300,
    });

    return res.status(200).json({ reply: secondResponse.choices[0].message.content ?? "" });
  } catch (err) {
    console.error("Fehler in /api/chat:", err);
    return res.status(500).json({ error: "Interner Fehler beim Verarbeiten der Anfrage." });
  }
}