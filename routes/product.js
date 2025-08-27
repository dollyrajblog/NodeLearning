const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
router
  .get("/", productController.getAllProducts)
  .get("/:id", productController.getProduct)
  .post("/add", productController.addProduct)
  .put("/Replace/:id", productController.ReplaceProduct)
  .patch("/updateId/:id", productController.updateProduct)
  .delete("/delete/:id", productController.deleteProduct);
exports.router = router;
