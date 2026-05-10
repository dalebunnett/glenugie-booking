# ✅ Pre-Deployment Checklist

Use this checklist to ensure everything is ready for production deployment.

---

## 1. Environment Setup

### Cloudflare Account
- [ ] Cloudflare account created
- [ ] Wrangler CLI installed (`npm install -g wrangler`)
- [ ] Logged in to Cloudflare (`wrangler login`)
- [ ] Workers plan active (Free tier is fine to start)

### KV Namespace
- [ ] Production KV namespace created
- [ ] KV namespace ID added to `wrangler.jsonc`
- [ ] KV namespace bound to worker

---

## 2. Environment Variables

### Required Variables
- [ ] `ADMIN_USERNAME` - Your admin username
- [ ] `ADMIN_PASSWORD` - Strong, secure password
- [ ] `RESEND_API_KEY` - From resend.com
- [ ] `RESEND_FROM_EMAIL` - Verified sender email

### Optional Variables
- [ ] `STRIPE_SECRET_KEY` - If using payments
- [ ] `STRIPE_PUBLISHABLE_KEY` - If using payments
- [ ] `STRIPE_WEBHOOK_SECRET` - If using payments
- [ ] `WEBFLOW_CMS_SITE_API_TOKEN` - If using CMS
- [ ] `WEBFLOW_API_HOST` - If using CMS

### Where to Add
- [ ] Variables added to `.env` file (for local testing)
- [ ] Variables added to Cloudflare Dashboard (for production)
  - Dashboard → Workers & Pages → Your Worker → Settings → Variables

---

## 3. Email Configuration

### Resend Setup
- [ ] Resend account created (resend.com)
- [ ] Domain verified in Resend
- [ ] Sender email verified
- [ ] API key generated
- [ ] Test email sent successfully

### Email Templates
- [ ] Booking confirmation template working
- [ ] Booking cancellation template working
- [ ] Admin notification template working

---

## 4. Data Preparation

### Rates Configuration
- [ ] Luxury suite rates defined
- [ ] Standard kennel rates defined
- [ ] Cattery suite rates defined
- [ ] Additional pet rates defined
- [ ] Seasonal rates configured (if applicable)

### Booking Rules
- [ ] Minimum stay requirements set
- [ ] Maximum stay limits set
- [ ] Blackout dates configured
- [ ] Check-in/check-out times defined
- [ ] Cancellation policy defined

### Existing Bookings
- [ ] Existing bookings exported to JSON
- [ ] Booking data validated
- [ ] Date formats correct (YYYY-MM-DD)
- [ ] Kennel numbers valid
- [ ] Customer information complete

---

## 5. Testing (Staging)

### Basic Functionality
- [ ] Admin login works
- [ ] Bookings can be created
- [ ] Bookings save to storage
- [ ] Bookings display in admin
- [ ] Calendar shows correct availability

### Booking Flow
- [ ] Date selection works
- [ ] Kennel type selection works
- [ ] Pet information form works
- [ ] Booking confirmation displays
- [ ] Email confirmation sent

### Customer Portal
- [ ] Can access bookings by email
- [ ] Can view booking details
- [ ] Can edit bookings
- [ ] Can cancel bookings
- [ ] Changes reflect in admin

### Admin Dashboard
- [ ] All bookings display
- [ ] Calendar view works
- [ ] Can create manual bookings
- [ ] Can edit bookings
- [ ] Can delete bookings
- [ ] Rates management works
- [ ] Rules management works
- [ ] Import functionality works

---

## 6. Code Review

### Configuration Files
- [ ] `wrangler.jsonc` configured correctly
- [ ] `astro.config.mjs` has correct settings
- [ ] `.env.example` created for reference
- [ ] `.gitignore` includes sensitive files

### Storage System
- [ ] File storage implementation complete
- [ ] KV storage fallback working
- [ ] Data persistence verified
- [ ] Backup strategy defined

### Security
- [ ] Admin routes protected
- [ ] API endpoints secured
- [ ] Input validation in place
- [ ] XSS protection implemented
- [ ] CSRF protection (if needed)

---

## 7. Documentation

### User Documentation
- [ ] Admin guide created
- [ ] Customer portal guide created
- [ ] Booking process documented
- [ ] FAQ prepared

### Technical Documentation
- [ ] Deployment guide complete
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide created

---

## 8. Backup & Recovery

### Backup Plan
- [ ] KV backup script created
- [ ] Backup schedule defined
- [ ] Backup storage location set
- [ ] Recovery procedure documented

### Data Export
- [ ] Can export all bookings
- [ ] Can export rates
- [ ] Can export rules
- [ ] Export format documented

---

## 9. Monitoring & Alerts

### Logging
- [ ] Error logging configured
- [ ] Access to Cloudflare logs
- [ ] Log retention policy set

### Monitoring
- [ ] Uptime monitoring set up (optional)
- [ ] Error rate monitoring
- [ ] Performance monitoring

### Alerts
- [ ] Email alerts for critical errors (optional)
- [ ] Booking notification system working

---

## 10. Performance

### Optimization
- [ ] Images optimized
- [ ] CSS minified
- [ ] JavaScript bundled
- [ ] Caching configured

### Load Testing
- [ ] Tested with multiple concurrent bookings
- [ ] Calendar performance verified
- [ ] Admin dashboard responsive

---

## 11. Legal & Compliance

### Privacy
- [ ] Privacy policy created
- [ ] Cookie policy (if needed)
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy

### Terms
- [ ] Terms of service created
- [ ] Cancellation policy defined
- [ ] Refund policy defined

---

## 12. Final Checks

### Pre-Launch
- [ ] All features tested end-to-end
- [ ] No console errors
- [ ] No broken links
- [ ] Mobile responsive
- [ ] Cross-browser tested

### Launch Day
- [ ] Staging data cleared (if needed)
- [ ] Production data initialized
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate active
- [ ] Monitoring active

### Post-Launch
- [ ] Test booking created
- [ ] Email notifications working
- [ ] Admin access verified
- [ ] Customer portal tested
- [ ] Backup completed

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Create KV namespace
wrangler kv:namespace create "GLENUGIE_KV"

# 3. Update wrangler.jsonc with KV ID

# 4. Build application
npm run build

# 5. Deploy to production
wrangler deploy

# 6. Initialize data
# Visit: https://your-domain.com/init-staging-data

# 7. Configure admin
# Visit: https://your-domain.com/admin
```

---

## Deployment Readiness Score

Count your checkmarks:

- **90-100%** ✅ Ready to deploy!
- **75-89%** ⚠️ Almost ready, complete remaining items
- **60-74%** ⚠️ More work needed before deployment
- **Below 60%** ❌ Not ready, review all sections

---

## Support Resources

- **Deployment Guide:** `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Admin Guide:** `ADMIN_COMPLETE.md`
- **Customer Portal:** `CUSTOMER_PORTAL_GUIDE.md`
- **Storage Guide:** `FILE_STORAGE_GUIDE.md`
- **Email Setup:** `EMAIL_COMPLETE_GUIDE.md`

---

**Once all items are checked, you're ready to deploy! 🚀**
