import { useState, FormEvent } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_PROMPTS = [
  "Ist Zimmer 204 schon geputzt?",
  "Wann ist Check-out für Zimmer 101?",
  "Bitte ein Club Sandwich auf Zimmer 204 bestellen",
  "Was kann ich vom Room Service bestellen?",
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const replyText = res.ok ? data.reply : `Fehler: ${data.error}`;
      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Netzwerkfehler - lief der Server?" }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>RoomGrid Demo</h1>
        <p style={styles.subtitle}>Voice-first Guest-Experience — simuliert per Text statt Alexa/Google</p>
        <div style={styles.examples}>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button key={prompt} style={styles.exampleBtn} onClick={() => sendMessage(prompt)} disabled={loading}>
              {prompt}
            </button>
          ))}
        </div>
        <div style={styles.chatBox}>
          {messages.length === 0 && <p style={styles.placeholder}>Stell eine Frage oben, oder klick ein Beispiel an ↑</p>}
          {messages.map((msg, i) => (
            <div key={i} style={{ ...styles.bubble, ...(msg.role === "user" ? styles.userBubble : styles.assistantBubble) }}>
              <strong>{msg.role === "user" ? "Gast" : "RoomGrid"}:</strong> {msg.content}
            </div>
          ))}
          {loading && <div style={styles.placeholder}>RoomGrid tippt …</div>}
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} value={input} onChange={(e) => setInput(e.target.value)} placeholder="z.B. Ist Zimmer 310 sauber?" />
          <button style={styles.sendBtn} type="submit" disabled={loading}>Senden</button>
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0f172a", display: "flex", justifyContent: "center", padding: "2rem 1rem", fontFamily: "system-ui, sans-serif" },
  container: { width: "100%", maxWidth: 640 },
  title: { color: "#f8fafc", marginBottom: 4 },
  subtitle: { color: "#94a3b8", marginTop: 0, marginBottom: 24 },
  examples: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  exampleBtn: { background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer" },
  chatBox: { background: "#1e293b", borderRadius: 12, padding: 16, minHeight: 300, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 },
  placeholder: { color: "#64748b", fontStyle: "italic" },
  bubble: { padding: "10px 14px", borderRadius: 10, maxWidth: "85%" },
  userBubble: { background: "#334155", color: "#f1f5f9", alignSelf: "flex-end" },
  assistantBubble: { background: "#0ea5e9", color: "#f8fafc", alignSelf: "flex-start" },
  form: { display: "flex", gap: 8 },
  input: { flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f8fafc" },
  sendBtn: { background: "#0ea5e9", color: "white", border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontWeight: 600 },
};