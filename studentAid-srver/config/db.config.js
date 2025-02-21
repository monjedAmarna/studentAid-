import mongoose from "mongoose";

const connectDB = async (URI) => {
    mongoose.set("strictQuery", false);
    await mongoose.connect(URI);
    console.log("Database connected successfully");
};


export default connectDB;