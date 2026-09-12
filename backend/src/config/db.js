import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado ✅");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    throw error;
  }
};

export default connectDB;