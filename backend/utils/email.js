"use strict";
/**
 * Email utility functions
 * NOTE: This is a placeholder implementation. In production, you would integrate
 * with an email service like SendGrid, AWS SES, or Postmark.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.generatePasswordResetEmail = generatePasswordResetEmail;
async function sendEmail(options) {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content: ${options.text || 'HTML email'}`);
        return true;
    }
    // TODO: Implement actual email sending
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(options);
    throw new Error('Email sending not implemented in production');
}
function generatePasswordResetEmail(resetUrl) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>You requested a password reset for your Ezra account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
    </div>
  `;
    const text = `
Reset Your Password

You requested a password reset for your Ezra account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.
  `.trim();
    return {
        to: '',
        subject: 'Reset Your Ezra Password',
        html,
        text,
    };
}
//# sourceMappingURL=email.js.map