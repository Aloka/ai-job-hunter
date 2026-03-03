# 🎯 AI Job Hunter
### Automated job discovery, CV tailoring & daily alerts — powered by Claude AI

> Built by [Aloka Gunasekara](https://www.linkedin.com/in/alokagunasekara) · Free & open source

---

## What This Does

AI Job Hunter is an agent swarm that hunts for jobs on your behalf:

- 🔍 **Searches** 8+ job categories across the web using Claude AI + live web search
- 🎯 **Scores** each role for fit against your specific background (0–100)
- 📝 **Tailors** your CV and writes a cover letter per job — auto-detecting formal vs conversational tone
- 📧 **Emails** you a daily digest every morning with new matches
- 📁 **Saves** tailored CVs + cover letters to Google Drive (one folder per application)
- 🚩 **Flags** visa/nationality barrier risk per role

**Built for:** Senior professionals, career changers, and anyone job hunting across borders.

---

## Two Ways to Use It

### 🌐 Option A — Web App (no coding, runs in browser)
Use the hosted version at **[jobhunter.vercel.app](https://jobhunter.vercel.app)**

- Enter your Anthropic API key
- Fill in your profile
- Search for jobs instantly

### 💻 Option B — Run Locally (full automation with Gmail + Google Drive)
Clone this repo and run the Python scripts for daily automated alerts.

---

## Option A — Web App Setup

1. Get a free Anthropic API key at [console.anthropic.com](https://console.anthropic.com) (~$5 to start)
2. Visit the web app
3. Enter your key and profile — it never leaves your browser

---

## Option B — Local Setup

### Requirements
- Python 3.10+
- An Anthropic API key (~$5 gets you weeks of usage)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/ai-job-hunter
cd ai-job-hunter/scripts

python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

### Run

```bash
# Search for jobs and print results
python run.py --dry-run

# Full run — search + send Gmail digest
python run.py

# Tailor your CV for a specific job
python run.py --tailor '{"title":"Innovation Lead","organization":"UNDP",...}'

# Test your Gmail connection
python run.py --test-email
```

### Automate Daily (Mac/Linux)

```bash
crontab -e
# Add this line (runs 8am daily):
30 2 * * * cd /path/to/ai-job-hunter/scripts && source venv/bin/activate && python run.py >> logs/cron.log 2>&1
```

---

## Customising for Your Profile

Edit `scripts/config/profile.py` — this is your single source of truth:

- Your CV, experience, skills
- Target salary, sectors, work arrangement
- Search queries (add/remove as many as you like)
- Gmail and Google Drive settings

---

## Google Drive + Gmail Setup

See **[SETUP_GOOGLE.md](SETUP_GOOGLE.md)** for the step-by-step guide.

---

## Cost

Each full job search run costs roughly **$0.10–$0.20** in API credits.
At daily runs, that's ~$3–6/month — less than a coffee.

---

## Roadmap

- [x] Job discovery agent (web search + scoring)
- [x] CV & cover letter tailoring (Google Drive)
- [x] Daily Gmail digest
- [x] Browser-based web app
- [ ] Application tracker (Google Sheets)
- [ ] LinkedIn outreach message generator
- [ ] Full formatted CV output (DOCX template)

---

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — free to use, modify, and share.

---

*If this helped you land a job, let us know! ⭐ Star the repo to help others find it.*
