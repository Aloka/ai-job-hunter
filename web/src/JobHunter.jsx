import { useState, useRef, useEffect } from "react";

const SECTOR_COLORS = {
  "International Development (UN/USAID/IFC)": "#00FF88",
  "Corporate Innovation & Consulting": "#FF6B35",
  "Tech Startups / VC": "#00D4FF",
  "Government / Economic Development": "#C77DFF",
  "Finance & Investment": "#FFD700",
  "Healthcare & Social Impact": "#FF69B4",
  "Education & EdTech": "#87CEEB",
  "Climate & Sustainability": "#98FB98",
};

const getColor = (sector) => {
  for (const [key, val] of Object.entries(SECTOR_COLORS)) {
    if (sector?.toLowerCase().includes(key.split(" ")[0].toLowerCase())) return val;
  }
  return "#00D4FF";
};

const LoadingDots = () => {
  const [d, setD] = useState(0);
  useEffect(() => { const t = setInterval(() => setD(x => (x + 1) % 4), 400); return () => clearInterval(t); }, []);
  return <span style={{ color: "#00D4FF", letterSpacing: "2px" }}>{"●".repeat(d)}{"○".repeat(3 - d)}</span>;
};

const JobCard = ({ job, index, profile }) => {
  const [open, setOpen] = useState(false);
  const color = getColor(job.sector);
  const score = job.match_score || job.matchScore || 0;
  const scoreColor = score >= 88 ? "#00C853" : score >= 78 ? "#FF6B35" : "#888";

  return (
    <div onClick={() => setOpen(o => !o)} style={{
      background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)`,
      borderLeft: `3px solid ${color}`, borderRadius: "8px", padding: "18px 22px",
      marginBottom: "10px", cursor: "pointer", transition: "all 0.2s",
      animation: `fadeIn 0.4s ease ${index * 0.07}s both`
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", background: `${color}22`, color, padding: "3px 8px", borderRadius: "3px", fontFamily: "monospace", letterSpacing: "1px" }}>
              {job.sector}
            </span>
            {(job.remote || job.location?.toLowerCase().includes("remote")) && (
              <span style={{ fontSize: "10px", background: "rgba(0,255,136,0.1)", color: "#00FF88", padding: "3px 8px", borderRadius: "3px", fontFamily: "monospace" }}>REMOTE</span>
            )}
            {job.contract && (
              <span style={{ fontSize: "10px", background: "rgba(255,107,53,0.1)", color: "#FF6B35", padding: "3px 8px", borderRadius: "3px", fontFamily: "monospace" }}>CONTRACT</span>
            )}
          </div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#f0f0f0", marginBottom: "3px" }}>{job.title}</div>
          <div style={{ fontSize: "12px", color: "#777", fontFamily: "monospace" }}>
            {job.organization} · {job.location}{job.salary ? ` · ${job.salary}` : ""}
          </div>
        </div>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: `${scoreColor}22`, border: `2px solid ${scoreColor}55`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: "800", color: scoreColor, lineHeight: 1, fontFamily: "monospace" }}>{score}</div>
          <div style={{ fontSize: "8px", color: "#666" }}>FIT</div>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
          <p style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.7", marginBottom: "12px" }}>{job.summary}</p>
          {job.why_fit && (
            <div style={{ background: `${color}0d`, border: `1px solid ${color}22`, borderRadius: "6px", padding: "12px 14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", color, fontFamily: "monospace", letterSpacing: "1px", marginBottom: "5px" }}>WHY THIS FITS {profile.name?.split(" ")[0]?.toUpperCase()}</div>
              <p style={{ fontSize: "13px", color: "#ccc", margin: 0, lineHeight: "1.6" }}>{job.why_fit}</p>
            </div>
          )}
          {job.nationality_risk && (
            <div style={{ fontSize: "11px", marginBottom: "14px", color: job.nationality_risk === "low" ? "#00C853" : job.nationality_risk === "medium" ? "#FF9800" : "#f44336" }}>
              ● Visa/nationality barrier: {job.nationality_risk?.toUpperCase()}
            </div>
          )}
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ display: "inline-block", background: color, color: "#000", padding: "8px 20px", borderRadius: "4px", textDecoration: "none", fontSize: "12px", fontWeight: "700", fontFamily: "monospace", letterSpacing: "1px" }}>
              VIEW JOB →
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default function JobHunter({ profile, onReset }) {
  const [phase, setPhase] = useState("idle");
  const [jobs, setJobs] = useState([]);
  const [log, setLog] = useState([]);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState("All");
  const logRef = useRef(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const addLog = (msg, type = "info") => setLog(l => [...l, { msg, type, time: new Date().toLocaleTimeString() }]);

  const buildPrompt = (q) => `You are a job search agent. Find REAL currently advertised jobs (posted last 60 days).

CANDIDATE:
Name: ${profile.name}
Title: ${profile.title || "Senior Professional"}
Summary: ${profile.summary}
Experience: ${profile.experience || "See summary"}
Skills: ${profile.skills || "See summary"}
Target: $${profile.salaryMin}–$${profile.salaryMax} USD/year
Open to: ${profile.arrangements?.join(", ")}
Sectors: ${profile.sectors?.join(", ")}

SEARCH: ${q.query}

Rules:
- Only REAL, currently advertised jobs
- Include actual URL to job posting
- Flag nationality_risk (low/medium/high) for non-US/EU citizens
- Score match_score 70-95 based on candidate fit

Return ONLY a valid JSON array, no other text:
[{"title":"","organization":"","location":"","sector":"${q.sector || q.label}","salary":"","summary":"","why_fit":"Specific reason this fits ${profile.name}'s background","nationality_risk":"low/medium/high","url":"","remote":true,"contract":false,"match_score":85}]

If fewer than 2 real jobs found, return: []`;

  const runSearch = async () => {
    setPhase("searching"); setJobs([]); setLog([]); setProgress(0);
    addLog("Initializing job discovery agent...", "system");
    addLog(`Profile: ${profile.name} · ${profile.sectors?.length} sectors`, "system");

    const queries = profile.searchQueries?.filter(q => q.query) || [];
    const allJobs = [];

    for (let i = 0; i < queries.length; i++) {
      const q = queries[i];
      addLog(`[${i + 1}/${queries.length}] Searching: ${q.label}...`, "search");

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": profile.apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{ role: "user", content: buildPrompt(q) }]
          })
        });

        const data = await res.json();
        if (data.error) { addLog(`✗ ${data.error.message}`, "error"); continue; }

        const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
        const match = text.match(/\[[\s\S]*\]/);
        let found = [];
        if (match) { try { found = JSON.parse(match[0]); } catch { } }

        found = found.filter(j => j.title && j.organization);
        allJobs.push(...found);
        setJobs([...allJobs]);
        addLog(`✓ ${found.length} jobs found for: ${q.label}`, "success");
      } catch (e) {
        addLog(`✗ Error: ${e.message}`, "error");
      }

      setProgress(Math.round(((i + 1) / queries.length) * 100));
      await new Promise(r => setTimeout(r, 600));
    }

    addLog(`─────────────────────────────`, "system");
    addLog(`Complete. ${allJobs.length} opportunities found.`, "system");
    setPhase("done");
  };

  const filtered = filter === "All" ? jobs : jobs.filter(j => j.sector === filter || j.sector?.includes(filter.split(" ")[0]));
  const sectors = ["All", ...new Set(jobs.map(j => j.sector).filter(Boolean))];
  const highFit = jobs.filter(j => (j.match_score || j.matchScore || 0) >= 88).length;

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#eee", fontFamily: "'Sora','Helvetica Neue',sans-serif", padding: "32px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", color: "#00D4FF", letterSpacing: "3px", marginBottom: "8px", animation: "pulse 3s infinite" }}>● AI JOB HUNTER · AGENT ACTIVE</div>
            <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: "700", background: "linear-gradient(135deg,#fff,#888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {profile.name}'s Job Hunter
            </h1>
          </div>
          <button onClick={onReset} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#666", padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontFamily: "'Space Mono',monospace" }}>
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        {jobs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "24px" }}>
            {[["Total Found", jobs.length, "#fff"], ["High Fit (88+)", highFit, "#00C853"], ["Top Score", Math.max(...jobs.map(j => j.match_score || 0)), "#FF6B35"]].map(([l, v, c]) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "26px", fontWeight: "800", color: c, fontFamily: "'Space Mono',monospace" }}>{v}</div>
                <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search button */}
        {phase === "idle" && (
          <div style={{ marginBottom: "28px" }}>
            <button onClick={runSearch} style={{ background: "linear-gradient(135deg,#00D4FF,#00FF88)", color: "#000", border: "none", padding: "16px 40px", borderRadius: "6px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'Space Mono',monospace", letterSpacing: "1px", boxShadow: "0 0 30px rgba(0,212,255,0.25)" }}>
              ⟶ LAUNCH SEARCH AGENT
            </button>
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#555", fontFamily: "'Space Mono',monospace" }}>
              {profile.searchQueries?.filter(q => q.query).length} search queries · ~${(profile.searchQueries?.filter(q => q.query).length * 0.02).toFixed(2)} API cost
            </div>
          </div>
        )}

        {/* Progress */}
        {phase === "searching" && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#888" }}>Searching... <LoadingDots /></span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#00D4FF" }}>{progress}%</span>
            </div>
            <div style={{ height: "2px", background: "#1a1a2e", borderRadius: "1px" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00D4FF,#00FF88)", transition: "width 0.5s", boxShadow: "0 0 8px #00D4FF" }} />
            </div>
          </div>
        )}

        {/* Re-run button */}
        {phase === "done" && (
          <button onClick={runSearch} style={{ background: "transparent", border: "1px solid #00D4FF44", color: "#00D4FF", padding: "8px 20px", borderRadius: "4px", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: "11px", marginBottom: "20px" }}>
            ↻ Re-run Search
          </button>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div ref={logRef} style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "14px", marginBottom: "24px", maxHeight: phase === "done" ? "100px" : "180px", overflowY: "auto", transition: "max-height 0.5s" }}>
            {log.map((l, i) => (
              <div key={i} style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", color: l.type === "success" ? "#00FF88" : l.type === "error" ? "#f44336" : l.type === "search" ? "#00D4FF" : "#555", marginBottom: "3px" }}>
                <span style={{ color: "#333", marginRight: "8px" }}>{l.time}</span>{l.msg}
              </div>
            ))}
          </div>
        )}

        {/* Sector filters */}
        {jobs.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
            {sectors.map(s => {
              const c = s === "All" ? "#00D4FF" : getColor(s);
              const active = filter === s;
              return (
                <button key={s} onClick={() => setFilter(s)} style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", letterSpacing: "1px", padding: "5px 12px", borderRadius: "3px", border: `1px solid ${active ? c : "rgba(255,255,255,0.1)"}`, background: active ? `${c}22` : "transparent", color: active ? c : "#666", cursor: "pointer" }}>
                  {s} ({s === "All" ? jobs.length : jobs.filter(j => j.sector === s || j.sector?.includes(s.split(" ")[0])).length})
                </button>
              );
            })}
          </div>
        )}

        {/* Job cards */}
        {filtered.length > 0 && (
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "14px" }}>
              ─── {filtered.length} ROLES · SORTED BY FIT ───
            </div>
            {[...filtered].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).map((job, i) => (
              <JobCard key={`${job.title}-${i}`} job={job} index={i} profile={profile} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "60px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", color: "#2a2a2a" }}>AI JOB HUNTER · OPEN SOURCE</span>
          <a href="https://github.com/YOUR_USERNAME/ai-job-hunter" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", color: "#2a2a2a", textDecoration: "none" }}>⭐ GITHUB</a>
        </div>
      </div>
    </div>
  );
}
