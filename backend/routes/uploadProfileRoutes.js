 import express from "express";
 import multer from "multer";
 import path from "path";
 import fs from "fs";
 
 const router = express.Router();
 
 const uploadsDir = path.join(process.cwd(), "uploadsprofile"); 
 
 if (!fs.existsSync(uploadsDir)) { 
   fs.mkdirSync(uploadsDir, { recursive: true });
 }
  
 const storage = multer.diskStorage({
   destination(req, file, cb) { 
     cb(null, uploadsDir); 
   },
   filename(req, file, cb) {
     const filename = `${file.fieldname}-${Date.now()}${path.extname(
       file.originalname
     )}`;
     cb(null, filename);
   },
 });
 
 function checkFileType(file, cb) {
   const filetypes = /jpg|jpeg|png/;
 
   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
 
   const mimetype = filetypes.test(file.mimetype);
   if (extname && mimetype) {
     return cb(null, true);
   } else {
     cb("Images only");
   }
 }
 
 const upload = multer({
   storage,
   fileFilter: function (req, file, cb) {
     checkFileType(file, cb);
   },
 });
 
 router.post("/", upload.single("image"), (req, res) => {
   if (!req.file) {
     return res.status(400).json({ message: "No file uploaded" });
   }
 
   const imagePath = `/uploadsprofile/${req.file.filename}`;
 
   res.send({ 
     message: "Image uploaded successfully",
     image: imagePath,
   });
 });
 
  
 
 router.use((err, req,res,next)=>{
     res.status(500).json({message:err.message || "Error processing upload"})
 })
 
 export default router; 