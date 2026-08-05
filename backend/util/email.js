const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendResetPasswordEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: `PlacePulse <${process.env.GMAIL_USER}>`,
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