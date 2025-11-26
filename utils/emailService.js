const nodemailer = require('nodemailer');
const { ADMIN_EMAIL, GMAIL_USER, GMAIL_PASS } = require('../config/env');
const logger = require('./logger');

// Setup email transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

const emailService = {
  /**
   * Send email to customer about booking
   */
  async sendCustomerNotification(booking, vehicle) {
    try {
      if (!booking.customer_email) {
        logger.warn(`No customer email for booking ${booking.id}`);
        return { success: false, error: 'No customer email' };
      }

      const emailTemplates = require('./emailTemplates');
      const template = emailTemplates.bookingConfirmation(booking, vehicle);

      const mailOptions = {
        from: GMAIL_USER,
        to: booking.customer_email,
        subject: template.subject,
        html: template.html
      };

      if (!GMAIL_USER || !GMAIL_PASS) {
        logger.warn('Gmail credentials not configured - email not sent (test mode)');
        return { success: true, message: 'Email would be sent (credentials not configured)' };
      }

      const result = await transporter.sendMail(mailOptions);
      logger.info(`Customer email sent to ${booking.customer_email} for booking ${booking.id}`);
      return { success: true, message: 'Email sent successfully', messageId: result.messageId };
    } catch (error) {
      logger.error(`Failed to send customer email for booking ${booking.id}: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send email to admin about new booking
   */
  async sendAdminNotification(booking, vehicle) {
    try {
      if (!ADMIN_EMAIL) {
        logger.warn('Admin email not configured');
        return { success: false, error: 'Admin email not configured' };
      }

      const emailTemplates = require('./emailTemplates');
      const template = emailTemplates.adminNotification(booking, vehicle);

      const mailOptions = {
        from: GMAIL_USER,
        to: ADMIN_EMAIL,
        subject: template.subject,
        html: template.html
      };

      if (!GMAIL_USER || !GMAIL_PASS) {
        logger.warn('Gmail credentials not configured - admin email not sent (test mode)');
        return { success: true, message: 'Admin email would be sent (credentials not configured)' };
      }

      const result = await transporter.sendMail(mailOptions);
      logger.info(`Admin email sent to ${ADMIN_EMAIL} for booking ${booking.id}`);
      return { success: true, message: 'Admin email sent', messageId: result.messageId };
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
  }
};

module.exports = emailService;
