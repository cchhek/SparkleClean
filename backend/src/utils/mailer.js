const nodemailer = require('nodemailer');

const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};

let transporter;
if (emailConfig.auth.user && emailConfig.auth.pass) {
  transporter = nodemailer.createTransport(emailConfig);
} else {
  console.log('mailer.js: SMTP configuration missing. Using mock/logging mailer fallback.');
}

async function sendBookingConfirmation(booking, serviceName, addonList = []) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Sparkle Cleaning" <bookings@sparklecleaning.com>',
    to: booking.customerEmail,
    subject: `Booking Confirmed! Ref: #${booking.bookingRef}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #2563eb; margin-top: 0;">Sparkle Cleaning Booking Confirmation</h2>
        <p>Dear <strong>${booking.customerName}</strong>,</p>
        <p>Thank you for choosing Sparkle Cleaning! Your booking has been successfully placed and paid.</p>
        
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Reference Number:</td>
              <td style="padding: 6px 0; font-weight: bold;">#${booking.bookingRef}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Service Type:</td>
              <td style="padding: 6px 0; font-weight: bold;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Property:</td>
              <td style="padding: 6px 0;">${booking.propertyType} (${booking.bedrooms} Bed, ${booking.bathrooms} Bath)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Date & Time:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2563eb;">
                ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${booking.timeSlot}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Address:</td>
              <td style="padding: 6px 0;">${booking.customerAddress}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Phone:</td>
              <td style="padding: 6px 0;">${booking.customerPhone}</td>
            </tr>
          </table>
        </div>

        ${addonList.length > 0 ? `
        <div style="margin: 20px 0;">
          <h4 style="margin-bottom: 8px; color: #1e293b;">Additional Services Included:</h4>
          <ul style="padding-left: 20px; margin: 0; color: #475569;">
            ${addonList.map(addon => `<li>${addon.name} ($${addon.price.toFixed(2)})</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <div style="border-top: 2px solid #e2e8f0; padding-top: 16px; text-align: right;">
          <span style="font-size: 16px; color: #64748b;">Total Paid:</span>
          <span style="font-size: 24px; font-weight: bold; color: #2563eb; margin-left: 8px;">$${booking.totalPrice.toFixed(2)}</span>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          If you need to reschedule or cancel your booking, please contact us at least 24 hours in advance at <a href="mailto:support@sparklecleaning.com" style="color: #2563eb;">support@sparklecleaning.com</a>.
        </p>
      </div>
    `
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  } else {
    console.log('--- MOCK EMAIL OUTBOX ---');
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log('Content (HTML):');
    console.log(mailOptions.html);
    console.log('-------------------------');
    return { mock: true };
  }
}

module.exports = {
  sendBookingConfirmation
};
