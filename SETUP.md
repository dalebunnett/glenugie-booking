
# Glenugie Kennels Booking System - Setup Guide

## Overview
This is a complete booking system for Glenugie Kennels featuring:
- Customer-facing booking flow with Stripe payments
- Admin dashboard with calendar view and booking management
- Multiple accommodation types (Luxury Suites, Standard Kennels, Cattery)
- Deposit and full payment options based on booking timeframe
- Email notifications (ready for integration)

## Pages Created

### Public Pages
- **Home** (`/`) - Landing page with services overview
- **About** (`/about`) - Information about Glenugie Kennels
- **Accommodations** (`/accommodations`) - Detailed accommodation listings
- **Booking** (`/booking`) - Multi-step booking form with Stripe integration
- **Contact** (`/contact`) - Contact form
- **Terms** (`/terms`) - Terms and conditions
- **Booking Success** (`/booking/success`) - Post-payment confirmation
- **Booking Cancelled** (`/booking/cancelled`) - Cancelled payment page

### Admin Pages
- **Admin Dashboard** (`/admin`) - Complete admin interface with:
  - Statistics overview
  - Bookings list with filtering
  - Calendar view with availability
  - Manual booking creation

## Accommodation Types

### Dogs
1. **Luxury Suites** (8 named suites) - £45/night
   - The Balmoral, The Windsor, The Sandringham, The Holyrood
   - The Glamis, The Blenheim, The Chatsworth, The Highgrove

2. **Ruff's Retreat** (12 kennels) - Standard Boarding
   - Small Dogs - £25/night
   - Medium Dogs - £28/night
   - Shared Family - £40/night (up to 3 dogs)

3. **The Village** (6 kennels) - Large Dogs
   - Large Dogs - £32/night
   - Shared Family Large - £40/night

### Cats
4. **Kittie Condos** (11 condos)
   - Individual - £22/night
   - Shared Family - £35/night (up to 3 cats)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Stripe
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Add to your `.env` file:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

The site will be available at http://localhost:3000

### 4. Test the Booking System
Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Any future expiry date and any 3-digit CVC

## Payment Logic

- **Bookings > 7 days in advance**: 30% deposit required, balance due on arrival
- **Bookings ≤ 7 days in advance**: Full payment required upfront

## Database

Currently using an in-memory database (`src/lib/db.ts`) with sample data.

**For Production:**
Replace with a real database:
- Cloudflare D1 (recommended for Cloudflare Workers)
- PostgreSQL (via connection string)
- MongoDB
- Any other database of your choice

Update the database functions in `src/lib/db.ts` to connect to your chosen database.

## Email Integration

Email functionality is stubbed out and ready for integration.

**To add email notifications:**

1. Choose an email service (SendGrid, AWS SES, Mailgun, etc.)
2. Install the SDK: `npm install @sendgrid/mail` (or your chosen service)
3. Update these files:
   - `src/pages/api/contact.ts` - Contact form emails
   - `src/pages/api/bookings.ts` - Booking confirmation emails
   - `src/pages/api/admin/bookings/[bookingId].ts` - Status update emails

4. Create email templates for:
   - Booking confirmation
   - Booking status changes
   - Review requests (post-stay)
   - Payment receipts

## Admin Access

The admin dashboard (`/admin`) is currently open. 

**For Production:**
Add authentication:
1. Install auth package: `npm install @auth/core @auth/astro`
2. Add auth middleware to `src/middleware.ts`
3. Protect admin routes

## Stripe Webhook (Production)

For production, set up a Stripe webhook to handle payment confirmations:

1. Create webhook endpoint: `src/pages/api/webhooks/stripe.ts`
2. Handle these events:
   - `checkout.session.completed` - Update booking payment status
   - `payment_intent.succeeded` - Confirm payment
   - `charge.refunded` - Handle refunds

## Features to Add

### High Priority
- [ ] Email notifications
- [ ] Admin authentication
- [ ] Real database integration
- [ ] Stripe webhook handler

### Medium Priority
- [ ] Customer account area (view bookings)
- [ ] Automated review request emails
- [ ] SMS notifications (optional)
- [ ] Calendar sync (iCal export)

### Nice to Have
- [ ] Photo uploads for pets
- [ ] Online check-in form
- [ ] Vaccination record uploads
- [ ] Pet care notes (admin can add daily notes)

## Customization

### Pricing
Edit `src/lib/booking-types.ts` - Update the `pricePerNight` values in the `ACCOMMODATIONS` array

### Luxury Suite Names
Edit `src/lib/booking-types.ts` - Update the `LUXURY_SUITE_NAMES` array

```typescript
export const LUXURY_SUITE_NAMES = [
  'Balmoral',
  'Glamis',
  'Fyvie',
  'Floors',
  'Blair',
  'Brodick',
  'Cawdor',
  'Dunrobin'
];
```

### Colors/Branding
Edit your Webflow site's color palette, which automatically updates the CSS variables in `generated/webflow.css`

### Contact Information
Update in:
- `src/pages/contact.astro`
- `src/pages/terms.astro`

## Deployment

This app is configured for Cloudflare Workers deployment.

1. Make sure you have Wrangler CLI installed
2. Configure your environment variables in Cloudflare dashboard
3. Deploy: `npm run build`

## Support

For questions or issues, refer to:
- Astro documentation: https://docs.astro.build
- Stripe documentation: https://stripe.com/docs
- Cloudflare Workers: https://developers.cloudflare.com/workers

## File Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── BookingsList.tsx
│   │   ├── BookingsCalendar.tsx
│   │   └── CreateBookingForm.tsx
│   ├── ui/ (shadcn components)
│   ├── BookingForm.tsx
│   └── ContactForm.tsx
├── lib/
│   ├── booking-types.ts (data models & accommodations)
│   ├── db.ts (database functions)
│   ├── base-url.ts
│   └── utils.ts
├── pages/
│   ├── api/
│   │   ├── admin/
│   │   │   └── bookings/ (admin endpoints)
│   │   ├── bookings.ts (customer booking creation)
│   │   └── contact.ts
│   ├── admin/
│   │   └── index.astro (admin dashboard)
│   ├── booking/
│   │   ├── success.astro
│   │   └── cancelled.astro
│   ├── index.astro (home)
│   ├── about.astro
│   ├── accommodations.astro
│   ├── booking.astro
│   ├── contact.astro
│   └── terms.astro
└── layouts/
    └── main.astro
```

