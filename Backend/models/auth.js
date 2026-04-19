const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
  },
    },
     profilePic : {
      type:String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
  type: String,
  enum: ["local", "google"],
  default: "local",
},
googleId: {
  type: String,
},
avatar: {
  type: String,
},
    resetPasswordToken: String,
    resetPasswordExpireAt: Date,
    verificationToken: String,
    verificationTokenExpireAt: Date,
    lastVerificationEmailSentAt: {
  type: Date,
},
credits : {
  type:String,
  default:100
}
},{timestamps:true});

const userDetails = mongoose.model("userDetails",userSchema);

module.exports = userDetails;
