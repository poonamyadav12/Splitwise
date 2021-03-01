import Joi from 'joi';
const passwordComplexity = require("joi-password-complexity");

export const RegistrationStatus = Object.freeze({
    INVITED: "INVITED",
    JOINED: "JOINED",
});

export const userschema = Joi.object().keys(
    {
        password: passwordComplexity().required(),
        first_name: Joi.string().alphanum().min(3).max(50).required(),
        last_name: Joi.string().alphanum().min(3).max(50).optional(),
        picture: Joi.string().uri().optional(),
        email: Joi.string().email().required(),
        id: Joi.ref('email'),
        country_code: Joi.string().max(5),
        default_currency: Joi.string().min(3).max(3).required(),
        registration_status: Joi.string().default(RegistrationStatus.JOINED)
    }
);

export const invitedUserSchema = Joi.object().keys(
    {
        first_name: Joi.string().alphanum().min(3).max(50).required(),
        last_name: Joi.string().alphanum().min(3).max(50).optional(),
        picture: Joi.string().uri().optional(),
        email: Joi.string().email().required(),
        registration_status: Joi.string().default(RegistrationStatus.INVITED)
    }
);
