# Admin Dashboard Guide

Complete guide for using the Glenugie Kennels admin dashboard.

## Accessing the Admin Dashboard

1. Navigate to `/admin` on your site
2. Enter the admin password (default: `admin123`)
3. You'll remain logged in for the browser session

**Security Note:** Change the default password in production by setting the `ADMIN_PASSWORD` environment variable.

## Dashboard Overview

The admin dashboard has three main tabs:

### 1. All Bookings Tab

View and manage all bookings in a comprehensive table.

**Features:**
- **Search**: Find bookings by customer name, email, phone, or pet name
- **Filter**: Show only pending, confirmed, cancelled, or completed bookings
- **Export**: Download booking data as CSV for reporting
- **View Details**: Click "View" to see complete booking information
- **Update Status**: Confirm, cancel, or complete bookings

**Table Columns:**
- Booking ID (shortened)
- Customer name and email
- Pet names
- Check-in and check-out dates
- Accommodation type/suite
- Status badge
- Payment status
- Total price
- Actions

**Booking Details Dialog:**
When you click "View" on a booking, you can:
- See full customer information
- View all pet details and special requirements
- Check payment information
- Read special requests
- Update the booking status

**Status Updates:**
- **Confirm**: Mark a pending booking as confirmed
- **Cancel**: Cancel a booking (keeps record for history)
- **Complete**: Mark as completed after check-out

### 2. Calendar Tab

Visual calendar view of all bookings and availability.

**Features:**
- **Calendar View**: See which dates have bookings (highlighted in blue)
- **Date Selection**: Click any date to see bookings for that day
- **Accommodation Filter**: Filter by specific suite or accommodation type
- **Availability Overview**: Real-time availability for all accommodations

**Using the Calendar:**
1. Click a date to see bookings
2. Use the dropdown to filter by accommodation type
3. Check the availability panel to see which accommodations are free
4. Dates with bookings are highlighted

**Availability Panel:**
Shows for the selected date:
- Each luxury suite (10 total)
- Ruff's Retreat kennels (12 spaces)
- The Village kennels (6 spaces)
- Kittie Condos (11 spaces)
- Current bookings vs. total capacity

### 3. Create Booking Tab

Manually create bookings for phone or in-person reservations.

**Steps to Create a Booking:**

1. **Customer Information**
   - Name (required)
   - Email (required)
   - Phone number (required)

2. **Accommodation**
   - Select accommodation type
   - If luxury suite, choose specific suite
   - System shows price per night

3. **Booking Dates**
   - Select check-in date
   - Select check-out date
   - System calculates nights and total price

4. **Pet Information**
   - Add pet name, breed, and age
   - Add special requirements if needed
   - Click "+ Add Another Pet" for multiple pets (up to accommodation limit)
   - Remove pets if needed

5. **Special Requests**
   - Optional field for any special requests

6. **Submit**
   - Review the total price
   - Click "Create Booking"
   - Confirmation email is sent automatically

**Notes:**
- Manual bookings are created as "confirmed" and "fully-paid"
- You can create bookings for any date (no validation against existing bookings)
- Email confirmations are sent to customer and admin

## Statistics Dashboard

The top of the dashboard shows key metrics:

1. **Total Bookings**: All bookings in the system
2. **Confirmed**: Bookings with confirmed status
3. **Pending**: Bookings awaiting confirmation/payment
4. **Upcoming**: Future bookings that aren't cancelled
5. **Total Revenue**: All revenue from paid bookings (full or deposit)

## Export Functionality

**CSV Export includes:**
- All booking details
- Customer information
- Pet information
- Dates and accommodation
- Payment status and totals
- Special requests

**How to Export:**
1. Optionally filter bookings
2. Click "Export to CSV"
3. File downloads with timestamp

**Use Cases:**
- Monthly reports
- Accounting records
- Marketing analysis
- Backup of booking data

## Common Tasks

### Confirming a New Booking

1. Go to "All Bookings" tab
2. Filter by "Pending" status
3. Click "View" on the booking
4. Review details
5. Click "Confirm" button
6. Customer automatically notified (if email configured)

### Checking Availability

1. Go to "Calendar" tab
2. Select the desired date range
3. Filter by accommodation type if needed
4. Check the availability overview panel
5. Green badge = available, Red badge = fully booked

### Creating a Manual Booking

1. Go to "Create Booking" tab
2. Fill in customer details
3. Select accommodation and dates
4. Add pet information
5. Review total price
6. Click "Create Booking"

### Cancelling a Booking

1. Find the booking in "All Bookings"
2. Click "View"
3. Click "Cancel" button
4. Booking marked as cancelled (not deleted)
5. Handle refund separately through Stripe dashboard

### Finding a Specific Booking

Use the search box to find by:
- Customer name: "John Smith"
- Email: "john@example.com"
- Phone: "1234567890"
- Pet name: "Max"

## Email Notifications

When email is configured, the system automatically sends:

**Customer Emails:**
- Booking confirmation with all details
- Payment summary
- Pet information recap

**Admin Emails:**
- New booking notifications
- Quick summary of booking details

**Setting up Email:**
See `ENVIRONMENT.md` for email service configuration.

## Best Practices

1. **Regular Monitoring**: Check the dashboard daily for new bookings
2. **Quick Confirmations**: Confirm pending bookings promptly
3. **Availability Checks**: Use calendar before creating manual bookings
4. **Export Regularly**: Download CSV exports for monthly records
5. **Status Updates**: Keep booking statuses current
6. **Special Requirements**: Review pet special requirements before check-in

## Security

1. **Change Default Password**: Set a strong `ADMIN_PASSWORD` in production
2. **Session-Based**: Login persists only during browser session
3. **Logout**: Always logout when done, especially on shared computers
4. **Access Control**: Only share admin password with authorized staff

## Troubleshooting

### Can't Login
- Check password is correct
- Try clearing browser cache
- Verify `ADMIN_PASSWORD` environment variable

### Bookings Not Loading
- Check database connection
- Refresh the page
- Check browser console for errors

### Emails Not Sending
- Verify email service is configured
- Check `EMAIL_API_KEY` and `EMAIL_SERVICE` environment variables
- Emails will log to console if not configured

### Export Not Working
- Check browser allows downloads
- Try a different browser
- Check popup blocker settings

## Support

For technical issues or questions:
- Check `README.md` for general documentation
- Review `SETUP.md` for configuration
- Check `DEPLOYMENT.md` for production setup

## Future Enhancements

Planned features for future versions:
- Email template customization
- Advanced reporting and analytics
- Automated reminder emails
- Payment processing within admin
- Bulk operations
- Booking conflict prevention
- Customer database management
