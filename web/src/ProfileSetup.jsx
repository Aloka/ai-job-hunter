import { useState } from "react";

const SUGGESTED_SECTORS = [
  "International Development (UN/USAID/IFC)",
  "Corporate Innovation & Consulting",
  "Tech Startups / VC",
  "Government / Economic Development",
  "Finance & Investment",
  "Healthcare & Social Impact",
  "Education & EdTech",
  "Climate & Sustainability",
  "Legal & Compliance",
  "Marketing & Growth",
  "Product Management",
  "Data & AI",
  "Real Estate & PropTech",
  "Manufacturing & Supply Chain",
  "Media & Communications",
];

const ARRANGEMENTS = ["Fully Remote", "Willing to Relocate", "Hybrid", "Contract / Freelance"];

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#ccc", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
      {label}
    </label>
    {hint && <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>{hint}</div>}
    {children}
  </div>
);

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "6px", padding: "10px 14px", color: "#eee", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

export default function ProfileSetup({ onSave }) {
  const [step, setStep] = useState(1);
  const [customSector, setCustomSector] = useState("");
  const [form, setForm] = useState({
    apiKey: "", name: "", title: "", email: "", linkedin: "",
    summary: "", experience: "", skills: "",
    salaryMin: "", salaryMax: "",
    sectors: [], arrangements: [],
    searchQueries: []
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleSector = (v) => setForm(f => ({
    ...f,
    sectors: f.sectors.includes(v) ? f.sectors.filter(x => x !== v) : [...f.sectors, v]
  }));

  const addCustomSector = () => {
    const val = customSector.trim();
    if (val && !form.sectors.includes(val)) {
      setForm(f => ({ ...f, sectors: [...f.sectors, val] }));
    }
    setCustomSector("");
  };

  const toggleArr = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  }));

  // Auto-generate search queries from selected sectors when reaching step 4
  const generateDefaultQueries = () => {
    if (form.searchQueries.length > 0) return; // don't overwrite if already set
    const generated = form.sectors.slice(0, 4).map(sector => ({
      label: sector.split("(")[0].trim(),
      query: `${form.title || "senior professional"} ${sector.split("(")[0].trim().toLowerCase()} remote job 2025`,
      sector: sector
    }));
    set("searchQueries", generated);
  };

  const steps = ["API Key", "Your Profile", "Job Preferences", "Search Queries"];

  const canProceed = () => {
    if (step === 1) return form.apiKey.startsWith("sk-ant-");
    if (step === 2) return form.name && form.summary;
    if (step === 3) return form.sectors.length > 0 && form.arrangements.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step === 3) generateDefaultQueries();
    setStep(s => s + 1);
  };

  const CheckBtn = ({ value, active, onClick, color = "#00D4FF" }) => (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: "5px",
      border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
      background: active ? `${color}22` : "transparent",
      color: active ? color : "#888",
      fontSize: "12px", cursor: "pointer", marginRight: "8px", marginBottom: "8px", transition: "all 0.15s"
    }}>{value}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#eee", fontFamily: "'Sora', 'Helvetica Neue', sans-serif", padding: "40px 20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        input, textarea { color-scheme: dark; }
        input:focus, textarea:focus { border-color: #00D4FF !important; outline: none; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: "620px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#00D4FF", letterSpacing: "3px", marginBottom: "12px" }}>
            ● AI JOB HUNTER
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 8px", background: "linear-gradient(135deg,#fff,#888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Set Up Your Profile
          </h1>
          <p style={{ color: "#555", fontSize: "13px" }}>Your details stay in your browser — never stored on any server.</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: "3px", borderRadius: "2px", marginBottom: "6px", background: i + 1 <= step ? "#00D4FF" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
              <div style={{ fontSize: "10px", color: i + 1 === step ? "#00D4FF" : "#444", fontFamily: "'Space Mono', monospace" }}>{s}</div>
            </div>
          ))}
        </div>

        {/* ── Step 1: API Key ── */}
        {step === 1 && (
          <div>
            <Field label="Anthropic API Key" hint="Get yours at console.anthropic.com — costs ~$0.15 per search run">
              <input type="password" value={form.apiKey} onChange={e => set("apiKey", e.target.value)}
                placeholder="sk-ant-..." style={inputStyle} />
            </Field>
            {form.apiKey && !form.apiKey.startsWith("sk-ant-") && (
              <div style={{ color: "#FF6B35", fontSize: "12px", marginTop: "-12px", marginBottom: "12px" }}>
                ⚠ Key should start with sk-ant-
              </div>
            )}
            <div style={{ background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "8px", padding: "14px 16px", fontSize: "13px", color: "#777", lineHeight: "1.6" }}>
              🔒 Your API key is used directly from your browser. It is never sent to or stored on any server.
            </div>
          </div>
        )}

        {/* ── Step 2: Profile ── */}
        {step === 2 && (
          <div>
            <Field label="Full Name *">
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Jane Smith" style={inputStyle} />
            </Field>
            <Field label="Professional Title">
              <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Senior Product Manager" style={inputStyle} />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" style={inputStyle} />
            </Field>
            <Field label="LinkedIn URL">
              <input value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/yourname" style={inputStyle} />
            </Field>
            <Field label="Professional Summary *" hint="3–5 sentences: who you are, what you do, what makes you distinctive">
              <textarea value={form.summary} onChange={e => set("summary", e.target.value)}
                placeholder="e.g. Senior innovation professional with 12 years experience building products and advising corporations across Southeast Asia..."
                rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <Field label="Key Experience" hint="Your most relevant roles — bullet points are fine">
              <textarea value={form.experience} onChange={e => set("experience", e.target.value)}
                placeholder={"- Head of Product at XYZ (2020–2024)\n- Startup Ecosystem Lead at ABC (2017–2020)"}
                rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <Field label="Key Skills" hint="Comma separated">
              <input value={form.skills} onChange={e => set("skills", e.target.value)}
                placeholder="Product strategy, Team leadership, Agile, Stakeholder management..." style={inputStyle} />
            </Field>
          </div>
        )}

        {/* ── Step 3: Preferences ── */}
        {step === 3 && (
          <div>
            <Field label="Target Salary (USD / year)">
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input type="number" value={form.salaryMin} onChange={e => set("salaryMin", e.target.value)}
                  placeholder="Min e.g. 80000" style={{ ...inputStyle, flex: 1 }} />
                <span style={{ color: "#444", flexShrink: 0 }}>to</span>
                <input type="number" value={form.salaryMax} onChange={e => set("salaryMax", e.target.value)}
                  placeholder="Max e.g. 120000" style={{ ...inputStyle, flex: 1 }} />
              </div>
            </Field>

            <Field label="Work Arrangement *">
              <div>
                {ARRANGEMENTS.map(a => (
                  <CheckBtn key={a} value={a} active={form.arrangements.includes(a)} color="#00FF88"
                    onClick={() => toggleArr("arrangements", a)} />
                ))}
              </div>
            </Field>

            <Field label="Target Sectors *" hint="Pick from the list or type your own">
              {/* Selected sectors */}
              {form.sectors.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  {form.sectors.map(s => (
                    <button key={s} onClick={() => toggleSector(s)} style={{
                      padding: "8px 14px", borderRadius: "5px", border: "1px solid #00D4FF",
                      background: "rgba(0,212,255,0.15)", color: "#00D4FF",
                      fontSize: "12px", cursor: "pointer", marginRight: "8px", marginBottom: "8px"
                    }}>
                      {s} ✕
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions (not yet selected) */}
              <div style={{ marginBottom: "12px" }}>
                {SUGGESTED_SECTORS.filter(s => !form.sectors.includes(s)).map(s => (
                  <CheckBtn key={s} value={s} active={false} onClick={() => toggleSector(s)} />
                ))}
              </div>

              {/* Custom sector input */}
              <div style={{ display: "flex", gap: "8px" }}>
                <input value={customSector} onChange={e => setCustomSector(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCustomSector()}
                  placeholder="Type your own sector and press Add..."
                  style={{ ...inputStyle, flex: 1, fontSize: "13px" }} />
                <button onClick={addCustomSector} style={{
                  background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)",
                  color: "#00D4FF", padding: "10px 16px", borderRadius: "6px", cursor: "pointer",
                  fontSize: "13px", whiteSpace: "nowrap"
                }}>+ Add</button>
              </div>
            </Field>
          </div>
        )}

        {/* ── Step 4: Search Queries ── */}
        {step === 4 && (
          <div>
            <Field label="Search Queries"
              hint="These are what the AI searches for. We've generated some from your sectors — edit, remove, or add your own.">
              {form.searchQueries.map((q, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "14px", marginBottom: "10px" }}>
                  <input value={q.label} onChange={e => {
                    const qs = [...form.searchQueries]; qs[i] = { ...qs[i], label: e.target.value }; set("searchQueries", qs);
                  }} placeholder="Label e.g. Product Manager Roles" style={{ ...inputStyle, marginBottom: "8px", fontSize: "13px" }} />
                  <input value={q.query} onChange={e => {
                    const qs = [...form.searchQueries]; qs[i] = { ...qs[i], query: e.target.value }; set("searchQueries", qs);
                  }} placeholder="Search query e.g. senior product manager remote job 2025" style={{ ...inputStyle, fontSize: "13px" }} />
                  <button onClick={() => set("searchQueries", form.searchQueries.filter((_, j) => j !== i))}
                    style={{ marginTop: "8px", background: "none", border: "none", color: "#555", fontSize: "12px", cursor: "pointer" }}>
                    ✕ Remove
                  </button>
                </div>
              ))}
              <button onClick={() => set("searchQueries", [...form.searchQueries, { label: "", query: "", sector: "" }])}
                style={{ background: "transparent", border: "1px dashed rgba(255,255,255,0.15)", color: "#666", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", width: "100%", marginTop: "4px" }}>
                + Add another search query
              </button>
            </Field>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
          {step > 1
            ? <button onClick={() => setStep(s => s - 1)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#777", padding: "12px 28px", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>← Back</button>
            : <div />
          }
          {step < 4
            ? <button onClick={handleNext} disabled={!canProceed()} style={{
                background: canProceed() ? "linear-gradient(135deg,#00D4FF,#00FF88)" : "rgba(255,255,255,0.07)",
                color: canProceed() ? "#000" : "#444", padding: "12px 32px", borderRadius: "6px",
                border: "none", cursor: canProceed() ? "pointer" : "not-allowed", fontSize: "14px", fontWeight: "700"
              }}>
                Continue →
              </button>
            : <button onClick={() => onSave(form)} disabled={form.searchQueries.filter(q => q.query).length === 0}
                style={{
                  background: form.searchQueries.filter(q => q.query).length > 0 ? "linear-gradient(135deg,#00D4FF,#00FF88)" : "rgba(255,255,255,0.07)",
                  color: form.searchQueries.filter(q => q.query).length > 0 ? "#000" : "#444",
                  padding: "12px 32px", borderRadius: "6px", border: "none",
                  cursor: form.searchQueries.filter(q => q.query).length > 0 ? "pointer" : "not-allowed",
                  fontSize: "14px", fontWeight: "700"
                }}>
                Launch Job Hunter 🚀
              </button>
          }
        </div>

      </div>
    </div>
  );
}
