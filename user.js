const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/zcoder")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("fail.connect");
  });

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  userhandle: {
    type: String,
    unique: true,
    required: true,
  },
  about: { type: String },
  skills: { type: [String] },
  profile_image: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  bookmark: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  handles: {
    type: Map,
    of: String,
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = new mongoose.model("User", userSchema);
module.exports = User;
