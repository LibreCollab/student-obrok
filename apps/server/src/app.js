import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import mongoSanitize from "express-mongo-sanitize";
import { authRouter } from "./routes/api/auth.js";
import { dealsRouter } from "./routes/api/deals.js";
import connectDB from "./config/connectDB.js";
import credentials from "./middleware/credentials.js";
import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";
import { refreshTokenRouter } from "./routes/api/refresh.js";
import { logoutRouter } from "./routes/api/logout.js";
import { vendorsRouter } from "./routes/api/vendors.js";
import { imagesRouter } from "./routes/api/images.js";

const PORT = process.env.PORT;
const app = express();

// Connect to MongoDB
connectDB();

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ limit: "10mb", extended: false }));

// built-in middleware for json
app.use(express.json({ limit: "10mb" }));

//middleware for cookies
app.use(cookieParser());

//Data Sanitization
app.use(mongoSanitize());

//Routes
app.use("/api", authRouter);
app.use("/api", refreshTokenRouter);
app.use("/api", logoutRouter);
app.use("/api", dealsRouter);
app.use("/api", vendorsRouter);
app.use("/api", imagesRouter);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
