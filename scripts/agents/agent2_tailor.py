"""
AGENT 2 — CV & COVER LETTER TAILORING AGENT
Takes a job listing, tailors Aloka's CV to match, writes a cover letter,
and saves both as Google Docs in a structured Drive folder.

Requires: Google Docs API credentials (see README for setup)
"""

import anthropic
import json
import os
import re
from datetime import datetime
from pathlib import Path
from config.profile import CV_SUMMARY, CV_EXPERIENCE, CV_EDUCATION, CV_KEY_SKILLS, PROFILE, GOOGLE_DRIVE

# Google API imports — installed via: pip install google-api-python-client google-auth-oauthlib
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    print("⚠️  Google API libraries not installed. Run: pip install google-api-python-client google-auth-oauthlib")

SCOPES = [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
]

CREDS_FILE = Path(__file__).parent.parent / "config" / "google_credentials.json"
TOKEN_FILE = Path(__file__).parent.parent / "config" / "google_token.json"


def get_google_credentials():
    """Authenticate with Google and return credentials."""
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDS_FILE.exists():
                raise FileNotFoundError(
                    f"Google credentials file not found at {CREDS_FILE}\n"
                    "See README.md for setup instructions."
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
    return creds


def detect_tone(job: dict) -> str:
    """
    Detect whether the role needs a formal or conversational tone.
    Returns 'formal' or 'conversational'.
    """
    formal_indicators = [
        "USAID", "UNDP", "IFC", "ADB", "World Bank", "GIZ", "UN", "United Nations",
        "government", "ministry", "public sector", "development bank", "OECD",
        "European Commission", "McKinsey", "Deloitte", "BCG", "PwC", "EY", "KPMG"
    ]
    conversational_indicators = [
        "startup", "scale-up", "venture", "VC", "seed", "Series A", "Series B",
        "accelerator", "incubator", "tech", "SaaS", "fintech", "platform",
        "Antler", "Y Combinator", "500 Startups"
    ]

    text = f"{job.get('organization','')} {job.get('title','')} {job.get('summary','')} {job.get('sector','')}".lower()

    formal_score = sum(1 for kw in formal_indicators if kw.lower() in text)
    conv_score = sum(1 for kw in conversational_indicators if kw.lower() in text)

    return "formal" if formal_score >= conv_score else "conversational"


def build_cv_prompt(job: dict, tone: str) -> str:
    exp_text = "\n".join([
        f"- {e['title']} at {e['org']} ({e['period']}): {'; '.join(e['highlights'][:2])}"
        for e in CV_EXPERIENCE
    ])

    return f"""You are an expert CV writer specialising in senior international roles.

TASK: Tailor Aloka Gunasekara's CV for the following job. Reorder, reframe, and 
emphasise the most relevant experience. Keep ALL facts truthful — only reframe emphasis.

TARGET JOB:
Title: {job.get('title')}
Organization: {job.get('organization')}
Location: {job.get('location')}
Summary: {job.get('summary')}
Requirements: {job.get('requirements')}
Sector: {job.get('sector')}
Tone required: {tone.upper()}

ALOKA'S BASE PROFILE:
{CV_SUMMARY}

EXPERIENCE:
{exp_text}

SKILLS: {', '.join(CV_KEY_SKILLS)}

INSTRUCTIONS:
1. Rewrite the professional summary (3-4 sentences) to directly mirror the job's language and requirements
2. Select and reorder the 4-5 most relevant bullet points from his experience
3. Add any relevant keywords from the job description naturally
4. For {'formal' if tone == 'formal' else 'conversational'} tone: use {'precise, authoritative, third-person language with quantified impact metrics' if tone == 'formal' else 'active, first-person, energetic language that shows personality and entrepreneurial spirit'}
5. Do NOT invent new experience or qualifications

Return a structured document with these exact sections:
=== PROFESSIONAL SUMMARY ===
[tailored summary here]

=== KEY COMPETENCIES ===
[comma-separated list of 8-10 most relevant skills]

=== SELECTED EXPERIENCE (TAILORED) ===
[4-5 most relevant experience bullets, reformatted]

=== WHY THIS APPLICATION IS STRONG ===
[2-3 sentences on the strongest fit points — for Aloka's reference, not in the CV]
"""


def build_cover_letter_prompt(job: dict, tone: str) -> str:
    return f"""You are an expert cover letter writer for senior international professionals.

TASK: Write a compelling cover letter from Aloka Gunasekara for this role.

TARGET JOB:
Title: {job.get('title')}
Organization: {job.get('organization')}
Location: {job.get('location')}
Summary: {job.get('summary')}
Requirements: {job.get('requirements')}
Sector: {job.get('sector')}
Why Aloka fits: {job.get('why_fit')}

ALOKA'S BACKGROUND:
{CV_SUMMARY}

TONE: {tone.upper()}
{'Use precise, measured language. Reference the organisation by name. Show deep understanding of their mission. Quantify impact. Third paragraph should reference specific alignment with their mandate.' if tone == 'formal' else 'Be energetic and direct. Show personality. Lead with a hook. Make it feel human and entrepreneurial, not corporate. Reference shared values around innovation and impact.'}

LETTER STRUCTURE:
1. Opening hook (1 sentence that immediately establishes relevance)
2. Why this role / this organisation specifically (2-3 sentences — be specific, not generic)
3. Evidence paragraph: 2 concrete examples from his career that directly map to the role
4. What he brings that others won't (differentiation)
5. Close: clear call to action, confident but not arrogant

Format as a proper letter:
- Date: {datetime.now().strftime('%d %B %Y')}
- Recipient: Hiring Manager / [Organisation Name] Recruitment Team
- Sender details: Aloka Gunasekara, MBA | {PROFILE['email']} | LinkedIn: {PROFILE['linkedin']}
- Length: 350-450 words maximum

Return ONLY the letter text, ready to paste.
"""


def create_google_doc(service, title: str, content: str, folder_id: str) -> str:
    """Create a Google Doc with content and return its URL."""
    # Create the document
    doc = service.documents().create(body={"title": title}).execute()
    doc_id = doc["documentId"]

    # Insert content
    service.documents().batchUpdate(
        documentId=doc_id,
        body={
            "requests": [{
                "insertText": {
                    "location": {"index": 1},
                    "text": content
                }
            }]
        }
    ).execute()

    # Move to the correct folder
    drive_service = build("drive", "v3", credentials=get_google_credentials())
    drive_service.files().update(
        fileId=doc_id,
        addParents=folder_id,
        removeParents="root",
        fields="id, parents"
    ).execute()

    return f"https://docs.google.com/document/d/{doc_id}/edit"


def create_job_folder(drive_service, job: dict, root_folder_id: str) -> str:
    """Create a folder for this job application and return its ID."""
    safe_name = re.sub(r'[^\w\s-]', '', f"{job.get('title', 'Role')}_{job.get('organization', 'Org')}")
    safe_name = safe_name[:60].strip()
    date_prefix = datetime.now().strftime("%Y%m%d")
    folder_name = f"{date_prefix}_{safe_name}"

    folder_metadata = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [root_folder_id]
    }
    folder = drive_service.files().create(body=folder_metadata, fields="id").execute()
    return folder["id"]


def tailor_and_upload(job: dict, dry_run: bool = False) -> dict:
    """
    Main function: tailor CV + cover letter for a job and upload to Google Drive.
    Returns dict with Google Doc URLs and tailoring notes.

    dry_run=True: Generate content but don't upload (for testing)
    """
    client = anthropic.Anthropic()
    tone = detect_tone(job)

    print(f"\n{'='*60}")
    print(f"Tailoring for: {job.get('title')} @ {job.get('organization')}")
    print(f"Tone detected: {tone.upper()}")
    print(f"{'='*60}")

    # ── Generate tailored CV ──────────────────────────────────────
    print("Generating tailored CV...")
    cv_response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": build_cv_prompt(job, tone)}]
    )
    cv_content = cv_response.content[0].text

    # ── Generate cover letter ─────────────────────────────────────
    print("Generating cover letter...")
    cl_response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": build_cover_letter_prompt(job, tone)}]
    )
    cl_content = cl_response.content[0].text

    if dry_run:
        print("\n[DRY RUN] CV Content Preview:")
        print(cv_content[:500] + "...")
        print("\n[DRY RUN] Cover Letter Preview:")
        print(cl_content[:500] + "...")
        return {
            "job": job.get("title"),
            "org": job.get("organization"),
            "tone": tone,
            "cv_content": cv_content,
            "cl_content": cl_content,
            "uploaded": False
        }

    # ── Upload to Google Drive ────────────────────────────────────
    if not GOOGLE_AVAILABLE:
        print("⚠️  Cannot upload: Google API not installed")
        return {"uploaded": False, "cv_content": cv_content, "cl_content": cl_content}

    print("Uploading to Google Drive...")
    creds = get_google_credentials()
    docs_service = build("docs", "v1", credentials=creds)
    drive_service = build("drive", "v3", credentials=creds)

    root_folder = GOOGLE_DRIVE["root_folder_id"]
    if root_folder == "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE":
        raise ValueError("Please set your Google Drive folder ID in config/profile.py")

    # Create job-specific folder
    folder_id = create_job_folder(drive_service, job, root_folder)

    # Upload CV
    cv_title = f"CV — {job.get('title')} @ {job.get('organization')}"
    cv_url = create_google_doc(docs_service, cv_title, cv_content, folder_id)
    print(f"  ✓ CV uploaded: {cv_url}")

    # Upload cover letter
    cl_title = f"Cover Letter — {job.get('title')} @ {job.get('organization')}"
    cl_url = create_google_doc(docs_service, cl_title, cl_content, folder_id)
    print(f"  ✓ Cover Letter uploaded: {cl_url}")

    return {
        "job": job.get("title"),
        "org": job.get("organization"),
        "tone": tone,
        "cv_url": cv_url,
        "cl_url": cl_url,
        "folder_id": folder_id,
        "uploaded": True
    }


if __name__ == "__main__":
    # Test with a sample job
    sample_job = {
        "title": "Innovation Program Manager",
        "organization": "UNDP Regional Hub",
        "location": "Bangkok, Thailand (Remote-eligible)",
        "sector": "International Development",
        "summary": "Lead innovation programming across Southeast Asia, managing a portfolio of social innovation projects.",
        "requirements": "8+ years experience in innovation, development sector background, strong facilitation skills.",
        "why_fit": "Aloka's USAID/IESC background and YouLead programme directly maps to this mandate.",
        "match_score": 88
    }
    result = tailor_and_upload(sample_job, dry_run=True)
    print("\nDone:", result.get("uploaded"))
