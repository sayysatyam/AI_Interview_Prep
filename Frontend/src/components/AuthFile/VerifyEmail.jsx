/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion';
import { FaRobot } from "react-icons/fa6";
import verifyEmailImage from "../../assets/newVerifyEmailLogo..png"
import { userAuthStore } from '../../AuthStore/user';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
const OTP_LENGTH = 6;
const VerifyEmail = () => {
  const navigate = useNavigate();
       const [code, setCode] = useState(Array(OTP_LENGTH).fill(""));
       const [resendCooldown, setResendCooldown] = useState(0);
      const { verifyEmail, error, isLoading, clearError,resendVerificationCode } = userAuthStore();


        useEffect(() => {
    clearError();
  }, [clearError]);

        const inputRefs = useRef([]);

        const handleChange = (index,value)=>{
              if (!/^\d?$/.test(value)) return;

              const newCode = [...code];
              newCode[index] = value;
              setCode(newCode);

              if(value && index < OTP_LENGTH - 1){
                inputRefs.current[index+1]?.focus();
              }
        };
 const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
   const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const newCode = pasted.split("");
    setCode((prev) => prev.map((_, i) => newCode[i] || ""));

    const focusIndex =
      pasted.length >= OTP_LENGTH ? OTP_LENGTH - 1 : pasted.length;
    inputRefs.current[focusIndex]?.focus();
  };

        const handleSubmit = async (e) => {
    e?.preventDefault();

    const otp = code.join("");
    const success = await verifyEmail(otp);

    if (success) {
      toast.success("Email verified successfully ✅");
      navigate("/login");
    }
  };
  useEffect(() => {
  if (code.every((digit) => digit !== "")) {
    handleSubmit();
  }
}, [code]);
   const resendEmailCode = async(e)=>{
    e?.preventDefault();
    const success = await resendVerificationCode();
     if (success) {
  toast.success("Verification code sent to your email ✅");
  setCode(Array(OTP_LENGTH).fill(""));
  inputRefs.current[0]?.focus();
  setResendCooldown(60);
}
   };
   useEffect(() => {
  if (resendCooldown <= 0) return;

  const timer = setInterval(() => {
    setResendCooldown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [resendCooldown]);

         
  return (
    <div className='w-full min-h-screen bg-[#F0EBE3] flex justify-center items-center px-4 sm:px-6 py-4'>
          <motion.div className='p-5 bg-white w-full max-w-md shadow-2xl border-2 border-gray-200 rounded-2xl  sm:p-6 max-h-[95vh] overflow-y-auto flex justify-center items-center flex-col '  initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}>


              <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="p-2 bg-green-800/30 rounded-full flex items-center justify-center text-white">
                          <FaRobot size={24} />
                        </div>
                        <h2 className="text-[20px] sm:text-[24px] tracking-wider leading-snug font-semibold">
                          Interview.Prep
                        </h2>
                      </div>
<div className="flex items-center justify-center gap-2 mb-2 relative left-5">
        <img className='h-75 w-80' src={verifyEmailImage} alt="" />
</div>
              <div className='flex items-center justify-center'>
                <h2 className='flex flex-col items-center justify-center text-xl sm:text-2xl md:text-3xl font-semibold tracking-wider  text-center '>Verify Your Email
                  <p className="text-gray-400 text-sm sm:text-base font-normal mb-4 ">
          Enter the 6-digit code sent to your email
        </p>
                </h2>
              </div>

                <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="flex justify-between gap-2 sm:gap-4">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              
              className="
                w-10 h-10 sm:w-12 sm:h-12
                text-center text-xl sm:text-2xl font-bold
                bg-white-950/70 text-black
                border border-green-800/30 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-green-600
              "
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`flex gap-3 w-full items-center justify-center
            py-3 sm:p-4 rounded-2xl
            bg-linear-to-r from-purple-600 to-violet-600
            text-white font-semibold text-base sm:text-lg
            transition hover:scale-[1.02]
            ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <Loader className="animate-spin w-6 h-6" />
          ) : (
            "Verify"
          )}
        </button>
      </form>

      <p className="text-black mt-3">Didn't get a code? <button
  onClick={resendEmailCode}
  disabled={resendCooldown > 0 || isLoading}
  className="
    text-blue-400
    cursor-pointer
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
>
  {resendCooldown > 0
    ? `Resend in ${resendCooldown}s`
    : "Resend"}
</button></p>

      {error && (
        <p className="text-red-400 font-medium text-sm text-center mt-2 tracking-wider">
          {error}
        </p>
      )}
          </motion.div>
    </div>
  )
}

export default VerifyEmail

