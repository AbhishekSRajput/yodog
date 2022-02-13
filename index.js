const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//error handlers
const ExpressError = require("./utils/ExpressError");
//routes
const yodogersRoute = require("./routes/yodogersRoute");
const reviewsRoute = require("./routes/reviewsRoute");
//express session
const session = require("express-session");
//flash
const flash = require("connect-flash");
//connect to mongo store
mongoose
  .connect("mongodb://localhost:27017/yodog")
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("Error, MONGO CONNECTION!!!!");
    console.log(err);
  });
//initialized express app
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
//serve static files
app.use(express.static(path.join(__dirname, "public")));
//session
const sessionConfig = {
  secret: "thisshouldbeasecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
//flash
app.use(flash());
//flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//route handlers
//home page
app.get("/", (req, res) => {
  res.render("home");
});
//express router
//yodogers
app.use("/yodogers", yodogersRoute);
//reviews
app.use("/yodogers/:userId/reviews", reviewsRoute);

//404 page RESPONSE HANDLER
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
