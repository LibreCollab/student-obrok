import { ProductModel } from "../models/Products.js";
import { VendorModel } from "../models/Vendors.js";
import { ImageModel } from "../models/Images.js";
import mongoose from "mongoose";

const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find()
      .populate("vendor")
      .populate("image", "title url mimeType");

    if (!products)
      return res.status(404).json({ message: "No products found." });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const createNewProduct = async (req, res) => {
  if (!req?.body?.title)
    return res.status(400).json({ message: "Title is required!" });

  if (!req?.body?.description)
    return res.status(400).json({ message: "Description is required!" });

  if (!req?.body?.price)
    return res.status(400).json({ message: "Price is required!" });

  if (!req?.body?.vendor)
    return res.status(400).json({ message: "Vendor is required!" });

  if (!mongoose.Types.ObjectId.isValid(req.body.vendor))
    return res.status(400).json({ message: "Invalid Vendor ID format." });

  const vendor = await VendorModel.findById(req.body.vendor).exec();
  if (!vendor) return res.status(404).json({ message: "Vendor not found." });

  if (req.body?.image) {
    if (!mongoose.Types.ObjectId.isValid(req.body.image))
      return res.status(400).json({ message: "Invalid image ID format." });

    const imageExists = await ImageModel.findById(req.body.image);
    if (!imageExists)
      return res.status(404).json({ message: "Selected image not found." });
  }

  try {
    const result = await ProductModel.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      image: req.body?.image || null,
      vendor: req.body.vendor,
    });

    if (!vendor.products) vendor.products = [];
    vendor.products.push(result._id);
    await vendor.save();

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateProduct = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required." });

  if (!mongoose.Types.ObjectId.isValid(req.body.id))
    return res.status(400).json({ message: "Invalid ID format." });

  if (req.body?.vendor)
    return res.status(400).json({ message: "Vendor can't be changed." });

  try {
    const product = await ProductModel.findById(req.body.id).exec();
    if (!product)
      return res
        .status(404)
        .json({ message: `No product matches ID ${req.body.id}.` });

    if (req.body?.title) product.title = req.body.title;
    if (req.body?.description) product.description = req.body.description;
    if (req.body?.price) product.price = req.body.price;

    if (req.body?.image) {
      if (!mongoose.Types.ObjectId.isValid(req.body.image))
        return res.status(400).json({ message: "Invalid image ID format." });

      const imageExists = await ImageModel.findById(req.body.image);
      if (!imageExists)
        return res.status(404).json({ message: "Selected image not found." });

      product.image = req.body.image;
    }

    const result = await product.save();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteProduct = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required." });

  if (!mongoose.Types.ObjectId.isValid(req.body.id))
    return res.status(400).json({ message: "Invalid ID format." });

  try {
    const product = await ProductModel.findById(req.body.id).exec();
    if (!product)
      return res
        .status(404)
        .json({ message: `No product matches ID ${req.body.id}.` });

    const vendor = await VendorModel.findById(product.vendor).exec();
    if (vendor) {
      vendor.products = (vendor.products || []).filter(
        (pid) => pid.toString() !== req.body.id,
      );
      if (vendor.products.length === 0) vendor.products = null;
      await vendor.save();
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getProduct = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID parameter is required." });

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "Invalid ID format." });

  try {
    const product = await ProductModel.findById(req.params.id)
      .populate("vendor")
      .populate("image", "title url mimeType")
      .exec();

    if (!product)
      return res
        .status(404)
        .json({ message: `No product matches ID ${req.params.id}.` });

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const productsController = {
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
  getProduct,
};

export default productsController;
