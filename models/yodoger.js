const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//review model
const Review = require("./review");

const YoDogersSchema = new Schema({
  title: String,
  description: String,
  location: String,
  price: Number,
  image: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

YoDogersSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Yodoger", YoDogersSchema);
