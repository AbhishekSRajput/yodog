const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//validation schemas
const { YodogerSchema } = require("./validation/YodogerSchema");
const { ReviewSchema } = require("./validation/ReviewSchema");
//models
const Yodoger = require("./models/yodoger");
const Review = require("./models/review");
//error handlers
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { redirect } = require("express/lib/response");

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
//one of many engines that help run and parse ejs
app.engine("ejs", ejsMate);
//ejs setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//parsing the body
app.use(express.urlencoded({ extended: true }));
//method override for put and other requests
app.use(methodOverride("_method"));
//server side validation
const validateYodogers = (req, res, next) => {
  const { error } = YodogerSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = ReviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

//route handlers
app.get("/", (req, res) => {
  res.render("home");
});

//all yodogers
app.get(
  "/yodogers",
  catchAsync(async (req, res) => {
    const yodogers = await Yodoger.find({});
    res.render("yodogers/index", { yodogers });
  })
);

//get to add Yodoger page
app.get("/yodogers/new", (req, res) => {
  res.render("yodogers/new");
});

//add a Yodoger
app.post(
  "/yodogers",
  validateYodogers,
  catchAsync(async (req, res) => {
    const yodoger = new Yodoger(req.body.yodoger);
    await yodoger.save();
    res.redirect(`/yodogers/${yodoger._id}`);
  })
);

//Yodoger details
app.get(
  "/yodogers/:userId",
  catchAsync(async (req, res) => {
    const id = req.params.userId;
    const singleYodoger = await Yodoger.findById(id).populate("reviews");
    res.render("yodogers/details", { singleYodoger });
  })
);

//edit Yodoger
app.get(
  "/yodogers/:userId/edit",
  catchAsync(async (req, res) => {
    const id = req.params.userId;
    const singleYodoger = await Yodoger.findById(id);
    res.render("yodogers/edit", { singleYodoger });
  })
);

//update Yodoger
app.put(
  "/yodogers/:userId",
  validateYodogers,
  catchAsync(async (req, res) => {
    const id = req.params.userId;
    const receivedYodogerObject = req.body.yodoger;
    const updatedYodoger = await Yodoger.findByIdAndUpdate(
      id,
      receivedYodogerObject
    );
    res.redirect(`/yodogers/${updatedYodoger._id}`);
  })
);

//delete Yodoger
app.delete(
  "/yodogers/:userId",
  catchAsync(async (req, res) => {
    const id = req.params.userId;
    await Yodoger.findByIdAndDelete(id);
    res.redirect("/yodogers");
  })
);
//add a review
app.post(
  "/yodogers/:userId/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const yodoger = await Yodoger.findById(req.params.userId);
    const review = await new Review(req.body.review);
    yodoger.reviews.push(review);
    await yodoger.save();
    await review.save();
    res.redirect(`/yodogers/${yodoger._id}`);
  })
);
//delete a review
app.delete(
  "/yodogers/:userId/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { userId, reviewId } = req.params;
    await Yodoger.findByIdAndUpdate(userId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/yodogers/${userId}`);
  })
);

//404 RESPONSE HANDLER
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});
//error handlers
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "something went wrong";
  res.status(statusCode).render("error", { err });
});
//create local server
app.listen(3000, () => {
  console.log("app listening at the port 3000");
});
