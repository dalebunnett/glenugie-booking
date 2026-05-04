# Deployment Guide

Complete guide for deploying the Glenugie Kennels booking system to production.

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All TypeScript errors resolved (`npm run astro check`)
- [ ] Test booking flow works locally
- [ ] Admin dashboard accessible and functional
- [ ] All pages load without errors
- [ ] Mobile responsiveness verified

### 2. Environment Setup
- [ ] Stripe live API keys obtained
- [ ] Webhook endpoint planned
- [ ] Email service account created
- [ ] Domain/subdomain decided
- [ ] SSL certificate ready (auto via Cloudflare)

### 3. Database Decision
- [ ] Database provider chosen
- [ ] Schema planned
- [ ] Migration script ready
- [ ] Backup strategy defined

## Deployment Options

### Option 1: Cloudflare Workers (Recommended)

Webflow Cloud apps run on Cloudflare Workers by default.

#### Step 1: Prepare Database

**Using Cloudflare D1:**
```bash
# Create D1 database
npx wrangler d1 create glenugie-kennels

# Note the database ID and add to wrangler.jsonc
```

Update `wrangler.jsonc`:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "glenugie-kennels",
      "database_id": "your-database-id-here"
    }
  ]
}
```

**Using External Database:**
Add connection string to environment variables.

#### Step 2: Update Database Code

Replace `src/lib/db.ts` with your database implementation:

```typescript
// Example for D1
export const db = {
  bookings: {
    async getAll(env: any) {
      const result = await env.DB.prepare(
        'SELECT * FROM bookings ORDER BY createdAt DESC'
      ).all();
      return result.results;
    },
    // ... other methods
  }
};
```

#### Step 3: Set Environment Variables

In Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - Email service keys

Or via CLI:
```bash
npx wrangler secret put STRIPE_SECRET_KEY
# Enter value when prompted
```

#### Step 4: Deploy

```bash
# Build the project
npm run build

# Deploy to Cloudflare
npx wrangler deploy
```

### Option 2: Vercel

If deploying to Vercel instead:

#### Step 1: Install Vercel Adapter
```bash
npm uninstall @astrojs/cloudflare
npm install @astrojs/vercel
```

#### Step 2: Update astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel()
});
```

#### Step 3: Deploy
```bash
npx vercel
```

### Option 3: Netlify

#### Step 1: Install Netlify Adapter
```bash
npm uninstall @astrojs/cloudflare
npm install @astrojs/netlify
```

#### Step 2: Update astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify()
});
```

#### Step 3: Deploy
```bash
npx netlify deploy --prod
```

## Database Migration

### Create Tables

**SQL Schema (for PostgreSQL/D1):**
```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  accommodation_type TEXT NOT NULL,
  specific_suite TEXT,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  number_of_nights INTEGER NOT NULL,
  total_price REAL NOT NULL,
  deposit_amount REAL NOT NULL,
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  special_requests TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE pets (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT NOT NULL,
  age INTEGER NOT NULL,
  special_requirements TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_checkin ON bookings(check_in);
```

### Migrate Existing Data
```bash
# Export from development
node scripts/export-data.js > bookings.json

# Import to production
node scripts/import-data.js bookings.json
```

## Email Service Setup

### SendGrid Setup

1. Create account at https://sendgrid.com
2. Verify sender email
3. Create API key
4. Add to environment:
```bash
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=bookings@glenugiekennels.co.uk
```

5. Update `src/pages/api/contact.ts`:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: data.email,
  from: process.env.EMAIL_FROM,
  subject: 'Booking Confirmation',
  html: '<strong>Thank you for your booking!</strong>'
});
```

### Resend Setup (Alternative)

1. Create account at https://resend.com
2. Verify domain
3. Create API key
4. Add to environment:
```bash
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=bookings@glenugiekennels.co.uk
```

## Stripe Webhook Configuration

### Step 1: Create Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `charge.refunded`

### Step 2: Add Secret

Copy the webhook signing secret and add to environment:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Step 3: Test Webhook

```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

## Admin Authentication

Add authentication before going live!

### Option 1: Simple Password (Quick)

```typescript
// src/middleware.ts
export function onRequest({ request, redirect }, next) {
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/admin')) {
    const auth = request.headers.get('authorization');
    
    if (auth !== 'Basic ' + btoa('admin:your-password')) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic' }
      });
    }
  }
  
  return next();
}
```

### Option 2: Auth.js (Recommended)

```bash
npm install @auth/core @auth/astro
```

```typescript
// auth.config.ts
import { defineConfig } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';

export default defineConfig({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Verify against database
        if (credentials.username === 'admin' && 
            credentials.password === process.env.ADMIN_PASSWORD) {
          return { id: '1', name: 'Admin' };
        }
        return null;
      }
    })
  ]
});
```

## SSL/HTTPS

Cloudflare provides SSL automatically. For custom domains:

1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Full (Strict)" SSL mode
4. Enable "Always Use HTTPS"

## Performance Optimization

### Step 1: Enable Caching
```typescript
// astro.config.mjs
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react': ['react', 'react-dom'],
            'ui': ['@radix-ui/react-dialog', /* other UI deps */]
          }
        }
      }
    }
  }
});
```

### Step 2: Image Optimization
Already configured via Astro.

### Step 3: Add Analytics
```html
<!-- Google Analytics in layouts/main.astro -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXX"></script>
```

## Monitoring

### Error Tracking - Sentry

```bash
npm install @sentry/astro
```

```typescript
// astro.config.mjs
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [
    sentry({
      dsn: 'your-sentry-dsn',
      environment: 'production'
    })
  ]
});
```

### Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

## Backup Strategy

### Database Backups

**D1:**
```bash
# Automated via Cloudflare
# Manual export
wrangler d1 export glenugie-kennels --output=backup.sql
```

**PostgreSQL:**
```bash
# Daily cron job
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Code Backups
- Git repository (GitHub/GitLab)
- Automated deployments
- Version tags for releases

## Testing in Production

### Test Checklist
1. [ ] Homepage loads
2. [ ] All navigation links work
3. [ ] Booking form submits
4. [ ] Stripe payment completes
5. [ ] Admin login works
6. [ ] Bookings appear in admin
7. [ ] Calendar displays correctly
8. [ ] Mobile view functional
9. [ ] Emails send correctly
10. [ ] Webhook receives events

### Test Booking

Use Stripe test mode in production initially:
```env
STRIPE_SECRET_KEY=sk_test_xxx  # Start with test
```

Then switch to live when ready:
```env
STRIPE_SECRET_KEY=sk_live_xxx  # Production
```

## Go-Live Checklist

- [ ] Database migrated and tested
- [ ] All environment variables set
- [ ] Admin authentication enabled
- [ ] Email service configured and tested
- [ ] Stripe live keys activated
- [ ] Webhook endpoint verified
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Error monitoring enabled
- [ ] Backup system running
- [ ] Test booking completed successfully
- [ ] Mobile devices tested
- [ ] Support email/phone updated
- [ ] Terms & conditions reviewed
- [ ] Privacy policy added (if required)
- [ ] Cookie consent (if required by region)

## Post-Launch

### Week 1
- [ ] Monitor error logs daily
- [ ] Check booking flow
- [ ] Verify email delivery
- [ ] Test admin dashboard
- [ ] Review payment processing

### Ongoing
- [ ] Weekly database backups
- [ ] Monthly security updates
- [ ] Quarterly review of T&Cs
- [ ] Monitor Stripe dashboard
- [ ] Review customer feedback

## Rollback Plan

If issues occur:

1. **Code Issues**: Revert to previous deployment
```bash
wrangler rollback
```

2. **Database Issues**: Restore from backup
```bash
wrangler d1 restore glenugie-kennels --file=backup.sql
```

3. **Payment Issues**: Switch back to test mode

## Support Contacts

- **Stripe**: https://support.stripe.com
- **Cloudflare**: https://support.cloudflare.com
- **Email Service**: Check provider docs
- **Domain Registrar**: Your provider

## Cost Estimates

### Cloudflare Workers
- Free tier: 100,000 requests/day
- Paid: $5/month for 10M requests

### Database
- D1: Free tier 5GB
- PostgreSQL: $7-25/month (Railway, Supabase)

### Email
- SendGrid: Free 100 emails/day, $20/month for 40K
- Resend: Free 3,000/month, $20/month for 50K

### Stripe
- 1.5% + 20p per UK card transaction
- No monthly fees

**Total Estimated**: £15-50/month depending on volume

---

**Ready to Deploy?** Follow this guide step-by-step and you'll be live in no time! 🚀
