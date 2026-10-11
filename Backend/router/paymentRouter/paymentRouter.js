const express = require('express');
const { verifyToken } = require('../../MiddleWare/verify');
const { createOrder } = require('../../controllers/createPayment');
const { verifyPayment, razorpayWebhook } = require('../../controllers/verifyPayment');

const paymentRouter = express.Router();

paymentRouter.post("/payment-create",verifyToken,createOrder);
paymentRouter.post("/payment-verify",verifyToken,verifyPayment);
paymentRouter.post("/payment/webhook",razorpayWebhook);
module.exports = paymentRouter;