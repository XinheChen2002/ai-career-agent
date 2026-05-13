import { useState } from "react";

// ─── Mock Data (matches schemas.py exactly) ───────────────────────────────────
const MOCK_STATE = {
  user_profile: {
    current_role: "Frontend Developer",
    target_role: "ML Engineer",
    current_skills: ["React", "TypeScript", "CSS", "REST APIs", "Git"],
    background: "3 years building web apps, interested in AI/ML transition",
    time_frame: "12 weeks",
    location: "San Francisco, CA",
  },
  market_profile: {
    target_role: "ML Engineer",
    required_skills: ["Python", "PyTorch", "Scikit-learn", "SQL", "MLflow", "Docker", "Statistics", "Linear Algebra"],
  },
  skill_gap: {
    current_skills: ["React", "TypeScript", "CSS", "REST APIs", "Git"],
    target_skills: ["Python", "PyTorch", "Scikit-learn", "SQL", "MLflow", "Docker", "Statistics", "Linear Algebra"],
    shared_skills: ["Git", "REST APIs"],
    missing_skills: ["Python", "PyTorch", "Scikit-learn", "SQL", "MLflow", "Docker", "Statistics", "Linear Algebra"],
  },
  roadmap: {
    target_role: "ML Engineer",
    time_frame: "12 weeks",
    weekly_plan: [
      "Week 1–2: Python fundamentals & NumPy/Pandas",
      "Week 3–4: Statistics & Linear Algebra refresher",
      "Week 5–6: Scikit-learn & classical ML algorithms",
      "Week 7–8: SQL & data pipelines",
      "Week 9–10: PyTorch deep learning basics",
      "Week 11: MLflow & experiment tracking",
      "Week 12: Docker, deployment & capstone project",
    ],
  },
  final_report:
    "You are well-positioned for this transition. Your REST APIs and Git experience transfer directly. Focus on Python first — it unlocks everything else in the stack. Estimated time to first ML role: 12–16 weeks with consistent daily practice.",
};

// ─── Skill Badge ──────────────────────────────────────────────────────────────
function SkillBadge({ label, type }) {
  const styles = {
    shared: { background: "#e8f5ee", color: "#1a6640", border: "1px solid #a8d9bc" },
    missing: { background: "#fef2ec", color: "#9c3a12", border: "1px solid #f5c4a0" },
    neutral: { background: "#f4f3f0", color: "#4a4945", border: "1px solid #dddbd3" },
    target: { background: "#eef2fb", color: "#2a4a9c", border: "1px solid #b8c8f4" },
  };
  return (
    <span style={{
      ...styles[type || "neutral"],
      fontSize: 12,
      fontFamily: "'DM Mono', monospace",
      padding: "3px 10px",
      borderRadius: 20,
      display: "inline-block",
      margin: "3px 4px 3px 0",
      letterSpacing: "0.01em",
    }}>
      {label}
    </span>
  );
}

// ─── Gap Ring ─────────────────────────────────────────────────────────────────
function GapRing({ shared, missing }) {
  const total = shared.length + missing.length;
  const pct = total === 0 ? 0 : Math.round((shared.length / total) * 100);
  const r = 52, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <svg width={140} height={140} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ede6" strokeWidth={12} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#3d7a5a" strokeWidth={12}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: 26, fontWeight: 700, fill: "#1a1a18", fontFamily: "'Syne', sans-serif" }}>{pct}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 11, fill: "#8a8880", fontFamily: "sans-serif" }}>ready</text>
      </svg>
      <div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4, fontFamily: "sans-serif" }}>ALREADY HAVE</div>
          {shared.map(s => <SkillBadge key={s} label={s} type="shared" />)}
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4, fontFamily: "sans-serif" }}>NEED TO LEARN</div>
          {missing.slice(0, 4).map(s => <SkillBadge key={s} label={s} type="missing" />)}
          {missing.length > 4 && <SkillBadge label={`+${missing.length - 4} more`} type="neutral" />}
        </div>
      </div>
    </div>
  );
}

// ─── Roadmap Timeline ─────────────────────────────────────────────────────────
function RoadmapTimeline({ weekly_plan, time_frame }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {weekly_plan.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer",
            background: i === active ? "#1a1a18" : i < active ? "#3d7a5a" : "#e8e6df",
            color: i === active ? "#fff" : i < active ? "#fff" : "#8a8880",
            fontSize: 12, fontWeight: 600, fontFamily: "'Syne', sans-serif",
            transition: "all 0.2s",
          }}>{i + 1}</button>
        ))}
      </div>
      <div style={{
        background: "#f9f8f4",
        border: "1px solid #e8e6df",
        borderRadius: 10,
        padding: "14px 18px",
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        color: "#2c2c2a",
        lineHeight: 1.6,
      }}>
        {weekly_plan[active]}
      </div>
      <div style={{ fontSize: 11, color: "#aaa9a2", marginTop: 8, fontFamily: "sans-serif" }}>
        {time_frame} total · click weeks to explore
      </div>
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ profile }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
      {[
        ["Current role", profile.current_role],
        ["Target role", profile.target_role],
        ["Location", profile.location || "—"],
        ["Timeline", profile.time_frame],
      ].map(([label, value]) => (
        <div key={label} style={{ paddingBottom: 8, borderBottom: "1px solid #f0ede6" }}>
          <div style={{ fontSize: 10, color: "#aaa9a2", fontFamily: "sans-serif", marginBottom: 2 }}>{label.toUpperCase()}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", fontFamily: "'Syne', sans-serif" }}>{value}</div>
        </div>
      ))}
      <div style={{ gridColumn: "1 / -1", paddingBottom: 8 }}>
        <div style={{ fontSize: 10, color: "#aaa9a2", fontFamily: "sans-serif", marginBottom: 6 }}>CURRENT SKILLS</div>
        <div>{profile.current_skills.map(s => <SkillBadge key={s} label={s} type="neutral" />)}</div>
      </div>
      {profile.background && (
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 10, color: "#aaa9a2", fontFamily: "sans-serif", marginBottom: 4 }}>BACKGROUND</div>
          <div style={{ fontSize: 13, color: "#5a5955", lineHeight: 1.6, fontFamily: "sans-serif" }}>{profile.background}</div>
        </div>
      )}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function Card({ title, tag, children, accent }) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${accent ? accent + "44" : "#e8e6df"}`,
      borderTop: accent ? `3px solid ${accent}` : "1px solid #e8e6df",
      borderRadius: 12,
      padding: "20px 22px",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", fontFamily: "'Syne', sans-serif" }}>{title}</span>
        {tag && <span style={{ fontSize: 10, background: "#f4f3f0", color: "#8a8880", padding: "2px 8px", borderRadius: 20, fontFamily: "sans-serif" }}>{tag}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Input Form ───────────────────────────────────────────────────────────────
function ProfileForm({ onSubmit }) {
  const [form, setForm] = useState({
    current_role: "", target_role: "", background: "",
    time_frame: "12 weeks", location: "", current_skills: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1px solid #e8e6df",
    borderRadius: 8, fontSize: 13, fontFamily: "sans-serif",
    background: "#fafaf7", color: "#1a1a18", outline: "none",
    boxSizing: "border-box",
  };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {[["Current role", "current_role", "e.g. Frontend Developer"],
          ["Target role", "target_role", "e.g. ML Engineer"],
          ["Location", "location", "e.g. San Francisco"],
          ["Timeline", "time_frame", "e.g. 12 weeks"]].map(([label, key, ph]) => (
          <div key={key}>
            <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4, fontFamily: "sans-serif" }}>{label.toUpperCase()}</div>
            <input style={inputStyle} placeholder={ph} value={form[key]} onChange={e => set(key, e.target.value)} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4, fontFamily: "sans-serif" }}>CURRENT SKILLS (comma separated)</div>
        <input style={inputStyle} placeholder="React, TypeScript, Git..." value={form.current_skills} onChange={e => set("current_skills", e.target.value)} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4, fontFamily: "sans-serif" }}>BACKGROUND</div>
        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} placeholder="Brief background about your experience..." value={form.background} onChange={e => set("background", e.target.value)} />
      </div>
      <button onClick={() => onSubmit(form)} style={{
        background: "#1a1a18", color: "#fff", border: "none", borderRadius: 8,
        padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer",
        fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em",
      }}>
        Analyze Career Path →
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CareerAgentDashboard() {
  const [tab, setTab] = useState("profile");
  const [state] = useState(MOCK_STATE);
  const [showForm, setShowForm] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "gap", label: "Skill Gap" },
    { id: "roadmap", label: "Roadmap" },
    { id: "report", label: "Report" },
  ];

  return (
    <div style={{
      fontFamily: "sans-serif",
      background: "#f7f6f1",
      minHeight: "100vh",
      padding: "0 0 40px",
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "#1a1a18",
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}>
            AI Career Agent
          </div>
          <div style={{ fontSize: 11, color: "#8a8880", marginTop: 2, fontFamily: "sans-serif" }}>
            {state.user_profile.current_role} → {state.user_profile.target_role}
          </div>
        </div>
        <button onClick={() => setShowForm(f => !f)} style={{
          background: "transparent", border: "1px solid #3a3a38", color: "#c8c6be",
          borderRadius: 8, padding: "7px 16px", fontSize: 12, cursor: "pointer",
          fontFamily: "'Syne', sans-serif",
        }}>
          {showForm ? "← Back" : "New Analysis"}
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 0" }}>
        {showForm ? (
          <Card title="New Career Profile" accent="#3d7a5a">
            <ProfileForm onSubmit={() => setShowForm(false)} />
          </Card>
        ) : (
          <>
            {/* Tab bar */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#eeece6", borderRadius: 10, padding: 4 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  flex: 1, padding: "8px 0", border: "none", borderRadius: 7, cursor: "pointer",
                  background: tab === t.id ? "#fff" : "transparent",
                  color: tab === t.id ? "#1a1a18" : "#8a8880",
                  fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                  fontFamily: "'Syne', sans-serif",
                  boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {tab === "profile" && (
              <Card title="Career Profile" tag="UserProfile" accent="#5a7ab8">
                <ProfileCard profile={state.user_profile} />
              </Card>
            )}

            {/* Skill Gap Tab */}
            {tab === "gap" && (
              <>
                <Card title="Skill Gap Analysis" tag="SkillGapResult" accent="#c06830">
                  <GapRing shared={state.skill_gap.shared_skills} missing={state.skill_gap.missing_skills} />
                </Card>
                <Card title="Market Requirements" tag="MarketSkillProfile">
                  <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 8, fontFamily: "sans-serif" }}>
                    REQUIRED FOR {state.market_profile.target_role.toUpperCase()}
                  </div>
                  {state.market_profile.required_skills.map(s => {
                    const has = state.skill_gap.shared_skills.includes(s);
                    return <SkillBadge key={s} label={s} type={has ? "shared" : "target"} />;
                  })}
                </Card>
              </>
            )}

            {/* Roadmap Tab */}
            {tab === "roadmap" && (
              <Card title="Learning Roadmap" tag="RoadmapResult" accent="#3d7a5a">
                <RoadmapTimeline weekly_plan={state.roadmap.weekly_plan} time_frame={state.roadmap.time_frame} />
              </Card>
            )}

            {/* Report Tab */}
            {tab === "report" && (
              <Card title="Final Report" tag="CareerState" accent="#1a1a18">
                <div style={{
                  background: "#f9f8f4",
                  borderLeft: "3px solid #1a1a18",
                  padding: "14px 18px",
                  borderRadius: "0 8px 8px 0",
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: "#2c2c2a",
                  fontFamily: "sans-serif",
                }}>
                  {state.final_report}
                </div>
                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    ["Skills matched", `${state.skill_gap.shared_skills.length}/${state.skill_gap.target_skills.length}`],
                    ["Skills to learn", state.skill_gap.missing_skills.length],
                    ["Weeks planned", state.roadmap.weekly_plan.length],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: "#f4f3f0", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a18", fontFamily: "'Syne', sans-serif" }}>{val}</div>
                      <div style={{ fontSize: 11, color: "#8a8880", marginTop: 2, fontFamily: "sans-serif" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
