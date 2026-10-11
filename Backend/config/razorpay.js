const Razorpay = require('razorpay');
require("dotenv").config();
if (
  !process.env.RAZORPAY_API_KEY ||
  !process.env.RAZORPAY_SECRET_KEY
) {
  console.warn(
    "Razorpay keys are missing. Configure your backend .env."
  );
}

  const razorpay = new Razorpay({
    key_id : process.env.RAZORPAY_API_KEY,
    key_secret:process.env.RAZORPAY_SECRET_KEY
  });
module.exports = razorpay;