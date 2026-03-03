"""
MAIN ORCHESTRATOR — ALOKA'S JOB HUNTING SYSTEM
Ties all agents together. Run this daily via cron or manually.

Usage:
  python run.py                    # Full run: discover → alert
  python run.py --discover-only    # Just discover, print results
  python run.py --tailor JOB_JSON  # Tailor CV for a specific job (JSON string)
  python run.py --test-email       # Send a test alert with dummy data
  python run.py --reset            # Clear seen jobs (re-discovers all)
  python run.py --dry-run          # Discover + show without sending email
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Load .env if present (for local development)
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass  # dotenv optional — can set ANTHROPIC_API_KEY manually

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from agents.agent1_discovery import run_discovery
from agents.agent2_tailor import tailor_and_upload
from agents.agent3_alert import send_alert
from config.profile import PREFERENCES


def parse_args():
    parser = argparse.ArgumentParser(description="Aloka's Job Hunting System")
    parser.add_argument("--discover-only", action="store_true", help="Only run discovery, print results")
    parser.add_argument("--tailor", type=str, help="Tailor CV for job (pass job as JSON string)")
    parser.add_argument("--test-email", action="store_true", help="Send test email")
    parser.add_argument("--reset", action="store_true", help="Clear seen jobs cache")
    parser.add_argument("--dry-run", action="store_true", help="Discover but don't send email")
    parser.add_argument("--no-dedup", action="store_true", help="Don't deduplicate against seen jobs")
    return parser.parse_args()


def reset_seen_jobs():
    seen_file = Path(__file__).parent / "seen_jobs" / "seen.json"
    if seen_file.exists():
        seen_file.unlink()
        print("✓ Seen jobs cache cleared. Next run will rediscover all jobs.")
    else:
        print("No cache to clear.")


def test_email():
    from agents.agent3_alert import send_alert
    sample = [
        {
            "title": "Test: Innovation Director",
            "organization": "UNDP Asia-Pacific",
            "location": "Bangkok / Remote",
            "sector": "International Development",
            "salary": "$115,000",
            "summary": "This is a test email from your Job Hunting System. If you're reading this, the email agent is working correctly!",
            "why_fit": "Your USAID/YouLead experience is a direct match for this mandate.",
            "nationality_risk": "low",
            "remote": True,
            "contract": False,
            "match_score": 92,
            "url": "https://jobs.undp.org"
        },
        {
            "title": "Test: Venture Builder Lead",
            "organization": "Antler VC",
            "location": "Singapore",
            "sector": "Tech Startups / VC",
            "salary": "$95,000–$110,000",
            "summary": "Test role #2. The email formatting shows sector colors, fit scores, and apply buttons.",
            "why_fit": "Your Antler residency and StartupX experience map perfectly.",
            "nationality_risk": "low",
            "remote": False,
            "contract": False,
            "match_score": 87,
            "url": "https://www.antler.co/careers"
        }
    ]
    print("Sending test email...")
    send_alert(sample)


def main():
    args = parse_args()

    print("""
╔════════════════════════════════════════════╗
║    ALOKA'S JOB HUNTING SYSTEM v1.0         ║
║    Venture Architect · Innovation Catalyst ║
╚════════════════════════════════════════════╝
""")

    # ── Handle special modes ────────────────────────────────────
    if args.reset:
        reset_seen_jobs()
        return

    if args.test_email:
        test_email()
        return

    if args.tailor:
        try:
            job = json.loads(args.tailor)
        except json.JSONDecodeError:
            print("Error: --tailor requires a valid JSON string")
            sys.exit(1)
        result = tailor_and_upload(job, dry_run=False)
        print(json.dumps(result, indent=2))
        return

    # ── Main flow: Discover → Filter → Alert ───────────────────
    print("PHASE 1: Running job discovery agent...")
    jobs = run_discovery(
        deduplicate=not args.no_dedup,
        verbose=True
    )

    if not jobs:
        print("\nNo new jobs found today. System up to date.")
        return

    print(f"\nPHASE 2: Found {len(jobs)} new jobs.")
    print("\nTop 5 matches:")
    for j in jobs[:5]:
        print(f"  [{j.get('match_score',0)}] {j.get('title')} @ {j.get('organization')} ({j.get('location')})")

    if args.discover_only or args.dry_run:
        print("\n[Dry run / discover-only mode — email not sent]")
        print("\nFull results:")
        print(json.dumps(jobs, indent=2))
        return

    # ── Send email alert ────────────────────────────────────────
    print("\nPHASE 3: Sending Gmail alert...")
    sent = send_alert(jobs)

    if sent:
        print(f"\n✓ Daily digest sent with {len(jobs)} new opportunities.")
    else:
        print("\n⚠️  Email not sent (check logs).")

    print("\n═══════════════════════════════════════")
    print("Run complete. Next steps:")
    print("  • Check your Gmail for the digest")
    print("  • To tailor CV for a job: python run.py --tailor '<job_json>'")
    print("  • To set up daily automation: see README.md (cron setup)")
    print("═══════════════════════════════════════\n")


if __name__ == "__main__":
    main()
