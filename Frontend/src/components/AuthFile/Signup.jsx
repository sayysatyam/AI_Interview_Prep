/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Loader, Lock, LogIn, LogInIcon, Mail, Signal, Sparkle, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FaRobot } from "react-icons/fa6";
import { GoogleLogin } from "@react-oauth/google";
import { userAuthStore } from '../../AuthStore/user';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
  const { googleLogin, isAuthenticated, user, Logingerror, isLoading, clearError,signup } = userAuthStore();
        const [Name, setName] = useState("");
        const [Email, setEmail] = useState("");
        const [Password, setPassword] = useState("");
  const handleGoogleSuccess = async (credentialResponse) => {
    const success = await googleLogin(credentialResponse.credential);

    if (success) {
      toast.success("Signed in with Google 🎉");
    }
  };
const handleSignup = async(e)=>{
        e.preventDefault();
        const res = await signup(Name,Email,Password);
        if(res){
             toast.success("Signup successful 🎊");
      navigate("/verify-email");
        }
};
useEffect(() => {
  if (isAuthenticated && user?.isVerified) {
    navigate("/");
  }
}, [isAuthenticated, user, navigate]);
 useEffect(() => {
    clearError();
  }, []);
  return (
    <div className='w-full min-h-screen bg-[#F0EBE3] flex justify-center items-center px-4 sm:px-6 py-4'>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className='w-full max-w-md bg-white rounded-2xl border-2 border-gray-200 shadow-2xl p-5 sm:p-6 max-h-[95vh] overflow-y-auto '
      >
        <div className="flex items-center justify-center gap-2 mb-3 w-full">
          <div className="p-2 bg-green-800/30 rounded-full flex items-center justify-center text-white">
            <FaRobot size={24} />
          </div>
          <h2 className="text-[20px] sm:text-[24px] tracking-wider leading-snug font-semibold">
            Interview.Prep
          </h2>
        </div>

        <div className="w-full">
          <h1 className='text-2xl md:text-3xl flex flex-col items-center justify-center tracking-wider font-semibold text-center'>
            Create an account
            <span className='flex flex-wrap items-center justify-center gap-2 bg-green-100 px-4 sm:px-6 py-2 rounded-full text-green-600 font-semibold mt-3 text-center w-full sm:w-auto'>
              <Sparkle size={18} className="shrink-0" />
              <motion.h2
              initial={{opacity:0.3,y:-4}}
              animate={{opacity:1,y:1}}
              transition={{duration:0.8,ease:"easeInOut"}}
              className='text-sm font-medium tracking-normal '>Start Your AI-Powered Interview Journey</motion.h2>
            </span>
          </h1>
          <p className="text-center text-gray-500 mt-3 text-xs sm:text-sm mb-5 leading-relaxed px-2">
            Practice mock interviews, get instant feedback, and grow your confidence.
          </p>
        </div>

        <div className="flex justify-center w-full">
          <div className="flex justify-center w-full max-w-70 sm:max-w-xs">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed")}
              theme="filled_black"
              size="large"
              text="continue_with"
              shape="pill"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 my-4 w-full">
          <hr className="w-full border-gray-200" />
          <p className="tracking-widest font-bold bg-green-300/20 px-2 py-1 rounded-full text-green-600 text-xs">
            OR
          </p>
          <hr className="w-full border-gray-200" />
        </div>
        
        <form onSubmit={handleSignup} className="flex flex-col gap-3 sm:gap-4 w-full">

            {/* //NAME DIV */}
            <div className='w-full'>
                <label className=' text-black font-semibold mb-1 block text-sm'>
                    Name
                </label>
                <div className='relative w-full'>
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}/>
                <input type="text"
                    value={Name}
                    onChange={(e)=>setName(e.target.value)}
                    placeholder='Full Name'
                    className="
                  w-full pl-10 pr-4 py-2.5 sm:py-3
                  rounded-xl
                  bg-white-950/70 border border-gray-800/40
                  text-black font-medium placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-gray-800/40
                  text-sm
                "
                required
                />
                </div>
            </div>

            {/* //Email Div */}
             <div className="w-full">
            <label className="text-black font-semibold mb-1 block text-sm">
              Email
            </label>
            <div className="relative w-full">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
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
          </div>
                {/* //Password Div */}
            <div className='w-full'>
                <label className='text-black font-semibold mb-1 block text-sm'>Password</label>
                <div className='w-full relative'>
                    <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18}/>
                    <input type="password" 
                    placeholder='••••••••'
                    onChange={(e)=>{setPassword(e.target.value)}}
                    value={Password}
                    className='w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl bg-white-950/70 border border-gray-800/40 text-black font-medium placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-gray-800/40 text-sm' required
                    />
                </div>
            </div>
         
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
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogInIcon size={18} />
                Sign Up
              </>
            )}
          </motion.button>

        </form>

<div className="flex justify-center items-center gap-1 text-xs sm:text-sm text-center mt-3">
          <span className="text-gray-400">Already have an account?</span>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 transition"
          >
            LogIn
          </Link>
        </div>
        {/* <MAIN DIV KHATM > */}
      </motion.div>
    </div>
  );
}

export default Signup;