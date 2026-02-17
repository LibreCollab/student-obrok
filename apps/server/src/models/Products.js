import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "image",
    required: false,
  },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "vendor" },
});

export const ProductModel = mongoose.model("products", ProductSchema);
