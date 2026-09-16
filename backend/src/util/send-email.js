const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetPasswordEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await resend.emails.send({
    from: 'PlacePulse <onboarding@resend.dev>', // Resend's default test sender; swap once you verify your own domain
    to: toEmail,
    subject: 'Reset your PlacePulse password',
    html: `
      <p>You requested a password reset for your PlacePulse account.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
};

module.exports = sendResetPasswordEmail;