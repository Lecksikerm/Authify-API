const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transporter.verify()
  .then(() => console.log('SMTP ready to send emails'))
  .catch(err => console.warn('SMTP verify failed:', err?.message || err));

async function sendOTPEmail(to, otp, purpose = 'verification') {
  const subject = purpose === 'reset' ? 'Your password reset OTP' : 'Your account verification OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.4">
      <p>Use the code below to ${purpose === 'reset' ? 'reset your password' : 'verify your account'}.</p>
      <h2>${otp}</h2>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html
  });

}
module.exports = { sendOTPEmail };
