"""
AGENT 1 — JOB DISCOVERY AGENT
Searches the web for live job listings matching Aloka's profile.
Returns scored, deduplicated results.
"""

import anthropic
import json
import hashlib
import os
import re
from datetime import datetime
from pathlib import Path
from config.profile import SEARCH_QUERIES, PREFERENCES, PROFILE

SEEN_JOBS_FILE = Path(__file__).parent.parent / "seen_jobs" / "seen.json"
LOGS_DIR = Path(__file__).parent.parent / "logs"


def load_seen_jobs() -> set:
    if SEEN_JOBS_FILE.exists():
        with open(SEEN_JOBS_FILE) as f:
            return set(json.load(f))
    return set()


def save_seen_jobs(seen: set):
    SEEN_JOBS_FILE.parent.mkdir(exist_ok=True)
    with open(SEEN_JOBS_FILE, "w") as f:
        json.dump(list(seen), f)


def job_fingerprint(job: dict) -> str:
    key = f"{job.get('title','').lower().strip()}-{job.get('organization','').lower().strip()}"
    return hashlib.md5(key.encode()).hexdigest()


def build_search_prompt(query_config: dict) -> str:
    return f"""You are a specialized job search agent for a senior professional.

CANDIDATE PROFILE:
- Name: Aloka Gunasekara, MBA (Sri Lankan national, based between Colombo & Singapore)
- 17 years experience in: venture architecture, corporate innovation, startup ecosystems, 
  private sector development consulting, product management
- Key background: USAID/IESC (YouLead Director), StartupX Foundry (Program Manager / EIR),
  Social Seed Media (Co-Founder SaaS), Half Life (Product Manager, ad-tech)
- Open to: fully remote, Singapore, global relocation, short/long-term contracts
- Salary target: $90K–$130K USD annually (or equivalent contract day rate)
- NOT suited for: pure coding roles, heavy compliance/admin, highly bureaucratic environments

SEARCH TASK: Find CURRENTLY ADVERTISED job listings for: {query_config['label']}
Search query to use: {query_config['query']}

IMPORTANT RULES:
1. Only return REAL jobs that are actively advertised right now (posted within last 60 days)
2. Include the actual job posting URL — if you can't find a real URL, omit that job
3. Do NOT invent or hallucinate job listings
4. Focus on roles where the Sri Lankan nationality is NOT a disqualifier (remote-first, 
   international orgs, or roles that sponsor visas)
5. Score each job's fit for Aloka's specific background (not just generic fit)

Return ONLY a valid JSON array, no other text:
[
  {{
    "title": "Exact job title",
    "organization": "Company or organization name",
    "location": "City, Country or 'Remote'",
    "sector": "{query_config['sector']}",
    "salary": "Salary range if mentioned, else null",
    "posted_date": "Approximate post date if visible",
    "summary": "2-3 sentence description of the role and key responsibilities",
    "requirements": "Key requirements in 1-2 sentences",
    "why_fit": "Specific reason this fits Aloka's background — reference his actual experience",
    "nationality_risk": "low/medium/high — risk that Sri Lankan passport is a barrier",
    "url": "Direct URL to job posting",
    "remote": true/false,
    "contract": true/false,
    "match_score": 70-95
  }}
]

If fewer than 2 real listings found, return an empty array: []
"""


def run_discovery(search_queries=None, deduplicate=True, verbose=True) -> list[dict]:
    """
    Run the job discovery agent across all configured search queries.
    Returns list of new (unseen) job dicts, sorted by match_score descending.
    """
    client = anthropic.Anthropic()
    queries = search_queries or SEARCH_QUERIES
    seen = load_seen_jobs() if deduplicate else set()
    all_jobs = []
    errors = []

    log_lines = [f"=== DISCOVERY RUN: {datetime.now().isoformat()} ==="]

    for i, sq in enumerate(queries):
        if verbose:
            print(f"[{i+1}/{len(queries)}] Searching: {sq['label']}...")

        try:
            response = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=2000,
                tools=[{"type": "web_search_20250305", "name": "web_search"}],
                messages=[{
                    "role": "user",
                    "content": build_search_prompt(sq)
                }]
            )

            full_text = "".join(
                block.text for block in response.content
                if hasattr(block, "text")
            )

            # Extract JSON from response
            jobs = []
            json_match = re.search(r'\[[\s\S]*\]', full_text)
            if json_match:
                try:
                    jobs = json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass

            # Filter and deduplicate
            new_jobs = []
            for job in jobs:
                if not job.get("title") or not job.get("organization"):
                    continue
                # Apply minimum fit score filter
                if job.get("match_score", 0) < PREFERENCES["min_fit_score_for_alert"]:
                    continue
                fp = job_fingerprint(job)
                if fp not in seen:
                    job["fingerprint"] = fp
                    job["found_at"] = datetime.now().isoformat()
                    job["search_category"] = sq["label"]
                    new_jobs.append(job)
                    seen.add(fp)

            all_jobs.extend(new_jobs)
            log_lines.append(f"  [{sq['label']}] → {len(new_jobs)} new jobs found")
            if verbose:
                print(f"   ✓ {len(new_jobs)} new jobs")

        except Exception as e:
            errors.append(f"{sq['label']}: {str(e)}")
            log_lines.append(f"  [{sq['label']}] → ERROR: {str(e)}")
            if verbose:
                print(f"   ✗ Error: {e}")

    # Save updated seen set
    if deduplicate:
        save_seen_jobs(seen)

    # Sort by match score
    all_jobs.sort(key=lambda x: x.get("match_score", 0), reverse=True)

    # Save log
    LOGS_DIR.mkdir(exist_ok=True)
    log_file = LOGS_DIR / f"discovery_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    log_lines.append(f"\nTOTAL NEW JOBS: {len(all_jobs)}")
    if errors:
        log_lines.append(f"ERRORS: {errors}")
    with open(log_file, "w") as f:
        f.write("\n".join(log_lines))

    if verbose:
        print(f"\n✓ Discovery complete. {len(all_jobs)} new jobs found.")
        print(f"  Log saved: {log_file}")

    return all_jobs


if __name__ == "__main__":
    jobs = run_discovery(verbose=True)
    print(json.dumps(jobs, indent=2))
