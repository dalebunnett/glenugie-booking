# 🚀 Deploy Current Local Version to Production

## Quick Deploy Steps

### 1. Build Your Site
```bash
npm run build
```

### 2. Deploy to Production

**Via Webflow (Recommended):**
1. The build created a `dist/` folder
2. Webflow will automatically detect and deploy this when you:
   - Open your site in Webflow
   - Go to the Apps panel
   - Click "Publish" or "Deploy to Production"

**Via Wrangler CLI (Alternative):**
```bash
npx wrangler deploy
```

### 3. After Deployment - Initialize Production Data

Visit these URLs in your production site:

1. **Initialize KV Storage:**
   ```
   https://your-production-url/api/admin/init-kv
   ```

2. **Initialize Booking Data:**
   ```
   https://your-production-url/api/admin/init-data
   ```

3. **Test Admin Access:**
   ```
   https://your-production-url/admin
   ```

### 4. Set Environment Variables (If Not Already Set)

In Webflow App Settings or Cloudflare Dashboard:
- `ADMIN_PASSWORD` - Your admin password
- `SESSION_SECRET` - Random 32+ character string
- `RESEND_API_KEY` - For emails (optional)

## That's It! 🎉

Your local changes are now in production.

## Quick Test Checklist
- [ ] Homepage loads
- [ ] Booking form works
- [ ] Admin dashboard accessible
- [ ] My Bookings page works
