const express = require("express");
const router = express.Router();
//models
const Yodoger = require("../models/yodoger");
//error handlers
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
//validation
const { YodogerSchema } = require("../validation/YodogerSchema");
//error handlers

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

//all yodogers
router.get(
  "/",
  catchAsync(async (req, res) => {
    const yodogers = await Yodoger.find({});
    res.render("yodogers/index", { yodogers });
  })
);

//get to add Yodoger page
router.get("/new", (req, res) => {
  res.render("yodogers/new");
});

//add a Yodoger
router.post(
  "/",
  validateYodogers,
  catchAsync(async (req, res) => {
    const yodoger = new Yodoger(req.body.yodoger);
    await yodoger.save();
    req.flash("success", "successfully updated the yodoger");
    res.redirect(`/yodogers/${yodoger._id}`);
  })
);

//Yodoger details
router.get(
  "/:userId",
  catchAsync(async (req, res) => {
    const id = req.params.userId;
    const singleYodoger = await Yodoger.findById(id).populate("reviews");
    if (!singleYodoger) {
      req.flash("error", "The Yodoger does not exist");
      return res.redirect("/yodogers");
    }
    res.render("yodogers/details", { singleYodoger });
  })
);

//edit Yodoger
router.get(
  "/:userId/edit",
  catchAsync(async (req, res) => {
    const id = req.params.userId;
    const singleYodoger = await Yodoger.findById(id);
    if (!singleYodoger) {
      req.flash("error", "The Yodoger does not exist");
      res.redirect("/yodogers");
    }
    res.render("yodogers/edit", { singleYodoger });
  })
);

//update Yodoger
router.put(
  "/:userId",
  validateYodogers,
  catchAsync(async (req, res) => {
    const id = req.params.userId;
    const receivedYodogerObject = req.body.yodoger;
    const updatedYodoger = await Yodoger.findByIdAndUpdate(
      id,
      receivedYodogerObject
    );
    req.flash("success", "Successfully updated Yodoger");
    res.redirect(`/yodogers/${updatedYodoger._id}`);
  })
);

//delete Yodoger
router.delete(
  "/:userId",
  catchAsync(async (req, res) => {
    const id = req.params.userId;
    await Yodoger.findByIdAndDelete(id);
    req.flash("success", "Successfully delete Yodoger ");
    res.redirect("/yodogers");
  })
);

module.exports = router;
