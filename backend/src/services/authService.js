import crypto from "crypto";
import { signAccessToken } from "../../utils/generateToken.js";
import AppError from "../utils/appError.js";
import { ErrorCodes } from "../utils/errorCodes.js";

class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async refreshAccessToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new AppError("No refresh token", {
        statusCode: 401,
        code: ErrorCodes.UNAUTHORIZED,
      });
    }

    const hashed = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    const user = await this.authRepository.findByHashedRefreshToken(hashed);

    if (!user) {
      throw new AppError("Invalid or expired refresh token", {
        statusCode: 401,
        code: ErrorCodes.UNAUTHORIZED,
      });
    }

    const accessToken = signAccessToken(user._id);
    return { accessToken };
  }

  async logout(rawRefreshToken) {
    if (!rawRefreshToken) return;
    const hashed = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    await this.authRepository.clearRefreshTokenByHashedToken(hashed);
  }
}

export default AuthService;
