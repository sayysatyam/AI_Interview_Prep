/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Loader, Lock, LogIn, Mail, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa6";
import { motion } from "framer-motion";
import { userAuthStore } from "../../AuthStore/user";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const navigate = useNavigate();
  const { googleLogin, isAuthenticated, user, Logingerror, isLoading, login, clearError } =
    userAuthStore();

  useEffect(() => {
    clearError();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.isVerified) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const success = await googleLogin(credentialResponse.credential);

    if (success) {
      toast.success("Signed in with Google 🎉");
    }
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    const res = await login(Email, Password);
    if (res) {
      navigate("/");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F0EBE3] flex items-center justify-center px-4 sm:px-6 py-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-5 sm:p-6 max-h-[95vh] overflow-y-auto"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-green-800/30 rounded-full flex items-center justify-center text-white">
            <FaRobot size={24} />
          </div>
          <h2 className="text-[20px] sm:text-[24px] tracking-wider leading-snug font-semibold">
            Interview.Prep
          </h2>
        </div>

        <div>
          <h1 className="flex flex-col items-center justify-center text-xl sm:text-2xl md:text-3xl font-semibold tracking-wider gap-2 text-center">
            Welcome Back
            <span className="bg-green-100 px-4 sm:px-6 py-1.5 flex flex-wrap rounded-full gap-2 justify-center items-center text-green-600 text-center w-full sm:w-auto mt-1">
              <Sparkles size={18} className="shrink-0" />
              <motion.h2
                initial={{ opacity: 0.2, y: -4 }}
                animate={{ opacity: 1, y: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[14px] sm:text-[16px] md:text-[22px] font-semibold tracking-wider text-green-600"
              >
                AI smart Interview
              </motion.h2>
            </span>
          </h1>
          <p className="text-center text-gray-500 mt-2 text-xs sm:text-sm mb-4 leading-relaxed px-2">
            Continue your AI-powered interview journey. Practice, improve, and track your progress.
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

        <div className="flex items-center justify-center gap-3 my-3">
          <hr className="w-full border-gray-200"></hr>
          <p className="tracking-widest font-bold bg-green-300/20 px-2 py-1 rounded-full text-green-600 text-xs">
            OR
          </p>
          <hr className="w-full border-gray-200"></hr>
        </div>

        <form onSubmit={handleLogIn} className="flex flex-col gap-3 sm:gap-4 w-full">
          {/* Email Wala Div */}
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

          {/* Password Wala Div */}
          <div className="w-full">
            <label className="text-black font-semibold mb-1 block text-sm">
              Password
            </label>
            <div className="relative w-full">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                placeholder="••••••••"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
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

          {Logingerror && (
            <p className="text-red-500 font-medium text-xs">
              {Logingerror}
            </p>
          )}

          <div className="flex sm:flex-row justify-between items-start sm:items-center mt-0">
            <label className="flex items-center gap-2 text-blue-500 cursor-pointer text-xs sm:text-sm">
              <input type="checkbox" className="accent-blue-600 w-3.5 h-3.5" />
              Remember me
            </label>

            <Link
              to="/forgot-Password"
              className="text-blue-500 hover:text-blue-400 transition whitespace-nowrap text-xs sm:text-sm"
            >
              Forgot Password?
            </Link>
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
                <LogIn size={18} />
                Log In
              </>
            )}
          </motion.button>
        </form>

        <div className="flex justify-center items-center gap-1 text-xs sm:text-sm text-center mt-3">
          <span className="text-gray-400">Don’t have an account?</span>
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-500 transition"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;