const express = require("express");
const main = express();
const multer = require("multer");
const session = require("express-session");
const userId = "6662cd42490ac3d411468604";
const bcrypt = require('bcryptjs');
main.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

const User = require("./user");
const Question = require("./questionschema");
const Comment = require("./comment");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./views/uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

main.use(express.json());
main.set("view engine", "ejs");
main.use(express.urlencoded({ extended: false }));
main.use(express.static("./views"));

main.listen(3000, () => {
  console.log("port connected");
});

main.get("/", async (req, res) => {
  const id = "6662cd42490ac3d411468604";
  const user = await User.findById(id);
  const questions = await Question.find();
  const comments = await Comment.find().populate('userId', 'userhandle');
  res.render("landing", { user, questions, comments });
});

main.get("/signin", (req, res) => {
  res.render("signin");
});

main.get("/register", (req, res) => {
  res.render("register");
});

main.get("/addquestion", (req, res) => {
  res.render("addquestion");
});

main.post("/questions", async (req, res) => {
  const userEmail = req.query.email;
  const user = await User.findOne({ email: userEmail });
  const { title, link, topics, solution, visibility } = req.body;
  const topicsArray = Array.isArray(topics) ? topics : [topics];
  const question = new Question({
    title: title,
    link: link,
    topics: topicsArray,
    solution: solution,
    visibility: visibility === 'community' ? false : true,
    userId: user._id
  });

  try {
    await question.save();
    const user = await User.findOne({ email: userEmail });
    if (user) {
      if (user._id.toString() === userId) {
        req.session.bookmark = userId;
        res.render("signin");
      } else {
        const questions = await Question.find();
        const comments = await Comment.find().populate('userId', 'userhandle');
        res.render("landing", { user, questions, comments });
      }
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});



main.post("/register", upload.single("profile_image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      city: req.body.city,
      college: req.body.college,
      email: req.body.email,
      userhandle: req.body.userhandle.toLowerCase(),
      profile_image: req.file.filename,
      password: hashedPassword,
      bookmark: [],
      following: [],
      handles: {
        "Codeforces": "https://codeforces.com/",
        "Codechef": "https://codechef.com/",
        "Atcoder": "https://atcoder.jp/",
        "Geeks for Geeks": "https://www.geeksforgeeks.org/courses?source=google&medium=cpc&device=c&keyword=geeksforgeeks&matchtype=e&campaignid=20039445781&adgroup=147845288105&gad_source=1&gclid=Cj0KCQjwvb-zBhCmARIsAAfUI2v1KJMpGxPciw1K_nrOvdH4tBuCxdVuQQbIfXOMF4x508G9i4w9k6gaAq0uEALw_wcB",
        "Leetcode": "https://leetcode.com/"
      }
    });

    try {
      await user.save();
      const questions = await Question.find();
      if (req.session.questionToBookmark) {
        user.bookmark.push(req.session.questionToBookmark);
        await user.save();
        req.session.questionToBookmark = null;
      }
      if (req.session.bookmark) {
        const bookmarkedQuestions = await Question.find({
          _id: { $in: user.bookmark },
        });
        res.render("bookmarkquestions", { user, bookmarkedQuestions });
        req.session.bookmark = null;
        return;
      }
      if (req.session.profilepage && req.session.profilepage === userId) {
        req.session.profilepage = null;
        return res.render("profile", { user });
      }
      const comments = await Comment.find().populate('userId', 'userhandle');
      res.render("landing", { user, questions, comments});
    } catch (err) {
      if (err.code === 11000) {
        return res.render("register2");
      } else {
        console.error("Error inserting data into MongoDB:", err);
        return res.status(500).send("Internal Server Error");
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Error occurred");
  }
});

main.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch) {
      const questions = await Question.find();
      if (req.session.questionToBookmark) {
        user.bookmark.push(req.session.questionToBookmark);
        await user.save();
        req.session.questionToBookmark = null;
      }
      if (req.session.bookmark) {
        const bookmarkedQuestions = await Question.find({
          _id: { $in: user.bookmark },
        });
        req.session.bookmark = null;
        return res.render("bookmarkquestions", { user, bookmarkedQuestions });
      }
      if (req.session.profilepage && req.session.profilepage === userId) {
        req.session.profilepage = null;
        return res.render("profile", { user });
      }
      const comments = await Comment.find().populate('userId', 'userhandle');
      res.render("landing", { user, questions, comments });
    } else {
      res.render("signin1");
    }
  } catch {
    res.render("register1");
  }
});

main.post("/bookmark/:questionId/:email", async (req, res) => {
  const userEmail = req.params.email;
  const userId = "6662cd42490ac3d411468604";
  const questionId = req.params.questionId;

  const user = await User.findOne({ email: userEmail });
  if (user) {
    if (user._id.toString() === userId) {
      req.session.questionToBookmark = questionId;

      res.render("signin");
    } else {
      if (!user.bookmark.includes(questionId)) {
        user.bookmark.push(questionId);
        await user.save();
      }
      const questions = await Question.find();
      const comments = await Comment.find().populate('userId', 'userhandle');
      res.render("landing", { user, questions, comments });
    }
  } else {
    res.status(404).send("User not found");
  }
});

main.get("/bookmarkquestions", async (req, res) => {
  const userEmail = req.query.email;
  const userId = "6662cd42490ac3d411468604";

  try {
    const user = await User.findOne({ email: userEmail });
    if (user) {
      if (user._id.toString() === userId) {
        req.session.bookmark = userId;
        res.render("signin");
      } else {
        const bookmarkedQuestions = await Question.find({
          _id: { $in: user.bookmark },
        });
        res.render("bookmarkquestions", { user, bookmarkedQuestions });
      }
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

main.post("/unbookmark/:questionId/:email", async (req, res) => {
  const userEmail = req.params.email;
  const questionId = req.params.questionId;

  const user = await User.findOne({ email: userEmail });
  if (user) {
    index = user.bookmark.findIndex((id) => id !== questionId);
    if (index !== -1) {
      user.bookmark.splice(index, 1);
    }
    await user.save();
    const bookmarkedQuestions = await Question.find({
      _id: { $in: user.bookmark },
    });
    res.render("bookmarkquestions", { user, bookmarkedQuestions });
  } else {
    res.status(404).send("User not found");
  }
});

main.get("/landing", async (req, res) => {
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId);
    const questions = await Question.find();
    const comments = await Comment.find().populate('userId', 'handle');
    res.render("landing", { user, questions, comments});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

main.get("/question", async (req, res) => {
  const userEmail = req.query.email;
  const user = await User.findOne({ email: userEmail });
  res.render("addquestion", { user });
});

main.get("/profile", async (req, res) => {
  const userId = "6662cd42490ac3d411468604";
  try {
    const user = await User.findOne({ email: req.query.email });
    if (user) {
      if (user._id.toString() === userId) {
        req.session.profilepage = userId;
        res.render("signin");
      } else {
        console.log("Profile Image:", user.profile_image);
        console.log(user);
        res.render("profile", { user });
      }
    }
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});

main.get("/edit", async (req, res) => {
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId);
    res.render("edit", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

main.post("/update", async (req, res) => {
  try {
    const userId = req.query.userId;
    const updatedUserData = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      city: req.body.city,
      college: req.body.college,
      email: req.body.email,
      userhandle: req.body.userHandle,
      password: req.body.password,
      about: req.body.about,
      skills: Array.isArray(req.body.skills) ? req.body.skills : [req.body.skills]
    };

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      updatedUserData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.render("profile", { user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

main.get("/handle", async (req, res) => {
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId);
    res.render("addhandle", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

main.post("/addHandles", async (req, res) => {
  try {
    const { userId, handleName, handleLink } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { [`handles.${handleName}`]: handleLink } },
      { new: true }
    );
    res.render("profile", { user: updatedUser });
  } catch (error) {
    console.error("Error updating handles:", error);
    res.status(500).send("Internal Server Error");
  }
});

main.get("/searchUser", async (req, res) => {
  const usercurrId = req.query.userId; // Use req.query.userId for GET requests
  try {
    const userhandle = req.query.userhandle.toLowerCase();
    const user = await User.findOne({ userhandle });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("viewprofile", { user, usercurrId });
  } catch (error) {
    console.error("Error searching user:", error);
    res.status(500).send("Internal Server Error");
  }
});

main.get("/profile", async (req, res) => {
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId);
    res.render("profile", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

main.post("/follow/:userId", async (req, res) => {
  const userId = req.params.userId;
  const userIdToFollow = req.body.userIdtofollow;

  if (userIdToFollow === userId) {
    return res.status(400).send("You cannot follow yourself");
  }

  try {
    const user = await User.findById(userId);

    if (!user.following) {
      user.following = [];
      user.following.push(userIdToFollow);
    }
    if (!user.following.includes(userIdToFollow)) {
      user.following.push(userIdToFollow);
      await user.save();
    }

    res.render("profile", { user });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).send("Internal Server Error");
  }
});

main.post("/comment/:questionId/:userId", async (req, res) => {
  const { questionId, userId } = req.params;
  const { comment } = req.body;
  // console.log('Question ID:', questionId);
  // console.log('User ID:', userId);
  // console.log('Comment:', comment);

  try {
    const newComment = new Comment({
      questionId,
      userId,
      comment,
    });

    const user = await User.findById(userId);
    await newComment.save();

    const questions = await Question.find();
    const comments = await Comment.find().populate('userId', 'userhandle');
    res.render("landing", { user, questions, comments});
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
