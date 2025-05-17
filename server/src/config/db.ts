import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI: string =
      process.env.MONGO_URI || "mongodb://localhost:27017/store-traffic";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log(
      "If using a local MongoDB, ensure MongoDB is installed and running"
    );
    process.exit(1);
  }
};

export default connectDB;
