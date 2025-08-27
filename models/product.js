const mongoose = require("mongoose");
const { Schema } = mongoose;
// Schema
const productSchema = new Schema({
  id: { type: Number, require: true, unique: true },
  title: { type: String, require: true, unique: true },
  price: { type: Number, min: [1, "wrong min price"], require: true },
  description: { type: String, require: true },
  category: { type: String, require: true },
  image: { type: String, require: true },
  rating: {
    type: Number,
    min: [0, "wrong min rating"],
    max: [5, "wrong max rating"],
    require: true,
  },
});
exports.Product = mongoose.model("Product", productSchema);
