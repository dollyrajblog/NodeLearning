const mongoose = require("mongoose");
const { Schema } = mongoose;
// user Schema

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email`,
    },
    require: true,
  },
  password: { type: String, minLength: 6, required: true },
  token: String,
});

exports.User = mongoose.model("User", userSchema);
