import { useState } from "react";

const SECTORS = [
  "International Development (UN/USAID/IFC)",
  "Corporate Innovation & Consulting",
  "Tech Startups / VC",
  "Government / Economic Development",
  "Finance & Investment",
  "Healthcare & Social Impact",
  "Education & EdTech",
  "Climate & Sustainability",
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
  const [form, setForm] = useState({
    apiKey: "", name: "", title: "", email: "", linkedin: "",
    summary: "", experience: "", skills: "",
    salaryMin: "90000", salaryMax: "130000",
    sectors: [], arrangements: [],
    searchQueries: [
      { label: "Innovation Program Manager", query: "innovation program manager remote job 2025", sector: "Corporate Innovation & Consulting" },
      { label: "Venture Architect / EIR", query: "venture architect entrepreneur in residence remote 2025", sector: "Tech Startups / VC" },
      { label: "Private Sector Development", query: "private sector development consultant USAID IFC remote 2025", sector: "International Development (UN/USAID/IFC)" },
    ]
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  }));

  const steps = ["API Key", "Your Profile", "Job Preferences", "Search Queries"];

  const CheckBtn = ({ k, v, color = "#00D4FF" }) => {
    const active = form[k].includes(v);
    return (
      <button onClick={() => toggleArr(k, v)} style={{
        padding: "8px 14px", borderRadius: "5px", border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
        background: active ? `${color}22` : "transparent", color: active ? color : "#888",
        fontSize: "12px", cursor: "pointer", marginRight: "8px", marginBottom: "8px", transition: "all 0.15s"
      }}>{v}</button>
    );
  };

  const canProceed = () => {
    if (step === 1) return form.apiKey.startsWith("sk-ant-");
    if (step === 2) return form.name && form.summary;
    if (step === 3) return form.sectors.length > 0 && form.arrangements.length > 0;
    return true;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#eee", fontFamily: "'Sora', 'Helvetica Neue', sans-serif", padding: "40px 20px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        input, textarea, select { color-scheme: dark; }
        input:focus, textarea:focus { border-color: #00D4FF !important; }
        *{box-sizing:border-box;}`}
      </style>

      <div style={{ maxWidth: "620px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "#00D4FF", letterSpacing: "3px", marginBottom: "12px" }}>
            ● AI JOB HUNTER
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 8px", background: "linear-gradient(135deg,#fff,#888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Set Up Your Profile
          </h1>
          <p style={{ color: "#666", fontSize: "14px" }}>Your details stay in your browser — never stored on any server.</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                height: "3px", borderRadius: "2px", marginBottom: "6px",
                background: i + 1 <= step ? "#00D4FF" : "rgba(255,255,255,0.1)",
                transition: "background 0.3s"
              }} />
              <div style={{ fontSize: "10px", color: i + 1 === step ? "#00D4FF" : "#555", fontFamily: "'Space Mono', monospace" }}>
                {s}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1 — API Key */}
        {step === 1 && (
          <div>
            <Field label="Anthropic API Key" hint="Get yours free at console.anthropic.com — costs ~$0.15 per search run">
              <input type="password" value={form.apiKey} onChange={e => set("apiKey", e.target.value)}
                placeholder="sk-ant-..." style={inputStyle} />
            </Field>
            <div style={{ background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "8px", padding: "14px 16px", fontSize: "13px", color: "#aaa", lineHeight: "1.6" }}>
              🔒 Your API key is used directly from your browser to call Claude AI. It is never sent to or stored on any server.
            </div>
          </div>
        )}

        {/* Step 2 — Profile */}
        {step === 2 && (
          <div>
            <Field label="Full Name"><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Jane Smith" style={inputStyle} /></Field>
            <Field label="Professional Title"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Innovation Strategist" style={inputStyle} /></Field>
            <Field label="Email"><input value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" style={inputStyle} /></Field>
            <Field label="LinkedIn URL"><input value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/yourname" style={inputStyle} /></Field>
            <Field label="Professional Summary *" hint="3-5 sentences about your background, expertise and what makes you distinctive">
              <textarea value={form.summary} onChange={e => set("summary", e.target.value)}
                placeholder="e.g. Senior innovation professional with 15 years experience building startups and advising corporations across Southeast Asia..."
                rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <Field label="Key Experience" hint="Paste your most relevant roles — bullet points are fine">
              <textarea value={form.experience} onChange={e => set("experience", e.target.value)}
                placeholder="- Head of Innovation at XYZ Corp (2020-2024)&#10;- Startup Ecosystem Lead at ABC Accelerator (2017-2020)"
                rows={5} style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
            <Field label="Key Skills" hint="Comma separated">
              <input value={form.skills} onChange={e => set("skills", e.target.value)}
                placeholder="Venture building, Business design, Product strategy, Workshop facilitation..." style={inputStyle} />
            </Field>
          </div>
        )}

        {/* Step 3 — Preferences */}
        {step === 3 && (
          <div>
            <Field label="Target Salary (USD/year)">
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input type="number" value={form.salaryMin} onChange={e => set("salaryMin", e.target.value)}
                  placeholder="Min" style={{ ...inputStyle, flex: 1 }} />
                <span style={{ color: "#555" }}>to</span>
                <input type="number" value={form.salaryMax} onChange={e => set("salaryMax", e.target.value)}
                  placeholder="Max" style={{ ...inputStyle, flex: 1 }} />
              </div>
            </Field>
            <Field label="Work Arrangement *">
              <div>{ARRANGEMENTS.map(a => <CheckBtn key={a} k="arrangements" v={a} color="#00FF88" />)}</div>
            </Field>
            <Field label="Target Sectors *" hint="Select all that apply">
              <div>{SECTORS.map(s => <CheckBtn key={s} k="sectors" v={s} />)}</div>
            </Field>
          </div>
        )}

        {/* Step 4 — Search Queries */}
        {step === 4 && (
          <div>
            <Field label="Search Queries" hint="These are what the AI agent searches for. Edit or add your own.">
              {form.searchQueries.map((q, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "14px", marginBottom: "10px" }}>
                  <input value={q.label} onChange={e => {
                    const qs = [...form.searchQueries]; qs[i] = { ...qs[i], label: e.target.value }; set("searchQueries", qs);
                  }} placeholder="Label" style={{ ...inputStyle, marginBottom: "8px", fontSize: "13px" }} />
                  <input value={q.query} onChange={e => {
                    const qs = [...form.searchQueries]; qs[i] = { ...qs[i], query: e.target.value }; set("searchQueries", qs);
                  }} placeholder="Search query" style={{ ...inputStyle, fontSize: "13px" }} />
                  <button onClick={() => set("searchQueries", form.searchQueries.filter((_, j) => j !== i))}
                    style={{ marginTop: "8px", background: "none", border: "none", color: "#555", fontSize: "12px", cursor: "pointer" }}>
                    Remove
                  </button>
                </div>
              ))}
              <button onClick={() => set("searchQueries", [...form.searchQueries, { label: "", query: "", sector: "" }])}
                style={{ background: "transparent", border: "1px dashed rgba(255,255,255,0.2)", color: "#888", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", width: "100%" }}>
                + Add search query
              </button>
            </Field>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
          {step > 1
            ? <button onClick={() => setStep(s => s - 1)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#888", padding: "12px 28px", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>← Back</button>
            : <div />
          }
          {step < 4
            ? <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} style={{ background: canProceed() ? "linear-gradient(135deg,#00D4FF,#00FF88)" : "rgba(255,255,255,0.1)", color: canProceed() ? "#000" : "#555", padding: "12px 32px", borderRadius: "6px", border: "none", cursor: canProceed() ? "pointer" : "not-allowed", fontSize: "14px", fontWeight: "700" }}>
                Continue →
              </button>
            : <button onClick={() => onSave(form)} style={{ background: "linear-gradient(135deg,#00D4FF,#00FF88)", color: "#000", padding: "12px 32px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "700" }}>
                Launch Job Hunter 🚀
              </button>
          }
        </div>
      </div>
    </div>
  );
}
