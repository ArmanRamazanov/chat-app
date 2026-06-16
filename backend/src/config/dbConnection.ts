import mongoose from "mongoose";

let retryAttempt = 0;
const connectDB = async (cb: (err: any) => void) => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    retryAttempt = 0;
    cb(null);
  } catch (err) {
    retryAttempt++;
    const timeout = Math.min(1000 * 1.5 ** (retryAttempt - 1), 15000);
    if (retryAttempt <= 3 || process.env.NODE_ENV === "production") {
      return setTimeout(() => connectDB(cb), timeout);
    } else {
      cb(err);
    }
  }
};

export default connectDB;
