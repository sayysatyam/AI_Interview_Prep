/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userAuthStore } from "../../AuthStore/user";
import toast from "react-hot-toast";
import { Eye, EyeClosed, Loader, Lock } from "lucide-react";
import { FaRobot } from "react-icons/fa6";
import ResetPasswordImage from "../../assets/ResetPasswordImage.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const [showconfirmpassword, setshowconfirmpassword] = useState(false);
  const [localError, setlocalError] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetpassword, error, isLoading, verifyresettoken, verifyLoading } =
    userAuthStore();

  useEffect(() => {
    let mounted = true;
    if (token && mounted) {
      verifyresettoken(token);
    }
    return () => (mounted = false);
  }, [token]);

  const revielPassword = () => {
    setshowpassword((prev) => !prev);
  };
  const revielconfirmPassword = () => {
    setshowconfirmpassword((prev) => !prev);
  };

  // Single verifyLoading check
  if (verifyLoading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Loader className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-8 text-center rounded-2xl border-2 border-gray-200 bg-white shadow-2xl animate-fade-scale">
          <h2 className="text-xl sm:text-2xl font-bold text-red-400">
            Invalid or Expired Link
          </h2>
          <p className="text-zinc-500 mt-2 text-sm sm:text-base flex flex-col mb-2">
            <span className="text-black">
              This link is invalid or has expired. Please request a new password reset link.
            </span>
          </p>
          <motion.button
            onClick={() => navigate("/forgot-password")}
            disabled={isLoading}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            type="button"
            className={`flex items-center justify-center w-full gap-2 font-semibold tracking-wider bg-blue-700 px-2 py-2.5 rounded-xl text-zinc-50 cursor-pointer mt-1 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            Request New Link
          </motion.button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setlocalError("");

    if (password !== confirmPassword) {
      setlocalError("Passwords do not match");
      return;
    }

    const success = await resetpassword(token, password);
    if (success) {
      toast.success("Password reset successfully 🎉");
      setTimeout(() => navigate("/login"), 1000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F0EBE3] flex items-center justify-center p-5 sm:p-6 overflow-hidden">
      <motion.div className="w-full max-w-md flex flex-col items-center justify-center p-5 sm:p-6 border-2 border-gray-200 shadow-2xl rounded-2xl bg-white">
        <div className="flex items-center justify-center gap-2 mb-3 w-full">
          <div className="p-2 bg-green-800/30 rounded-full flex items-center justify-center text-white">
            <FaRobot size={24} />
          </div>
          <h2 className="text-[20px] sm:text-[24px] tracking-wider leading-snug font-semibold">
            Interview.Prep
          </h2>
        </div>

        <div className="flex items-center justify-center relative bottom-15">
          <img className="w-80 h-75" src={ResetPasswordImage} alt="" />
        </div>

        <div className="flex flex-col items-center text-center gap-1 relative bottom-15">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
            Reset Password
          </h2>
          <h3 className="text-gray-400 text-xs sm:text-sm">
            Enter your new password to continue
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full mt-5 relative bottom-10">
          {/* Password Input */}
          <div className="relative">
            <input
              type={showpassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full pl-9 pr-10 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-800/40 text-black font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800/40 text-sm"
              required
            />
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200"
              size={22}
            />
            <button
              type="button"
              onClick={revielPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
            >
              {showpassword ? <Eye size={18} /> : <EyeClosed size={18} />}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <input
                type={showconfirmpassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setconfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full pl-9 pr-10 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-800/40 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800/40 text-sm ${
                  localError ? "text-red-400" : "text-black"
                }`}
                required
              />
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200"
                size={22}
              />
              <button
                type="button"
                onClick={revielconfirmPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              >
                {showconfirmpassword ? <Eye size={18} /> : <EyeClosed size={18} />}
              </button>
            </div>
            {localError && (
              <p className="text-[16px] text-red-400">{localError}</p>
            )}
          </div>

          {/* Submit Button */}
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
              <Loader className="h-6 w-6 animate-spin" />
            ) : (
              "Set Password"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;