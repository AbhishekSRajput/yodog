const Joi = require("joi");

module.exports.YodogerSchema = Joi.object({
  yodoger: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
});
