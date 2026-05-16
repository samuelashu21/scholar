import dotenv from "dotenv";
import users from "./data/users.js";
import User from "./models/userModel.js";
import connectDB from "./config/db.js";

dotenv.config();
 
connectDB(); 

const importData = async () => {
  try {
    // Remove existing users
    await User.deleteMany();

    // Insert sample users
    await User.insertMany(users);

    console.log("Users Imported Successfully");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // Remove all users
    await User.deleteMany();

    console.log("Users Destroyed Successfully");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

// Run Commands
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}