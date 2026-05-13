import { useEffect, useMemo, useState } from "react";

/**
 * CareerAgentDashboard.jsx
 *
 * This version is aligned with:
 * - schemas.py: UserProfile, MarketSkillProfile, SkillGapResult, RoadmapResult, CareerState
 * - pipeline.py: CareerRecommendationPipeline.run() return shape
 *
 * Expected backend endpoint, if you use FastAPI:
 * POST http://localhost:8000/recommend
 *
 * Expected request body:
 * {
 *   current_job: string,
 *   target_job: string,
 *   user_background?: string,
 *   current_skills?: string[],
 *   time_frame?: string,
 *   location?: string
 * }
 *
 * Expected response body can be either:
 * 1) raw pipeline.py output:
 *    { status, input, normalized_input, graph_summary, available_jobs, recommendation_mode, message, result }
 * 2) CareerState-like output:
 *    { raw_profile, user_profile, market_profile, skill_gap, roadmap, final_report }
 */

const API_BASE_URL = "https://ai-career-agent-backend-ft74.onrender.com";
const RECOMMEND_ENDPOINT = `${API_BASE_URL}/recommend`;
const JOBS_ENDPOINT = `${API_BASE_URL}/jobs`;

const EMPTY_STATE = {
  raw_profile: {},
  user_profile: {
    current_role: "",
    target_role: "",
    current_skills: [],
    background: "",
    time_frame: "12 weeks",
    location: "",
  },
  market_profile: {
    target_role: "",
    required_skills: [],
  },
  skill_gap: {
    current_skills: [],
    target_skills: [],
    shared_skills: [],
    missing_skills: [],
  },
  roadmap: {
    target_role: "",
    time_frame: "12 weeks",
    weekly_plan: [],
  },
  final_report: "",
  pipeline_meta: {
    status: "idle",
    message: "",
    recommendation_mode: "",
    transition_distance: null,
    transition_path: [],
    graph_summary: null,
    available_jobs: [],
  },
};

const DEMO_STATE = {
  ...EMPTY_STATE,
  raw_profile: {
    current_job: "data analyst",
    target_job: "ai engineer",
    user_background: "Beginner interested in AI career transition.",
  },
  user_profile: {
    current_role: "data analyst",
    target_role: "ai engineer",
    current_skills: ["excel", "sql", "statistics"],
    background: "Beginner interested in AI career transition.",
    time_frame: "12 weeks",
    location: "",
  },
  market_profile: {
    target_role: "ai engineer",
    required_skills: ["python", "machine learning", "deep learning", "sql", "docker"],
  },
  skill_gap: {
    current_skills: ["excel", "sql", "statistics"],
    target_skills: ["python", "machine learning", "deep learning", "sql", "docker"],
    shared_skills: ["sql"],
    missing_skills: ["python", "machine learning", "deep learning", "docker"],
  },
  roadmap: {
    target_role: "ai engineer",
    time_frame: "12 weeks",
    weekly_plan: [
      "Step 1 · python: Build practical understanding of python. Learn the core concepts, then complete a mini project.",
      "Step 2 · machine learning: Build practical understanding of machine learning. Learn the core concepts, then complete a mini project.",
      "Step 3 · deep learning: Build practical understanding of deep learning. Learn the core concepts, then complete a mini project.",
      "Step 4 · docker: Build practical understanding of docker. Learn the core concepts, then complete a mini project.",
    ],
  },
  final_report:
    "Both roles were found in the graph. The system calculated a transition path and identified missing skills by comparing current-job skills with target-job skills.",
  pipeline_meta: {
    status: "demo",
    message: "Demo data is shown until your backend returns a real pipeline result.",
    recommendation_mode: "job_to_job",
    transition_distance: 2,
    transition_path: [
      { type: "job", name: "data analyst" },
      { type: "skill", name: "python" },
      { type: "job", name: "ai engineer" },
    ],
    graph_summary: null,
    available_jobs: [],
  },
};

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value instanceof Set) return Array.from(value).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "") ?? "";
}

function roadmapToWeeklyPlan(roadmap) {
  if (!roadmap) return [];

  if (Array.isArray(roadmap)) {
    return roadmap.map((item, index) => {
      if (typeof item === "string") return item;

      const step = firstDefined(item.step, index + 1);
      const skill = firstDefined(item.skill, "Skill");
      const goal = firstDefined(item.learning_goal, "Build practical understanding.");
      const action = firstDefined(item.suggested_action, "Complete a small exercise or mini project.");

      return `Step ${step} · ${skill}: ${goal} ${action}`;
    });
  }

  if (Array.isArray(roadmap.weekly_plan)) {
    return roadmap.weekly_plan;
  }

  return [];
}

function normalizeApiResponse(apiData, submittedForm = {}) {
  // Case 1: backend already returns CareerState-like data.
  if (apiData?.user_profile || apiData?.skill_gap || apiData?.roadmap || apiData?.final_report) {
    return {
      ...EMPTY_STATE,
      ...apiData,
      raw_profile: apiData.raw_profile ?? submittedForm,
      user_profile: {
        ...EMPTY_STATE.user_profile,
        ...apiData.user_profile,
        current_role: firstDefined(apiData.user_profile?.current_role, submittedForm.current_role),
        target_role: firstDefined(apiData.user_profile?.target_role, submittedForm.target_role),
        current_skills: toArray(firstDefined(apiData.user_profile?.current_skills, submittedForm.current_skills)),
        background: firstDefined(apiData.user_profile?.background, submittedForm.background),
        time_frame: firstDefined(apiData.user_profile?.time_frame, submittedForm.time_frame, "12 weeks"),
        location: firstDefined(apiData.user_profile?.location, submittedForm.location),
      },
      market_profile: {
        target_role: firstDefined(apiData.market_profile?.target_role, submittedForm.target_role),
        required_skills: toArray(apiData.market_profile?.required_skills),
      },
      skill_gap: {
        current_skills: toArray(apiData.skill_gap?.current_skills),
        target_skills: toArray(apiData.skill_gap?.target_skills),
        shared_skills: toArray(apiData.skill_gap?.shared_skills),
        missing_skills: toArray(apiData.skill_gap?.missing_skills),
      },
      roadmap: {
        target_role: firstDefined(apiData.roadmap?.target_role, submittedForm.target_role),
        time_frame: firstDefined(apiData.roadmap?.time_frame, submittedForm.time_frame, "12 weeks"),
        weekly_plan: roadmapToWeeklyPlan(apiData.roadmap),
      },
      pipeline_meta: {
        ...EMPTY_STATE.pipeline_meta,
        status: firstDefined(apiData.status, "success"),
        message: firstDefined(apiData.message),
      },
    };
  }

  // Case 2: backend returns raw pipeline.py output.
  const result = apiData?.result ?? {};
  const skills = result.skills ?? {};
  const input = apiData?.input ?? {};

  const currentRole = firstDefined(input.current_job, submittedForm.current_role);
  const targetRole = firstDefined(input.target_job, submittedForm.target_role);
  const background = firstDefined(input.user_background, submittedForm.background);
  const timeFrame = firstDefined(submittedForm.time_frame, "12 weeks");
  const location = firstDefined(submittedForm.location);

  const currentSkillsFromForm = toArray(submittedForm.current_skills);
  const currentSkillsFromPipeline = toArray(skills.current);
  const currentSkills = currentSkillsFromPipeline.length ? currentSkillsFromPipeline : currentSkillsFromForm;
  const targetSkills = toArray(skills.target);
  const sharedSkills = toArray(skills.shared);
  const missingSkills = toArray(skills.missing);

  return {
    ...EMPTY_STATE,
    raw_profile: {
      current_job: currentRole,
      target_job: targetRole,
      user_background: background,
      current_skills: currentSkillsFromForm,
      time_frame: timeFrame,
      location,
    },
    user_profile: {
      current_role: currentRole,
      target_role: targetRole,
      current_skills: currentSkills,
      background,
      time_frame: timeFrame,
      location,
    },
    market_profile: {
      target_role: targetRole,
      required_skills: targetSkills,
    },
    skill_gap: {
      current_skills: currentSkills,
      target_skills: targetSkills,
      shared_skills: sharedSkills,
      missing_skills: missingSkills,
    },
    roadmap: {
      target_role: targetRole,
      time_frame: timeFrame,
      weekly_plan: roadmapToWeeklyPlan(result.roadmap),
    },
    final_report: firstDefined(result.explanation, apiData.message),
    pipeline_meta: {
      status: firstDefined(apiData.status, "success"),
      message: firstDefined(apiData.message),
      recommendation_mode: firstDefined(apiData.recommendation_mode),
      transition_distance: result.transition_distance ?? null,
      transition_path: toArray(result.transition_path),
      graph_summary: apiData.graph_summary ?? null,
      available_jobs: toArray(apiData.available_jobs),
    },
  };
}

function buildRequestBody(form) {
  const currentSkills = toArray(form.current_skills);

  return {
    // These names align with pipeline.py run_pipeline(...)
    current_job: form.current_role.trim(),
    target_job: form.target_role.trim(),
    user_background: form.background.trim(),

    // These extra fields align with schemas.py UserProfile.
    // The current pipeline may ignore them, but keeping them here makes future backend expansion easier.
    current_skills: currentSkills,
    time_frame: form.time_frame.trim() || "12 weeks",
    location: form.location.trim(),
  };
}

function SkillBadge({ label, type = "neutral" }) {
  const styles = {
    shared: { background: "#e8f5ee", color: "#1a6640", border: "1px solid #a8d9bc" },
    missing: { background: "#fef2ec", color: "#9c3a12", border: "1px solid #f5c4a0" },
    neutral: { background: "#f4f3f0", color: "#4a4945", border: "1px solid #dddbd3" },
    target: { background: "#eef2fb", color: "#2a4a9c", border: "1px solid #b8c8f4" },
    job: { background: "#f3eefb", color: "#5b3b91", border: "1px solid #d6c2f2" },
    skill: { background: "#eef8f7", color: "#17706a", border: "1px solid #b7ddda" },
  };

  return (
    <span
      style={{
        ...styles[type],
        fontSize: 12,
        fontFamily: "'DM Mono', monospace",
        padding: "3px 10px",
        borderRadius: 20,
        display: "inline-block",
        margin: "3px 4px 3px 0",
        letterSpacing: "0.01em",
      }}
    >
      {label}
    </span>
  );
}

function EmptyHint({ text }) {
  return (
    <div
      style={{
        fontSize: 13,
        color: "#8a8880",
        background: "#f9f8f4",
        border: "1px dashed #dddbd3",
        borderRadius: 8,
        padding: "12px 14px",
        lineHeight: 1.6,
      }}
    >
      {text}
    </div>
  );
}

function GapRing({ shared = [], missing = [] }) {
  const total = shared.length + missing.length;
  const pct = total === 0 ? 0 : Math.round((shared.length / total) * 100);
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
      <svg width={140} height={140} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ede6" strokeWidth={12} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#3d7a5a"
          strokeWidth={12}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          style={{ fontSize: 26, fontWeight: 700, fill: "#1a1a18", fontFamily: "'Syne', sans-serif" }}
        >
          {pct}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 11, fill: "#8a8880" }}>
          ready
        </text>
      </svg>

      <div style={{ minWidth: 260, flex: 1 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4 }}>ALREADY HAVE</div>
          {shared.length ? shared.map((s) => <SkillBadge key={s} label={s} type="shared" />) : <EmptyHint text="No shared skills returned yet." />}
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4 }}>NEED TO LEARN</div>
          {missing.length ? missing.map((s) => <SkillBadge key={s} label={s} type="missing" />) : <EmptyHint text="No missing skills returned yet." />}
        </div>
      </div>
    </div>
  );
}

function RoadmapTimeline({ weeklyPlan = [], timeFrame = "12 weeks" }) {
  const [active, setActive] = useState(0);

  if (!weeklyPlan.length) {
    return <EmptyHint text="No roadmap returned yet. Run an analysis first, or check whether your backend returns result.roadmap." />;
  }

  const safeActive = Math.min(active, weeklyPlan.length - 1);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {weeklyPlan.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: i === safeActive ? "#1a1a18" : i < safeActive ? "#3d7a5a" : "#e8e6df",
              color: i === safeActive || i < safeActive ? "#fff" : "#8a8880",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div
        style={{
          background: "#f9f8f4",
          border: "1px solid #e8e6df",
          borderRadius: 10,
          padding: "14px 18px",
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          color: "#2c2c2a",
          lineHeight: 1.6,
        }}
      >
        {weeklyPlan[safeActive]}
      </div>
      <div style={{ fontSize: 11, color: "#aaa9a2", marginTop: 8 }}>{timeFrame} total · click steps to explore</div>
    </div>
  );
}

function TransitionPath({ path = [] }) {
  if (!path.length) {
    return <EmptyHint text="No transition path returned. This can happen when the current job is not in the graph or no path is found." />;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      {path.map((item, index) => (
        <span key={`${item.type}-${item.name}-${index}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <SkillBadge label={item.name} type={item.type === "job" ? "job" : item.type === "skill" ? "skill" : "neutral"} />
          {index < path.length - 1 && <span style={{ color: "#aaa9a2" }}>→</span>}
        </span>
      ))}
    </div>
  );
}

function ProfileCard({ profile }) {
  const currentSkills = toArray(profile.current_skills);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
      {[
        ["Current role", profile.current_role || "Unknown / beginner"],
        ["Target role", profile.target_role || "—"],
        ["Location", profile.location || "—"],
        ["Timeline", profile.time_frame || "12 weeks"],
      ].map(([label, value]) => (
        <div key={label} style={{ paddingBottom: 8, borderBottom: "1px solid #f0ede6" }}>
          <div style={{ fontSize: 10, color: "#aaa9a2", marginBottom: 2 }}>{label.toUpperCase()}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", fontFamily: "'Syne', sans-serif" }}>{value}</div>
        </div>
      ))}

      <div style={{ gridColumn: "1 / -1", paddingBottom: 8 }}>
        <div style={{ fontSize: 10, color: "#aaa9a2", marginBottom: 6 }}>CURRENT SKILLS</div>
        {currentSkills.length ? currentSkills.map((s) => <SkillBadge key={s} label={s} type="neutral" />) : <EmptyHint text="No current skills entered or returned." />}
      </div>

      {profile.background && (
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontSize: 10, color: "#aaa9a2", marginBottom: 4 }}>BACKGROUND</div>
          <div style={{ fontSize: 13, color: "#5a5955", lineHeight: 1.6 }}>{profile.background}</div>
        </div>
      )}
    </div>
  );
}

function Card({ title, tag, children, accent }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${accent ? `${accent}44` : "#e8e6df"}`,
        borderTop: accent ? `3px solid ${accent}` : "1px solid #e8e6df",
        borderRadius: 12,
        padding: "20px 22px",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a18", fontFamily: "'Syne', sans-serif" }}>{title}</span>
        {tag && <span style={{ fontSize: 10, background: "#f4f3f0", color: "#8a8880", padding: "2px 8px", borderRadius: 20 }}>{tag}</span>}
      </div>
      {children}
    </div>
  );
}

function StatusBanner({ status, message, error }) {
  if (!message && !error && status !== "loading") return null;

  const isError = Boolean(error);
  const text = error || (status === "loading" ? "Running pipeline analysis..." : message);

  return (
    <div
      style={{
        marginBottom: 16,
        padding: "10px 14px",
        borderRadius: 10,
        border: isError ? "1px solid #f0b5a8" : "1px solid #d9d6ca",
        background: isError ? "#fff3f1" : "#fbfaf6",
        color: isError ? "#9c3a12" : "#4a4945",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

function ProfileForm({ onSubmit, loading, availableJobs = [], jobsLoading = false }) {
  const [form, setForm] = useState({
    current_role: "",
    target_role: "",
    background: "",
    time_frame: "12 weeks",
    location: "",
    current_skills: "",
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e8e6df",
    borderRadius: 8,
    fontSize: 13,
    background: "#fafaf7",
    color: "#1a1a18",
    outline: "none",
    boxSizing: "border-box",
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4 }}>CURRENT ROLE</div>
          <select
            style={inputStyle}
            value={form.current_role}
            onChange={(e) => set("current_role", e.target.value)}
            disabled={jobsLoading}
          >
            <option value="">Not listed / beginner</option>
            {availableJobs.map((job) => (
              <option key={`current-${job}`} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4 }}>TARGET ROLE</div>
          <select
            style={inputStyle}
            value={form.target_role}
            onChange={(e) => set("target_role", e.target.value)}
            disabled={jobsLoading || !availableJobs.length}
            required
          >
            <option value="">{jobsLoading ? "Loading jobs..." : "Select target role"}</option>
            {availableJobs.map((job) => (
              <option key={`target-${job}`} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>

        {[
          ["Location", "location", "e.g. Ann Arbor"],
          ["Timeline", "time_frame", "e.g. 12 weeks"],
        ].map(([label, key, placeholder]) => (
          <div key={key}>
            <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4 }}>{label.toUpperCase()}</div>
            <input style={inputStyle} placeholder={placeholder} value={form[key]} onChange={(e) => set(key, e.target.value)} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "#aaa9a2", margin: "-4px 0 12px" }}>
        Current role can be left as beginner. Target role is selected from the backend job graph.
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4 }}>CURRENT SKILLS, OPTIONAL, COMMA SEPARATED</div>
        <input style={inputStyle} placeholder="python, sql, excel..." value={form.current_skills} onChange={(e) => set("current_skills", e.target.value)} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 4 }}>BACKGROUND</div>
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
          placeholder="Brief background about your experience..."
          value={form.background}
          onChange={(e) => set("background", e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !form.target_role.trim()}
        style={{
          background: loading || !form.target_role.trim() ? "#9b9990" : "#1a1a18",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading || !form.target_role.trim() ? "not-allowed" : "pointer",
          fontFamily: "'Syne', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Career Path →"}
      </button>
    </form>
  );
}

export default function CareerAgentDashboard() {
  const [tab, setTab] = useState("profile");
  const [state, setState] = useState(DEMO_STATE);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "gap", label: "Skill Gap" },
    { id: "path", label: "Path" },
    { id: "roadmap", label: "Roadmap" },
    { id: "report", label: "Report" },
  ];

  useEffect(() => {
    let ignore = false;

    async function loadJobs() {
      setJobsLoading(true);

      try {
        const response = await fetch(JOBS_ENDPOINT);

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status} while loading jobs.`);
        }

        const data = await response.json();
        const jobs = toArray(data.jobs ?? data.available_jobs ?? data.result ?? data);

        if (!ignore) {
          setAvailableJobs(jobs);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load available jobs from backend.");
        }
      } finally {
        if (!ignore) {
          setJobsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      ignore = true;
    };
  }, []);

  const headerText = useMemo(() => {
    const current = state.user_profile.current_role || "Unknown";
    const target = state.user_profile.target_role || "Target role";
    return `${current} → ${target}`;
  }, [state.user_profile.current_role, state.user_profile.target_role]);

  async function handleSubmit(form) {
    setLoading(true);
    setError("");

    try {
      const requestBody = buildRequestBody(form);
      const response = await fetch(RECOMMEND_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}. Check backend/main.py endpoint and CORS settings.`);
      }

      const apiData = await response.json();
      const normalizedState = normalizeApiResponse(apiData, form);

      setState(normalizedState);
      if (normalizedState.pipeline_meta.available_jobs.length) {
        setAvailableJobs(normalizedState.pipeline_meta.available_jobs);
      }
      setShowForm(false);
      setTab("gap");
    } catch (err) {
      setError(err.message || "Failed to call backend API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f7f6f1", minHeight: "100vh", padding: "0 0 40px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div
        style={{
          background: "#1a1a18",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.01em" }}>AI Career Agent</div>
          <div style={{ fontSize: 11, color: "#8a8880", marginTop: 2 }}>{headerText}</div>
        </div>

        <button
          onClick={() => {
            setShowForm((value) => !value);
            setError("");
          }}
          style={{
            background: "transparent",
            border: "1px solid #3a3a38",
            color: "#c8c6be",
            borderRadius: 8,
            padding: "7px 16px",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {showForm ? "← Back" : "New Analysis"}
        </button>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 0" }}>
        <StatusBanner status={loading ? "loading" : state.pipeline_meta.status} message={state.pipeline_meta.message} error={error} />

        {showForm ? (
          <Card title="New Career Profile" tag="UserProfile → pipeline.run()" accent="#3d7a5a">
            <ProfileForm onSubmit={handleSubmit} loading={loading} availableJobs={availableJobs} jobsLoading={jobsLoading} />
          </Card>
        ) : (
          <>
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#eeece6", borderRadius: 10, padding: 4 }}>
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    border: "none",
                    borderRadius: 7,
                    cursor: "pointer",
                    background: tab === item.id ? "#fff" : "transparent",
                    color: tab === item.id ? "#1a1a18" : "#8a8880",
                    fontSize: 13,
                    fontWeight: tab === item.id ? 600 : 400,
                    fontFamily: "'Syne', sans-serif",
                    boxShadow: tab === item.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "profile" && (
              <Card title="Career Profile" tag="UserProfile" accent="#5a7ab8">
                <ProfileCard profile={state.user_profile} />
              </Card>
            )}

            {tab === "gap" && (
              <>
                <Card title="Skill Gap Analysis" tag="SkillGapResult" accent="#c06830">
                  <GapRing shared={state.skill_gap.shared_skills} missing={state.skill_gap.missing_skills} />
                </Card>

                <Card title="Market Requirements" tag="MarketSkillProfile">
                  <div style={{ fontSize: 11, color: "#8a8880", marginBottom: 8 }}>REQUIRED FOR {state.market_profile.target_role?.toUpperCase() || "TARGET ROLE"}</div>
                  {state.market_profile.required_skills.length ? (
                    state.market_profile.required_skills.map((skill) => {
                      const has = state.skill_gap.shared_skills.includes(skill);
                      const missing = state.skill_gap.missing_skills.includes(skill);
                      return <SkillBadge key={skill} label={skill} type={has ? "shared" : missing ? "missing" : "target"} />;
                    })
                  ) : (
                    <EmptyHint text="No target skills returned. Check result.skills.target in your backend response." />
                  )}
                </Card>
              </>
            )}

            {tab === "path" && (
              <>
                <Card title="Transition Path" tag="pipeline.result.transition_path" accent="#6c5a9c">
                  <TransitionPath path={state.pipeline_meta.transition_path} />
                </Card>

                <Card title="Pipeline Metadata" tag="pipeline.py">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {[
                      ["Status", state.pipeline_meta.status || "—"],
                      ["Mode", state.pipeline_meta.recommendation_mode || "—"],
                      ["Distance", state.pipeline_meta.transition_distance ?? "—"],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: "#f4f3f0", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a18", fontFamily: "'Syne', sans-serif" }}>{value}</div>
                        <div style={{ fontSize: 11, color: "#8a8880", marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {tab === "roadmap" && (
              <Card title="Learning Roadmap" tag="RoadmapResult" accent="#3d7a5a">
                <RoadmapTimeline weeklyPlan={state.roadmap.weekly_plan} timeFrame={state.roadmap.time_frame} />
              </Card>
            )}

            {tab === "report" && (
              <Card title="Final Report" tag="CareerState.final_report" accent="#1a1a18">
                <div
                  style={{
                    background: "#f9f8f4",
                    borderLeft: "3px solid #1a1a18",
                    padding: "14px 18px",
                    borderRadius: "0 8px 8px 0",
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: "#2c2c2a",
                  }}
                >
                  {state.final_report || "No final report returned yet."}
                </div>

                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    ["Skills matched", `${state.skill_gap.shared_skills.length}/${state.skill_gap.target_skills.length}`],
                    ["Skills to learn", state.skill_gap.missing_skills.length],
                    ["Steps planned", state.roadmap.weekly_plan.length],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: "#f4f3f0", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a18", fontFamily: "'Syne', sans-serif" }}>{value}</div>
                      <div style={{ fontSize: 11, color: "#8a8880", marginTop: 2 }}>{label}</div>
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
