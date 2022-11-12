import Joi from "joi";

const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

const userSchema = Joi.object({
  name: Joi.string().required(),
});

validateUser = validator(userSchema);
exports validateUser;

const messageSchema = Joi.object({
  to: Joi.string().required(),
  text: Joi.string().required(),
  type: Joi.any().valid("message", "private_message"),
});

exports function validateMessage = validator(messageSchema);
