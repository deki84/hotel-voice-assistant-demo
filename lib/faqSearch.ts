/**
 * RAG-basierte FAQ-Suche über In-Memory-Embeddings.
 * Für den Demo-Umfang reicht ein einfaches Array statt eines
 * dedizierten Vector-Stores (Pinecone/Weaviate).
 */

import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const hotelFaqs = [
  "Check-in ist ab 15:00 Uhr möglich, Check-out bis spätestens 11:00 Uhr. Ein späterer Check-out bis 14:00 Uhr kostet 25 € Aufpreis, nach Verfügbarkeit.",
  "Ruhezeiten im Hotel Amara gelten von 22:00 Uhr bis 7:00 Uhr. Bitte auf Zimmernachbarn Rücksicht nehmen, besonders auf Fluren und Balkonen.",
  "Das Frühstücksbuffet im Restaurant 'Bibliothek' wird täglich von 6:30 bis 10:30 Uhr serviert, am Wochenende bis 11:00 Uhr. Das Restaurant öffnet abends von 18:00 bis 22:30 Uhr.",
  "Der Zimmerservice ist täglich von 7:00 bis 23:00 Uhr erreichbar, Bestellung telefonisch, per App oder digitalem Concierge. Lieferzeit 25 bis 35 Minuten.",
  "Kostenfreies WLAN ist in allen Zimmern und öffentlichen Bereichen verfügbar. Netzwerkname und Passwort stehen auf der Gästekarte am Nachttisch.",
  "Haustiere sind nach Anmeldung willkommen, Gebühr 15 € pro Nacht. In Restaurants und Wellnessbereich sind Haustiere aus Rücksicht auf Allergiker nicht gestattet.",
  "Das Hotel Amara ist ein Nichtraucherhotel. Rauchen ist nur auf der Terrasse im Erdgeschoss und der Raucherecke im Parkdeck erlaubt. Rauchen im Zimmer kostet 150 € Reinigungspauschale.",
  "Die Tiefgarage kostet 18 € pro Nacht, Einfahrt in der Seitenstraße rechts vom Haupteingang. Valet-Parking ist für 8 € Aufpreis zusätzlich buchbar.",
  "Sauna, Dampfbad und Fitnessraum sind täglich von 6:00 bis 22:00 Uhr kostenfrei für Hotelgäste zugänglich. Kinder unter 16 nur in Begleitung Erwachsener im Saunabereich.",
  "Akzeptierte Zahlungsmittel sind Visa, Mastercard, American Express, EC-Karte und Bargeld. Bei Anreise wird eine Kaution in Höhe einer Übernachtung auf der Kreditkarte hinterlegt.",
  "Kostenfreie Stornierung ist bis 18:00 Uhr am Anreisetag möglich. Bei späterer Stornierung oder Nichterscheinen wird die erste Nacht komplett berechnet.",
  "Fluchtwegpläne befinden sich an jeder Zimmertür, Sammelplatz ist der Vorplatz an der Hotel-Auffahrt. Die Rezeption ist rund um die Uhr über die interne Durchwahl 0 erreichbar.",
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