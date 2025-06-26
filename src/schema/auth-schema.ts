import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  password: Joi.string().min(5).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 5 characters long",
  }),
});

export const signupSchema = Joi.object({
  fullName: Joi.string().required().messages({
    "string.empty": "First name is required",
  }),
  role: Joi.string().valid("ADMIN", "DOCTOR", "STAFF").required().messages({
    "any.only": "Role must be one of ADMIN, DOCTOR, or STAFF",
    "string.empty": "Role is required",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  password: Joi.string().min(5).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 5 characters long",
  }),
});
