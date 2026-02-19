const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const getTemplate = (content, title) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px;">
    <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="margin: 0;">🛒 Smart Shopping Card</h1>
    </div>
    <div style="padding: 20px; color: #333;">
      <h2 style="color: #4f46e5;">${title}</h2>
      ${content}
      <br>
      <p>Best Regards,<br><strong>Smart Shopping Support Team</strong></p>
    </div>
    <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;">
      This is an automated message. Please do not reply.
    </div>
  </div>
`;

exports.sendOtpEmail = async (email, otp) => {
  const html = getTemplate(`
    <p>Hello,</p>
    <p>You requested a password reset for your Smart Shopping Card account.</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 5px; background: #f0f0ff; padding: 10px 20px; border-radius: 5px;">${otp}</span>
    </div>
    <p>This code will expire in 10 minutes.</p>
  `, "Password Reset OTP");

  await transporter.sendMail({
    from: `"Smart Shopping Card" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: html
  });
};