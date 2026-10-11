const express = require('express');
const { verifyToken } = require('../../MiddleWare/verify');
const { createOrder } = require('../../controllers/createPayment');
const { verifyPayment } = require('../../controllers/verifyPayment');

const paymentRouter = express.Router();

paymentRouter.post("/payment-create",verifyToken,createOrder);
paymentRouter.post("/payment-verify",verifyToken,verifyPayment);
module.exports = paymentRouter;