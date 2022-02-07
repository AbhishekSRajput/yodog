const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Yodogers = require("./models/yoDogers");

mongoose
  .connect("mongodb://localhost:27017/yodog")
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("Error, MONGO CONNECTION!!!!");
    console.log(err);
  });

const app = express();

//ejs setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//parsing the body
app.use(express.urlencoded({ extended: true }));
//method override for put and other requests
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

//all yodogers
app.get("/yodogers", async (req, res) => {
  const yodogers = await Yodogers.find({});
  res.render("yodogers/index", { yodogers });
});

//get to add Yodoger page
app.get("/yodogers/new", (req, res) => {
  res.render("yodogers/new");
});

//add a Yodoger
app.post("/yodogers", async (req, res) => {
  const receivedYodogerObject = req.body.yodoger;
  const addedSingleYodoger = new Yodogers(receivedYodogerObject);
  await addedSingleYodoger.save();
  res.redirect(`/yodogers/${addedSingleYodoger._id}`);
});

//Yodoger details
app.get("/yodogers/:userId", async (req, res) => {
  const id = req.params.userId;
  const singleYodoger = await Yodogers.findById(id);
  res.render("yodogers/details", { singleYodoger });
});

//edit Yodoger
app.get("/yodogers/:userId/edit", async (req, res) => {
  const id = req.params.userId;
  const singleYodoger = await Yodogers.findById(id);
  res.render("yodogers/edit", { singleYodoger });
});

//update Yodoger
app.put("/yodogers/:userId", async (req, res) => {
  const id = req.params.userId;
  const receivedYodogerObject = req.body.yodoger;
  const updatedYodoger = await Yodogers.findByIdAndUpdate(
    id,
    receivedYodogerObject
  );
  res.redirect(`/yodogers/${updatedYodoger._id}`);
});

app.listen(3000, () => {
  console.log("app listening at the port 3000");
});
