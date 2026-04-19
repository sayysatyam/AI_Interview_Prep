/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { userAuthStore } from "../../AuthStore/user";
import { BadgeDollarSign, Bot, Coins, LogIn, LogOut, User } from "lucide-react";
import { FaRobot, FaSpinner } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  const [showCreditPopup, setshowCreditPopup] = useState(false);
  const [showUserPopup, setshowUserPopup] = useState(false);
  const { user,logOut,isLogOutLoading } = userAuthStore();

  const navItems = [
    { label: "Home", path: "/home" },
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/pricing" },
    { label: "About", path: "/about" },
  ];
  return (
    <div className="bg-[#F0EBE3] flex justify-center px-4 sm:px-6 pt-6 w-full">
  <div className="w-full max-w-6xl bg-zinc-50 rounded-3xl shadow-md border border-gray-200 px-4 py-3 flex items-center justify-between">
    <div onClick={()=>{
    navigate("/")
  }} className="flex items-center gap-2 min-w-0 cursor-pointer">
  <div  className="bg-black  text-white p-2 rounded-xl shrink-0 flex items-center justify-center">
    <FaRobot size={18} />
  </div>
  <h2 className="font-semibold text-sm sm:text-base md:text-xl hidden min-[360px]:block">
    Interview.Prep
  </h2>
</div>

    <div className="flex items-center gap-3 sm:gap-6 relative">
      <div className="relative">
        <button
          onClick={() => {
            setshowCreditPopup(!showCreditPopup);
            setshowUserPopup(false);
          }}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-full px-3 sm:px-4 py-2 transition text-sm sm:text-md font-semibold cursor-pointer"
        >
          <BadgeDollarSign size={16} />
          <span>{user?.credits || 0}</span>

          {showCreditPopup && (
            <div className="absolute right-0 top-full mt-2 w-52 sm:w-60 bg-white shadow-xl border border-gray-200 rounded-lg p-4 z-20">
              <p className="text-sm font-medium tracking-wider mb-2">
                Need More Credit to continue?
              </p>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer w-full text-sm"
              >
                Buy More
              </button>
            </div>
          )}
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => {
            setshowUserPopup(!showUserPopup);
            setshowCreditPopup(false);
          }}
          className="flex items-center justify-center bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 text-white text-sm font-semibold shadow-md hover:scale-105 transition cursor-pointer"
        >
          {user ? user?.name.slice(0, 1).toUpperCase() : <User size={16} />}
        </button>

        {showUserPopup && (
          <div className="absolute right-0 top-full mt-3 w-56 sm:w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>

            <div className="flex flex-col py-2">
              <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer">
                <User size={16} />
                Profile
              </button>

              <button
                onClick={() => navigate("/history")}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <Bot size={16} />
                Interview History
              </button>

              <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer">
                <Coins size={16} />
                Credits
              </button>

              <div className="my-2 border-t border-gray-100" />

              {user ? (
                <button
                  onClick={() => {
                    logOut();
                    setshowCreditPopup(false);
                    setshowUserPopup(false);
                    navigate("/");
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
                >
                  {isLogOutLoading ? (
                    <FaSpinner className="animate-spin" size={16} />
                  ) : (
                    <LogOut size={16} />
                  )}
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition cursor-pointer"
                >
                  <LogIn size={16} />
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
  );
};

export default Navbar;
