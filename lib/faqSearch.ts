/**
 * RAG-basierte FAQ-Suche über In-Memory-Embeddings.
 * Für den Demo-Umfang reicht ein einfaches Array statt eines
 * dedizierten Vector-Stores (Pinecone/Weaviate).
 */

import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const hotelFaqs = [
  "Das Restaurant Alpenblick liegt 200m vom Hotel entfernt und bietet bayerische Küche.",
  "Ruhezeiten im Hotel sind von 22:00 bis 7:00 Uhr.",
  "Der nächste Supermarkt hat täglich bis 22 Uhr geöffnet, 5 Gehminuten entfernt.",
  "Der Frühstücksraum öffnet um 6:30 Uhr und schließt um 10:30 Uhr.",
  "WLAN-Passwort für Gäste: siehe Karte auf dem Nachttisch.",
];

// Cache: einmal berechnete Embeddings nicht bei jedem Request neu holen
let faqEmbeddings: { text: string; embedding: number[] }[] | null = null;

async function embed(text: string): Promise<number[]> {
  const response = await mistral.embeddings.create({
    model: "mistral-embed",
    inputs: [text],
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error("Mistral hat kein Embedding zurückgegeben");
  }

  return embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

async function getFaqEmbeddings() {
  if (faqEmbeddings) return faqEmbeddings; // schon berechnet, aus Cache
  faqEmbeddings = await Promise.all(
    hotelFaqs.map(async (text) => ({ text, embedding: await embed(text) }))
  );
  return faqEmbeddings;
}

/** Findet die relevanteste FAQ zu einer Nutzerfrage */
export async function searchFaq(query: string): Promise<string> {
  const queryEmbedding = await embed(query);
  const faqs = await getFaqEmbeddings();

  const scored = faqs.map((faq) => ({
    text: faq.text,
    score: cosineSimilarity(queryEmbedding, faq.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0].text;
}