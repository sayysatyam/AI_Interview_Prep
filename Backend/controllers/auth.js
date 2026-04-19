const userDetails = require("../models/auth");
const bcryptjs = require('bcryptjs');
const crypto = require("crypto");
const { generateVerificationCode } = require("../utils/generateVerifcationCode");
const { generateTokenAndSetCookies } = require("../utils/generateToken&setCookies");
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require("../Mail/email");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const signup = async(req,res)=>{
    const {name,email,password} = req.body;

    try {
        if(!name || !email  || !password){
            return res.status(400).send({success : false , msg:"All User Details Fields Required"});
        }
        const alreadyExistUserEmail = await userDetails.findOne({email});
        if(alreadyExistUserEmail){
            return res.status(400).send({success:false,msg:"User Already Exist With Same Email"});
        };
        
            const hashPassword = await bcryptjs.hash(password,10);
            const otp = generateVerificationCode();

            const newUser = new userDetails({
                email,
                password:hashPassword,
                name,
                verificationToken:otp,
                verificationTokenExpireAt:Date.now()+1*60*60*1000,
            });
            await newUser.save();
            generateTokenAndSetCookies(res,newUser._id);
            await sendVerificationEmail(newUser.email,newUser.verificationToken);
            res.status(200).send({
                success : true,
                msg:"User Created Successfully",
                user:{
                    ...newUser._doc,
                    password:null
                },
            });

    } catch (error) {
        return res.status(500).send({ success: false, msg: "ERROR" });
    }
};
const resendVerificationCode = async (req, res) => {
  try {
    const reverifyCodeUser = await userDetails.findById(req.userId);

    if (!reverifyCodeUser) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (reverifyCodeUser.isVerified) {
      return res.status(400).json({
        success: false,
        msg: "User already verified",
      });
    }
    const COOLDOWN_TIME = 60 * 1000;

    if (
      reverifyCodeUser.lastVerificationEmailSentAt &&
      Date.now() - reverifyCodeUser.lastVerificationEmailSentAt.getTime() <
        COOLDOWN_TIME
    ) {
      const remainingSeconds = Math.ceil(
        (COOLDOWN_TIME -
          (Date.now() -
            reverifyCodeUser.lastVerificationEmailSentAt.getTime())) /
          1000,
      );

      return res.status(429).json({
        success: false,
        msg: `Please wait ${remainingSeconds}s before resending the verification email`,
      });
    }
    let verificationCode;
    do {
      verificationCode = generateVerificationCode();
    } while (verificationCode.length !== 6);

    reverifyCodeUser.verificationToken = verificationCode;
    reverifyCodeUser.verificationTokenExpireAt =
      Date.now() + 24 * 60 * 60 * 1000;
    reverifyCodeUser.lastVerificationEmailSentAt = Date.now();

    await reverifyCodeUser.save();

    await sendVerificationEmail(reverifyCodeUser.email, verificationCode);

    return res.status(200).json({
      success: true,
      msg: "Verification email resent successfully",
    });
  } catch (error) {
    console.error("Error in resendVerificationCode:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

const verifyEmail = async(req,res)=>{
    const {code} = req.body;
    try {
        const verifiedUser = await userDetails.findOne({
            verificationToken:code,
            verificationTokenExpireAt:{$gt:Date.now()}
        });
        if(!verifiedUser){
            return res.status(400).send({
                success:false,
                msg:"Invalid or expired verification code"
            });
        }
        verifiedUser.isVerified=true;
        verifiedUser.verificationToken=undefined;
        verifiedUser.verificationTokenExpireAt=undefined;
        await verifiedUser.save();
        await sendWelcomeEmail(verifiedUser.email,verifiedUser.name);
        res.clearCookie("uid");
        return res.status(200).json({
    success: true,
    msg: "Email verified successfully",
  });
    } catch (error) {
        return res.status(500).send({success:false,msg:"Something went wrong"});
    };
};
const login = async(req,res)=>{
    const {email,password} = req.body;
    try {
        if((!email) || !password){
            return res.status(400).send({
                success:false,
                msg:"Please fill all the Required Fields"
            });
        };
        const existingUser = await userDetails.findOne({email});
        if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    };
    if (!existingUser.password) {
  return res.status(400).json({
    success: false,
    msg: "Please login using Google",
  });
}
    const isPasswordValid = await bcryptjs.compare(password,existingUser.password);
    if(!isPasswordValid){
         return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    };
    generateTokenAndSetCookies(res,existingUser._id);
    existingUser.lastLogin = new Date();
    await existingUser.save();
    res.status(200).json({
        success: true,
      msg: "Logged in successfully",
      user: {
        ...existingUser._doc,
        password: undefined,
      },
    });
    } catch (error) {
         console.log("Error in login ", error);
    res.status(400).json({ success: false, msg: error.message });
    }
};
const logout = (req, res) => {
  res.clearCookie("uid", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    msg: "Logged out successfully",
  });
};

const forgotPassword = async(req,res)=>{
    const {email} = req.body;
    try {
        const validateUser = await userDetails.findOne({email});
        if(!validateUser){
            return res.status(400).send({
                success : false,
                msg : "User Doesn't Exist"
            });
        };
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpires = Date.now() + 1 * 60 * 60 * 1000;
        validateUser.resetPasswordToken = resetToken;
        validateUser.resetPasswordExpireAt = resetTokenExpires;
        await validateUser.save();
        await sendPasswordResetEmail(
            validateUser.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
        );
        res
      .status(200)
      .json({
        success: true,
        message: "Password reset link sent to your email",
        user: { ...validateUser },
      });
    } catch (error) {
        console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
    }
};

const verifyResetToken = async(req,res)=>{
    const {token} = req.params;

    try {
        const resetVerifyUser = await userDetails.findOne({
            resetPasswordToken:token,
            resetPasswordExpireAt: { $gt: Date.now() },
        });
        if(!resetVerifyUser){
            return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
        };
         return res.status(200).json({
      success: true,
      message: "Valid reset token",
    });
    } catch (error) {
        return res.status(500).json({
      success: false,
      message: "Server error",
    });
    }
};

const resetPassword = async(req,res)=>{
    const {token} = req.params;
    const {password} = req.body;
    try {
        const resetUser = await userDetails.findOne({
            resetPasswordToken:token,
            resetPasswordExpireAt:{$gt:Date.now()},
        });
        if(!resetUser){
            return res.status(400).send({
                success : false,
                msg:"Invalid or expired reset token",
            })
        };
        const hashPassword = await bcryptjs.hash(password,10);
        resetUser.password = hashPassword;
        resetUser.resetPasswordToken = undefined;
        resetUser.resetPasswordExpireAt = undefined;
        await resetUser.save();
        await sendResetSuccessEmail(resetUser.email);
        res.status(200).json({
      success: true,
      message: "Password reset successful",
      user: {
        _id: resetUser._id,
        email: resetUser.email,
      },
    });
    } catch (error) {
        console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
    }
};
const checkAuth = async (req, res) => {
  try {
    const checkUser = await userDetails
      .findById(req.userId)
      .select("-password -resetPasswordToken -resetPasswordExpireAt");
    if (!checkUser) {
      return res.status(401).json({
        success: false,
        msg: "Invalid User",
      });
    }
    res.status(200).json({ success: true, user: checkUser });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub, email, name, picture } = ticket.getPayload();

    let existingUser = await userDetails.findOne({ email });

    if (existingUser && existingUser.provider === "local") {
      return res.status(400).json({
        success: false,
        msg: "This email is registered using password login",
      });
    }
    if (!existingUser) {
      existingUser = new userDetails({
        name,
        email,
        googleId: sub,
        avatar: picture,
        provider: "google",
        isVerified: true,
      });
      await existingUser.save();
    }
    generateTokenAndSetCookies(res, existingUser._id);
    existingUser.lastLogin = new Date();
    await existingUser.save();
    return res.status(200).json({
      success: true,
      msg: "Google login successful",
      user: {
        ...existingUser._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(401).json({
      success: false,
      msg: "Google authentication failed",
    });
  }
};


module.exports = {signup,verifyEmail,resendVerificationCode,login,logout,forgotPassword,verifyResetToken,resetPassword,checkAuth,googleAuth};