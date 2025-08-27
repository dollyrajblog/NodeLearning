const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
router
  .get("/getAllUser", userController.getAllUser)
  .delete("/deleteUser/:email", userController.deleteUser);
exports.router = router;
