const { ADMIN_EMAIL, RESEND_API_KEY, RESEND_FROM_EMAIL } = require('../config/env');
const logger = require('./logger');

const emailService = {
  /**
   * Send email to customer about booking using Resend
   */
  async sendCustomerNotification(booking, vehicle) {
    try {
      if (!booking.customer_email) {
        logger.warn(`No customer email for booking ${booking.id}`);
        return { success: false, error: 'No customer email' };
      }

      if (!RESEND_API_KEY) {
        logger.warn('Resend API key not configured - email not sent (test mode)');
        return { success: true, message: 'Email would be sent (Resend API key not configured)' };
      }

      const emailTemplates = require('./emailTemplates');
      const template = emailTemplates.bookingConfirmation(booking, vehicle);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: template.subject,
          html: template.html
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      logger.info(`Customer email sent to ${booking.customer_email} for booking ${booking.id}`);
      return { success: true, message: 'Email sent successfully', messageId: result.id };
    } catch (error) {
      logger.error(`Failed to send customer email for booking ${booking.id}: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send email to admin about new booking using Resend
   */
  async sendAdminNotification(booking, vehicle) {
    try {
      if (!ADMIN_EMAIL) {
        logger.warn('Admin email not configured');
        return { success: false, error: 'Admin email not configured' };
      }

      if (!RESEND_API_KEY) {
        logger.warn('Resend API key not configured - admin email not sent (test mode)');
        return { success: true, message: 'Admin email would be sent (Resend API key not configured)' };
      }

      const emailTemplates = require('./emailTemplates');
      const template = emailTemplates.adminNotification(booking, vehicle);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: template.subject,
          html: template.html
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      logger.info(`Admin email sent to ${ADMIN_EMAIL} for booking ${booking.id}`);
      return { success: true, message: 'Admin email sent', messageId: result.id };
    } catch (error) {
      logger.error(`Failed to send admin email: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get WhatsApp template message
   */
  getWhatsappTemplate(booking, vehicle) {
    const emailTemplates = require('./emailTemplates');
    return emailTemplates.whatsappTemplate(booking, vehicle);
  },

  /**
   * Send WordPress booking notification to multiple admin emails
   */
  async sendWordPressBookingNotification(booking, vehicle) {
    try {
      if (!RESEND_API_KEY) {
        logger.warn('Resend API key not configured - email not sent (test mode)');
        return { success: true, message: 'Email would be sent (Resend API key not configured)' };
      }

      // Primary recipient (Resend testing mode only allows verified email)
      // To add rameez.net@gmail.com: verify a domain at resend.com/domains
      const primaryEmail = 'aizaz.dmp@gmail.com';
      const recipients = [primaryEmail];

      const vehicleTypeNames = {
        'classic': 'Classic Sedan',
        'executive': 'Executive',
        'first_class': 'First Class',
        'urban_suv': 'Urban SUV',
        'luxury_suv': 'Luxury SUV',
        'elite_van': 'Elite Van',
        'mini_bus': 'Mini Bus'
      };

      const vehicleName = vehicleTypeNames[booking.vehicle_type] || booking.vehicle_type;
      const createdAt = new Date(booking.created_at).toLocaleString('en-AE', { 
        timeZone: 'Asia/Dubai',
        dateStyle: 'full',
        timeStyle: 'short'
      });

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffc107; margin: 0; font-size: 24px; font-weight: 600;">New WordPress Booking</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">A new booking has been submitted</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Booking ID -->
      <div style="background: #ffc107; color: #1a1a2e; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</span>
        <div style="font-size: 18px; font-weight: 700; margin-top: 5px;">${booking.id.substring(0, 8).toUpperCase()}</div>
      </div>

      <!-- Customer Details -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Customer Details</h3>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #666;">Name:</td><td style="padding: 8px 0; color: #333; font-weight: 500;">${booking.customer_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; color: #333;">${booking.customer_email}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="padding: 8px 0; color: #333;">${booking.customer_phone}</td></tr>
        </table>
      </div>

      <!-- Trip Details -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Trip Details</h3>
        <div style="display: flex; margin-bottom: 15px;">
          <div style="width: 30px;">
            <div style="width: 12px; height: 12px; background: #4caf50; border-radius: 50%; margin: 3px auto;"></div>
            <div style="width: 2px; height: 30px; background: #ddd; margin: 0 auto;"></div>
            <div style="width: 12px; height: 12px; background: #f44336; border-radius: 50%; margin: 3px auto;"></div>
          </div>
          <div style="flex: 1;">
            <div style="padding: 0 0 20px 10px; font-size: 14px; color: #333;">${booking.pickup_location}</div>
            <div style="padding: 10px 0 0 10px; font-size: 14px; color: #333;">${booking.dropoff_location}</div>
          </div>
        </div>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #666;">Passengers:</td><td style="padding: 8px 0; color: #333;">${booking.passengers_count}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Luggage:</td><td style="padding: 8px 0; color: #333;">${booking.luggage_count}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Vehicle:</td><td style="padding: 8px 0; color: #333; font-weight: 500;">${vehicleName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Payment:</td><td style="padding: 8px 0; color: #333;">${booking.payment_method}</td></tr>
        </table>
      </div>

      ${booking.notes ? `
      <!-- Notes -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Special Instructions</h3>
        <p style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px; color: #333; margin: 0;">${booking.notes}</p>
      </div>
      ` : ''}

      <!-- Fare -->
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 8px; text-align: center;">
        <span style="color: #999; font-size: 12px; text-transform: uppercase;">Total Fare</span>
        <div style="color: #ffc107; font-size: 28px; font-weight: 700; margin-top: 5px;">AED ${parseFloat(booking.fare_aed || 0).toFixed(2)}</div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">Submitted: ${createdAt}</p>
        <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">Source: WordPress Booking Form</p>
      </div>
    </div>
  </div>
</body>
</html>`;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL || 'noreply@bareerah.com',
          to: recipients,
          subject: `🚗 New WordPress Booking - ${booking.customer_name} (${vehicleName})`,
          html: emailHtml
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      logger.info(`WordPress booking email sent to ${recipients.join(', ')} for booking ${booking.id}`);
      return { success: true, message: 'Email sent successfully', messageId: result.id };
    } catch (error) {
      logger.error(`Failed to send WordPress booking email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;
