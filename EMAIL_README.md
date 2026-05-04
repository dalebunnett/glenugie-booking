# 📧 Email Suite - Complete Package

A professional, automated email system for Glenugie Kennels using Resend.

## 🎯 What You Get

### 5 Beautiful Email Templates
1. **Booking Confirmation** - Sent to customer + admin when booking is created
2. **Day Before Reminder** - Sent to customer 24 hours before check-in
3. **Thank You & Review Request** - Sent to customer 24 hours after check-out (includes Google Review link)
4. **Admin Booking Notification** - Sent to admin when new booking is received
5. **Admin Payment Notification** - Sent to admin when payment is received

### Features
- ✅ **Professional Design** - Matches Glenugie branding with custom fonts and colors
- ✅ **Mobile Responsive** - Looks great on all devices
- ✅ **Automated Sending** - Triggers on booking events and scheduled times
- ✅ **Google Review Integration** - Direct link to leave 5-star review
- ✅ **Complete Booking Info** - All details included in emails
- ✅ **Admin Notifications** - Stay informed of all bookings and payments

## 🚀 Quick Start

### 1. Get API Key (2 minutes)
1. Sign up at [resend.com](https://resend.com) (free)
2. Create API key
3. Copy it (starts with `re_`)

### 2. Configure (1 minute)
Add to `.env`:
```env
RESEND_API_KEY=re_your_key_here
CRON_SECRET=random-secret-string
```

### 3. Test It (1 minute)
Visit: `http://localhost:4321/api/emails/test`
- Preview all email templates
- Send test emails to yourself

### 4. Deploy
Add environment variables to production and you're done! ✅

## 📖 Documentation

- **[EMAIL_SETUP_CHECKLIST.md](./EMAIL_SETUP_CHECKLIST.md)** - Step-by-step setup guide
- **[EMAIL_SUITE_GUIDE.md](./EMAIL_SUITE_GUIDE.md)** - Complete technical documentation

## 🧪 Testing & Preview

### Preview Emails in Browser
Visit these URLs in development:

```
http://localhost:4321/api/emails/test
http://localhost:4321/api/emails/test?type=booking-confirmation
http://localhost:4321/api/emails/test?type=day-before
http://localhost:4321/api/emails/test?type=thank-you
http://localhost:4321/api/emails/test?type=admin-booking
http://localhost:4321/api/emails/test?type=admin-payment
```

### Send Test Email
1. Go to preview URL
2. Enter your email address
3. Click "Send Test Email"
4. Check your inbox!

## 📅 Email Automation Schedule

| Email | Timing | Trigger |
|-------|--------|---------|
| Booking Confirmation | Immediate | New booking |
| Payment Notification | Immediate | Payment received |
| Day Before Reminder | 9 AM daily | Check-in tomorrow |
| Thank You + Review | 9 AM daily | Check-out yesterday |

## 🎨 What the Emails Look Like

### Booking Confirmation
```
┌─────────────────────────────────┐
│   Booking Confirmed! 🐾         │
├─────────────────────────────────┤
│ Dear Sarah,                     │
│                                 │
│ Thank you for choosing          │
│ Glenugie Kennels!               │
│                                 │
│ 📅 Booking Details              │
│ • Reference: booking-12345      │
│ • Check-in: Monday, May 5       │
│ • Check-out: Monday, May 12     │
│ • Accommodation: Barkingham     │
│   Palace                        │
│                                 │
│ 🐕 Your Pets                    │
│ • Max (Golden Retriever, 4)    │
│ • Bella (Labrador, 2)          │
│                                 │
│ 💰 Payment Summary              │
│ • Total: £245.00                │
│ • Deposit: £122.50              │
│ • Balance: £122.50              │
│                                 │
│ [Contact Information]           │
└─────────────────────────────────┘
```

### Day Before Reminder
```
┌─────────────────────────────────┐
│   See You Tomorrow! ⏰          │
├─────────────────────────────────┤
│ Reminder: Max and Bella check   │
│ in tomorrow!                    │
│                                 │
│ ✅ Checklist:                   │
│ • Vaccination records           │
│ • Medications                   │
│ • Favorite food                 │
│ • Comfort items                 │
│                                 │
│ Check-in: 2PM - 5PM             │
└─────────────────────────────────┘
```

### Thank You + Review
```
┌─────────────────────────────────┐
│   Thank You! 💙                 │
├─────────────────────────────────┤
│ We hope Max and Bella enjoyed   │
│ their stay!                     │
│                                 │
│   ⭐ Share Your Experience      │
│                                 │
│   [Leave a Google Review]       │
│   (Big prominent button)        │
│                                 │
│ Plan your next stay!            │
│ [Book Again]                    │
└─────────────────────────────────┘
```

## 💡 Key Features

### Smart Automation
- Emails send automatically based on booking events
- No manual work required
- Reliable and consistent

### Professional Branding
- Great Vibes font for headings (matches website)
- Fira Sans for body text
- Glenugie blue color scheme
- Paw print decorations

### Complete Information
- All booking details included
- Pet information with special requirements
- Payment summary and balance due
- Contact information
- Terms and important times

### Google Review Integration
The thank you email includes:
- Prominent "Leave a Review" button
- Direct link to Google review page
- Sent 24 hours after check-out (perfect timing!)
- Professional request with gratitude

## 🔧 Technical Details

### Files
- `src/lib/email.ts` - Email templates and sending logic
- `src/pages/api/emails/test.ts` - Preview and testing tool
- `src/pages/api/emails/send-scheduled.ts` - Cron endpoint

### Dependencies
- `resend` - Email sending service
- `date-fns` - Date formatting

### Integration Points
- `src/pages/api/bookings.ts` - Sends confirmation on booking
- `src/pages/api/webhooks/stripe.ts` - Sends payment notification

## 🎓 How It Works

### Booking Flow
```
Customer books
    ↓
Booking saved to database
    ↓
sendBookingConfirmation() called
    ↓
Customer gets: Confirmation email
Admin gets: New booking notification
```

### Payment Flow
```
Payment succeeds (Stripe)
    ↓
Webhook updates booking
    ↓
sendAdminPaymentNotification() called
    ↓
Admin gets: Payment confirmation
```

### Scheduled Emails
```
Cron job runs daily at 9 AM
    ↓
Check all bookings
    ↓
For check-in tomorrow → Send reminder
For check-out yesterday → Send thank you
```

## 🌟 Benefits

### For Customers
- Professional confirmation with all details
- Helpful reminder before check-in
- Thoughtful thank you after stay
- Easy way to leave review

### For Business
- Automated customer communication
- Professional brand image
- Increased Google reviews
- Payment notifications
- Reduced support inquiries

### For Admin
- Instant booking notifications
- Payment confirmations
- All booking details in email
- Link to admin dashboard

## 📊 Success Metrics

Track in Resend dashboard:
- Email delivery rate
- Open rates
- Click rates (especially review link)
- Bounce rates

## 🚨 Troubleshooting

**Emails not sending?**
- Check RESEND_API_KEY is set
- Verify domain in Resend
- Check console logs

**Scheduled emails not working?**
- Verify cron job is set up
- Check CRON_SECRET matches
- Test endpoint manually

**Emails going to spam?**
- Verify domain in Resend
- Use verified sender domain
- Check email content (avoid spammy words)

## 🎁 Bonus Features

### Email Preview Tool
Visit `/api/emails/test` to:
- Preview all templates
- See how they look on different types of bookings
- Send test emails to yourself
- Perfect for testing changes

### Customization
All templates can be customized in `src/lib/email.ts`:
- Change colors
- Update text
- Modify layout
- Add sections

## 📞 Support

Need help?
- Check `EMAIL_SETUP_CHECKLIST.md` for setup
- See `EMAIL_SUITE_GUIDE.md` for detailed docs
- Visit [resend.com/docs](https://resend.com/docs)

## ✅ Ready to Go!

You have everything you need:
1. ✅ 5 professional email templates
2. ✅ Automated sending system
3. ✅ Google review integration
4. ✅ Admin notifications
5. ✅ Preview and testing tools
6. ✅ Complete documentation

Just add your Resend API key and you're ready to send beautiful, automated emails! 🚀

---

**Made with 💙 for Glenugie Kennels**
