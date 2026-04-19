const {VERIFICATION_EMAIL_TEMPLATE,PASSWORD_RESET_REQUEST_TEMPLATE,PASSWORD_RESET_SUCCESS_TEMPLATE,WELCOME_EMAIL_TEMPLATE} = require("../Mail/emailTemplate");

const { sendMail, sender } = require("../Mail/resend");

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const response = await sendMail({
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
    });

    console.log("Email sent successfully", response.id);
  } catch (err) {
    console.error("Error sending verification", err);
    throw err;
  }
};
const sendWelcomeEmail = async (email, userName) => {
  try {
    const response = await sendMail({
      to: email,
      subject: "Welcome From Satyam",
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", userName),
    });

    console.log("Welcome email sent", response.id);
  } catch (err) {
    console.error("Error sending welcome email", err);
    throw err;
  }
};

const sendPasswordResetEmail = async (email, resetlink) => {
  try {
    await sendMail({
      to: email,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "{resetURL}",
        resetlink
      ),
    });
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw error;
  }
};
 const sendResetSuccessEmail = async (email) => {
  try {
    await sendMail({
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log("Password reset success email sent");
  } catch (error) {
    console.error("Error sending password reset success email", error);
    throw error;
  }
};

module.exports = {sendVerificationEmail,sendWelcomeEmail,sendPasswordResetEmail,sendResetSuccessEmail};

