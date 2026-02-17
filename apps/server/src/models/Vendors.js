import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: [{ type: Number, required: true }],
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "image",
    required: true,
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
});

export const VendorModel = mongoose.model("vendor", VendorSchema);
