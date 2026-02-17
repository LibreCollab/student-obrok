import express from "express";
import productsController from "../../controllers/productsController.js";
import verifyJWT from "../../middleware/verifyJWT.js";

const router = express.Router();

router
  .route("/products")
  .get(productsController.getAllProducts)
  .post(verifyJWT, productsController.createNewProduct)
  .put(verifyJWT, productsController.updateProduct)
  .delete(verifyJWT, productsController.deleteProduct);

router.route("/products/:id").get(productsController.getProduct);

export { router as productsRouter };
