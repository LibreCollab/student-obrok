import express from "express";
import imagesController from "../../controllers/imagesController.js";
import verifyJWT from "../../middleware/verifyJWT.js";

const router = express.Router();

router
  .route("/images")
  .get(verifyJWT, imagesController.getAllImages)
  .post(verifyJWT, imagesController.uploadImage)
  .delete(verifyJWT, imagesController.deleteImage);

router.route("/images/:id").get(imagesController.getImage);

export { router as imagesRouter };
