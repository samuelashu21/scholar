import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = mongoose.Schema(
  {
    FirstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    LastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\+251\d{9}$/.test(v);
        },
        message: "Phone must start with +251 and be followed by 9 digits",
      },
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: "/images/default-profile.png",
    },
    pushToken: { type: String, default: "" },
    loginCount: {
      type: Number,
      default: 0,
    },
    sellerProfile: {
      storeName: { type: String },
      storeDescription: { type: String },
      storeLogo: { type: String, default: "/images/default-profile.png" },
      rating: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
    },
    sellerRequest: {
      isRequested: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      // NEW — Subscription type enum
      subscriptionType: { 
        type: String,
        enum: ["free", "paid_1_month", "paid_6_month"],
        default: "free",
      },
      subscriptionStart: { type: Date },
      subscriptionEnd: { type: Date },
      boostActive: { type: Boolean, default: false },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active",
    },
    lastLogin: Date,
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    otpresetpassword: String,
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpires: { type: Date },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    address: {
      kebele: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.FirstName} ${this.LastName}`;
});

// Check if seller subscription is active
userSchema.methods.isSubscriptionActive = function () {
  if (!this.sellerRequest.subscriptionEnd) return false;
  return new Date() <= this.sellerRequest.subscriptionEnd;
};

// Match entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware for password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ "sellerRequest.status": 1 });
userSchema.index({ accountStatus: 1 });

const User = mongoose.model("User", userSchema);
export default User;
