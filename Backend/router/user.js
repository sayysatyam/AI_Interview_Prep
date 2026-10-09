const express = require('express');
const { signup, verifyEmail, resendVerificationCode, login, logout, forgotPassword, verifyResetToken, resetPassword, checkAuth,  googleAuth } = require('../controllers/auth');
const { verifyToken } = require('../MiddleWare/verify');
const upload = require('../MiddleWare/multer');
const { handleResumeUpload, generateQuestion, submitAnswer, calculate, getHistory, getParticularHistory } = require('../controllers/HandleAI');
const { codeQuesGenerator, codeQuesDetail } = require('../controllers/codeAI');
const { codeSubmitAI, submitCode } = require('../controllers/codeSubmitAi');
const { getCodingHistory } = require('../controllers/getCodeHis');
const { codeANALYSISAI, codeHistory } = require('../controllers/codeAnalysisAI');
const {authLimiter,
  verifyOtpLimiter,
  resendOtpLimiter,
  passwordResetLimiter} =  require("../MiddleWare/authRateLimit");
const route = express.Router();

route.post("/signup",authLimiter,signup);
route.post("/verify-email",verifyOtpLimiter,verifyEmail);
route.post("/resendotp",  resendOtpLimiter,verifyToken,resendVerificationCode);
route.post("/login",authLimiter,login);
route.post("/logout",logout);
route.post("/forgot-password",passwordResetLimiter,forgotPassword);
route.get("/reset-password/:token",passwordResetLimiter,verifyResetToken);
route.post("/reset-password/:token",passwordResetLimiter,resetPassword);
route.get("/check-auth",verifyToken,checkAuth);
route.post("/google", googleAuth);
route.post("/aiResumeAnalyzer" ,verifyToken, upload.single("resume"),handleResumeUpload);
route.post("/generate-ques",verifyToken,generateQuestion);
route.post("/submit-answer" , verifyToken ,submitAnswer );
route.post("/calculate",verifyToken , calculate);
route.get("/getHistory",verifyToken,getHistory);
route.get("/historyStats/:hisId",verifyToken,getParticularHistory);
route.post("/code",verifyToken,codeQuesGenerator);
route.get("/startCoding/:id",verifyToken,codeQuesDetail);
route.post("/submitCode",verifyToken,submitCode);
route.get("/getCodeHistory",verifyToken,getCodingHistory);

route.post("/code/:id/analysis",verifyToken,codeANALYSISAI);
route.get("/code/:id/history",verifyToken,codeHistory);
module.exports = route;