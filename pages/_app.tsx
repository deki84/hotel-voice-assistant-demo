import type { AppProps } from "next/app";
import {useEffect, useState } from "react";
import { ClerkProvider, useUser, useClerk, SignInButton } from "@clerk/nextjs";
import { deDE } from "@clerk/localizations";
import "@/styles/globals.css";

function AppContent({ Component, pageProps }: AppProps) {
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();

const [guestMode, setGuestMode] = useState(false);
const [mounted, setMounted] = useState(false);


useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setMounted(true);
  if (localStorage.getItem("guestMode") === "true") {
    setGuestMode(true);
  }
}, []);

  function startGuestMode() {
    localStorage.setItem("guestMode", "true");
    setGuestMode(true);
  }

  function handleExit() {
    if (guestMode) {
      localStorage.removeItem("guestMode");
      setGuestMode(false);
    }
    if (isSignedIn) {
      signOut();
    }
  }

   const hasAccess = mounted && (isSignedIn || guestMode);
;

  if (!hasAccess) {
    return (
      <div style={gateStyles.scene}>
        <div style={gateStyles.overlay} />
        <div style={gateStyles.card}>
          <p style={gateStyles.eyebrow}>HOTEL AMARA</p>
          <h1 style={gateStyles.title}>Treten Sie ein</h1>
          <p style={gateStyles.subtitle}>
            Herzlich willkommen im Hotel Amara. Melden Sie sich an, um mit unserem digitalen Concierge zu sprechen.
          </p>

         <SignInButton mode="modal">
  <button className="primary-btn" style={gateStyles.primaryBtn}>Anmelden</button>
</SignInButton>

<button onClick={startGuestMode} className="secondary-btn" style={gateStyles.secondaryBtn}>
  Demo ausprobieren
</button>

         
        </div>
<style jsx global>{`
  .primary-btn {
    transition: border-color 0.25s ease, color 0.25s ease;
  }
  .primary-btn:hover {
    border-color: #B8935A !important;
    color: #E8C88A !important;
  }
  .secondary-btn {
    transition: border-color 0.25s ease, color 0.25s ease;
  }
  .secondary-btn:hover {
    border-color: #B8935A !important;
    color: #E8C88A !important;
  }
`}</style>
      </div>
    );
  }

  return (
    <>
      <button onClick={handleExit} style={exitBtnStyle} aria-label="Zurück zum Login">
        ← Zurück
      </button>
      <Component {...pageProps} />
    </>
  );
}

export default function App(props: AppProps) {
  return (
 
    <ClerkProvider
  localization={{ ...deDE, formButtonPrimary: "Login" }}
  appearance={{
    variables: {
      colorModalBackdrop: "rgba(10,8,20,0.35)",
    },
  }}
>



      <AppContent {...props} />
    </ClerkProvider>
  );
}

const exitBtnStyle: React.CSSProperties = {
  position: "fixed",
  top: 12,
  left: 12,
  zIndex: 50,
  background: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(8px)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 20,
  padding: "6px 14px",
  fontSize: 13,
  cursor: "pointer",
};

const gateStyles: Record<string, React.CSSProperties> = {
  scene: {
    position: "relative",
    minHeight: "100dvh",
    width: "100%",
    backgroundImage: "url(/hotel-lobby.jpeg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#0f0c16",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    boxSizing: "border-box",
    fontFamily: "system-ui, sans-serif",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(10,8,20,0.55) 0%, rgba(10,8,20,0.75) 100%)",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "min(92vw, 400px)",
    background: "rgba(20,16,30,0.85)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: "clamp(24px, 5vw, 40px)",
    textAlign: "center",
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  },
  eyebrow: { margin: 0, color: "#B8935A", fontSize: 12, letterSpacing: "2px", fontWeight: 600 },
  title: { margin: "8px 0 12px", color: "#fff", fontSize: "clamp(24px, 5vw, 30px)", fontWeight: 700 },
  subtitle: { margin: "0 0 28px", color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.5 },
primaryBtn: {
  width: "100%",
  background: "transparent",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: 12,
  padding: "14px",
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
  marginBottom: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "border-color 0.2s, background 0.2s",
},
secondaryBtn: {
  width: "100%",
  background: "transparent",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: 12,
  padding: "14px",
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
  marginBottom: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "border-color 0.2s, background 0.2s",
},

};