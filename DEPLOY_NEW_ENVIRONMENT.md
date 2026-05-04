# 🚀 Deploying Glenugie Booking System to New Environment

## 📦 Step 1: Get Your Files

Since you're working in a sandbox environment, you need to get these files to your local computer.

### Option A: Download Individual Files
Download these key files/folders from the sandbox:
- `package.json`
- `package-lock.json`
- `astro.config.mjs`
- `tsconfig.json`
- `webflow.json`
- `wrangler.jsonc`
- `.gitignore`
- `src/` (entire folder)
- `public/` (entire folder)
- `generated/` (entire folder)

### Option B: Create Archive
Run this in the sandbox to create a downloadable archive:

```bash
# Create archive (excludes node_modules and .env)
tar -czf glenugie-booking.tar.gz \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='.astro' \
  --exclude='dist' \
  --exclude='.wrangler' \
  package.json \
  package-lock.json \
  astro.config.mjs \
  tsconfig.json \
  webflow.json \
  wrangler.jsonc \
  .gitignore \
  .npmrc \
  components.json \
  src/ \
  public/ \
  generated/ \
  *.md

# Check size
ls -lh glenugie-booking.tar.gz
```

Then download `glenugie-booking.tar.gz` from the sandbox.

---

## 💻 Step 2: Set Up on Your Local Computer

### 1. Extract Files (if using archive)
```bash
tar -xzf glenugie-booking.tar.gz
cd glenugie-booking
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Local `.env` File

Create a new `.env` file with your credentials:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Resend Email
RESEND_API_KEY=re_your_resend_key

# Admin
ADMIN_EMAIL=info@glenugiekennels.co.uk

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your-very-long-random-secret-string-min-32-chars
```

### 4. Test Locally (Optional)
```bash
npm run dev
```

Visit `http://localhost:4321/app/` to test.

---

## 🔗 Step 3: Push to GitHub

### 1. Initialize Git Repository
```bash
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Verify Files (Check that .env is NOT included)
```bash
git status
```

You should see:
- ✅ `package.json`
- ✅ `src/`
- ✅ `public/`
- ✅ All other code files
- ❌ `.env` should NOT appear (it's in `.gitignore`)

### 4. Make First Commit
```bash
git commit -m "Initial commit - Glenugie Booking System complete"
```

### 5. Add GitHub Remote

**First, create the repository on GitHub:**
1. Go to https://github.com/new
2. Repository name: `glenugie-booking`
3. Make it **Private**
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

**Then connect it:**
```bash
git remote add origin https://github.com/dalebunnett/glenugie-booking.git
git branch -M main
git push -u origin main
```

If prompted, enter your GitHub username and **Personal Access Token** (not password).

---

## 🌐 Step 4: Configure Webflow Cloud

### 1. Connect GitHub to Webflow Cloud

In your **Webflow Cloud** "Glenugie Booking System" app:

1. Find **Source Control** or **Repository** section
2. Click **Connect GitHub**
3. Authorize Webflow to access your GitHub
4. Select repository: `dalebunnett/glenugie-booking`
5. Select branch: `main`
6. Save

### 2. Configure Build Settings

```
Build Command: npm run build
Output Directory: dist
Node Version: 18 or higher
Mount Path: /app
```

### 3. Add Environment Variables

In Webflow Cloud app settings, add these environment variables:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
ADMIN_EMAIL=info@glenugiekennels.co.uk
JWT_SECRET=your-very-long-random-secret-string-min-32-chars
```

⚠️ **Important**: Use the SAME values from your local `.env` file!

### 4. Add KV Namespace Binding

```
Binding Type: KV Namespace
Binding Name: KV
Namespace ID: 4dd144b89325450b8949d8132a8ad02c
```

### 5. Add D1 Database Binding (if available)

If Webflow Cloud supports D1:
```
Binding Type: D1 Database
Binding Name: DB
Database ID: your-d1-database-id
```

---

## 🚀 Step 5: Deploy!

### Automatic Deployment

Once GitHub is connected, Webflow Cloud will:
1. ✅ Automatically deploy on every push to `main`
2. ✅ Show build logs
3. ✅ Deploy to `https://www.glenugiekennels.co.uk/app/`

### Manual Deployment

If auto-deploy doesn't work:
1. Go to your Webflow Cloud app
2. Find "Deployments" section
3. Click "Deploy Now" or "Trigger Deployment"

---

## ✅ Step 6: Verify Deployment

### Check These URLs:

1. **Home/Booking Page**
   ```
   https://www.glenugiekennels.co.uk/app/
   ```

2. **Admin Dashboard**
   ```
   https://www.glenugiekennels.co.uk/app/admin
   ```

3. **Customer Portal**
   ```
   https://www.glenugiekennels.co.uk/app/my-bookings
   ```

### Test These Features:

- [ ] Can view kennel availability
- [ ] Can make a test booking
- [ ] Can access admin dashboard (use password: `glenugie2024`)
- [ ] Emails are sent (check Resend dashboard)
- [ ] Customer portal works

---

## 🔧 Troubleshooting

### Build Fails with "could not find package.json"
- ✅ Make sure you pushed all files to GitHub
- ✅ Check GitHub repository - you should see `package.json` in the root

### 404 Errors on All Pages
- ✅ Check that **Mount Path** is set to `/app` in Webflow Cloud
- ✅ Verify `webflow.json` has `"mountPath": "/app"`

### Database/KV Errors
- ✅ Make sure KV binding is configured in Webflow Cloud
- ✅ Check KV namespace ID is correct
- ✅ Verify environment variables are set

### Stripe Errors
- ✅ Confirm `STRIPE_SECRET_KEY` is set in Webflow Cloud
- ✅ Use test key (`sk_test_...`) for testing
- ✅ Update webhook URL in Stripe dashboard

### Email Not Sending
- ✅ Verify `RESEND_API_KEY` in Webflow Cloud
- ✅ Check Resend dashboard for API errors
- ✅ Make sure domain is verified in Resend

---

## 🔄 Future Updates

To update your deployed app:

### 1. Make Changes Locally
```bash
# Edit files
# Test locally: npm run dev
```

### 2. Commit and Push
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### 3. Auto-Deploy
Webflow Cloud will automatically deploy the changes!

---

## 📞 Support Resources

- **Webflow Cloud Docs**: https://developers.webflow.com/cloud
- **Astro Docs**: https://docs.astro.build
- **Stripe Docs**: https://stripe.com/docs
- **Resend Docs**: https://resend.com/docs

---

## 🎯 Quick Reference

### Project Structure
```
glenugie-booking/
├── src/
│   ├── pages/           # Routes
│   ├── components/      # React components
│   ├── lib/            # Utilities
│   └── layouts/        # Astro layouts
├── public/             # Static assets
├── generated/          # Webflow styles
├── package.json        # Dependencies
├── astro.config.mjs    # Astro config
├── webflow.json        # Webflow Cloud config
└── wrangler.jsonc      # Cloudflare config
```

### Important Files
- `webflow.json` - Mount path and project ID
- `astro.config.mjs` - Base path configuration
- `package.json` - All dependencies
- `.env` - Local secrets (NEVER commit!)

### Key URLs
- App: `https://www.glenugiekennels.co.uk/app/`
- Admin: `/app/admin`
- Bookings: `/app/my-bookings`
- Kennels: `/app/kennels/[slug]`

---

**Ready to deploy?** Follow the steps above in order! 🚀
