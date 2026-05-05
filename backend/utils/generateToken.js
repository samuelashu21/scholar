import jwt from "jsonwebtoken";

const SECURE_COOKIE = process.env.NODE_ENV === "production";

/**
 * Issues a short-lived access token (15 min) and a long-lived refresh token
 * (30 days), both stored as HTTP-only cookies.
 */
const generateToken = (res, userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

  // Short-lived access token cookie
  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Long-lived refresh token cookie
  res.cookie("jwt_refresh", refreshToken, {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "strict",
    path: "/api/users/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken; 