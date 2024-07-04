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
    default: {
      "Codeforces": "https://codeforces.com/",
      "Codechef": "https://codechef.com/",
      "Atcoder": "https://atcoder.jp/",
      "Geeks for Geeks": "https://www.geeksforgeeks.org/courses?source=google&medium=cpc&device=c&keyword=geeksforgeeks&matchtype=e&campaignid=20039445781&adgroup=147845288105&gad_source=1&gclid=Cj0KCQjwvb-zBhCmARIsAAfUI2v1KJMpGxPciw1K_nrOvdH4tBuCxdVuQQbIfXOMF4x508G9i4w9k6gaAq0uEALw_wcB",
      "Leetcode": "https://leetcode.com/"
    }
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = new mongoose.model("User", userSchema);
module.exports = User;
