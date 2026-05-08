# Deploy with Email Support

## Issues Fixed
1. ✅ **Deposit not saving** - Now correctly saves £20 deposit as `paidAmount`
2. ✅ **Emails not sending** - Now passes runtime env to email function

## Before Deploying

You need to add the RESEND_API_KEY as a Cloudflare secret:

```bash
# Add the secret to Cloudflare
npx wrangler secret put RESEND_API_KEY
# When prompted, paste: re_XG4nJxi5_CvPgnfxHQH5XtGMJPexDVRFN
```

## Deploy to Staging

```bash
git add -A
git commit -m "Fix deposit saving and email sending"
git push origin staging

# Build and deploy
npm run build
npx wrangler deploy
```

## Test on Staging

1. Make a test booking
2. Check that:
   - ✅ Deposit shows as £20 in admin dashboard
   - ✅ `paidAmount` = 20
   - ✅ `totalDue` = totalPrice - 20
   - ✅ Customer receives confirmation email
   - ✅ Admin receives notification email

## Deploy to Production

Once staging is confirmed working:

```bash
git checkout main
git merge staging
git push origin main

# Deploy to production
npm run build
npx wrangler deploy --env production
```

## Troubleshooting Emails

If emails still don't send:

1. **Check Resend API Key is set:**
   ```bash
   npx wrangler secret list
   ```
   Should show `RESEND_API_KEY`

2. **Check email logs in Cloudflare:**
   - Go to Cloudflare Dashboard
   - Workers & Pages → Your app → Logs
   - Look for "Email sent successfully" or error messages

3. **Verify sender domain:**
   - Resend requires verified domain: `bookings@glenugiekennels.co.uk`
   - Check Resend dashboard: https://resend.com/domains

## Email Flow

When a booking is created:
1. Customer receives: **Booking Confirmation** email
2. Admin receives: **New Booking Notification** email

Both emails include:
- Booking details
- Pet information
- Payment summary (with correct deposit amount)
- Check-in/out times
