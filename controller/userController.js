const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const model = require("../models/user");
const User = model.User;

exports.CreateUser = async (req, res) => {
  try {
    const user = new User(req.body);
    console.log("reqbody", req.body);
    const hash = await bcrypt.hash(String(req.body.password), 10);
    var token = jwt.sign({ email: req.body.email }, "shhhhh");
    user.token = token;
    user.password = hash;
    const createUser = await user.save();
    res.status(201).json(createUser);
  } catch (err) {
    console.error(" Error creating user:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        details: err.errors,
      });
    }
    res.status(500).json({ error: "Server Error", message: err.message });
  }
};
exports.loginUser = async (req, res) => {
  try {
    var token = jwt.sign({ email: req.body.email }, "shhhhh");
    user.token = token;
    const createUser = await user.save();
    res.status(201).json(createUser);
  } catch (err) {
    console.error(" Error creating user:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation Error",
        details: err.errors,
      });
    }
    res.status(500).json({ error: "Server Error", message: err.message });
  }
};

exports.getAllUser = async (req, res) => {
  const UserData = await User.find();
  res.json(UserData);
};

exports.deleteUser = async (req, res) => {
  console.log(req.params)
  const email = req.params.email;
  try {
    const deleteItem = await User.findOneAndDelete({ email: email});
    res.status(201).json(deleteItem);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};