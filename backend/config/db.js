import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
// "mongodb+srv://tabishismail80_db_user:Ismailtabish123@cluster0.buo6xhu.mongodb.net/Medicare"
"mongodb://tabishismail80_db_user:Ismailtabish123@ac-njquqo8-shard-00-00.buo6xhu.mongodb.net:27017,ac-njquqo8-shard-00-01.buo6xhu.mongodb.net:27017,ac-njquqo8-shard-00-02.buo6xhu.mongodb.net:27017/?ssl=true&replicaSet=atlas-v5fwes-shard-0&authSource=admin&appName=Cluster0"
    );

    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.log("❌ MongoDB Error:", err);
  }
};