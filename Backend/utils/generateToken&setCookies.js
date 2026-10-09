
const jwt = require("jsonwebtoken");

const generateTokenAndSetCookies = (res, userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1d",
    }
  );

  res.cookie("uid", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  return token;
};

module.exports = { generateTokenAndSetCookies };
