const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const Payment = require("../models/payment");
const userDetails = require("../models/auth");
require("dotenv").config();
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      mongoPaymentId,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !mongoPaymentId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const payment = await Payment.findOne({
      _id: mongoPaymentId,
      createdBy: req.userId,
      razorpayOrderId: razorpay_order_id,
    });
        const user = await userDetails.findById(req.userId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    // Already processed?
    if (payment.status === "paid" && payment.creditsApplied) {
      return res.json({
        success: true,
        message: "Payment already verified",
      });
    }

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_SECRET_KEY
      )
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Verify payment status with Razorpay itself.
    const razorpayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.amount !== payment.amountPaise ||
      razorpayPayment.currency !== payment.currency ||
      razorpayPayment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment has not been captured",
      });
    }
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.creditsApplied = true;
    payment.paidAt = new Date();
     const userCreditsBefore = user.credits;
       user.credits += payment.creditsGranted;
       const userCredits = user.credits;
    await payment.save();
        await user.save();
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
      userCreditsBefore,
      userCredits
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};

module.exports = { verifyPayment };