# Cron Job Setup Guide 🕐

## Overview

Your automated emails (day-before reminders and thank you emails) need to run daily at 9:00 AM. Here are your options:

---

## ✅ Option 1: Cloudflare Cron Triggers (RECOMMENDED)

**Best for:** Production deployment on Cloudflare Workers  
**Cost:** FREE (included with Cloudflare Workers)  
**Setup time:** Already done! ✨

### What I've Set Up For You:

1. **Added to `wrangler.jsonc`:**
   ```json
   "triggers": {
     "crons": ["0 9 * * *"]
   }
   ```
   This runs daily at 9:00 AM UTC.

2. **Created `src/scheduled.ts`:**
   - This file runs automatically when the cron triggers
   - Sends day-before reminders
   - Sends thank you/review emails

### How It Works:

When you deploy to Cloudflare:
```bash
npm run build
wrangler deploy
```

Cloudflare automatically:
- ✅ Detects the cron trigger
- ✅ Runs `scheduled.ts` daily at 9 AM UTC
- ✅ Sends your automated emails
- ✅ Logs results in Cloudflare dashboard

### View Cron Logs:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click your worker
4. Go to **Logs** tab
5. Filter by "Cron Triggers"

### Customize Schedule:

Edit `wrangler.jsonc`:

```json
// Every day at 8 AM UTC
"crons": ["0 8 * * *"]

// Twice daily: 9 AM and 5 PM UTC
"crons": ["0 9,17 * * *"]

// Every hour
"crons": ["0 * * * *"]

// Weekdays only at 9 AM
"crons": ["0 9 * * 1-5"]
```

**Cron format:** `minute hour day month dayOfWeek`

### Test It:

```bash
# Deploy to Cloudflare
wrangler deploy

# Trigger manually to test
wrangler tail --format pretty
```

---

## Option 2: GitHub Actions (FREE)

**Best for:** When you use GitHub for version control  
**Cost:** FREE  
**Setup time:** 5 minutes

### Setup Steps:

1. **Create `.github/workflows/send-emails.yml`:**

```yaml
name: Send Daily Emails

on:
  schedule:
    # Runs at 9:00 AM UTC every day
    - cron: '0 9 * * *'
  
  # Allow manual trigger
  workflow_dispatch:

jobs:
  send-emails:
    runs-on: ubuntu-latest
    
    steps:
      - name: Send Scheduled Emails
        run: |
          curl -X POST https://glenugiekennels.co.uk/api/emails/send-scheduled \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
      
      - name: Check Response
        if: failure()
        run: echo "Failed to send emails. Check your API endpoint and CRON_SECRET."
```

2. **Add Secret to GitHub:**
   - Go to your repo → Settings → Secrets → Actions
   - Click "New repository secret"
   - Name: `CRON_SECRET`
   - Value: Your secret from `.env` file

3. **Test It:**
   - Go to Actions tab
   - Click "Send Daily Emails"
   - Click "Run workflow"

### Pros:
- ✅ Free forever
- ✅ Easy to set up
- ✅ Can run manually
- ✅ GitHub sends notifications on failures

### Cons:
- ⚠️ Requires GitHub repository
- ⚠️ Relies on external service

---

## Option 3: Cron-job.org (FREE)

**Best for:** Quick setup without coding  
**Cost:** FREE (up to 50 jobs)  
**Setup time:** 2 minutes

### Setup Steps:

1. **Sign up at [cron-job.org](https://cron-job.org/en/)**

2. **Create New Cron Job:**
   - **Title:** Send Daily Emails - Glenugie Kennels
   - **Address (URL):** `https://glenugiekennels.co.uk/api/emails/send-scheduled`
   - **Schedule:** 
     - Minute: `0`
     - Hour: `9`
     - Day: `*`
     - Month: `*`
     - Weekday: `*`
   - **Request Method:** POST
   - **Headers:** Click "Add header"
     - Name: `Authorization`
     - Value: `Bearer your-cron-secret-here`

3. **Enable and Save**

4. **Test:**
   - Click "Run now" button
   - Check execution history

### Pros:
- ✅ No code required
- ✅ User-friendly interface
- ✅ Email notifications
- ✅ Execution history

### Cons:
- ⚠️ Depends on third-party service
- ⚠️ Limited to 50 jobs on free plan

---

## Option 4: EasyCron (FREE Tier)

**Best for:** Reliable external cron service  
**Cost:** FREE (up to 1 cron job)  
**Setup time:** 3 minutes

### Setup Steps:

1. **Sign up at [easycron.com](https://www.easycron.com/)**

2. **Create Cron Job:**
   - **Cron Expression:** `0 9 * * *`
   - **URL:** `https://glenugiekennels.co.uk/api/emails/send-scheduled`
   - **Method:** POST
   - **Custom Header:**
     ```
     Authorization: Bearer your-cron-secret
     ```

3. **Enable notifications** (email alerts on failures)

4. **Test execution**

### Pros:
- ✅ Very reliable
- ✅ Email notifications
- ✅ Detailed logs

### Cons:
- ⚠️ Free plan limited to 1 job
- ⚠️ External dependency

---

## Comparison Table

| Feature | Cloudflare | GitHub Actions | Cron-job.org | EasyCron |
|---------|------------|----------------|--------------|----------|
| **Cost** | FREE ✅ | FREE ✅ | FREE ✅ | FREE ✅ |
| **Reliability** | Excellent | Good | Good | Excellent |
| **Setup** | Auto (done) | 5 min | 2 min | 3 min |
| **Logs** | Dashboard | Actions tab | Website | Website |
| **Notifications** | No | Yes | Yes | Yes |
| **Dependencies** | None | GitHub | External | External |

---

## ⭐ My Recommendation

**Use Cloudflare Cron Triggers** because:
1. ✅ Already configured (I did it for you!)
2. ✅ Runs automatically when you deploy
3. ✅ No external dependencies
4. ✅ Free and reliable
5. ✅ Integrated with your hosting

**Backup option:** Set up GitHub Actions as well for redundancy.

---

## Testing Your Cron Job

### Test Manually (All Options)

You can trigger the email endpoint manually to test:

```bash
# Test locally (development)
curl -X POST http://localhost:4321/api/emails/send-scheduled \
  -H "Authorization: Bearer your-cron-secret"

# Test production
curl -X POST https://glenugiekennels.co.uk/api/emails/send-scheduled \
  -H "Authorization: Bearer your-cron-secret"
```

### What You Should See:

**Success Response:**
```json
{
  "success": true,
  "message": "Scheduled emails processed"
}
```

**Console Logs:**
```
📧 Sending 2 day-before reminder emails
✅ Email sent successfully
📧 Sending 1 thank you/review emails
✅ Email sent successfully
```

---

## Monitoring

### Check if Cron is Running

**Cloudflare:**
- Dashboard → Workers → Logs → Filter "scheduled"

**GitHub Actions:**
- Repo → Actions tab → "Send Daily Emails"

**Cron-job.org:**
- Dashboard → Execution History

### What to Monitor:

- ✅ Daily execution at correct time
- ✅ Successful email sends
- ✅ No errors in logs
- ✅ Customers receiving emails

---

## Troubleshooting

### Cron Not Running

**Check 1:** Is cron configured?
```bash
# For Cloudflare
cat wrangler.jsonc | grep crons
```

**Check 2:** Is CRON_SECRET correct?
```bash
# Test endpoint manually
curl -X POST https://your-domain.com/api/emails/send-scheduled \
  -H "Authorization: Bearer wrong-secret"
# Should return 401 Unauthorized
```

**Check 3:** Check logs
- Cloudflare: Dashboard → Workers → Logs
- GitHub: Actions → Workflow runs
- Cron-job.org: Execution history

### Emails Not Sending

**Check 1:** RESEND_API_KEY configured?
```bash
echo $RESEND_API_KEY
```

**Check 2:** Test email endpoint directly
```typescript
// In your code
import { sendEmail, dayBeforeReminderEmail } from './lib/email';
const email = dayBeforeReminderEmail(testBooking);
await sendEmail(email);
```

**Check 3:** Resend dashboard
- Go to [resend.com/emails](https://resend.com/emails)
- Check for sent/failed emails

---

## Time Zone Notes

**Important:** All cron jobs run in **UTC time**.

- **9 AM UTC** = 9 AM in UK (winter)
- **9 AM UTC** = 10 AM in UK (summer, BST)

To adjust for UK time:
```json
// 8 AM UTC = 9 AM BST
"crons": ["0 8 * * *"]
```

---

## Advanced Configuration

### Multiple Schedules

```json
"triggers": {
  "crons": [
    "0 9 * * *",   // 9 AM daily
    "0 17 * * *"   // 5 PM daily
  ]
}
```

### Different Times for Different Emails

Modify `src/scheduled.ts`:

```typescript
export default {
  async scheduled(controller: ScheduledController, env: any, ctx: any) {
    const hour = new Date().getUTCHours();
    
    if (hour === 9) {
      // Morning: Send day-before reminders
      await sendDailyReminders(allBookings);
    }
    
    if (hour === 17) {
      // Evening: Send thank you emails
      await sendDailyThankYous(allBookings);
    }
  }
};
```

---

## Quick Start Checklist

Using **Cloudflare Cron Triggers** (Recommended):

- [x] `wrangler.jsonc` updated with cron trigger ✅
- [x] `src/scheduled.ts` created ✅
- [ ] Deploy to Cloudflare: `wrangler deploy`
- [ ] Check Cloudflare dashboard logs
- [ ] Wait for first scheduled run (9 AM UTC tomorrow)
- [ ] Verify emails sent in Resend dashboard

Using **GitHub Actions**:

- [ ] Create `.github/workflows/send-emails.yml`
- [ ] Add `CRON_SECRET` to GitHub secrets
- [ ] Test with "Run workflow" button
- [ ] Check Actions tab for execution

Using **Cron-job.org**:

- [ ] Sign up at cron-job.org
- [ ] Create cron job with endpoint URL
- [ ] Add Authorization header
- [ ] Test with "Run now"
- [ ] Check execution history

---

## Support

### Cloudflare Cron Issues
- [Cloudflare Cron Triggers Docs](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- Check Worker logs in dashboard
- Test with `wrangler tail`

### GitHub Actions Issues
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- Check workflow runs
- Review action logs

### Email Issues
- See `EMAIL_COMPLETE_GUIDE.md`
- Check Resend dashboard
- Review API endpoint

---

**You're all set!** 🎉

Your cron job is configured and ready to send automated emails daily at 9 AM UTC!
