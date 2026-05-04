# 📧 Email Flow Diagram

## Complete Email Automation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BOOKING PROCESS                              │
└─────────────────────────────────────────────────────────────────────┘

Customer fills booking form
         │
         ▼
┌────────────────────┐
│ Submit Booking     │
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Save to Database   │
└────────────────────┘
         │
         ├──────────────────────────────────────────┐
         ▼                                          ▼
┌─────────────────────────┐              ┌──────────────────────┐
│ Email 1: Confirmation   │              │ Email 2: Admin       │
│ TO: Customer            │              │ TO: Admin            │
│ WHEN: Immediate         │              │ WHEN: Immediate      │
│                         │              │                      │
│ ✓ Booking reference     │              │ ✓ Customer details   │
│ ✓ Check-in/out dates    │              │ ✓ All pet info       │
│ ✓ Pet details           │              │ ✓ Payment status     │
│ ✓ Payment summary       │              │ ✓ Special requests   │
│ ✓ Important times       │              │ ✓ Dashboard link     │
└─────────────────────────┘              └──────────────────────┘
         │
         ▼
┌────────────────────┐
│ Redirect to Stripe │
└────────────────────┘
         │
         ▼


┌─────────────────────────────────────────────────────────────────────┐
│                         PAYMENT PROCESS                              │
└─────────────────────────────────────────────────────────────────────┘

Customer completes payment
         │
         ▼
┌──────────────────────┐
│ Stripe Processes     │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ Webhook Triggered    │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ Update Booking       │
│ Status: Confirmed    │
└──────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Email 3: Payment Alert  │
│ TO: Admin               │
│ WHEN: Immediate         │
│                         │
│ ✓ Payment amount        │
│ ✓ Booking reference     │
│ ✓ Customer name         │
│ ✓ Stripe payment ID     │
│ ✓ Balance remaining     │
└─────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      SCHEDULED EMAILS (DAILY CRON)                   │
└─────────────────────────────────────────────────────────────────────┘

Every day at 9:00 AM UTC
         │
         ├─────────────────────────────┬──────────────────────────────┐
         ▼                             ▼                              ▼
┌────────────────────┐    ┌────────────────────┐      ┌────────────────────┐
│ Get All Bookings   │    │ Filter Bookings    │      │ Filter Bookings    │
└────────────────────┘    └────────────────────┘      └────────────────────┘
                                   │                            │
                                   ▼                            ▼
                          Check-in = Tomorrow           Check-out = Yesterday
                                   │                            │
                                   ▼                            ▼
                    ┌──────────────────────────┐   ┌──────────────────────────┐
                    │ Email 4: Day Before      │   │ Email 5: Thank You       │
                    │ TO: Customer             │   │ TO: Customer             │
                    │ WHEN: 9 AM, -1 day       │   │ WHEN: 9 AM, +1 day       │
                    │                          │   │                          │
                    │ ✓ Reminder message       │   │ ✓ Thank you message      │
                    │ ✓ Booking details        │   │ ✓ Stay summary           │
                    │ ✓ Check-in time          │   │ ✓ **GOOGLE REVIEW**     │
                    │ ✓ What to bring          │   │ ✓ Book again CTA         │
                    │ ✓ Balance due            │   │ ✓ Customer portal link   │
                    │ ✓ Contact info           │   │                          │
                    └──────────────────────────┘   └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                           TIMELINE VIEW                              │
└─────────────────────────────────────────────────────────────────────┘

Day -7    Day -1       Day 0        Day 7       Day 8
  │         │           │            │           │
  │         │           │            │           │
  ▼         ▼           ▼            ▼           ▼
┌────┐   ┌────┐      ┌────┐       ┌────┐     ┌────┐
│Book│   │Day │      │Check       │Check│     │Thank│
│    │   │Before│    │In  │       │Out  │     │You  │
│    │   │      │    │    │       │     │     │     │
└────┘   └────┘      └────┘       └────┘     └────┘

Emails:
  1,2       4                                    5
  ↓         ↓                                    ↓
Conf +    Reminder                            Review
Admin                                         Request


┌─────────────────────────────────────────────────────────────────────┐
│                         EMAIL SUMMARY                                │
└─────────────────────────────────────────────────────────────────────┘

┌───┬─────────────────────┬──────────┬───────────┬──────────────────┐
│ # │ Email Name          │ To       │ Trigger   │ Key Content      │
├───┼─────────────────────┼──────────┼───────────┼──────────────────┤
│ 1 │ Booking             │ Customer │ Immediate │ All details,     │
│   │ Confirmation        │          │ on book   │ payment summary  │
├───┼─────────────────────┼──────────┼───────────┼──────────────────┤
│ 2 │ Admin Booking       │ Admin    │ Immediate │ Complete booking │
│   │ Notification        │          │ on book   │ info             │
├───┼─────────────────────┼──────────┼───────────┼──────────────────┤
│ 3 │ Admin Payment       │ Admin    │ Immediate │ Payment amount,  │
│   │ Alert               │          │ on pay    │ Stripe ID        │
├───┼─────────────────────┼──────────┼───────────┼──────────────────┤
│ 4 │ Day Before          │ Customer │ 9 AM      │ Reminder,        │
│   │ Reminder            │          │ -1 day    │ checklist        │
├───┼─────────────────────┼──────────┼───────────┼──────────────────┤
│ 5 │ Thank You +         │ Customer │ 9 AM      │ Review link,     │
│   │ Review Request      │          │ +1 day    │ book again       │
└───┴─────────────────────┴──────────┴───────────┴──────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    CRON JOB CONFIGURATION                            │
└─────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │  Cron Trigger   │
                        │   (9 AM UTC)    │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Call Endpoint  │
                        │ /api/emails/    │
                        │ send-scheduled  │
                        └────────┬────────┘
                                 │
                ┌────────────────┴────────────────┐
                ▼                                 ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │ sendDailyReminders()  │       │ sendDailyThankYous()  │
    │                       │       │                       │
    │ For each booking with │       │ For each booking with │
    │ check-in tomorrow:    │       │ check-out yesterday:  │
    │   - Send reminder     │       │   - Send thank you    │
    └───────────────────────┘       └───────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                         RESEND FLOW                                  │
└─────────────────────────────────────────────────────────────────────┘

    Application Code
         │
         ▼
    sendEmail()
         │
         ▼
    Resend Client
         │
         ▼
    Resend API
         │
         ├─────────────┬──────────────┬──────────────┐
         ▼             ▼              ▼              ▼
    Process      Validate       Send to        Track
    Request       Email         Provider       Metrics
         │             │              │              │
         └─────────────┴──────────────┴──────────────┘
                                │
                                ▼
                         Customer Inbox ✉️


┌─────────────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT VS PRODUCTION                       │
└─────────────────────────────────────────────────────────────────────┘

DEVELOPMENT (No API Key)                 PRODUCTION (With API Key)
┌─────────────────────┐                 ┌─────────────────────┐
│ Email triggered     │                 │ Email triggered     │
└──────────┬──────────┘                 └──────────┬──────────┘
           ▼                                       ▼
┌─────────────────────┐                 ┌─────────────────────┐
│ Log to console      │                 │ Send via Resend     │
│ "Would send to..."  │                 │ to actual email     │
└─────────────────────┘                 └──────────┬──────────┘
                                                   ▼
                                        ┌─────────────────────┐
                                        │ Email delivered     │
                                        └─────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                          KEY POINTS                                  │
└─────────────────────────────────────────────────────────────────────┘

✅ 5 total email templates
✅ 3 immediate triggers (booking, payment, admin)
✅ 2 scheduled triggers (reminder, thank you)
✅ Google Review link in thank you email
✅ Admin gets all booking and payment notifications
✅ Customer gets helpful reminders and confirmations
✅ All emails branded with Glenugie style
✅ Mobile responsive design
✅ Automatic, no manual work needed

```
