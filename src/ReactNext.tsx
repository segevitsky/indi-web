import { useState, useEffect, useCallback, type ReactNode, type CSSProperties } from "react";

type Phase = "broken" | "crash" | "reveal" | "claude";

interface GlitchLine {
  top: string;
  h: number;
  o: number;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ============ STYLES ============
const colors = {
  bg: "#f8faff",
  dark: "#1e1b4b",
  darker: "#0f0a2e",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
  purpleSoft: "rgba(139,92,246,0.06)",
  white: "#ffffff",
  gray: "#94a3b8",
  grayDark: "#64748b",
  grayLight: "#e2e8f0",
  red: "#ef4444",
  green: "#22c55e",
  yellow: "#fbbf24",
  codeBg: "#1a1a2e",
  cardBg: "#14142B",
};

const fonts = {
  main: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
  code: "'SF Mono', 'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
};

// ============ SHARED COMPONENTS ============
function SlideLayout({ children, dark = false, centered = true, style = {} }: { children: ReactNode; dark?: boolean; centered?: boolean; style?: CSSProperties }) {
  const m = useIsMobile();
  return (
    <div style={{
      width: "100%", height: "100%",
      background: dark 
        ? `linear-gradient(180deg, ${colors.dark} 0%, ${colors.darker} 100%)`
        : `linear-gradient(135deg, ${colors.bg} 0%, #eef2ff 50%, #f5f3ff 100%)`,
      display: "flex", flexDirection: "column",
      alignItems: centered ? "center" : "flex-start",
      justifyContent: centered ? "center" : "flex-start",
      fontFamily: fonts.main, padding: m ? "24px 20px" : (centered ? "40px 80px" : "40px 60px"),
      position: "relative", overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ============ BROKEN INTRO SLIDES ============
function BrokenSlide({ clicks }: { clicks: number }) {
  const [glitchLines, setGlitchLines] = useState<GlitchLine[]>([]);
  const m = useIsMobile();
  const isGlitching = clicks >= 3;
  const isShaking = clicks >= 4;
  const idx = Math.min(clicks, 4);

  useEffect(() => {
    if (isGlitching) {
      const i = setInterval(() => setGlitchLines(
        Array.from({ length: 3 }, () => ({
          top: `${Math.random() * 100}%`,
          h: Math.random() * 3 + 1,
          o: Math.random() * 0.4 + 0.1,
        }))
      ), 150);
      return () => clearInterval(i);
    }
  }, [isGlitching]);

  const T = ["Beyond useEffect","Beyond use[object Object]","[object Object] [object Object]","undefined undefined","NaN NaN NaN NaN"];
  const S = ["Runtime API Monitoring Patterns for React Apps in Production","Runtime API [object Object] Patterns for undefined Apps","[object Object] for NaN Apps in null","Promise {<pending>}","Error: Cannot read properties of undefined"];
  const N = ["Segev Shoval","Segev undefined","[object Object] null","undefined undefined","NaN"];
  const R = ["Senior Frontend Developer  ·  Creator of Indi","Senior undefined Developer  ·  Creator of null","[object Object]  ·  [object Object]","undefined  ·  undefined","Error Error Error"];
  const C = ["ReactNext 2026  ·  Tel Aviv","React[object Object]  ·  Tel undefined","NaN  ·  null","undefined",""];
  const B = ["🟣","🟣","😟","😱",""];

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #f5f3ff 100%)",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
      animation: isShaking ? "shake 0.08s infinite" : "none",
      fontFamily: fonts.main,
    }}>
      <div style={{
        height: 44, background: "white", borderBottom: `1px solid ${colors.grayLight}`,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 7, flexShrink: 0,
      }}>
        {["#ef4444","#fbbf24","#22c55e"].map((c,i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ marginLeft: 12, fontSize: 12, fontWeight: 500, color: isGlitching ? colors.red : colors.gray }}>
          {isGlitching ? "⚠ undefined.pptx — Not Responding" : "presentation.pptx — Slide 1 of 19"}
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: m ? "0 24px" : "0 100px", position: "relative" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: m ? 150 : 300, height: m ? 150 : 300, borderRadius: "50%", background: isGlitching ? "rgba(239,68,68,0.06)" : colors.purpleSoft }} />
        
        <div style={{ fontSize: m ? (idx >= 3 ? 24 : 32) : (idx >= 3 ? 42 : 52), fontWeight: 800, color: idx >= 3 ? colors.red : colors.dark, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 16, transform: isGlitching ? `skewX(${Math.random()*3-1.5}deg)` : "none" }}>
          {T[idx]}
        </div>
        <div style={{ fontSize: m ? (idx >= 3 ? 13 : 16) : (idx >= 3 ? 18 : 22), color: idx >= 2 ? colors.purpleLight : "#6366f1", lineHeight: 1.5, marginBottom: m ? 24 : 48, maxWidth: 600, transform: isGlitching ? `translateX(${Math.random()*6-3}px)` : "none" }}>
          {S[idx]}
        </div>
        <div style={{ width: idx >= 3 ? 0 : m ? 50 : 80, height: 3, background: idx >= 2 ? colors.red : colors.purple, borderRadius: 2, marginBottom: m ? 16 : 28, transition: "all 0.5s" }} />
        <div style={{ fontSize: m ? 16 : 20, fontWeight: 600, color: idx >= 2 ? colors.gray : colors.dark, marginBottom: 6 }}>{N[idx]}</div>
        <div style={{ fontSize: m ? 12 : 15, color: colors.gray, marginBottom: 4 }}>{R[idx]}</div>
        <div style={{ fontSize: m ? 11 : 13, color: "#cbd5e1" }}>{C[idx]}</div>
        {B[idx] && <div style={{ position: "absolute", bottom: m ? 20 : 40, right: m ? 24 : 100, fontSize: m ? 32 : 48 }}>{B[idx]}</div>}
      </div>

      <div style={{ height: 4, background: colors.grayLight, flexShrink: 0 }}>
        <div style={{ height: "100%", width: isGlitching ? `${Math.random()*100}%` : "5%", background: isGlitching ? colors.red : colors.purple, borderRadius: 2 }} />
      </div>

      {isGlitching && glitchLines.map((l,i) => (
        <div key={i} style={{ position: "absolute", top: l.top, left: 0, right: 0, height: l.h, background: `rgba(239,68,68,${l.o})`, pointerEvents: "none" }} />
      ))}

      {isGlitching && (
        <div style={{ position: "absolute", bottom: 20, left: 20, background: "white", border: "1px solid #fecaca", borderRadius: 12, padding: m ? "8px 12px" : "10px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontFamily: fonts.code, fontSize: m ? 9 : 11, color: colors.red, maxWidth: m ? "90%" : "auto" }}>
          ⚠️ TypeError: Cannot read properties of undefined (reading 'slides')
        </div>
      )}
    </div>
  );
}

function CrashSlide() {
  const m = useIsMobile();
  return (
    <SlideLayout dark>
      <div style={{ fontSize: m ? 52 : 80, marginBottom: 24 }}>😰</div>
      <div style={{ fontSize: m ? 22 : 32, color: "#f87171", fontWeight: 700, marginBottom: 20 }}>Uncaught TypeError</div>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: m ? "16px 20px" : "24px 32px", maxWidth: 560, width: "95%" }}>
        <pre style={{ margin: 0, fontSize: m ? 11 : 14, fontFamily: fonts.code, color: "#e2e8f0", lineHeight: 2, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
{`Cannot read properties of undefined
(reading 'presentation')

at Speaker.openSlides (stage.js:1:1)
at ReactNext.startTalk (conf.js:NaN:NaN)
at Audience.wait (hope.js:0:undefined)`}
        </pre>
      </div>
      <div style={{ marginTop: 32, fontSize: 14, color: colors.grayDark, fontStyle: "italic" }}>
        Press any key to continue... if you dare
      </div>
    </SlideLayout>
  );
}

function RevealSlide() {
  const m = useIsMobile();
  return (
    <SlideLayout dark>
      <div style={{ fontSize: m ? 64 : 100, marginBottom: 24 }}>🟣</div>
      <div style={{ fontSize: m ? 24 : 40, color: "white", fontWeight: 800, textAlign: "center", maxWidth: 700, lineHeight: 1.3, letterSpacing: -1 }}>
        This is what happens when your<br/>API contracts break silently.
      </div>
      <div style={{ fontSize: m ? 15 : 22, color: colors.purpleLight, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
        No errors. No crashes. Debuggin' tools see nothing.<br/>
        Your presentation just became [object Object].
      </div>
      <div style={{ marginTop: m ? 28 : 48, fontSize: m ? 14 : 18, color: colors.gray }}>
        I'm Segev. Let's make sure this never happens to you.
      </div>
    </SlideLayout>
  );
}

function ClaudeCodeSlide() {
  const [copied, setCopied] = useState(false);
  const m = useIsMobile();

  const prompt = `Build a runtime API schema monitor for my React app.

1. Create useFetchInterceptor(callback)
   - Monkey-patch window.fetch
   - Clone every response, parse JSON
   - Call callback with { url, method, status, body }
   - Return original response untouched

2. Create learnSchema(schema, response)
   - Track every field: type, seen count, total count
   - Track absent fields (total++ but seen stays)
   - After 20 responses: seen/total = confidence

3. Create validate(schema, response, endpoint)
   - Check 1: required field missing (confidence >= 95%)
   - Check 2: type changed
   - Check 3: new unknown field (schema drift)
   - Return array of violations

4. Create SchemaProvider
   - Wrap the app, use useFetchInterceptor
   - First 20 calls per endpoint → learnSchema
   - After 20 → validate, log violations to console
   - Store schemas in localStorage

5. Wire it up:
   <SchemaProvider><App /></SchemaProvider>`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()} style={{
      width: "100%", height: "100%",
      background: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.darker} 100%)`,
      fontFamily: fonts.main, padding: m ? "20px 16px" : "32px 60px",
      display: "flex", flexDirection: "column",
      overflow: "auto", cursor: "default",
    }}>
      <div style={{
        display: "flex", alignItems: m ? "flex-start" : "center",
        flexDirection: m ? "column" : "row",
        justifyContent: "space-between",
        gap: m ? 12 : 0,
        marginBottom: 20, flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: m ? 20 : 28, fontWeight: 800, color: "white" }}>
            Give this to Claude Code 🟣
          </div>
          <div style={{ fontSize: m ? 12 : 14, color: colors.gray, marginTop: 4 }}>
            Copy → paste into Claude Code → 5 minutes
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{
            padding: m ? "10px 20px" : "12px 28px",
            background: copied ? colors.green : `linear-gradient(135deg, ${colors.purple}, #6366f1)`,
            color: "white", border: "none", borderRadius: 12,
            fontSize: m ? 13 : 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            transition: "all 0.2s", flexShrink: 0,
            width: m ? "100%" : "auto",
          }}
        >
          {copied ? "✓ Copied!" : "Copy to clipboard"}
        </button>
      </div>

      <div style={{
        background: colors.codeBg, borderRadius: m ? 12 : 16,
        padding: m ? "16px 16px" : "28px 32px", flex: 1,
        border: "1px solid rgba(139,92,246,0.15)",
        overflow: "auto",
      }}>
        <pre style={{
          margin: 0, fontSize: m ? 12 : 15, fontFamily: fonts.code,
          color: "#e2e8f0", lineHeight: 1.7, whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>{prompt}</pre>
      </div>

      <div style={{
        display: "flex", alignItems: m ? "flex-start" : "center",
        flexDirection: m ? "column" : "row",
        justifyContent: "space-between",
        gap: m ? 4 : 0,
        marginTop: m ? 12 : 20, flexShrink: 0,
      }}>
        <div style={{ fontSize: m ? 11 : 13, color: colors.grayDark }}>
          Want this as a managed service? I'm building it. It's called <span style={{ color: colors.purpleLight, fontWeight: 600 }}>Indi</span>.
        </div>
        <div style={{ fontSize: m ? 11 : 13, color: colors.grayDark }}>
          indimapper.com
        </div>
      </div>
    </div>
  );
}





// ============ MAIN APP ============
export default function Presentation() {
  const [phase, setPhase] = useState<Phase>("broken");
  const [brokenClicks, setBrokenClicks] = useState<number>(0);

  const handleNext = useCallback(() => {
    if (phase === "broken") {
      const next = brokenClicks + 1;
      setBrokenClicks(next);
      if (next >= 5) setPhase("crash");
    } else if (phase === "crash") {
      setPhase("reveal");
    } else if (phase === "reveal") {
      setPhase("claude");
    }
  }, [phase, brokenClicks]);

  const handlePrev = useCallback(() => {
    if (phase === "claude") {
      setPhase("reveal");
    } else if (phase === "reveal") {
      setPhase("crash");
    } else if (phase === "crash") {
      setBrokenClicks(4);
      setPhase("broken");
    } else if (phase === "broken") {
      setBrokenClicks(c => Math.max(c - 1, 0));
    }
  }, [phase]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase === "claude") return; // don't hijack keys on claude page
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); handleNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); handlePrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handlePrev, phase]);

  return (
    <div onClick={phase !== "claude" ? handleNext : undefined} style={{
      width: "100vw", height: "100vh", cursor: phase === "claude" ? "default" : "pointer",
      overflow: "hidden", position: "relative",
    }}>
      {phase === "broken" && <BrokenSlide clicks={brokenClicks} />}
      {phase === "crash" && <CrashSlide />}
      {phase === "reveal" && <RevealSlide />}
      {phase === "claude" && <ClaudeCodeSlide />}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0,0) rotate(0); }
          20% { transform: translate(-2px,1px) rotate(-0.3deg); }
          40% { transform: translate(2px,-1px) rotate(0.3deg); }
          60% { transform: translate(-1px,2px) rotate(-0.2deg); }
          80% { transform: translate(1px,-2px) rotate(0.2deg); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow: hidden; width: 100%; height: 100%; }
        body { -webkit-text-size-adjust: 100%; }
      `}</style>
    </div>
  );
}