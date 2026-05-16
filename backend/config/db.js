import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        mongoose.set("strictQuery", true);
        const connect=await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 20,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        mongoose.connection.on("error", (error) => {
            console.error(`MongoDB connection error: ${error.message}`);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
        });

        console.log(`mongodb connected : ${connect.connection.host}`)
    } catch (error) {
        console.log(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB   