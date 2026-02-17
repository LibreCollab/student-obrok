import { DealModel } from "../models/Deals.js";
import { VendorModel } from "../models/Vendors.js";
import { ImageModel } from "../models/Images.js";
import mongoose from "mongoose";
import { Parser } from "json2csv";

const getAllVendors = async (req, res) => {
  try {
    const vendors = await VendorModel.find()
      .populate("deals")
      .populate("image");

    if (!vendors) return res.status(204).json({ message: "No vendors found." });

    res.status(200).json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const createNewVendor = async (req, res) => {
  if (!req?.body?.name) {
    return res.status(400).json({ message: "Name is required!" });
  }

  if (
    !req?.body?.location ||
    req?.body?.location[0] === "" ||
    req?.body?.location[1] === "" ||
    !req?.body?.location[0] ||
    !req?.body?.location[1]
  ) {
    return res
      .status(400)
      .json({ message: "Location coordinates are required!" });
  }

  if (!req?.body?.image) {
    return res.status(400).json({ message: "Cover image is required!" });
  }

  if (!mongoose.Types.ObjectId.isValid(req.body.image)) {
    return res.status(400).json({ message: "Invalid image ID format." });
  }

  const imageExists = await ImageModel.findById(req.body.image);
  if (!imageExists) {
    return res.status(404).json({ message: "Selected image not found." });
  }

  if (req?.body?.deals) {
    return res
      .status(400)
      .json({ message: "Can't attach deals when creating vendor!" });
  }

  try {
    const result = await VendorModel.create({
      name: req.body.name,
      location: req.body.location,
      image: req.body.image,
      deals: null,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateVendor = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID is required." });
  }

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const vendor = await VendorModel.findOne({ _id: req.body.id }).exec();

    if (!vendor) {
      return res
        .status(404)
        .json({ message: `No vendor matches ID ${req.body.id}.` });
    }

    if (req.body?.name) vendor.name = req.body.name;
    if (req.body?.location) vendor.location = req.body.location;

    if (req.body?.image) {
      if (!mongoose.Types.ObjectId.isValid(req.body.image)) {
        return res.status(400).json({ message: "Invalid image ID format." });
      }
      const imageExists = await ImageModel.findById(req.body.image);
      if (!imageExists) {
        return res.status(404).json({ message: "Selected image not found." });
      }
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

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const vendor = await VendorModel.findOne({ _id: req.body.id }).exec();

    if (!vendor) {
      return res
        .status(404)
        .json({ message: `No vendor matches ID ${req.body.id}.` });
    }

    if (vendor.deals && vendor.deals.length > 0) {
      const dealIds = vendor.deals;
      await DealModel.deleteMany({ _id: { $in: dealIds } }).exec();
    }

    const result = await vendor.deleteOne();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getVendor = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "ID parameter is required." });

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const vendor = await VendorModel.findOne({ _id: req.params.id })
      .populate("deals")
      .populate("image")
      .exec();

    if (!vendor) {
      return res
        .status(404)
        .json({ message: `No vendor matches ID ${req.params.id}.` });
    }

    res.status(200).json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const generateReport = async (req, res) => {
  try {
    let vendors = [];
    const vendorsData = await VendorModel.find({})
      .populate("deals")
      .populate("image", "title");

    vendorsData.forEach((vendor) => {
      const { name, location, deals, image } = vendor;
      let dealsData = "";

      if (deals !== null) {
        deals.forEach((deal) => {
          const { title, price } = deal;
          dealsData = dealsData.concat(`${title}, ${price} ден\n`);
        });
      }

      vendors.push({
        name,
        location,
        image: image?.title || "",
        deals: dealsData,
      });
    });

    const csvFields = ["Name", "Location", "Image", "Deals"];
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
