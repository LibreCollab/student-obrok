import mongoose from "mongoose";
import { UserModel } from "../models/Users.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);

    const existingUser = await UserModel.findOne({ username: process.env.ADMIN_USERNAME }).exec();

    if (!existingUser) {
      // Create the user if not found
      UserModel.create({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

export default connectDB;
