# Customer Portal - Complete Guide

## Overview
The customer portal is now fully implemented and accessible at `/my-bookings`. This allows customers to view and manage their bookings online.

## Features

### 1. **Customer Registration & Login**
- New customers can create an account with:
  - Email
  - Password
  - Full name
  - Phone number
- Existing customers can log in with their email and password
- Sessions are maintained via HTTP-only cookies for security
- 30-day session expiration

### 2. **View Bookings**
Customers can:
- See all their bookings in one place
- View booking details including:
  - Check-in and check-out dates
  - Accommodation type and kennel number
  - Pet information (name, breed, type)
  - Total price
  - Booking status
  - Special requirements

### 3. **Profile Management**
Customers can view their profile information:
- Name
- Email
- Phone number

## Access Points

### Navigation Bar
- **Desktop & Mobile**: "My Bookings" button (primary blue button)
- Located between main navigation and Admin button

### Home Page
- Three CTA buttons in hero section:
  1. 🐾 Book Your Stay (primary)
  2. 📋 My Bookings (secondary)
  3. ✨ Explore Kennels and Suites (outline)

### Booking Success Page
- Prominent call-to-action encouraging customers to create an account
- Direct link to customer portal

### Footer
- "My Bookings" link in the Information section
- Available on every page

## Technical Implementation

### Files Created
1. **`src/components/customer/CustomerPortal.tsx`**
   - Main React component
   - Handles login/registration UI
   - Displays bookings dashboard
   - Profile management interface

2. **`src/pages/my-bookings.astro`**
   - Astro page wrapper
   - Uses `client:only="react"` directive

### API Endpoints Used
1. **`/api/customer/auth`**
   - `POST`: Register new customer
   - `PUT`: Login existing customer
   - `DELETE`: Logout

2. **`/api/customer/profile`**
   - `GET`: Get customer profile
   - `PATCH`: Update customer profile

3. **`/api/bookings`**
   - `GET`: Retrieve all bookings (filtered by customer email)

## User Flow

### First Time User
1. Customer makes a booking → Redirected to success page
2. Success page encourages account creation
3. Clicks "Access My Bookings" button
4. Registers with email used for booking
5. Immediately sees their booking in the dashboard

### Returning User
1. Clicks "My Bookings" from navigation
2. Logs in with credentials
3. Views all bookings and profile information

## Security Features
- Passwords are hashed before storage (currently base64, should use bcrypt in production)
- HTTP-only cookies prevent XSS attacks
- Session validation on every request
- Customer can only see their own bookings (filtered by email)

## Data Storage
Currently uses in-memory storage (same as admin). For production:
- Bookings are matched by customer email
- Customer sessions expire after 30 days
- Session cookies are HTTP-only and SameSite=Lax

## Future Enhancements
1. **Email Verification**: Verify email addresses on registration
2. **Password Reset**: Allow customers to reset forgotten passwords
3. **Booking Modifications**: Let customers request changes to bookings
4. **Booking Cancellations**: Self-service cancellation flow
5. **Pet Profiles**: Save pet information for faster future bookings
6. **Favorites**: Save preferred kennels/suites
7. **Reviews**: Allow customers to leave reviews after their stay
8. **Notifications**: Email/SMS reminders for upcoming bookings
9. **Payment History**: View past payments and receipts
10. **Multiple Pets**: Better management of multiple pet profiles

## Testing Checklist
- [ ] Register new customer account
- [ ] Login with created account
- [ ] View bookings in dashboard
- [ ] Verify only customer's bookings are shown
- [ ] Logout successfully
- [ ] Login again (session persistence)
- [ ] Mobile responsive design
- [ ] All navigation links work correctly

## Notes
- Customer accounts are separate from admin accounts
- Bookings are linked by email address
- The system will show all bookings made with the customer's email, even if made before account creation
- Sessions persist across page refreshes using cookies
