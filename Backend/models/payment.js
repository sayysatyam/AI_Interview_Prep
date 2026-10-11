const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        required:true,
        index:true,
        ref : "userDetails"
    },
    receipt : {
            type:String
    },
    amountPaid:{
            type : Number,
            default:0
    },
    planCode : {
        type :String,
        required :true
    },
    planName : {
        type :String,
        required : true
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
    notes:{
        customer_id: {
            type:String
        },

       planCode: {
      type: String,
      required: true,
      enum: ["go", "plus", "pro"],
    },
name : {
  type:String
       },planCode : {
          type:String
       }
    }
    ,
    currency: {
      type: String,
      default: "INR",
      required: true,
    },

    creditsGranted: {
      type: Number,
      min: 1,
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed","expired"],
      default: "created",
      index: true,
    },

    creditsApplied: {
      type: Boolean,
      default: false,
    },
    startAt:{
            type: Date,
      default: null,
      required:true
    },
    endsAt :{
             type: Date,
      default: null,
      required:true
    },
    duration : {
        type :Number,
        required:true
    },

    paidAt: {
      type: Date,
      default: null,
    },
},{timestamps:true});


const Payment = mongoose.model("Payment",paymentSchema);

module.exports = Payment;