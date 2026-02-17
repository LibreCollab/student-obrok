import express from "express";
import imagesController from "../../controllers/imagesController.js";
import verifyJWT from "../../middleware/verifyJWT.js";
import upload from "../../config/multerConfig.js";

const router = express.Router();

router
  .route("/images")
  .get(verifyJWT, imagesController.getAllImages)
  .post(verifyJWT, upload.single("image"), imagesController.uploadImage)
  .delete(verifyJWT, imagesController.deleteImage);

router.route("/images/:id").get(imagesController.getImage);

export { router as imagesRouter };
