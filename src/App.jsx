import { useState, useEffect, useCallback } from "react";
import {
  Q_CHI, Q_BINOM, Q_TTEST, Q_CI, Q_WILCOXON, Q_CORR, Q_REG, Q_POWER, Q_SELECT,
} from "./data.jsx";
import {
  Quiz, LearnChi, LearnTTest, LearnCI, LearnBinom, LearnWilcoxon,
  LearnCorr, LearnReg, LearnPower, LearnSelect,
  PracticeChi, PracticeTTest, PracticeCI, PracticeBinom, PracticeWilcoxon,
  PracticeCorr, PracticeReg, PracticePower, PracticeSelect,
} from "./components.jsx";

// ════════════════════════════════════════════
// TOPIC CONFIGURATION
// ════════════════════════════════════════════

const TOPICS = [
  { id: "chi",      label: "χ² חי בריבוע",    icon: "📊", color: "#2563eb", questions: Q_CHI,      Learn: LearnChi,      Practice: PracticeChi },
  { id: "binom",    label: "בינום",            icon: "🎲", color: "#7c3aed", questions: Q_BINOM,    Learn: LearnBinom,    Practice: PracticeBinom },
  { id: "ttest",    label: "מבחני t",          icon: "📐", color: "#0891b2", questions: Q_TTEST,    Learn: LearnTTest,    Practice: PracticeTTest },
  { id: "ci",       label: "רווחי סמך",        icon: "📏", color: "#059669", questions: Q_CI,       Learn: LearnCI,       Practice: PracticeCI },
  { id: "wilcoxon", label: "וילקוקסון / מ״ו",  icon: "🔢", color: "#d97706", questions: Q_WILCOXON, Learn: LearnWilcoxon, Practice: PracticeWilcoxon },
  { id: "corr",     label: "מתאמים",           icon: "🔗", color: "#dc2626", questions: Q_CORR,     Learn: LearnCorr,     Practice: PracticeCorr },
  { id: "reg",      label: "רגרסיה",           icon: "📈", color: "#4f46e5", questions: Q_REG,      Learn: LearnReg,      Practice: PracticeReg },
  { id: "power",    label: "עוצמה",            icon: "⚡", color: "#be185d", questions: Q_POWER,    Learn: LearnPower,    Practice: PracticePower },
  { id: "select",   label: "בחירת מבחן",       icon: "🧭", color: "#0d9488", questions: Q_SELECT,   Learn: LearnSelect,   Practice: PracticeSelect },
];

// ════════════════════════════════════════════
// PROGRESS TRACKER (localStorage)
// ════════════════════════════════════════════

const STORAGE_KEY = "stats-tool-progress";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ════════════════════════════════════════════
// MAIN APP COMPONENT
// ════════════════════════════════════════════

export default function App() {
  const [topic, setTopic] = useState(null);
  const [tab, setTab] = useState("learn");   // learn | quiz | practice
  const [progress, setProgress] = useState(loadProgress);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => { saveProgress(progress); }, [progress]);

  const markVisited = useCallback((topicId, tabName) => {
    setProgress(prev => {
      const t = prev[topicId] || { learn: false, quiz: false, practice: false };
      if (t[tabName]) return prev;
      return { ...prev, [topicId]: { ...t, [tabName]: true } };
    });
  }, []);

  const handleTopicSelect = (t) => {
    setTopic(t);
    setTab("learn");
    markVisited(t.id, "learn");
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (topic) markVisited(topic.id, newTab);
  };

  // ---- THEME ----
  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const card = darkMode ? "#1e293b" : "#ffffff";
  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const subtle = darkMode ? "#94a3b8" : "#64748b";
  const border = darkMode ? "#334155" : "#e2e8f0";

  // ---- HOME SCREEN ----
  if (!topic) {
    const completedCount = TOPICS.filter(t => {
      const p = progress[t.id];
      return p && p.learn && p.quiz && p.practice;
    }).length;

    return (
      <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", background: bg, minHeight: "100vh", color: text }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)", padding: "40px 20px", textAlign: "center", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 10px" }}>
            <button onClick={() => setDarkMode(d => !d)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", cursor: "pointer", fontSize: 14 }}>
              {darkMode ? "☀️ בהיר" : "🌙 כהה"}
            </button>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>סטטיסטיקה אינטראקטיבית</h1>
          <p style={{ fontSize: 16, opacity: 0.9 }}>למד · תרגל · שלוט בכל הנושאים</p>
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.15)", display: "inline-block", padding: "8px 24px", borderRadius: 20, fontSize: 14 }}>
            התקדמות כללית: {completedCount}/{TOPICS.length} נושאים הושלמו
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "0 20px", marginTop: -10 }}>
          <div style={{ maxWidth: 700, margin: "0 auto", height: 8, background: darkMode ? "#334155" : "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${(completedCount / TOPICS.length) * 100}%`, height: 8, background: "linear-gradient(90deg, #22c55e, #16a34a)", borderRadius: 4, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Topic grid */}
        <div style={{ maxWidth: 700, margin: "30px auto", padding: "0 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {TOPICS.map(t => {
              const p = progress[t.id] || {};
              const done = p.learn && p.quiz && p.practice;
              const started = p.learn || p.quiz || p.practice;
              return (
                <div key={t.id} onClick={() => handleTopicSelect(t)} style={{
                  background: card, border: `2px solid ${done ? "#22c55e" : started ? t.color : border}`,
                  borderRadius: 16, padding: 20, cursor: "pointer",
                  transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: text, marginBottom: 10 }}>{t.label}</p>

                  {/* Mini progress dots */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {["learn", "quiz", "practice"].map(tab => (
                      <div key={tab} style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: p[tab] ? "#22c55e" : (darkMode ? "#475569" : "#d1d5db"),
                      }} title={tab === "learn" ? "לימוד" : tab === "quiz" ? "חידון" : "תרגול"} />
                    ))}
                    <span style={{ fontSize: 10, color: subtle, marginRight: 4 }}>
                      {done ? "הושלם!" : started ? "בתהליך" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick attack guide */}
          <div style={{ marginTop: 30, background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: text }}>איך לתקוף שאלות?</h2>
            <div style={{ fontSize: 14, lineHeight: 2, color: text }}>
              <p><strong>1. זהה את המשתנים</strong> — סולם מדידה (שמי/סדר/רווח/יחס), רציף/בדיד</p>
              <p><strong>2. זהה את המטרה</strong> — הבדל? קשר? ניבוי? התאמה?</p>
              <p><strong>3. בדוק הנחות</strong> — נורמליות? שוויון שונויות? n·p ≥ 5?</p>
              <p><strong>4. בחר מבחן</strong> — פרמטרי אם הנחות מתקיימות, א-פרמטרי אם לא</p>
              <p><strong>5. בצע</strong> — סטטיסטי → ערך קריטי → החלטה → מסקנה</p>
              <p><strong>6. גודל אפקט</strong> — d, r², φ, V, rpb — תמיד לדווח!</p>
            </div>
          </div>

          {/* Reset button */}
          <div style={{ textAlign: "center", marginTop: 24, paddingBottom: 40 }}>
            <button onClick={() => { if (confirm("למחוק את כל ההתקדמות?")) { setProgress({}); localStorage.removeItem(STORAGE_KEY); } }} style={{
              background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer", textDecoration: "underline",
            }}>אפס התקדמות</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- TOPIC VIEW ----
  const { Learn, Practice, questions, color, label, icon } = topic;
  const tabs = [
    { id: "learn",    label: "לימוד",  icon: "📖" },
    { id: "quiz",     label: "חידון",  icon: "❓" },
    { id: "practice", label: "תרגול",  icon: "✏️" },
  ];

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", background: bg, minHeight: "100vh", color: text }}>
      {/* Top bar */}
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setTopic(null)} style={{
          background: "none", border: `1px solid ${border}`, borderRadius: 10, padding: "8px 16px",
          cursor: "pointer", fontSize: 14, fontWeight: 600, color: text, display: "flex", alignItems: "center", gap: 6,
        }}>
          → חזרה לתפריט
        </button>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{icon} {label}</span>
        <button onClick={() => setDarkMode(d => !d)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "16px 16px 0", background: card }}>
        {tabs.map(t => {
          const active = tab === t.id;
          const visited = progress[topic.id]?.[t.id];
          return (
            <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
              padding: "10px 24px", borderRadius: "12px 12px 0 0",
              border: active ? `2px solid ${color}` : `1px solid ${border}`,
              borderBottom: active ? `3px solid ${color}` : "none",
              background: active ? (darkMode ? "#1e293b" : "#fff") : "transparent",
              color: active ? color : subtle,
              fontSize: 14, fontWeight: active ? 700 : 500, cursor: "pointer",
              transition: "all 0.15s",
            }}>
              {t.icon} {t.label} {visited && !active ? "✓" : ""}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px 60px" }}>
        {tab === "learn" && <Learn />}
        {tab === "quiz" && <Quiz questions={questions} color={color} />}
        {tab === "practice" && <Practice color={color} />}
      </div>
    </div>
  );
}