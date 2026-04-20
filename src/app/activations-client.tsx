// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import { SiteConfigContext, useSiteConfig } from "@/config/site-config";
import type { SiteConfig, ActivationStatus } from "@/config/site-config";

// Shared state: Budget Strategizer pushes suggested events → Interest Form pre-fills
type PlanContextShape = {
  plan: string[];
  setPlan: (events: string[]) => void;
};
const PlanContext = createContext<PlanContextShape>({ plan: [], setPlan: () => {} });
function usePlan() { return useContext(PlanContext); }

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════ */
const C = {
  amber: "#F7B041", blue: "#0B86D1", teal: "#2EAD8E", coral: "#E06347",
  violet: "#905CCB", cyan: "#26C9D8",
  bg: "#050508", card: "rgba(255,255,255,0.03)", surface: "#0a0a12",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
  tx: "#E8E4DD", txm: "#8A8690", txd: "#4E4B56",
  glass: "rgba(255,255,255,0.03)", glassBorder: "rgba(255,255,255,0.06)",
};
const gf = "'Grift','Outfit',sans-serif";
const ft = "'Outfit',sans-serif";
const mn = "'JetBrains Mono',monospace";

/* Partner-aware status labels */
function useStatusConfig() {
  const { partner } = useSiteConfig();
  return {
    proposed:   { label: "Proposed",                   color: C.txm,     bg: "rgba(255,255,255,0.04)", icon: "\u25CB" },
    interested: { label: `${partner.name} Interested`, color: partner.color, bg: partner.color + "12", icon: "\u25C9" },
    activated:  { label: `${partner.name} Activated`,  color: "#4ADE80", bg: "#4ADE8015",              icon: "\u2713" },
  } as Record<ActivationStatus, { label: string; color: string; bg: string; icon: string }>;
}


/* ═══════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════ */
function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, ...style }}>{children}</div>;
}

function AnimatedStat({ value, label, sub }: { value: string; label: string; sub: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!vis) return;
    const numMatch = value.match(/[\d,]+/);
    if (!numMatch) { setDisplay(value); return; }
    const target = parseInt(numMatch[0].replace(/,/g, ""), 10);
    const suffix = value.replace(numMatch[0], "");
    const prefix = value.indexOf(numMatch[0]) > 0 ? value.slice(0, value.indexOf(numMatch[0])) : "";
    let step = 0;
    const steps = 40;
    const inc = target / steps;
    const timer = setInterval(() => { step++; const cur = Math.min(Math.round(inc * step), target); setDisplay(prefix + cur.toLocaleString() + suffix); if (step >= steps) clearInterval(timer); }, 30);
    return () => clearInterval(timer);
  }, [vis, value]);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: mn, fontSize: 44, fontWeight: 700, background: `linear-gradient(135deg, ${C.amber}, #E8A020)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: 8, letterSpacing: "-2px" }}>{display}</div>
      <div style={{ fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.tx, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: ft, fontSize: 12, color: C.txm }}>{sub}</div>
    </div>
  );
}

function AudienceBar({ label, pct, color, delay }: { label: string; pct: number; color: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setWidth(pct), delay); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: ft, fontSize: 14, color: C.tx }}>{label}</span>
        <span style={{ fontFamily: mn, fontSize: 13, color }}>{pct}%</span>
      </div>
      <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: width + "%", height: "100%", background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 3, transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
    </div>
  );
}

function LogoWithFallback({ src, name, height, invert }: { src: string; name: string; height: number; invert?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <span style={{
        fontFamily: gf, fontSize: height * 0.7, fontWeight: 800,
        color: invert ? "#fff" : C.tx, letterSpacing: "-0.5px",
      }}>{name}</span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      style={{ height, objectFit: "contain", filter: invert ? "brightness(0) invert(1)" : undefined }}
    />
  );
}

function GlassCard({ children, style, hover }: { children: React.ReactNode; style?: React.CSSProperties; hover?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: C.glass,
        backdropFilter: "blur(20px)",
        border: `1px solid ${h && hover ? C.borderHover : C.glassBorder}`,
        borderRadius: 20,
        transition: "all 0.3s ease",
        boxShadow: h && hover ? "0 8px 40px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.2)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR TOC — Apple-style hover rail
   ═══════════════════════════════════════════════════════════ */
const TOC_ITEMS = [
  { id: "hero", label: "Overview" },
  { id: "stats", label: "By the Numbers" },
  { id: "events", label: "Events" },
  { id: "track-record", label: "Track Record" },
  { id: "why", label: "Why Us" },
  { id: "benefits", label: "Benefits" },
  { id: "tiers", label: "Tiers" },
  { id: "strategize", label: "Strategize" },
  { id: "close", label: "Why Now" },
  { id: "cta", label: "Partner" },
];

function SidebarTOC() {
  const [activeId, setActiveId] = useState("hero");
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-spy: track which section is in view
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibleSections = new Map<string, number>();

    TOC_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio);
          } else {
            visibleSections.delete(id);
          }
          // Pick the section with the highest visibility
          let bestId = "hero";
          let bestRatio = 0;
          visibleSections.forEach((ratio, sId) => {
            if (ratio > bestRatio) { bestRatio = ratio; bestId = sId; }
          });
          setActiveId(bestId);
        },
        { threshold: [0, 0.1, 0.3, 0.5], rootMargin: "-80px 0px -40% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 90,
        display: "flex",
        alignItems: "flex-start",
        opacity: scrolled ? 1 : 0,
        pointerEvents: scrolled ? "auto" : "none",
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Hover trigger zone */}
      <div style={{ width: 24, height: 300, cursor: "pointer" }} />

      {/* TOC panel */}
      <div style={{
        background: "#050508E8",
        backdropFilter: "blur(20px)",
        border: `1px solid ${C.glassBorder}`,
        borderLeft: "none",
        borderRadius: "0 16px 16px 0",
        padding: hovered ? "16px 20px 16px 16px" : "16px 10px 16px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        boxShadow: hovered ? "4px 0 24px rgba(0,0,0,0.3)" : "none",
      }}>
        {TOC_ITEMS.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 4px",
                textDecoration: "none",
                transition: "all 0.2s ease",
                borderRadius: 8,
              }}
            >
              {/* Dot indicator */}
              <div style={{
                width: isActive ? 8 : 5,
                height: isActive ? 8 : 5,
                borderRadius: "50%",
                background: isActive ? C.amber : C.txd,
                flexShrink: 0,
                transition: "all 0.3s ease",
                boxShadow: isActive ? `0 0 8px ${C.amber}60` : "none",
              }} />

              {/* Label — slides in on hover */}
              <span style={{
                fontFamily: ft,
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? C.amber : C.txm,
                whiteSpace: "nowrap",
                opacity: hovered ? 1 : 0,
                transform: hovered ? "translateX(0)" : "translateX(-8px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                maxWidth: hovered ? 120 : 0,
                overflow: "hidden",
                letterSpacing: isActive ? "0.3px" : "0px",
              }}>
                {label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: mn, fontSize: 11, color: C.amber, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>{children}</div>;
}

function GlowDivider({ color = C.amber }: { color?: string }) {
  return (
    <div style={{ position: "relative", height: 1, margin: "0 auto", maxWidth: 1100 }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
      <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 200, height: 40, background: `radial-gradient(ellipse, ${color}12 0%, transparent 70%)`, pointerEvents: "none" }} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: gf, fontSize: 42, fontWeight: 800, color: C.tx, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-1px" }}>{children}</h2>;
}

/* ═══════════════════════════════════════════════════════════
   EXPANDABLE EVENT CARD
   ═══════════════════════════════════════════════════════════ */
function EventCard({ ev, index }: { ev: SiteConfig["events"][0]; index: number }) {
  const { tagColors, partner } = useSiteConfig();
  const STATUS_CONFIG = useStatusConfig();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const col = tagColors[ev.tag] || C.amber;
  const st = STATUS_CONFIG[ev.status];
  const isActivated = ev.status === "activated";
  const isInterested = ev.status === "interested";
  const borderAccent = isActivated ? "#4ADE80" : isInterested ? partner.color : col;

  return (
    <FadeIn delay={index * 60}>
      <div style={{
        background: isActivated ? "rgba(74,222,128,0.03)" : isInterested ? `${partner.color}05` : C.glass,
        backdropFilter: "blur(20px)",
        border: `1px solid ${open ? borderAccent + "40" : isActivated ? "#4ADE8025" : isInterested ? partner.color + "20" : C.glassBorder}`,
        borderRadius: 20,
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: open ? `0 12px 48px ${borderAccent}15` : isActivated ? `0 2px 20px rgba(74,222,128,0.08)` : "0 2px 12px rgba(0,0,0,0.2)",
        position: "relative",
      }}>
        {/* Activated top bar */}
        {(isActivated || isInterested) && (
          <div style={{ height: 3, background: isActivated ? "linear-gradient(90deg, #4ADE80, #22C55E)" : `linear-gradient(90deg, ${partner.color}, ${partner.color}88)` }} />
        )}

        {/* Card header — always visible */}
        <div
          onClick={() => setOpen(!open)}
          style={{ padding: "28px 24px", cursor: "pointer", position: "relative", overflow: "hidden" }}
        >
          {/* Color glow */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: `radial-gradient(circle, ${borderAccent}15 0%, transparent 70%)`, borderRadius: "50%", transition: "opacity 0.3s ease", opacity: open ? 1 : 0.5 }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{
                fontFamily: mn, fontSize: 9, letterSpacing: "1px",
                color: st.color, background: st.bg,
                border: `1px solid ${st.color}30`,
                borderRadius: 20, padding: "3px 10px",
                fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ fontSize: 10 }}>{st.icon}</span> {st.label}
              </span>
              <span style={{ fontFamily: mn, fontSize: 9, letterSpacing: "1.5px", color: col, background: col + "15", border: `1px solid ${col}25`, borderRadius: 20, padding: "3px 10px", textTransform: "uppercase", fontWeight: 700 }}>{ev.tag}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Event logo */}
                <div style={{ width: 48, height: 48, borderRadius: 12, background: isActivated ? "rgba(74,222,128,0.08)" : isInterested ? partner.color + "10" : "rgba(255,255,255,0.06)", border: `1px solid ${isActivated ? "#4ADE8020" : isInterested ? partner.color + "20" : C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  <img src={ev.logo} alt={ev.name} style={{ width: 36, height: 36, objectFit: "contain", filter: ev.logo.endsWith(".svg") ? "brightness(0) invert(1)" : "none" }} />
                </div>
                <div>
                  <div style={{ fontFamily: gf, fontSize: 24, fontWeight: 800, color: C.tx, letterSpacing: "-0.5px" }}>{ev.name}</div>
                </div>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: 10, border: `1px solid ${C.glassBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease", fontSize: 14, color: C.txm,
              }}>
                {"\u25BC"}
              </div>
            </div>

            <div style={{ fontFamily: mn, fontSize: 12, color: col }}>{ev.dates}</div>
            <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, margin: "4px 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ opacity: 0.5 }}>{"\u25CB"}</span>{ev.location}
            </div>
            <div style={{ fontFamily: ft, fontSize: 14, fontWeight: 700, color: col, paddingTop: 12, borderTop: `1px solid ${C.glassBorder}` }}>{ev.activation}</div>
          </div>
        </div>

        {/* Expanded content */}
        <div style={{
          maxHeight: open ? 2000 : 0,
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
        }}>
          <div style={{ padding: "0 24px 28px", borderTop: `1px solid ${C.glassBorder}` }}>
            {/* About */}
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>About This Event</div>
              <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7 }}>{ev.about}</div>
            </div>

            {/* Audience */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Who's In the Room</div>
              <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7 }}>{ev.audience}</div>
            </div>

            {/* Our Plan */}
            <div style={{ background: col + "08", border: `1px solid ${col}20`, borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Our Activation Plan</div>
              <div style={{ fontFamily: ft, fontSize: 14, color: C.tx, lineHeight: 1.7 }}>{ev.ourPlan}</div>
            </div>

            {/* Why It Matters */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>Why It Matters for {partner.name}</div>
              <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7 }}>{ev.whyItMatters}</div>
            </div>

            {/* Step-by-step process */}
            <div style={{ fontFamily: mn, fontSize: 10, color: col, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Activation Process</div>

            {/* Step tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
              {ev.activationSteps.map((step, si) => (
                <button
                  key={si}
                  onClick={(e) => { e.stopPropagation(); setActiveStep(si); }}
                  style={{
                    fontFamily: mn, fontSize: 10, fontWeight: activeStep === si ? 700 : 500,
                    color: activeStep === si ? "#060608" : C.txm,
                    background: activeStep === si ? `linear-gradient(135deg, ${col}, ${col}cc)` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${activeStep === si ? col : C.glassBorder}`,
                    borderRadius: 10, padding: "8px 14px", cursor: "pointer",
                    transition: "all 0.2s ease", letterSpacing: "0.5px",
                  }}
                >
                  {step.phase}
                </button>
              ))}
            </div>

            {/* Active step content */}
            {ev.activationSteps[activeStep] && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.glassBorder}`, borderRadius: 14, padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontFamily: ft, fontSize: 16, fontWeight: 800, color: C.tx }}>{ev.activationSteps[activeStep].phase}</div>
                  <span style={{ fontFamily: mn, fontSize: 11, color: col }}>{ev.activationSteps[activeStep].timing}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ev.activationSteps[activeStep].tasks.map((task, ti) => (
                    <div key={ti} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `1px solid ${col}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <div style={{ fontFamily: mn, fontSize: 9, color: col }}>{ti + 1}</div>
                      </div>
                      <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, lineHeight: 1.5 }}>{task}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR VIEW
   ═══════════════════════════════════════════════════════════ */
function CalendarView() {
  const { events: EVENTS } = useSiteConfig();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const startDays = [4, 0, 0, 3, 5, 1, 3, 6, 2, 4, 0, 2]; // 2026 first-day-of-month (0=Sun)

  function getEventsForDay(monthIdx: number, day: number) {
    return EVENTS.filter(ev => {
      if (ev.monthIndex !== monthIdx) return false;
      return day >= ev.dayStart && day <= ev.dayEnd;
    });
  }

  // Only show months that have events (any month with at least one event)
  const activeMonths = Array.from(new Set(EVENTS.map(e => e.monthIndex))).sort((a, b) => a - b);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
      {activeMonths.map(mi => {
        const days = daysInMonth[mi];
        const startDay = startDays[mi];
        const cells = [];
        // Empty cells for start offset
        for (let i = 0; i < startDay; i++) cells.push(null);
        for (let d = 1; d <= days; d++) cells.push(d);

        return (
          <FadeIn key={mi} delay={activeMonths.indexOf(mi) * 80}>
            <GlassCard style={{ padding: "24px" }}>
              <div style={{ fontFamily: gf, fontSize: 20, fontWeight: 800, color: C.tx, marginBottom: 4 }}>{months[mi]}</div>
              <div style={{ fontFamily: mn, fontSize: 11, color: C.txm, marginBottom: 16 }}>2026</div>

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} style={{ fontFamily: mn, fontSize: 9, color: C.txd, textAlign: "center", padding: "4px 0" }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={`e${i}`} />;
                  const evs = getEventsForDay(mi, day);
                  const hasEvent = evs.length > 0;
                  const col = hasEvent ? evs[0].color : undefined;
                  return (
                    <div key={i} style={{
                      aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      borderRadius: 8, fontSize: 12, fontFamily: mn,
                      color: hasEvent ? "#fff" : C.txd,
                      background: hasEvent ? col + "25" : "transparent",
                      border: hasEvent ? `1px solid ${col}40` : "1px solid transparent",
                      position: "relative",
                    }}>
                      {day}
                      {hasEvent && <div style={{ position: "absolute", bottom: 3, width: 4, height: 4, borderRadius: "50%", background: col }} />}
                    </div>
                  );
                })}
              </div>

              {/* Events legend for this month */}
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {EVENTS.filter(ev => ev.monthIndex === mi).map(ev => (
                  <div key={ev.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: ft, fontSize: 12, color: C.txm }}>{ev.name}</span>
                    <span style={{ fontFamily: mn, fontSize: 10, color: C.txd, marginLeft: "auto" }}>{ev.dates}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </FadeIn>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TIMELINE VIEW
   ═══════════════════════════════════════════════════════════ */
function TimelineView() {
  const { events: EVENTS, partner } = useSiteConfig();
  const STATUS_CONFIG = useStatusConfig();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const grouped = useMemo(() => {
    const map: Record<number, typeof EVENTS> = {};
    EVENTS.forEach(ev => {
      if (!map[ev.monthIndex]) map[ev.monthIndex] = [];
      map[ev.monthIndex].push(ev);
    });
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [EVENTS]);

  return (
    <div style={{ position: "relative", paddingLeft: 60 }}>
      {/* Vertical line */}
      <div style={{ position: "absolute", left: 29, top: 0, bottom: 0, width: 1, background: `linear-gradient(180deg, ${C.amber}40, ${C.violet}40, ${C.coral}40)` }} />

      {grouped.map(([monthIdx, evs], gi) => (
        <div key={monthIdx} style={{ marginBottom: 48 }}>
          {/* Month marker */}
          <FadeIn>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div style={{ position: "absolute", left: -60 + 20, top: 4, width: 18, height: 18, borderRadius: "50%", background: evs[0].color, boxShadow: `0 0 20px ${evs[0].color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
              </div>
              <div style={{ fontFamily: mn, fontSize: 13, fontWeight: 700, color: evs[0].color, letterSpacing: "3px" }}>{months[Number(monthIdx)]}</div>
            </div>
          </FadeIn>

          {/* Event cards */}
          {evs.map((ev, ei) => (
            <FadeIn key={ev.name} delay={ei * 80 + gi * 60}>
              <div style={{ marginBottom: 16, position: "relative" }}>
                {/* Connector line */}
                <div style={{ position: "absolute", left: -31, top: 14, width: 20, height: 1, background: ev.color + "40" }} />
                <div style={{ position: "absolute", left: -40, top: 10, width: 8, height: 8, borderRadius: "50%", background: C.bg, border: `2px solid ${ev.color}60` }} />

                <GlassCard style={{ padding: "22px 24px", borderLeft: `3px solid ${ev.status === "activated" ? "#4ADE80" : ev.status === "interested" ? partner.color : ev.color}`, background: ev.status === "activated" ? "rgba(74,222,128,0.03)" : ev.status === "interested" ? partner.color + "05" : C.glass }} hover>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.glassBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        <img src={ev.logo} alt={ev.name} style={{ width: 26, height: 26, objectFit: "contain", filter: ev.logo.endsWith(".svg") ? "brightness(0) invert(1)" : "none" }} />
                      </div>
                      <div>
                        <div style={{ fontFamily: gf, fontSize: 20, fontWeight: 800, color: C.tx, letterSpacing: "-0.3px" }}>{ev.name}</div>
                        <div style={{ fontFamily: mn, fontSize: 12, color: ev.color, marginTop: 2 }}>{ev.dates}</div>
                        <div style={{ fontFamily: ft, fontSize: 12, color: C.txd, marginTop: 2 }}>{ev.location}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{ fontFamily: mn, fontSize: 9, letterSpacing: "1px", color: STATUS_CONFIG[ev.status].color, background: STATUS_CONFIG[ev.status].bg, border: `1px solid ${STATUS_CONFIG[ev.status].color}30`, borderRadius: 20, padding: "3px 10px", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10 }}>{STATUS_CONFIG[ev.status].icon}</span> {STATUS_CONFIG[ev.status].label}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontFamily: ft, fontSize: 14, fontWeight: 700, color: ev.color, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.glassBorder}` }}>{ev.activation}</div>
                </GlassCard>
              </div>
            </FadeIn>
          ))}
        </div>
      ))}

      {/* End node */}
      <FadeIn>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: -60 + 17, top: 0, width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${C.amber}, ${C.coral})`, boxShadow: `0 0 24px ${C.amber}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
          </div>
          <div style={{ fontFamily: mn, fontSize: 11, color: C.txd, letterSpacing: "2px", paddingTop: 4 }}>END OF 2026 SEASON</div>
        </div>
      </FadeIn>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR TAB (wraps both views)
   ═══════════════════════════════════════════════════════════ */
function CalendarTab() {
  const { events: EVENTS } = useSiteConfig();
  const [view, setView] = useState<"calendar" | "timeline">("timeline");
  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      <GradientMesh />
      <div style={{ position: "relative", zIndex: 1, padding: "120px 32px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Schedule</SectionLabel>
          <SectionTitle>2026 Event Calendar</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
            {EVENTS.length} activations spanning the year — every major AI and infrastructure conference where it matters most.
          </p>
        </FadeIn>

        {/* View toggle */}
        <FadeIn delay={100}>
          <div style={{ display: "inline-flex", gap: 4, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 14, padding: 4, marginBottom: 40 }}>
            {[
              { key: "timeline" as const, label: "Timeline" },
              { key: "calendar" as const, label: "Calendar" },
            ].map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                style={{
                  fontFamily: ft, fontSize: 13, fontWeight: view === v.key ? 800 : 600,
                  color: view === v.key ? "#060608" : C.txm,
                  background: view === v.key ? `linear-gradient(135deg, ${C.amber}, #E8A020)` : "transparent",
                  border: "none", borderRadius: 10, padding: "10px 24px",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {view === "timeline" ? <TimelineView /> : <CalendarView />}

        {/* Year-at-a-glance bar */}
        <FadeIn>
          <div style={{ marginTop: 60 }}>
            <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>Year at a Glance</div>
            <div style={{ display: "flex", gap: 2, height: 40, borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: `1px solid ${C.glassBorder}` }}>
              {Array.from({ length: 12 }, (_, i) => {
                const evs = EVENTS.filter(ev => ev.monthIndex === i);
                const hasEvent = evs.length > 0;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: hasEvent ? evs[0].color + "15" : "transparent", borderRight: i < 11 ? `1px solid ${C.glassBorder}` : "none", position: "relative" }}>
                    <div style={{ fontFamily: mn, fontSize: 9, color: hasEvent ? evs[0].color : C.txd }}>{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</div>
                    {hasEvent && <div style={{ position: "absolute", bottom: 4, display: "flex", gap: 2 }}>{evs.map((ev, ei) => <div key={ei} style={{ width: 4, height: 4, borderRadius: "50%", background: ev.color }} />)}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GRADIENT MESH (shared background)
   ═══════════════════════════════════════════════════════════ */
function GradientMesh() {
  const { partner } = useSiteConfig();
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {/* Primary amber glow — top left — BIG */}
      <div style={{ position: "absolute", top: "-20%", left: "-15%", width: "65vw", height: "65vw", background: `radial-gradient(circle, ${C.amber}28 0%, ${C.amber}10 35%, transparent 65%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      {/* Blue glow — right side — BIG */}
      <div style={{ position: "absolute", top: "20%", right: "-20%", width: "60vw", height: "60vw", background: `radial-gradient(circle, ${C.blue}24 0%, ${C.blue}0C 35%, transparent 65%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      {/* Violet glow — bottom center — BIG */}
      <div style={{ position: "absolute", bottom: "-15%", left: "10%", width: "60vw", height: "60vw", background: `radial-gradient(circle, ${C.violet}22 0%, ${C.violet}0A 35%, transparent 65%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      {/* Coral bloom — mid right */}
      <div style={{ position: "absolute", top: "50%", right: "0%", width: "40vw", height: "40vw", background: `radial-gradient(circle, ${C.coral}1A 0%, ${C.coral}06 40%, transparent 65%)`, borderRadius: "50%", filter: "blur(70px)" }} />
      {/* Teal bloom — lower left */}
      <div style={{ position: "absolute", bottom: "10%", left: "-8%", width: "45vw", height: "45vw", background: `radial-gradient(circle, ${C.teal}18 0%, ${C.teal}06 40%, transparent 65%)`, borderRadius: "50%", filter: "blur(70px)" }} />
      {/* Amber secondary — center */}
      <div style={{ position: "absolute", top: "0%", left: "25%", width: "50vw", height: "50vw", background: `radial-gradient(circle, ${C.amber}14 0%, transparent 50%)`, borderRadius: "50%", filter: "blur(80px)" }} />
      {/* AWS orange — bottom right */}
      <div style={{ position: "absolute", bottom: "0%", right: "5%", width: "35vw", height: "35vw", background: `radial-gradient(circle, ${partner.color}12 0%, transparent 55%)`, borderRadius: "50%", filter: "blur(60px)" }} />
      {/* Cyan accent — center left */}
      <div style={{ position: "absolute", top: "35%", left: "5%", width: "30vw", height: "30vw", background: `radial-gradient(circle, ${C.cyan}10 0%, transparent 55%)`, borderRadius: "50%", filter: "blur(70px)" }} />
      {/* Deep violet — top right corner */}
      <div style={{ position: "absolute", top: "-5%", right: "5%", width: "35vw", height: "35vw", background: `radial-gradient(circle, #6B21A812 0%, transparent 55%)`, borderRadius: "50%", filter: "blur(80px)" }} />
      {/* Warm amber center band */}
      <div style={{ position: "absolute", top: "40%", left: "20%", width: "60vw", height: "20vw", background: `radial-gradient(ellipse 70% 40% at 50% 50%, ${C.amber}0A 0%, transparent 70%)`, filter: "blur(40px)" }} />
      {/* Noise/grain overlay for depth */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.02, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   OVERVIEW TAB — Main pitch page
   ═══════════════════════════════════════════════════════════ */
function OverviewTab({ internal }: { internal: boolean }) {
  const config = useSiteConfig();
  const { events: EVENTS, stats: STATS, pastEvents: PAST_EVENTS, audienceBreakdown: AUDIENCE_BREAKDOWN, whyUs: WHY_US, host, partner, hero, whySection, tiers, footer } = config;
  const STATUS_CONFIG = useStatusConfig();
  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      <GradientMesh />
      <SidebarTOC />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ─── HERO ─── */}
        <section id="hero" style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px", position: "relative", overflow: "hidden" }}>
          {/* Hero-specific aura — intense */}
          <div style={{ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", width: "90vw", height: "80vh", background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${C.amber}1A 0%, ${C.amber}08 40%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "30%", left: "15%", width: "35vw", height: "35vw", background: `radial-gradient(circle, ${C.blue}14 0%, transparent 60%)`, borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "25%", right: "10%", width: "30vw", height: "30vw", background: `radial-gradient(circle, ${C.violet}12 0%, transparent 60%)`, borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "20%", left: "50%", transform: "translateX(-50%)", width: "50vw", height: "20vh", background: `radial-gradient(ellipse 80% 40% at 50% 50%, ${C.coral}0C 0%, transparent 70%)`, pointerEvents: "none", filter: "blur(40px)" }} />
          {/* Flowing rings */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", border: `1px solid ${C.amber}08`, pointerEvents: "none", animation: "flowRing 20s linear infinite" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 450, height: 450, borderRadius: "50%", border: `1px solid ${C.blue}06`, pointerEvents: "none", animation: "flowRing 15s linear infinite reverse" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 750, height: 750, borderRadius: "50%", border: `1px solid ${C.violet}05`, pointerEvents: "none", animation: "flowRing 25s linear infinite" }} />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 900 }}>
            <FadeIn>
              <div style={{ fontFamily: mn, fontSize: 11, color: C.amber, letterSpacing: "4px", textTransform: "uppercase", marginBottom: 24 }}>{hero.eyebrow}</div>
            </FadeIn>
            <FadeIn delay={100}>
              <h1 style={{ fontFamily: gf, fontSize: "clamp(40px, 7vw, 76px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24, background: `linear-gradient(135deg, #fff 0%, ${C.amber} 50%, ${C.blue} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", whiteSpace: "pre-line" }}>
                {hero.headline}
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p style={{ fontFamily: ft, fontSize: 19, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 40px" }}>
                {hero.subtitle}
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="#events" style={{ fontFamily: ft, fontSize: 15, fontWeight: 800, color: "#fff", background: `linear-gradient(135deg, ${C.amber}40, ${C.blue}40)`, backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.1)`, padding: "14px 36px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s ease" }}>Explore Events</a>
                <a href="#why" style={{ fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.amber, border: `1px solid ${C.amber}30`, padding: "14px 36px", borderRadius: 100, textDecoration: "none", transition: "all 0.2s ease" }}>Why {host.name}</a>
              </div>
            </FadeIn>
            <FadeIn delay={500}>
              <div style={{ marginTop: 60 }}>
                <div style={{ width: 1, height: 60, background: `linear-gradient(180deg, ${C.amber}40, transparent)`, margin: "0 auto" }} />
              </div>
            </FadeIn>
          </div>
        </section>

        <GlowDivider color={C.amber} />
        {/* ─── STATS BAR ─── */}
        <section id="stats" style={{ padding: "48px 32px" }}>
          <div data-grid-responsive style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {STATS.map((s, i) => (
              <FadeIn key={s.label} delay={i * 80}>
                <GlassCard style={{ padding: "28px" }}>
                  <AnimatedStat value={s.value} label={s.label} sub={s.sub} />
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </section>

        <GlowDivider color={C.blue} />
        {/* ─── EVENT CARDS (expandable) ─── */}
        <section id="events" style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>2026 Season</SectionLabel>
            <SectionTitle>Eight Activations. Three Continents.</SectionTitle>
            <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 640, marginBottom: 12 }}>
              Click any event to explore the full activation plan, audience details, and step-by-step execution process.
            </p>
            <p style={{ fontFamily: mn, fontSize: 11, color: C.txd, marginBottom: 24, letterSpacing: "0.5px" }}>
              Click an event card to expand details {"\u2193"}
            </p>
          </FadeIn>

          {/* Status legend */}
          <FadeIn delay={100}>
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              {(["activated", "interested", "proposed"] as ActivationStatus[]).map(s => {
                const cfg = STATUS_CONFIG[s];
                const count = EVENTS.filter(e => e.status === s).length;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mn, fontSize: 11 }}>
                    <span style={{ color: cfg.color, fontSize: 12 }}>{cfg.icon}</span>
                    <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                    <span style={{ color: C.txd }}>({count})</span>
                  </div>
                );
              })}
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {EVENTS.map((ev, i) => (
              <EventCard key={ev.name} ev={ev} index={i} />
            ))}
          </div>
        </section>

        <GlowDivider color={C.violet} />
        {/* ─── PAST EVENTS ─── */}
        <section id="track-record" style={{ padding: "80px 32px", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeIn>
              <SectionLabel>Track Record</SectionLabel>
              <SectionTitle>Proven Results</SectionTitle>
              <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 48 }}>
                Our events don't just draw crowds — they draw the right crowds. Here's what we've delivered.
              </p>
            </FadeIn>

            <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
              {/* Audience breakdown */}
              <FadeIn>
                <div>
                  <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 24, fontWeight: 700 }}>Audience Composition</div>
                  {AUDIENCE_BREAKDOWN.map((a, i) => (
                    <AudienceBar key={a.label} label={a.label} pct={a.pct} color={a.color} delay={i * 120} />
                  ))}
                </div>
              </FadeIn>

              {/* Past events */}
              <div>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 24, fontWeight: 700 }}>Recent Activations</div>
                {PAST_EVENTS.map((ev, i) => (
                  <FadeIn key={ev.name} delay={i * 80}>
                    <GlassCard style={{ padding: "20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                        <span style={{ fontFamily: mn, fontSize: 14, fontWeight: 700, color: C.amber }}>{ev.attendees}</span>
                      </div>
                      <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, lineHeight: 1.6 }}>{ev.highlight}</div>
                    </GlassCard>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        <GlowDivider color={C.teal} />
        {/* ─── WHY SEMIANALYSIS ─── */}
        <section id="why" style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>The Partnership</SectionLabel>
            <SectionTitle>{whySection.title}</SectionTitle>
            <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 48 }}>
              {whySection.lead}
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {WHY_US.map((item, i) => (
              <FadeIn key={item.title} delay={i * 80}>
                <GlassCard style={{ padding: "28px 24px", height: "100%" }} hover>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: C.amber + "10", border: `1px solid ${C.amber}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>{item.icon}</div>
                  <div style={{ fontFamily: ft, fontSize: 18, fontWeight: 800, color: C.tx, marginBottom: 10, letterSpacing: "-0.3px" }}>{item.title}</div>
                  <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7 }}>{item.body}</div>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </section>

        <GlowDivider color={C.amber} />
        {/* ─── PARTNERSHIP VALUE PROP ─── */}
        <section id="benefits" style={{ padding: "80px 32px", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeIn>
              <SectionLabel>What {partner.name} Gets</SectionLabel>
              <SectionTitle>Partnership Benefits</SectionTitle>
            </FadeIn>

            <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 40 }}>
              {whySection.groups.map((col, i) => (
                <FadeIn key={col.title} delay={i * 100}>
                  <GlassCard style={{ padding: "28px 24px", height: "100%" }}>
                    <div style={{ fontFamily: ft, fontSize: 18, fontWeight: 800, color: C.amber, marginBottom: 16 }}>{col.title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {col.items.map((item, ii) => (
                        <div key={ii} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.amber, flexShrink: 0, marginTop: 7 }} />
                          <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.6 }}>{item}</div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <GlowDivider color={C.coral} />
        {/* ─── INVESTMENT TIERS ─── */}
        <section id="tiers" style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Investment</SectionLabel>
            <SectionTitle>Partnership Tiers</SectionTitle>
            <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 600, marginBottom: 48 }}>Flexible partnership structures designed to match your goals — from targeted single-event activations to full-season presenting partnerships.</p>
          </FadeIn>

          <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {tiers.map((t, i) => (
              <FadeIn key={t.tier} delay={i * 100}>
                <div style={{
                  background: t.highlight ? `linear-gradient(135deg, ${C.amber}0A, ${C.blue}08)` : C.glass,
                  backdropFilter: "blur(20px)",
                  border: t.highlight ? `1px solid ${C.amber}30` : `1px solid ${C.glassBorder}`,
                  borderRadius: 20, padding: "32px 24px", height: "100%",
                  boxShadow: t.highlight ? `0 8px 40px ${C.amber}10` : undefined,
                  position: "relative", overflow: "hidden",
                }}>
                  {t.highlight && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.amber}, ${C.blue})` }} />}
                  <div style={{ fontFamily: gf, fontSize: 28, fontWeight: 900, color: t.highlight ? C.amber : C.tx, marginBottom: 4 }}>{t.tier}</div>
                  <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, marginBottom: 24 }}>{t.desc}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {t.features.map((f, fi) => (
                      <div key={fi} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ fontFamily: mn, fontSize: 12, color: t.highlight ? C.amber : C.teal, marginTop: 1 }}>{"\u2713"}</div>
                        <div style={{ fontFamily: ft, fontSize: 13, color: C.txm, lineHeight: 1.5 }}>{f}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ─── BUDGET STRATEGIZER ─── */}
        <BudgetStrategizer />

        {/* ─── TESTIMONIALS ─── */}
        <Testimonials />

        {/* ─── CLOSING PITCH ─── */}
        <ClosingPitch />

        {/* ─── CTA ─── */}
        <InterestForm />

        {/* ─── FOOTER ─── */}
        <footer style={{ borderTop: `1px solid ${C.glassBorder}`, padding: "32px", textAlign: "center" }}>
          <div style={{ fontFamily: mn, fontSize: 11, color: C.txd, letterSpacing: "1px" }}>{footer}</div>
        </footer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BUDGET STRATEGIZER — interactive slider
   ═══════════════════════════════════════════════════════════ */
function BudgetStrategizer() {
  const { events: EVENTS, partner, host } = useSiteConfig();
  const { setPlan } = usePlan();
  const [budget, setBudget] = useState(600);
  const min = 100;
  const max = 2400;

  const recommendation = useMemo(() => {
    if (budget < 200) {
      return { tier: "Tier 1", count: 1, label: "1 activation", color: C.teal };
    }
    if (budget < 800) {
      const count = budget < 500 ? 2 : 3;
      return { tier: "Tier 2", count, label: `${count} activations`, color: C.amber };
    }
    return { tier: "Tier 3", count: EVENTS.length, label: "Full calendar", color: C.coral };
  }, [budget, EVENTS.length]);

  const maxFit = useMemo(() => {
    if (budget <= 100) return 1;
    if (budget <= 250) return Math.min(2, EVENTS.length);
    if (budget <= 600) return Math.min(3, EVENTS.length);
    if (budget <= 1200) return Math.min(5, EVENTS.length);
    return EVENTS.length;
  }, [budget, EVENTS.length]);

  const suggested = EVENTS.slice(0, maxFit);

  // Matches 2025 actuals: 2,400+ decision-makers across 8 activations.
  const decisionMakersPerEvent = 300;
  const totalDecisionMakers = maxFit * decisionMakersPerEvent;
  const costPerDecisionMaker = totalDecisionMakers > 0 ? Math.round((budget * 1000) / totalDecisionMakers) : 0;

  return (
    <section id="strategize" style={{ padding: "100px 32px", background: "rgba(255,255,255,0.01)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Plan Your Spend</SectionLabel>
          <SectionTitle>Budget Strategizer</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 620, marginBottom: 40 }}>
            Drag the slider to your budget. We'll map it to the right tier and suggest which activations give you the highest return.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <GlassCard style={{ padding: "36px 40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>Your Budget</div>
                <div style={{ fontFamily: gf, fontSize: 56, fontWeight: 900, color: C.tx, lineHeight: 1, letterSpacing: "-2px" }}>
                  ${budget}<span style={{ fontSize: 24, color: C.txm, fontWeight: 700 }}>K</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>Recommended</div>
                <div style={{ fontFamily: ft, fontSize: 22, fontWeight: 800, color: recommendation.color }}>{recommendation.tier}</div>
                <div style={{ fontFamily: mn, fontSize: 12, color: C.txm, marginTop: 2 }}>{recommendation.label}</div>
              </div>
            </div>

            <input
              type="range"
              min={min}
              max={max}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: recommendation.color,
                height: 6,
                cursor: "pointer",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mn, fontSize: 10, color: C.txd, marginTop: 8 }}>
              <span>$100K</span>
              <span>$600K</span>
              <span>$1.2M</span>
              <span>$2.4M+</span>
            </div>

            <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 36 }}>
              <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.glassBorder}` }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>Events You Can Anchor</div>
                <div style={{ fontFamily: gf, fontSize: 32, fontWeight: 900, color: C.amber, lineHeight: 1 }}>{maxFit}</div>
                <div style={{ fontFamily: ft, fontSize: 12, color: C.txm, marginTop: 4 }}>of {EVENTS.length} on the calendar</div>
              </div>
              <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.glassBorder}` }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>Decision-Makers Reached</div>
                <div style={{ fontFamily: gf, fontSize: 32, fontWeight: 900, color: C.blue, lineHeight: 1 }}>{totalDecisionMakers.toLocaleString()}</div>
                <div style={{ fontFamily: ft, fontSize: 12, color: C.txm, marginTop: 4 }}>est. ~300 per activation (2025 avg)</div>
              </div>
              <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${C.glassBorder}` }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.txd, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>Cost per Decision-Maker</div>
                <div style={{ fontFamily: gf, fontSize: 32, fontWeight: 900, color: C.teal, lineHeight: 1 }}>${costPerDecisionMaker}</div>
                <div style={{ fontFamily: ft, fontSize: 12, color: C.txm, marginTop: 4 }}>vs. $150–300 at trade shows</div>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 14, fontWeight: 700 }}>Suggested Calendar</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {suggested.map((ev) => (
                  <div key={ev.name} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 10,
                    background: ev.color + "0A", border: `1px solid ${ev.color}30`,
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      <img src={ev.logo} alt={ev.name} style={{ width: 20, height: 20, objectFit: "contain", filter: ev.logo.endsWith(".svg") ? "brightness(0) invert(1)" : "none" }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: ft, fontSize: 13, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                      <div style={{ fontFamily: mn, fontSize: 10, color: C.txd }}>{ev.dates.split(",")[0]}</div>
                    </div>
                  </div>
                ))}
                {EVENTS.slice(maxFit).map((ev) => (
                  <div key={ev.name} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.02)", border: `1px dashed ${C.glassBorder}`,
                    opacity: 0.45,
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      <img src={ev.logo} alt={ev.name} style={{ width: 20, height: 20, objectFit: "contain", filter: "grayscale(1) brightness(0.7)" }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: ft, fontSize: 13, fontWeight: 600, color: C.txm }}>{ev.name}</div>
                      <div style={{ fontFamily: mn, fontSize: 10, color: C.txd }}>upgrade to add</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => {
                const names = suggested.map((ev) => ev.name);
                setPlan(names);
                fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "plan_applied", partner: partner.name, host: host.name, metadata: { budget, tier: recommendation.tier, events: names } }) }).catch(() => {});
                document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
              }}
                style={{
                  fontFamily: ft, fontSize: 14, fontWeight: 800, color: "#060608",
                  background: `linear-gradient(135deg, ${C.amber}, #E8A020)`,
                  padding: "12px 28px", borderRadius: 10, textDecoration: "none",
                  border: "none", cursor: "pointer",
                }}>
                Build my {recommendation.tier} plan {"\u2192"}
              </button>
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════ */
function Testimonials() {
  const { testimonials: quotes } = useSiteConfig();

  return (
    <section style={{ padding: "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>What Attendees Say</SectionLabel>
          <SectionTitle>From the People in the Room</SectionTitle>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginTop: 32 }}>
          {quotes.map((q, i) => (
            <FadeIn key={i} delay={i * 80}>
              <GlassCard style={{ padding: "28px 24px", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: ft, fontSize: 28, color: C.amber, lineHeight: 1, marginBottom: 12 }}>{"\u201C"}</div>
                <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.7, flex: 1, marginBottom: 16 }}>{q.quote}</div>
                <div style={{ borderTop: `1px solid ${C.glassBorder}`, paddingTop: 12 }}>
                  <div style={{ fontFamily: ft, fontSize: 13, fontWeight: 700, color: C.tx }}>{q.author}</div>
                  <div style={{ fontFamily: mn, fontSize: 11, color: C.txd }}>{q.company}</div>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CLOSING PITCH — why AWS, why now
   ═══════════════════════════════════════════════════════════ */
function ClosingPitch() {
  const { partner } = useSiteConfig();

  const proofPoints = [
    { stat: "750", label: `${partner.name}-eligible attendees at NeurIPS 2025`, note: "Our format. Our curation. Our guest list." },
    { stat: "94%", label: "Return rate across flagship activations", note: "Buyers don't come once — they come back." },
    { stat: "38%", label: "Academia, 18% Big Tech, 12% AI startups", note: "The audience your GTM team is trying to reach." },
    { stat: "$40\u201380", label: `Cost per decision-maker vs. $150\u2013300 traditional`, note: "3\u20135x more efficient than standard conference sponsorship." },
  ];

  const risks = [
    { title: "The venue window closes first", body: `Computex banquet and NeurIPS vessel are already booked. Holding them costs us real dollars. Other partners are in conversation \u2014 we want ${partner.name} first.` },
    { title: "Audience curation starts 8\u201312 weeks out", body: `The best attendees don't respond to last-minute invites. Locking the partnership now means we build the guest list with ${partner.name} in mind from day one.` },
    { title: "2027 renewal is decided by 2026 performance", body: `Strong partners become default partners. Anchoring the 2026 calendar is the lowest-risk way to own 2027\u20132028 across the same community.` },
  ];

  return (
    <section id="close" style={{ padding: "100px 32px", background: "rgba(255,255,255,0.015)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Why {partner.name}, Why Now</SectionLabel>
          <SectionTitle>The Case for Moving This Quarter</SectionTitle>
          <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 640, marginBottom: 48 }}>
            AI infrastructure is the largest capex cycle of our generation, and the decisions are being made right now in rooms we're building. Every quarter {partner.name} waits, a competitor partner anchors a venue we can't re-open.
          </p>
        </FadeIn>

        {/* Proof row */}
        <FadeIn delay={100}>
          <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 48 }}>
            {proofPoints.map((p, i) => (
              <GlassCard key={i} style={{ padding: "22px 20px", height: "100%" }}>
                <div style={{ fontFamily: gf, fontSize: 36, fontWeight: 900, color: C.amber, lineHeight: 1, letterSpacing: "-1.5px", marginBottom: 8 }}>{p.stat}</div>
                <div style={{ fontFamily: ft, fontSize: 13, fontWeight: 700, color: C.tx, marginBottom: 8, lineHeight: 1.4 }}>{p.label}</div>
                <div style={{ fontFamily: ft, fontSize: 12, color: C.txm, lineHeight: 1.5 }}>{p.note}</div>
              </GlassCard>
            ))}
          </div>
        </FadeIn>

        {/* Why now */}
        <FadeIn delay={150}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: mn, fontSize: 10, color: C.coral, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20, fontWeight: 700 }}>What's at Stake if We Wait</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {risks.map((r, i) => (
                <GlassCard key={i} style={{ padding: "20px 24px", borderLeft: `3px solid ${C.coral}` }}>
                  <div style={{ fontFamily: ft, fontSize: 16, fontWeight: 800, color: C.tx, marginBottom: 6 }}>{r.title}</div>
                  <div style={{ fontFamily: ft, fontSize: 14, color: C.txm, lineHeight: 1.6 }}>{r.body}</div>
                </GlassCard>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* The ask */}
        <FadeIn delay={200}>
          <GlassCard style={{ padding: "40px 44px", background: `linear-gradient(135deg, ${C.amber}0C, ${C.blue}08)`, border: `1px solid ${C.amber}30` }}>
            <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>The Ask</div>
            <div style={{ fontFamily: gf, fontSize: 32, fontWeight: 900, color: C.tx, lineHeight: 1.2, letterSpacing: "-1px", marginBottom: 18 }}>
              30 minutes this week. A decision by end of Q1.
            </div>
            <div style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, marginBottom: 24, maxWidth: 680 }}>
              We'll walk through the calendar, pick the 2–3 events that best match your GTM priorities, and sketch a tier together. You don't need a budget number today — you need to see which rooms {partner.name} should own in 2026. We'll do the math from there.
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#cta" onClick={(e) => { e.preventDefault(); document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" }); }} style={{
                fontFamily: ft, fontSize: 15, fontWeight: 800, color: "#060608",
                background: `linear-gradient(135deg, ${C.amber}, #E8A020)`,
                padding: "14px 32px", borderRadius: 12, textDecoration: "none",
                boxShadow: `0 4px 20px ${C.amber}30`,
              }}>Book the 30 min {"\u2192"}</a>
              <a href="#strategize" onClick={(e) => { e.preventDefault(); document.getElementById("strategize")?.scrollIntoView({ behavior: "smooth" }); }} style={{
                fontFamily: ft, fontSize: 15, fontWeight: 700, color: C.amber,
                border: `1px solid ${C.amber}30`, background: "transparent",
                padding: "14px 32px", borderRadius: 12, textDecoration: "none",
              }}>Model the budget first</a>
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTEREST FORM
   ═══════════════════════════════════════════════════════════ */
function InterestForm() {
  const { events: EVENTS, partner, mode } = useSiteConfig();
  const isGeneric = mode === "generic";
  const { plan } = usePlan();
  const [form, setForm] = useState({ name: "", email: "", role: "", company: "", events: new Set<string>(), notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const toggleEvent = (name: string) => { const next = new Set(form.events); next.has(name) ? next.delete(name) : next.add(name); setForm({ ...form, events: next }); };

  // Pre-populate events from the Budget Strategizer plan
  useEffect(() => {
    if (plan.length === 0) return;
    setForm((prev) => ({ ...prev, events: new Set(plan) }));
  }, [plan]);

  const summary = useMemo(() => ({
    count: form.events.size,
    events: Array.from(form.events),
  }), [form.events]);

  return (
    <section id="cta" style={{ padding: "100px 32px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Get Started</SectionLabel>
            <h2 style={{ fontFamily: gf, fontSize: 48, fontWeight: 900, background: `linear-gradient(135deg, #fff 0%, ${C.amber} 60%, ${C.blue} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-1.5px", marginBottom: 16, lineHeight: 1.1 }}>
              Let{"'"}s Build This<br />Together.
            </h2>
            <p style={{ fontFamily: ft, fontSize: 17, color: C.txm, lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              Select the events you{"'"}re interested in and we{"'"}ll put together a custom partnership proposal.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <GlassCard style={{ padding: "32px" }}>
            <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[{ key: "name", label: "Name", placeholder: "Your name" }, { key: "email", label: "Email", placeholder: "you@company.com" }].map(f => (
                <div key={f.key}>
                  <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>{f.label}</div>
                  <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                    style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.tx, fontFamily: ft, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = C.amber; }} onBlur={e => { e.target.style.borderColor = C.glassBorder; }} />
                </div>
              ))}
            </div>
            {isGeneric && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Company *</div>
                <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g. NVIDIA, Anthropic, Scale AI..."
                  style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.tx, fontFamily: ft, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = C.amber; }} onBlur={e => { e.target.style.borderColor = C.glassBorder; }} />
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Role / Title</div>
              <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder={isGeneric ? "e.g. Head of Marketing" : `e.g. Head of Marketing, ${partner.name}`}
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.tx, fontFamily: ft, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={e => { e.target.style.borderColor = C.amber; }} onBlur={e => { e.target.style.borderColor = C.glassBorder; }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Events of Interest</div>
              <div data-grid-responsive style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {EVENTS.map(ev => (
                  <div key={ev.name} onClick={() => toggleEvent(ev.name)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: form.events.has(ev.name) ? C.amber + "08" : "rgba(255,255,255,0.02)", border: `1px solid ${form.events.has(ev.name) ? C.amber + "30" : C.glassBorder}`, borderRadius: 10, cursor: "pointer", transition: "all 0.2s ease" }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${form.events.has(ev.name) ? C.amber : C.txd}`, background: form.events.has(ev.name) ? C.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s ease" }}>
                      {form.events.has(ev.name) && <span style={{ color: "#060608", fontSize: 9, fontWeight: 900 }}>{"\u2713"}</span>}
                    </div>
                    <div>
                      <div style={{ fontFamily: ft, fontSize: 13, fontWeight: 700, color: C.tx }}>{ev.name}</div>
                      <div style={{ fontFamily: mn, fontSize: 10, color: C.txd }}>{ev.dates}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Anything Else?</div>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Budget range, specific goals, questions..." rows={3}
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 10, color: C.tx, fontFamily: ft, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical" }}
                onFocus={e => { e.target.style.borderColor = C.amber; }} onBlur={e => { e.target.style.borderColor = C.glassBorder; }} />
            </div>
            <button onClick={async () => {
              if (!form.name || !form.email) return;
              if (isGeneric && !form.company.trim()) return;
              const partnerName = isGeneric ? form.company.trim() : partner.name;
              try {
                const res = await fetch("/api/interest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, events: Array.from(form.events), partner: partnerName, host: "SemiAnalysis" }) });
                if (!res.ok) throw new Error("Failed");
                fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "form_submit", partner: partnerName, host: "SemiAnalysis", metadata: { eventCount: form.events.size } }) }).catch(() => {});
                setSubmitted(true);
              } catch { setSubmitted(true); }
            }} style={{ width: "100%", fontFamily: ft, fontSize: 16, fontWeight: 800, color: "#fff", background: `linear-gradient(135deg, ${C.amber}, #E8A020)`, padding: "16px", borderRadius: 12, border: "none", cursor: "pointer", boxShadow: `0 4px 30px ${C.amber}30` }}>
              Submit Interest — {form.events.size} Event{form.events.size !== 1 ? "s" : ""} Selected
            </button>
          </GlassCard>
        </FadeIn>
      </div>

      {/* Thank-you overlay */}
      {submitted && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(5, 5, 8, 0.8)",
          backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            maxWidth: 520, width: "100%",
            background: "linear-gradient(135deg, #0a0a12, #0d0f1a)",
            border: `1px solid ${C.glassBorder}`,
            borderRadius: 20,
            padding: "48px 40px",
            textAlign: "center",
            boxShadow: `0 20px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.15) inset`,
            animation: "popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
            position: "relative",
          }}>
            <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", role: "", events: new Set(), notes: "" }); }}
              aria-label="Close"
              style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: C.txd, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>
              {"\u00D7"}
            </button>

            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: `radial-gradient(circle, #4ADE8025 0%, transparent 70%)`,
              border: `2px solid #4ADE80`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 32, color: "#4ADE80",
              animation: "checkPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s backwards",
            }}>
              {"\u2713"}
            </div>

            <h2 style={{ fontFamily: gf, fontSize: 32, fontWeight: 900, color: "#4ADE80", letterSpacing: "-1px", marginBottom: 10 }}>
              Submission received
            </h2>

            <p style={{ fontFamily: ft, fontSize: 15, color: C.txm, lineHeight: 1.7, marginBottom: 24 }}>
              Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""}. The SemiAnalysis team will reach out within 24 hours to walk through the calendar and shape your plan.
            </p>

            {summary.count > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: "16px 20px", marginBottom: 8 }}>
                <div style={{ fontFamily: mn, fontSize: 10, color: C.amber, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Your {summary.count} selected event{summary.count > 1 ? "s" : ""}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                  {summary.events.map((name) => (
                    <span key={name} style={{ fontFamily: mn, fontSize: 11, color: C.amber, background: C.amber + "10", border: `1px solid ${C.amber}25`, borderRadius: 8, padding: "4px 12px" }}>{name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes popIn {
              0%   { opacity: 0; transform: translateY(20px) scale(0.96); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes checkPop {
              0%   { opacity: 0; transform: scale(0); }
              60%  { transform: scale(1.2); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT — PUBLIC ONLY (no internal code in this bundle)
   ═══════════════════════════════════════════════════════════ */
const TABS_PUBLIC = [
  { key: "overview", label: "Overview" },
  { key: "calendar", label: "Calendar" },
];

export default function EventsClient({ config }: { config: SiteConfig }) {
  const [plan, setPlan] = useState<string[]>([]);
  return (
    <SiteConfigContext.Provider value={config}>
      <PlanContext.Provider value={{ plan, setPlan }}>
        <EventsClientInner />
      </PlanContext.Provider>
    </SiteConfigContext.Provider>
  );
}

function EventsClientInner() {
  const { host, partner, mode } = useSiteConfig();
  const isGeneric = mode === "generic";
  const [active, setActive] = useState(0);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const trackedPartner = isGeneric ? "Generic" : partner.name;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "page_open",
        partner: trackedPartner,
        host: host.name,
        metadata: { path: typeof window !== "undefined" ? window.location.pathname : "" },
      }),
    }).catch(() => {});
  }, [partner.name, host.name, isGeneric]);

  // Hide the floating Submit button when the CTA form is in viewport
  useEffect(() => {
    const el = document.getElementById("cta");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [active]);

  const handleSubmitCTAClick = () => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "cta_click",
        partner: isGeneric ? "Generic" : partner.name,
        host: host.name,
        metadata: { source: "floating_submit" },
      }),
    }).catch(() => {});
    if (active !== 0) setActive(0);
    setTimeout(() => {
      document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
    }, active !== 0 ? 80 : 0);
  };

  return (
    <>
      <style>{`
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Medium.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-SemiBold.woff2') format('woff2'); font-weight: 600; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-ExtraBold.woff2') format('woff2'); font-weight: 800; font-style: normal; font-display: swap; }
        @font-face { font-family: 'Grift'; src: url('/fonts/Grift-Black.woff2') format('woff2'); font-weight: 900; font-style: normal; font-display: swap; }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; background: #050508; }
        body { background: #050508; overflow-x: hidden; }
        ::selection { background: #F7B04130; color: #E8E4DD; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: #4E4B56; border-radius: 3px; }
        @keyframes flowRing {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @media (max-width: 768px) {
          section > div { padding: 0 16px !important; }
          [data-grid-responsive] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "14px 32px",
        background: "#050508E8",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.glassBorder}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LogoWithFallback src={host.logo} name={host.name} height={isGeneric ? 28 : 22} invert />
          {isGeneric ? (
            <span style={{ fontFamily: gf, fontSize: 26, fontWeight: 900, color: C.tx, letterSpacing: "-0.5px", lineHeight: 1 }}>Events</span>
          ) : (
            <>
              <span style={{ color: C.txd, fontSize: 20, fontWeight: 200 }}>{"\u00D7"}</span>
              <LogoWithFallback src={partner.logo} name={partner.name} height={20} />
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: 3 }}>
          {TABS_PUBLIC.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => { setActive(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              style={{
                fontFamily: ft, fontSize: 12, fontWeight: active === i ? 800 : 600,
                color: active === i ? "#060608" : C.txm,
                background: active === i ? `linear-gradient(135deg, ${C.amber}, #E8A020)` : "transparent",
                border: "none", borderRadius: 9, padding: "8px 20px",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/login" style={{
            fontFamily: mn, fontSize: 10, color: C.txd,
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${C.glassBorder}`,
            borderRadius: 8, padding: "6px 14px",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          }}>
            {"\uD83D\uDD12"} Team
          </a>
          <a
            href="#cta"
            onClick={(e) => { e.preventDefault(); document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" }); }}
            style={{
              fontFamily: ft, fontSize: 12, fontWeight: 700, color: "#060608",
              background: `linear-gradient(135deg, ${C.amber}, #E8A020)`,
              padding: "8px 20px", borderRadius: 8, textDecoration: "none",
            }}
          >
            Let{"'"}s Partner
          </a>
        </div>
      </nav>

      {active === 0 ? <OverviewTab internal={false} /> : <CalendarTab />}

      {/* Floating Submit Now CTA — right side, hides when form is in view */}
      <button
        onClick={handleSubmitCTAClick}
        aria-label="Submit interest"
        className="floating-submit-cta"
        style={{
          position: "fixed",
          right: ctaVisible ? -240 : 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 90,
          background: `linear-gradient(135deg, ${C.blue}, #0A6DAD)`,
          color: "#fff",
          fontFamily: ft,
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          padding: "14px 22px 14px 20px",
          border: "none",
          borderTopLeftRadius: 14,
          borderBottomLeftRadius: 14,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "right 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding-right 0.2s ease",
          animation: "submitGlow 2.2s ease-in-out infinite",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.paddingRight = "30px"; }}
        onMouseLeave={(e) => { e.currentTarget.style.paddingRight = "22px"; }}
      >
        <span>Submit Now</span>
        <span className="floating-submit-arrow" style={{ fontSize: 16, lineHeight: 1, display: "inline-block" }}>{"\u2193"}</span>
        <style>{`
          @keyframes submitGlow {
            0%, 100% { box-shadow: 0 6px 30px ${C.blue}55, 0 0 0 1px rgba(255,255,255,0.08) inset; }
            50%      { box-shadow: 0 10px 50px ${C.blue}cc, 0 0 0 1px rgba(255,255,255,0.18) inset, 0 0 40px ${C.blue}66; }
          }
          @keyframes submitArrowBounce {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(4px); }
          }
          .floating-submit-cta .floating-submit-arrow {
            animation: submitArrowBounce 1.4s ease-in-out infinite;
          }
        `}</style>
      </button>
    </>
  );
}

/* END — no internal code below this line */
