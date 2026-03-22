import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Q_CHI, Q_BINOM, Q_TTEST, Q_CI, Q_FTEST, Q_WILCOXON, Q_CORR, Q_REG, Q_POWER, Q_SELECT,
  normalCDF, tTable, chiTable, fTable, tCritical, chiCritical, fCritical,
} from "./data.jsx";
import {
  Quiz, LearnChi, LearnTTest, LearnCI, LearnBinom, LearnWilcoxon,
  LearnCorr, LearnReg, LearnPower, LearnSelect, LearnFTest,
  PracticeChi, PracticeTTest, PracticeCI, PracticeBinom, PracticeWilcoxon,
  PracticeCorr, PracticeReg, PracticePower, PracticeSelect, PracticeFTest,
  InfoBox,
} from "./components.jsx";

// ════════════════════════════════════════════
// TOPIC CONFIGURATION
// ════════════════════════════════════════════

const TOPICS = [
  { id: "chi",      label: "χ² חי בריבוע",    icon: "📊", color: "#2563eb", questions: Q_CHI,      Learn: LearnChi,      Practice: PracticeChi },
  { id: "binom",    label: "בינום",            icon: "🎲", color: "#7c3aed", questions: Q_BINOM,    Learn: LearnBinom,    Practice: PracticeBinom },
  { id: "ttest",    label: "מבחני t",          icon: "📐", color: "#0891b2", questions: Q_TTEST,    Learn: LearnTTest,    Practice: PracticeTTest },
  { id: "ci",       label: "רווחי סמך",        icon: "📏", color: "#059669", questions: Q_CI,       Learn: LearnCI,       Practice: PracticeCI },
  { id: "ftest",    label: "מבחן F",           icon: "🔬", color: "#8b5cf6", questions: Q_FTEST,    Learn: LearnFTest,    Practice: PracticeFTest },
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
const EXAM_KEY = "stats-tool-exams";

function loadProgress() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; }
}
function saveProgress(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
function loadExamHistory() {
  try { const r = localStorage.getItem(EXAM_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveExamHistory(h) { localStorage.setItem(EXAM_KEY, JSON.stringify(h)); }

// ════════════════════════════════════════════
// EXAM SIMULATION
// ════════════════════════════════════════════

function ExamSimulation({ onBack, darkMode }) {
  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const card = darkMode ? "#1e293b" : "#ffffff";
  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const border = darkMode ? "#334155" : "#e2e8f0";

  const [phase, setPhase] = useState("setup"); // setup | running | results
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [show, setShow] = useState(false);
  const [timer, setTimer] = useState(null); // seconds remaining or null
  const [useTimer, setUseTimer] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [history, setHistory] = useState(loadExamHistory);

  // Timer countdown
  useEffect(() => {
    if (phase !== "running" || timer === null || timer <= 0) return;
    const id = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, timer]);

  // Auto-finish when timer hits 0
  useEffect(() => {
    if (timer === 0 && phase === "running") setPhase("results");
  }, [timer, phase]);

  const startExam = () => {
    const allQ = TOPICS.flatMap(t => t.questions.map(q => ({ ...q, topicId: t.id, topicLabel: t.label })));
    const shuffled = allQ.sort(() => Math.random() - 0.5).slice(0, 20);
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setIdx(0);
    setShow(false);
    setTimer(useTimer ? timerMinutes * 60 : null);
    setPhase("running");
  };

  const pick = (i) => {
    if (answers[idx] !== null) return;
    const newAns = [...answers];
    newAns[idx] = i;
    setAnswers(newAns);
    setShow(true);
  };

  const next = () => {
    setShow(false);
    if (idx < questions.length - 1) setIdx(idx + 1);
    else finishExam();
  };

  const finishExam = () => {
    const score = questions.reduce((s, q, i) => s + (answers[i] === q.ans ? 1 : 0), 0);
    const breakdown = {};
    questions.forEach((q, i) => {
      if (!breakdown[q.topicId]) breakdown[q.topicId] = { label: q.topicLabel, correct: 0, total: 0 };
      breakdown[q.topicId].total++;
      if (answers[i] === q.ans) breakdown[q.topicId].correct++;
    });
    const entry = { date: new Date().toLocaleDateString("he-IL"), score, total: questions.length, breakdown };
    const newHist = [entry, ...history].slice(0, 10);
    setHistory(newHist);
    saveExamHistory(newHist);
    setPhase("results");
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // SETUP
  if (phase === "setup") return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", background: bg, minHeight: "100vh", color: text }}>
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${border}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: text }}>→ חזרה</button>
        <span style={{ fontSize: 16, fontWeight: 700 }}>🎯 סימולציית מבחן</span>
        <span />
      </div>
      <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>הגדרות מבחן</h2>
          <p style={{ fontSize: 14, color: text, marginBottom: 16 }}>20 שאלות אקראיות מכל הנושאים</p>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 12, cursor: "pointer" }}>
            <input type="checkbox" checked={useTimer} onChange={e => setUseTimer(e.target.checked)} />
            טיימר
          </label>
          {useTimer && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 14 }}>
              <span>דקות:</span>
              <input type="number" value={timerMinutes} onChange={e => setTimerMinutes(Math.max(5, +e.target.value))} min={5} max={120} style={{ width: 60, padding: "4px 8px", borderRadius: 6, border: `1px solid ${border}`, fontSize: 14, background: card, color: text }} />
            </div>
          )}
          <button onClick={startExam} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>התחל מבחן</button>
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: 24, background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>היסטוריה</h3>
            {history.map((h, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < history.length - 1 ? `1px solid ${border}` : "none", fontSize: 13 }}>
                <span>{h.date}</span>
                <span style={{ fontWeight: 700, color: h.score / h.total >= 0.7 ? "#16a34a" : "#dc2626" }}>{h.score}/{h.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // RUNNING
  if (phase === "running") {
    const q = questions[idx];
    const answered = answers[idx] !== null;
    return (
      <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", background: bg, minHeight: "100vh", color: text }}>
        <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: text }}>שאלה {idx + 1} / {questions.length}</span>
          <span style={{ fontSize: 12, color: darkMode ? "#94a3b8" : "#64748b", background: darkMode ? "#334155" : "#f1f5f9", padding: "4px 10px", borderRadius: 8 }}>{q.topicLabel}</span>
          {timer !== null && <span style={{ fontSize: 14, fontWeight: 700, color: timer < 60 ? "#dc2626" : text }}>{fmtTime(timer)}</span>}
        </div>
        <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}>
          <div style={{ width: "100%", height: 4, background: darkMode ? "#334155" : "#e2e8f0", borderRadius: 2, marginBottom: 18 }}>
            <div style={{ width: `${((idx + 1) / questions.length) * 100}%`, height: 4, background: "#2563eb", borderRadius: 2, transition: "width 0.3s" }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.8 }}>{q.q}</p>
          {q.opts.map((o, i) => {
            let bg2 = card, brd = `1px solid ${border}`;
            if (show && i === q.ans) { bg2 = "#dcfce7"; brd = "2px solid #22c55e"; }
            else if (show && i === answers[idx] && i !== q.ans) { bg2 = "#fee2e2"; brd = "2px solid #ef4444"; }
            return (
              <div key={i} onClick={() => pick(i)} style={{ padding: "12px 16px", marginBottom: 10, borderRadius: 12, border: brd, background: bg2, cursor: answered ? "default" : "pointer", fontSize: 14, lineHeight: 1.7, transition: "all 0.15s", color: text }}>{o}</div>
            );
          })}
          {show && q.explain && (
            <div style={{ background: darkMode ? "#1e3a5f" : "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 14, marginTop: 10, fontSize: 13, color: darkMode ? "#bfdbfe" : "#0c4a6e", lineHeight: 1.8, whiteSpace: "pre-line" }}>{q.explain}</div>
          )}
          {show && (
            <button onClick={next} style={{ marginTop: 14, padding: "10px 28px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {idx < questions.length - 1 ? "הבאה →" : "סיים מבחן"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // RESULTS
  const score = questions.reduce((s, q, i) => s + (answers[i] === q.ans ? 1 : 0), 0);
  const pct = Math.round((score / questions.length) * 100);
  const breakdown = {};
  questions.forEach((q, i) => {
    if (!breakdown[q.topicId]) breakdown[q.topicId] = { label: q.topicLabel, correct: 0, total: 0 };
    breakdown[q.topicId].total++;
    if (answers[i] === q.ans) breakdown[q.topicId].correct++;
  });

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", background: bg, minHeight: "100vh", color: text }}>
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${border}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: text }}>→ חזרה</button>
        <span style={{ fontSize: 16, fontWeight: 700 }}>תוצאות</span>
        <span />
      </div>
      <div style={{ maxWidth: 500, margin: "30px auto", padding: "0 16px" }}>
        <div style={{ textAlign: "center", background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 30, marginBottom: 20 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: pct >= 70 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626" }}>{pct}%</div>
          <p style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>{score} / {questions.length}</p>
          <p style={{ fontSize: 14, color: darkMode ? "#94a3b8" : "#64748b", marginTop: 4 }}>
            {pct >= 85 ? "מצוין!" : pct >= 70 ? "טוב מאוד" : pct >= 50 ? "צריך לחזק" : "כדאי לחזור על החומר"}
          </p>
        </div>

        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>פירוט לפי נושא</h3>
          {Object.entries(breakdown).map(([id, b]) => (
            <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${border}`, fontSize: 13 }}>
              <span>{b.label}</span>
              <span style={{ fontWeight: 700, color: b.correct === b.total ? "#16a34a" : b.correct === 0 ? "#dc2626" : "#d97706" }}>{b.correct}/{b.total}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
          <button onClick={() => { setPhase("setup"); }} style={{ padding: "10px 24px", borderRadius: 10, border: `1px solid ${border}`, background: card, color: text, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>מבחן חדש</button>
          <button onClick={onBack} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>חזרה לתפריט</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// DECISION TREE
// ════════════════════════════════════════════

const TREE_STEPS = [
  {
    q: "מה המטרה?",
    opts: [
      { label: "הבדל בין קבוצות", next: 1 },
      { label: "קשר / מתאם בין משתנים", next: 5 },
      { label: "ניבוי (רגרסיה)", next: -1, result: "רגרסיה לינארית" },
      { label: "התאמה להתפלגות תיאורטית", next: 8 },
    ],
  },
  {
    q: "כמה קבוצות?",
    opts: [
      { label: "מדגם בודד (vs ערך ידוע)", next: 2 },
      { label: "2 קבוצות", next: 3 },
    ],
  },
  {
    q: "האם σ ידועה?",
    opts: [
      { label: "כן, σ ידועה", next: -1, result: "מבחן Z למדגם בודד" },
      { label: "לא, σ לא ידועה", next: -1, result: "מבחן t למדגם בודד (df=n-1)" },
    ],
  },
  {
    q: "מה סוג הקשר בין הקבוצות?",
    opts: [
      { label: "תלויים (אותם נבדקים / תאומים)", next: 4 },
      { label: "בלתי תלויים (קבוצות נפרדות)", next: 4 },
    ],
  },
  {
    q: "סולם המדידה ונורמליות?",
    opts: [
      { label: "רווח/יחס + נורמלי + תלויים", next: -1, result: "t למדגמים תלויים" },
      { label: "רווח/יחס + נורמלי + ב״ת", next: -1, result: "t ב״ת (אחרי מבחן F לשונויות!)" },
      { label: "סדר / אין נורמליות + תלויים", next: -1, result: "וילקוקסון למדגמים תלויים" },
      { label: "סדר / אין נורמליות + ב״ת", next: -1, result: "מאן-וויטני" },
    ],
  },
  {
    q: "סוגי המשתנים?",
    opts: [
      { label: "2 רציפים", next: 6 },
      { label: "דיכוטומי × רציף", next: -1, result: "rpb (מתאם נקודתי דו-סדרתי)" },
      { label: "2 שמיים / קטגוריאליים", next: 7 },
    ],
  },
  {
    q: "נורמליות + לינאריות?",
    opts: [
      { label: "כן, נורמלי + לינארי", next: -1, result: "פירסון (r)" },
      { label: "לא, או סדר", next: -1, result: "ספירמן (rs)" },
    ],
  },
  {
    q: "גודל הטבלה?",
    opts: [
      { label: "2×2", next: -1, result: "χ² לאי תלות + φ כגודל אפקט" },
      { label: "גדולה מ-2×2", next: -1, result: "χ² לאי תלות + Cramer's V כגודל אפקט" },
    ],
  },
  {
    q: "כמה קטגוריות?",
    opts: [
      { label: "בדיוק 2", next: -1, result: "מבחן בינום (או χ² טיב התאמה)" },
      { label: "3 ומעלה", next: -1, result: "χ² לטיב התאמה (df=k-1)" },
    ],
  },
];

function DecisionTree({ onBack, darkMode }) {
  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const card = darkMode ? "#1e293b" : "#ffffff";
  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const border = darkMode ? "#334155" : "#e2e8f0";

  const [path, setPath] = useState([0]);
  const [result, setResult] = useState(null);

  const current = TREE_STEPS[path[path.length - 1]];

  const choose = (opt) => {
    if (opt.next === -1) {
      setResult(opt.result);
    } else {
      setPath([...path, opt.next]);
    }
  };

  const goBack = () => {
    if (result) { setResult(null); return; }
    if (path.length > 1) setPath(path.slice(0, -1));
  };

  const reset = () => { setPath([0]); setResult(null); };

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", background: bg, minHeight: "100vh", color: text }}>
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${border}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: text }}>→ חזרה</button>
        <span style={{ fontSize: 16, fontWeight: 700 }}>🌳 עץ החלטות</span>
        <span />
      </div>
      <div style={{ maxWidth: 500, margin: "30px auto", padding: "0 16px" }}>
        {/* Breadcrumbs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, fontSize: 12, color: darkMode ? "#94a3b8" : "#64748b" }}>
          {path.map((stepIdx, i) => (
            <span key={i}>{i > 0 && " → "}{TREE_STEPS[stepIdx].q}</span>
          ))}
        </div>

        {result ? (
          <div style={{ background: card, border: `2px solid #22c55e`, borderRadius: 16, padding: 30, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#16a34a", marginBottom: 8 }}>המבחן המומלץ:</h2>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{result}</p>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
              <button onClick={goBack} style={{ padding: "8px 20px", borderRadius: 10, border: `1px solid ${border}`, background: card, color: text, fontSize: 13, cursor: "pointer" }}>חזור שלב</button>
              <button onClick={reset} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>התחל מחדש</button>
            </div>
          </div>
        ) : (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{current.q}</h2>
            {current.opts.map((opt, i) => (
              <div key={i} onClick={() => choose(opt)} style={{
                padding: "14px 18px", marginBottom: 10, borderRadius: 12,
                border: `1px solid ${border}`, background: card,
                cursor: "pointer", fontSize: 14, fontWeight: 500,
                transition: "all 0.15s", color: text,
              }}>{opt.label}</div>
            ))}
            {path.length > 1 && (
              <button onClick={goBack} style={{ marginTop: 8, background: "none", border: "none", color: "#6366f1", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>← חזור שלב</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// FORMULAS & TABLES PAGE
// ════════════════════════════════════════════

function FormulasPage({ onBack, darkMode }) {
  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const card = darkMode ? "#1e293b" : "#ffffff";
  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const border = darkMode ? "#334155" : "#e2e8f0";
  const subtle = darkMode ? "#94a3b8" : "#64748b";

  const [tab, setTab] = useState("formulas");
  const [lookupType, setLookupType] = useState("z");
  const [lookupVal, setLookupVal] = useState("");
  const [lookupResult, setLookupResult] = useState(null);

  // Table lookup logic
  const doLookup = () => {
    const v = parseFloat(lookupVal);
    if (isNaN(v)) { setLookupResult("ערך לא חוקי"); return; }
    if (lookupType === "z") {
      const p = normalCDF(v);
      setLookupResult(`P(Z ≤ ${v}) = ${p.toFixed(4)} | P(Z > ${v}) = ${(1 - p).toFixed(4)}`);
    } else if (lookupType === "t") {
      const df = parseInt(prompt("הזן df:") || "10");
      if (isNaN(df) || df < 1) { setLookupResult("df לא חוקי"); return; }
      const tc05 = tCritical(df, 0.05);
      const tc01 = tCritical(df, 0.01);
      setLookupResult(`df=${df}: t(0.05)=${tc05}, t(0.025)=${tCritical(df, 0.025)}, t(0.01)=${tc01}`);
    } else if (lookupType === "chi") {
      const df = parseInt(lookupVal);
      if (isNaN(df) || df < 1) { setLookupResult("df לא חוקי"); return; }
      setLookupResult(`df=${df}: χ²(0.05)=${chiCritical(df, 0.05)}, χ²(0.01)=${chiCritical(df, 0.01)}`);
    } else if (lookupType === "f") {
      const parts = lookupVal.split(",").map(s => parseInt(s.trim()));
      if (parts.length < 2 || parts.some(isNaN)) { setLookupResult("הזן df1,df2 (למשל: 3,20)"); return; }
      setLookupResult(`F(${parts[0]},${parts[1]}): α=0.05→${fCritical(parts[0], parts[1], 0.05)}, α=0.01→${fCritical(parts[0], parts[1], 0.01)}`);
    }
  };

  const thS = { padding: "6px 10px", fontSize: 12, fontWeight: 700, textAlign: "center", border: "1px solid #d1d5db", whiteSpace: "nowrap", background: darkMode ? "#334155" : "#f1f5f9" };
  const tdS = { padding: "6px 10px", fontSize: 12, textAlign: "center", border: "1px solid #d1d5db" };

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", background: bg, minHeight: "100vh", color: text }}>
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${border}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: text }}>→ חזרה</button>
        <span style={{ fontSize: 16, fontWeight: 700 }}>📋 נוסחאות וטבלאות</span>
        <span />
      </div>

      {/* Tab selector */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "16px 16px 0", background: card }}>
        {[["formulas", "נוסחאות"], ["assumptions", "הנחות"], ["tables", "טבלאות"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "10px 20px", borderRadius: "12px 12px 0 0",
            border: tab === id ? "2px solid #2563eb" : `1px solid ${border}`,
            borderBottom: tab === id ? "3px solid #2563eb" : "none",
            background: tab === id ? card : "transparent",
            color: tab === id ? "#2563eb" : subtle,
            fontSize: 14, fontWeight: tab === id ? 700 : 500, cursor: "pointer",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px 60px" }}>
        {tab === "formulas" && (
          <div style={{ lineHeight: 1.9, fontSize: 14 }}>
            <InfoBox bg={darkMode ? "#1e3a5f" : "#eff6ff"} border="#bfdbfe" title="מבחני t" titleColor="#2563eb">
              <p>t (בודד) = (X̄ - μ₀) / (Ŝ/√n), df = n-1</p>
              <p>t (תלויים) = d̄ / (Sd/√n), df = n-1</p>
              <p>t (ב״ת pooled) = (X̄₁-X̄₂) / (Sp·√(1/n₁+1/n₂)), df = n₁+n₂-2</p>
              <p>Sp² = ((n₁-1)S₁² + (n₂-1)S₂²) / (n₁+n₂-2)</p>
              <p>Cohen's d = |X̄₁-X̄₂|/Sp | rpb = √(t²/(t²+df))</p>
            </InfoBox>
            <InfoBox bg={darkMode ? "#1e293b" : "#faf5ff"} border="#e9d5ff" title="χ² ומתאמים" titleColor="#9333ea">
              <p>χ² = Σ(fo-fe)²/fe | GOF: df=k-1 | אי תלות: df=(r-1)(c-1)</p>
              <p>φ = √(χ²/N) | V = √(χ²/(N·(min(r,c)-1)))</p>
              <p>r (פירסון) = ΣZxZy/n | rs (ספירמן) = 1-6Σdi²/(n(n²-1))</p>
              <p>t (מובהקות r) = r√(n-2)/√(1-r²), df=n-2</p>
              <p>r' (פישר) = 0.5·ln((1+r)/(1-r)), σr' = 1/√(n-3)</p>
            </InfoBox>
            <InfoBox bg={darkMode ? "#1e3a2e" : "#ecfdf5"} border="#a7f3d0" title="רגרסיה" titleColor="#047857">
              <p>Y' = a + bX | b = r·Sy/Sx | a = Ȳ - b·X̄</p>
              <p>r² = SSreg/SStot | Se = √(SSres/(n-2))</p>
              <p>F = MSreg/MSres, df=(1,n-2)</p>
            </InfoBox>
            <InfoBox bg={darkMode ? "#2d1f1f" : "#fef2f2"} border="#fecaca" title="רווחי סמך" titleColor="#dc2626">
              <p>σ ידועה: X̄ ± Z(α/2)·σ/√n</p>
              <p>σ לא ידועה: X̄ ± t(α/2,n-1)·Ŝ/√n</p>
              <p>תלויים: d̄ ± t·(Sd/√n)</p>
              <p>ב״ת: (X̄₁-X̄₂) ± t·SE</p>
            </InfoBox>
            <InfoBox bg={darkMode ? "#2d2b1f" : "#fffbeb"} border="#fde68a" title="בינום ועוצמה" titleColor="#a16207">
              <p>P(X=k) = C(n,k)·p^k·q^(n-k)</p>
              <p>μ=np, σ=√(npq), Z=(k±0.5-np)/√(npq)</p>
              <p>עוצמה = ΣP(k|p₁) לכל k באזור דחייה</p>
              <p>F (שונויות) = Ŝmax²/Ŝmin², df=(nmax-1, nmin-1)</p>
            </InfoBox>
            <InfoBox bg={darkMode ? "#1e293b" : "#f0fdfa"} border="#99f6e4" title="א-פרמטריים" titleColor="#0d9488">
              <p>וילקוקסון: T=min(T⁺,T⁻), μT=n(n+1)/4, σT=√(n(n+1)(2n+1)/24)</p>
              <p>מאן-וויטני: μW=nA(nA+nB+1)/2, σW=√(nA·nB·(nA+nB+1)/12)</p>
            </InfoBox>
          </div>
        )}

        {tab === "assumptions" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={thS}>מבחן</th>
                  <th style={thS}>דגימה מקרית</th>
                  <th style={thS}>נורמליות</th>
                  <th style={thS}>שוויון שונויות</th>
                  <th style={thS}>הנחות נוספות</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["t בודד", "✓", "✓ (או n>30)", "—", ""],
                  ["t תלויים", "✓", "✓ הפרשים", "—", ""],
                  ["t ב״ת", "✓", "✓", "מבחן F", ""],
                  ["χ² טיב התאמה", "✓", "—", "—", "fe≥5 ב-80%+"],
                  ["χ² אי תלות", "✓", "—", "—", "fe≥5 ב-80%+"],
                  ["בינום", "✓", "—", "—", "אי-תלות, 2 תוצאות"],
                  ["F שונויות", "✓", "✓ (רגיש!)", "—", ""],
                  ["וילקוקסון", "✓", "—", "—", ""],
                  ["מאן-וויטני", "✓", "—", "—", ""],
                  ["פירסון", "✓", "✓ דו-משתנית", "—", "לינאריות"],
                  ["ספירמן", "✓", "—", "—", "מונוטוניות"],
                  ["רגרסיה", "✓", "✓ שגיאות", "—", "לינאריות, הומוסקדסטיות"],
                ].map(([test, ...vals], i) => (
                  <tr key={i}>
                    <td style={{ ...tdS, fontWeight: 700 }}>{test}</td>
                    {vals.map((v, j) => <td key={j} style={tdS}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "tables" && (
          <div>
            {/* Lookup tool */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>חיפוש ערך קריטי</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {[["z", "Z"], ["t", "t"], ["chi", "χ²"], ["f", "F"]].map(([id, label]) => (
                  <button key={id} onClick={() => { setLookupType(id); setLookupResult(null); setLookupVal(""); }} style={{
                    padding: "6px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                    border: lookupType === id ? "2px solid #2563eb" : `1px solid ${border}`,
                    background: lookupType === id ? "#2563eb15" : card,
                    color: lookupType === id ? "#2563eb" : text, fontWeight: lookupType === id ? 700 : 500,
                  }}>{label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={lookupVal} onChange={e => setLookupVal(e.target.value)} placeholder={lookupType === "z" ? "הזן Z (למשל 1.96)" : lookupType === "t" ? "הזן Z ואז df" : lookupType === "chi" ? "הזן df" : "הזן df1,df2"} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${border}`, fontSize: 13, background: card, color: text }} onKeyDown={e => e.key === "Enter" && doLookup()} />
                <button onClick={doLookup} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>חפש</button>
              </div>
              {lookupResult && (
                <p style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: "#2563eb", background: darkMode ? "#1e3a5f" : "#eff6ff", padding: "8px 12px", borderRadius: 8 }}>{lookupResult}</p>
              )}
            </div>

            {/* Common Z values */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>ערכי Z נפוצים</h3>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead><tr><th style={thS}>α (דו-זנבי)</th><th style={thS}>α/2</th><th style={thS}>Z(α/2)</th></tr></thead>
                <tbody>
                  {[[0.10, 0.05, 1.645], [0.05, 0.025, 1.96], [0.02, 0.01, 2.326], [0.01, 0.005, 2.576]].map(([a, a2, z], i) => (
                    <tr key={i}><td style={tdS}>{a}</td><td style={tdS}>{a2}</td><td style={{ ...tdS, fontWeight: 700 }}>{z}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* t table excerpt */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>טבלת t (ערכים נבחרים)</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead><tr><th style={thS}>df</th><th style={thS}>α=0.10</th><th style={thS}>α=0.05</th><th style={thS}>α=0.025</th><th style={thS}>α=0.01</th></tr></thead>
                  <tbody>
                    {[1, 2, 5, 10, 15, 20, 25, 30, 60, 120].map(df => (
                      <tr key={df}>
                        <td style={{ ...tdS, fontWeight: 700 }}>{df}</td>
                        <td style={tdS}>{tCritical(df, 0.10)}</td>
                        <td style={tdS}>{tCritical(df, 0.05)}</td>
                        <td style={tdS}>{tCritical(df, 0.025)}</td>
                        <td style={tdS}>{tCritical(df, 0.01)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chi table excerpt */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>טבלת χ² (ערכים נבחרים)</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead><tr><th style={thS}>df</th><th style={thS}>α=0.10</th><th style={thS}>α=0.05</th><th style={thS}>α=0.025</th><th style={thS}>α=0.01</th></tr></thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30].map(df => (
                      <tr key={df}>
                        <td style={{ ...tdS, fontWeight: 700 }}>{df}</td>
                        <td style={tdS}>{chiCritical(df, 0.10)}</td>
                        <td style={tdS}>{chiCritical(df, 0.05)}</td>
                        <td style={tdS}>{chiCritical(df, 0.025)}</td>
                        <td style={tdS}>{chiCritical(df, 0.01)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
// MAIN APP COMPONENT
// ════════════════════════════════════════════

export default function App() {
  const [view, setView] = useState("home"); // home | topic | exam | tree | formulas
  const [topic, setTopic] = useState(null);
  const [tab, setTab] = useState("learn");
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
    setView("topic");
    markVisited(t.id, "learn");
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (topic) markVisited(topic.id, newTab);
  };

  const goHome = () => { setView("home"); setTopic(null); };

  // ---- THEME ----
  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const card = darkMode ? "#1e293b" : "#ffffff";
  const text = darkMode ? "#e2e8f0" : "#1e293b";
  const subtle = darkMode ? "#94a3b8" : "#64748b";
  const border = darkMode ? "#334155" : "#e2e8f0";

  // ---- FEATURE VIEWS ----
  if (view === "exam") return <ExamSimulation onBack={goHome} darkMode={darkMode} />;
  if (view === "tree") return <DecisionTree onBack={goHome} darkMode={darkMode} />;
  if (view === "formulas") return <FormulasPage onBack={goHome} darkMode={darkMode} />;

  // ---- HOME SCREEN ----
  if (view === "home" || !topic) {
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

          {/* Feature buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 24 }}>
            {[
              { id: "exam", icon: "🎯", label: "סימולציית מבחן", desc: "20 שאלות · טיימר · ציון", color: "#dc2626" },
              { id: "tree", icon: "🌳", label: "עץ החלטות", desc: "זהה את המבחן הנכון", color: "#059669" },
              { id: "formulas", icon: "📋", label: "נוסחאות וטבלאות", desc: "כל הנוסחאות + טבלאות", color: "#2563eb" },
            ].map(f => (
              <div key={f.id} onClick={() => setView(f.id)} style={{
                background: card, border: `2px solid ${f.color}30`, borderRadius: 16, padding: 16,
                cursor: "pointer", textAlign: "center", transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{f.icon}</div>
                <p style={{ fontWeight: 700, fontSize: 13, color: text, marginBottom: 4 }}>{f.label}</p>
                <p style={{ fontSize: 11, color: subtle }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick attack guide */}
          <div style={{ marginTop: 24, background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
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
        <button onClick={goHome} style={{
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
