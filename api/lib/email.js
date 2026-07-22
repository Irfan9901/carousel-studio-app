const nodemailer = require('nodemailer');

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

async function sendEmail(to, subject, html) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('EMAIL_USER / EMAIL_PASS not set — email not sent');
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
