/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import React from "react";
import { FaRobot } from "react-icons/fa6";
import AfterForgotPassword from "../../assets/AfterForgotPassword.png"
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { userAuthStore } from "../../AuthStore/user";
const AfterForgotPass = () => {
    const {isLoading} = userAuthStore();
  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-[#F0EBE3] sm:px-6 p-5 overflow-hidden">
      <motion.div
        className="w-full max-w-md p-5 sm:p-6 bg-white shadow-2xl border-2 border-gray-200 rounded-2xl"
        initial={{ scale: 0.9, y: -40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
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
                <div className="flex items-center justify-center relative bottom-10">
                    <img className="h-75 w-80" src={AfterForgotPassword} alt="" />
                </div>

                     <div className="text-center flex flex-col gap-3 relative bottom-20">
        <h1
          className="
            text-2xl sm:text-3xl md:text-4xl font-bold
           text-black"
        >
          Reset link sent
        </h1>

        <div className="flex flex-col gap-1  text-xs sm:text-sm font-semibold ">
          <p className="text-green">Please check your email.</p>
          <p className="font-normal">
            We’ve sent you a message with a password recovery link.
          </p>
        </div>
      </div>


       <div className="relative bottom-14 lg:bottom-10 md:bottom-10">
        <motion.button
        onClick={() => window.open("https://mail.google.com", "_blank")}
        disabled={isLoading}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            type="submit"
            className={`flex items-center justify-center w-full gap-2 font-semibold tracking-wider bg-blue-700 px-2 py-2.5 rounded-xl text-zinc-50 cursor-pointer mt-1 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
      >
        Open My Email <Mail size={20} />
      </motion.button>

      <div className="flex flex-col justify-center items-center gap-1 text-xs sm:text-sm text-gray-400 text-center relative top-8 lg:top-4 md:top-4">
        <p>Didn’t receive the email?</p>
        <p>
          Contact us at{" "}
          <Link
            className="text-blue-500 hover:text-blue-300 transition break-all"
            to="https://mail.google.com/mail/?view=cm&fs=1&to=sayysatyam@gmail.com&su=Password%20Reset%20Help&body=Hi,%20I%20didn’t%20receive%20the%20password%20reset%20email."
            target="_blank"
            rel="noopener noreferrer"
          >
            sayysatyam@gmail.com
          </Link>
        </p>
      </div>
       </div>
<Link
  to="/login"
  className="
    inline-flex items-center gap-2 w-fit
    px-5 py-2.5 rounded-full
    border border-gray-200 bg-white
    text-sm font-medium text-gray-800
    transition-all duration-150
    hover:bg-gray-50 hover:border-gray-300 hover:-translate-x-1
    active:scale-95
  "
>
  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 border border-gray-200">
    <ArrowLeft size={10} />
  </span>
  Back to Login
</Link>
      </motion.div>
    </div>
  );
};

export default AfterForgotPass;
