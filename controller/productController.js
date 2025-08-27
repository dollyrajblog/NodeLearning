const model = require("../models/product");
const Product = model.Product;
exports.getAllProducts = async (req, res) => {
  const productData = await Product.find();
  res.json(productData);
};
exports.getProduct = async (req, res) => {
  const id = +req.params.id;
  const productData = await Product.findOne({ id: id });
  res.json(productData);
};
exports.addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(" Erro saving product:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        details: err.errors,
      });
    }
    res.status(500).json({ error: "Server Error", message: err.message });
  }
};

exports.ReplaceProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedProduct = await Product.findOneAndReplace(
      { _id: id },
      req.body,
      { new: true }
    );
    res.status(201).json(updatedProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      req.body,
      { new: true }
    );
    res.status(201).json(updatedProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};

exports.deleteProduct = async (req,res) => {
  const id = req.params.id;
  try {
    const deleteItem = await Product.findOneAndDelete({ _id: id });
    res.status(201).json(deleteItem);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
