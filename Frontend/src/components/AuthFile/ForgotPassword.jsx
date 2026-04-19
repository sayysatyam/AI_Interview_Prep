/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import {motion} from "framer-motion"
import { FaRobot } from "react-icons/fa6";
import { userAuthStore } from '../../AuthStore/user';
import { useNavigate } from 'react-router-dom';
import logoForgotPass from "../../assets/ForgotPassword.png"
import toast from 'react-hot-toast';
import { Loader, Mail } from 'lucide-react';
const ForgotPassword = () => {
      const { forgetPassword, forgotPasserror, isLoading, clearError } = userAuthStore();
      const [localError, setLocalError] = useState("");
        const [forgotEmail, setForgotEmail] = useState("");
          const navigate = useNavigate();

       useEffect(() => {
    clearError();
  }, [clearError]);
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      setLocalError("Please enter a valid email");
      return;
    }

    setLocalError("");
    const response = await forgetPassword(forgotEmail);
    if (response) {
      toast.success("Reset Link Sent Successfully 🎉")
      navigate("/after-forgotpass");
    }
  };
  return (
    <div className=' w-full min-h-screen bg-[#F0EBE3] flex items-center justify-center px-4 sm:px-6 py-4 overflow-hidden'>
      <motion.div className='w-full max-w-md p-5 sm:p-6 flex flex-col items-center justify-center shadow-2xl bg-white border-2 border-gray-200 rounded-2xl'
      initial={{opacity: 0, y: -40, scale: 0.9}}
      animate={{opacity:1,y:0,scale:1}}
       transition={{ duration: 0.5, ease: "easeOut" }}
      >
             <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="p-2 bg-green-800/30 rounded-full flex items-center justify-center text-white">
                        <FaRobot size={24} />
                      </div>
                      <h2 className="text-[20px] sm:text-[24px] tracking-wider leading-snug font-semibold">
                        Interview.Prep
                      </h2>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-2">
                            <img className='h-45 w-50' src={logoForgotPass} alt="" />
                    </div>

                <div>
                    <h2 className='className="flex flex-col items-center justify-center text-xl sm:text-2xl md:text-3xl font-semibold tracking-wider gap-2 text-center'>Forgot Password
                         <h3 className="text-gray-400 text-xs sm:text-sm font-normal mt-1">
          Enter your email address to receive a reset link
        </h3>
                    </h2>
                </div>


 <form onSubmit={handleForgotPassword} className="flex flex-col gap-4 sm:gap-5 w-full mt-3">
        <div className="relative w-full">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={22}
          />
          <input
            type="email"
            placeholder="you@example.com"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="
              w-full pl-9 pr-4 py-2.5 sm:py-3
                  rounded-xl
                  bg-white-950/70 border border-gray-800/40
                  text-black font-medium placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-gray-800/40
                  text-sm
            "
            required
          />
        </div>

        {(localError || forgotPasserror) && (
          <p className="text-red-400 font-medium text-sm text-center">
            {localError || forgotPasserror}
          </p>
        )}

        <motion.button
          disabled={isLoading}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            type="submit"
            className={`flex items-center justify-center w-full gap-2 font-semibold tracking-wider bg-blue-700 px-2 py-2.5 rounded-xl text-zinc-50 cursor-pointer mt-1 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {isLoading ? (
            <Loader className="w-6 h-6 animate-spin" />
          ) : (
            "Send Reset Link"
          )}
        </motion.button>
      </form>
      </motion.div>
    </div>
  )
}

export default ForgotPassword

