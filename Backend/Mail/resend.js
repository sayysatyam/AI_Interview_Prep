const { Resend } = require("resend");
require("dotenv").config();
const resend = new Resend(process.env.RESEND_API_KEY);

const sender = {
  email: "no-reply@zorixs.shop",
  name: "Satyam",
};

const sendMail = async ({ to, subject, html }) => {
  return await resend.emails.send({
    from: `"${sender.name}" <${sender.email}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendMail, sender };
