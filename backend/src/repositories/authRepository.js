import User from "../../models/userModel.js";

const authRepository = {
  findByHashedRefreshToken: (hashedToken) => User.findOne({ refreshToken: hashedToken }).select("+refreshToken"),
  clearRefreshTokenByHashedToken: (hashedToken) => User.findOneAndUpdate({ refreshToken: hashedToken }, { refreshToken: null }),
};

export default authRepository;
