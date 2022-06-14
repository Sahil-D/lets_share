const nodemailer = require('nodemailer');

async function sendMail({ from, to, subject, text, html }) {
  let transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_SENDER_EMAIL,
      pass: process.env.NODEMAILER_SENDER_PASSWORD_KEY,
    },
  });

  let info = await transporter.sendMail({
    from: `Let's Share User <${from}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
  });

  console.log('Message sent : ', info.messageId);
}

module.exports = sendMail;
