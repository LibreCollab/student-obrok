import mongoose from "mongoose";
import { ImageModel } from "../models/Images.js";

const getAllImages = async (req, res) => {
  try {
    const images = await ImageModel.find({}, "title mimeType createdAt");

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
  if (!req?.body?.title) {
    return res.status(400).json({ message: "Image title is required!" });
  }

  if (!req?.body?.data) {
    return res.status(400).json({ message: "Image data is required!" });
  }

  if (!req?.body?.mimeType) {
    return res.status(400).json({ message: "MIME type is required!" });
  }

  try {
    const result = await ImageModel.create({
      title: req.body.title,
      data: req.body.data,
      mimeType: req.body.mimeType,
    });

    res.status(201).json({
      _id: result._id,
      title: result.title,
      mimeType: result.mimeType,
      createdAt: result.createdAt,
    });
  } catch (err) {
    console.error(err);
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
