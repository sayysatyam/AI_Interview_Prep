const { PLANS } = require("../config/plan");
const razorpay = require("../config/razorpay");
const userDetails = require("../models/auth");
const Payment = require("../models/payment");
const crypto = require("crypto")
const createOrder = async(req,res)=>{
    try{

        const  {planCode}  = req.body;
            console.log("Hello : ",planCode);
         if (typeof planCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "Plan code is required",
      });
    }

    const plan = PLANS[planCode.toLowerCase()];

      if (!plan || !plan.active) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unavailable plan",
      });
    }
        const user = await userDetails.findById(req.userId);
          if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
     
            const existingPayment = await Payment.findOne({
                createdBy : req.userId,
                status: "created",
                endsAt: {$gt: new Date()},
            }).sort({createdAt : -1});
                    if(existingPayment){
                        const isExpired = new Date() >= existingPayment?.endsAt;

                        const isCompleted = existingPayment?.status === 'paid';

                        if(!isExpired && !isCompleted){
                           return res.status(200).json({
                                success : true,
                                message : "An active payment already Existing...wait for 5 min or completed that"
                            });
                        }
                    }
                        const receipt = `rcpt_${crypto.randomUUID().replace(/-/g, "")}`;
const createRazorpayOrder = await razorpay.orders.create({
    amount:plan.amountPaise,
 currency: 'INR',
 receipt,
 notes: { customer_id: req.userId, plan: plan.code,name : user.name,planCode : plan.name, creditsGranted : plan.credits }
});         

            const startAt = new Date();
            const duration = 10*60;
            const endsAt = new Date(startAt.getTime() + duration * 1000);
        const orderCreated = new Payment({
            createdBy : req.userId,
          planCode:plan.code,
          planName : plan.name,
          amountPaise:createRazorpayOrder?.amount,
          currency : createRazorpayOrder?.currency,
          razorpayOrderId : createRazorpayOrder?.id,
          status : createRazorpayOrder?.status,
           creditsApplied:false,
           receipt : createRazorpayOrder?.receipt,
           amountPaid : createRazorpayOrder?.amount_paid,
           notes : createRazorpayOrder?.notes,
           creditsGranted : plan.credits,
           startAt,
           duration,
           endsAt
        });
            await orderCreated.save();

    res.status(200).json({
        success : true,
        message : "Order Created",
        order:orderCreated.toJSON(),
        
        
    });

    }catch(error){

        console.log(error);
        res.status(500).json({
            success : false,
            message : "Server Error"
        })
    }
    
};

module.exports = {createOrder};