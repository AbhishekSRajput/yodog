const express = require("express");
const router = express.Router({ mergeParams: true });
//models
const Yodoger = require("../models/yodoger");
const Review = require("../models/review");
//error handlers
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
//validation
const { ReviewSchema } = require("../validation/ReviewSchema");

//server side validation
const validateReview = (req, res, next) => {
  const { error } = ReviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

//add a review
router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const yodoger = await Yodoger.findById(req.params.userId);
    const review = await new Review(req.body.review);
    yodoger.reviews.push(review);
    await yodoger.save();
    await review.save();
    req.flash("success", "Successfully added a review");
    res.redirect(`/yodogers/${yodoger._id}`);
  })
);
//delete a review
router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { userId, reviewId } = req.params;
    await Yodoger.findByIdAndUpdate(userId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted a review");
    res.redirect(`/yodogers/${userId}`);
  })
);

module.exports = router;
