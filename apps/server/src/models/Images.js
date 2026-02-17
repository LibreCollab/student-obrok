import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    data: { type: String, required: true },
    mimeType: { type: String, required: true },
  },
  { timestamps: true }
);

export const ImageModel = mongoose.model("image", ImageSchema);