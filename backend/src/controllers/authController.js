import asyncWrapper from "../middleware/asyncWrapper.js";
import { successResponse } from "../utils/apiResponse.js";

const createAuthController = (authService) => ({
  refreshAccessToken: asyncWrapper(async (req, res) => {
    const { accessToken } = await authService.refreshAccessToken(req.cookies.refreshToken);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json(successResponse({ message: "Token refreshed", data: { accessToken } }));
  }),

  logoutUser: asyncWrapper(async (req, res) => {
    await authService.logout(req.cookies.refreshToken);

    res.clearCookie("jwt");
    res.clearCookie("refreshToken", { path: "/api" });
    res.clearCookie("refreshToken", { path: "/api/users/refresh" });
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

    res.status(200).json(successResponse({ message: "Logged out successfully", data: null }));
  }),
});

export default createAuthController;
