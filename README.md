



# Glenugie Kennels Booking System

A comprehensive, full-featured booking system for Glenugie Kennels built with Astro, React, TypeScript, and Stripe.

## 🌟 Features

### Customer-Facing Features
- **Multi-step Booking Flow** - Intuitive 4-step booking process
- **Stripe Integration** - Secure payment processing with deposit and full payment options
- **Multiple Accommodation Types** - Luxury suites, standard kennels, and cattery
- **Responsive Design** - Works perfectly on all devices
- **Contact Form** - Easy communication with the kennels
- **Terms & Conditions** - Complete legal documentation

### Admin Features
- **Dashboard Overview** - Statistics and booking summary at a glance
- **Booking Management** - View, update, and manage all bookings
- **Calendar View** - Visual representation of bookings with availability tracking
- **Manual Booking Creation** - Create bookings directly from the admin panel
- **Status Management** - Update booking status (pending, confirmed, cancelled, completed)
- **Payment Tracking** - Monitor payment status for all bookings

## Admin Dashboard

Access the admin dashboard at `/admin` to:

- View all bookings with filtering and search
- See booking statistics (total, confirmed, pending, cancelled, upcoming)
- View bookings on a visual calendar
- Check accommodation availability
- Create bookings manually
- Update booking status
- Export booking data to CSV

**Authentication:**
- Default password: `admin123`
- Change this by setting the `ADMIN_PASSWORD` environment variable
- Session-based authentication (stays logged in during browser session)

**Features:**
- **All Bookings Tab**: View, filter, and manage all bookings in a table
- **Calendar Tab**: Visual calendar view with availability tracking
- **Create Booking Tab**: Manually create bookings for phone/in-person reservations
- **Export**: Download booking data as CSV for reporting

**For detailed admin dashboard usage, see [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**

## 🏠 Accommodation Types

### Dogs

**Luxury Suites** (10 suites @ £45/night)
- Sniffany Suite
- Woofdorf
- Barkingham Palace
- Nasherville
- Lapdog Land Suite
- Huntington Manor Suite
- Pawduree
- Furrari
- Tail Away
- The Fairy Dogmother

**Ruff's Retreat** (12 kennels - Standard Boarding)
- Small Dogs: £25/night
- Medium Dogs: £28/night
- Shared Family: £40/night (up to 3 dogs)

**The Village** (6 kennels - Large Dogs)
- Large Dogs: £32/night
- Shared Family: £40/night (up to 3 dogs)

### Cats

**Kittie Condos** (11 condos)
- Individual: £22/night
- Shared Family: £35/night (up to 3 cats)

## 📋 Pages

### Public Pages
- `/` - Home page with services overview
- `/about` - About Glenugie Kennels
- `/accommodations` - Detailed accommodation listings
- `/booking` - Multi-step booking form
- `/contact` - Contact form
- `/terms` - Terms and conditions
- `/booking/success` - Booking confirmation page
- `/booking/cancelled` - Cancelled booking page

### Admin Pages
- `/admin` - Admin dashboard with:
  - Statistics overview
  - Bookings list with filtering
  - Calendar view with availability
  - Manual booking creation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Stripe

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard (use test keys for development)
3. Add them to your environment:

**For local development**, create or update `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**For Cloudflare deployment**, add as environment variables in the Cloudflare dashboard.

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Test Bookings

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

## 💳 Payment Logic

The system automatically determines payment requirements:

- **Bookings made > 7 days in advance**: 30% deposit required
- **Bookings made ≤ 7 days in advance**: Full payment required upfront

Remaining balances are due upon arrival.

## 🗄️ Database

Currently uses an **in-memory database** (`src/lib/db.ts`) with sample data for demonstration.

### For Production

Replace with a real database. Recommended options:

1. **Cloudflare D1** (recommended for Cloudflare Workers)
```bash
npx wrangler d1 create glenugie-bookings
```

2. **PostgreSQL** via connection string

3. **MongoDB** for document storage

Update the database functions in `src/lib/db.ts` to integrate your chosen database.

## 📧 Email Integration

Email functionality is stubbed and ready for integration.

### Setup Email Service

1. Choose a service (SendGrid, AWS SES, Mailgun, Resend)
2. Install the SDK:
```bash
npm install @sendgrid/mail
# or
npm install resend
```

3. Update these files with email logic:
   - `src/pages/api/contact.ts` - Contact form
   - `src/pages/api/bookings.ts` - Booking confirmations
   - `src/pages/api/webhooks/stripe.ts` - Payment confirmations

### Email Templates Needed
- Booking confirmation
- Booking status updates
- Payment receipts
- Review requests (post-stay)
- Contact form submissions

## 🔒 Security & Production Readiness

### Admin Authentication

The admin area is currently open. **Add authentication before deploying:**

```bash
npm install @auth/core @auth/astro
```

Then protect `/admin` routes in `src/middleware.ts`.

### Stripe Webhook Setup

For production, configure Stripe webhooks:

1. In Stripe Dashboard, add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
2. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `charge.refunded`
3. Add webhook secret to environment:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

The webhook handler is at `src/pages/api/webhooks/stripe.ts`.

## 🎨 Customization

### Update Pricing
Edit `src/lib/booking-types.ts`:
```typescript
{
  id: 'luxury-suite',
  name: 'Luxury Suite',
  pricePerNight: 45, // Change this
  // ...
}
```

### Change Suite Names
Edit `src/lib/booking-types.ts`:
```typescript
export const LUXURY_SUITE_NAMES = [
  'The Balmoral',
  'Your Custom Name',
  // ...
];
```

### Update Contact Info
- `src/pages/contact.astro`
- `src/pages/terms.astro`
- `src/components/Footer.tsx`

### Modify Colors/Branding
Edit your Webflow site's design system. CSS variables are automatically generated in `generated/webflow.css`.

## 📦 Deployment

### Cloudflare Workers (Recommended)

```bash
npm run build
npx wrangler deploy
```

### Environment Variables

Set these in Cloudflare Dashboard:
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Any email service keys

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/              # Admin dashboard components
│   │   ├── AdminDashboard.tsx
│   │   ├── BookingsList.tsx
│   │   ├── BookingsCalendar.tsx
│   │   └── CreateBookingForm.tsx
│   ├── ui/                 # shadcn UI components
│   ├── BookingForm.tsx     # Customer booking form
│   ├── ContactForm.tsx
│   ├── Navigation.tsx
│   └── Footer.tsx
├── lib/
│   ├── booking-types.ts    # Type definitions & data
│   ├── db.ts              # Database functions
│   ├── base-url.ts
│   └── utils.ts
├── pages/
│   ├── api/               # API routes
│   │   ├── admin/         # Admin endpoints
│   │   ├── webhooks/      # Stripe webhooks
│   │   ├── bookings.ts
│   │   └── contact.ts
│   ├── admin/             # Admin pages
│   ├── booking/           # Booking flow pages
│   ├── index.astro        # Home
│   ├── about.astro
│   ├── accommodations.astro
│   ├── booking.astro
│   ├── contact.astro
│   └── terms.astro
├── layouts/
│   └── main.astro
└── styles/
    └── global.css
```

## 🛠️ Tech Stack

- **Framework**: Astro 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Payments**: Stripe
- **Type Safety**: TypeScript
- **Deployment**: Cloudflare Workers
- **Date Handling**: date-fns

## 📝 TODO for Production

### High Priority
- [ ] Add real database (D1, PostgreSQL, etc.)
- [ ] Implement email notifications
- [ ] Add admin authentication
- [ ] Configure Stripe webhooks
- [ ] Set up proper error logging

### Medium Priority
- [ ] Customer account area (view bookings)
- [ ] Automated review requests
- [ ] SMS notifications (optional)
- [ ] Calendar export (iCal)

### Nice to Have
- [ ] Photo uploads for pets
- [ ] Online check-in form
- [ ] Vaccination record uploads
- [ ] Daily care notes from staff

## 🐛 Testing

### Test Booking Flow
1. Visit `/booking`
2. Select an accommodation
3. Choose dates (try both >7 days and <7 days)
4. Add pet details
5. Fill customer information
6. Use test card: `4242 4242 4242 4242`

### Test Admin Features
1. Visit `/admin`
2. View bookings list
3. Check calendar view
4. Create a manual booking
5. Update booking status

## 📞 Support & Documentation

- **Astro**: [https://docs.astro.build](https://docs.astro.build)
- **Stripe**: [https://stripe.com/docs](https://stripe.com/docs)
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)
- **Cloudflare Workers**: [https://developers.cloudflare.com/workers](https://developers.cloudflare.com/workers)

## 📄 License

This project is built for Glenugie Kennels. All rights reserved.

---

**Built with ❤️ using Webflow Cloud**




