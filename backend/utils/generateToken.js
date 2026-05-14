import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/userModel.js";

// Shared helper: sign a short-lived access JWT
const signAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateToken = async (res, userId) => {
  const accessToken = signAccessToken(userId);

  // Long-lived refresh token (30 days) — opaque random value
  const rawRefreshToken = crypto.randomBytes(64).toString("hex");
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(rawRefreshToken)
    .digest("hex");

  // Persist hashed refresh token on the user document
  await User.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", rawRefreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/api/users/refresh",
  });
};

export { signAccessToken };
export default generateToken; 