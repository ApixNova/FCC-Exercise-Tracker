const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
// Let's go :)
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({ username: String });
let User = mongoose.model("User", userSchema);
//Log Schema
const logSchema = new mongoose.Schema({
  id: String,
  description: String,
  duration: Number,
  date: Date,
});
let Log = mongoose.model("Log", logSchema);

// Post a user at /api/users with form data
app.post("/api/users", async function (req, res) {
  try {
    const user = await User.create({ username: req.body.username });
    // ... That returns an obj with username and _id
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    console.log(err);
  }
});

// Get /api/users returns an array
app.get("/api/users", async function (req, res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
});
// POST /api/users/:_id/exercises (desciption, duration, date) from the form
app.post("/api/users/:_id/exercises", async function (req, res) {
  try {
    const user = await User.findById(req.params._id);
    console.log(req.params._id);

    let date = new Date(req.body.date);
    // ... if no date, set the current date
    if (date == "Invalid Date") {
      date = new Date();
    }
    const exercise = await Log.create({
      id: req.params._id,
      description: req.body.description,
      duration: req.body.duration,
      date: date,
    });
    res.json({
      username: user.username,
      description: req.body.description,
      duration: Number(req.body.duration),
      date: date.toDateString(),
      _id: req.params._id,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/api/users/:_id/logs", async function (req, res) {
  try {
    const user = await User.findById(req.params._id);
    const logs = await Log.find({ id: req.params._id });
    const count = logs.length;
    let logsFormat = [];
    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit;

    logs.forEach((log) => {
      logsFormat.push({
        description: log.description,
        duration: log.duration,
        date: log.date,
      });
    });

    if (typeof from != "undefined") {
      logsFormat = logsFormat.filter((log) => log.date >= new Date(from));
    }
    if (typeof to != "undefined") {
      logsFormat = logsFormat.filter((log) => log.date <= new Date(to));
    }
    if (typeof limit != "undefined") {
      logsFormat.splice(limit);
    }

    logsFormat.forEach((log) => (log.date = log.date.toDateString()));

    res.json({
      username: user.username,
      count: count,
      _id: req.params._id,
      log: logsFormat,
    });
  } catch (err) {
    console.log(err);
  }
});

exports.userSchema = User;
