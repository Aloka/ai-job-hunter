# Google Drive & Gmail Setup Guide

This guide connects AI Job Hunter to your Google account so it can:
- Send you daily job alert emails via Gmail
- Save tailored CVs and cover letters to Google Drive

---

## Step 1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Gmail account
3. Click the project dropdown at the top → **"New Project"**
4. Name it `ai-job-hunter` → click **Create**
5. Make sure `ai-job-hunter` is selected in the top dropdown

---

## Step 2 — Enable the APIs

In the search bar at the top, search for and **Enable** each of these:

1. **Gmail API**
2. **Google Drive API**
3. **Google Docs API**

---

## Step 3 — Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. You'll be asked to configure the consent screen first:
   - Click **Configure Consent Screen**
   - Choose **External** → Create
   - App name: `ai-job-hunter`
   - Support email: your Gmail
   - Developer email: your Gmail
   - Click **Save and Continue** through the rest (no changes needed)
4. Back on Credentials → **+ Create Credentials → OAuth client ID**
   - Application type: **Desktop app**
   - Name: `ai-job-hunter`
   - Click **Create**
5. Click **Download JSON**
6. Rename the file to `google_credentials.json`
7. Place it in `scripts/config/google_credentials.json`

---

## Step 4 — Add Yourself as a Test User

1. Go to **APIs & Services → OAuth consent screen**
2. Scroll to **Test users** → **+ Add Users**
3. Add your Gmail address
4. Click **Save**

---

## Step 5 — Add Your Google Drive Folder ID

1. Go to [drive.google.com](https://drive.google.com)
2. Create a new folder called `Job Applications`
3. Open the folder — copy the ID from the URL:
   ```
   https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                          This is your folder ID
   ```
4. Open `scripts/config/profile.py` and paste it:
   ```python
   GOOGLE_DRIVE = {
       "root_folder_id": "paste-your-id-here",
   ```

---

## Step 6 — Test It

```bash
python run.py --test-email
```

A browser window will open — log in and click Allow.
Check your Gmail — you should receive a test digest email.

---

## Troubleshooting

**"Google hasn't verified this app"**
→ Click Advanced → "Go to ai-job-hunter (unsafe)" — this is normal for personal projects

**"Access blocked: app not in test users"**
→ Go back to Step 4 and add your email as a test user

**"google_credentials.json not found"**
→ Make sure the file is in `scripts/config/` not the root folder
