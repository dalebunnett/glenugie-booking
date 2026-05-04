# 🚀 Glenugie Booking System - GitHub Setup Guide

## Quick Setup (5 minutes)

### Prerequisites
- Git installed on your computer
- GitHub Personal Access Token (see below if you don't have one)

---

## Step 1: Download the Code

You have two options:

### Option A: Clone from Webflow
```bash
# The code is already in this Webflow environment
# Skip to Step 2
```

### Option B: Download Files Manually
1. Download all project files from this sandbox
2. Extract to a folder called `glenugie-booking`

---

## Step 2: Initialize Git (if needed)

```bash
cd glenugie-booking

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Glenugie Booking System"
```

---

## Step 3: Connect to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/dalebunnett/glenugie-booking.git

# Set branch name
git branch -M main
```

---

## Step 4: Push to GitHub

```bash
# Push code
git push -u origin main
```

**When prompted:**
- **Username**: `dalebunnett`
- **Password**: Use your **Personal Access Token** (NOT your GitHub password)

---

## Creating a Personal Access Token

If you don't have a token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Note**: "Webflow Deployment"
4. **Expiration**: 90 days (or custom)
5. **Select scopes**:
   - ✅ `repo` (Full control of private repositories)
6. Click **"Generate token"**
7. **COPY THE TOKEN** - you won't see it again!

---

## After Pushing

1. Go to: https://github.com/dalebunnett/glenugie-booking
2. Verify files are uploaded
3. Webflow Cloud will **automatically detect** the push
4. Check your **Webflow Dashboard** for build progress
5. Your app will be live at: **https://www.glenugiekennels.co.uk/app/**

---

## Troubleshooting

### "Authentication failed"
- Make sure you're using your **Personal Access Token**, not password
- Token must have `repo` permissions

### "Repository not found"
- Verify repository exists: https://github.com/dalebunnett/glenugie-booking
- Check repository name is exactly: `glenugie-booking`

### "Updates were rejected"
- Repository might not be empty
- Use: `git push -f origin main` (be careful, this overwrites)

---

## Need Help?

- GitHub Token Guide: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
