// Email service for sending booking confirmations and notifications
import { Resend } from 'resend';
import type { Booking } from './booking-types';
import { format, addDays, differenceInDays } from 'date-fns';

// Initialize Resend client
function getResendClient() {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY not configured - emails will be logged only');
    return null;
  }
  return new Resend(apiKey);
}

const FROM_EMAIL = 'Glenugie Kennels <bookings@glenugiekennels.co.uk>';
const ADMIN_EMAIL = 'info@glenugiekennels.co.uk';
const GOOGLE_REVIEW_LINK = 'https://g.page/r/CVLGkcM4kJ3DEBM/review';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Email templates
const emailStyles = `
  <style>
    body { 
      font-family: 'Fira Sans', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f0f9ff;
    }
    .container { 
      max-width: 600px; 
      margin: 20px auto; 
      background: white; 
      border-radius: 8px; 
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #83C8E8 0%, #5BB5DC 100%); 
      color: white; 
      padding: 40px 20px; 
      text-align: center; 
    }
    .header-cancelled {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    }
    .header-amended {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    }
    .header h1 { 
      margin: 0; 
      font-family: 'Great Vibes', cursive; 
      font-size: 42px; 
      font-weight: normal;
    }
    .content { 
      padding: 30px; 
    }
    .details { 
      background: #f8fcff; 
      padding: 20px; 
      margin: 20px 0; 
      border-left: 4px solid #83C8E8; 
      border-radius: 4px;
    }
    .details h3 { 
      margin-top: 0; 
      color: #83C8E8; 
      font-size: 18px;
    }
    .details p { 
      margin: 8px 0; 
    }
    .pet-card {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }
    .footer { 
      background: #f8f8f8;
      text-align: center; 
      padding: 30px 20px; 
      color: #666; 
      font-size: 14px; 
    }
    .button { 
      display: inline-block; 
      padding: 14px 32px; 
      background: #83C8E8; 
      color: white; 
      text-decoration: none; 
      border-radius: 25px; 
      margin: 15px 0; 
      font-weight: 600;
    }
    .button:hover {
      background: #5BB5DC;
    }
    .highlight { 
      background: #fff9e6; 
      padding: 15px; 
      border-left: 4px solid #ffc107; 
      margin: 20px 0; 
      border-radius: 4px;
    }
    .alert-success {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
    }
    .alert-warning {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
    }
    .alert-danger {
      background: #ffebee;
      border-left: 4px solid #f44336;
    }
    .paw-print {
      color: #83C8E8;
      font-size: 20px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    td { 
      padding: 8px; 
      border-bottom: 1px solid #eee; 
    }
    td:first-child { 
      font-weight: 600; 
      color: #555; 
      width: 40%;
    }
    .payment-badge {
      display: inline-block;
      padding: 20px 30px;
      background: #4caf50;
      color: white;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .comparison-table {
      margin: 20px 0;
    }
    .comparison-table td {
      padding: 12px;
    }
    .old-value {
      text-decoration: line-through;
      color: #999;
    }
    .new-value {
      color: #4caf50;
      font-weight: 600;
    }
  </style>
`;

// 1. Booking Confirmation Email (sent immediately after booking - customer & admin)
export function bookingConfirmationEmail(booking: Booking): EmailOptions {
  const checkInDate = format(new Date(booking.checkIn), 'EEEE, MMMM d, yyyy');
  const checkOutDate = format(new Date(booking.checkOut), 'EEEE, MMMM d, yyyy');
  const accommodationName = booking.specificSuite || booking.accommodationType;

  return {
    to: booking.customerEmail,
    subject: `🐾 Booking Confirmed - Glenugie Kennels`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your pets will love their stay with us</p>
          </div>
          
          <div class="content">
            <p>Dear ${booking.customerName},</p>
            
            <p>Thank you for choosing Glenugie Kennels! We're delighted to confirm your booking and look forward to pampering ${booking.pets.map(p => p.name).join(' and ')}.</p>
            
            <div class="details">
              <h3>📅 Booking Details</h3>
              <table>
                <tr>
                  <td>Booking Reference</td>
                  <td><strong>${booking.id}</strong></td>
                </tr>
                <tr>
                  <td>Check-in</td>
                  <td>${checkInDate}</td>
                </tr>
                <tr>
                  <td>Check-out</td>
                  <td>${checkOutDate}</td>
                </tr>
                <tr>
                  <td>Number of Nights</td>
                  <td>${booking.numberOfNights}</td>
                </tr>
                <tr>
                  <td>Accommodation</td>
                  <td><strong>${accommodationName}</strong></td>
                </tr>
                ${booking.kennelNumber ? `
                <tr>
                  <td>Kennel Number</td>
                  <td>${booking.kennelNumber}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="details">
              <h3>🐕 Your Pet(s)</h3>
              ${booking.pets.map(pet => `
                <div class="pet-card">
                  <p style="margin: 0; font-size: 18px; font-weight: 600; color: #83C8E8;">${pet.name}</p>
                  <p style="margin: 5px 0; color: #666;">${pet.breed} • ${pet.age} years old • ${pet.type}</p>
                  ${pet.specialRequirements ? `<p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Special requirements:</strong> ${pet.specialRequirements}</p>` : ''}
                </div>
              `).join('')}
            </div>

            <div class="details">
              <h3>💰 Payment Summary</h3>
              <table>
                <tr>
                  <td>Total Amount</td>
                  <td><strong>£${booking.totalPrice.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Deposit Paid</td>
                  <td>£${booking.depositAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Balance Remaining</td>
                  <td><strong>£${(booking.totalPrice - booking.depositAmount).toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Payment Status</td>
                  <td><span style="color: #4caf50; font-weight: 600;">${booking.paymentStatus}</span></td>
                </tr>
              </table>
            </div>

            ${booking.specialRequests ? `
              <div class="details">
                <h3>📝 Special Requests</h3>
                <p>${booking.specialRequests}</p>
              </div>
            ` : ''}

            <div class="highlight">
              <p style="margin: 0;"><strong>⏰ Important Times to Remember:</strong></p>
              <p style="margin: 5px 0 0 0;">
                <strong>Drop Off:</strong> 2PM - 5PM Daily<br>
                <strong>Pick Up:</strong> 10AM - 12PM (additional charges apply after 12PM)
              </p>
            </div>

            <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
            
            <p style="font-size: 16px; margin-top: 30px;">We look forward to welcoming ${booking.pets.map(p => p.name).join(' and ')} to their luxury stay!</p>

            <p style="margin-top: 30px;">
              Warm regards,<br>
              <strong>The Glenugie Kennels Team</strong> 🐾
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; font-weight: 600;">Glenugie Boarding Kennels</p>
            <p style="margin: 5px 0;">Mains of Springhill, Boddam, Aberdeenshire, AB42 3BH</p>
            <p style="margin: 5px 0;">
              📞 <a href="tel:+447359427817" style="color: #83C8E8; text-decoration: none;">07359 427817</a> | 
              ✉️ <a href="mailto:info@glenugiekennels.co.uk" style="color: #83C8E8; text-decoration: none;">info@glenugiekennels.co.uk</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
              Opening Hours: 10AM - 5PM Daily
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// 2. Payment Received Confirmation (customer)
export function paymentReceivedEmail(booking: Booking, paymentAmount: number, paymentType: 'deposit' | 'balance' | 'full'): EmailOptions {
  const remainingBalance = booking.totalPrice - booking.depositAmount;
  
  return {
    to: booking.customerEmail,
    subject: `💰 Payment Received - Glenugie Kennels`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your payment</p>
          </div>
          
          <div class="content">
            <p>Dear ${booking.customerName},</p>
            
            <p>We've successfully received your payment. Thank you!</p>
            
            <div class="alert-success highlight">
              <h2 style="margin: 0; text-align: center; font-size: 32px; color: #4caf50;">£${paymentAmount.toFixed(2)}</h2>
              <p style="margin: 10px 0 0 0; text-align: center; font-size: 16px; color: #555;">
                ${paymentType === 'deposit' ? 'Deposit Payment' : paymentType === 'balance' ? 'Balance Payment' : 'Full Payment'} Received
              </p>
            </div>

            <div class="details">
              <h3>📋 Booking Reference</h3>
              <p><strong>${booking.id}</strong></p>
            </div>

            <div class="details">
              <h3>💰 Payment Summary</h3>
              <table>
                <tr>
                  <td>Total Booking</td>
                  <td>£${booking.totalPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Payment Received</td>
                  <td><strong>£${paymentAmount.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Balance Remaining</td>
                  <td><strong style="color: ${remainingBalance <= 0 ? '#4caf50' : '#ff9800'};">
                    £${remainingBalance.toFixed(2)}
                    ${remainingBalance <= 0 ? ' (Fully Paid)' : ''}
                  </strong></td>
                </tr>
                <tr>
                  <td>Payment Status</td>
                  <td><strong style="color: #4caf50;">${booking.paymentStatus}</strong></td>
                </tr>
              </table>
            </div>

            ${remainingBalance > 0 ? `
              <div class="highlight alert-warning">
                <p style="margin: 0;"><strong>⚠️ Balance Due:</strong></p>
                <p style="margin: 10px 0 0 0;">
                  You have a remaining balance of <strong>£${remainingBalance.toFixed(2)}</strong> which is due at check-in.
                </p>
              </div>
            ` : `
              <div class="highlight alert-success">
                <p style="margin: 0;"><strong>✅ Payment Complete</strong></p>
                <p style="margin: 10px 0 0 0;">
                  Your booking is fully paid. We look forward to seeing you!
                </p>
              </div>
            `}

            <div class="details">
              <h3>📅 Your Booking</h3>
              <table>
                <tr>
                  <td>Check-in</td>
                  <td>${format(new Date(booking.checkIn), 'EEEE, MMMM d, yyyy')}</td>
                </tr>
                <tr>
                  <td>Check-out</td>
                  <td>${format(new Date(booking.checkOut), 'EEEE, MMMM d, yyyy')}</td>
                </tr>
                <tr>
                  <td>Accommodation</td>
                  <td>${booking.specificSuite || booking.accommodationType}</td>
                </tr>
              </table>
            </div>

            <p>If you have any questions about your payment or booking, please contact us.</p>

            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The Glenugie Kennels Team</strong> 🐾
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; font-weight: 600;">Glenugie Boarding Kennels</p>
            <p style="margin: 5px 0;">Mains of Springhill, Boddam, Aberdeenshire, AB42 3BH</p>
            <p style="margin: 5px 0;">
              📞 <a href="tel:+447359427817" style="color: #83C8E8; text-decoration: none;">07359 427817</a> | 
              ✉️ <a href="mailto:info@glenugiekennels.co.uk" style="color: #83C8E8; text-decoration: none;">info@glenugiekennels.co.uk</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// 3. Booking Cancelled (customer)
export function bookingCancelledEmail(booking: Booking, refundAmount?: number): EmailOptions {
  return {
    to: booking.customerEmail,
    subject: `❌ Booking Cancelled - Glenugie Kennels`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header header-cancelled">
            <h1>Booking Cancelled</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">We're sorry to see you go</p>
          </div>
          
          <div class="content">
            <p>Dear ${booking.customerName},</p>
            
            <p>Your booking has been cancelled as requested. We're sorry we won't be able to host ${booking.pets.map(p => p.name).join(' and ')} this time.</p>
            
            <div class="details">
              <h3>📋 Cancelled Booking Details</h3>
              <table>
                <tr>
                  <td>Booking Reference</td>
                  <td><strong>${booking.id}</strong></td>
                </tr>
                <tr>
                  <td>Original Check-in</td>
                  <td>${format(new Date(booking.checkIn), 'EEEE, MMMM d, yyyy')}</td>
                </tr>
                <tr>
                  <td>Original Check-out</td>
                  <td>${format(new Date(booking.checkOut), 'EEEE, MMMM d, yyyy')}</td>
                </tr>
                <tr>
                  <td>Accommodation</td>
                  <td>${booking.specificSuite || booking.accommodationType}</td>
                </tr>
                <tr>
                  <td>Total Amount</td>
                  <td>£${booking.totalPrice.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            ${refundAmount !== undefined && refundAmount > 0 ? `
              <div class="highlight alert-success">
                <h3 style="margin-top: 0; color: #4caf50;">💰 Refund Information</h3>
                <p style="margin: 0;">
                  A refund of <strong>£${refundAmount.toFixed(2)}</strong> will be processed to your original payment method within 5-10 business days.
                </p>
              </div>
            ` : booking.depositAmount > 0 ? `
              <div class="highlight alert-warning">
                <h3 style="margin-top: 0; color: #ff9800;">💰 Cancellation Policy</h3>
                <p style="margin: 0;">
                  As per our cancellation policy, the deposit of <strong>£${booking.depositAmount.toFixed(2)}</strong> is non-refundable.
                </p>
              </div>
            ` : ''}

            <div class="details">
              <h3>🐾 We'd Love to See You in the Future!</h3>
              <p>Your plans may have changed this time, but we hope ${booking.pets.map(p => p.name).join(' and ')} can stay with us in the future.</p>
              <p style="text-align: center; margin-top: 20px;">
                <a href="https://www.glenugiekennels.co.uk/booking" class="button">
                  Make a New Booking
                </a>
              </p>
            </div>

            <p>If you have any questions about this cancellation or our policies, please don't hesitate to contact us.</p>

            <p style="margin-top: 30px;">
              Best wishes,<br>
              <strong>The Glenugie Kennels Team</strong> 🐾
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; font-weight: 600;">Glenugie Boarding Kennels</p>
            <p style="margin: 5px 0;">Mains of Springhill, Boddam, Aberdeenshire, AB42 3BH</p>
            <p style="margin: 5px 0;">
              📞 <a href="tel:+447359427817" style="color: #83C8E8; text-decoration: none;">07359 427817</a> | 
              ✉️ <a href="mailto:info@glenugiekennels.co.uk" style="color: #83C8E8; text-decoration: none;">info@glenugiekennels.co.uk</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// 4. Booking Amended (customer)
export function bookingAmendedEmail(
  booking: Booking, 
  changes: {
    oldCheckIn?: string;
    oldCheckOut?: string;
    oldAccommodation?: string;
    oldTotalPrice?: number;
  }
): EmailOptions {
  const hasDateChange = changes.oldCheckIn || changes.oldCheckOut;
  const hasAccommodationChange = changes.oldAccommodation;
  const hasPriceChange = changes.oldTotalPrice !== undefined;

  return {
    to: booking.customerEmail,
    subject: `📝 Booking Updated - Glenugie Kennels`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header header-amended">
            <h1>Booking Updated</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your booking has been modified</p>
          </div>
          
          <div class="content">
            <p>Dear ${booking.customerName},</p>
            
            <p>Your booking has been successfully updated. Here are the details of the changes:</p>
            
            <div class="details">
              <h3>📋 Booking Reference</h3>
              <p><strong>${booking.id}</strong></p>
            </div>

            ${hasDateChange ? `
              <div class="details">
                <h3>📅 Date Changes</h3>
                <table class="comparison-table">
                  ${changes.oldCheckIn ? `
                    <tr>
                      <td>Check-in</td>
                      <td>
                        <span class="old-value">${format(new Date(changes.oldCheckIn), 'EEEE, MMM d, yyyy')}</span><br>
                        <span class="new-value">→ ${format(new Date(booking.checkIn), 'EEEE, MMM d, yyyy')}</span>
                      </td>
                    </tr>
                  ` : ''}
                  ${changes.oldCheckOut ? `
                    <tr>
                      <td>Check-out</td>
                      <td>
                        <span class="old-value">${format(new Date(changes.oldCheckOut), 'EEEE, MMM d, yyyy')}</span><br>
                        <span class="new-value">→ ${format(new Date(booking.checkOut), 'EEEE, MMM d, yyyy')}</span>
                      </td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td>Number of Nights</td>
                    <td><strong>${booking.numberOfNights}</strong></td>
                  </tr>
                </table>
              </div>
            ` : ''}

            ${hasAccommodationChange ? `
              <div class="details">
                <h3>🏠 Accommodation Change</h3>
                <table class="comparison-table">
                  <tr>
                    <td>Previous</td>
                    <td><span class="old-value">${changes.oldAccommodation}</span></td>
                  </tr>
                  <tr>
                    <td>New</td>
                    <td><span class="new-value">${booking.specificSuite || booking.accommodationType}</span></td>
                  </tr>
                </table>
              </div>
            ` : ''}

            ${hasPriceChange ? `
              <div class="details">
                <h3>💰 Price Update</h3>
                <table class="comparison-table">
                  <tr>
                    <td>Previous Total</td>
                    <td><span class="old-value">£${changes.oldTotalPrice!.toFixed(2)}</span></td>
                  </tr>
                  <tr>
                    <td>New Total</td>
                    <td><span class="new-value">£${booking.totalPrice.toFixed(2)}</span></td>
                  </tr>
                  <tr>
                    <td>Difference</td>
                    <td><strong style="color: ${booking.totalPrice > changes.oldTotalPrice! ? '#ff9800' : '#4caf50'};">
                      ${booking.totalPrice > changes.oldTotalPrice! ? '+' : ''}£${(booking.totalPrice - changes.oldTotalPrice!).toFixed(2)}
                    </strong></td>
                  </tr>
                </table>
              </div>
            ` : ''}

            <div class="details">
              <h3>📋 Updated Booking Summary</h3>
              <table>
                <tr>
                  <td>Check-in</td>
                  <td>${format(new Date(booking.checkIn), 'EEEE, MMMM d, yyyy')}</td>
                </tr>
                <tr>
                  <td>Check-out</td>
                  <td>${format(new Date(booking.checkOut), 'EEEE, MMMM d, yyyy')}</td>
                </tr>
                <tr>
                  <td>Nights</td>
                  <td>${booking.numberOfNights}</td>
                </tr>
                <tr>
                  <td>Accommodation</td>
                  <td><strong>${booking.specificSuite || booking.accommodationType}</strong></td>
                </tr>
                <tr>
                  <td>Total Price</td>
                  <td><strong>£${booking.totalPrice.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Deposit Paid</td>
                  <td>£${booking.depositAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Balance Due</td>
                  <td><strong>£${(booking.totalPrice - booking.depositAmount).toFixed(2)}</strong></td>
                </tr>
              </table>
            </div>

            <div class="highlight">
              <p style="margin: 0;"><strong>⏰ Drop-off & Pick-up Times:</strong></p>
              <p style="margin: 5px 0 0 0;">
                <strong>Drop Off:</strong> 2PM - 5PM Daily<br>
                <strong>Pick Up:</strong> 10AM - 12PM
              </p>
            </div>

            <p>If you have any questions about these changes, please don't hesitate to contact us.</p>

            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The Glenugie Kennels Team</strong> 🐾
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; font-weight: 600;">Glenugie Boarding Kennels</p>
            <p style="margin: 5px 0;">Mains of Springhill, Boddam, Aberdeenshire, AB42 3BH</p>
            <p style="margin: 5px 0;">
              📞 <a href="tel:+447359427817" style="color: #83C8E8; text-decoration: none;">07359 427817</a> | 
              ✉️ <a href="mailto:info@glenugiekennels.co.uk" style="color: #83C8E8; text-decoration: none;">info@glenugiekennels.co.uk</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// 5. Day Before Reminder Email
export function dayBeforeReminderEmail(booking: Booking): EmailOptions {
  const checkInDate = format(new Date(booking.checkIn), 'EEEE, MMMM d, yyyy');
  const accommodationName = booking.specificSuite || booking.accommodationType;

  return {
    to: booking.customerEmail,
    subject: `⏰ Reminder: Check-in Tomorrow - Glenugie Kennels`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>See You Tomorrow!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Almost time for your pet's luxury stay</p>
          </div>
          
          <div class="content">
            <p>Dear ${booking.customerName},</p>
            
            <p>This is a friendly reminder that ${booking.pets.map(p => p.name).join(' and ')} will be checking in with us tomorrow!</p>
            
            <div class="details">
              <h3>📅 Your Booking Details</h3>
              <table>
                <tr>
                  <td>Booking Reference</td>
                  <td><strong>${booking.id}</strong></td>
                </tr>
                <tr>
                  <td>Check-in Date</td>
                  <td><strong>${checkInDate}</strong></td>
                </tr>
                <tr>
                  <td>Check-in Time</td>
                  <td><strong>2PM - 5PM</strong></td>
                </tr>
                <tr>
                  <td>Accommodation</td>
                  <td>${accommodationName}</td>
                </tr>
                ${booking.kennelNumber ? `
                <tr>
                  <td>Kennel Number</td>
                  <td>${booking.kennelNumber}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="highlight">
              <p style="margin: 0; font-weight: 600;">📋 Checklist for Tomorrow:</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Vaccination records (if not already provided)</li>
                <li>Any medications your pet requires</li>
                <li>Your pet's favorite food (if using our feeding service)</li>
                <li>Any comfort items (blankets, toys) if desired</li>
                <li>Arrive between 2PM - 5PM</li>
              </ul>
            </div>

            <div class="details">
              <h3>🐕 Pets Checking In</h3>
              ${booking.pets.map(pet => `
                <div class="pet-card">
                  <p style="margin: 0; font-size: 16px; font-weight: 600;">${pet.name} - ${pet.breed}</p>
                  ${pet.specialRequirements ? `<p style="margin: 5px 0; font-size: 14px; color: #555;">${pet.specialRequirements}</p>` : ''}
                </div>
              `).join('')}
            </div>

            <div class="details">
              <h3>💰 Payment Reminder</h3>
              <table>
                <tr>
                  <td>Deposit Paid</td>
                  <td>£${booking.depositAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Balance Due</td>
                  <td><strong>£${(booking.totalPrice - booking.depositAmount).toFixed(2)}</strong></td>
                </tr>
              </table>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">
                Please bring payment for the remaining balance at check-in.
              </p>
            </div>

            <p>If you have any questions or need to make any last-minute changes, please call us on 07359 427817.</p>
            
            <p style="font-size: 16px; margin-top: 30px;">We can't wait to welcome ${booking.pets.map(p => p.name).join(' and ')}!</p>

            <p style="margin-top: 30px;">
              See you tomorrow!<br>
              <strong>The Glenugie Kennels Team</strong> 🐾
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; font-weight: 600;">Glenugie Boarding Kennels</p>
            <p style="margin: 5px 0;">Mains of Springhill, Boddam, Aberdeenshire, AB42 3BH</p>
            <p style="margin: 5px 0;">
              📞 <a href="tel:+447359427817" style="color: #83C8E8; text-decoration: none;">07359 427817</a> | 
              ✉️ <a href="mailto:info@glenugiekennels.co.uk" style="color: #83C8E8; text-decoration: none;">info@glenugiekennels.co.uk</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// 6. Thank You & Review Request Email (sent day after checkout)
export function thankYouReviewEmail(booking: Booking): EmailOptions {
  const checkOutDate = format(new Date(booking.checkOut), 'EEEE, MMMM d, yyyy');

  return {
    to: booking.customerEmail,
    subject: `💙 Thank You for Choosing Glenugie Kennels!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">We hope you enjoyed your stay</p>
          </div>
          
          <div class="content">
            <p>Dear ${booking.customerName},</p>
            
            <p>Thank you for trusting us with the care of ${booking.pets.map(p => p.name).join(' and ')} during your time away. We hope they had a wonderful stay in their luxury accommodation!</p>
            
            <div class="details">
              <h3>📅 Your Stay Summary</h3>
              <table>
                <tr>
                  <td>Booking Reference</td>
                  <td>${booking.id}</td>
                </tr>
                <tr>
                  <td>Check-out Date</td>
                  <td>${checkOutDate}</td>
                </tr>
                <tr>
                  <td>Number of Nights</td>
                  <td>${booking.numberOfNights}</td>
                </tr>
                <tr>
                  <td>Accommodation</td>
                  <td>${booking.specificSuite || booking.accommodationType}</td>
                </tr>
              </table>
            </div>

            <div style="background: linear-gradient(135deg, #83C8E8 0%, #5BB5DC 100%); padding: 30px; margin: 30px 0; border-radius: 8px; text-align: center; color: white;">
              <h3 style="margin: 0 0 15px 0; font-size: 24px;">⭐ Share Your Experience</h3>
              <p style="margin: 0 0 20px 0; font-size: 16px;">
                We'd love to hear about your experience! Your feedback helps us continue to provide the best care for our furry guests.
              </p>
              <a href="${GOOGLE_REVIEW_LINK}" class="button" style="background: white; color: #83C8E8; font-size: 16px;">
                Leave a Google Review
              </a>
              <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
                It only takes a minute and means the world to us!
              </p>
            </div>

            <div class="details">
              <h3>🐾 We'd Love to See You Again!</h3>
              <p>Planning another trip? Book your next stay with us and give ${booking.pets.map(p => p.name).join(' and ')} another luxury vacation.</p>
              <p style="text-align: center; margin-top: 20px;">
                <a href="https://www.glenugiekennels.co.uk/booking" class="button">
                  Book Your Next Stay
                </a>
              </p>
            </div>

            <div class="highlight">
              <p style="margin: 0; font-weight: 600;">💡 Did you know?</p>
              <p style="margin: 10px 0 0 0;">
                You can now create a customer account to easily view and manage all your bookings in one place!
              </p>
              <p style="text-align: center; margin-top: 15px;">
                <a href="https://www.glenugiekennels.co.uk/my-bookings" style="color: #83C8E8; text-decoration: none; font-weight: 600;">
                  Access My Bookings →
                </a>
              </p>
            </div>

            <p style="margin-top: 30px;">If you have any questions or feedback, we're always here to help. Just reply to this email or give us a call.</p>
            
            <p style="font-size: 16px; margin-top: 30px;">
              Thank you again for choosing Glenugie Kennels. We hope to welcome ${booking.pets.map(p => p.name).join(' and ')} back soon!
            </p>

            <p style="margin-top: 30px;">
              With warmest regards,<br>
              <strong>The Glenugie Kennels Team</strong> 🐾
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; font-weight: 600;">Glenugie Boarding Kennels</p>
            <p style="margin: 5px 0;">Mains of Springhill, Boddam, Aberdeenshire, AB42 3BH</p>
            <p style="margin: 5px 0;">
              📞 <a href="tel:+447359427817" style="color: #83C8E8; text-decoration: none;">07359 427817</a> | 
              ✉️ <a href="mailto:info@glenugiekennels.co.uk" style="color: #83C8E8; text-decoration: none;">info@glenugiekennels.co.uk</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
              Follow us on social media for updates and adorable pet photos!
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// 7. Admin Booking Notification (for new bookings)
export function adminBookingNotification(booking: Booking, isManualBooking: boolean = false): EmailOptions {
  const checkInDate = format(new Date(booking.checkIn), 'PPP');
  const checkOutDate = format(new Date(booking.checkOut), 'PPP');

  return {
    to: ADMIN_EMAIL,
    subject: `🔔 ${isManualBooking ? 'Manual' : 'New'} Booking - ${booking.customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isManualBooking ? 'Manual Booking Created' : 'New Booking Received'}</h1>
          </div>
          
          <div class="content">
            ${isManualBooking ? `
              <div class="highlight alert-warning">
                <p style="margin: 0;"><strong>⚠️ Manual Booking</strong></p>
                <p style="margin: 5px 0 0 0;">This booking was created manually through the admin dashboard.</p>
              </div>
            ` : ''}

            <div class="details">
              <h3>📋 Booking Information</h3>
              <table>
                <tr>
                  <td>Booking ID</td>
                  <td><strong>${booking.id}</strong></td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td><strong>${booking.status}</strong></td>
                </tr>
                <tr>
                  <td>Created</td>
                  <td>${format(new Date(booking.createdAt), 'PPP p')}</td>
                </tr>
              </table>
            </div>

            <div class="details">
              <h3>👤 Customer Details</h3>
              <table>
                <tr>
                  <td>Name</td>
                  <td><strong>${booking.customerName}</strong></td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td><a href="mailto:${booking.customerEmail}">${booking.customerEmail}</a></td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td><a href="tel:${booking.customerPhone}">${booking.customerPhone}</a></td>
                </tr>
                ${booking.customerAddress ? `
                <tr>
                  <td>Address</td>
                  <td>${booking.customerAddress}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="details">
              <h3>📅 Stay Details</h3>
              <table>
                <tr>
                  <td>Check-in</td>
                  <td><strong>${checkInDate}</strong></td>
                </tr>
                <tr>
                  <td>Check-out</td>
                  <td><strong>${checkOutDate}</strong></td>
                </tr>
                <tr>
                  <td>Nights</td>
                  <td>${booking.numberOfNights}</td>
                </tr>
                <tr>
                  <td>Accommodation</td>
                  <td><strong>${booking.specificSuite || booking.accommodationType}</strong></td>
                </tr>
                ${booking.kennelNumber ? `
                <tr>
                  <td>Kennel Number</td>
                  <td>${booking.kennelNumber}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="details">
              <h3>🐕 Pets (${booking.pets.length})</h3>
              ${booking.pets.map(pet => `
                <div class="pet-card">
                  <table>
                    <tr>
                      <td style="width: 30%;">Name</td>
                      <td><strong>${pet.name}</strong></td>
                    </tr>
                    <tr>
                      <td>Type</td>
                      <td>${pet.type}</td>
                    </tr>
                    <tr>
                      <td>Breed</td>
                      <td>${pet.breed}</td>
                    </tr>
                    <tr>
                      <td>Age</td>
                      <td>${pet.age} years</td>
                    </tr>
                    <tr>
                      <td>Gender</td>
                      <td>${pet.gender}</td>
                    </tr>
                    ${pet.specialRequirements ? `
                    <tr>
                      <td>Special Req.</td>
                      <td><strong>${pet.specialRequirements}</strong></td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
              `).join('')}
            </div>

            <div class="details">
              <h3>💰 Payment Information</h3>
              <table>
                <tr>
                  <td>Total Amount</td>
                  <td><strong>£${booking.totalPrice.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Deposit Paid</td>
                  <td>£${booking.depositAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Balance Due</td>
                  <td><strong>£${(booking.totalPrice - booking.depositAmount).toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Payment Status</td>
                  <td><strong>${booking.paymentStatus}</strong></td>
                </tr>
                ${booking.stripePaymentId ? `
                <tr>
                  <td>Stripe Payment ID</td>
                  <td><code>${booking.stripePaymentId}</code></td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${booking.specialRequests ? `
              <div class="details">
                <h3>📝 Special Requests</h3>
                <p>${booking.specialRequests}</p>
              </div>
            ` : ''}

            <p style="text-align: center; margin-top: 30px;">
              <a href="https://www.glenugiekennels.co.uk/admin" class="button">
                View in Admin Dashboard
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; font-size: 12px; color: #999;">
              This is an automated notification for new bookings.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// 8. Admin Payment Received Notification
export function adminPaymentNotification(booking: Booking, paymentAmount: number, paymentType: 'deposit' | 'balance'): EmailOptions {
  return {
    to: ADMIN_EMAIL,
    subject: `💰 Payment Received - ${booking.customerName} (${booking.id})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Received</h1>
          </div>
          
          <div class="content">
            <div style="background: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 32px;">£${paymentAmount.toFixed(2)}</h2>
              <p style="margin: 10px 0 0 0; font-size: 16px;">${paymentType === 'deposit' ? 'Deposit Payment' : 'Balance Payment'}</p>
            </div>

            <div class="details">
              <h3>📋 Booking Information</h3>
              <table>
                <tr>
                  <td>Booking ID</td>
                  <td><strong>${booking.id}</strong></td>
                </tr>
                <tr>
                  <td>Customer</td>
                  <td><strong>${booking.customerName}</strong></td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td><a href="mailto:${booking.customerEmail}">${booking.customerEmail}</a></td>
                </tr>
                <tr>
                  <td>Check-in</td>
                  <td>${format(new Date(booking.checkIn), 'PPP')}</td>
                </tr>
              </table>
            </div>

            <div class="details">
              <h3>💰 Payment Details</h3>
              <table>
                <tr>
                  <td>Payment Amount</td>
                  <td><strong>£${paymentAmount.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Total Booking</td>
                  <td>£${booking.totalPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Total Paid</td>
                  <td>£${booking.depositAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Balance Remaining</td>
                  <td><strong>£${(booking.totalPrice - booking.depositAmount).toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Payment Status</td>
                  <td><strong>${booking.paymentStatus}</strong></td>
                </tr>
                ${booking.stripePaymentId ? `
                <tr>
                  <td>Stripe Payment ID</td>
                  <td><code>${booking.stripePaymentId}</code></td>
                </tr>
                ` : ''}
              </table>
            </div>

            <p style="text-align: center; margin-top: 30px;">
              <a href="https://www.glenugiekennels.co.uk/admin" class="button">
                View in Admin Dashboard
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

// Send email function using Resend
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const resend = getResendClient();
  
  if (!resend) {
    console.log('📧 [EMAIL - Not Configured]');
    console.log('   To:', options.to);
    console.log('   Subject:', options.subject);
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return false;
    }

    console.log('✅ Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

// Helper functions for common email scenarios

// 1. Send booking confirmation (customer + admin)
export async function sendBookingConfirmation(booking: Booking, isManualBooking: boolean = false): Promise<void> {
  await Promise.all([
    sendEmail(bookingConfirmationEmail(booking)),
    sendEmail(adminBookingNotification(booking, isManualBooking))
  ]);
}

// 2. Send payment received (customer + admin)
export async function sendPaymentReceived(booking: Booking, amount: number, type: 'deposit' | 'balance' | 'full'): Promise<void> {
  await Promise.all([
    sendEmail(paymentReceivedEmail(booking, amount, type)),
    sendEmail(adminPaymentNotification(booking, amount, type === 'full' ? 'deposit' : type))
  ]);
}

// 3. Send booking cancelled (customer only)
export async function sendBookingCancelled(booking: Booking, refundAmount?: number): Promise<void> {
  await sendEmail(bookingCancelledEmail(booking, refundAmount));
}

// 4. Send booking amended (customer only)
export async function sendBookingAmended(
  booking: Booking,
  changes: {
    oldCheckIn?: string;
    oldCheckOut?: string;
    oldAccommodation?: string;
    oldTotalPrice?: number;
  }
): Promise<void> {
  await sendEmail(bookingAmendedEmail(booking, changes));
}

// 5. Send day-before reminder
export async function sendDayBeforeReminder(booking: Booking): Promise<void> {
  await sendEmail(dayBeforeReminderEmail(booking));
}

// 6. Send thank you/review email
export async function sendThankYouReview(booking: Booking): Promise<void> {
  await sendEmail(thankYouReviewEmail(booking));
}

// 7. Send admin payment notification only
export async function sendAdminPaymentNotification(booking: Booking, amount: number, type: 'deposit' | 'balance'): Promise<void> {
  await sendEmail(adminPaymentNotification(booking, amount, type));
}

// Function to check and send day-before reminders (called by cron)
export async function sendDailyReminders(allBookings: Booking[]): Promise<void> {
  const tomorrow = addDays(new Date(), 1);
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
  
  const bookingsCheckingInTomorrow = allBookings.filter(booking => {
    const checkInStr = format(new Date(booking.checkIn), 'yyyy-MM-dd');
    return checkInStr === tomorrowStr && booking.status === 'confirmed';
  });

  console.log(`📧 Sending ${bookingsCheckingInTomorrow.length} day-before reminder emails`);

  for (const booking of bookingsCheckingInTomorrow) {
    await sendDayBeforeReminder(booking);
  }
}

// Function to check and send thank you/review emails (called by cron)
export async function sendDailyThankYous(allBookings: Booking[]): Promise<void> {
  const yesterday = addDays(new Date(), -1);
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
  
  const bookingsCheckedOutYesterday = allBookings.filter(booking => {
    const checkOutStr = format(new Date(booking.checkOut), 'yyyy-MM-dd');
    return checkOutStr === yesterdayStr && booking.status === 'completed';
  });

  console.log(`📧 Sending ${bookingsCheckedOutYesterday.length} thank you/review emails`);

  for (const booking of bookingsCheckedOutYesterday) {
    await sendThankYouReview(booking);
  }
}
