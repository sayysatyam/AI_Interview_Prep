const jwt = require('jsonwebtoken');
require("dotenv").config();
const generateTokenAndSetCookies = async(res,userId)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"1d"
    });

    res.cookie("uid",token,{
        httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict",
            maxAge : 24*60*60*1000
    });
    return token;
};
module.exports = {generateTokenAndSetCookies};