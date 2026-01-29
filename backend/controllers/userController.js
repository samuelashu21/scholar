import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import generateToken from "../utils/generateToken.js";
import validator from "validator";
import { generateOTP } from '../utils/otp_generator.js'; 
import { sendOTPEmail,sendResetPasswordEmail,sendSellerRequestEmail,sendSellerApprovalEmail } from '../utils/smtp_function.js'; 
   
    
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
  let sellerInfo = null;
  if (user.isSeller) {
    const now = new Date();
    const isSubscriptionActive = 
      user.sellerRequest.subscriptionEnd &&
      now <= user.sellerRequest.subscriptionEnd;

    sellerInfo = {
      subscriptionType: user.sellerRequest.subscriptionType,
      subscriptionStart: user.sellerRequest.subscriptionStart,
      subscriptionEnd: user.sellerRequest.subscriptionEnd,
      boostActive: user.sellerRequest.boostActive,
      requestStatus: user.sellerRequest.status,
      subscriptionActive: isSubscriptionActive,
    };
    if (
      user.sellerRequest.status === "approved" &&
      !isSubscriptionActive &&
      user.sellerRequest.subscriptionType !== "free"
    ) {
      res.status(403);
      throw new Error("Your seller subscription has expired. Renew to sell.");
    }
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

  // Generate token
  generateToken(res, updatedUser._id);
  // Send response
  res.json({
    _id: user._id,
    name: `${user.FirstName} ${user.LastName}`,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,   
    isSeller: user.isSeller,
    isAdmin: user.isAdmin,
    accountStatus: user.accountStatus,
    verified: user.verified, 
    sellerRequest: sellerInfo,
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
      requestSeller = false,
    } = req.body;

    // Log extracted values
    console.log("🧩 Extracted Data:", {
      FirstName,
      LastName,
      email,
      phone,
      profileImage,
      passwordLength: password?.length,
      requestSeller,
    });

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
    console.log("🔍 Checking for existing user:", email, phone);
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
      isAdmin: false,
      isSeller: false,
      accountStatus: "active",
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
    };

    if (requestSeller) {
      newUserData.sellerRequest = {
        isRequested: true,
        status: "pending",
        subscriptionType: "free",
        subscriptionStart: null,
        subscriptionEnd: null,
        boostActive: false,
      };
    }

    console.log("🛠 Creating User in DB:", newUserData);

    const user = await User.create(newUserData);

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "OTP sent to email" });

    if (!user) {
      console.log("❌ User Creation Failed");
      res.status(400);
      throw new Error("Invalid user data");
    }

    console.log("✅ User Created Successfully:", user._id);

    // ---- Generate Token ----
    generateToken(res, user._id);

    // ---- Response ----
    res.status(201).json({
      _id: user._id,
      name: `${user.FirstName} ${user.LastName}`,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      isSeller: user.isSeller,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      accountStatus: user.accountStatus,
      sellerRequest: user.sellerRequest || null,
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

 
 

const logoutUser = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
};





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
    isAdmin: user.isAdmin,
    isSeller: user.isSeller,
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
  delete req.body.isAdmin;
  delete req.body.isSeller;
  delete req.body.sellerRequest;

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: `${updatedUser.FirstName} ${updatedUser.LastName}`,
    email: updatedUser.email,
    phone: updatedUser.phone,
    profileImage: updatedUser.profileImage,
    isSeller: updatedUser.isSeller,
    isAdmin: updatedUser.isAdmin,
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

  // Update user's profileImage
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.profileImage = imagePath;
  await user.save();

  res.status(200).json({
    message: "Image uploaded successfully",
    profileImage: imagePath,
  });
});



const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});



const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
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
    isSeller: true,
    $or: [
      { FirstName: { $regex: query, $options: "i" } },
      { LastName: { $regex: query, $options: "i" } },
      { "sellerProfile.storeName": { $regex: query, $options: "i" } },
    ],
  };
  const sellers = await User.find(searchCriteria)
    .select("FirstName LastName profileImage sellerProfile sellerRequest isSeller")
    .limit(20);
 
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

  // --- Update roles (Admin Only) ---
  if (req.body.isAdmin !== undefined) {
    user.isAdmin = Boolean(req.body.isAdmin);
  }

  if (req.body.isSeller !== undefined) {
    user.isSeller = Boolean(req.body.isSeller);
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
    isSeller: updatedUser.isSeller,
    isAdmin: updatedUser.isAdmin,
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

    const validSubscriptions = ["free", "paid_1_month", "paid_6_month"];
    if (!validSubscriptions.includes(subscriptionType)) {
      return res.status(400).json({ message: "Invalid subscription type" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isSeller || user.sellerRequest?.isRequested) {
      return res.status(400).json({ message: "Already requested or seller" });
    }

    // Ensure sellerRequest object exists
    if (!user.sellerRequest) user.sellerRequest = {};

    // Update seller request
    user.sellerRequest = {
      ...user.sellerRequest,
      isRequested: true,
      status: "pending",
      subscriptionType,
    };

    // Update seller profile
    user.sellerProfile = {
      ...user.sellerProfile,
      storeName: storeName || user.sellerProfile?.storeName || "",
      storeDescription:
        storeDescription || user.sellerProfile?.storeDescription || "",
      storeLogo: storeLogo || user.sellerProfile?.storeLogo || "",
    };

    await user.save();

    // Send email to admin
const adminEmail = process.env.ADMIN_EMAIL; // Add your admin email in .env
await sendSellerRequestEmail(user, adminEmail);

    res.json({
      message: "Seller request submitted",
      sellerRequest: user.sellerRequest,
      sellerProfile: user.sellerProfile,
    });
  } catch (err) {
 
    res.status(500).json({ message: err.message });
  }
});



// Admin: get all pending seller requests
const getSellerRequests = asyncHandler(async (req, res) => {
  const requests = await User.find({ "sellerRequest.status": "pending" });
  res.json(requests);
});



const approveSeller = asyncHandler(async (req, res) => {
 
  try {
    // Accept subscriptionType from multiple possible locations
    const subscriptionType =
      req.body.subscriptionType ||
      req.body?.sellerRequest?.subscriptionType ||
      null;
 
    // Validate subscription type
    const validSubscriptions = ["free", "paid_1_month", "paid_6_month"];
    if (!validSubscriptions.includes(subscriptionType)) {
      console.error("❌ Invalid subscription type:", subscriptionType);
      return res.status(400).json({ message: "Invalid subscription type" });
    }
    const user = await User.findById(req.params.id);

    if (!user) {
      console.error("❌ User not found:", req.params.id);
      return res.status(404).json({ message: "User not found" });
    }

    // Extract simple fields safely
    const { FirstName, LastName, email, phone, storeName, storeDescription } =
      req.body;

    // ==== UPDATE BASIC USER FIELDS ====
    user.FirstName = FirstName || user.FirstName;
    user.LastName = LastName || user.LastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    // ==== ENSURE sellerProfile EXISTS ====
    user.sellerProfile = user.sellerProfile || {};
    user.sellerProfile.storeName =
      storeName ||
      req.body?.sellerProfile?.storeName ||
      user.sellerProfile.storeName;
    user.sellerProfile.storeDescription =
      storeDescription ||
      req.body?.sellerProfile?.storeDescription ||
      user.sellerProfile.storeDescription;

    // ==== ENSURE sellerRequest EXISTS ====
    user.sellerRequest = user.sellerRequest || {};

    console.log("🔧 Setting seller approval and subscription details…");

    user.isSeller = true;
    user.sellerRequest.status = "approved";
    user.sellerRequest.subscriptionType = subscriptionType;

    // ==== SUBSCRIPTION DATE HANDLING ==== 
    if (subscriptionType === "free") {
      console.log("📌 Free Plan selected");
      user.sellerRequest.subscriptionStart = null;
      user.sellerRequest.subscriptionEnd = null;
      user.sellerRequest.boostActive = false;
    } else {
      const now = new Date();
      const months = subscriptionType === "paid_1_month" ? 1 : 6;

      console.log(`📌 Paid Plan selected → +${months} month(s)`);

      user.sellerRequest.subscriptionStart = now;
      user.sellerRequest.subscriptionEnd = new Date(
        new Date().setMonth(now.getMonth() + months)
      );
      user.sellerRequest.boostActive = true;
    }

    // ==== SAVE USER ====
    console.log("💾 Saving user...");
    await user.save();
    // Send approval email to the user
await sendSellerApprovalEmail(user);

    res.json({
      message: "Seller request approved successfully",
      user, 
    });
  } catch (err) {
    console.error("🔥 SERVER ERROR IN APPROVE SELLER:", err);
    return res.status(500).json({
      message: "Server error while approving seller",
      error: err.message,
      stack: err.stack,
    });
  } 
});



// Admin: reject seller request
const rejectSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.sellerRequest.status = "rejected";
  await user.save();
  res.json({ message: "Seller request rejected", user });
});



export {
  authUser,
  registerUser,
  updatePushToken, 
  resendOTP,
  verifyOTP, 
  logoutUser,
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
