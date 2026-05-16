import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import generateToken, { signAccessToken } from "../utils/generateToken.js";
import validator from "validator";
import crypto from "crypto";
import { generateOTP } from '../utils/otp_generator.js'; 
import {
  sendOTPEmail,
  sendResetPasswordEmail,
  sendSellerRequestEmail, 
  sendSellerApprovalEmail,
  sendSellerRejectionEmail,
  sendSubscriptionExpiredEmail,
  sendSubscriptionWarningEmail,
} from '../utils/smtp_function.js'; 
import {
  SUBSCRIPTION_TYPES,
  calculateSubscription,
  downgradeExpiredSubscription,
  hasActivePremiumSubscription,
} from "../utils/sellerSubscription.js";
import { ROLES, isAdminRole, resolveUserRole } from "../constants/roles.js";
     
      
const authUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;
  // Determine which identifier is provided
  const loginIdentifier = email || phone;
  if (!loginIdentifier || !password) { 
    res.status(400);
    throw new Error("All fields are required");
  }
  // Find user by email or phone
  const user = await User.findOne({
    $or: [{ email: email }, { phone: phone }],
  });
  if (!user) {
    res.status(401);
    throw new Error("Invalid email/phone or password");
  }
  // Validate password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email/phone or password");
  }
  // Account status check
  if (user.accountStatus !== "active") {
    res.status(403);
    throw new Error(`Account is ${user.accountStatus}. Contact support.`);
  }
  // Check email verification
  if (!user.verified) {
    res.status(403);
    throw new Error("Please verify your email before logging in.");
  }
  // Handle seller logic
  let sellerInfo = user.sellerRequest
    ? {
        subscriptionType: user.sellerRequest.subscriptionType,
        subscriptionStart: user.sellerRequest.subscriptionStart,
        subscriptionEnd: user.sellerRequest.subscriptionEnd,
        boostActive: user.sellerRequest.boostActive,
        requestStatus: user.sellerRequest.status,
        requestedAt: user.sellerRequest.requestedAt,
        approvedAt: user.sellerRequest.approvedAt,
        rejectionReason: user.sellerRequest.rejectionReason,
        subscriptionActive: false,
      }
    : null;
  let subscriptionWarning = null;
  const userRole = resolveUserRole(user);
  if (userRole === ROLES.SELLER) {
    const now = new Date();
    const isSubscriptionActive = hasActivePremiumSubscription(user.sellerRequest, now);

    if (downgradeExpiredSubscription(user, now)) {
      await user.save();
      subscriptionWarning =
        "Your premium subscription has expired. Your products are now displayed as standard listings.";
      await sendSubscriptionExpiredEmail(user);
    } else if (
      user.sellerRequest?.subscriptionEnd &&
      user.sellerRequest?.subscriptionLevel > 0
    ) {
      const msLeft = new Date(user.sellerRequest.subscriptionEnd).getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      if (daysLeft > 0 && daysLeft <= 7) {
        await sendSubscriptionWarningEmail(user, daysLeft);
      }
    }

    sellerInfo = {
      ...sellerInfo,
      subscriptionActive: isSubscriptionActive,
    };
  }
  // Atomically increment loginCount and update lastLogin
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $inc: { loginCount: 1 },
      $set: { lastLogin: new Date() },
    },
    { new: true }
  );

  // Generate access + refresh cookies and return current access token
  const token = await generateToken(res, updatedUser._id);
  // Send response
  res.json({
    _id: user._id,
    name: `${user.FirstName} ${user.LastName}`,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,   
    role: userRole,
    accountStatus: user.accountStatus,
    verified: user.verified, 
    sellerRequest: sellerInfo,
    subscriptionWarning,
    token, 
  }); 
}); 


 
const registerUser = asyncHandler(async (req, res) => {
   
  try { 
    const {
      FirstName,
      LastName,
      email,
      phone,
      profileImage,
      password,
    } = req.body; 

    // ---- Validate required fields ----
    if (!FirstName || !LastName || !email || !phone || !password) {
      res.status(400);
      throw new Error(
        "All fields (first name, last name, email, phone, password) are required"
      ); 
    } 

    // ---- Validate email format ----
    if (!validator.isEmail(email)) {
      //console.log("❌ Validation Error: Invalid Email Format:", email);
      res.status(400);
      throw new Error("Invalid email format");
    }

    // ---- Validate phone format ----
    if (!/^\+251\d{9}$/.test(phone)) {
      //console.log("❌ Validation Error: Invalid Phone Format:", phone);
      res.status(400);
      throw new Error("Phone must start with +251 and be followed by 9 digits");
    }

    // ---- Validate password strength ----
    const isStrong = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (!isStrong) {
      //console.log("❌ Weak Password:", password);
      res.status(400);
      throw new Error(
        "Password must be 8+ characters and include uppercase, lowercase, number, and symbol"
      );
    }

    // ---- Check existing users ----
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      console.log("❌ User Exists Already:", existingUser);
      res.status(400);
      throw new Error("User with this email or phone already exists");
    }
     

     const otp = generateOTP();

    // ---- Build new user data ----
    const newUserData = {
      FirstName,
      LastName, 
      email,
      phone,
      profileImage,
      password,
      isVerified: false,
      role: ROLES.CUSTOMER,
      accountStatus: "active",
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
    };
    
    const user = await User.create(newUserData);

    await sendOTPEmail(email, otp);
    
    if (!user) {
      console.log("❌ User Creation Failed");
      res.status(400);
      throw new Error("Invalid user data");
    }

    console.log("✅ User Created Successfully:", user._id);

    // ---- Generate Token ----
    const token = signAccessToken(user._id);

    // ---- Response ---- 
    res.status(201).json({
      _id: user._id, 
      name: `${user.FirstName} ${user.LastName}`,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      role: resolveUserRole(user),
      isVerified: user.isVerified,
      accountStatus: user.accountStatus,
      sellerRequest: user.sellerRequest || null,
      token,
    });
  } catch (error) {
    console.log("🔥 SERVER ERROR in registerUser:", error.message, error.stack);
    throw error; // Pass to errorHandler
  }
});



 
 // verifyOTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("🔹 verifyOTP called with:", { email, otp });

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(400).json({ message: "User not found" });
    }

    console.log("✅ User found:", { id: user._id, verified: user.verified });

    if (user.verified) {
      console.log("⚠️ User already verified:", email);
      return res.status(400).json({ message: "Already verified" });
    }

    if (user.otp !== otp) {
      console.log("❌ Invalid OTP provided:", { provided: otp, expected: user.otp });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      console.log("⏰ OTP expired. Current time:", Date.now(), "Expires at:", user.otpExpires);
      return res.status(400).json({ message: "OTP expired" });
    }

    console.log("🔓 OTP valid. Verifying user...");

    user.verified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save(); 

    console.log("✅ User verified successfully:", email);

    res.status(200).json({ message: "User verified successfully" });
  } catch (err) {
    console.error("🔥 Error in verifyOTP:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// resendOTP 
const resendOTP  = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.verified) return res.status(400).json({ message: "Already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "New OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


 
 const requestResetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate a 6-digit OTP
    const otp = generateOTP();

    // Save OTP + expiration (10 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
 
    // Send OTP via email
    await sendResetPasswordEmail(user.email, otp);
     
    return res.json({
      message: "Password reset OTP sent to email",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

 

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      console.error("Reset Password Error: Missing fields", { email, otp, newPassword });
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetPasswordOTP !== otp ||
      !user.resetPasswordOTPExpires ||
      user.resetPasswordOTPExpires < Date.now()
    ) {
      console.error("Reset Password Error: Invalid or expired OTP", { email, otp });
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash password
    //const salt = await bcrypt.genSalt(10);
    user.password = await (newPassword); 

    // Clear OTP
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save();

    console.log(`Password reset successful for user: ${email}`);

    return res.json({
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Reset Password Exception:", {
      errorMessage: err.message,
      stack: err.stack,
      requestBody: req.body,
    });
    res.status(500).json({ message: "Server error" });
  }
};

 


export const resendResetPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update OTP + Expiry (10 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `
      Your new password reset OTP is: ${otp}

      This OTP will expire in 10 minutes.
    `;

    // Send OTP via email
    await sendResetPasswordEmail(user.email, otp);
     

    return res.json({
      message: "New OTP sent successfully",
    });

  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

 
 

const logoutUser = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies.refreshToken;
  if (rawRefreshToken) {
    const hashed = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
    await User.findOneAndUpdate({ refreshToken: hashed }, { refreshToken: null });
  }
  res.clearCookie("jwt");
  res.clearCookie("refreshToken", { path: "/api/users/refresh" });
  res.status(200).json({ message: "Logged out successfully" });
});

// @desc  Refresh access token using refresh token cookie
// @route POST /api/users/refresh
// @access Public
const refreshAccessToken = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies.refreshToken;
  if (!rawRefreshToken) {
    res.status(401);
    throw new Error("No refresh token");
  }

  const hashed = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
  const user = await User.findOne({ refreshToken: hashed }).select("+refreshToken");

  if (!user) {
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }

  // Issue new access token using shared helper
  const accessToken = signAccessToken(user._id);

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.json({ message: "Token refreshed", token: accessToken });
});





const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  } 
 
  res.json({ 
    _id: user._id,
    name: `${user.FirstName} ${user.LastName}`,
    email: user.email,
    profileImage: user.profileImage,   
    role: resolveUserRole(user),
    isVerified: user.isVerified,
    accountStatus: user.accountStatus,
    sellerRequest: user.sellerRequest || null,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt, 
  });
});




const updateUserProfile = asyncHandler(async (req, res) => {
  const { FirstName, LastName, email, phone, profileImage, password } =
    req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Validate provided fields only
  if (email && !validator.isEmail(email)) {
    res.status(400);
    throw new Error("Invalid email format");
  }

  if (phone && !/^\+251\d{9}$/.test(phone)) {
    res.status(400);
    throw new Error("Phone must start with +251 and be followed by 9 digits");
  }

  if (password) {
    const isStrong = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });
    if (!isStrong) {
      res.status(400);
      throw new Error(
        "Password must be 8+ characters and include uppercase, lowercase, number, and symbol"
      );
    }
  }

  // Update only provided fields
  if (FirstName) user.FirstName = FirstName;
  if (LastName) user.LastName = LastName;
  if (email && email !== user.email) {
    user.email = email;
    user.isVerified = false; // require re-verification
  }
  if (phone) user.phone = phone;
  if (profileImage) user.profileImage = profileImage;
  if (password) user.password = password;

  // Prevent role changes
  delete req.body.role;
  delete req.body.sellerRequest;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: `${updatedUser.FirstName} ${updatedUser.LastName}`,
    email: updatedUser.email,
    phone: updatedUser.phone,
    profileImage: updatedUser.profileImage,
    role: resolveUserRole(updatedUser),
    isVerified: updatedUser.isVerified,
    accountStatus: updatedUser.accountStatus,
    updatedAt: updatedUser.updatedAt,
  });
});



const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const imagePath = `/uploadsprofile/${req.file.filename}`;

  // If logged in → update profile
  if (req.user) {
    const user = await User.findById(req.user._id);

    if (user) {
      user.profileImage = imagePath;
      await user.save();
    }
  }

  res.status(200).json({
    message: "Image uploaded successfully",
    image: imagePath,
  });
});



const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});



const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (isAdminRole(user)) {
      res.status(400);
      throw new Error("cannot delete admin user");
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed successfully" });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});



const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});



 const getSellerById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) { 
    res.status(404);
    throw new Error("User not found"); 
  }  
  // Get products by this user
  const products = await Product.find({ user: user._id });

  res.json({ ...user._doc, products });
});


// @desc    Search sellers by name or store name
// @route   GET /api/users/search
// @access  Public
const searchSellers = asyncHandler(async (req, res) => {
  const query = req.query.q;
 
  if (!query) {
    return res.json([]);
  } 
  const searchCriteria = {
    role: ROLES.SELLER,
    accountStatus: "active",
    "sellerRequest.status": "approved",
    $or: [
      { FirstName: { $regex: query, $options: "i" } },
      { LastName: { $regex: query, $options: "i" } },
      { "sellerProfile.storeName": { $regex: query, $options: "i" } },
    ],
  };
  const now = new Date();
  const sellers = await User.aggregate([
    { $match: searchCriteria },
    {
      $addFields: {
        effectivePriority: {
          $cond: [
            {
              $and: [
                { $eq: ["$sellerRequest.boostActive", true] },
                { $gt: ["$sellerRequest.subscriptionEnd", now] },
              ],
            },
            { $ifNull: ["$sellerRequest.subscriptionLevel", 0] },
            0,
          ],
        },
      },
    },
    {
      $sort: {
        effectivePriority: -1,
        verified: -1,
        "sellerProfile.rating": -1,
        createdAt: -1,
      },
    },
    { $limit: 20 },
    {
      $project: {
        FirstName: 1,
        LastName: 1,
        profileImage: 1,
        sellerProfile: 1,
        sellerRequest: 1,
        role: 1,
        verified: 1,
      },
    },
  ]);
  
  res.json(sellers);
});
// Add searchSellers to your export list at the bottom

 

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // --- Validate Email ---
  if (req.body.email && !validator.isEmail(req.body.email)) {
    res.status(400);
    throw new Error("Invalid email address");
  }

  // --- Update Names ---
  user.FirstName = req.body.FirstName || user.FirstName;
  user.LastName = req.body.LastName || user.LastName;
  user.phone = req.body.phone || user.phone;

  // --- Update Email ---
  if (req.body.email && req.body.email !== user.email) {
    user.email = req.body.email;
    user.isVerified = false; // must re-verify after email change
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
  }

  // --- Update role (Admin Only) ---
  if (req.body.role !== undefined) {
    if (!Object.values(ROLES).includes(req.body.role)) {
      res.status(400);
      throw new Error("Invalid role");
    }
    user.role = req.body.role;
  }

  // --- Update Account Status ---
  if (req.body.accountStatus) {
    if (!["active", "suspended", "inactive"].includes(req.body.accountStatus)) {
      res.status(400);
      throw new Error("Invalid account status");
    }
    user.accountStatus = req.body.accountStatus;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    FirstName: updatedUser.FirstName,
    LastName: updatedUser.LastName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    role: resolveUserRole(updatedUser),
    accountStatus: updatedUser.accountStatus,
    isVerified: updatedUser.isVerified,
    //sellerRequest: updatedUser.sellerRequest,
    updatedAt: updatedUser.updatedAt,
  });
});


// @desc    Update user push token
// @route   PUT /api/users/push-token
// @access  Private
const updatePushToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400); 
    throw new Error("Token is required");
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.pushToken = token;
    await user.save();
    res.json({ message: "Push token updated successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
}); 




const requestSeller = asyncHandler(async (req, res) => {
  try { 
    const {
      subscriptionType = "free",
      storeName,
      storeDescription,
      storeLogo,
    } = req.body;

    if (!SUBSCRIPTION_TYPES.includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription type",
        data: null,
      });
    }

    const sanitizedStoreName = validator.escape((storeName || "").trim());
    const sanitizedStoreDescription = validator.escape((storeDescription || "").trim());
    const sanitizedStoreLogo = (storeLogo || "").trim();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    if (!sanitizedStoreName) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
        data: null,
      });
    }
    if (resolveUserRole(user) !== ROLES.CUSTOMER) {
      return res.status(403).json({
        success: false,
        message: "Only customers can submit seller requests",
        data: null,
      });
    }
    if (sanitizedStoreDescription.length < 20 || sanitizedStoreDescription.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Store description must be between 20 and 500 characters",
        data: null,
      });
    }

    if (user.sellerRequest?.status === "pending") {
      return res.status(400).json({
        success: false,
        message: "Seller request pending admin approval",
        data: null,
      });
    }

    if (resolveUserRole(user) === ROLES.SELLER || user.sellerRequest?.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "You are already an approved seller",
        data: null,
      });
    }

    // Ensure sellerRequest object exists
    if (!user.sellerRequest) user.sellerRequest = {};
 
    user.sellerRequest = {
      isRequested: true,
      status: "pending",
      requestedAt: new Date(),
      approvedAt: null,
      rejectionReason: "",
      subscriptionType,
      subscriptionLevel: 0,
      subscriptionStart: null,
      subscriptionEnd: null,
      boostActive: false,
    };
    // Update seller profile
    user.sellerProfile = {
      ...user.sellerProfile,
      storeName: sanitizedStoreName,
      storeDescription: sanitizedStoreDescription,
      storeLogo: sanitizedStoreLogo || user.sellerProfile?.storeLogo || "",
    };

    await user.save();

    // Send email to admin
const adminEmail = process.env.ADMIN_EMAIL; // Add your admin email in .env
await sendSellerRequestEmail(user, adminEmail);

    res.json({
      success: true,
      message: "Seller request submitted",
      data: {
        sellerRequest: user.sellerRequest,
        sellerProfile: user.sellerProfile,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
});



// Admin: get all pending seller requests
const getSellerRequests = asyncHandler(async (req, res) => {
  const requests = await User.find({
    $or: [{ "sellerRequest.isRequested": true }, { role: ROLES.SELLER }],
  }).sort({ "sellerRequest.status": 1, createdAt: -1 });
  res.json(requests);
});

 

const approveSeller = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      status,
      storeName,
      storeDescription,
      subscriptionType: subTypeBody,
      rejectionReason = "",
      accountStatus,
    } = req.body;
 
    if (accountStatus) {
      if (!["active", "suspended", "inactive"].includes(accountStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid account status",
          data: null,
        });
      }
      user.accountStatus = accountStatus;
    }

    if (!user.sellerRequest) {
      user.sellerRequest = {};
    }

    // --- 1. HANDLE REJECTION ---
    if (status === "rejected") {
      user.role = ROLES.CUSTOMER;
      user.sellerRequest.status = "rejected";
      user.sellerRequest.isRequested = false;
      user.sellerRequest.approvedAt = null;
      user.sellerRequest.rejectionReason = validator.escape((rejectionReason || "Seller request rejected by admin").trim());
      user.sellerRequest.subscriptionType = "free";
      user.sellerRequest.subscriptionLevel = 0;
      user.sellerRequest.subscriptionStart = null;
      user.sellerRequest.subscriptionEnd = null;
      user.sellerRequest.boostActive = false;
      
      await user.save();
      await sendSellerRejectionEmail(user); // If you have this helper
      
      return res.json({
        success: true,
        message: "Seller request rejected",
        data: user,
      });
    }

    if (status === "pending") {
      user.role = ROLES.CUSTOMER;
      user.sellerRequest.status = "pending";
      user.sellerRequest.isRequested = true;
      user.sellerRequest.rejectionReason = "";
      user.sellerRequest.requestedAt = user.sellerRequest.requestedAt || new Date();
      user.sellerRequest.approvedAt = null;
      user.sellerProfile.storeName =
        validator.escape((storeName || user.sellerProfile.storeName || "").trim());
      user.sellerProfile.storeDescription =
        validator.escape((storeDescription || user.sellerProfile.storeDescription || "").trim());

      await user.save();

      return res.json({
        success: true,
        message: "Seller request kept pending",
        data: user,
      });
    }

    // --- 2. PROCEED WITH APPROVAL ---
    // Determine Subscription Type
    const subscriptionType = subTypeBody || user.sellerRequest?.subscriptionType || "free";

    // Validate
    if (!SUBSCRIPTION_TYPES.includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription type",
        data: null,
      });
    }

    // Update Profile Info
    user.role = ROLES.SELLER;
    user.sellerRequest.isRequested = false;
    user.sellerRequest.rejectionReason = "";
    user.sellerProfile.storeName =
      validator.escape((storeName || user.sellerProfile.storeName || "").trim());
    user.sellerProfile.storeDescription =
      validator.escape((storeDescription || user.sellerProfile.storeDescription || "").trim());

    // Handle Subscription Dates & Priority Levels
    user.sellerRequest.status = "approved";
    user.sellerRequest.approvedAt = new Date();
    const subscriptionData = calculateSubscription(subscriptionType);
    user.sellerRequest.subscriptionType = subscriptionData.subscriptionType;
    user.sellerRequest.subscriptionLevel = subscriptionData.subscriptionLevel;
    user.sellerRequest.subscriptionStart = subscriptionData.subscriptionStart;
    user.sellerRequest.subscriptionEnd = subscriptionData.subscriptionEnd;
    user.sellerRequest.boostActive = subscriptionData.boostActive;

    await user.save();
    await sendSellerApprovalEmail(user);

    res.json({
      success: true,
      message: `Seller approved with level ${user.sellerRequest.subscriptionLevel}`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      data: null,
    });
  } 
}); 
 

// Admin: reject seller request
const rejectSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      data: null,
    });
  }

  user.role = ROLES.CUSTOMER;
  user.sellerRequest.isRequested = false;
  user.sellerRequest.status = "rejected";
  user.sellerRequest.approvedAt = null;
  user.sellerRequest.rejectionReason = validator.escape(
    (req.body?.rejectionReason || "Seller request rejected by admin").trim()
  );
  user.sellerRequest.subscriptionType = "free";
  user.sellerRequest.subscriptionLevel = 0;
  user.sellerRequest.subscriptionStart = null;
  user.sellerRequest.subscriptionEnd = null;
  user.sellerRequest.boostActive = false;
  await user.save();
  await sendSellerRejectionEmail(user);
  res.json({
    success: true,
    message: "Seller request rejected",
    data: user,
  });
});



export {
  authUser,
  registerUser,
  updatePushToken, 
  resendOTP,
  verifyOTP, 
  logoutUser,
  refreshAccessToken,
  resetPassword,
  requestResetPassword,  
  getUserProfile,
  searchSellers, 
  updateUserProfile,
  uploadProfileImage,
  getUsers,
  getSellerById,
  deleteUser,
  getUserById,
  updateUser,
  requestSeller,
  getSellerRequests,
  approveSeller,
  rejectSeller,
};   