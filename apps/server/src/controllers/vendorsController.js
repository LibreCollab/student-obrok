import { ProductModel } from "../models/Products.js";
import { VendorModel } from "../models/Vendors.js";
import { ImageModel } from "../models/Images.js";
import mongoose from "mongoose";
import { Parser } from "json2csv";

const getAllVendors = async (req, res) => {
  try {
    const vendors = await VendorModel.find()
      .populate({
        path: "products",
        populate: { path: "image", select: "title url mimeType" },
      })
      .populate("image", "title url mimeType");

    if (!vendors) return res.status(204).json({ message: "No vendors found." });

    res.status(200).json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const createNewVendor = async (req, res) => {
  if (!req?.body?.name)
    return res.status(400).json({ message: "Name is required!" });

  if (
    !req?.body?.location ||
    !req?.body?.location[0] ||
    !req?.body?.location[1]
  )
    return res
      .status(400)
      .json({ message: "Location coordinates are required!" });

  if (!req?.body?.image)
    return res.status(400).json({ message: "Cover image is required!" });

  if (!mongoose.Types.ObjectId.isValid(req.body.image))
    return res.status(400).json({ message: "Invalid image ID format." });

  const imageExists = await ImageModel.findById(req.body.image);
  if (!imageExists)
    return res.status(404).json({ message: "Selected image not found." });

  if (req?.body?.products)
    return res
      .status(400)
      .json({ message: "Can't attach products when creating vendor!" });

  try {
    const result = await VendorModel.create({
      name: req.body.name,
      location: req.body.location,
      image: req.body.image,
      products: null,
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateVendor = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required." });

  if (!mongoose.Types.ObjectId.isValid(req.body.id))
    return res.status(400).json({ message: "Invalid ID format." });

  try {
    const vendor = await VendorModel.findById(req.body.id).exec();
    if (!vendor)
      return res
        .status(404)
        .json({ message: `No vendor matches ID ${req.body.id}.` });

    if (req.body?.name) vendor.name = req.body.name;
    if (req.body?.location) vendor.location = req.body.location;

    if (req.body?.image) {
      if (!mongoose.Types.ObjectId.isValid(req.body.image))
        return res.status(400).json({ message: "Invalid image ID format." });

      const imageExists = await ImageModel.findById(req.body.image);
      if (!imageExists)
        return res.status(404).json({ message: "Selected image not found." });

      vendor.image = req.body.image;
    }

    const result = await vendor.save();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteVendor = async (req, res) => {
  if (!req?.body?.id)
    return res.status(400).json({ message: "ID is required." });

  if (!mongoose.Types.ObjectId.isValid(req.body.id))
    return res.status(400).json({ message: "Invalid ID format." });

  try {
    const vendor = await VendorModel.findById(req.body.id).exec();
    if (!vendor)
      return res
        .status(404)
        .json({ message: `No vendor matches ID ${req.body.id}.` });

    if (vendor.products && vendor.products.length > 0) {
      await ProductModel.deleteMany({ _id: { $in: vendor.products } }).exec();
    }

    await vendor.deleteOne();
    res.status(200).json({ message: "Vendor deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getVendor = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID parameter is required." });

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "Invalid ID format." });

  try {
    const vendor = await VendorModel.findOne({ _id: req.params.id })
      .populate({
        path: "products",
        populate: { path: "image", select: "title url mimeType" },
      })
      .populate("image", "title url mimeType")
      .exec();

    if (!vendor)
      return res
        .status(404)
        .json({ message: `No vendor matches ID ${req.params.id}.` });
    res.status(200).json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const generateReport = async (req, res) => {
  try {
    const vendorsData = await VendorModel.find({})
      .populate("products")
      .populate("image", "title");

    const vendors = vendorsData.map((vendor) => {
      const { name, location, products, image } = vendor;

      let productsData = "";
      if (products?.length) {
        products.forEach((product) => {
          productsData += `${product.title}, ${product.price} ден\n`;
        });
      }

      return {
        name,
        location,
        image: image ? `https://obrok.net/uploads/${image.filename}` : "",
        products: productsData,
      };
    });

    const csvFields = ["Name", "Location", "Image", "Products"];
    const csvParser = new Parser({ csvFields });
    const csvData = csvParser.parse(vendors);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=VendorsReport.csv",
    );
    res.status(200).end(csvData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const vendorsController = {
  getAllVendors,
  createNewVendor,
  updateVendor,
  deleteVendor,
  getVendor,
  generateReport,
};

export default vendorsController;
