"""
ALOKA'S JOB HUNTING SYSTEM — PROFILE CONFIGURATION
Edit this file to update your profile, preferences, and search parameters.
"""

# ─── PERSONAL DETAILS ──────────────────────────────────────────────────────
PROFILE = {
    "name": "Aloka Gunasekara",
    "email": "aloka.gunasekara@gmail.com",
    "phone_sg": "+65 86 85 86 59",
    "phone_lk": "+94 717 684 529",
    "linkedin": "https://www.linkedin.com/in/alokagunasekara",
    "location_primary": "Colombo, Sri Lanka",
    "location_secondary": "Singapore",
    "nationality": "Sri Lankan",
}

# ─── JOB PREFERENCES ───────────────────────────────────────────────────────
PREFERENCES = {
    "salary_min_usd": 90000,
    "salary_max_usd": 130000,
    "arrangements": ["remote", "hybrid", "relocate"],
    "relocation_targets": ["Singapore", "Dubai", "London", "Geneva", "Amsterdam", "Kuala Lumpur", "Bangkok"],
    "min_fit_score_for_alert": 78,  # Only email jobs scoring above this
    "sectors": [
        "International Development",
        "Corporate Innovation",
        "Tech Startups / VC",
        "Government / Economic Development",
    ],
}

# ─── SEARCH QUERIES ────────────────────────────────────────────────────────
# Each dict defines one search "agent run". Add/remove as needed.
SEARCH_QUERIES = [
    {
        "label": "Venture Architect / EIR",
        "query": 'venture architect OR "entrepreneur in residence" remote job 2025',
        "sector": "Tech Startups / VC",
        "boards": ["wellfound.com", "linkedin.com/jobs", "ycombinator.com/jobs"],
    },
    {
        "label": "Private Sector Development Consultant",
        "query": '"private sector development" consultant USAID IFC UNDP remote 2025',
        "sector": "International Development",
        "boards": ["devex.com", "reliefweb.int", "impactpool.org", "linkedin.com/jobs"],
    },
    {
        "label": "Innovation Program Manager",
        "query": '"innovation program manager" OR "head of innovation" remote 2025 startup',
        "sector": "Corporate Innovation",
        "boards": ["linkedin.com/jobs", "weworkremotely.com", "remote.co"],
    },
    {
        "label": "Market Systems Development Advisor",
        "query": '"market systems development" advisor APAC remote contract 2025',
        "sector": "International Development",
        "boards": ["devex.com", "reliefweb.int", "dai.com/careers"],
    },
    {
        "label": "Startup Ecosystem Lead",
        "query": '"startup ecosystem" program manager Singapore OR remote 2025 job opening',
        "sector": "Government / Economic Development",
        "boards": ["linkedin.com/jobs", "tech.gov.sg", "edb.gov.sg"],
    },
    {
        "label": "Corporate Innovation Consultant",
        "query": 'corporate innovation consultant contract remote APAC 2025',
        "sector": "Corporate Innovation",
        "boards": ["linkedin.com/jobs", "consultancy.uk", "mckinsey.com/careers"],
    },
    {
        "label": "Venture Builder / Incubation Lead",
        "query": '"venture builder" OR "incubation lead" remote 2025 job',
        "sector": "Tech Startups / VC",
        "boards": ["wellfound.com", "linkedin.com/jobs"],
    },
    {
        "label": "UN/Development Bank Roles",
        "query": 'UNDP OR ADB OR "World Bank" OR GIZ innovation specialist remote 2025 job',
        "sector": "International Development",
        "boards": ["jobs.undp.org", "adb.org/careers", "giz.de", "worldbank.org/careers"],
    },
]

# ─── CV PROFILE (used by tailoring agent) ──────────────────────────────────
CV_SUMMARY = """
Accomplished entrepreneur, Innovation Catalyst and Business Design Strategist with 17+ years 
of progressive expertise in corporate innovation, venture architecture, entrepreneur training, 
product management and venture capital with a focus on innovation-first businesses. Skilled in 
business incubation, team building, coaching, strategic partnerships, data-driven analysis and 
innovative investments propelling growth and stakeholder relations. Proficient in addressing 
complex business challenges through innovation and voice-of-the-customer engagements. 
Experienced in promoting large-scale projects while leading high level, multi-party 
collaborations (US$0.5M–US$15MM). International experience across APAC, South Asia, UK, Australia.
"""

CV_EXPERIENCE = [
    {
        "title": "Independent Consultant – Business Design Strategist",
        "org": "Self-employed (Singapore, KL, Colombo)",
        "period": "2023 – Present",
        "highlights": [
            "Corporate innovation advisory for 3 multinational companies in tech, hospitality, and finance sectors",
            "Innovation Catalyst for award-winning ERP integrator (London) — new product revenue model forecast: +USD 15M by 2027",
            "Private Sector Development advisory with focus on regulatory reform and investment climate in South Asia",
        ]
    },
    {
        "title": "Principal Venture Architect (Director – Startup & Ecosystem Innovation)",
        "org": "YouLead / IESC (USAID-funded), Colombo",
        "period": "2021 – 2023",
        "highlights": [
            "Led 4 Market System Development initiatives: agri-business, modern pharmacies, care facilities, tourism",
            "Designed and executed $1.2M agri-incubation programme; estimated $20M GDP contribution by 2030",
            "Developed first-of-kind community pharmacist entrepreneurship model with 17%+ net profit guarantee",
        ]
    },
    {
        "title": "Program Manager (Entrepreneur-in-Residence)",
        "org": "StartupX Foundry, Colombo",
        "period": "2017 – 2021",
        "highlights": [
            "Established one of Sri Lanka's first commercially-focused independent accelerators",
            "Engaged 5,000+ startup and SME entrepreneurs; hands-on mentorship for 100+",
            "Created Sri Lanka's first R&D commercialisation-through-startup program (SLINTEC + StartupX + Lankan Angel Fund)",
            "Delivered inaugural incubation curriculum for UNDP Sri Lanka HackaDev programme",
        ]
    },
    {
        "title": "Product Manager",
        "org": "Half Life (Private) Limited, Colombo",
        "period": "2016 – 2017",
        "highlights": [
            "Owned full product suite for ad-tech platform reaching 98% of Sri Lanka's online population",
            "First Supply Side Platform natively supporting Sinhala and Tamil languages",
        ]
    },
    {
        "title": "Co-Founder (Operations & Product)",
        "org": "Social Seed Media, Sydney/Colombo",
        "period": "2011 – 2016",
        "highlights": [
            "Co-founded IT R&D company with offices in Sydney and Colombo",
            "Developed PropertyHelper SaaS — 3,000+ investment properties managed, AU$3M+ revenue",
        ]
    },
]

CV_EDUCATION = [
    {"degree": "MBA", "institution": "Postgraduate Institute of Management, Colombo", "year": "2017"},
    {"degree": "Bachelor of Arts", "institution": "University of Peradeniya, Sri Lanka", "year": "2007"},
    {"degree": "Certified (Scott Galloway)", "institution": "Section4, New York", "year": "2020"},
    {"degree": "DAOTS Programme", "institution": "Osaka, Japan", "year": "2023"},
]

CV_KEY_SKILLS = [
    "Venture Architecture", "Business Model Design", "Corporate Innovation",
    "Product Strategy & Management", "Startup Incubation & Acceleration",
    "Market Systems Development", "Workshop Facilitation & Design Thinking",
    "Multi-Stakeholder Management", "P&L Management", "ESG Integration",
    "Financial Forecasting", "Team Building & Mentorship", "Agile / Lean / MVP",
    "Voice-of-Customer Engagements", "Blended Finance", "USAID / Development Sector",
]

# ─── GOOGLE DRIVE CONFIG ────────────────────────────────────────────────────
GOOGLE_DRIVE = {
    # Paste the folder ID from your Google Drive URL here
    # e.g. https://drive.google.com/drive/folders/FOLDER_ID_HERE
    "root_folder_id": "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE",
    "folder_structure": "one_per_application",  # Creates: /JobTitle_OrgName/CV.gdoc + CoverLetter.gdoc
}

# ─── EMAIL ALERT CONFIG ─────────────────────────────────────────────────────
EMAIL_CONFIG = {
    "recipient": "aloka.gunasekara@gmail.com",
    "sender": "aloka.gunasekara@gmail.com",  # Gmail sends from itself via OAuth
    "subject_prefix": "[JOB ALERT]",
    "frequency": "daily",
    "send_time": "08:00",  # 08:00 AM Sri Lanka time (UTC+5:30)
    "timezone": "Asia/Colombo",
    "min_jobs_to_send": 1,  # Don't send email if no new jobs found
}
