import { useState } from "react";
import {
  genChiGOF, genChiInd, genBinom, genTSingle, genTPaired, genTInd,
  genFTest, genWilcoxonPaired, genMannWhitney, genCorrPearson, genCorrCompare,
  genRpb, genPhiV, genRegFull, genRegression, genCI, genPower, genPowerZ, rnd,
} from "./data.jsx";

// ════════════════════════════════════════════
// SHARED UI COMPONENTS
// ════════════════════════════════════════════

export function InfoBox({ bg, border, title, titleColor, children }) {
  return (
    <div style={{ background: bg, border: "1px solid " + border, borderRadius: 12, padding: 16, margin: "12px 0", lineHeight: 1.9 }}>
      <p style={{ fontWeight: 700, color: titleColor, marginBottom: 8, fontSize: 14 }}>{title}</p>
      <div style={{ fontSize: 13, color: "#334155" }}>{children}</div>
    </div>
  );
}

export function StepCard({ title, active, done, children, color = "#2563eb" }) {
  return (
    <div style={{
      border: active ? `2px solid ${color}` : "1px solid #e2e8f0",
      borderRadius: 12, padding: 16, marginBottom: 12,
      background: done ? "#f8fafc" : "#fff",
      opacity: done && !active ? 0.7 : 1,
      transition: "all 0.2s",
    }}>
      <p style={{ fontWeight: 700, fontSize: 14, color: active ? color : "#64748b", marginBottom: 10 }}>
        {done ? "✓ " : ""}{title}
      </p>
      {children}
    </div>
  );
}

export const revBtn = {
  padding: "8px 20px", borderRadius: 8, border: "1px solid #cbd5e1",
  background: "#f1f5f9", cursor: "pointer", fontSize: 13, fontWeight: 600,
  fontFamily: "'Segoe UI', Tahoma, sans-serif",
};

export const navBtn = {
  padding: "8px 20px", borderRadius: 8, border: "1px solid #cbd5e1",
  background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
};

export const checkBtn = (color) => ({
  padding: "6px 16px", borderRadius: 8, border: "none",
  background: color, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
});

export const thS = { padding: "6px 10px", fontSize: 12, fontWeight: 700, textAlign: "center", border: "1px solid #d1d5db", whiteSpace: "nowrap" };
export const tdS = { padding: "6px 10px", fontSize: 13, textAlign: "center", border: "1px solid #d1d5db" };

function SubNav({ items, sub, setSub, color }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
      {items.map(([id, l]) => (
        <button key={id} onClick={() => setSub(id)} style={{
          padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer",
          border: sub === id ? `2px solid ${color}` : "1px solid #cbd5e1",
          background: sub === id ? color + "15" : "#fff",
          color: sub === id ? color : "#475569", fontWeight: sub === id ? 700 : 500,
        }}>{l}</button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════
// QUIZ COMPONENT (shared across all topics)
// ════════════════════════════════════════════

export function Quiz({ questions, color }) {
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const q = questions[idx];

  const pick = (i) => {
    if (show) return;
    setSel(i); setShow(true); setTotal(t => t + 1);
    if (i === q.ans) setScore(s => s + 1);
  };

  const next = () => {
    setSel(null); setShow(false);
    setIdx(i => (i + 1) % questions.length);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 13, color: "#64748b" }}>
        <span>שאלה {idx + 1} מתוך {questions.length}</span>
        <span>ציון: {score}/{total}</span>
      </div>

      <div style={{ width: "100%", height: 4, background: "#e2e8f0", borderRadius: 2, marginBottom: 18 }}>
        <div style={{ width: `${((idx + 1) / questions.length) * 100}%`, height: 4, background: color, borderRadius: 2, transition: "width 0.3s" }} />
      </div>

      <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.8, color: "#1e293b" }}>{q.q}</p>

      {q.opts.map((o, i) => {
        let bg = "#fff", brd = "1px solid #e2e8f0";
        if (show && i === q.ans) { bg = "#dcfce7"; brd = "2px solid #22c55e"; }
        else if (show && i === sel && i !== q.ans) { bg = "#fee2e2"; brd = "2px solid #ef4444"; }
        else if (!show && i === sel) { bg = "#eff6ff"; brd = "2px solid #3b82f6"; }
        return (
          <div key={i} onClick={() => pick(i)} style={{
            padding: "12px 16px", marginBottom: 10, borderRadius: 12,
            border: brd, background: bg,
            cursor: show ? "default" : "pointer",
            fontSize: 14, lineHeight: 1.7, transition: "all 0.15s",
          }}>{o}</div>
        );
      })}

      {show && (
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 14, marginTop: 10, fontSize: 13, color: "#0c4a6e", lineHeight: 1.8, whiteSpace: "pre-line" }}>
          {q.explain}
        </div>
      )}

      {show && (
        <button onClick={next} style={{
          marginTop: 14, padding: "10px 28px", borderRadius: 10,
          border: "none", background: color, color: "#fff",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>שאלה הבאה →</button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — CHI SQUARE
// ════════════════════════════════════════════

export function LearnChi() {
  const [sub, setSub] = useState("gof");
  return (
    <div>
      <SubNav items={[["gof", "טיב התאמה"], ["ind", "אי תלות"], ["effect", "גודל אפקט"], ["flow", "תרשים זרימה"]]} sub={sub} setSub={setSub} color="#1e40af" />
      {sub === "gof" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="מטרה" titleColor="#1e40af">
            <p>לבדוק האם ההתפלגות הנצפית של משתנה אחד מתאימה להתפלגות תיאורטית צפויה.</p>
            <p><strong>אינטואיציה:</strong> משווים בין מה שקיבלנו (Observed) למה שציפינו (Expected). אם הפער מספיק גדול — דוחים H₀.</p>
          </InfoBox>
          <InfoBox bg="#f0fdfa" border="#99f6e4" title="הנחות" titleColor="#0f766e">
            <p>✓ דגימה מקרית</p>
            <p>✓ אי-תלות בין תצפיות</p>
            <p>✓ קטגוריות ממצות ומוציאות</p>
            <p>✓ לכל היותר 20% מהתאים עם fe &lt; 5</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="שלבי עבודה" titleColor="#a16207">
            <p><strong>1.</strong> בדיקת הנחות</p>
            <p><strong>2.</strong> בניית טבלת Expected: fe = N × P(Xi)</p>
            <p><strong>3.</strong> בניית טבלת Observed מהנתונים</p>
            <p><strong>4.</strong> ניסוח השערות: H₀: fo = fe | H₁: fo ≠ fe</p>
            <p><strong>5.</strong> מציאת אזורי דחייה: df = k-1, ערך קריטי מטבלה (α, לא α/2!)</p>
            <p><strong>6.</strong> חישוב: χ² = Σ(fo - fe)² / fe</p>
            <p><strong>7.</strong> מסקנה ודיווח</p>
          </InfoBox>
          <InfoBox bg="#fdf2f8" border="#fbcfe8" title="⚠️ שימו לב!" titleColor="#be185d">
            <p>• המבחן תמיד חד-זנבי (זנב ימני) — α ולא α/2</p>
            <p>• עובדים עם שכיחויות, לא פרופורציות</p>
            <p>• לא מעגלים שברים בשכיחויות צפויות</p>
          </InfoBox>
        </div>
      )}
      {sub === "ind" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="מטרה" titleColor="#1e40af">
            <p>לבדוק האם קיים קשר בין שני משתנים שמיים (או סדר).</p>
            <p><strong>אינטואיציה:</strong> אם 2 משתנים בלתי תלויים, ההתפלגות המשותפת = מכפלת ההתפלגויות השוליות.</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="שלבי עבודה" titleColor="#a16207">
            <p><strong>1.</strong> בדיקת הנחות</p>
            <p><strong>2.</strong> בניית טבלת Observed + סיכומים שוליים</p>
            <p><strong>3.</strong> Expected: fe = f(שורה) × f(עמודה) / N</p>
            <p><strong>4.</strong> H₀: אין קשר | H₁: יש קשר</p>
            <p><strong>5.</strong> df = (r-1)(c-1)</p>
            <p><strong>6.</strong> χ² = Σ(fo - fe)² / fe</p>
            <p><strong>7.</strong> מסקנה</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="💡 טיפ" titleColor="#047857">
            <p>ככל שהתלות גדולה → fo רחוקים יותר מ-fe → χ² גדול → סיכוי גבוה לדחות H₀</p>
          </InfoBox>
        </div>
      )}
      {sub === "effect" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#faf5ff" border="#e9d5ff" title="φ — טבלת 2×2" titleColor="#9333ea">
            <p><strong>נוסחה:</strong> φ = √(χ²/N)</p>
            <p><strong>פרשנות:</strong> |φ| &lt; 0.1 חלש, 0.1-0.3 בינוני, &gt; 0.3 חזק</p>
            <p>φ הוא למעשה מקרה פרטי של Cramer's V כש-min(r,c)=2</p>
          </InfoBox>
          <InfoBox bg="#fff7ed" border="#fed7aa" title="Cramer's V — טבלה גדולה" titleColor="#ea580c">
            <p><strong>נוסחה:</strong> V = √(χ² / (N·(min(r,c)-1)))</p>
            <p><strong>פרשנות:</strong> V &lt; 0.1 חלש, 0.1-0.3 בינוני, &gt; 0.3 חזק</p>
            <p>בטבלת 2×2: V = φ</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="מתי להשתמש?" titleColor="#047857">
            <p>• <strong>2×2</strong> → φ</p>
            <p>• <strong>גדולה מ-2×2</strong> → Cramer's V</p>
            <p>• תמיד לדווח גודל אפקט לצד מובהקות!</p>
          </InfoBox>
        </div>
      )}
      {sub === "flow" && (
        <InfoBox bg="#fef2f2" border="#fecaca" title="🔀 מתי טיב התאמה ומתי אי תלות?" titleColor="#dc2626">
          <p><strong>משתנה אחד:</strong> → χ² לטיב התאמה (df = k-1)</p>
          <p><strong>שני משתנים:</strong> → χ² לאי תלות (df = (r-1)(c-1))</p>
          <p><strong>בדיוק 2 קטגוריות:</strong> → אפשר גם מבחן בינום</p>
          <p style={{ marginTop: 10, fontWeight: 700 }}>לפני הכל — בדיקת הנחות! דגימה מקרית + אי תלות + ממצות + fe ≥ 5 ב-80%+</p>
        </InfoBox>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — T-TESTS (enhanced: Welch, Cohen's d, rpb)
// ════════════════════════════════════════════

export function LearnTTest() {
  const [sub, setSub] = useState("single");
  return (
    <div>
      <SubNav items={[["single", "מדגם בודד"], ["paired", "תלויים"], ["ind", "ב״ת"], ["f", "מבחן F"], ["cohen", "Cohen's d"], ["rpb", "rpb"]]} sub={sub} setSub={setSub} color="#059669" />
      {sub === "single" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="t למדגם בודד" titleColor="#059669">
            <p><strong>מטרה:</strong> לבדוק אם ממוצע המדגם שונה מערך ידוע μ₀.</p>
            <p><strong>נוסחה:</strong> t = (X̄ - μ₀) / (Ŝ/√n)</p>
            <p><strong>df = n - 1</strong></p>
          </InfoBox>
          <InfoBox bg="#f0fdfa" border="#99f6e4" title="הנחות" titleColor="#0f766e">
            <p>✓ דגימה מקרית</p>
            <p>✓ התפלגות דגימה נורמלית (n &gt; 30 או אוכלוסייה נורמלית)</p>
          </InfoBox>
        </div>
      )}
      {sub === "paired" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="t למדגמים תלויים" titleColor="#2563eb">
            <p><strong>מתי:</strong> אותו נבדק בשני מצבים, תאומים, זיווג</p>
            <p><strong>נוסחה:</strong> t = (d̄ - μd) / Sd̄</p>
            <p>Sd̄ = Ŝd / √n &nbsp;|&nbsp; <strong>df = n - 1</strong> (n = מספר זוגות)</p>
          </InfoBox>
          <InfoBox bg="#f0fdfa" border="#99f6e4" title="הנחות" titleColor="#0f766e">
            <p>✓ דגימה מקרית</p>
            <p>✓ נורמליות: התפלגות דגימה של ממוצעי ההפרשים נורמלית</p>
          </InfoBox>
        </div>
      )}
      {sub === "ind" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#fff7ed" border="#fed7aa" title="t למדגמים ב״ת" titleColor="#ea580c">
            <p><strong>מתי:</strong> שתי קבוצות נפרדות, ללא זיווג</p>
            <p><strong>שלב 1:</strong> מבחן F לשוויון שונויות</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="עם שוויון שונויות (F לא מובהק)" titleColor="#059669">
            <p>Sp² = ((n₁-1)Ŝ₁² + (n₂-1)Ŝ₂²) / (n₁+n₂-2)</p>
            <p>SE = Sp · √(1/n₁ + 1/n₂)</p>
            <p>df = n₁ + n₂ - 2</p>
          </InfoBox>
          <InfoBox bg="#fef2f2" border="#fecaca" title="ללא שוויון שונויות (F מובהק → Welch)" titleColor="#dc2626">
            <p>SE = √(Ŝ₁²/n₁ + Ŝ₂²/n₂)</p>
            <p>df' (ולש-בהרנס) = (Ŝ₁²/n₁ + Ŝ₂²/n₂)² / [(Ŝ₁²/n₁)²/(n₁-1) + (Ŝ₂²/n₂)²/(n₂-1)]</p>
            <p>df' תמיד ≤ n₁+n₂-2 (יותר שמרני)</p>
          </InfoBox>
        </div>
      )}
      {sub === "f" && (
        <InfoBox bg="#faf5ff" border="#e9d5ff" title="מבחן F לשוויון שונויות" titleColor="#7c3aed">
          <p><strong>מטרה:</strong> בדיקה אם σ₁² = σ₂² לפני t ב״ת</p>
          <p><strong>נוסחה:</strong> F = Ŝmax² / Ŝmin² (גדולה חלקי קטנה)</p>
          <p><strong>df:</strong> (n_max - 1, n_min - 1)</p>
          <p><strong>F מובהק:</strong> שונויות לא שוות → Welch</p>
          <p><strong>F לא מובהק:</strong> שוויון → pooled t</p>
          <p style={{ marginTop: 8, color: "#be185d", fontWeight: 600 }}>⚠️ מבחן F בודק פרמטר שונה מ-t! F = שונויות, t = ממוצעים.</p>
        </InfoBox>
      )}
      {sub === "cohen" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="Cohen's d — גודל אפקט ל-t" titleColor="#2563eb">
            <p><strong>מדגם בודד / תלויים:</strong> d = |X̄ - μ₀| / Ŝ = |t| / √n</p>
            <p><strong>ב״ת:</strong> d = |X̄₁ - X̄₂| / Sp</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="פרשנות Cohen's d" titleColor="#a16207">
            <p>d ≈ 0.2 → אפקט <strong>קטן</strong></p>
            <p>d ≈ 0.5 → אפקט <strong>בינוני</strong></p>
            <p>d ≈ 0.8 → אפקט <strong>גדול</strong></p>
          </InfoBox>
          <InfoBox bg="#fdf2f8" border="#fbcfe8" title="למה חשוב?" titleColor="#be185d">
            <p>• מובהקות תלויה ב-n, גודל אפקט לא</p>
            <p>• n גדול מאוד → כל הבדל יהיה מובהק, אבל d אומר אם הוא <em>משמעותי</em></p>
            <p>• תמיד לדווח גודל אפקט לצד מובהקות!</p>
          </InfoBox>
        </div>
      )}
      {sub === "rpb" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#faf5ff" border="#e9d5ff" title="rpb — קשר בין דיכוטומי לרציף" titleColor="#9333ea">
            <p><strong>נוסחה מ-t:</strong> rpb = √(t² / (t² + df))</p>
            <p><strong>פרשנות:</strong> גודל אפקט של מבחן t ב״ת בסולם מתאם</p>
            <p>rpb² = אחוז השונות המוסברת ע״י המשתנה הדיכוטומי</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="המרה d ↔ rpb" titleColor="#047857">
            <p>rpb = d / √(d² + 4)</p>
            <p>d = 2·rpb / √(1 - rpb²)</p>
            <p>שני המדדים מודדים את אותו אפקט בסולמות שונים</p>
          </InfoBox>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — CI (enhanced: interpretation, duality)
// ════════════════════════════════════════════

export function LearnCI() {
  const [sub, setSub] = useState("formulas");
  return (
    <div>
      <SubNav items={[["formulas", "נוסחאות"], ["interpret", "פרשנות"], ["duality", "דואליות"]]} sub={sub} setSub={setSub} color="#059669" />
      {sub === "formulas" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="σ ידועה → Z" titleColor="#2563eb">
            <p><strong>נוסחה:</strong> X̄ ± Z(α/2) · σ/√n</p>
            <p>משתמשים בטבלת Z. למשל: Z(0.025) = 1.96 עבור 95%.</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="σ לא ידועה → t" titleColor="#059669">
            <p><strong>נוסחה:</strong> X̄ ± t(α/2, n-1) · Ŝ/√n</p>
            <p>משתמשים בטבלת t עם df = n-1.</p>
          </InfoBox>
          <InfoBox bg="#fff7ed" border="#fed7aa" title="מדגמים תלויים" titleColor="#ea580c">
            <p>d̄ ± t(α/2, n-1) · Sd̄</p>
            <p>בונים על ממוצע ההפרשים וסטיית תקן ההפרשים.</p>
          </InfoBox>
          <InfoBox bg="#faf5ff" border="#e9d5ff" title="מדגמים ב״ת" titleColor="#7c3aed">
            <p>(X̄₁ - X̄₂) ± t(α/2, df) · SE</p>
            <p>עם שוויון: df = n₁+n₂-2, SE = Sp·√(1/n₁+1/n₂)</p>
            <p>בלי שוויון: df' (Welch), SE = √(Ŝ₁²/n₁+Ŝ₂²/n₂)</p>
          </InfoBox>
        </div>
      )}
      {sub === "interpret" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#fef2f2" border="#fecaca" title="⚠️ פרשנות נכונה" titleColor="#dc2626">
            <p><strong>נכון:</strong> ב-95% מהמדגמים החוזרים, הרווח שייבנה יכיל את μ.</p>
            <p><strong>לא נכון:</strong> ❌ "יש סיכוי של 95% ש-μ נמצא בתוך הרווח"</p>
            <p>μ הוא קבוע! הוא או בתוך הרווח או לא. ה-95% מתייחס לתהליך הבנייה.</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="כללים חשובים" titleColor="#a16207">
            <p>• n↑ → רווח צר יותר</p>
            <p>• רמת ביטחון↑ → רווח רחב יותר</p>
            <p>• σ↑ → רווח רחב יותר</p>
            <p>• Z כשσ ידועה, t כשσ לא ידועה (גם אם n גדול!)</p>
          </InfoBox>
        </div>
      )}
      {sub === "duality" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="דואליות: רווח סמך ↔ מבחן השערות" titleColor="#2563eb">
            <p>רווח סמך ב-95% שקול למבחן השערות ב-α=0.05 דו-זנבי:</p>
            <p><strong>μ₀ בתוך הרווח</strong> → לא דוחים H₀</p>
            <p><strong>μ₀ מחוץ לרווח</strong> → דוחים H₀</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="דוגמה" titleColor="#047857">
            <p>רווח סמך 95% לממוצע: [97.2, 102.8]</p>
            <p>H₀: μ = 100 → 100 בתוך הרווח → לא דוחים</p>
            <p>H₀: μ = 95 → 95 מחוץ לרווח → דוחים</p>
          </InfoBox>
          <InfoBox bg="#fdf2f8" border="#fbcfe8" title="שימו לב" titleColor="#be185d">
            <p>• הדואליות עובדת רק לדו-זנבי!</p>
            <p>• חד-זנבי → לא ניתן להסיק ישירות מרווח סמך רגיל</p>
          </InfoBox>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — BINOMIAL (enhanced: normal approx example)
// ════════════════════════════════════════════

export function LearnBinom() {
  const [sub, setSub] = useState("theory");
  return (
    <div>
      <SubNav items={[["theory", "תיאוריה"], ["approx", "קירוב נורמלי"], ["power", "עוצמה"]]} sub={sub} setSub={setSub} color="#7c3aed" />
      {sub === "theory" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#faf5ff" border="#e9d5ff" title="התפלגות בינומית" titleColor="#7c3aed">
            <p><strong>ניסוי ברנולי:</strong> 2 תוצאות (הצלחה p, כישלון q=1-p), בלתי תלויים, p קבוע.</p>
            <p><strong>X ~ B(n, p)</strong></p>
            <p>μ = np &nbsp;|&nbsp; σ = √(npq)</p>
            <p>P(X=k) = C(n,k) · p^k · q^(n-k)</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="מבחן הבינום — שלבי עבודה" titleColor="#a16207">
            <p><strong>1.</strong> בדיקת הנחות: מקרית, אי-תלות, 2 תוצאות</p>
            <p><strong>2.</strong> בניית פונקציית הסתברות תחת H₀</p>
            <p><strong>3.</strong> קביעת אזור דחייה: סכימה מהזנב עד α</p>
            <p><strong>4.</strong> בדיקה: האם k באזור הדחייה?</p>
            <p><strong>5.</strong> מסקנה ודיווח</p>
          </InfoBox>
        </div>
      )}
      {sub === "approx" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="קירוב נורמלי — תנאים ונוסחה" titleColor="#2563eb">
            <p><strong>תנאי:</strong> n·p ≥ 5 <strong>וגם</strong> n·q ≥ 5</p>
            <p><strong>נוסחה:</strong> Z = (k ± 0.5 - np) / √(npq)</p>
            <p>ה-±0.5 = תיקון רציפות (בדידה → רציפה)</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="📝 דוגמה מלאה" titleColor="#047857">
            <p><strong>נתון:</strong> n=40, p₀=0.3, k=18, H₁: p&gt;0.3 (חד-ימני), α=0.05</p>
            <p>np₀=12, nq₀=28 → שני ≥5 ✓</p>
            <p>Z = (18 - 0.5 - 12) / √(40·0.3·0.7) = 5.5 / 2.898 = <strong>1.90</strong></p>
            <p>Zc = 1.645 (חד-ימני)</p>
            <p>1.90 &gt; 1.645 → <strong>דוחים H₀</strong></p>
            <p style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>שימו לב: תיקון -0.5 כי חד-ימני למעלה</p>
          </InfoBox>
          <InfoBox bg="#fdf2f8" border="#fbcfe8" title="כיוון התיקון" titleColor="#be185d">
            <p><strong>P(X ≥ k):</strong> Z = (k - 0.5 - μ) / σ (מורידים 0.5)</p>
            <p><strong>P(X ≤ k):</strong> Z = (k + 0.5 - μ) / σ (מוסיפים 0.5)</p>
            <p><strong>דו-זנבי:</strong> התיקון "לפנים" (קרוב יותר לממוצע)</p>
          </InfoBox>
        </div>
      )}
      {sub === "power" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="עוצמה בבינום" titleColor="#047857">
            <p>עוצמה = סכום P(k | p₁) עבור k באזור הדחייה</p>
            <p>p₁ = הפרמטר האלטרנטיבי (לא p₀!)</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="שלבי חישוב" titleColor="#a16207">
            <p><strong>1.</strong> מצא את אזור הדחייה תחת H₀ (p₀)</p>
            <p><strong>2.</strong> חשב P(k|p₁) לכל k באזור הדחייה</p>
            <p><strong>3.</strong> סכום = עוצמה (1-β)</p>
            <p><strong>4.</strong> β = 1 - עוצמה</p>
          </InfoBox>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — WILCOXON + MANN-WHITNEY (enhanced: large-n approx)
// ════════════════════════════════════════════

export function LearnWilcoxon() {
  const [sub, setSub] = useState("paired");
  return (
    <div>
      <SubNav items={[["paired", "וילקוקסון תלויים"], ["ind", "מאן-וויטני (ב״ת)"], ["largeN", "קירוב Z"], ["flow", "מתי?"]]} sub={sub} setSub={setSub} color="#0d9488" />
      {sub === "paired" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#f0fdfa" border="#99f6e4" title="וילקוקסון למדגמים תלויים" titleColor="#0d9488">
            <p><strong>מטרה:</strong> בדיקת הבדל בין 2 אוכלוסיות, מדגמים תלויים.</p>
            <p><strong>הנחה:</strong> דגימה מקרית בלבד!</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="שלבי עבודה" titleColor="#a16207">
            <p><strong>1.</strong> חישוב d = א - ב</p>
            <p><strong>2.</strong> מחיקת d=0, עדכון n</p>
            <p><strong>3.</strong> דירוג |d| (ties → ממוצע)</p>
            <p><strong>4.</strong> החזרת סימן מקורי לדירוג</p>
            <p><strong>5.</strong> T⁺ = סכום חיוביים, T⁻ = סכום שליליים</p>
            <p><strong>6.</strong> T = min(T⁺, T⁻)</p>
            <p><strong>7.</strong> השוואה לטבלה או Z = (T±0.5-μT)/σT</p>
          </InfoBox>
          <InfoBox bg="#fdf2f8" border="#fbcfe8" title="נוסחאות Z" titleColor="#be185d">
            <p>μT = n(n+1)/4</p>
            <p>σT = √(n(n+1)(2n+1)/24)</p>
            <p>בדיקה: T⁺ + T⁻ = n(n+1)/2</p>
          </InfoBox>
        </div>
      )}
      {sub === "ind" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#fff1f2" border="#fecdd3" title="מאן-וויטני (ב״ת)" titleColor="#e11d48">
            <p><strong>מטרה:</strong> בדיקת הבדל בין 2 אוכלוסיות, מדגמים בלתי תלויים.</p>
            <p><strong>הנחה:</strong> דגימה מקרית בלבד!</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="שלבי עבודה" titleColor="#a16207">
            <p><strong>1.</strong> איחוד שני המדגמים</p>
            <p><strong>2.</strong> דירוג כולם ביחד (ties → ממוצע)</p>
            <p><strong>3.</strong> WA = סכום דירוגי הקבוצה הקטנה</p>
            <p><strong>4.</strong> השוואה לטבלה או Z = (WA±0.5-μW)/σW</p>
          </InfoBox>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="נוסחאות Z" titleColor="#2563eb">
            <p>μW = nA(nA+nB+1)/2</p>
            <p>σW = √(nA·nB·(nA+nB+1)/12)</p>
          </InfoBox>
        </div>
      )}
      {sub === "largeN" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="קירוב נורמלי — מתי?" titleColor="#2563eb">
            <p>כשמדגם גדול מספיק (בדרך כלל n &gt; 15-20), אפשר לעבור מטבלה לקירוב Z.</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="וילקוקסון — קירוב" titleColor="#047857">
            <p>Z = (T - μT ± 0.5) / σT</p>
            <p>μT = n(n+1)/4, σT = √(n(n+1)(2n+1)/24)</p>
            <p>±0.5 = תיקון רציפות</p>
          </InfoBox>
          <InfoBox bg="#fff7ed" border="#fed7aa" title="מאן-וויטני — קירוב" titleColor="#ea580c">
            <p>Z = (WA - μW ± 0.5) / σW</p>
            <p>μW = nA(nA+nB+1)/2, σW = √(nA·nB·(nA+nB+1)/12)</p>
            <p>משווים Z מול ±1.96 (דו-זנבי) או ±1.645 (חד-זנבי)</p>
          </InfoBox>
        </div>
      )}
      {sub === "flow" && (
        <InfoBox bg="#f0fdfa" border="#99f6e4" title="מתי להשתמש?" titleColor="#0d9488">
          <p><strong>נורמלי + רווח → t</strong></p>
          <p><strong>אין נורמליות / סדר + תלויים → וילקוקסון</strong></p>
          <p><strong>אין נורמליות / סדר + ב״ת → מאן-וויטני</strong></p>
          <p style={{ marginTop: 8 }}>חיסרון: עוצמה נמוכה יותר מאשר t.</p>
          <p>יתרון: פחות הנחות, סולם נמוך יותר.</p>
        </InfoBox>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — CORRELATION (enhanced: Spearman, significance, Fisher, decision)
// ════════════════════════════════════════════

export function LearnCorr() {
  const [sub, setSub] = useState("types");
  return (
    <div>
      <SubNav items={[["types", "סוגים"], ["signif", "מובהקות"], ["fisher", "פישר"], ["decision", "בחירה"]]} sub={sub} setSub={setSub} color="#9333ea" />
      {sub === "types" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#faf5ff" border="#e9d5ff" title="פירסון (r)" titleColor="#9333ea">
            <p><strong>מתי:</strong> 2 רציפים, קשר לינארי, נורמליות דו-משתנית</p>
            <p><strong>נוסחה:</strong> r = COV(X,Y) / (Sx·Sy) = ΣZxZy / n</p>
            <p>r² = שונות מוסברת | -1 ≤ r ≤ 1</p>
          </InfoBox>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="ספירמן (rs)" titleColor="#2563eb">
            <p><strong>מתי:</strong> סולם סדר / אין נורמליות / קשר מונוטוני לא לינארי</p>
            <p><strong>נוסחה:</strong> rs = פירסון על הדירוגים</p>
            <p>אם אין ties: rs = 1 - 6Σdi² / (n(n²-1))</p>
          </InfoBox>
          <InfoBox bg="#fff7ed" border="#fed7aa" title="rpb, φ, Cramer's V" titleColor="#ea580c">
            <p><strong>rpb:</strong> דיכוטומי × רציף. rpb = √(t²/(t²+df)). גודל אפקט של t ב״ת.</p>
            <p><strong>φ:</strong> 2 שמיים, טבלת 2×2. φ = √(χ²/N).</p>
            <p><strong>Cramer's V:</strong> 2 שמיים, טבלה גדולה. V = √(χ²/(N·(min(r,c)-1))).</p>
          </InfoBox>
          <InfoBox bg="#fdf2f8" border="#fbcfe8" title="חשוב לזכור" titleColor="#be185d">
            <p>• r² = אחוז שונות מוסברת</p>
            <p>• מתאם ≠ סיבתיות</p>
            <p>• r=0 לא אומר אין קשר (רק אין לינארי)</p>
            <p>• n גדול → קל יותר למצוא מובהקות</p>
          </InfoBox>
        </div>
      )}
      {sub === "signif" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="בדיקת מובהקות מתאם (ρ=0)" titleColor="#2563eb">
            <p><strong>H₀:</strong> ρ = 0 (אין קשר לינארי)</p>
            <p><strong>נוסחה:</strong> t = r·√(n-2) / √(1-r²)</p>
            <p><strong>df = n-2</strong></p>
            <p>משווים |t| לערך קריטי מטבלת t</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="💡 טיפ" titleColor="#047857">
            <p>r קטן עם n גדול יכול להיות מובהק — אבל לא מעשי!</p>
            <p>תמיד בדקו גם r² (כמה שונות מוסברת)</p>
          </InfoBox>
        </div>
      )}
      {sub === "fisher" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#faf5ff" border="#e9d5ff" title="טרנספורמציית פישר" titleColor="#9333ea">
            <p><strong>מטרה:</strong> השוואת 2 מתאמים ממדגמים שונים, או בדיקה מול ρ ≠ 0</p>
            <p><strong>נוסחה:</strong> r' = 0.5 · ln((1+r)/(1-r))</p>
            <p><strong>שגיאת תקן:</strong> σr' = 1/√(n-3)</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="השוואת 2 מתאמים" titleColor="#a16207">
            <p>Z = (r'₁ - r'₂) / √(1/(n₁-3) + 1/(n₂-3))</p>
            <p>|Z| &gt; 1.96 → הבדל מובהק (α=0.05 דו-זנבי)</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="בדיקה מול ρ₀ ≠ 0" titleColor="#047857">
            <p>Z = (r' - ρ₀') / σr'</p>
            <p>ρ₀' = 0.5·ln((1+ρ₀)/(1-ρ₀))</p>
          </InfoBox>
        </div>
      )}
      {sub === "decision" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#f0fdfa" border="#99f6e4" title="🧭 מדריך בחירת מתאם" titleColor="#0d9488">
            <p><strong>2 רציפים + נורמלי + לינארי →</strong> פירסון</p>
            <p><strong>2 רציפים + לא נורמלי →</strong> ספירמן</p>
            <p><strong>סדר × סדר →</strong> ספירמן</p>
            <p><strong>דיכוטומי × רציף →</strong> rpb (= gödel effect של t)</p>
            <p><strong>2 שמיים, 2×2 →</strong> φ</p>
            <p><strong>2 שמיים, גדולה →</strong> Cramer's V</p>
          </InfoBox>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — REGRESSION (enhanced: SS, F-test, Se, assumptions)
// ════════════════════════════════════════════

export function LearnReg() {
  const [sub, setSub] = useState("basics");
  return (
    <div>
      <SubNav items={[["basics", "בסיס"], ["ss", "SS ו-r²"], ["ftest", "F לרגרסיה"], ["assumptions", "הנחות"]]} sub={sub} setSub={setSub} color="#ea580c" />
      {sub === "basics" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#fff7ed" border="#fed7aa" title="משוואת רגרסיה" titleColor="#ea580c">
            <p><strong>Y' = a + bX</strong></p>
            <p>b = r · Sy/Sx (שיפוע — כמה Y משתנה כש-X עולה ב-1)</p>
            <p>a = Ȳ - b·X̄ (חותך — Y' כש-X=0)</p>
            <p><strong>בציוני תקן:</strong> Z'y = r · Zx (אין חותך, שיפוע=r)</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="ניבוי הפוך" titleColor="#a16207">
            <p>X' = ax + bxy · Y</p>
            <p>bxy = r · Sx/Sy (שים לב: bxy ≠ 1/byx!)</p>
          </InfoBox>
        </div>
      )}
      {sub === "ss" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#faf5ff" border="#e9d5ff" title="פירוק שונות — SS" titleColor="#9333ea">
            <p><strong>SStot</strong> = Σ(Yi - Ȳ)² = (n-1)·Sy² — שונות כוללת</p>
            <p><strong>SSreg</strong> = Σ(Y'i - Ȳ)² = r²·SStot — שונות מוסברת</p>
            <p><strong>SSres</strong> = Σ(Yi - Y'i)² = (1-r²)·SStot — שונות שאריות</p>
            <p><strong>SStot = SSreg + SSres</strong></p>
          </InfoBox>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="r² ו-Se" titleColor="#2563eb">
            <p>r² = SSreg / SStot = שונות מוסברת</p>
            <p>Se (שגיאת אמידה) = √(SSres / (n-2))</p>
            <p>Se = Sy · √((1-r²)·(n-1)/(n-2))</p>
            <p>Se קטן → ניבוי מדויק יותר</p>
          </InfoBox>
        </div>
      )}
      {sub === "ftest" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="מבחן F לרגרסיה" titleColor="#047857">
            <p><strong>מטרה:</strong> בדיקה אם הרגרסיה מובהקת (= r ≠ 0)</p>
            <p><strong>F = MSreg / MSres</strong></p>
            <p>MSreg = SSreg / 1 (k=1 מנבא)</p>
            <p>MSres = SSres / (n-2)</p>
            <p><strong>df = (1, n-2)</strong></p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="קשר ל-t" titleColor="#a16207">
            <p>ברגרסיה פשוטה (מנבא אחד): F = t²</p>
            <p>t = r·√(n-2) / √(1-r²) — אותה בדיקה!</p>
          </InfoBox>
        </div>
      )}
      {sub === "assumptions" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#f0fdfa" border="#99f6e4" title="הנחות הרגרסיה" titleColor="#0f766e">
            <p><strong>1. לינאריות:</strong> קשר לינארי בין X ל-Y</p>
            <p><strong>2. נורמליות:</strong> שגיאות מתפלגות נורמלית לכל Xi</p>
            <p><strong>3. ממוצע שגיאות = 0</strong></p>
            <p><strong>4. הומוסקדסטיות:</strong> שונות השגיאות קבועה לכל Xi</p>
            <p><strong>5. אי-תלות:</strong> שגיאות בלתי תלויות זו בזו</p>
          </InfoBox>
          <InfoBox bg="#fef2f2" border="#fecaca" title="מה קורה אם מפרים?" titleColor="#dc2626">
            <p>• אין לינאריות → r לא תקף, ניבוי שגוי</p>
            <p>• הטרוסקדסטיות → SE שגויה, מבחני F/t לא אמינים</p>
            <p>• אי-נורמליות → מבחנים פחות מדויקים (פחות רגישים ל-n גדול)</p>
          </InfoBox>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — POWER & ERRORS (enhanced: Z-test power, relationships)
// ════════════════════════════════════════════

export function LearnPower() {
  const [sub, setSub] = useState("basics");
  return (
    <div>
      <SubNav items={[["basics", "בסיס"], ["zpower", "עוצמה ל-Z"], ["relationships", "קשרים"]]} sub={sub} setSub={setSub} color="#be185d" />
      {sub === "basics" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#fef2f2" border="#fecaca" title="טעויות הסקה" titleColor="#b91c1c">
            <p><strong>טעות סוג I (α):</strong> דחיית H₀ כשהיא נכונה (False Positive)</p>
            <p><strong>טעות סוג II (β):</strong> אי-דחיית H₀ כשהיא שגויה (False Negative)</p>
            <p><strong>עוצמה = 1-β:</strong> P(דחייה כש-H₀ שגויה) = זיהוי אפקט אמיתי</p>
          </InfoBox>
          <InfoBox bg="#faf5ff" border="#e9d5ff" title="טבלת ההחלטות" titleColor="#7c3aed">
            <p>H₀ נכונה + דחה = <strong style={{color:"#dc2626"}}>טעות I (α)</strong></p>
            <p>H₀ נכונה + לא דחה = <strong style={{color:"#16a34a"}}>נכון (1-α)</strong></p>
            <p>H₀ שגויה + דחה = <strong style={{color:"#16a34a"}}>נכון — עוצמה (1-β)</strong></p>
            <p>H₀ שגויה + לא דחה = <strong style={{color:"#dc2626"}}>טעות II (β)</strong></p>
          </InfoBox>
        </div>
      )}
      {sub === "zpower" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="עוצמה למבחן Z (σ ידועה)" titleColor="#2563eb">
            <p><strong>נתון:</strong> H₀: μ=μ₀, H₁: μ=μ₁, σ, n, α</p>
            <p><strong>שלב 1:</strong> מצא Zc (למשל 1.645 חד-ימני)</p>
            <p><strong>שלב 2:</strong> X̄c = μ₀ + Zc·(σ/√n) — הערך הקריטי</p>
            <p><strong>שלב 3:</strong> תקנן תחת H₁:</p>
            <p>Z₁ = (X̄c - μ₁) / (σ/√n)</p>
            <p><strong>שלב 4:</strong> עוצמה = P(Z &gt; Z₁) אם H₁ ימינה</p>
          </InfoBox>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="📝 דוגמה" titleColor="#047857">
            <p>μ₀=100, μ₁=105, σ=15, n=36, α=0.05 חד-ימני</p>
            <p>SE = 15/√36 = 2.5</p>
            <p>X̄c = 100 + 1.645·2.5 = 104.11</p>
            <p>Z₁ = (104.11 - 105) / 2.5 = -0.356</p>
            <p>עוצמה = P(Z &gt; -0.356) = <strong>0.639</strong></p>
          </InfoBox>
        </div>
      )}
      {sub === "relationships" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="מה מגדיל עוצמה?" titleColor="#059669">
            <p>✅ n גדול יותר (הגורם העיקרי!)</p>
            <p>✅ α גדול יותר (0.01→0.05)</p>
            <p>✅ גודל אפקט גדול (|μ₁-μ₀|↑)</p>
            <p>✅ σ קטנה</p>
            <p>✅ מבחן חד-זנבי (אם הכיוון נכון)</p>
          </InfoBox>
          <InfoBox bg="#fffbeb" border="#fde68a" title="קשרים חשובים" titleColor="#a16207">
            <p>• α↓ → β↑ (כש-n קבוע)</p>
            <p>• הדרך היחידה להקטין גם α וגם β = n↑</p>
            <p>• α + β ≠ 1 (זו טעות נפוצה!)</p>
            <p>• n → ∞: עוצמה → 1 (כל הבדל יתגלה)</p>
          </InfoBox>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — TEST SELECTION (FLOWCHART)
// ════════════════════════════════════════════

export function LearnSelect() {
  return (
    <div style={{ lineHeight: 1.9, fontSize: 14 }}>
      <InfoBox bg="#fef2f2" border="#fecaca" title="🔀 הבדלים בין קבוצות" titleColor="#dc2626">
        <p><strong>מדגם בודד vs ערך ידוע:</strong></p>
        <p>&nbsp;&nbsp;σ ידועה → Z | σ לא ידועה → t למדגם בודד</p>
        <p style={{ marginTop: 8 }}><strong>2 קבוצות:</strong></p>
        <p>&nbsp;&nbsp;נורמלי + רווח + תלויים → <strong>t תלויים</strong></p>
        <p>&nbsp;&nbsp;נורמלי + רווח + ב״ת → <strong>t ב״ת</strong> (+ מבחן F קודם!)</p>
        <p>&nbsp;&nbsp;אין נורמליות / סדר + תלויים → <strong>וילקוקסון</strong></p>
        <p>&nbsp;&nbsp;אין נורמליות / סדר + ב״ת → <strong>מאן-וויטני</strong></p>
      </InfoBox>
      <InfoBox bg="#eff6ff" border="#bfdbfe" title="🔗 קשר בין משתנים" titleColor="#2563eb">
        <p>2 רציפים + נורמלי → <strong>פירסון</strong></p>
        <p>סדר / אין נורמליות → <strong>ספירמן</strong></p>
        <p>דיכוטומי × רציף → <strong>rpb</strong></p>
        <p>2 שמיים → <strong>χ² לאי תלות</strong></p>
        <p>&nbsp;&nbsp;גודל אפקט: φ (2×2) או Cramer's V (גדולה)</p>
      </InfoBox>
      <InfoBox bg="#fffbeb" border="#fde68a" title="📊 התפלגויות" titleColor="#a16207">
        <p>משתנה שמי אחד vs תיאוריה → <strong>χ² לטיב התאמה</strong> (3+ קטגוריות) או <strong>בינום</strong> (2 קטגוריות)</p>
      </InfoBox>
      <InfoBox bg="#faf5ff" border="#e9d5ff" title="📐 ניבוי" titleColor="#7c3aed">
        <p>ניבוי Y מתוך X → <strong>רגרסיה לינארית</strong></p>
      </InfoBox>
      <InfoBox bg="#f0fdfa" border="#99f6e4" title="⚡ שונויות" titleColor="#0d9488">
        <p>2 שונויות (σ₁² vs σ₂²) → <strong>מבחן F</strong></p>
        <p>נדרש כשלב מקדים ל-t ב״ת</p>
      </InfoBox>
    </div>
  );
}

// ════════════════════════════════════════════
// LEARN CONTENT — F-TEST (NEW)
// ════════════════════════════════════════════

export function LearnFTest() {
  const [sub, setSub] = useState("basics");
  return (
    <div>
      <SubNav items={[["basics", "בסיס"], ["steps", "שלבי עבודה"], ["connection", "קשר ל-t"]]} sub={sub} setSub={setSub} color="#7c3aed" />
      {sub === "basics" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#faf5ff" border="#e9d5ff" title="מבחן F לשוויון שונויות" titleColor="#7c3aed">
            <p><strong>מטרה:</strong> לבדוק האם σ₁² = σ₂² (2 אוכלוסיות)</p>
            <p><strong>H₀:</strong> σ₁² = σ₂² (שונויות שוות)</p>
            <p><strong>H₁:</strong> σ₁² ≠ σ₂² (שונויות שונות)</p>
          </InfoBox>
          <InfoBox bg="#eff6ff" border="#bfdbfe" title="נוסחה" titleColor="#2563eb">
            <p><strong>F = Ŝmax² / Ŝmin²</strong> (תמיד הגדולה חלקי הקטנה!)</p>
            <p>df₁ = n_max - 1 (מונה = המדגם עם השונות הגדולה)</p>
            <p>df₂ = n_min - 1 (מכנה = המדגם עם השונות הקטנה)</p>
            <p>F ≥ 1 תמיד (כי שמנו גדולה חלקי קטנה)</p>
          </InfoBox>
          <InfoBox bg="#f0fdfa" border="#99f6e4" title="הנחות" titleColor="#0f766e">
            <p>✓ דגימות מקריות ובלתי תלויות</p>
            <p>✓ שתי האוכלוסיות מתפלגות נורמלית</p>
            <p>⚠️ רגיש מאוד לאי-נורמליות!</p>
          </InfoBox>
        </div>
      )}
      {sub === "steps" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#fffbeb" border="#fde68a" title="שלבי עבודה" titleColor="#a16207">
            <p><strong>1.</strong> זהה Ŝmax² ו-Ŝmin² (מיין לפי שונות)</p>
            <p><strong>2.</strong> חשב F = Ŝmax²/Ŝmin²</p>
            <p><strong>3.</strong> df₁ = n_max-1, df₂ = n_min-1</p>
            <p><strong>4.</strong> מצא Fc מטבלת F</p>
            <p><strong>5.</strong> F &gt; Fc → דוחים (שונויות שונות)</p>
          </InfoBox>
          <InfoBox bg="#fdf2f8" border="#fbcfe8" title="⚠️ שימו לב" titleColor="#be185d">
            <p>• המבחן חד-זנבי ימני (כי F ≥ 1 תמיד)</p>
            <p>• בטבלה: α (לא α/2!) כי כבר סידרנו גדולה/קטנה</p>
            <p>• df₁ = של המונה (שונות גדולה), df₂ = של המכנה (שונות קטנה)</p>
          </InfoBox>
        </div>
      )}
      {sub === "connection" && (
        <div style={{ lineHeight: 1.9, fontSize: 14 }}>
          <InfoBox bg="#ecfdf5" border="#a7f3d0" title="F כשלב מקדים ל-t ב״ת" titleColor="#047857">
            <p><strong>F מובהק</strong> (דוחים H₀) → שונויות לא שוות → <strong>Welch t-test</strong></p>
            <p><strong>F לא מובהק</strong> (לא דוחים) → שוויון שונויות → <strong>Pooled t-test</strong></p>
          </InfoBox>
          <InfoBox bg="#fff7ed" border="#fed7aa" title="F בהקשר רגרסיה" titleColor="#ea580c">
            <p>שימו לב: F ברגרסיה ≠ F לשוויון שונויות!</p>
            <p><strong>F ברגרסיה:</strong> MSreg/MSres — בודק אם הרגרסיה מובהקת</p>
            <p><strong>F לשונויות:</strong> Ŝmax²/Ŝmin² — בודק שוויון שונויות</p>
          </InfoBox>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// PRACTICE COMPONENTS
// ════════════════════════════════════════════

// ---- Shared Decision Buttons ----
export function DecisionBtns({ ans, setAns, fb, setFb, reject, color }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setAns(x => ({ ...x, dec: "reject" }))} style={{
          ...navBtn, background: ans.dec === "reject" ? "#fee2e2" : "#fff",
          borderColor: ans.dec === "reject" ? "#ef4444" : "#cbd5e1",
        }}>דוחים H₀</button>
        <button onClick={() => setAns(x => ({ ...x, dec: "keep" }))} style={{
          ...navBtn, background: ans.dec === "keep" ? "#dcfce7" : "#fff",
          borderColor: ans.dec === "keep" ? "#22c55e" : "#cbd5e1",
        }}>לא דוחים H₀</button>
        {ans.dec && fb.dec === undefined && (
          <button onClick={() => setFb(x => ({ ...x, dec: ans.dec === (reject ? "reject" : "keep") }))} style={checkBtn(color)}>בדוק</button>
        )}
      </div>
      {fb.dec !== undefined && (
        <p style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: fb.dec ? "#16a34a" : "#dc2626" }}>
          {fb.dec ? "✓ נכון!" : (reject ? "✗ דוחים H₀" : "✗ לא דוחים H₀")}
        </p>
      )}
    </div>
  );
}

const colors_light = "#eff6ff";

// ---- Chi-Square Practice ----
export function PracticeChi({ color }) {
  const [p, setP] = useState(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [fb, setFb] = useState({});
  const [mode, setMode] = useState(null);

  if (!mode) return (
    <div style={{ textAlign: "center", padding: 30, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      <button onClick={() => { setMode("gof"); setP(genChiGOF()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${color}`, background: color + "10", color, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>χ² לטיב התאמה</button>
      <button onClick={() => { setMode("ind"); setP(genChiInd()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #d97706", background: "#d9770610", color: "#d97706", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>χ² לאי תלות</button>
    </div>
  );

  if (!p) return null;
  const isGOF = mode === "gof";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{isGOF ? "טיב התאמה" : "אי תלות"}</span>
        <button onClick={() => { setMode(null); setP(null); }} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>חדש</button>
      </div>

      <div style={{ background: colors_light, border: "1px solid #bfdbfe", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.8, overflowX: "auto" }}>
        {isGOF ? (
          <>
            <p>n={p.n}, {p.names.length} קטגוריות {p.equalP ? "(הסתברות שווה)" : ""}</p>
            <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 8 }}>
              <thead><tr style={{ background: "#dbeafe" }}><th style={thS}>קטגוריה</th>{p.names.map(c => <th key={c} style={thS}>{c}</th>)}</tr></thead>
              <tbody><tr><td style={tdS}><strong>fo</strong></td>{p.obs.map((o, i) => <td key={i} style={tdS}>{o}</td>)}</tr></tbody>
            </table>
          </>
        ) : (
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr style={{ background: "#fef3c7" }}><th style={thS}></th>{p.cN.map(c => <th key={c} style={thS}>{c}</th>)}<th style={thS}>סה״כ</th></tr></thead>
            <tbody>
              {p.obs.map((row, r) => (
                <tr key={r}><td style={{ ...tdS, fontWeight: 700 }}>{p.rN[r]}</td>{row.map((v, c) => <td key={c} style={tdS}>{v}</td>)}<td style={{ ...tdS, fontWeight: 700 }}>{p.rT[r]}</td></tr>
              ))}
              <tr style={{ background: "#fef9c3" }}><td style={{ ...tdS, fontWeight: 700 }}>סה״כ</td>{p.cT.map((t, c) => <td key={c} style={{ ...tdS, fontWeight: 700 }}>{t}</td>)}<td style={{ ...tdS, fontWeight: 700 }}>{p.N}</td></tr>
            </tbody>
          </table>
        )}
      </div>

      <StepCard title="שלב 1: שכיחויות צפויות (fe)" active={step === 0} done={step > 0} color={color}>
        {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
          isGOF ? (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead><tr style={{ background: "#dbeafe" }}><th style={thS}>קטגוריה</th>{p.names.map(c => <th key={c} style={thS}>{c}</th>)}</tr></thead>
              <tbody><tr><td style={tdS}><strong>fe</strong></td>{p.exp.map((e, i) => <td key={i} style={tdS}>{e.toFixed(2)}</td>)}</tr></tbody>
            </table>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead><tr style={{ background: "#fed7aa" }}><th style={thS}></th>{p.cN.map(c => <th key={c} style={thS}>{c}</th>)}</tr></thead>
              <tbody>{p.exp.map((row, r) => (
                <tr key={r}><td style={{ ...tdS, fontWeight: 700 }}>{p.rN[r]}</td>{row.map((v, c) => <td key={c} style={tdS}>{v.toFixed(2)}</td>)}</tr>
              ))}</tbody>
            </table>
          )
        )}
      </StepCard>

      {step >= 1 && <StepCard title="שלב 2: df וערך קריטי" active={step === 1} done={step > 1} color={color}>
        {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>df = {isGOF ? `k-1 = ${p.df}` : `(r-1)(c-1) = ${p.df}`} &nbsp;|&nbsp; χ²c = {p.tc} (α=0.05)</p>
        )}
      </StepCard>}

      {step >= 2 && <StepCard title="שלב 3: חישוב χ²" active={step === 2} done={step > 2} color={color}>
        {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>χ² = Σ(fo-fe)²/fe = <strong>{p.chi.toFixed(3)}</strong></p>
        )}
      </StepCard>}

      {step >= 3 && <StepCard title="שלב 4: החלטה" active={step === 3} color={color}>
        <p style={{ fontSize: 13, marginBottom: 10 }}>χ² = {p.chi.toFixed(3)} {p.reject ? ">" : "≤"} {p.tc} = χ²c</p>
        <DecisionBtns ans={ans} setAns={setAns} fb={fb} setFb={setFb} reject={p.reject} color={color} />
      </StepCard>}
    </div>
  );
}

// ---- T-Test Practice (enhanced: Cohen's d step) ----
export function PracticeTTest({ color }) {
  const [p, setP] = useState(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [fb, setFb] = useState({});
  const [mode, setMode] = useState(null);

  if (!mode) return (
    <div style={{ textAlign: "center", padding: 30, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
      <button onClick={() => { setMode("s"); setP(genTSingle()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "10px 20px", borderRadius: 10, border: "2px solid #059669", background: "#05966910", color: "#059669", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>מדגם בודד</button>
      <button onClick={() => { setMode("p"); setP(genTPaired()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "10px 20px", borderRadius: 10, border: "2px solid #2563eb", background: "#2563eb10", color: "#2563eb", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>תלויים</button>
      <button onClick={() => { setMode("i"); setP(genTInd()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "10px 20px", borderRadius: 10, border: "2px solid #ea580c", background: "#ea580c10", color: "#ea580c", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>ב״ת</button>
    </div>
  );

  if (!p) return null;
  const labels = { s: "t למדגם בודד", p: "t תלויים", i: "t ב״ת" };
  const lastDecStep = mode === "i" ? 4 : 3;
  const cohenStep = lastDecStep + 1;

  // Compute Cohen's d
  let cohenD = null;
  if (mode === "s") cohenD = Math.abs(p.t) / Math.sqrt(p.n);
  else if (mode === "p") cohenD = Math.abs(p.t) / Math.sqrt(p.n);
  else if (mode === "i") {
    const sp = p.se / Math.sqrt(1/p.n1 + 1/p.n2);
    cohenD = Math.abs(p.x1 - p.x2) / sp;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{labels[mode]}</span>
        <button onClick={() => { setMode(null); setP(null); }} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>חדש</button>
      </div>

      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.8 }}>
        {mode === "s" && <p>n={p.n}, X̄={p.xbar}, Ŝ={p.shat}, μ₀={p.mu0}, α=0.05 ({p.dir === "two" ? "דו-זנבי" : p.dir === "right" ? "חד-ימני" : "חד-שמאלי"})</p>}
        {mode === "p" && <p>n={p.n} זוגות, d̄={p.dbar}, Ŝd={p.sd}, α=0.05 דו-זנבי</p>}
        {mode === "i" && <p>n₁={p.n1}, n₂={p.n2}, X̄₁={p.x1}, X̄₂={p.x2}, Ŝ₁={p.s1}, Ŝ₂={p.s2}, α=0.05</p>}
      </div>

      {mode === "i" && (
        <StepCard title="שלב 0: מבחן F לשוויון שונויות" active={step === 0} done={step > 0} color={color}>
          {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
            <p style={{ fontSize: 13 }}>F = {p.F.toFixed(2)} → {p.eq ? "שוויון שונויות ✓ (pooled)" : "אין שוויון ✗ → Welch"}</p>
          )}
        </StepCard>
      )}

      <StepCard title="שלב 1: SE ו-df" active={mode === "i" ? step === 1 : step === 0} done={mode === "i" ? step > 1 : step > 0} color={color}>
        {(mode === "i" ? step === 1 : step === 0) ? <button onClick={() => setStep(mode === "i" ? 2 : 1)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>SE = {p.se.toFixed(4)} &nbsp;|&nbsp; df = {p.df}</p>
        )}
      </StepCard>

      {(mode === "i" ? step >= 2 : step >= 1) && (
        <StepCard title="שלב 2: חישוב t" active={mode === "i" ? step === 2 : step === 1} done={mode === "i" ? step > 2 : step > 1} color={color}>
          {(mode === "i" ? step === 2 : step === 1) ? <button onClick={() => setStep(mode === "i" ? 3 : 2)} style={revBtn}>הצג</button> : (
            <p style={{ fontSize: 13 }}>t = <strong>{p.t.toFixed(3)}</strong></p>
          )}
        </StepCard>
      )}

      {(mode === "i" ? step >= 3 : step >= 2) && (
        <StepCard title="שלב 3: ערך קריטי" active={mode === "i" ? step === 3 : step === 2} done={mode === "i" ? step > 3 : step > 2} color={color}>
          {(mode === "i" ? step === 3 : step === 2) ? <button onClick={() => setStep(mode === "i" ? 4 : 3)} style={revBtn}>הצג</button> : (
            <p style={{ fontSize: 13 }}>tc ≈ {p.tc} (α=0.05, df={p.df})</p>
          )}
        </StepCard>
      )}

      {(mode === "i" ? step >= 4 : step >= 3) && (
        <StepCard title="שלב 4: החלטה" active={step === lastDecStep} done={step > lastDecStep} color={color}>
          <p style={{ fontSize: 13, marginBottom: 10 }}>|t| = {Math.abs(p.t).toFixed(3)} {p.reject ? ">" : "≤"} {p.tc}</p>
          <DecisionBtns ans={ans} setAns={setAns} fb={fb} setFb={setFb} reject={p.reject} color={color} />
          {fb.dec !== undefined && step === lastDecStep && (
            <button onClick={() => setStep(cohenStep)} style={{ ...revBtn, marginTop: 10 }}>המשך → גודל אפקט</button>
          )}
        </StepCard>
      )}

      {step >= cohenStep && cohenD !== null && (
        <StepCard title="שלב 5: Cohen's d (גודל אפקט)" active={step === cohenStep} color={color}>
          <p style={{ fontSize: 13 }}>d = <strong>{cohenD.toFixed(3)}</strong></p>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            {cohenD < 0.3 ? "אפקט קטן (d < 0.3)" : cohenD < 0.6 ? "אפקט בינוני (0.3 ≤ d < 0.6)" : "אפקט גדול (d ≥ 0.8)"}
          </p>
          {mode === "i" && (
            <p style={{ fontSize: 12, color: "#64748b" }}>rpb = {(cohenD / Math.sqrt(cohenD * cohenD + 4)).toFixed(3)}</p>
          )}
        </StepCard>
      )}
    </div>
  );
}

// ---- Wilcoxon Practice ----
export function PracticeWilcoxon({ color }) {
  const [p, setP] = useState(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [fb, setFb] = useState({});
  const [mode, setMode] = useState(null);

  if (!mode) return (
    <div style={{ textAlign: "center", padding: 30, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      <button onClick={() => { setMode("w"); setP(genWilcoxonPaired()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #0d9488", background: "#0d948810", color: "#0d9488", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>וילקוקסון תלויים</button>
      <button onClick={() => { setMode("m"); setP(genMannWhitney()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #e11d48", background: "#e11d4810", color: "#e11d48", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>מאן-וויטני</button>
    </div>
  );

  if (!p) return null;
  const isW = mode === "w";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{isW ? "וילקוקסון תלויים" : "מאן-וויטני"}</span>
        <button onClick={() => { setMode(null); setP(null); }} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>חדש</button>
      </div>

      <div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.8, overflowX: "auto" }}>
        {isW ? (
          <>
            <p>n={p.n}:</p>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead><tr style={{ background: "#ccfbf1" }}><th style={thS}>נבדק</th>{p.sA.map((_, i) => <th key={i} style={thS}>{i + 1}</th>)}</tr></thead>
              <tbody>
                <tr><td style={{ ...tdS, fontWeight: 700 }}>א</td>{p.sA.map((v, i) => <td key={i} style={tdS}>{v}</td>)}</tr>
                <tr><td style={{ ...tdS, fontWeight: 700 }}>ב</td>{p.sB.map((v, i) => <td key={i} style={tdS}>{v}</td>)}</tr>
              </tbody>
            </table>
          </>
        ) : (
          <>
            <p>A (n={p.nA}): {p.gA.join(", ")}</p>
            <p>B (n={p.nB}): {p.gB.join(", ")}</p>
          </>
        )}
      </div>

      {isW ? (
        <>
          <StepCard title="שלב 1: הפרשים ומחיקת אפסים" active={step === 0} done={step > 0} color={color}>
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead><tr style={{ background: "#e0f2fe" }}><th style={thS}></th>{p.nzPairs.map((_, i) => <th key={i} style={thS}>#{i + 1}</th>)}</tr></thead>
                  <tbody>
                    <tr><td style={tdS}><strong>d</strong></td>{p.nzPairs.map((x, i) => <td key={i} style={tdS}>{x.d}</td>)}</tr>
                    <tr><td style={tdS}><strong>|d|</strong></td>{p.absD.map((v, i) => <td key={i} style={tdS}>{v}</td>)}</tr>
                    <tr><td style={tdS}><strong>דירוג</strong></td>{p.ranks.map((r, i) => <td key={i} style={tdS}>{r}</td>)}</tr>
                    <tr><td style={tdS}><strong>סימן</strong></td>{p.signedR.map((r, i) => <td key={i} style={{ ...tdS, color: r > 0 ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{r > 0 ? "+" : ""}{r}</td>)}</tr>
                  </tbody>
                </table>
                {p.zeroIdx.length > 0 && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>נמחקו {p.zeroIdx.length} אפסים. n={p.effN}</p>}
              </div>
            )}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: T⁺, T⁻, T" active={step === 1} done={step > 1} color={color}>
            {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : (
              <p style={{ fontSize: 13 }}>T⁺={p.Tp}, T⁻={p.Tm}, <strong>T={p.T}</strong></p>
            )}
          </StepCard>}
          {step >= 2 && <StepCard title="שלב 3: Z" active={step === 2} done={step > 2} color={color}>
            {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : (
              <div style={{ fontSize: 13 }}>
                <p>μT={p.muT.toFixed(2)}, σT={p.sigT.toFixed(2)}</p>
                <p>Z = <strong>{p.Z.toFixed(2)}</strong></p>
              </div>
            )}
          </StepCard>}
          {step >= 3 && <StepCard title="שלב 4: החלטה (α=0.05 דו-זנבי)" active={step === 3} color={color}>
            <p style={{ fontSize: 13, marginBottom: 10 }}>|Z|={Math.abs(p.Z).toFixed(2)} {Math.abs(p.Z) > 1.96 ? ">" : "≤"} 1.96</p>
            <DecisionBtns ans={ans} setAns={setAns} fb={fb} setFb={setFb} reject={Math.abs(p.Z) > 1.96} color={color} />
          </StepCard>}
        </>
      ) : (
        <>
          <StepCard title="שלב 1: דירוג משותף" active={step === 0} done={step > 0} color="#e11d48">
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead><tr style={{ background: "#fce7f3" }}><th style={thS}>ערך</th>{p.combined.map((it, i) => <th key={i} style={thS}>{it.val}</th>)}</tr></thead>
                  <tbody>
                    <tr><td style={tdS}><strong>קבוצה</strong></td>{p.combined.map((it, i) => <td key={i} style={{ ...tdS, color: it.group === "A" ? "#2563eb" : "#dc2626", fontWeight: 700 }}>{it.group}</td>)}</tr>
                    <tr><td style={tdS}><strong>דירוג</strong></td>{p.allR.map((r, i) => <td key={i} style={tdS}>{r}</td>)}</tr>
                  </tbody>
                </table>
                <p style={{ fontSize: 12, marginTop: 6 }}>ΣA={p.WA.toFixed(1)} | ΣB={p.WB.toFixed(1)}</p>
              </div>
            )}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: WA" active={step === 1} done={step > 1} color="#e11d48">
            {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : (
              <p style={{ fontSize: 13 }}>WA (קבוצה קטנה, n={p.nS}) = <strong>{p.W.toFixed(1)}</strong></p>
            )}
          </StepCard>}
          {step >= 2 && <StepCard title="שלב 3: Z" active={step === 2} done={step > 2} color="#e11d48">
            {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : (
              <div style={{ fontSize: 13 }}>
                <p>μW={p.muW.toFixed(2)}, σW={p.sigW.toFixed(2)}</p>
                <p>Z = <strong>{p.Z.toFixed(2)}</strong></p>
              </div>
            )}
          </StepCard>}
          {step >= 3 && <StepCard title="שלב 4: החלטה" active={step === 3} color="#e11d48">
            <p style={{ fontSize: 13, marginBottom: 10 }}>|Z|={Math.abs(p.Z).toFixed(2)} {Math.abs(p.Z) > 1.96 ? ">" : "≤"} 1.96</p>
            <DecisionBtns ans={ans} setAns={setAns} fb={fb} setFb={setFb} reject={Math.abs(p.Z) > 1.96} color="#e11d48" />
          </StepCard>}
        </>
      )}
    </div>
  );
}

// ---- Binom Practice (enhanced: normal approximation mode) ----
export function PracticeBinom({ color }) {
  const [p, setP] = useState(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [fb, setFb] = useState({});

  if (!p) return (
    <div style={{ textAlign: "center", padding: 30 }}>
      <button onClick={() => { setP(genBinom()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${color}`, background: color + "10", color, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>צור תרגיל בינום</button>
    </div>
  );

  const dirHeb = p.dir === "greater" ? "חד-ימני (p>p₀)" : p.dir === "less" ? "חד-שמאלי (p<p₀)" : "דו-זנבי (p≠p₀)";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>מבחן בינום</span>
        <button onClick={() => setP(null)} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>חדש</button>
      </div>
      <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.8 }}>
        <p>n={p.n}, p={p.pLabel}, k={p.k} | {dirHeb}</p>
      </div>

      <StepCard title="שלב 1: μ ו-σ" active={step === 0} done={step > 0} color={color}>
        {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>μ=np={p.mu.toFixed(2)} | σ=√(npq)={p.sigma.toFixed(2)}</p>
        )}
      </StepCard>

      {step >= 1 && <StepCard title="שלב 2: קירוב נורמלי?" active={step === 1} done={step > 1} color={color}>
        {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13, color: p.canZ ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
            np={((p.n * p.p)).toFixed(1)} {p.n * p.p >= 5 ? "≥5 ✓" : "<5 ✗"} | nq={((p.n * p.q)).toFixed(1)} {p.n * p.q >= 5 ? "≥5 ✓" : "<5 ✗"}
            → {p.canZ ? "ניתן Z" : "מדויק בלבד"}
          </p>
        )}
      </StepCard>}

      {step >= 2 && <StepCard title="שלב 3: טבלת הסתברויות" active={step === 2} done={step > 2} color={color}>
        {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f3e8ff" }}><th style={thS}>k</th>{p.probTable.map((_, k) => <th key={k} style={{ ...thS, background: k === p.k ? "#e9d5ff" : undefined }}>{k}</th>)}</tr></thead>
              <tbody><tr><td style={tdS}><strong>P</strong></td>{p.probTable.map((pr, k) => <td key={k} style={{ ...tdS, background: k === p.k ? "#e9d5ff" : undefined }}>{pr.toFixed(4)}</td>)}</tr></tbody>
            </table>
          </div>
        )}
      </StepCard>}

      {step >= 3 && <StepCard title="שלב 4: p-value והחלטה" active={step === 3} done={step > 3} color={color}>
        <p style={{ fontSize: 13, marginBottom: 10 }}>
          {p.canZ && p.Z !== null && <>Z = {p.Z.toFixed(2)} | </>}
          p-value = {p.pVal.toFixed(4)} {p.reject ? "<" : "≥"} 0.05
        </p>
        <DecisionBtns ans={ans} setAns={setAns} fb={fb} setFb={setFb} reject={p.reject} color={color} />
        {fb.dec !== undefined && p.canZ && step === 3 && (
          <button onClick={() => setStep(4)} style={{ ...revBtn, marginTop: 10 }}>הצג קירוב נורמלי</button>
        )}
      </StepCard>}

      {step >= 4 && p.canZ && (
        <StepCard title="שלב 5: קירוב נורמלי (Z)" active={step === 4} color={color}>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <p>Z = (k ± 0.5 - np) / √(npq)</p>
            {p.Z !== null && <p>Z = <strong>{p.Z.toFixed(3)}</strong></p>}
            <p style={{ fontSize: 12, color: "#64748b" }}>
              {p.dir === "greater" ? "תיקון: -0.5 (P(X≥k))" : p.dir === "less" ? "תיקון: +0.5 (P(X≤k))" : "שני הזנבות"}
            </p>
          </div>
        </StepCard>
      )}
    </div>
  );
}

// ---- Correlation Practice (enhanced: rpb, φ/V modes) ----
export function PracticeCorr({ color }) {
  const [p, setP] = useState(null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);

  if (!mode) return (
    <div style={{ textAlign: "center", padding: 30, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      <button onClick={() => { setMode("pearson"); setP(genCorrPearson()); setStep(0); }} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${color}`, background: color + "10", color, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>מובהקות פירסון</button>
      <button onClick={() => { setMode("compare"); setP(genCorrCompare()); setStep(0); }} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #ea580c", background: "#ea580c10", color: "#ea580c", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>השוואת מתאמים</button>
      <button onClick={() => { setMode("rpb"); setP(genRpb()); setStep(0); }} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #7c3aed", background: "#7c3aed10", color: "#7c3aed", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>rpb</button>
      <button onClick={() => { setMode("phiv"); setP(genPhiV()); setStep(0); }} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #0d9488", background: "#0d948810", color: "#0d9488", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>φ / Cramer's V</button>
    </div>
  );

  if (!p) return null;

  const modeLabels = { pearson: "מובהקות פירסון", compare: "השוואת מתאמים", rpb: "rpb", phiv: "φ / Cramer's V" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{modeLabels[mode]}</span>
        <button onClick={() => { setMode(null); setP(null); }} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>חדש</button>
      </div>

      {mode === "pearson" && (
        <>
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13 }}>
            <p>n={p.n}, r={p.r}, α=0.05 דו-זנבי</p>
          </div>
          <StepCard title="שלב 1: חשב t" active={step === 0} done={step > 0} color={color}>
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : <p style={{ fontSize: 13 }}>t = r√(n-2)/√(1-r²) = <strong>{p.t.toFixed(3)}</strong>, df={p.df}</p>}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: החלטה" active={step === 1} color={color}>
            <p style={{ fontSize: 14, fontWeight: 700, color: p.reject ? "#dc2626" : "#16a34a" }}>|t|={Math.abs(p.t).toFixed(3)} {p.reject ? ">" : "≤"} {p.tc} → {p.reject ? "מובהק!" : "לא מובהק"}</p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>r² = {(p.r * p.r).toFixed(4)} → {(p.r * p.r * 100).toFixed(1)}% שונות מוסברת</p>
          </StepCard>}
        </>
      )}

      {mode === "compare" && (
        <>
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13 }}>
            <p>n₁={p.n1}, r₁={p.r1} | n₂={p.n2}, r₂={p.r2}</p>
          </div>
          <StepCard title="שלב 1: טרנספורמציית פישר" active={step === 0} done={step > 0} color={color}>
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : <p style={{ fontSize: 13 }}>r'₁={p.rp1.toFixed(3)}, r'₂={p.rp2.toFixed(3)}</p>}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: Z" active={step === 1} done={step > 1} color={color}>
            {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : <p style={{ fontSize: 13 }}>SE={p.se.toFixed(4)}, Z=<strong>{p.Z.toFixed(2)}</strong></p>}
          </StepCard>}
          {step >= 2 && <StepCard title="שלב 3: החלטה" active={step === 2} color={color}>
            <p style={{ fontSize: 14, fontWeight: 700, color: p.reject ? "#dc2626" : "#16a34a" }}>|Z|={Math.abs(p.Z).toFixed(2)} {p.reject ? ">" : "≤"} 1.96 → {p.reject ? "הבדל מובהק!" : "לא מובהק"}</p>
          </StepCard>}
        </>
      )}

      {mode === "rpb" && (
        <>
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13 }}>
            <p>t = {p.t}, df = {p.df}</p>
          </div>
          <StepCard title="שלב 1: חשב rpb" active={step === 0} done={step > 0} color="#7c3aed">
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
              <div style={{ fontSize: 13 }}>
                <p>rpb = √(t² / (t² + df)) = √({(p.t * p.t).toFixed(2)} / {(p.t * p.t + p.df).toFixed(2)})</p>
                <p>rpb = <strong>{p.rpb.toFixed(4)}</strong></p>
              </div>
            )}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: פרשנות" active={step === 1} color="#7c3aed">
            <p style={{ fontSize: 13 }}>rpb² = {(p.rpb * p.rpb).toFixed(4)} → {(p.rpb * p.rpb * 100).toFixed(1)}% שונות מוסברת</p>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {Math.abs(p.rpb) < 0.1 ? "אפקט קטן מאוד" : Math.abs(p.rpb) < 0.3 ? "אפקט קטן-בינוני" : Math.abs(p.rpb) < 0.5 ? "אפקט בינוני" : "אפקט גדול"}
            </p>
          </StepCard>}
        </>
      )}

      {mode === "phiv" && (
        <>
          <div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13 }}>
            <p>χ² = {p.chi}, N = {p.N}, טבלה {p.rows}×{p.cols}</p>
          </div>
          <StepCard title="שלב 1: חשב גודל אפקט" active={step === 0} done={step > 0} color="#0d9488">
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
              <div style={{ fontSize: 13 }}>
                {p.rows === 2 && p.cols === 2 ? (
                  <>
                    <p>φ = √(χ²/N) = √({p.chi}/{p.N}) = <strong>{p.effect.toFixed(4)}</strong></p>
                    <p style={{ fontSize: 12, color: "#64748b" }}>טבלת 2×2 → משתמשים ב-φ</p>
                  </>
                ) : (
                  <>
                    <p>V = √(χ²/(N·(min(r,c)-1))) = √({p.chi}/({p.N}·{Math.min(p.rows, p.cols) - 1}))</p>
                    <p>V = <strong>{p.effect.toFixed(4)}</strong></p>
                    <p style={{ fontSize: 12, color: "#64748b" }}>טבלה {p.rows}×{p.cols} → משתמשים ב-Cramer's V</p>
                  </>
                )}
              </div>
            )}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: פרשנות" active={step === 1} color="#0d9488">
            <p style={{ fontSize: 13 }}>
              {p.effect < 0.1 ? "אפקט חלש" : p.effect < 0.3 ? "אפקט בינוני" : "אפקט חזק"} ({p.effect.toFixed(3)})
            </p>
          </StepCard>}
        </>
      )}
    </div>
  );
}

// ---- Regression Practice (enhanced: full SS mode) ----
export function PracticeReg({ color }) {
  const [p, setP] = useState(null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);

  if (!mode) return (
    <div style={{ textAlign: "center", padding: 30, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      <button onClick={() => { setMode("basic"); setP(genRegression()); setStep(0); }} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${color}`, background: color + "10", color, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>רגרסיה בסיסית</button>
      <button onClick={() => { setMode("full"); setP(genRegFull()); setStep(0); }} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #7c3aed", background: "#7c3aed10", color: "#7c3aed", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>SS + F מלא</button>
    </div>
  );

  if (!p) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{mode === "full" ? "SS + F לרגרסיה" : "רגרסיה לינארית"}</span>
        <button onClick={() => { setMode(null); setP(null); }} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>חדש</button>
      </div>

      {mode === "basic" ? (
        <>
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13 }}>
            <p>n={p.n}, X̄={p.xbar}, Ȳ={p.ybar}, Sx={p.sx}, Sy={p.sy}, r={p.r}</p>
          </div>
          <StepCard title="שלב 1: b (שיפוע)" active={step === 0} done={step > 0} color={color}>
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : <p style={{ fontSize: 13 }}>b = r·Sy/Sx = {p.r}·{p.sy}/{p.sx} = <strong>{p.b.toFixed(3)}</strong></p>}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: a (חותך)" active={step === 1} done={step > 1} color={color}>
            {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : <p style={{ fontSize: 13 }}>a = Ȳ-b·X̄ = {p.ybar}-{p.b.toFixed(3)}·{p.xbar} = <strong>{p.a.toFixed(3)}</strong></p>}
          </StepCard>}
          {step >= 2 && <StepCard title="שלב 3: משוואה" active={step === 2} done={step > 2} color={color}>
            {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : <p style={{ fontSize: 15, fontWeight: 700, color }}>Y' = {p.a.toFixed(2)} + {p.b.toFixed(3)}X</p>}
          </StepCard>}
          {step >= 3 && <StepCard title="שלב 4: r², Sest, ניבוי" active={step === 3} color={color}>
            <div style={{ fontSize: 13 }}>
              <p>r² = {p.r2.toFixed(4)} → {(p.r2 * 100).toFixed(1)}% מהשונות מוסברת</p>
              <p>Sest = {p.sest.toFixed(3)}</p>
              <p style={{ marginTop: 8 }}>עבור X={p.xP}: <strong>Y' = {p.yP.toFixed(2)}</strong></p>
            </div>
          </StepCard>}
        </>
      ) : (
        <>
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13 }}>
            <p>n={p.n}, r={p.r}, Sy={p.sy}</p>
          </div>
          <StepCard title="שלב 1: SStot, SSreg, SSres" active={step === 0} done={step > 0} color="#7c3aed">
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
              <div style={{ fontSize: 13 }}>
                <p>SStot = (n-1)·Sy² = {p.SStot.toFixed(2)}</p>
                <p>SSreg = r²·SStot = {p.SSreg.toFixed(2)}</p>
                <p>SSres = SStot - SSreg = {p.SSres.toFixed(2)}</p>
              </div>
            )}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: MS" active={step === 1} done={step > 1} color="#7c3aed">
            {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : (
              <div style={{ fontSize: 13 }}>
                <p>MSreg = SSreg/1 = {p.MSreg.toFixed(2)}</p>
                <p>MSres = SSres/(n-2) = {p.MSres.toFixed(2)}</p>
              </div>
            )}
          </StepCard>}
          {step >= 2 && <StepCard title="שלב 3: F ו-Se" active={step === 2} done={step > 2} color="#7c3aed">
            {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : (
              <div style={{ fontSize: 13 }}>
                <p>F = MSreg/MSres = <strong>{p.F.toFixed(2)}</strong></p>
                <p>Se = √MSres = <strong>{p.Se.toFixed(3)}</strong></p>
              </div>
            )}
          </StepCard>}
          {step >= 3 && <StepCard title="שלב 4: החלטה" active={step === 3} color="#7c3aed">
            <p style={{ fontSize: 13, marginBottom: 6 }}>F = {p.F.toFixed(2)} {p.reject ? ">" : "≤"} Fc ≈ {p.Fc} (df=1,{p.n - 2}, α=0.05)</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: p.reject ? "#dc2626" : "#16a34a" }}>
              {p.reject ? "הרגרסיה מובהקת!" : "הרגרסיה לא מובהקת"}
            </p>
          </StepCard>}
        </>
      )}
    </div>
  );
}

// ---- CI Practice (enhanced: decision step) ----
export function PracticeCI({ color }) {
  const [p, setP] = useState(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [fb, setFb] = useState({});

  if (!p) return (
    <div style={{ textAlign: "center", padding: 30 }}>
      <button onClick={() => { setP(genCI()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${color}`, background: color + "10", color, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>צור תרגיל רווח סמך</button>
    </div>
  );

  const typeHeb = { single_known: "מדגם בודד (σ ידועה)", single_unknown: "מדגם בודד (σ לא ידועה)", paired: "תלויים", independent: "ב״ת" }[p.type];

  // Determine if μ₀ is in the CI (for decision step)
  let mu0 = null, inCI = null;
  if (p.type === "single_known" || p.type === "single_unknown") {
    mu0 = p.type === "single_known" ? Math.round(p.xbar - rnd(-3, 3)) : Math.round(p.xbar - rnd(-3, 3));
    inCI = mu0 >= p.lo && mu0 <= p.hi;
  } else if (p.type === "paired") {
    mu0 = 0;
    inCI = mu0 >= p.lo && mu0 <= p.hi;
  } else {
    mu0 = 0;
    inCI = mu0 >= p.lo && mu0 <= p.hi;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{typeHeb} | ביטחון {p.conf}%</span>
        <button onClick={() => { setP(null); setAns({}); setFb({}); }} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>חדש</button>
      </div>
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.8 }}>
        {p.type === "single_known" && <p>n={p.n}, X̄={p.xbar}, σ={p.sigma}, α={p.alpha}</p>}
        {p.type === "single_unknown" && <p>n={p.n}, X̄={p.xbar}, Ŝ={p.shat}, α={p.alpha}</p>}
        {p.type === "paired" && <p>n={p.n}, d̄={p.dbar}, Sd={p.sd}, α={p.alpha}</p>}
        {p.type === "independent" && <p>n₁={p.n1}, n₂={p.n2}, X̄₁={p.x1}, X̄₂={p.x2}, S₁={p.s1}, S₂={p.s2}, α={p.alpha}</p>}
      </div>

      <StepCard title="שלב 1: ערך קריטי" active={step === 0} done={step > 0} color={color}>
        {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>{p.type === "single_known" ? `Z(α/2) = ${p.z}` : `t(α/2, df=${p.df}) ≈ ${p.t}`}</p>
        )}
      </StepCard>

      {step >= 1 && <StepCard title="שלב 2: SE" active={step === 1} done={step > 1} color={color}>
        {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>SE = {p.se.toFixed(4)}</p>
        )}
      </StepCard>}

      {step >= 2 && <StepCard title="שלב 3: Margin of Error" active={step === 2} done={step > 2} color={color}>
        {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>margin = {p.margin.toFixed(3)}</p>
        )}
      </StepCard>}

      {step >= 3 && <StepCard title="שלב 4: רווח הסמך" active={step === 3} done={step > 3} color={color}>
        <p style={{ fontSize: 16, fontWeight: 700, color }}>
          [{p.lo.toFixed(2)}, {p.hi.toFixed(2)}]
        </p>
        {step === 3 && (
          <button onClick={() => setStep(4)} style={{ ...revBtn, marginTop: 10 }}>המשך → החלטה</button>
        )}
      </StepCard>}

      {step >= 4 && mu0 !== null && (
        <StepCard title={`שלב 5: האם ${p.type === "paired" || p.type === "independent" ? "0" : "μ₀=" + mu0} בתוך הרווח?`} active={step === 4} color={color}>
          <p style={{ fontSize: 13, marginBottom: 10 }}>
            [{p.lo.toFixed(2)}, {p.hi.toFixed(2)}] — {p.type === "paired" || p.type === "independent" ? "בדיקה: האם 0 ברווח?" : `בדיקה: האם ${mu0} ברווח?`}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: inCI ? "#16a34a" : "#dc2626" }}>
            {inCI ? `${mu0} בתוך הרווח → לא דוחים H₀` : `${mu0} מחוץ לרווח → דוחים H₀`}
          </p>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            (רווח סמך {p.conf}% ↔ מבחן דו-זנבי α={p.alpha})
          </p>
        </StepCard>
      )}
    </div>
  );
}

// ---- Power Practice (enhanced: Z-test power mode) ----
export function PracticePower({ color }) {
  const [p, setP] = useState(null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);

  if (!mode) return (
    <div style={{ textAlign: "center", padding: 30, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
      <button onClick={() => { setMode("binom"); setP(genPower()); setStep(0); }} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${color}`, background: color + "10", color, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>עוצמה — בינום</button>
      <button onClick={() => { setMode("z"); setP(genPowerZ()); setStep(0); }} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #2563eb", background: "#2563eb10", color: "#2563eb", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>עוצמה — Z</button>
    </div>
  );

  if (!p) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{mode === "z" ? "עוצמה — מבחן Z" : "עוצמה — מבחן בינום"}</span>
        <button onClick={() => { setMode(null); setP(null); }} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>חדש</button>
      </div>

      {mode === "binom" ? (
        <>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.8 }}>
            <p>n={p.n}, p₀={p.p0Label}, p₁={p.p1}, α={p.alpha}, {p.dir === "right" ? "חד-ימני" : "חד-שמאלי"}</p>
          </div>
          <StepCard title="שלב 1: פונקציית הסתברות תחת H₀" active={step === 0} done={step > 0} color={color}>
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#fef2f2" }}><th style={thS}>k</th>{p.pH0.map((_, k) => <th key={k} style={thS}>{k}</th>)}</tr></thead>
                  <tbody><tr><td style={tdS}><strong>P(H₀)</strong></td>{p.pH0.map((pr, k) => <td key={k} style={{ ...tdS, background: p.rejR.includes(k) ? "#fecaca" : undefined }}>{pr.toFixed(4)}</td>)}</tr></tbody>
                </table>
              </div>
            )}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: אזור דחייה" active={step === 1} done={step > 1} color={color}>
            {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : (
              <p style={{ fontSize: 13 }}>
                אזור דחייה: k ∈ {"{"}{p.rejR.join(", ")}{"}"} | α בפועל = {p.actAlpha.toFixed(4)}
              </p>
            )}
          </StepCard>}
          {step >= 2 && <StepCard title="שלב 3: פונקציית הסתברות תחת H₁" active={step === 2} done={step > 2} color={color}>
            {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse" }}>
                  <thead><tr style={{ background: "#ecfdf5" }}><th style={thS}>k</th>{p.pH1.map((_, k) => <th key={k} style={thS}>{k}</th>)}</tr></thead>
                  <tbody><tr><td style={tdS}><strong>P(H₁)</strong></td>{p.pH1.map((pr, k) => <td key={k} style={{ ...tdS, background: p.rejR.includes(k) ? "#bbf7d0" : undefined }}>{pr.toFixed(4)}</td>)}</tr></tbody>
                </table>
              </div>
            )}
          </StepCard>}
          {step >= 3 && <StepCard title="שלב 4: עוצמה ו-β" active={step === 3} color={color}>
            <p style={{ fontSize: 13, lineHeight: 1.8 }}>
              עוצמה (1-β) = סכום P(k|p₁) באזור הדחייה = <strong>{p.power.toFixed(4)}</strong>
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.8 }}>
              β = {p.beta.toFixed(4)}
            </p>
          </StepCard>}
        </>
      ) : (
        <>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.8 }}>
            <p>μ₀={p.mu0}, μ₁={p.mu1}, σ={p.sigma}, n={p.n}, α={p.alpha}, {p.dir === "right" ? "חד-ימני" : "חד-שמאלי"}</p>
          </div>
          <StepCard title="שלב 1: SE ו-Zc" active={step === 0} done={step > 0} color="#2563eb">
            {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
              <div style={{ fontSize: 13 }}>
                <p>SE = σ/√n = {p.sigma}/√{p.n} = {p.se.toFixed(3)}</p>
                <p>Zc = {p.zc.toFixed(3)} ({p.dir === "right" ? "חד-ימני" : "חד-שמאלי"})</p>
              </div>
            )}
          </StepCard>
          {step >= 1 && <StepCard title="שלב 2: X̄c (ערך קריטי)" active={step === 1} done={step > 1} color="#2563eb">
            {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : (
              <p style={{ fontSize: 13 }}>X̄c = μ₀ + Zc·SE = {p.mu0} + {p.zc.toFixed(3)}·{p.se.toFixed(3)} = <strong>{p.xbarC.toFixed(3)}</strong></p>
            )}
          </StepCard>}
          {step >= 2 && <StepCard title="שלב 3: Z₁ (תקנון תחת H₁)" active={step === 2} done={step > 2} color="#2563eb">
            {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : (
              <p style={{ fontSize: 13 }}>Z₁ = (X̄c - μ₁)/SE = ({p.xbarC.toFixed(3)} - {p.mu1})/{p.se.toFixed(3)} = <strong>{p.z1.toFixed(3)}</strong></p>
            )}
          </StepCard>}
          {step >= 3 && <StepCard title="שלב 4: עוצמה ו-β" active={step === 3} color="#2563eb">
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <p>עוצמה = P(דחייה | H₁) = <strong>{p.power.toFixed(4)}</strong></p>
              <p>β = {p.beta.toFixed(4)}</p>
            </div>
          </StepCard>}
        </>
      )}
    </div>
  );
}

// ---- Select Test Practice (enhanced: 15 scenarios) ----
export function PracticeSelect({ color }) {
  const scenarios = [
    { desc: "חוקר בודק אם דירוג שביעות רצון (1-7) של לקוחות שונה בין 2 סניפים. התפלגות לא נורמלית.", ans: "מאן-וויטני", explain: "ב״ת + סדר + אין נורמליות = מאן-וויטני", opts: ["t ב״ת", "מאן-וויטני", "t תלויים", "χ² אי תלות"] },
    { desc: "בדיקת ציוני חרדה לפני ואחרי טיפול. 30 נבדקים, התפלגות נורמלית.", ans: "t תלויים", explain: "אותם נבדקים + רווח + נורמלי = t תלויים", opts: ["t ב״ת", "t תלויים", "וילקוקסון תלויים", "מאן-וויטני"] },
    { desc: "האם יש קשר בין מגדר (ז/נ) לבחירת מקצוע (מדעים/רוח/חברה)?", ans: "χ² לאי תלות", explain: "2 משתנים שמיים = χ² לאי תלות", opts: ["χ² לטיב התאמה", "χ² לאי תלות", "פירסון", "בינום"] },
    { desc: "50% מהסטודנטים אמורים לבחור מסלול A. מתוך 80, בחרו 48. בדוק.", ans: "בינום / χ² טיב התאמה", explain: "2 קטגוריות + השוואה להתפלגות ידועה = בינום (או χ² טיב התאמה)", opts: ["t בודד", "בינום / χ² טיב התאמה", "χ² אי תלות", "רגרסיה"] },
    { desc: "ממוצע IQ של מדגם n=36, σ לא ידועה. בודקים אם שונה מ-100.", ans: "t למדגם בודד", explain: "מדגם בודד + σ לא ידועה = t בודד", opts: ["Z", "t למדגם בודד", "t ב״ת", "בינום"] },
    { desc: "קשר בין שעות לימוד (רציף) לציון (רציף). התפלגות נורמלית.", ans: "פירסון", explain: "2 רציפים + נורמלי = פירסון", opts: ["ספירמן", "פירסון", "χ² אי תלות", "rpb"] },
    { desc: "ניבוי משכורת (Y) מתוך שנות ניסיון (X).", ans: "רגרסיה לינארית", explain: "ניבוי Y מ-X = רגרסיה", opts: ["פירסון", "ספירמן", "רגרסיה לינארית", "t ב״ת"] },
    { desc: "דירוג עמיתים (סדר) לפני ואחרי קורס. 12 נבדקים, לא נורמלי.", ans: "וילקוקסון תלויים", explain: "תלויים + סדר + אין נורמליות = וילקוקסון תלויים", opts: ["t תלויים", "וילקוקסון תלויים", "מאן-וויטני", "χ² טיב התאמה"] },
    { desc: "האם התפלגות צבעי מכוניות בחניון מתאימה להתפלגות הארצית? 5 צבעים.", ans: "χ² לטיב התאמה", explain: "משתנה שמי אחד + 3+ קטגוריות + השוואה לתיאוריה = χ² טיב התאמה", opts: ["בינום", "χ² לטיב התאמה", "χ² לאי תלות", "t בודד"] },
    { desc: "קשר בין טיפול בריטלין (כן/לא) לציון מבחן (רציף).", ans: "rpb", explain: "דיכוטומי × רציף = rpb", opts: ["פירסון", "ספירמן", "rpb", "Cramer's V"] },
    { desc: "השוואת שונויות של ציונים בין 2 כיתות. נורמלי.", ans: "מבחן F", explain: "השוואת 2 שונויות + נורמלי = מבחן F לשוויון שונויות", opts: ["t ב״ת", "מבחן F", "χ² טיב התאמה", "מאן-וויטני"] },
    { desc: "קשר בין דירוג סרטים (סדר) לדירוג הנאה (סדר). 20 צופים.", ans: "ספירמן", explain: "2 משתני סדר = ספירמן", opts: ["פירסון", "ספירמן", "rpb", "χ² אי תלות"] },
    { desc: "ממוצע אוכלוסייה ידוע σ=10. מדגם n=49, X̄=52. בודקים אם שונה מ-50.", ans: "Z", explain: "מדגם בודד + σ ידועה = מבחן Z", opts: ["Z", "t למדגם בודד", "t ב״ת", "בינום"] },
    { desc: "האם יש קשר בין סוג תזונה (טבעוני/צמחוני/רגיל) לרמת כולסטרול (תקין/גבוה)?", ans: "χ² לאי תלות + Cramer's V", explain: "2 שמיים (3×2) = χ² אי תלות + Cramer's V כגודל אפקט", opts: ["χ² טיב התאמה", "χ² לאי תלות + Cramer's V", "פירסון", "t ב״ת"] },
    { desc: "מדגם n=50, X̄₁=75 S₁=8 (n₁=25) vs X̄₂=70 S₂=12 (n₂=25). נורמלי. שונויות נראות שונות.", ans: "t ב״ת (Welch)", explain: "ב״ת + נורמלי + שונויות שונות → Welch t (לאחר מבחן F)", opts: ["t ב״ת (Welch)", "t תלויים", "מאן-וויטני", "χ² אי תלות"] },
  ];

  const [idx, setIdx] = useState(() => Math.floor(Math.random() * scenarios.length));
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const s = scenarios[idx];

  const pick = (i) => {
    if (show) return;
    setSel(i); setShow(true); setTotal(t => t + 1);
    if (s.opts[i] === s.ans) setScore(sc => sc + 1);
  };

  const next = () => {
    setSel(null); setShow(false);
    let ni; do { ni = Math.floor(Math.random() * scenarios.length); } while (ni === idx && scenarios.length > 1);
    setIdx(ni);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 13, color: "#64748b" }}>
        <span>בחירת מבחן — תרגול</span>
        <span>ציון: {score}/{total}</span>
      </div>

      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 14, lineHeight: 1.9 }}>
        <p style={{ fontWeight: 700, marginBottom: 6 }}>תרחיש:</p>
        <p>{s.desc}</p>
        <p style={{ fontWeight: 700, marginTop: 10 }}>איזה מבחן מתאים?</p>
      </div>

      {s.opts.map((o, i) => {
        let bg = "#fff", brd = "1px solid #e2e8f0";
        if (show && s.opts[i] === s.ans) { bg = "#dcfce7"; brd = "2px solid #22c55e"; }
        else if (show && i === sel && s.opts[i] !== s.ans) { bg = "#fee2e2"; brd = "2px solid #ef4444"; }
        return (
          <div key={i} onClick={() => pick(i)} style={{
            padding: "12px 16px", marginBottom: 10, borderRadius: 12,
            border: brd, background: bg,
            cursor: show ? "default" : "pointer",
            fontSize: 14, transition: "all 0.15s",
          }}>{o}</div>
        );
      })}

      {show && (
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 14, marginTop: 10, fontSize: 13, color: "#0c4a6e", lineHeight: 1.8 }}>
          {s.explain}
        </div>
      )}

      {show && (
        <button onClick={next} style={{
          marginTop: 14, padding: "10px 28px", borderRadius: 10,
          border: "none", background: color, color: "#fff",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>תרחיש הבא →</button>
      )}
    </div>
  );
}

// ---- F-Test Practice (NEW) ----
export function PracticeFTest({ color }) {
  const [p, setP] = useState(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [fb, setFb] = useState({});

  if (!p) return (
    <div style={{ textAlign: "center", padding: 30 }}>
      <button onClick={() => { setP(genFTest()); setStep(0); setAns({}); setFb({}); }} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${color}`, background: color + "10", color, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>צור תרגיל מבחן F</button>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>מבחן F לשוויון שונויות</span>
        <button onClick={() => { setP(null); setAns({}); setFb({}); }} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>חדש</button>
      </div>

      <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.8 }}>
        <p>n₁={p.n1}, Ŝ₁={p.s1} | n₂={p.n2}, Ŝ₂={p.s2} | α={p.alpha}</p>
      </div>

      <StepCard title="שלב 1: זהה Ŝmax² ו-Ŝmin²" active={step === 0} done={step > 0} color={color}>
        {step === 0 ? <button onClick={() => setStep(1)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>Ŝmax² = {p.sMax}² = {(p.sMax * p.sMax).toFixed(2)} | Ŝmin² = {p.sMin}² = {(p.sMin * p.sMin).toFixed(2)}</p>
        )}
      </StepCard>

      {step >= 1 && <StepCard title="שלב 2: חשב F" active={step === 1} done={step > 1} color={color}>
        {step === 1 ? <button onClick={() => setStep(2)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>F = {(p.sMax * p.sMax).toFixed(2)} / {(p.sMin * p.sMin).toFixed(2)} = <strong>{p.F.toFixed(3)}</strong></p>
        )}
      </StepCard>}

      {step >= 2 && <StepCard title="שלב 3: df וערך קריטי" active={step === 2} done={step > 2} color={color}>
        {step === 2 ? <button onClick={() => setStep(3)} style={revBtn}>הצג</button> : (
          <p style={{ fontSize: 13 }}>df₁={p.df1}, df₂={p.df2} | Fc ≈ {p.Fc} (α={p.alpha})</p>
        )}
      </StepCard>}

      {step >= 3 && <StepCard title="שלב 4: החלטה" active={step === 3} color={color}>
        <p style={{ fontSize: 13, marginBottom: 10 }}>F = {p.F.toFixed(3)} {p.reject ? ">" : "≤"} {p.Fc} = Fc</p>
        <DecisionBtns ans={ans} setAns={setAns} fb={fb} setFb={setFb} reject={p.reject} color={color} />
        {fb.dec !== undefined && (
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
            {p.reject ? "→ שונויות שונות. ב-t ב״ת: השתמשו ב-Welch" : "→ שוויון שונויות. ב-t ב״ת: השתמשו ב-Pooled"}
          </p>
        )}
      </StepCard>}
    </div>
  );
}
