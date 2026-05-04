import type { APIRoute } from 'astro';
import { 
  bookingConfirmationEmail,
  dayBeforeReminderEmail,
  thankYouReviewEmail,
  adminBookingNotification,
  adminPaymentNotification,
  sendEmail
} from '../../../lib/email';
import type { Booking } from '../../../lib/booking-types';

// Create a sample booking for testing
const sampleBooking: Booking = {
  id: 'booking-test-12345',
  customerId: 'customer-test-123',
  
  customerName: 'Sarah Johnson',
  customerEmail: 'sarah.johnson@example.com',
  customerPhone: '07700 900123',
  customerAddress: '123 Main Street',
  customerCity: 'Aberdeen',
  customerCounty: 'Aberdeenshire',
  customerPostcode: 'AB12 3CD',
  customerCountry: 'United Kingdom',
  
  emergencyContactName: 'John Johnson',
  emergencyContactNumber: '07700 900456',
  
  pets: [
    {
      name: 'Max',
      type: 'Dog',
      breed: 'Golden Retriever',
      age: 4,
      gender: 'Male',
      specialRequirements: 'Needs medication twice daily'
    },
    {
      name: 'Bella',
      type: 'Dog',
      breed: 'Labrador',
      age: 2,
      gender: 'Female',
      specialRequirements: ''
    }
  ],
  
  veterinarySurgery: 'Aberdeen Vet Clinic',
  petInsurance: 'Pet Plan UK',
  feedingInstructions: 'Feed twice daily, dry food only',
  medicalInstructions: 'Max needs joint supplement with morning meal',
  hasAggressionIssues: false,
  aggressionDetails: '',
  triesEscape: false,
  escapeDetails: '',
  additionalNotes: 'Max loves tennis balls',
  
  accommodationType: 'luxury-suite',
  specificSuite: 'Barkingham Palace',
  kennelNumber: 'LP-1',
  
  checkIn: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  checkOut: new Date(Date.now() + 86400000 * 8).toISOString(), // 8 days from now
  numberOfNights: 7,
  
  totalPrice: 245,
  depositAmount: 122.50,
  paidAmount: 122.50,
  totalDue: 122.50,
  paymentStatus: 'deposit-paid',
  stripeSessionId: 'cs_test_123456',
  stripePaymentId: 'pi_test_123456',
  
  specialRequests: 'Please give Max his favorite blue blanket',
  
  vaccinationCertificateUrl: '',
  agreedToTerms: true,
  
  status: 'confirmed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const GET: APIRoute = async ({ url }) => {
  const type = url.searchParams.get('type') || 'booking-confirmation';
  const send = url.searchParams.get('send') === 'true';
  const toEmail = url.searchParams.get('email');

  let emailContent;
  let emailName = '';

  switch (type) {
    case 'booking-confirmation':
      emailContent = bookingConfirmationEmail(sampleBooking);
      emailName = 'Booking Confirmation (Customer)';
      break;
    
    case 'day-before':
      emailContent = dayBeforeReminderEmail(sampleBooking);
      emailName = 'Day Before Reminder';
      break;
    
    case 'thank-you':
      emailContent = thankYouReviewEmail(sampleBooking);
      emailName = 'Thank You & Review Request';
      break;
    
    case 'admin-booking':
      emailContent = adminBookingNotification(sampleBooking);
      emailName = 'Admin Booking Notification';
      break;
    
    case 'admin-payment':
      emailContent = adminPaymentNotification(sampleBooking, 122.50, 'deposit');
      emailName = 'Admin Payment Notification';
      break;
    
    default:
      return new Response('Invalid email type. Options: booking-confirmation, day-before, thank-you, admin-booking, admin-payment', {
        status: 400
      });
  }

  // If send=true and email provided, actually send the email
  if (send && toEmail) {
    const success = await sendEmail({
      ...emailContent,
      to: toEmail
    });

    if (success) {
      return new Response(`
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
              .success { background: #4caf50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .info { background: #f0f0f0; padding: 15px; border-radius: 4px; }
              a { color: #0066cc; }
            </style>
          </head>
          <body>
            <div class="success">
              <h2>✅ Email Sent Successfully!</h2>
              <p>The test email was sent to: <strong>${toEmail}</strong></p>
            </div>
            <div class="info">
              <p><strong>Email Type:</strong> ${emailName}</p>
              <p><strong>Subject:</strong> ${emailContent.subject}</p>
              <p>Check your inbox (and spam folder just in case).</p>
              <p><a href="/api/emails/test?type=${type}">← View HTML Preview</a></p>
            </div>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    } else {
      return new Response(`
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
              .error { background: #d74843; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .info { background: #f0f0f0; padding: 15px; border-radius: 4px; }
              code { background: #333; color: #0f0; padding: 2px 6px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <div class="error">
              <h2>❌ Email Send Failed</h2>
              <p>Could not send email. Check that RESEND_API_KEY is configured.</p>
            </div>
            <div class="info">
              <p><strong>Troubleshooting:</strong></p>
              <ul>
                <li>Check that <code>RESEND_API_KEY</code> is set in your .env file</li>
                <li>Verify your Resend API key is valid</li>
                <li>Check console logs for error details</li>
              </ul>
              <p><a href="/api/emails/test?type=${type}">← View HTML Preview</a></p>
            </div>
          </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }

  // Default: Return preview page with test controls
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Preview: ${emailName}</title>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          background: #f5f5f5;
        }
        .controls {
          background: white;
          border-bottom: 2px solid #ddd;
          padding: 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .controls h2 {
          margin: 0 0 15px 0;
          color: #333;
        }
        .btn-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s;
        }
        .btn-primary { background: #83C8E8; color: white; }
        .btn-primary:hover { background: #5BB5DC; }
        .btn-secondary { background: #f0f0f0; color: #333; }
        .btn-secondary:hover { background: #e0e0e0; }
        .btn.active { background: #0066cc; color: white; }
        .send-controls {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }
        .send-controls input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          margin-right: 10px;
          width: 300px;
        }
        .email-info {
          background: #e3f2fd;
          padding: 12px;
          border-radius: 4px;
          margin: 15px 0;
          font-size: 14px;
        }
        .email-info strong { color: #1976d2; }
        iframe {
          width: 100%;
          border: none;
          background: white;
          min-height: calc(100vh - 250px);
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 12px;
          border-radius: 4px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="controls">
        <h2>📧 Email Preview Tool</h2>
        
        <div class="btn-group">
          <a href="?type=booking-confirmation" class="btn ${type === 'booking-confirmation' ? 'active' : 'btn-secondary'}">
            Booking Confirmation
          </a>
          <a href="?type=day-before" class="btn ${type === 'day-before' ? 'active' : 'btn-secondary'}">
            Day Before Reminder
          </a>
          <a href="?type=thank-you" class="btn ${type === 'thank-you' ? 'active' : 'btn-secondary'}">
            Thank You + Review
          </a>
          <a href="?type=admin-booking" class="btn ${type === 'admin-booking' ? 'active' : 'btn-secondary'}">
            Admin Booking Alert
          </a>
          <a href="?type=admin-payment" class="btn ${type === 'admin-payment' ? 'active' : 'btn-secondary'}">
            Admin Payment Alert
          </a>
        </div>

        <div class="email-info">
          <strong>Currently Viewing:</strong> ${emailName}<br>
          <strong>Subject:</strong> ${emailContent.subject}<br>
          <strong>Sample Recipient:</strong> ${emailContent.to}
        </div>

        <div class="send-controls">
          <strong>🚀 Send Test Email:</strong>
          <form method="get" style="margin-top: 10px;">
            <input type="hidden" name="type" value="${type}">
            <input type="email" name="email" placeholder="Enter your email address" required>
            <input type="hidden" name="send" value="true">
            <button type="submit" class="btn btn-primary">Send Test Email</button>
          </form>
          <div class="warning" style="margin-top: 10px; font-size: 12px;">
            ⚠️ Requires RESEND_API_KEY to be configured in .env file
          </div>
        </div>
      </div>

      <iframe srcdoc="${emailContent.html.replace(/"/g, '&quot;')}"></iframe>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
};
