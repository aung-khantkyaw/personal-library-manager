const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
  return { accessToken, refreshToken };
};

const sendWelcomeEmail = async (email) => {
  const from = process.env.EMAIL_FROM;
  const subject = "Welcome to Personal Library Manager";
  const html = `<p>Hey there!</p><p>Welcome to <strong>Personal Library Manager</strong>!</p><p>Thanks for signing up. You can now add and manage your personal library.</p>`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({ from, to: email, subject, html });
  } catch (err) {
    console.error("Failed to send welcome email to ", email, ": ", err);
  }
};

module.exports = { generateTokens, sendWelcomeEmail };
