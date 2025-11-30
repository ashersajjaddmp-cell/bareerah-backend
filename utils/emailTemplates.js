/**
 * Email & WhatsApp Notification Templates
 * NOTE: Commissions and profits are NEVER sent to customers - internal use only
 */

const emailTemplates = {
  // Email to customer
  bookingConfirmation: (booking, vehicle) => {
    const paymentStatus = booking.payment_method === 'cash' 
      ? 'Payment will be collected in the vehicle'
      : 'Payment paid by card';
    
    return {
      subject: `Booking Confirmed - Ref #${booking.id.substring(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007AFF;">Booking Confirmed! 🎉</h2>
          
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1d1d1f;">Booking Details</h3>
            <p><strong>Booking Number:</strong> ${booking.id.substring(0, 8).toUpperCase()}</p>
            <p><strong>Date & Time:</strong> ${new Date(booking.created_at).toLocaleString()}</p>
          </div>

          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1d1d1f;">Trip Information</h3>
            <p><strong>Pickup Location:</strong> ${booking.pickup_location}</p>
            <p><strong>Drop-off Location:</strong> ${booking.dropoff_location}</p>
            <p><strong>Distance:</strong> ${booking.distance_km} km</p>
          </div>

          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1d1d1f;">Vehicle Details</h3>
            ${vehicle ? `
              <p><strong>Vehicle:</strong> ${vehicle.model} (${vehicle.type})</p>
              <p><strong>License Plate:</strong> ${vehicle.plate_number}</p>
              <p><strong>Color:</strong> ${vehicle.color || 'Standard'}</p>
              <p><strong>Driver:</strong> ${booking.driver_name || 'To be assigned'}</p>
            ` : '<p>Vehicle to be assigned shortly</p>'}
          </div>

          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1d1d1f;">Payment</h3>
            <p><strong>Total Fare:</strong> AED ${(typeof booking.fare_aed === 'string' ? parseFloat(booking.fare_aed) : booking.fare_aed).toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${paymentStatus}</p>
          </div>

          <div style="background: #34C759; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">AED ${(typeof booking.fare_aed === 'string' ? parseFloat(booking.fare_aed) : booking.fare_aed).toFixed(2)}</p>
          </div>

          <p style="color: #86868b; font-size: 12px; margin-top: 30px;">
            Thank you for choosing Bareerah! If you have any questions, please contact our support team.
          </p>
        </div>
      `
    };
  },

  // WhatsApp message to customer
  whatsappTemplate: (booking, vehicle) => {
    const paymentStatus = booking.payment_method === 'cash' 
      ? '💳 Payment in vehicle'
      : '✓ Paid by card';
    
    return `
🚕 *BOOKING CONFIRMED*

*Booking #:* ${booking.id.substring(0, 8).toUpperCase()}

📍 *Pickup:* ${booking.pickup_location}
📍 *Drop-off:* ${booking.dropoff_location}

🚗 *Vehicle:* ${vehicle ? vehicle.model : 'To be assigned'}
${vehicle ? `📋 *Plate:* ${vehicle.plate_number}` : ''}
${booking.driver_name ? `👤 *Driver:* ${booking.driver_name}` : ''}

💰 *Fare:* AED ${(typeof booking.fare_aed === 'string' ? parseFloat(booking.fare_aed) : booking.fare_aed).toFixed(2)}
${paymentStatus}

Thank you for choosing Bareerah! 🙏
    `.trim();
  },

  // Email to admin
  adminNotification: (booking, vehicle) => {
    const fareAmount = typeof booking.fare_aed === 'string' ? parseFloat(booking.fare_aed) : booking.fare_aed;
    const vendorCommission = fareAmount * 0.80;
    const companyProfit = fareAmount * 0.20;

    return {
      subject: `New Booking - Ref #${booking.id.substring(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007AFF;">📊 New Booking Alert</h2>
          
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Customer Info</h3>
            <p><strong>Name:</strong> ${booking.customer_name}</p>
            <p><strong>Phone:</strong> ${booking.customer_phone}</p>
            <p><strong>Email:</strong> ${booking.customer_email}</p>
          </div>

          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Trip Details</h3>
            <p><strong>Booking #:</strong> ${booking.id}</p>
            <p><strong>From:</strong> ${booking.pickup_location}</p>
            <p><strong>To:</strong> ${booking.dropoff_location}</p>
            <p><strong>Distance:</strong> ${booking.distance_km} km</p>
            <p><strong>Type:</strong> ${booking.booking_type}</p>
          </div>

          ${vehicle ? `
            <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Vehicle</h3>
              <p><strong>Model:</strong> ${vehicle.model}</p>
              <p><strong>Plate:</strong> ${vehicle.plate_number}</p>
              <p><strong>Driver:</strong> ${booking.driver_name || 'Unassigned'}</p>
            </div>
          ` : ''}

          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Revenue Breakdown</h3>
            <p><strong>Total Fare:</strong> AED ${fareAmount.toFixed(2)}</p>
            <p><strong>Vendor Commission (80%):</strong> AED ${vendorCommission.toFixed(2)}</p>
            <p style="color: #34C759;"><strong>Company Profit (20%):</strong> AED ${companyProfit.toFixed(2)}</p>
          </div>

          <p style="color: #86868b; font-size: 12px;">Status: ${booking.status}</p>
        </div>
      `
    };
  }
};

module.exports = emailTemplates;
