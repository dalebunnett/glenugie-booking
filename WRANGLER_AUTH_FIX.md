# 🔐 Wrangler Authentication Fix

## Problem
OAuth browser window failed to open during `wrangler login`.

---

## Solution 1: Manual Browser Authentication (Recommended)

### Step 1: Copy the OAuth URL
Copy this URL from your terminal output:
```
https://dash.cloudflare.com/oauth2/auth?response_type=code&client_id=54d11594-84e4-41aa-b438-e81b8fa78ee7&redirect_uri=http%3A%2F%2Flocalhost%3A8976%2Foauth%2Fcallback&scope=account%3Aread%20user%3Aread%20workers%3Awrite%20workers_kv%3Awrite%20workers_routes%3Awrite%20workers_scripts%3Awrite%20workers_tail%3Aread%20d1%3Awrite%20pages%3Awrite%20zone%3Aread%20ssl_certs%3Awrite%20ai%3Awrite%20queues%3Awrite%20pipelines%3Awrite%20secrets_store%3Awrite%20containers%3Awrite%20cloudchamber%3Awrite%20offline_access&state=aBg-mGjN_3yz3Vf7uekLIKVV39YV16v.&code_challenge=-PkENGu8_QVbmJlohc-cklFRCQxRt--m-BxqmeoUWD4&code_challenge_method=S256
```

### Step 2: Open in Browser
1. **Manually paste** the URL into your browser
2. **Login** to Cloudflare if prompted
3. **Authorize** Wrangler access
4. Browser will redirect to `localhost:8976` (this is normal)
5. Wrangler will detect the authorization

### Step 3: Wait for Confirmation
Terminal should show:
```
Successfully logged in.
```

---

## Solution 2: Use API Token (Alternative)

If OAuth doesn't work, use an API token instead:

### Step 1: Create API Token
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"**
4. Or create custom token with these permissions:
   - Account: Workers Scripts (Edit)
   - Account: Workers KV Storage (Edit)
   - Zone: Workers Routes (Edit)
5. Click **"Continue to summary"**
6. Click **"Create Token"**
7. **Copy the token** (you won't see it again!)

### Step 2: Set Environment Variable

**On macOS/Linux:**
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

**On Windows (PowerShell):**
```powershell
$env:CLOUDFLARE_API_TOKEN="your-token-here"
```

**On Windows (CMD):**
```cmd
set CLOUDFLARE_API_TOKEN=your-token-here
```

### Step 3: Deploy
```bash
npx wrangler deploy
```

Wrangler will use the API token instead of OAuth.

---

## Solution 3: Save Token to Config

### Step 1: Create Token (same as Solution 2)

### Step 2: Save to Wrangler Config
```bash
# Set the token
npx wrangler config set api_token "your-token-here"
```

Or manually edit `~/.wrangler/config/default.toml`:
```toml
api_token = "your-token-here"
```

### Step 3: Deploy
```bash
npx wrangler deploy
```

---

## Verify Authentication

After authenticating, verify it worked:

```bash
# Check who you're logged in as
npx wrangler whoami
```

Should show:
```
 ⛅️ wrangler 4.90.0
──────────────────
Getting User settings...
👋 You are logged in with an OAuth Token, associated with the email 'your-email@example.com'!
┌──────────────────────────┬──────────────────────────────────┐
│ Account Name             │ Account ID                       │
├──────────────────────────┼──────────────────────────────────┤
│ Your Account             │ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx │
└──────────────────────────┴──────────────────────────────────┘
```

---

## Now Deploy!

Once authenticated:

```bash
# Build and deploy
npm run build && npx wrangler deploy
```

---

## Troubleshooting

### Issue: "Failed to open browser"
**Solution**: Manually copy and paste the OAuth URL into your browser

### Issue: "localhost:8976 refused to connect"
**Solution**: This is normal! The redirect happens automatically. Just wait for Wrangler to detect it.

### Issue: "Invalid token"
**Solution**: 
1. Create a new API token
2. Make sure it has Workers permissions
3. Set it again with `export CLOUDFLARE_API_TOKEN="new-token"`

### Issue: "Account not found"
**Solution**: Make sure you're logging into the correct Cloudflare account that has the Workers project

---

## Quick Reference

**OAuth Login:**
```bash
npx wrangler login
# Then manually open the URL in browser
```

**API Token:**
```bash
export CLOUDFLARE_API_TOKEN="your-token"
npx wrangler deploy
```

**Check Auth:**
```bash
npx wrangler whoami
```

**Deploy:**
```bash
npm run build && npx wrangler deploy
```

---

## After Authentication

Once you're authenticated, proceed with deployment:

1. ✅ Authentication complete
2. 🔨 Build: `npm run build`
3. 🚀 Deploy: `npx wrangler deploy`
4. ✅ Verify: `curl https://your-app.workers.dev/BUILD_VERSION.txt`

---

**Choose the solution that works best for you and proceed with deployment!** 🚀
