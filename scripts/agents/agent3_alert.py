"""
AGENT 3 — GMAIL DAILY ALERT AGENT
Sends a formatted daily digest email with new job matches.
Uses Gmail API (OAuth2) — no SMTP password needed.

Setup: pip install google-api-python-client google-auth-oauthlib
"""

import base64
import json
import os
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from config.profile import EMAIL_CONFIG, PREFERENCES

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

SCOPES_GMAIL = ["https://www.googleapis.com/auth/gmail.send"]
CREDS_FILE = Path(__file__).parent.parent / "config" / "google_credentials.json"
TOKEN_GMAIL_FILE = Path(__file__).parent.parent / "config" / "gmail_token.json"


def get_gmail_credentials():
    creds = None
    if TOKEN_GMAIL_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_GMAIL_FILE), SCOPES_GMAIL)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDS_FILE), SCOPES_GMAIL)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_GMAIL_FILE, "w") as f:
            f.write(creds.to_json())
    return creds


SECTOR_COLORS = {
    "Tech Startups / VC": "#00D4FF",
    "International Development": "#00C853",
    "Corporate Innovation": "#FF6B35",
    "Government / Economic Development": "#C77DFF",
}


def score_badge_color(score: int) -> str:
    if score >= 88:
        return "#00C853"
    elif score >= 80:
        return "#FF6B35"
    return "#888"


def build_job_html(job: dict, index: int) -> str:
    sector_color = SECTOR_COLORS.get(job.get("sector", ""), "#00D4FF")
    score = job.get("match_score", 0)
    badge_color = score_badge_color(score)
    remote_badge = '<span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:3px;font-size:11px;margin-left:6px;">REMOTE</span>' if job.get("remote") else ""
    contract_badge = '<span style="background:#fff3e0;color:#e65100;padding:2px 8px;border-radius:3px;font-size:11px;margin-left:6px;">CONTRACT</span>' if job.get("contract") else ""
    nationality_risk = job.get("nationality_risk", "unknown")
    risk_color = {"low": "#2e7d32", "medium": "#f57c00", "high": "#c62828"}.get(nationality_risk, "#888")

    url = job.get("url", "")
    apply_btn = f'<a href="{url}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:8px 20px;border-radius:4px;text-decoration:none;font-size:12px;font-weight:600;margin-top:12px;">View Job Listing →</a>' if url else ""

    return f"""
    <div style="border:1px solid #e0e0e0;border-left:4px solid {sector_color};border-radius:6px;
                padding:20px;margin-bottom:16px;background:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="flex:1;">
          <div style="font-size:11px;color:{sector_color};font-weight:600;letter-spacing:1px;
                      text-transform:uppercase;margin-bottom:6px;">
            {job.get('sector','')} {remote_badge} {contract_badge}
          </div>
          <div style="font-size:18px;font-weight:700;color:#1a1a2e;margin-bottom:4px;">
            {job.get('title','')}
          </div>
          <div style="font-size:13px;color:#666;margin-bottom:12px;">
            {job.get('organization','')} · {job.get('location','')}
            {f" · {job.get('salary')}" if job.get('salary') else ""}
          </div>
          <p style="font-size:13px;color:#444;line-height:1.6;margin:0 0 10px 0;">
            {job.get('summary','')}
          </p>
          <div style="background:#f8f9fa;border-radius:4px;padding:10px 14px;margin:10px 0;">
            <div style="font-size:11px;color:#888;font-weight:600;margin-bottom:4px;">WHY THIS FITS YOU</div>
            <div style="font-size:13px;color:#333;line-height:1.5;">{job.get('why_fit','')}</div>
          </div>
          <div style="font-size:11px;color:{risk_color};margin-top:8px;">
            ● Nationality barrier risk: {nationality_risk.upper()}
          </div>
          {apply_btn}
        </div>
        <div style="margin-left:20px;text-align:center;flex-shrink:0;">
          <div style="width:56px;height:56px;border-radius:50%;background:{badge_color};
                      display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-size:16px;font-weight:800;color:#fff;line-height:1;">{score}</div>
            <div style="font-size:8px;color:rgba(255,255,255,0.8);letter-spacing:0.5px;">FIT</div>
          </div>
        </div>
      </div>
    </div>
    """


def build_email_html(jobs: list[dict], run_date: str) -> str:
    jobs_html = "\n".join(build_job_html(j, i) for i, j in enumerate(jobs))
    top_score = max(j.get("match_score", 0) for j in jobs) if jobs else 0
    high_fit = [j for j in jobs if j.get("match_score", 0) >= 88]

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">

  <div style="max-width:680px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:10px;
                padding:32px;margin-bottom:24px;text-align:center;">
      <div style="font-size:11px;letter-spacing:3px;color:#00D4FF;margin-bottom:8px;text-transform:uppercase;">
        Job Discovery Agent · Daily Digest
      </div>
      <div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:4px;">
        {len(jobs)} New Opportunities
      </div>
      <div style="font-size:13px;color:#888;">{run_date} · Scored & Ranked for Aloka Gunasekara</div>
    </div>

    <!-- Summary bar -->
    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <div style="flex:1;background:#fff;border-radius:8px;padding:16px;text-align:center;border:1px solid #eee;">
        <div style="font-size:24px;font-weight:800;color:#1a1a2e;">{len(jobs)}</div>
        <div style="font-size:11px;color:#888;margin-top:4px;">New Roles</div>
      </div>
      <div style="flex:1;background:#fff;border-radius:8px;padding:16px;text-align:center;border:1px solid #eee;">
        <div style="font-size:24px;font-weight:800;color:#00C853;">{len(high_fit)}</div>
        <div style="font-size:11px;color:#888;margin-top:4px;">High Fit (88+)</div>
      </div>
      <div style="flex:1;background:#fff;border-radius:8px;padding:16px;text-align:center;border:1px solid #eee;">
        <div style="font-size:24px;font-weight:800;color:#FF6B35;">{top_score}</div>
        <div style="font-size:11px;color:#888;margin-top:4px;">Top Score</div>
      </div>
    </div>

    <!-- Jobs -->
    {jobs_html}

    <!-- Footer -->
    <div style="text-align:center;padding:24px;color:#bbb;font-size:11px;">
      <div>Aloka's Job Hunting System · Powered by Claude + Web Search</div>
      <div style="margin-top:4px;">Searches run daily at 08:00 AM SL time · 
        <a href="mailto:{EMAIL_CONFIG['recipient']}?subject=Pause alerts" style="color:#bbb;">Pause alerts</a>
      </div>
    </div>

  </div>
</body>
</html>
"""


def send_alert(jobs: list[dict]) -> bool:
    """
    Send Gmail digest with the provided job list.
    Returns True if sent successfully.
    """
    if not jobs:
        print("No jobs to send — skipping email.")
        return False

    if len(jobs) < EMAIL_CONFIG.get("min_jobs_to_send", 1):
        print(f"Only {len(jobs)} job(s) found — below threshold. Skipping.")
        return False

    if not GOOGLE_AVAILABLE:
        print("⚠️  Google API not installed. Cannot send email.")
        return False

    run_date = datetime.now().strftime("%A, %d %B %Y")
    high_fit_count = len([j for j in jobs if j.get("match_score", 0) >= 88])

    subject = f"{EMAIL_CONFIG['subject_prefix']} {len(jobs)} new roles · {high_fit_count} high-fit · {datetime.now().strftime('%d %b')}"
    html_body = build_email_html(jobs, run_date)

    # Build email
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = EMAIL_CONFIG["sender"]
    msg["To"] = EMAIL_CONFIG["recipient"]
    msg.attach(MIMEText(html_body, "html"))

    # Send via Gmail API
    creds = get_gmail_credentials()
    service = build("gmail", "v1", credentials=creds)

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    service.users().messages().send(userId="me", body={"raw": raw}).execute()

    print(f"✓ Alert sent to {EMAIL_CONFIG['recipient']} with {len(jobs)} jobs.")
    return True


if __name__ == "__main__":
    # Test with sample data
    sample_jobs = [
        {
            "title": "Head of Innovation & Ventures",
            "organization": "IFC (World Bank Group)",
            "location": "Remote / Washington DC",
            "sector": "International Development",
            "salary": "$110,000–$130,000",
            "summary": "Lead IFC's startup engagement and venture programming across South and Southeast Asia.",
            "why_fit": "Aloka's USAID/IESC directorship and YouLead programme are direct precedent for this scope.",
            "nationality_risk": "low",
            "remote": True,
            "contract": False,
            "match_score": 91,
            "url": "https://jobs.worldbank.org"
        }
    ]
    send_alert(sample_jobs)
