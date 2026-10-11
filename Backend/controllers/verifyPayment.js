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

        if(!user){
          return res.status(404).json({
        success: false,
        message: "User  not found",
      });
        }
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

const razorpayWebhook = async (req, res) => {
  try {
    
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret || !req.rawBody) {
      return res.status(400).send("Missing webhook data");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

    const received = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).send("Invalid webhook signature");
    }
    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (
      event !== "payment.captured" &&
      event !== "payment.failed"
    ) {
      return res.status(200).json({ success: true });
    }

    if (!paymentEntity) {
      return res.status(400).send("Invalid payment payload");
    }

    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id,
    });

    if (!payment) {
      return res.status(404).send("Payment order not found");
    }

    if (event === "payment.failed") {
      if (payment.status !== "paid") {
        payment.status = "failed";
        await payment.save();
      }
      return res.status(200).json({ success: true });
    }

    if (
      paymentEntity.status !== "captured" ||
      paymentEntity.amount !== payment.amountPaise ||
      paymentEntity.currency !== payment.currency
    ) {
      return res.status(400).send("Payment details mismatch");
    }

    if (payment.status === "paid" && payment.creditsApplied) {
      return res.status(200).json({ success: true });
    }

    if (payment.status !== "created" || payment.creditsApplied) {
      return res.status(200).json({ success: true });
    }

    const user = await userDetails.findById(payment.createdBy);

    if (!user) {
      return res.status(500).send("Payment user not found");
    }

    // 8. Update payment and credits
    payment.status = "paid";
    payment.razorpayPaymentId = paymentEntity.id;
    payment.creditsApplied = true;
    payment.paidAt = new Date();

    user.credits += payment.creditsGranted;

    await payment.save();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return res.status(500).send("Webhook processing failed");
  }
};

module.exports = { verifyPayment, razorpayWebhook };

module.exports = { verifyPayment,razorpayWebhook };