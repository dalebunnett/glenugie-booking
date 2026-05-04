
# Quick Start Guide

Get the Glenugie Kennels booking system running in 5 minutes!

## 1. Install Dependencies
```bash
npm install
```

## 2. Add Stripe Keys

Get your Stripe test keys from [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## 3. Start Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

## 4. Test the System

### Test a Customer Booking
1. Go to **http://localhost:3000/booking**
2. Select accommodation (try "Luxury Suite" → "The Balmoral")
3. Pick dates (try selecting dates 10 days from now for deposit flow)
4. Add pet details
5. Fill customer information
6. Use test card: `4242 4242 4242 4242`
7. Any future expiry + any CVC

### Access Admin Dashboard
1. Go to **http://localhost:3000/admin**
2. View bookings, calendar, and stats
3. Try creating a manual booking

## 5. Explore the Site

- **Home**: http://localhost:3000
- **About**: http://localhost:3000/about
- **Accommodations**: http://localhost:3000/accommodations
- **Contact**: http://localhost:3000/contact
- **Terms**: http://localhost:3000/terms
- **Booking**: http://localhost:3000/booking
- **Admin**: http://localhost:3000/admin

## Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

Use any future expiry date and any 3-digit CVC.

## What's Included

✅ Customer booking flow with Stripe payments  
✅ Admin dashboard with calendar  
✅ Multiple accommodation types  
✅ Deposit vs full payment logic  
✅ Booking management  
✅ Responsive design  
✅ Terms & conditions  
✅ Contact form  

## Test the Application

1. **Home Page**: Navigate to `http://localhost:3000`
2. **Browse Pages**: 
   - About Us
   - Accommodations
   - Contact
   - Booking form
3. **Admin Dashboard**: Navigate to `http://localhost:3000/admin`
   - Default password: `admin123`
   - View bookings, calendar, create manual bookings
   - See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for full usage guide

## Next Steps

See [SETUP.md](./SETUP.md) for:
- Adding a real database
- Email integration
- Admin authentication
- Webhook setup
- Production deployment

## Need Help?

Check the [README.md](./README.md) for full documentation.

---

**Happy Building!** 🐕 🐈

