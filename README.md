# hotel-voice-assistant-demo

Ein funktionierender Prototyp, der zeigt, wie ein LLM per Function Calling
mit einem Backend-System (hier: einem Hotel-Verwaltungssystem) verbunden
werden kann, um einem Sprachassistenten Zugriff auf Live-Daten zu geben,
ohne selbst zu halluzinieren.

**Kernidee:** Ein Gast stellt eine natürlichsprachliche Frage → ein LLM
erkennt die Absicht → das LLM ruft eine definierte Funktion auf, die echte
Daten liefert → das LLM formuliert daraus eine natürliche Antwort.

Die Sprachfrage wird hier per Texteingabe simuliert (statt über einen
echten Voice-Skill wie Alexa oder Google Assistant), damit sich der
komplette Backend-Flow ohne Skill-Zertifizierung testen lässt. Die
Architektur ist 1:1 auf einen echten Voice-Client übertragbar.

## Warum dieses Projekt?

Sprachassistenten in Kombination mit LLMs sind ein wachsendes Feld,
gerade in der Hotellerie (Concierge-Anfragen, Zimmerservice, Check-out-
Infos). Das Kernproblem dabei: Ein LLM kennt keine aktuellen Live-Daten
und darf sie auch nicht raten. Dieses Projekt zeigt, wie man das sauber
löst — mit Function Calling statt Prompt-Halluzination.

## Architektur
```
Gast-Frage (Text hier, Voice in echt)
│
▼
Next.js Frontend
│ POST /api/chat
▼
Next.js API Route
│
▼
LLM-Aufruf (Groq, openai/gpt-oss-120b) mit definierten Tools
│
├── Fall A: Direkte Text-Antwort (z.B. Small Talk)
│
└── Fall B: LLM fordert Tool-Call an
│
▼
Tool-Dispatcher (lib/tools.ts)
│
▼
Backend-Datenquelle (lib/mockPMS.ts)
[in Produktion: HTTP-Call an ein echtes Hotel-Management-System]
│
▼
Ergebnis zurück ans LLM
│
▼
LLM formuliert finale, natürliche Antwort
```


## Zentrale Design-Entscheidung: Function Calling statt freier Textgenerierung

Ein LLM darf bei faktenkritischen Anfragen (Zimmerstatus, Check-out-Zeit,
Bestellungen) niemals selbst antworten, ohne echte Daten abgerufen zu
haben — das Risiko von Halluzinationen wäre in einem echten Hotelbetrieb
inakzeptabel. Deshalb:

- Das LLM bekommt nur **Werkzeuge** (Tool-Definitionen), keine Rohdaten
- Es **entscheidet selbst**, ob und welches Tool es für eine Anfrage braucht
- Der eigentliche Datenzugriff läuft **immer im eigenen Code**, nie im Modell
- `temperature` wird bewusst niedrig gehalten (0.3), um konsistente,
  sachliche Antworten statt kreativer Ausschmückungen zu erzwingen

## Setup

```bash
pnpm install
cp .env.example .env.local
# echten Groq API Key eintragen - kostenlos auf https://console.groq.com
pnpm run dev
```

Dann `http://localhost:3000` öffnen.

## Beispiel-Interaktionen

| Eingabe | Was passiert |
|---|---|
| "Ist Zimmer 204 schon geputzt?" | Tool `getRoomStatus` wird aufgerufen |
| "Wann ist Check-out für Zimmer 101?" | Tool `getCheckoutTime` wird aufgerufen |
| "Bitte ein Club Sandwich auf Zimmer 204 bestellen" | Tool `orderRoomService` wird aufgerufen |
| "Ist Zimmer 999 verfügbar?" | Testet Fehlerbehandlung bei unbekannter Ressource |
| "Wie geht's dir?" | Direkte Antwort ohne Tool-Aufruf (Small Talk) |

## Projektstruktur
```
├── lib/
│ ├── mockPMS.ts # Simulierte Backend-Datenquelle (Hotelzimmer, Bestellungen)
│ └── tools.ts # Tool-Definitionen + Dispatcher für Function Calling
├── pages/
│ ├── api/chat.ts # Orchestriert LLM-Aufruf + Tool-Ausführung
│ └── index.tsx # Einfache Chat-UI zum Testen
└── .env.example # Zeigt benötigte Umgebungsvariable
```

## Nächste Ausbaustufen

Bewusst nicht umgesetzt, um den Scope für einen Prototyp klein zu halten,
aber als konkrete nächste Schritte durchdacht:

- **RAG (Retrieval Augmented Generation)** für offene Fragen wie
  "Welche Restaurants gibt's in der Nähe?" — Hotel-FAQs und lokale Infos
  in einem Vector Store ablegen, per Embedding-Suche relevante Snippets
  in den Prompt einspeisen
- **MCP (Model Context Protocol)** als standardisierte Alternative zu
  eigenen Tool-Definitionen, um das LLM mit mehreren Backend-Systemen zu
  verbinden, ohne für jedes System eigene Schnittstellen zu schreiben
- **Echte Autorisierung** — prüfen, ob der anfragende Gast überhaupt
  Zugriff auf die angefragte Zimmernummer hat, bevor ein Tool ausgeführt wird
- **Anbindung an ein echtes Backend-System** statt der Mock-Datenschicht
  in `lib/mockPMS.ts`
- **Echte Voice-Integration** über einen Alexa- oder Google-Assistant-Skill

## Tech Stack

Next.js · React · TypeScript · Groq SDK (openai/gpt-oss-120b) · Function Calling
