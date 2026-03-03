# Contributing to AI Job Hunter

Thanks for wanting to help! Here's how to contribute.

## Good First Contributions

- Add new search query templates for specific industries/roles
- Improve the fit scoring logic in `agent1_discovery.py`
- Add support for more job boards
- Improve the email template in `agent3_alert.py`
- Add new sectors to the web app profile builder
- Translations (the web app UI)

## How to Submit

1. Fork the repo
2. Create a branch: `git checkout -b my-improvement`
3. Make your changes
4. Test it works: `python run.py --dry-run`
5. Submit a Pull Request with a clear description

## Guidelines

- Keep personal data out of code — all profile info goes in `config/profile.py`
- Don't commit API keys or credentials (the `.gitignore` covers this)
- Keep it simple — this tool is used by non-developers too

## Reporting Issues

Open a GitHub Issue with:
- What you expected to happen
- What actually happened
- Your OS and Python version
