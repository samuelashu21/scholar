import express from 'express'
import dotenv from "dotenv";
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js"; 
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import uploadProfileRoutes from "./routes/uploadProfileRoutes.js";
import User from "./models/userModel.js"; 
 import wishlistRoutes from "./routes/wishlistRoutes.js";
import chatRoutes from "./routes/chatRoutes.js"; 
 
import path from "path"; 

dotenv.config(); 
connectDB(); 

const app=express() 
 
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
  
// Serve product uploads 
const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

// Serve profile uploads
const profileUploadsDir = path.join(process.cwd(), "uploadsprofile");
app.use("/uploadsprofile", express.static(profileUploadsDir));
 
const port=9090;
  
app.use("/api/products",productRoutes);   
app.use("/api/users",userRoutes);    
app.use("/api/orders",orderRoutes); 
app.use("/api/categories", categoryRoutes); // added 
app.use("/api/subcategories", subcategoryRoutes); // added  
app.use("/api/upload", uploadRoutes); 
app.use("/api/uploadprofile", uploadProfileRoutes); 
app.use("/api/wishlist", wishlistRoutes);
app.use('/api/chats', chatRoutes); 
  

// Auto-clean expired OTP every 10 mins
setInterval(async () => {
  try {
    await User.updateMany(
      { otpExpires: { $lt: Date.now() } },
      { otp: null, otpExpires: null }
    );  
    console.log("Expired OTPs cleaned");
  } catch (err) {
    console.error("OTP cleanup error:", err);
  }
}, 10 * 60 * 1000);
 
  
app.use((req, res) => { 
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler); 

app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})


 






