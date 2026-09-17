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


  }
`}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
scene: {
  position: "relative",
  minHeight: "100dvh",
  width: "100%",
  backgroundColor: "#0f0c16",
  backgroundImage: "url(/concierge.png)",
  backgroundSize: "cover",
  backgroundPosition: "center 20%",
  backgroundRepeat: "no-repeat",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  alignItems: "center",
  overflow: "hidden",
  fontFamily: "system-ui, sans-serif",
  padding: "clamp(1rem, 3vh, 2rem) clamp(0.75rem, 3vw, 1.5rem)",
  boxSizing: "border-box",
},
assistantBubbleWrap: {
  position: "absolute",
  top: "clamp(10vh, 15vh, 18vh)",
  left: "56%",
  width: "clamp(140px, 30vw, 280px)",
  zIndex: 3,
},
assistantBubble: {
  background: "rgba(255,255,255,0.98)",
  color: "#26215C",
  padding: "clamp(8px, 1.6vw, 14px) clamp(10px, 2vw, 16px)",
  borderRadius: 16,
  fontSize: "clamp(10px, 1.4vw, 13px)",
  lineHeight: 1.45,
  boxShadow: "0 14px 36px rgba(0,0,0,0.4)",
  maxHeight: "24vh",
  overflowY: "auto",
},
 
  characterImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(10,8,20,0.25) 0%, rgba(10,8,20,0) 30%, rgba(10,8,20,0.55) 100%)",
    zIndex: 1,
    pointerEvents: "none",
  },
 

  assistantTail: {
    position: "absolute",
    bottom: "-1.4vw",
    left: "1vw",
    width: "clamp(10px, 2.4vw, 18px)",
    height: "clamp(8px, 1.8vw, 14px)",
    display: "block",
    minWidth: 10,
    minHeight: 8,
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
    gap: "clamp(6px, 1.2vw, 8px)",
    justifyContent: "center",
    maxWidth: "min(94vw, 700px)",
    marginBottom: "clamp(10px, 2vh, 16px)",
  },
  exampleBtn: {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(8px)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 20,
    padding: "clamp(5px, 1vh, 7px) clamp(10px, 2vw, 14px)",
    fontSize: "clamp(11px, 1.4vw, 13px)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  inputBar: {
    position: "relative",
    zIndex: 4,
    width: "min(600px, 94vw)",
    display: "flex",
    alignItems: "center",
    gap: "clamp(6px, 1.5vw, 8px)",
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 30,
    padding: "clamp(6px, 1.2vw, 8px) clamp(6px, 1.2vw, 8px) clamp(6px, 1.2vw, 8px) clamp(14px, 3vw, 20px)",
    boxSizing: "border-box",
  },
  input: {
    flex: 1,
    minWidth: 0,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: "clamp(14px, 1.8vw, 15px)",
  },
  roundBtn: {
    width: "clamp(34px, 8vw, 40px)",
    height: "clamp(34px, 8vw, 40px)",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.25)",
    color: "white",
    fontSize: "clamp(14px, 2vw, 16px)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  roundBtnActive: { background: "#D85A30" },
};