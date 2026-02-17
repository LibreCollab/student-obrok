import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { ImageModel } from "../models/Images.js";

const getAllImages = async (req, res) => {
  try {
    const images = await ImageModel.find(
      {},
      "title filename url mimeType size createdAt",
    );

    if (!images || images.length === 0) {
      return res.status(204).json({ message: "No images found." });
    }

    res.status(200).json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getImage = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID parameter is required." });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const image = await ImageModel.findById(req.params.id);

    if (!image) {
      return res
        .status(404)
        .json({ message: `No image matches ID ${req.params.id}.` });
    }

    res.status(200).json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required!" });
  }

  try {
    const result = await ImageModel.create({
      title: req.file.originalname,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    // Clean up the uploaded file if DB save fails
    fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteImage = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID is required." });
  }

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const image = await ImageModel.findById(req.body.id);

    if (!image) {
      return res
        .status(404)
        .json({ message: `No image matches ID ${req.body.id}.` });
    }

    // Delete file from disk
    const filePath = path.resolve("src/uploads", image.filename);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file:", err);
    });

    const result = await image.deleteOne();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const imagesController = {
  getAllImages,
  getImage,
  uploadImage,
  deleteImage,
};

export default imagesController;
