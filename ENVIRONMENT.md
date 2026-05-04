

# Environment Variables Guide

This document explains all environment variables used in the Glenugie Kennels booking system.

## Required Variables

### Stripe (Payment Processing)

```env
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

For **development**, use test keys (prefix `sk_test_` and `pk_test_`)  
For **production**, use live keys (prefix `sk_live_` and `pk_live_`)

## Optional Variables

### Stripe Webhooks (Production Only)

```env
# Get from: https://dashboard.stripe.com/webhooks
# After creating a webhook endpoint
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Setup Steps:**
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`
4. Copy the webhook secret

### Email Service (For Notifications)

Choose ONE of these email providers:

#### SendGrid
```env
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@glenugiekennels.co.uk
```

#### Resend
```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@glenugiekennels.co.uk
```

#### AWS SES
```env
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=eu-west-1
EMAIL_FROM=noreply@glenugiekennels.co.uk
```

## Webflow (Pre-configured)

These are automatically set by Webflow Cloud:

```env
WEBFLOW_API_HOST=<auto-configured>
WEBFLOW_SITE_API_TOKEN=<auto-configured>
WEBFLOW_CMS_SITE_API_TOKEN=<auto-configured>
```

## Local Development

Create a `.env` file in the project root:

```env
# Stripe (required)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Email (optional - for local testing)
# SENDGRID_API_KEY=your_key_here
# EMAIL_FROM=test@example.com
```

## Cloudflare Workers Deployment

Set variables in the Cloudflare Dashboard:

1. Go to your Workers & Pages project
2. Navigate to Settings → Environment Variables
3. Add the required variables
4. Deploy your application

### Via Wrangler CLI

```bash
# Set a secret
npx wrangler secret put STRIPE_SECRET_KEY

# List secrets
npx wrangler secret list
```

## Security Best Practices

### ❌ Never Do This
- Commit `.env` to git
- Hardcode API keys in source code
- Share API keys in chat/email
- Use production keys in development

### ✅ Always Do This
- Use test keys for development
- Rotate keys if exposed
- Use different keys per environment
- Store in secure secret managers

## Environment-Specific Configuration

### Development
```env
# Use test/sandbox keys
STRIPE_SECRET_KEY=sk_test_...
NODE_ENV=development
```

### Staging
```env
# Still use test keys
STRIPE_SECRET_KEY=sk_test_...
NODE_ENV=staging
```

### Production
```env
# Use live keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_FROM=bookings@glenugiekennels.co.uk
NODE_ENV=production
```

## Accessing Variables in Code

### Server-Side (API Routes)
```typescript
// Cloudflare Workers (production)
const apiKey = locals?.runtime?.env?.STRIPE_SECRET_KEY;

// Local development
const apiKey = import.meta.env.STRIPE_SECRET_KEY;

// Best practice: fallback
const apiKey = locals?.runtime?.env?.STRIPE_SECRET_KEY || 
               import.meta.env.STRIPE_SECRET_KEY;
```

### ⚠️ Never in Client-Side Code
Public keys (like `STRIPE_PUBLISHABLE_KEY`) are safe to use client-side, but **never** expose secret keys in client components or browser code.

## Troubleshooting

### "Payment system not configured"
- Check `STRIPE_SECRET_KEY` is set correctly
- Verify the key starts with `sk_test_` or `sk_live_`
- Restart the dev server after adding variables

### "Webhook signature verification failed"
- Check `STRIPE_WEBHOOK_SECRET` is set
- Verify the secret matches your Stripe webhook configuration
- Ensure webhook URL is correct in Stripe dashboard

### "Email not sending"
- Check email service API key is set
- Verify `EMAIL_FROM` is a verified sender address
- Check service-specific requirements (SPF, DKIM, etc.)

## Variable Checklist

Before deploying to production:

- [ ] `STRIPE_SECRET_KEY` set to live key (starts with `sk_live_`)
- [ ] `STRIPE_PUBLISHABLE_KEY` set to live key (starts with `pk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` configured with production webhook
- [ ] Email service API key configured
- [ ] `EMAIL_FROM` using verified domain email
- [ ] Test a booking end-to-end
- [ ] Test webhook delivery
- [ ] Test email notifications

## Support

If you need help configuring environment variables:

- **Stripe**: https://stripe.com/docs/keys
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/configuration/environment-variables/
- **SendGrid**: https://docs.sendgrid.com/ui/account-and-settings/api-keys
- **Resend**: https://resend.com/docs/dashboard/api-keys/introduction

### `EMAIL_SERVICE`
**Required for:** Email Notifications  
**Type:** String  
**Options:** `sendgrid`, `resend`, `ses`, or custom  
**Example:** `sendgrid`

The email service provider to use for sending booking confirmations.

**Optional:** System will work without email configured (emails will be logged to console)

### `EMAIL_API_KEY`
**Required for:** Email Notifications  
**Type:** String  
**Example:** `SG.xxxxx...` (SendGrid) or service-specific API key

API key for your chosen email service provider.

**Optional:** System will work without email configured

### `ADMIN_EMAIL`
**Required for:** Email Notifications  
**Type:** String  
**Example:** `admin@glenugie-kennels.co.uk`

Email address to receive admin notifications for new bookings.

**Optional:** Defaults to `admin@glenugie-kennels.co.uk`

### `ADMIN_PASSWORD`
**Required for:** Admin Dashboard Access  
**Type:** String  
**Example:** `admin123`

Password to access the admin dashboard at `/admin`.

**Default:** `admin123` (if not set)

**Important:** Change this in production! Set a strong password for security.


