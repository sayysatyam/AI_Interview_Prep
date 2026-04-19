const express = require('express');
const { signup, verifyEmail, resendVerificationCode, login, logout, forgotPassword, verifyResetToken, resetPassword, checkAuth,  googleAuth } = require('../controllers/auth');
const { verifyToken } = require('../MiddleWare/verify');
const upload = require('../MiddleWare/multer');
const { handleResumeUpload, generateQuestion, submitAnswer, calculate } = require('../controllers/HandleAI');

const route = express.Router();

route.post("/signup",signup);
route.post("/verify-email",verifyEmail);
route.post("/resendotp",verifyToken,resendVerificationCode);
route.post("/login",login);
route.post("/logout",logout);
route.post("/forgot-password",forgotPassword);
route.get("/reset-password/:token",verifyResetToken);
route.post("/reset-password/:token",resetPassword);
route.get("/check-auth",verifyToken,checkAuth);
route.post("/google", googleAuth);
route.post("/aiResumeAnalyzer" ,verifyToken, upload.single("resume"),handleResumeUpload);
route.post("/generate-ques",verifyToken,generateQuestion);
route.post("/submit-answer" , verifyToken ,submitAnswer );
route.post("/calcuate",verifyToken , calculate);
module.exports = route;