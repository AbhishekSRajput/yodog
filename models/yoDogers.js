const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const YoDogersSchema = new Schema({
  title: String,
  description: String,
  location: String,
  price: String,
});

module.exports = mongoose.model("Yodogers", YoDogersSchema);
