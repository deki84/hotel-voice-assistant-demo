import { useState, useRef, SyntheticEvent } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_PROMPTS = [
  "Ist Zimmer 204 schon geputzt?",
  "Wann ist Check-out für Zimmer 101?",
  "Welche Restaurants gibt's in der Nähe?",
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Netzwerkfehler - lief der Server?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function startVoiceInput() {
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      alert("Speech Recognition wird von diesem Browser nicht unterstützt. Bitte Chrome oder Edge nutzen.");
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "de-DE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: MinimalSpeechRecognitionEvent) => {
      sendMessage(event.results[0][0].transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  return (
    <main style={styles.scene}>
      <div style={styles.vignette} />

    {loading && (
  <div style={styles.assistantBubbleWrap}>
    <div style={{ ...styles.assistantBubble, display: "flex", gap: 5, alignItems: "center" }}>
      <span style={styles.dot} />
      <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
      <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
    </div>
   
  </div>
)}

{lastAssistant && !loading && (
  <div style={styles.assistantBubbleWrap}>
    <div style={styles.assistantBubble}>{lastAssistant.content}</div>
 
  </div>
)}

  

   

      <div style={styles.examples}>
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button key={prompt} style={styles.exampleBtn} onClick={() => sendMessage(prompt)} disabled={loading}>
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.inputBar}>
        <button
          type="button"
          onClick={startVoiceInput}
          style={{ ...styles.roundBtn, ...(isListening ? styles.roundBtnActive : {}) }}
          disabled={loading}
          aria-label="Spracheingabe"
        >
          🎤
        </button>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Frag den Concierge..."
        />
        <button style={styles.roundBtn} type="submit" disabled={loading} aria-label="Senden">
          ➤
        </button>
      </form>

      <style jsx global>{`
        input::placeholder { color: rgba(255,255,255,0.6); }
        @keyframes pulse { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  scene: {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    backgroundImage: "url(/concierge.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
    fontFamily: "system-ui, sans-serif",
    paddingBottom: "2rem",
  },
stage: {
  position: "relative",
  width: "min(90vw, 480px)",
  aspectRatio: "800 / 1200", // ← ersetz mit DEINEN echten Bildmaßen
  marginBottom: "1.5rem",
},
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(10,8,20,0.5) 0%, rgba(10,8,20,0.05) 35%, rgba(10,8,20,0.7) 100%)",
    zIndex: 1,
    pointerEvents: "none",
  },
  character: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    height: "72vh",
    maxHeight: 620,
    width: "auto",
    objectFit: "contain",
    filter: "drop-shadow(0 25px 18px rgba(0,0,0,0.55))",
    zIndex: 2,
    pointerEvents: "none",
  },
assistantBubbleWrap: {
  position: "absolute",
  top: "22vh",
  left: "58%",
  width: "min(300px, 66vw)",
  zIndex: 3,
  transform: "translateY(-100%)",
},
assistantBubble: {
  background: "rgba(255,255,255,0.98)",
  color: "#26215C",
  padding: "16px 20px",
  borderRadius: 24,
  fontSize: 14.5,
  lineHeight: 1.5,
  boxShadow: "0 16px 44px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.15)",
  border: "1px solid rgba(255,255,255,0.6)",
  maxHeight: "32vh",
  overflowY: "auto",
},
assistantTail: {
  position: "absolute",
  bottom: -16,
  left: 22,
  display: "block",
  filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.2))",
},
  userBubbleWrap: { position: "absolute", top: "58%", left: "5%", maxWidth: 240, zIndex: 3 },
  userBubble: {
    background: "#3C3489",
    color: "#EEEDFE",
    padding: "12px 16px",
    borderRadius: 18,
    fontSize: 14,
    lineHeight: 1.4,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  userTail: {
    position: "absolute",
    bottom: -8,
    right: 24,
    width: 0,
    height: 0,
    borderLeft: "10px solid transparent",
    borderRight: "10px solid transparent",
    borderTop: "10px solid #3C3489",
  },
  dot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#7F77DD",
    animation: "pulse 1.4s infinite",
  },
  examples: {
    position: "relative",
    zIndex: 3,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    maxWidth: "90%",
    marginBottom: 16,
  },
  exampleBtn: {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(8px)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  inputBar: {
    position: "relative",
    zIndex: 4,
    width: "min(600px, 92vw)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 30,
    padding: "8px 8px 8px 20px",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: 15,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.25)",
    color: "white",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  roundBtnActive: { background: "#D85A30" },
};