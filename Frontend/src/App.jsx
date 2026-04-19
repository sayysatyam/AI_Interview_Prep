/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/static-components */
import React from "react";
import { Navigate, Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import Login from "./components/AuthFile/Login";
import Home from "./components/Homepage/Home";
import { useEffect } from "react";
import { userAuthStore } from "./AuthStore/user";
import HistoryPage from "./components/Pages/historyPage";
import Signup from "./components/AuthFile/Signup";
import VerifyEmail from "./components/AuthFile/VerifyEmail";
import ForgotPassword from "./components/AuthFile/ForgotPassword";
import AfterForgotPass from "./components/AuthFile/AfterForgotPass";
import ResetPassword from "./components/AuthFile/ResetPassword";
import toast, { Toaster } from "react-hot-toast";
import StartPage from "./components/Pages/StartPage";
import PrivacyPolicy from "./components/Pages/PrivacyPolicy";
import Navbar from "./components/Homepage/Navbar";
import InterviewStartPage from "./components/Pages/InterviewStartPage";
import Footer from "./components/Homepage/Footer";
const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, user } = userAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
};
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = userAuthStore();
  if (isAuthenticated && user?.isVerified) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const VerifyEmailRoute = ({ children }) => {
  const { isAuthenticated, user } = userAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const { checkAuth, user, isAuthenticated, isCheckingAuth } = userAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  if (isCheckingAuth)
    return (
      <div className="w-full min-h-screen bg-[#F0EBE3] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#020617",
            color: "#e5e7eb",
            border: "1px solid #7c3aed",
          },
        }}
      />
      <div className="bg-[#F0EBE3]">
        <div>
          <Navbar />
        </div>
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectAuthenticatedUser>
                <Login />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectAuthenticatedUser>
                <Signup />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/verify-email"
            element={
              <VerifyEmailRoute>
                <VerifyEmail />
              </VerifyEmailRoute>
            }
          />

          <Route path="/" element={<Home />} />
          <Route
            path="/history"
            element={
              <ProtectedRoutes>
                <HistoryPage />
              </ProtectedRoutes>
            }
          />
          <Route
            path="forgot-password"
            element={
              <RedirectAuthenticatedUser>
                <ForgotPassword />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="after-forgotPass"
            element={
              <RedirectAuthenticatedUser>
                <AfterForgotPass />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <RedirectAuthenticatedUser>
                <ResetPassword />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/startInterview"
            element={
              <ProtectedRoutes>
                <InterviewStartPage/>
              </ProtectedRoutes>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
             <div>
               <Footer/>
             </div>
      </div>
    </>
  );
};

export default App;
