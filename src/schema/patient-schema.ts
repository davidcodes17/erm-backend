import Joi from "joi";

export const patientSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  gender: Joi.string().valid("Male", "Female", "Other").required(),
  phoneNumber: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  bloodType: Joi.string().required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  emergencyContacts: Joi.array()
    .items(
      Joi.object({
        fullName: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        email: Joi.string().email().required(),
        relationship: Joi.string().required(),
      })
    )
    .optional(),
  physicalInfo: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        diagnosis: Joi.string().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
        notes: Joi.string().optional(),
      })
    )
    .optional(),
});
