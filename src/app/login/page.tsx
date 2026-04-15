"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  amber: "#F7B041", coral: "#E06347",
  bg: "#050508", tx: "#E8E4DD", txm: "#8A8690", txd: "#4E4B56",
  glassBorder: "rgba(255,255,255,0.06)",
};
const gf = "'Grift','Outfit',sans-serif";
const ft = "'Outfit',sans-serif";
const mn = "'JetBrains Mono',monospace";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: code }),
      });
      if (res.ok) {
        router.push("/internal");
      } else {
        setError(true);
        setCode("");
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Black.woff2') format('woff2'); font-weight: 900; font-style: normal; font-display: swap; }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: ${C.bg}; min-height: 100vh; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-12px); } 50% { transform: translateX(12px); } 75% { transform: translateX(-6px); } }
      `}</style>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${C.amber}0A 0%, transparent 60%), ${C.bg}`,
      }}>
        <div style={{ textAlign: "center", padding: 32, maxWidth: 400, width: "100%" }}>
          <div style={{ fontFamily: gf, fontSize: 28, fontWeight: 900, color: C.tx, marginBottom: 8, letterSpacing: "-1px" }}>Internal Access</div>
          <p style={{ fontFamily: ft, fontSize: 14, color: C.txm, marginBottom: 32, lineHeight: 1.6 }}>
            Enter the team passcode to access analytics, ops tools, and campaign management.
          </p>
          <div style={{ animation: error ? "shake 0.4s ease" : "none" }}>
            <input
              type="password"
              value={code}
              onChange={e => { setCode(e.target.value); setError(false); }}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="Passcode"
              autoFocus
              style={{
                width: "100%", padding: "14px 18px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${error ? C.coral : C.glassBorder}`,
                borderRadius: 12, color: C.tx, fontFamily: mn, fontSize: 16,
                outline: "none", textAlign: "center", letterSpacing: "4px",
                transition: "border-color 0.3s ease",
              }}
            />
          </div>
          {error && <div style={{ fontFamily: mn, fontSize: 11, color: C.coral, marginTop: 12 }}>Invalid passcode</div>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", marginTop: 16, fontFamily: ft, fontSize: 14, fontWeight: 800,
              color: "#060608", background: `linear-gradient(135deg, ${C.amber}, #E8A020)`,
              padding: "14px", borderRadius: 12, border: "none",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: `0 4px 20px ${C.amber}30`,
            }}
          >
            {loading ? "Verifying..." : "Unlock"}
          </button>
          <a href="/" style={{ display: "block", fontFamily: mn, fontSize: 11, color: C.txd, marginTop: 24, textDecoration: "none" }}>
            {"\u2190"} Back to site
          </a>
        </div>
      </div>
    </>
  );
}
